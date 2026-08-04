import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { AccessToken } from "livekit-server-sdk";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Carelink Healthineers API" });
  });

  // LiveKit Token Minting Endpoint
  app.all("/api/livekit/token", async (req, res) => {
    try {
      const room = (req.query.room || req.body?.room || "Clinical-Suite-Alpha") as string;
      const username = (req.query.username || req.body?.username || `Clinician_${Math.floor(Math.random() * 8999 + 1000)}`) as string;
      const identity = (req.query.identity || req.body?.identity || username) as string;

      const apiKey = process.env.LIVEKIT_API_KEY || "APIPbw6RFXjhgF5";
      const apiSecret = process.env.LIVEKIT_API_SECRET || "xcC6lyscS1sCC7X8pqwhO2EPOB1042eAGzEXfQ9jr6G";
      const livekitUrl = process.env.LIVEKIT_URL || process.env.VITE_LIVEKIT_URL || "wss://carelink-healthineers-bm6n32il.livekit.cloud";

      if (!apiKey || !apiSecret) {
        return res.status(500).json({ error: "LiveKit API credentials missing on server" });
      }

      const at = new AccessToken(apiKey, apiSecret, {
        identity: identity,
        name: username,
        ttl: "2h",
      });

      at.addGrant({
        roomJoin: true,
        room: room,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });

      const token = await at.toJwt();
      return res.json({ token, wsUrl: livekitUrl, room, identity, username });
    } catch (err: any) {
      console.error("Error generating LiveKit token:", err);
      return res.status(500).json({ error: err.message || "Failed to generate LiveKit token" });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Carelink Healthineers Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
