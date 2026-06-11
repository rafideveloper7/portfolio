// frontend/src/app/page.js
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiSend, FiChevronLeft, FiDownload, FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX, FiPicture, FiMail, FiMonitor, FiTrash2, FiEdit2, FiPlus, FiX, FiImage as FiImageIcon, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import Gallery from '../components/Gallery';
import MusicPlayer from '../components/MusicPlayer';

const API = process.env.NEXT_PUBLIC_API_URL;
const FORMSUBMIT = 'https://formsubmit.co/ajax/rafideveloper7@gmail.com';

const GRADIENT_MAP = {
  'gradient-default': 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900',
  'gradient-purple':  'bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900',
  'gradient-green':   'bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900',
  'gradient-red':     'bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900',
  'gradient-dark':    'bg-gradient-to-br from-gray-950 to-gray-900',
  'gradient-ocean':   'bg-gradient-to-br from-gray-900 via-cyan-900/25 to-gray-900',
  'gradient-sunset':  'bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900',
  'gradient-galaxy':  'bg-gradient-to-br from-indigo-950 via-purple-900/40 to-gray-950',
};

const apps = [
  { id: 'about',    label: 'About Me',  icon: '👤', color: 'from-blue-600 to-blue-800',    width: 480, height: 450 },
  { id: 'projects', label: 'Projects',  icon: '💼', color: 'from-green-600 to-green-800',  width: 550, height: 500 },
  { id: 'skills',   label: 'Skills',    icon: '⚡', color: 'from-yellow-500 to-orange-600', width: 500, height: 480 },
  { id: 'terminal', label: 'Terminal',  icon: '💻', color: 'from-gray-600 to-gray-800',    width: 550, height: 400 },
  { id: 'contact',  label: 'Contact',   icon: '📬', color: 'from-red-500 to-pink-700',     width: 450, height: 500 },
  { id: 'gallery',  label: 'Gallery',   icon: '🖼️', color: 'from-purple-600 to-purple-800', width: 560, height: 460 },
  { id: 'music',    label: 'Music',     icon: '🎵', color: 'from-pink-600 to-rose-700',    width: 520, height: 480 },
  { id: 'cv',       label: 'CV',        icon: '📄', color: 'from-indigo-600 to-indigo-800', width: 600, height: 650 },
];

