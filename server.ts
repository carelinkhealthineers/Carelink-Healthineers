import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://vrtipkxoldcqhtvznpok.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable__BiZqCP30kjQFrOs1K55Qw_EJoph6Zq";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const VAPID_SETTINGS_KEY = "web_push_vapid_keys";
const PUSH_SUBSCRIPTIONS_KEY = "web_push_subscriptions";

interface StoredSubscriptionRecord {
  endpoint: string;
  subscription: webpush.PushSubscription;
  viewerRole: "admin" | "executive" | "employee";
  viewerId: string;
  employeeId?: string;
  updatedAt: string;
}

let cachedVapidKeys: { publicKey: string; privateKey: string } | null = null;

async function ensureVapidKeys(): Promise<{ publicKey: string; privateKey: string }> {
  if (cachedVapidKeys) return cachedVapidKeys;

  const envPub = process.env.VAPID_PUBLIC_KEY;
  const envPriv = process.env.VAPID_PRIVATE_KEY;
  if (envPub && envPriv) {
    cachedVapidKeys = { publicKey: envPub, privateKey: envPriv };
    webpush.setVapidDetails("mailto:carelinkhealthineers@gmail.com", envPub, envPriv);
    return cachedVapidKeys;
  }

  try {
    const { data } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", VAPID_SETTINGS_KEY)
      .maybeSingle();

    if (data?.value) {
      const parsed = JSON.parse(data.value);
      if (parsed?.publicKey && parsed?.privateKey) {
        cachedVapidKeys = { publicKey: parsed.publicKey, privateKey: parsed.privateKey };
        webpush.setVapidDetails(
          "mailto:carelinkhealthineers@gmail.com",
          parsed.publicKey,
          parsed.privateKey
        );
        return cachedVapidKeys;
      }
    }
  } catch (err) {
    console.warn("VAPID lookup fallback:", err);
  }

  const generated = webpush.generateVAPIDKeys();
  cachedVapidKeys = generated;
  webpush.setVapidDetails(
    "mailto:carelinkhealthineers@gmail.com",
    generated.publicKey,
    generated.privateKey
  );

  try {
    await supabaseAdmin.from("settings").upsert(
      {
        key: VAPID_SETTINGS_KEY,
        value: JSON.stringify(generated),
        category: "notifications",
        description: "Carelink Web Push VAPID Keypair",
      },
      { onConflict: "key" }
    );
  } catch (err) {
    console.warn("Failed saving generated VAPID keys:", err);
  }

  return generated;
}

