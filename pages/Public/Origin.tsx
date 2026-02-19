
import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import * as THREE from 'three';
import { 
  ShieldCheck, Zap, Globe, 
  ArrowUpRight, 
  Terminal, HeartPulse, Scan,
  Hexagon, ArrowRight, Database,
  Headphones, Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { supabase } from '../../supabaseClient';
import { Product, Blog } from '../../types';

const ClinicalNeuralMatrix: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Optimized Inner Core (High Emissivity, Low Poly)
    const essenceGeom = new THREE.IcosahedronGeometry(1.6, 1);
    const essenceMat = new THREE.MeshPhongMaterial({
      color: 0x00d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const essence = new THREE.Mesh(essenceGeom, essenceMat);
    group.add(essence);

    // Ultra-Fast Particle System
    const particlesCount = 120; // Lowered for stability
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    const particlesGeom = new THREE.BufferGeometry();
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const nodes = new THREE.Points(particlesGeom, particlesMat);
    group.add(nodes);

    // Pre-calculated Static Connections
    const linePositions = [];
    for (let i = 0; i < particlesCount; i++) {
      for (let j = i + 1; j < particlesCount; j++) {
        const dx = posArray[i * 3] - posArray[j * 3];
        const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
        const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 2.5) {
          linePositions.push(posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]);
          linePositions.push(posArray[j * 3], posArray[j * 3 + 1], posArray[j * 3 + 2]);
        }
      }
    }
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({ 
      color: 0x00d4ff, 
      transparent: true, 
      opacity: 0.1,
      blending: THREE.AdditiveBlending 
    });
    const lineMesh = new THREE.LineSegments(lineGeom, lineMat);
    group.add(lineMesh);

    const light = new THREE.PointLight(0x00d4ff, 8, 25);
    light.position.set(2, 2, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    camera.position.z = 8;

    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Constant smooth rotation - NO hover dependency
      group.rotation.y += 0.001;
      group.rotation.x += 0.0003;
      
      // Very dampened parallax for depth without lag
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.01;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.01;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

const GhostButton: React.FC<{ to: string; label: string; subLabel: string; icon: React.ReactNode; side: 'left' | 'right' }> = ({ to, label, subLabel, icon, side }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-40, 40], [5, -5]), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-40, 40], [-5, 5]), { stiffness: 100, damping: 20 });

  return (
    <motion.div 
      initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 1.2 }}
      style={{ perspective: 1000 }}
    >
      <Link
        to={to}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - (rect.left + rect.width / 2));
          y.set(e.clientY - (rect.top + rect.height / 2));
        }}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        className="relative block group"
      >
        <motion.div
          style={{ rotateX, rotateY }}
          className="relative px-7 py-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl transition-all duration-300 hover:border-blue-500/50 hover:bg-white/[0.07] flex flex-col items-center gap-1"
        >
          <span className="text-[6px] font-black text-white/30 uppercase tracking-[1.2em] mb-1 group-hover:text-blue-400 transition-colors">
            {subLabel}
          </span>
          <div className="flex items-center gap-4">
             <span className="text-[9px] font-black text-white/80 uppercase tracking-[0.4em] group-hover:text-white transition-all">
                {label}
             </span>
             <div className="text-white/20 group-hover:text-blue-400 transition-colors scale-90 group-hover:scale-100 transition-all">
               {icon}
             </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export const Origin: React.FC = () => {
  const [hpAssets, setHpAssets] = useState({
    hardware: 'https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/Extron%207_921_5e39e.png',
    device: 'https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/931_a8698%20(2).png',
    software: 'https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/6.Software-03_8675f.png'
  });

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const loadHomepageData = async () => {
      const { data: settingsData } = await supabase.from('settings').select('key, value').eq('category', 'homepage_assets');
      if (settingsData) {
        const assets = { ...hpAssets };
        settingsData.forEach(item => {
          if (item.key === 'hp_asset_hardware') assets.hardware = item.value;
          if (item.key === 'hp_asset_device') assets.device = item.value;
          if (item.key === 'hp_asset_software') assets.software = item.value;
        });
        setHpAssets(assets);
      }

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_published', true)
        .limit(6)
        .order('created_at', { ascending: false });
      if (productsData) setFeaturedProducts(productsData);

      const { data: blogsData } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .limit(3)
        .order('published_at', { ascending: false });
      if (blogsData) setLatestBlogs(blogsData);
    };

    loadHomepageData();
  }, []);

  return (
    <div className="pt-0 bg-[#020408]">
      <SEO title="Home" description="Carelink Healthineers: Global Clinical Infrastructure." />
      
      {/* 1. CINEMATIC NEURAL VOID */}
      <section className="relative h-screen min-h-[600px] flex flex-col items-center justify-center overflow-hidden bg-[#020408]">
        {/* Optimized Static-Motion 3D Background */}
        <div className="absolute inset-0 z-10">
          <ClinicalNeuralMatrix />
        </div>

        {/* HUD - TOP telemetry */}
        <div className="absolute top-24 left-0 right-0 z-20 pointer-events-none flex justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
             <div className="px-5 py-1.5 rounded-full border border-white/5 text-[5px] font-black text-white/50 uppercase tracking-[2em]">
                NEURAL_STABILITY_LOCKED
             </div>
             <div className="h-6 w-[1px] bg-gradient-to-b from-blue-500/40 to-transparent" />
          </motion.div>
        </div>

        {/* BILATERAL INTERFACE (Left/Right Buttons) */}
        <div className="w-full max-w-[1500px] px-8 md:px-16 flex items-center justify-between z-30 pointer-events-none">
          <div className="pointer-events-auto">
            <GhostButton 
              to="/portfolio" 
              label="Access Matrix" 
              subLabel="PORTAL_EXPLORER"
              icon={<ArrowUpRight size={12} />} 
              side="left"
            />
          </div>

          <div className="pointer-events-auto">
            <GhostButton 
              to="/acquisition" 
              label="Initiate RFQ" 
              subLabel="SOURCING_COMMENCE"
              icon={<Scan size={12} />} 
              side="right"
            />
          </div>
        </div>

        {/* LOWERED & SHARPENED HEADLINE */}
        <div className="absolute bottom-20 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1.2, delay: 0.6 }}
             className="text-center"
           >
              <h1 className="text-[12px] md:text-[14px] font-black text-white/70 uppercase tracking-[2.8em] mb-3 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                 Sovereign Clinical Infrastructure
              </h1>
              <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent mx-auto" />
           </motion.div>
        </div>

        {/* HUD - BOTTOM telemetry */}
        <div className="absolute bottom-10 left-0 right-0 z-20 pointer-events-none flex justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center"
          >
             <div className="h-6 w-[1px] bg-gradient-to-t from-white/10 to-transparent mb-3" />
             <span className="text-[5px] font-black uppercase tracking-[3.5em] text-white/30 italic">Architecting Clinical DNA</span>
          </motion.div>
        </div>
      </section>

      {/* 2. INFRASTRUCTURE SHOWCASE */}
      <section className="py-20 bg-[#020408] relative border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 space-y-12">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-10">
            <div className="space-y-2">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.5em] block">High_Density_Assets</span>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none italic">Infrastructure <span className="text-slate-700 not-italic">Showcase.</span></h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[500px]">
            <motion.div whileHover={{ scale: 1.01 }} className="lg:col-span-8 relative group rounded-[3rem] overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-3xl">
              <img src={hpAssets.hardware} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" />
            </motion.div>
            <div className="lg:col-span-4 grid grid-rows-2 gap-6">
              <motion.div whileHover={{ scale: 1.01 }} className="relative group rounded-[2.5rem] overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-xl">
                <img src={hpAssets.device} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-1000" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }} className="relative group rounded-[2.5rem] overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-xl">
                <img src={hpAssets.software} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-1000" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE GLOBAL CLINICAL MATRIX (PROTOCOL 01) */}
      <section className="py-48 bg-[#020408] border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
           <div className="space-y-16">
              <div className="space-y-6">
                 <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.6em] block">PROTOCOL 01</span>
                 <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[1] mb-8">
                    The Global <br /> <span className="text-blue-500">Clinical Matrix.</span>
                 </h2>
                 <p className="text-gray-500 text-[10px] font-medium leading-relaxed max-w-sm mt-8 uppercase tracking-widest">
                    Eliminating procurement friction through a battle-tested network of global clinical sovereigns.
                 </p>
              </div>

              <div className="space-y-2 pt-4">
                 {[
                   { label: "ISO 13485 COMPLIANCE", val: "STABLE" },
                   { label: "GLOBAL DISTRIBUTION NODES", val: "48 ACTIVE" },
                   { label: "TECHNICAL DISPATCH SPEED", val: "< 12MS" }
                 ].map((stat, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0 }} 
                     whileInView={{ opacity: 1 }} 
                     viewport={{ once: true }}
                     className="flex items-center justify-between px-8 py-4 bg-white/[0.02] rounded-full border border-white/[0.03] group hover:border-blue-500/10 transition-all"
                   >
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">{stat.label}</span>
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{stat.val}</span>
                   </motion.div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { title: "Universal Sync", desc: "Real-time inventory mapping from global manufacturers.", icon: <Database size={18} />, active: true },
                { title: "Compliance Audit", desc: "Every asset undergoes triple-point clinical verification.", icon: <ShieldCheck size={18} /> },
                { title: "Clinical Support", desc: "24/7 dedicated engineering for zero operational downtime.", icon: <Headphones size={18} /> },
                { title: "Neural Logistics", desc: "Sub-24h technical deployment to verified active sites.", icon: <Zap size={18} /> }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="relative group bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5 flex flex-col justify-between h-[190px] transition-all hover:border-blue-500/20 overflow-hidden"
                >
                  {item.active && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 scanner-line" />
                  )}
                  
                  <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-blue-500/40 group-hover:text-blue-500 transition-colors">
                    {item.icon}
                  </div>
                  
                  <div>
                    <h3 className="text-[16px] font-black text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">{item.title}</h3>
                    <p className="text-slate-500 text-[9px] font-medium leading-relaxed max-w-[160px] uppercase tracking-tighter opacity-70">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. THE ASSET MATRIX */}
      <section className="py-24 bg-[#020408] border-t border-white/5 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 relative z-10">
           <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-16">
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <Hexagon className="text-blue-500/40" size={12} />
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.6em]">Registry_Nodes</span>
                 </div>
                 <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none flex items-center gap-4">
                    <span>The Asset</span>
                    <span className="px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-lg font-black italic">Matrix.</span>
                 </h2>
              </div>
              <div className="max-w-xs text-right">
                 <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed mb-6">Curated clinical assets verified for sovereignty.</p>
                 <Link to="/portfolio" className="group inline-flex items-center gap-3 text-[8px] font-black text-white uppercase tracking-[0.4em] hover:text-[#00d4ff] transition-all">
                    Archive Access <ArrowUpRight size={12} />
                 </Link>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, i) => (
                <motion.div key={product.id} className="group relative h-[400px] rounded-[2.5rem] bg-white/[0.01] border border-white/5 overflow-hidden hover:border-[#00d4ff]/20 transition-all duration-700">
                  <div className="absolute inset-0 p-3">
                    <div className="w-full h-full rounded-[2rem] overflow-hidden relative bg-black/40">
                      <img src={product.main_image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000 grayscale group-hover:grayscale-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                    </div>
                  </div>
                  <div className="absolute bottom-10 left-10 right-10 z-10">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="px-2 py-1 rounded bg-blue-600/10 text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">{product.model_number}</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-1 tracking-tight group-hover:text-[#00d4ff] transition-colors leading-none">{product.name}</h3>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mb-6">{product.category_tag}</p>
                    <Link to={`/portfolio/${product.slug}`} className="inline-flex items-center gap-3 py-2 px-6 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-white uppercase tracking-[0.3em] group-hover:bg-white group-hover:text-black transition-all">
                       Dossier <Scan size={10} />
                    </Link>
                  </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 5. INTELLIGENCE BRIEFINGS */}
      <section className="py-24 bg-[#020408] border-t border-white/5 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-16">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.8em]">Editorial_Stream</span>
               </div>
               <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">Intelligence <br /><span className="text-[#00d4ff] italic">Briefings.</span></h2>
            </div>
            <Link to="/insights" className="text-[8px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1 hover:text-white transition-all flex items-center gap-3">
              ACCESS ALL INTEL <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestBlogs.map((blog, i) => (
              <motion.div key={blog.id} className="group relative bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 hover:border-blue-500/20 transition-all duration-700">
                <div className="aspect-video rounded-[1.8rem] overflow-hidden mb-6 bg-black relative">
                   <img src={blog.featured_image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" />
                </div>
                <div className="space-y-4">
                   <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                     <Terminal size={8} /> INTEL_NODE_{blog.id.substring(0,4).toUpperCase()}
                   </div>
                   <h3 className="text-lg font-black text-white tracking-tight group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">{blog.title}</h3>
                   <p className="text-[9px] text-slate-500 font-medium leading-relaxed line-clamp-2 italic">{blog.excerpt}</p>
                   <Link to={`/insights/${blog.slug}`} className="inline-flex items-center gap-2 text-[8px] font-black text-white uppercase tracking-widest pt-2">
                     DECODE <ArrowRight size={10} className="text-blue-500" />
                   </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HEARTBEAT BAR */}
      <section className="py-16 bg-[#020408] border-t border-white/5 font-mono">
        <div className="max-w-[1600px] mx-auto px-10 flex flex-wrap justify-center md:justify-between items-center gap-12 text-[8px] font-bold text-slate-700 uppercase tracking-[0.5em]">
          <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ISO_13485: SECURE</div>
          <div className="flex items-center gap-3"><Globe size={10} className="text-blue-600" /> DHAKA_HUB: CONNECTED</div>
          <div className="flex items-center gap-3"><HeartPulse size={10} className="text-emerald-500 animate-pulse" /> VITAL: OPTIMAL</div>
          <div className="flex items-center gap-3"><Database size={10} className="text-indigo-600" /> REGISTRY: SYNCED</div>
        </div>
      </section>
    </div>
  );
};