const statusMessages = [
  '👋 Welcome! I\'m Rafi Ullah — a Full Stack Developer.',
  '🚀 I build beautiful, functional, scalable apps.',
  '☁️ Full Stack: MERN, Next.js, Node.js, Express, MongoDB.',
  '⚡ Passionate about clean code & modern UI/UX design.',
  '🎨 Designer-level aesthetics with developer precision.',
  '💡 Let\'s build something amazing together!',
];

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [windows, setWindows] = useState({});
  const [bio, setBio] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [cvs, setCvs] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [zIndex, setZIndex] = useState(10);
  const [time, setTime] = useState('');
  const [wallpaper, setWallpaper] = useState({ type: 'gradient', value: '' });
  const [mobileWallpaper, setMobileWallpaper] = useState({ type: 'gradient', value: '' });
  const [isMobile, setIsMobile] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  const [statusMsg, setStatusMsg] = useState(statusMessages[0]);
  const [stats, setStats] = useState({ projects: 0, hours: 2400, clients: 12, experience: 4 });
  const dragRef = useRef(null);

  const API_BASE = API || 'http://localhost:5000';

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    fetchData(); createStars(); updateClock(); cycleStatus();
    const t = setInterval(updateClock, 1000);
    return () => { clearInterval(t); window.removeEventListener('resize', check); };
  }, []);

  const cycleStatus = () => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % statusMessages.length;
      setStatusMsg(statusMessages[idx]);
    }, 5000);
    return () => clearInterval(interval);
  };

  const updateClock = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const fetchData = async () => {
    try {
      const [bioRes, projRes, skillRes, settRes, cvRes] = await Promise.all([
        axios.get(`${API_BASE}/api/bio`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/api/projects`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/skills`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/settings`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/api/cv/list`).catch(() => ({ data: [] })),
      ]);
      setBio(bioRes.data || { name: 'Rafi Ullah', title: 'Full Stack Developer', location: 'Kohat, Pakistan', email: 'rafideveloper7@gmail.com' });
      setProjects(projRes.data || []);
      setSkills(skillRes.data || []);
      setStats(s => ({ ...s, projects: (projRes.data || []).length, experience: bioRes.data?.experience || 4 }));
      setCvs(cvRes.data || []);
      if (settRes.data) {
        setWallpaper({ type: settRes.data.wallpaperType || 'gradient', value: settRes.data.wallpaperValue || '' });
        setMobileWallpaper({ type: settRes.data.mobileWallpaperType || 'gradient', value: settRes.data.mobileWallpaperValue || '' });
      }
    } catch (e) { console.error(e); }
  };

  const createStars = () => {
    const c = document.getElementById('stars');
    if (!c) return;
    c.innerHTML = '';
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = prefersReduced ? 30 : 80;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = prefersReduced ? 1 : (Math.random() * 2.5 + 1);
      s.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:white;border-radius:50%;left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:${Math.random()*0.4+0.15};animation:twinkle ${Math.random()*4+2}s infinite alternate;animation-delay:${Math.random()*4}s;`;
      c.appendChild(s);
    }
  };

  const getBgStyle = (wp) => {
    if (wp.type === 'image' && wp.value) return { backgroundImage: `url(${wp.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    if (wp.type === 'color' && wp.value) return { background: wp.value };
    return {};
  };

  const getBgClass = (wp) => wp.type === 'gradient' ? (GRADIENT_MAP[wp.value] || GRADIENT_MAP['gradient-default']) : '';

  // ── Desktop window management ────────────────────────────────────
  const openWindow = (id, title, width, height) => {
    const newZ = zIndex + 1; setZIndex(newZ);
    if (windows[id]?.visible) { setWindows(p => ({ ...p, [id]: { ...p[id], zIndex: newZ } })); return; }
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = Math.min(width || 500, vw - 16), h = Math.min(height || 400, vh - 80);
    setWindows(p => ({ ...p, [id]: { id, title, visible: true, zIndex: newZ, x: Math.max(8, (vw-w)/2|0), y: Math.max(36, (vh-h)/3|0), width: w, height: h } }));
  };
  const closeWindow = (id) => setWindows(p => ({ ...p, [id]: { ...p[id], visible: false } }));
  const focusWindow = (id) => { const z = zIndex+1; setZIndex(z); setWindows(p => ({ ...p, [id]: { ...p[id], zIndex: z } })); };

  const startDrag = useCallback((cx, cy, id) => {
    setWindows(prev => {
      const win = prev[id]; if (!win) return prev;
      dragRef.current = { id, startX: cx, startY: cy, origX: win.x, origY: win.y, winW: win.width, winH: win.height };
      return { ...prev, [id]: { ...win, zIndex: zIndex + 1 } };
    });
    setZIndex(z => z + 1);
    const move = (x, y) => {
      if (!dragRef.current) return;
      const { id: wid, startX, startY, origX, origY, winW, winH } = dragRef.current;
      setWindows(p => { if (!p[wid]) return p; return { ...p, [wid]: { ...p[wid], x: Math.max(0, Math.min(window.innerWidth-winW, origX+x-startX)), y: Math.max(32, Math.min(window.innerHeight-48, origY+y-startY)) } }; });
    };
    const mm = e => move(e.clientX, e.clientY);
    const tm = e => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); };
    const stop = () => { dragRef.current = null; window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', stop); window.removeEventListener('touchmove', tm); window.removeEventListener('touchend', stop); };
    window.addEventListener('mousemove', mm); window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', tm, { passive: false }); window.addEventListener('touchend', stop);
  }, [zIndex]);

  const handleContactSubmit = async (e) => {
    e.preventDefault(); setSending(true);
    try {
      // 1) Save to backend DB
      await axios.post(`${API_BASE}/api/contact`, formData);
      // 2) Send direct email via FormSubmit
      const res = await fetch(FORMSUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, subject: formData.subject, message: formData.message }),
      });
      const data = await res.json();
      if (data.message === 'error' || !res.ok) throw new Error('FormSubmit error');
      toast.success('Message sent! ✓');
      setFormData({ name:'',email:'',subject:'',message:'' });
      closeWindow('contact'); setActiveApp(null);
    } catch { toast.error('Failed to send. Please try again.'); } finally { setSending(false); }
  };

  const handleTerminalCommand = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = terminalInput.toLowerCase().trim(); let out = '';
    if (cmd === 'help') out = 'whoami · skills · projects · contact · open admin · clear';
    else if (cmd === 'whoami') out = `${bio?.name} — ${bio?.title}\n📍 ${bio?.location}\n📧 ${bio?.email}`;
    else if (cmd === 'skills') out = skills.map(s=>`📌 ${s.category}: ${s.skills.map(sk=>sk.name).join(', ')}`).join('\n') || 'No skills.';
    else if (cmd === 'projects') out = projects.map(p=>`📁 ${p.title} — ${p.stack}`).join('\n') || 'No projects.';
    else if (cmd === 'contact') out = `📧 ${bio?.email}\n🐙 github.com/rafideveloper7`;
    else if (cmd === 'open admin') { router.push('/admin/login'); out = 'Opening admin...'; }
    else if (cmd === 'clear') { setTerminalOutput([]); setTerminalInput(''); return; }
    else if (cmd) out = `Not found: ${cmd}. Type 'help'.`;
    if (out) setTerminalOutput(p => [...p, { command: terminalInput, output: out }]);
    setTerminalInput('');
  };

  const fmt = (url) => (url || '').split('/').pop().split('?')[0].replace(/\.pdf$/i, '').replace(/^v\d+\//, '');

  // ── Window content (shared desktop + mobile) ─────────────────────
  const renderContent = (id) => {
    if (id === 'about') {
      const bioImage = bio?.image;
      return (
        <div className="h-full overflow-auto">
          {/* Hero banner */}
          <div className="relative h-40 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {bioImage && (
                  <img src={bioImage} alt={bio?.name} className="w-20 h-20 rounded-full border-2 border-white/80 mx-auto mb-2 object-cover shadow-xl" />
                )}
                {!bioImage && (
                  <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center text-4xl backdrop-blur-sm border border-white/30">👨‍💻</div>
                )}
              </div>
            </div>
          </div>
          <div className="p-5 -mt-6 relative">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white">{bio?.name || 'Rafi Ullah'}</h2>
              <p className="text-blue-400 text-sm font-medium mt-0.5">{bio?.title || 'Full Stack Developer'}</p>
              {bio?.location && (
                <p className="text-gray-400 text-xs mt-1">📍 {bio.location}</p>
              )}
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-5">{bio?.bio || 'Full Stack Developer passionate about building modern web applications.'}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: 'Experience', value: `${stats.experience}+ yrs` },
                { label: 'Projects', value: stats.projects },
                { label: 'Clients', value: stats.clients },
              ].map((s, i) => (
                <div key={i} className="text-center bg-white/5 border border-white/10 rounded-2xl py-3 px-2">
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { label: 'Email', value: bio?.email },
                { label: 'Phone', value: bio?.phone },
                { label: 'GitHub', value: bio?.github },
                { label: 'LinkedIn', value: bio?.linkedin },
              ].filter(s => s.value).map((s, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                  {s.label === 'Email' ? (
                    <a href={`mailto:${s.value}`} className="text-sm text-blue-400 break-all mt-1 hover:underline">{s.value}</a>
                  ) : s.label === 'GitHub' || s.label === 'LinkedIn' ? (
                    <a href={s.value} target="_blank" rel="noreferrer" className="text-sm text-blue-400 mt-1 hover:underline block truncate">{new URL(s.value).pathname.replace(/^\//,'')}</a>
                  ) : (
                    <p className="text-sm text-white mt-1">{s.value}</p>
                  )}
                </div>
              ))}
            </div>

            {bio?.funFacts?.length && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">Fun Facts</p>
                <ul className="space-y-1.5">
                  {bio.funFacts.map((f, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-center gap-2"><span className="text-blue-400">✦</span>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (id === 'projects') {
      return (
        <div className="p-5 space-y-4 overflow-auto h-full">
          {projects.length === 0 ? (
            <div className="text-center text-gray-500 py-20 text-sm">No projects yet.</div>
          ) : (
            projects.map((p, i) => (
              <div key={p._id || i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/40 transition group">
                {p.image && (
                  <div className="h-40 bg-gray-800 overflow-hidden relative">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {p.featured && <span className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">FEATURED</span>}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-white text-base leading-snug">{p.title}</h3>
                    {!p.image && p.featured && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded shrink-0">FEATURED</span>}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">{p.description}</p>
                  {p.stack && <p className="text-xs text-blue-400 mb-3 font-medium">{p.stack}</p>}
                  <div className="flex gap-2 flex-wrap">
                    {p.liveLink && <a href={p.liveLink} target="_blank" rel="noreferrer" className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-600/30 transition font-medium">🔗 Live</a>}
                    {p.githubLink && <a href={p.githubLink} target="_blank" rel="noreferrer" className="text-xs bg-white/10 text-gray-300 px-3 py-1.5 rounded-full hover:bg-white/15 transition font-medium">🐙 Code</a>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    if (id === 'skills') {
      return (
        <div className="p-5 space-y-5 overflow-auto h-full">
          {skills.length === 0 ? (
            <div className="text-center text-gray-500 py-16 text-sm">No skills yet.</div>
          ) : (
            skills.map((cat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-3">{cat.category}</p>
                <div className="space-y-3">
                  {(cat.skills || []).map((sk, j) => (
                    <div key={j}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-gray-200 font-medium">{sk.name}</span>
                        <span className="text-xs text-gray-500 font-mono">{sk.percentage}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700 ease-out" style={{ width: `${sk.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                {cat.tools?.length && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cat.tools.map((t, k) => (
                      <span key={k} className="text-[10px] bg-white/10 text-gray-300 px-2 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      );
    }

    if (id === 'terminal') return (
      <div className="bg-black/90 h-full flex flex-col font-mono">
        <div className="flex items-center justify-between px-4 h-9 border-b border-gray-800 bg-black/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-gray-600 text-[10px]">RafiOS Terminal</span>
        </div>
        <div className="flex-1 p-4 text-xs overflow-auto">
          <p className="text-green-400 mb-1">RafiOS Terminal v1.0</p>
          <p className="text-gray-600 mb-4">Type 'help' for commands</p>
          {terminalOutput.map((item, i) => (
            <div key={i} className="mb-3">
              <div className="flex gap-2"><span className="text-green-400">$</span><span className="text-white">{item.command}</span></div>
              <div className="text-gray-400 whitespace-pre-wrap mt-1 pl-3 border-l border-gray-800">{item.output}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 p-3 flex items-center gap-2 bg-black/60">
          <span className="text-green-400 text-sm">$</span>
          <input type="text" value={terminalInput} onChange={e => setTerminalInput(e.target.value)} onKeyDown={handleTerminalCommand}
            className="flex-1 bg-transparent border-none outline-none text-white text-xs" placeholder="Type a command..." />
        </div>
      </div>
    );

    if (id === 'contact') return (
      <div className="p-5 overflow-auto h-full">
        <div className="text-center mb-6">
          <h3 className="text-white font-bold text-lg">Let's Connect</h3>
          <p className="text-gray-400 text-xs mt-1">I'd love to hear from you. Send me a message!</p>
        </div>
        <form onSubmit={handleContactSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[{k:'name',p:'Full Name',t:'text'},{k:'email',p:'Email Address',t:'email'}].map(f => (
              <input key={f.k} type={f.t} placeholder={f.p} value={formData[f.k]}
                onChange={e => setFormData({...formData,[f.k]:e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-blue-500 focus:outline-none transition" required />
            ))}
          </div>
          <input type="text" placeholder="Subject" value={formData.subject} onChange={e => setFormData({...formData,subject:e.target.value})}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-blue-500 focus:outline-none transition" required />
          <textarea placeholder="Your Message..." rows="4" value={formData.message}
            onChange={e => setFormData({...formData,message:e.target.value})}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-blue-500 focus:outline-none transition resize-none" required />
          <button type="submit" disabled={sending}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl font-semibold text-white text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
            {sending ? 'Sending...' : <><FiSend size={14} /> Send Message</>}
          </button>
        </form>
      </div>
    );

    if (id === 'gallery') return <Gallery />;
    if (id === 'music') return <MusicPlayer />;

    if (id === 'cv') return (
      <div className="flex flex-col h-full">
        {cvs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">No CV available.</div>
        ) : (
          <div className="p-5 space-y-4 overflow-auto">
            <div className="text-center mb-2">
              <p className="text-white font-semibold text-sm">📄 My CV ({cvs.length})</p>
            </div>
            <div className="flex justify-center">
              <div className="w-full h-[500px] border border-gray-700 rounded-lg flex items-center justify-center bg-black/40">
                {cvs[0]?.path ? (
                  <>
                    <iframe src={cvs[0].path} className="w-full h-full border-none" title="CV Preview" />
                    <div className="text-white text-center absolute bottom-4 left-0 right-0">
                      <a href={cvs[0].path} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">View in New Tab</a>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500">CV not available</div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {cvs.map((cv, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 shrink-0">📄</div>
                    <div>
                      <p className="text-white text-sm font-medium truncate max-w-[200px]">{cv.originalName || fmt(cv.path)}</p>
                      <p className="text-gray-500 text-xs">PDF</p>
                    </div>
                  </div>
                  <a href={cv.path} target="_blank" rel="noreferrer" className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-500/30 transition">Preview</a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const openApp = (app) => {
    if (isMobile) setActiveApp(app);
    else openWindow(app.id, app.label, app.width, app.height);
  };

  // ── MOBILE layout ─────────────────────────────────────────────────
  if (isMobile) {
    const wp = mobileWallpaper;
    return (
      <div className={`fixed inset-0 overflow-hidden ${getBgClass(wp)}`} style={getBgStyle(wp)}>
        <div id="stars" className="absolute inset-0 pointer-events-none" />

        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 z-50">
          <span className="text-white text-xs font-semibold drop-shadow-md">{time}</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-28 h-8 bg-black rounded-full flex items-center justify-center shadow-xl border border-white/10">
            <span className="text-white/60 text-[9px] tracking-widest font-medium">RafiOS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5 items-end h-3">
              {[2,3,4,4,3].map((h,i) => <div key={i} className="w-0.5 bg-white rounded-sm shadow-sm" style={{height:`${h*3}px`}} />)}
            </div>
            <svg className="w-4 h-3 text-white" fill="currentColor" viewBox="0 0 24 12"><rect x="0" y="0" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><rect x="20.5" y="3.5" width="2" height="5" rx="1" fill="currentColor"/><rect x="1.5" y="1.5" width="14" height="9" rx="1" fill="currentColor"/></svg>
          </div>
        </div>

        {activeApp ? (
          /* App open — full screen */
          <div className="absolute inset-0 z-40 flex flex-col" style={{ paddingTop: '48px', paddingBottom: '34px' }}>
            {/* App header */}
            <div className="bg-black/40 backdrop-blur-2xl border-b border-white/10 flex items-center px-4 py-3 shrink-0">
              <button onClick={() => setActiveApp(null)}
                className="flex items-center gap-1 text-blue-400 text-sm font-semibold mr-3 active:opacity-70 transition">
                <FiChevronLeft size={18} /> Home
              </button>
              <span className="text-white font-semibold text-sm flex-1 text-center pr-8">{activeApp.label}</span>
            </div>
            <div className="flex-1 overflow-auto bg-[#0d0d0f]/95 backdrop-blur-xl">
              {renderContent(activeApp.id)}
            </div>
          </div>
        ) : (
          <>
            {/* Home screen */}
            <div className="absolute inset-0 flex flex-col" style={{ paddingTop: '56px', paddingBottom: '100px' }}>
              {/* Greeting */}
              <div className="px-6 mb-6">
                <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] font-medium">Welcome</p>
                <h1 className="text-white text-2xl font-bold mt-1">{bio?.name || 'Rafi Ullah'}</h1>
                <p className="text-blue-400 text-xs font-medium mt-0.5">{bio?.title || 'Full Stack Developer'}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{statusMsg}</p>
              </div>

              {/* App grid — 4 cols with premium spacing */}
              <div className="flex-1 overflow-auto px-5">
                <div className="grid grid-cols-4 gap-x-5 gap-y-7">
                  {apps.map(app => (
                    <button key={app.id} onClick={() => openApp(app)}
                      className="flex flex-col items-center gap-2 active:scale-90 transition-transform duration-150 w-full group">
                      <div className={`w-16 h-16 bg-gradient-to-br ${app.color} rounded-[22px] flex items-center justify-center text-2xl shadow-lg shadow-black/40 group-hover:scale-110 group-hover:shadow-xl transition-all`}>
                        {app.icon}
                      </div>
                      <span className="text-white/80 text-[10px] font-medium text-center leading-tight">{app.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick stats strip */}
              <div className="px-6 mb-4">
                <div className="flex justify-around bg-white/5 border border-white/10 rounded-2xl py-3 backdrop-blur-xl">
                  {[
                    { label: 'Projects', value: stats.projects },
                    { label: 'Hours', value: stats.hours },
                    { label: 'Clients', value: stats.clients },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <p className="text-white font-bold text-base">{s.value}</p>
                      <p className="text-gray-400 text-[9px] uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dock */}
            <div className="absolute bottom-6 left-4 right-4 z-50">
              <div className="bg-white/10 backdrop-blur-2xl rounded-[28px] px-4 py-3 flex justify-around border border-white/20 shadow-2xl">
                {apps.slice(0, 4).map(app => (
                  <button key={app.id} onClick={() => openApp(app)}
                    className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-100">
                    <div className={`w-12 h-12 bg-gradient-to-br ${app.color} rounded-[14px] flex items-center justify-center text-xl shadow-md`}>
                      {app.icon}
                    </div>
                  </button>
                ))}
                <button onClick={() => router.push('/admin/login')} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-gray-700/50 rounded-[14px] flex items-center justify-center text-lg shadow-md">
                    ⚙️
                  </div>
                </button>
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/30 rounded-full" />
          </>
        )}
      </div>
    );
  }

  // ── DESKTOP layout ─────────────────────────────────────────────────
  const wp = wallpaper;
  return (
    <div className={`fixed inset-0 overflow-hidden ${getBgClass(wp)}`} style={getBgStyle(wp)}>
      <div id="stars" className="absolute inset-0 pointer-events-none" />

      {/* Menu Bar */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-black/50 backdrop-blur-xl flex items-center px-4 gap-3 z-50 border-b border-white/10">
        <span className="text-blue-400 font-bold text-sm tracking-tight">RafiOS</span>
        {apps.slice(0, 5).map(app => (
          <button key={app.id} onClick={() => openApp(app)} className="text-white/70 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10 transition hidden sm:block">
            {app.label}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={() => router.push('/admin/login')} className="text-white/70 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10 transition flex items-center gap-1">
          <FiUser size={10} /> Admin
        </button>
        <span className="text-white/50 text-xs">{time}</span>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-12 left-3 flex flex-col gap-1.5">
        {apps.map(app => (
          <div key={app.id} className="w-20 flex flex-col items-center gap-1 cursor-pointer hover:bg-white/10 rounded-2xl p-2 transition group"
            onDoubleClick={() => openApp(app)}>
            <div className="w-12 h-12 bg-gradient-to-br ${app.color} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-lg">{app.icon}</div>
            <span className="text-white/70 text-[10px] text-center leading-tight">{app.label}</span>
          </div>
        ))}
      </div>

      {/* Windows */}
      {Object.values(windows).filter(w => w.visible).map(win => (
        <div key={win.id} className="fixed bg-[#1a1f2e]/95 backdrop-blur-xl rounded-2xl border border-white/15 flex flex-col shadow-2xl"
          style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex }}
          onMouseDown={() => focusWindow(win.id)}>
          <div className="h-10 bg-[#14192a] rounded-t-2xl flex items-center px-3 gap-2 border-b border-white/10 cursor-grab active:cursor-grabbing select-none shrink-0"
            onMouseDown={e => { if (e.button !== 0 || e.target.tagName === 'BUTTON') return; e.preventDefault(); startDrag(e.clientX, e.clientY, win.id); }}
            onTouchStart={e => { if (e.target.tagName === 'BUTTON') return; startDrag(e.touches[0].clientX, e.touches[0].clientY, win.id); }}>
            <button onClick={() => closeWindow(win.id)} className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-400 transition shrink-0" />
            <button className="w-3.5 h-3.5 rounded-full bg-yellow-500 shrink-0" />
            <button className="w-3.5 h-3.5 rounded-full bg-green-500 shrink-0" />
            <span className="text-white/60 text-xs ml-2 font-medium truncate">{win.title}</span>
          </div>
          <div className="flex-1 overflow-auto">{renderContent(win.id)}</div>
        </div>
      ))}

      {/* Dock */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl rounded-2xl px-2 py-1.5 flex gap-1 border border-white/20 z-50 max-w-[calc(100vw-16px)] overflow-x-auto">
        {apps.map(app => (
          <button key={app.id} onClick={() => openApp(app)}
            className={`w-11 h-11 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-all duration-200 relative group shrink-0 shadow-md`}>
            {app.icon}
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg">{app.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