async function fetchStoredSubscriptions(): Promise<StoredSubscriptionRecord[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", PUSH_SUBSCRIPTIONS_KEY)
      .maybeSingle();

    if (error || !data?.value) return [];
    const parsed = JSON.parse(data.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveStoredSubscriptions(list: StoredSubscriptionRecord[]): Promise<void> {
  const { error } = await supabaseAdmin.from("settings").upsert(
    {
      key: PUSH_SUBSCRIPTIONS_KEY,
      value: JSON.stringify(list.slice(0, 200)),
      category: "notifications",
      description: "Carelink Phone & Desktop Web Push Subscriptions",
    },
    { onConflict: "key" }
  );
  if (error) {
    console.warn("Failed saving push subscriptions:", error.message);
  }
}

function matchesPushTarget(
  sub: StoredSubscriptionRecord,
  audiences: string[],
  targetEmployeeId?: string
): boolean {
  if (sub.viewerRole === "employee") {
    if (targetEmployeeId) {
      return sub.employeeId === targetEmployeeId;
    }
    return audiences.includes("employee") || audiences.includes("all");
  }
  if (sub.viewerRole === "admin") {
    return audiences.includes("admin") || audiences.includes("all");
  }
  if (sub.viewerRole === "executive") {
    return audiences.includes("executive") || audiences.includes("all");
  }
  return false;
}

function getTargetUrlForRole(role: StoredSubscriptionRecord["viewerRole"], linkTab?: string): string {
  if (role === "employee") return "/employee-portal";
  if (role === "executive") return "/executive";
  if (linkTab === "inquiries") return "/command-nexus/inquiries";
  if (linkTab === "tada" || linkTab === "reports" || linkTab === "duties" || linkTab === "requests") {
    return `/command-nexus/employees?tab=${linkTab}`;
  }
  return "/command-nexus";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));
  app.use("/src/assets", express.static(path.join(process.cwd(), "src/assets")));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Carelink Healthineers API" });
  });

  // Web Push: Public VAPID Key
  app.get("/api/push/vapid-public-key", async (_req, res) => {
    try {
      const keys = await ensureVapidKeys();
      res.json({ publicKey: keys.publicKey });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Failed to initialize push keys" });
    }
  });

  // Web Push: Save device push subscription
  app.post("/api/push/subscribe", async (req, res) => {
    try {
      const { subscription, viewerRole, viewerId, employeeId } = req.body || {};
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return res.status(400).json({ error: "Invalid Web Push subscription payload" });
      }

      const existing = await fetchStoredSubscriptions();
      const record: StoredSubscriptionRecord = {
        endpoint: subscription.endpoint,
        subscription,
        viewerRole: viewerRole || "employee",
        viewerId: viewerId || subscription.endpoint,
        employeeId,
        updatedAt: new Date().toISOString(),
      };

      const filtered = existing.filter((s) => s.endpoint !== subscription.endpoint);
      await saveStoredSubscriptions([record, ...filtered]);
      res.json({ ok: true, subscribedCount: filtered.length + 1 });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Failed to store push subscription" });
    }
  });

  // Web Push: Unsubscribe device
  app.post("/api/push/unsubscribe", async (req, res) => {
    try {
      const { endpoint } = req.body || {};
      if (!endpoint) return res.json({ ok: true });
      const existing = await fetchStoredSubscriptions();
      const filtered = existing.filter((s) => s.endpoint !== endpoint);
      await saveStoredSubscriptions(filtered);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Failed to remove subscription" });
    }
  });

  // Web Push: Dispatch encrypted push payload to matching subscribed phones/browsers
  app.post("/api/push/send", async (req, res) => {
    try {
      await ensureVapidKeys();
      const {
        title,
        message,
        category,
        priority,
        audiences = ["all"],
        target_employee_id,
        link_tab,
        onlyViewerId,
      } = req.body || {};

      if (!title || !message) {
        return res.status(400).json({ error: "Missing title or message" });
      }

      const allSubs = await fetchStoredSubscriptions();
      const recipients = onlyViewerId
        ? allSubs.filter((s) => s.viewerId === onlyViewerId)
        : allSubs.filter((s) => matchesPushTarget(s, audiences, target_employee_id));

      if (recipients.length === 0) {
        return res.json({ ok: true, sent: 0, expiredCleaned: 0 });
      }

      const expiredEndpoints = new Set<string>();
      let sent = 0;

      await Promise.all(
        recipients.map(async (rec) => {
          const payload = JSON.stringify({
            title,
            body: message,
            category: category || "system",
            priority: priority || "normal",
            tag: `carelink-${category || "alert"}-${Date.now()}`,
            url: getTargetUrlForRole(rec.viewerRole, link_tab),
          });
          try {
            await webpush.sendNotification(rec.subscription, payload);
            sent += 1;
          } catch (err: any) {
            const status = err?.statusCode;
            if (status === 404 || status === 410) {
              expiredEndpoints.add(rec.endpoint);
            } else {
              console.warn("Web Push delivery notice:", status || err?.message);
            }
          }
        })
      );

      if (expiredEndpoints.size > 0) {
        const remaining = allSubs.filter((s) => !expiredEndpoints.has(s.endpoint));
        await saveStoredSubscriptions(remaining);
      }

      res.json({ ok: true, sent, expiredCleaned: expiredEndpoints.size });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Push dispatch error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Carelink Healthineers Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
