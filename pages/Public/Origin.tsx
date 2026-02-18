
import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ChevronRight, ShieldCheck, Zap, Globe, 
  ArrowDown, Award, Server, 
  Database, Microscope, Activity, Layers
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
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    
    // COMPACT SIZE (500px as requested)
    const size = 500; 
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // GEOMETRY
    const baseGeometry = new THREE.IcosahedronGeometry(3, 3);
    const edges = new THREE.EdgesGeometry(baseGeometry);
    
    // MATERIAL: DARK COBALT LATTICE (High Contrast)
    const lineMat = new THREE.LineBasicMaterial({ 
      color: 0x1e3a8a, // Midnight Cobalt
      transparent: true, 
      opacity: 0.9,    // Darker and more visible
      linewidth: 2 
    });
    const lineMesh = new THREE.LineSegments(edges, lineMat);
    scene.add(lineMesh);

    // NODES: ELECTRIC CYAN (High Visibility)
    const pointGeo = new THREE.IcosahedronGeometry(3, 3);
    const pointMat = new THREE.PointsMaterial({
      color: 0x00f2ff, 
      size: 0.14,      
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(pointGeo, pointMat);
    scene.add(points);

    // OUTER GLOW
    const glowMat = new THREE.PointsMaterial({
      color: 0x00f2ff, 
      size: 0.3,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const glowPoints = new THREE.Points(pointGeo, glowMat);
    scene.add(glowPoints);

    camera.position.z = 9;

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
      frame += 0.015;
      
      lineMesh.rotation.y += 0.001;
      points.rotation.y += 0.001;
      glowPoints.rotation.y += 0.001;
      
      const targetX = mouseRef.current.y * 0.12;
      const targetY = mouseRef.current.x * 0.12;
      lineMesh.rotation.x += (targetX - lineMesh.rotation.x) * 0.04;
      lineMesh.rotation.z += (targetY - lineMesh.rotation.z) * 0.04;
      points.rotation.x = lineMesh.rotation.x;
      points.rotation.z = lineMesh.rotation.z;
      glowPoints.rotation.x = lineMesh.rotation.x;
      glowPoints.rotation.z = lineMesh.rotation.z;

      // Pulse
      const pulse = Math.sin(frame) * 0.02 + 1.0;
      points.scale.set(pulse, pulse, pulse);
      glowPoints.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.1)_0%,transparent_70%)] pointer-events-none" />
      <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />
      <motion.div 
        animate={{ top: ['10%', '90%', '10%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 -translate-x-1/2 w-[300px] h-[1.5px] bg-cyan-500/50 blur-[4px] z-20 pointer-events-none"
      />
    </div>
  );
};

export const Origin: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.96]);

  return (
    <div className="pt-0">
      <SEO title="Origin" description="Carelink Healthineers: Global Clinical Sovereignty Matrix." />
      
      <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-50 border-b border-slate-200">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 neural-grid opacity-30" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/[0.04] blur-[200px] rounded-full" />
        </div>

        <div className="max-w-[1700px] mx-auto px-6 md:px-16 relative z-10 w-full">
          <motion.div style={{ opacity, scale }} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-12">
              <div className="flex items-center gap-6">
                 <div className="h-[1px] w-12 bg-blue-900/40" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">Registry_Status: Online</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl md:text-[5.5rem] font-black text-slate-900 leading-[0.95] tracking-[-0.07em]">
                  Clinical <br />
                  <span className="text-gradient-primary">Sovereignty.</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
                  The master registry for clinical assets. We engineer global supply chains into a unified, zero-latency acquisition matrix.
                </p>
              </div>

              <div className="flex flex-wrap gap-5">
                <Link to="/portfolio" className="px-10 py-5 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 group">
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

            <div className="relative hidden lg:flex items-center justify-center">
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="relative">
                  <NexusSphere />
                  <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-slate-200" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-slate-200" />
                  <div className="absolute top-10 right-10 flex flex-col items-end opacity-60">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sourcing_Sync</span>
                     <span className="text-[11px] font-black text-blue-600 tracking-tighter">99.8% VERIFIED</span>
                  </div>
               </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-300">
          <ArrowDown size={28} />
        </motion.div>
      </section>

      {/* GLOBAL MATRIX */}
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
                   <div key={i} className="flex items-center justify-between p-7 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-blue-400 transition-all">
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
                <motion.div key={i} whileHover={{ y: -8 }} className="group relative bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden">
                  <div className="scanner-line h-1 opacity-20" />
                  <div className="w-14 h-14 rounded-[1.5rem] bg-slate-50 text-slate-400 group-hover:bg-blue-700 group-hover:text-white flex items-center justify-center mb-8 transition-all shadow-sm">
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

      {/* FOOTER METRICS */}
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
