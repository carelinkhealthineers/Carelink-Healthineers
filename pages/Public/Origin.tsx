
import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  ChevronRight, ShieldCheck, Zap, Globe, 
  ArrowDown, Award, Server, 
  Database, Search, 
  Microscope, Activity, Box, Terminal,
  Radar, Scan, Layers, Settings, Fingerprint
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import * as THREE from 'three';

const NexusSphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true 
    });
    
    // REDUCED SIZE: Compact and Elegant focal point
    const size = 550; 
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // GEOMETRY - THE LATTICE (Refined Scale)
    const baseGeometry = new THREE.IcosahedronGeometry(3, 3);
    const edges = new THREE.EdgesGeometry(baseGeometry);
    
    // Wireframe Material (Deep Cobalt - High Contrast Visibility)
    const lineMat = new THREE.LineBasicMaterial({ 
      color: 0x1e3a8a, // Deep Navy/Cobalt
      transparent: true, 
      opacity: 0.8,
      linewidth: 2 
    });
    const lineMesh = new THREE.LineSegments(edges, lineMat);
    scene.add(lineMesh);

    // Primary Vertices (Electric Cyan - Sharp Nodes)
    const pointGeo = new THREE.IcosahedronGeometry(3, 3);
    const pointMat = new THREE.PointsMaterial({
      color: 0x06b6d4, // Sharp Cyan
      size: 0.12,      
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(pointGeo, pointMat);
    scene.add(points);

    // Glow Halo (Subtle glow for visibility)
    const haloMat = new THREE.PointsMaterial({
      color: 0x22d3ee, 
      size: 0.25,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const haloPoints = new THREE.Points(pointGeo, haloMat);
    scene.add(haloPoints);

    // Dark Core Shadow
    const coreGeo = new THREE.SphereGeometry(2.9, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a, 
      transparent: true,
      opacity: 0.05
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    camera.position.z = 8.5;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.02;
      
      lineMesh.rotation.y += 0.0012;
      points.rotation.y += 0.0012;
      haloPoints.rotation.y += 0.0012;
      
      const targetX = mouseRef.current.y * 0.15;
      const targetY = mouseRef.current.x * 0.15;
      lineMesh.rotation.x += (targetX - lineMesh.rotation.x) * 0.05;
      lineMesh.rotation.z += (targetY - lineMesh.rotation.z) * 0.05;
      points.rotation.x = lineMesh.rotation.x;
      points.rotation.z = lineMesh.rotation.z;
      haloPoints.rotation.x = lineMesh.rotation.x;
      haloPoints.rotation.z = lineMesh.rotation.z;

      // Pulse
      const pulse = Math.sin(frame * 0.8) * 0.02 + 1.0;
      points.scale.set(pulse, pulse, pulse);
      haloPoints.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-[550px] h-[550px] flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.08)_0%,transparent_70%)] pointer-events-none" />
      <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />
      
      {/* Scanner Line (Compact) */}
      <motion.div 
        animate={{ top: ['15%', '85%', '15%'] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-cyan-500/40 blur-[3px] z-20 pointer-events-none"
      />
    </div>
  );
};

export const Origin: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="pt-0">
      <SEO title="Origin" description="Carelink Healthineers: Global Clinical Sovereignty Matrix." />
      
      {/* 01: THE NEXUS COMMAND (COMPACT HERO) */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-50 border-b border-slate-200">
        
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 neural-grid opacity-30" />
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-900/[0.03] blur-[200px] rounded-full" />
        </div>

        <div className="max-w-[1700px] mx-auto px-6 md:px-16 relative z-10 w-full">
          <motion.div 
            style={{ opacity, scale }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left Narrative Hub */}
            <div className="space-y-12">
              <div className="flex items-center gap-6">
                 <div className="h-[1px] w-12 bg-blue-900/30" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">Nexus_Terminal_v5.1</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl md:text-[5.5rem] font-black text-slate-900 leading-[0.95] tracking-[-0.07em]">
                  Clinical <br />
                  <span className="text-gradient-primary">Sovereignty.</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
                  The primary registry for high-performance clinical hardware. We engineer global supply chains into a unified, zero-latency acquisition matrix.
                </p>
              </div>

              <div className="flex flex-wrap gap-5">
                <Link to="/portfolio" className="px-10 py-5 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-4 shadow-xl shadow-slate-900/10 group">
                  Repository <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/acquisition" className="px-10 py-5 rounded-2xl bg-white text-slate-900 font-black text-[11px] uppercase tracking-widest border border-slate-200 hover:border-blue-300 transition-all">
                  Initiate Sync
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-16 border-t border-slate-200 max-w-lg">
                {[
                  { label: "Assets Indexed", val: "1.2k+", icon: <Layers size={14} /> },
                  { label: "Global Nodes", val: "48", icon: <Globe size={14} /> },
                  { label: "Sync Speed", val: "12ms", icon: <Zap size={14} /> }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 text-blue-900 mb-1">
                       {item.icon}
                       <span className="text-xl font-black text-slate-900 tracking-tighter">{item.val}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: The Nexus World Sphere (COMPACT & DARKER) */}
            <div className="relative hidden lg:flex items-center justify-center">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className="relative"
               >
                  <NexusSphere />
                  
                  {/* Digital Frames */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-slate-200" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-slate-200" />

                  {/* Telemetry labels */}
                  <div className="absolute top-10 right-10 flex flex-col items-end">
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Registry_Sync</span>
                     <span className="text-[11px] font-black text-blue-600">99.8% VERIFIED</span>
                  </div>
               </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-300"
        >
          <ArrowDown size={28} />
        </motion.div>
      </section>

      {/* 02: GLOBAL MATRIX */}
      <section className="py-48 bg-white">
        <div className="max-w-[1700px] mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            
            <div className="lg:col-span-5">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.6em] mb-8 block">Protocol 01</span>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-10">
                The Global <br /> <span className="text-blue-600 text-gradient-primary">Clinical Matrix.</span>
              </h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed mb-16 max-w-lg">
                Eliminating procurement friction through a battle-tested network of global clinical sovereigns.
              </p>
              
              <div className="space-y-4">
                 {[
                   { label: "ISO 13485 Compliance", val: "STABLE" },
                   { label: "Global Distribution Nodes", val: "48 ACTIVE" },
                   { label: "Technical Dispatch Speed", val: "< 12ms" }
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between p-7 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-blue-400 transition-all duration-500">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">{stat.label}</span>
                      <span className="text-[10px] font-black uppercase text-blue-700">{stat.val}</span>
                   </div>
                 ))}
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Universal Sync", desc: "Real-time inventory mapping from global manufacturers.", icon: <Database size={24} /> },
                { title: "Compliance Audit", desc: "Every asset undergoes triple-point clinical verification.", icon: <ShieldCheck size={24} /> },
                { title: "Clinical Support", desc: "24/7 dedicated engineering for zero operational downtime.", icon: <Server size={24} /> },
                { title: "Neural Logistics", desc: "Sub-24h technical deployment to verified active sites.", icon: <Zap size={24} /> }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -8 }}
                  className="group relative bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all overflow-hidden"
                >
                  <div className="scanner-line h-1 opacity-20" />
                  <div className="w-14 h-14 rounded-[1.5rem] bg-slate-50 text-slate-400 group-hover:bg-blue-700 group-hover:text-white flex items-center justify-center mb-8 transition-all duration-500 shadow-sm">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 03: CLINICAL SECTORS */}
      <section className="py-48 bg-slate-50 border-y border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 neural-grid opacity-10" />
        <div className="max-w-[1700px] mx-auto px-6 md:px-16 relative z-10">
          <header className="flex flex-col md:flex-row items-end justify-between mb-24 gap-12">
            <div className="space-y-6">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] block">Domain Sovereignty</span>
               <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">Market <span className="text-blue-600 text-gradient-primary">Sectors.</span></h2>
            </div>
            <Link to="/divisions" className="px-10 py-4 rounded-[2rem] border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-700 hover:border-blue-700 transition-all bg-white shadow-sm">
              Explore All Divisions
            </Link>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: "Laboratory Intelligence", icon: <Microscope size={36} />, grad: "from-slate-950 via-slate-900 to-blue-950", desc: "High-throughput pathology ecosystems." },
              { name: "Radiology Core", icon: <Zap size={36} />, grad: "from-blue-700 via-blue-800 to-indigo-950", desc: "Advanced medical imaging architecture." },
              { name: "Surgical Matrix", icon: <Award size={36} />, grad: "from-indigo-950 via-slate-900 to-slate-950", desc: "Precision OT and surgical infrastructure." }
            ].map((div, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative h-[650px] rounded-[5.5rem] overflow-hidden group shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${div.grad} opacity-98 group-hover:opacity-100 transition-opacity duration-700`} />
                <div className="absolute inset-0 p-20 flex flex-col justify-end">
                   <div className="w-24 h-24 rounded-[2.5rem] bg-white/10 backdrop-blur-3xl flex items-center justify-center text-white mb-12 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                      {div.icon}
                   </div>
                   <h3 className="text-4xl font-black text-white mb-6 tracking-tighter leading-tight">{div.name}</h3>
                   <p className="text-white/60 text-lg font-medium max-w-sm">{div.desc}</p>
                   <div className="mt-12 pt-10 border-t border-white/10 flex items-center gap-4 text-[11px] font-black text-white/30 uppercase tracking-[0.4em]">
                     <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Sourcing_Registry: SYNCED
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 04: SYSTEM TELEMETRY */}
      <section className="py-24 bg-white font-mono">
        <div className="max-w-[1700px] mx-auto px-10 flex flex-wrap justify-center md:justify-between items-center gap-16 text-[11px] font-bold text-slate-400 uppercase tracking-[0.6em]">
          <div className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" /> ISO_13485_CERTIFIED</div>
          <div className="flex items-center gap-4"><Globe size={20} className="text-blue-600" /> GLOBAL_NODES: ONLINE</div>
          <div className="flex items-center gap-4"><Activity size={20} className="text-emerald-500" /> SYSTEM_HEALTH: OPTIMAL</div>
          <div className="flex items-center gap-4"><Database size={20} className="text-indigo-600" /> REGISTRY_SYNC: ACTIVE</div>
        </div>
      </section>
    </div>
  );
};
