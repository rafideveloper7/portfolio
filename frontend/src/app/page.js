// frontend/src/app/page.js
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiSend, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import Gallery from '../components/Gallery';
import MusicPlayer from '../components/MusicPlayer';

const API = process.env.NEXT_PUBLIC_API_URL;

// Detect touch device
const isTouchDevice = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [windows, setWindows] = useState({});
  const [bio, setBio] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [zIndex, setZIndex] = useState(10);
  const [time, setTime] = useState('');
  const [wallpaper, setWallpaper] = useState({ type: 'gradient', value: '' });
  const [isMobile, setIsMobile] = useState(false);
  const dragRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    fetchData();
    createStars();
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => { clearInterval(interval); window.removeEventListener('resize', checkMobile); };
  }, []);

  const updateClock = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const fetchData = async () => {
    try {
      const [bioRes, projectsRes, skillsRes, settingsRes] = await Promise.all([
        axios.get(`${API}/api/bio`).catch(() => ({ data: null })),
        axios.get(`${API}/api/projects`).catch(() => ({ data: [] })),
        axios.get(`${API}/api/skills`).catch(() => ({ data: [] })),
        axios.get(`${API}/api/settings`).catch(() => ({ data: null })),
      ]);
      setBio(bioRes.data || { name: 'Rafi Ullah', title: 'Full Stack Developer', location: 'Kohat, Pakistan', email: 'rafideveloper7@gmail.com' });
      setProjects(projectsRes.data || []);
      setSkills(skillsRes.data || []);
      if (settingsRes.data) setWallpaper({ type: settingsRes.data.wallpaperType || 'gradient', value: settingsRes.data.wallpaperValue || '' });
    } catch (err) { console.error(err); }
  };

  const createStars = () => {
    const c = document.getElementById('stars');
    if (!c) return;
    c.innerHTML = '';
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.cssText = `position:absolute;width:${Math.random()*2+1}px;height:${Math.random()*2+1}px;background:white;border-radius:50%;left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:${Math.random()*0.5+0.1};animation:twinkle ${Math.random()*4+2}s infinite alternate;`;
      c.appendChild(s);
    }
  };

  const GRADIENT_MAP = {
    'gradient-default': 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900',
    'gradient-purple':  'bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900',
    'gradient-green':   'bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900',
    'gradient-red':     'bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900',
    'gradient-dark':    'bg-gradient-to-br from-gray-950 to-gray-900',
  };

  const getWallpaperStyle = () => {
    if (wallpaper.type === 'image' && wallpaper.value)
      return { backgroundImage: `url(${wallpaper.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    if (wallpaper.type === 'color' && wallpaper.value)
      return { background: wallpaper.value };
    return {};
  };

  const bgClass = wallpaper.type === 'gradient'
    ? (GRADIENT_MAP[wallpaper.value] || GRADIENT_MAP['gradient-default']) : '';

  // ── App definitions ──────────────────────────────────────────────
  const apps = [
    { id: 'about',    label: 'About Me',  icon: '👤', width: 480, height: 450 },
    { id: 'projects', label: 'Projects',  icon: '💼', width: 550, height: 500 },
    { id: 'skills',   label: 'Skills',    icon: '⚡', width: 500, height: 480 },
    { id: 'terminal', label: 'Terminal',  icon: '💻', width: 550, height: 400 },
    { id: 'contact',  label: 'Contact',   icon: '📬', width: 450, height: 500 },
    { id: 'gallery',  label: 'Gallery',   icon: '🖼️', width: 560, height: 460 },
    { id: 'music',    label: 'Music',     icon: '🎵', width: 520, height: 480 },
  ];

  // ── Window management ────────────────────────────────────────────
  const openWindow = (id, title, width, height) => {
    const newZ = zIndex + 1;
    setZIndex(newZ);
    if (windows[id]?.visible) {
      setWindows(prev => ({ ...prev, [id]: { ...prev[id], zIndex: newZ } }));
      return;
    }
    const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 600;
    const w = Math.min(width || 500, vw - 16);
    const h = Math.min(height || 400, vh - 80);
    const x = Math.max(8, Math.round((vw - w) / 2));
    const y = Math.max(36, Math.round((vh - h) / 3));
    setWindows(prev => ({ ...prev, [id]: { id, title, visible: true, zIndex: newZ, x, y, width: w, height: h } }));
  };

  const closeWindow = (id) => setWindows(prev => ({ ...prev, [id]: { ...prev[id], visible: false } }));

  const focusWindow = (id) => {
    const newZ = zIndex + 1;
    setZIndex(newZ);
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], zIndex: newZ } }));
  };

  // ── Drag: mouse + touch ──────────────────────────────────────────
  const startDrag = useCallback((clientX, clientY, id) => {
    setWindows(prev => {
      const win = prev[id];
      if (!win) return prev;
      // Store everything we need in the ref so the move closure is stable
      dragRef.current = {
        id,
        startX: clientX,
        startY: clientY,
        origX: win.x,
        origY: win.y,
        winW: win.width,
        winH: win.height,
      };
      const newZ = zIndex + 1;
      return { ...prev, [id]: { ...win, zIndex: newZ } };
    });
    setZIndex(z => z + 1);

    const move = (cx, cy) => {
      if (!dragRef.current) return;
      const { id: wid, startX, startY, origX, origY, winW, winH } = dragRef.current;
      const dx = cx - startX;
      const dy = cy - startY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const newX = Math.max(0, Math.min(vw - winW, origX + dx));
      const newY = Math.max(32, Math.min(vh - 48, origY + dy));
      setWindows(prev => {
        if (!prev[wid]) return prev;
        return { ...prev, [wid]: { ...prev[wid], x: newX, y: newY } };
      });
    };

    const onMouseMove = (e) => move(e.clientX, e.clientY);
    const onTouchMove = (e) => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); };
    const stop = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stop);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', stop);
  }, [zIndex]); // eslint-disable-line

  const onTitleBarMouseDown = (e, id) => {
    if (e.button !== 0 || e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    startDrag(e.clientX, e.clientY, id);
  };

  const onTitleBarTouchStart = (e, id) => {
    if (e.target.tagName === 'BUTTON') return;
    startDrag(e.touches[0].clientX, e.touches[0].clientY, id);
  };

  // ── Contact form ─────────────────────────────────────────────────
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API}/api/contact`, formData);
      toast.success("Message sent! I'll get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' });
      closeWindow('contact');
    } catch { toast.error('Failed to send message.'); }
    finally { setSending(false); }
  };

  // ── Terminal ─────────────────────────────────────────────────────
  const handleTerminalCommand = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = terminalInput.toLowerCase().trim();
    let output = '';
    if (cmd === 'help') output = 'Commands:\n  whoami · skills · projects · contact\n  open admin · clear';
    else if (cmd === 'whoami') output = `${bio?.name} - ${bio?.title}\n📍 ${bio?.location}\n📧 ${bio?.email}`;
    else if (cmd === 'skills') output = skills.map(s => `📌 ${s.category}: ${s.skills.map(sk=>sk.name).join(', ')}`).join('\n') || 'No skills yet.';
    else if (cmd === 'projects') output = projects.map(p => `📁 ${p.title} — ${p.stack}`).join('\n') || 'No projects yet.';
    else if (cmd === 'contact') output = `📧 ${bio?.email}\n🐙 github.com/rafideveloper7`;
    else if (cmd === 'open admin') { router.push('/admin/login'); output = 'Opening admin...'; }
    else if (cmd === 'clear') { setTerminalOutput([]); setTerminalInput(''); return; }
    else if (cmd) output = `Not found: ${cmd}. Type 'help'.`;
    if (output) setTerminalOutput(prev => [...prev, { command: terminalInput, output }]);
    setTerminalInput('');
  };

  // ── Window content ───────────────────────────────────────────────
  const renderWindowContent = (id) => {
    if (id === 'about') return (
      <div className="p-4 sm:p-6 space-y-4 overflow-auto h-full">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mb-3 shadow-lg">👨‍💻</div>
          <h2 className="text-lg sm:text-2xl font-bold text-white">{bio?.name || 'Rafi Ullah'}</h2>
          <p className="text-blue-400 text-xs sm:text-sm mt-1">{bio?.title || 'Full Stack Developer'}</p>
        </div>
        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{bio?.bio || 'Full Stack Developer passionate about building modern web applications.'}</p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-white/5 rounded-lg p-2 sm:p-3"><div className="text-[10px] sm:text-xs text-gray-400">Location</div><div className="text-xs sm:text-sm text-white mt-1">{bio?.location || 'Kohat, Pakistan'}</div></div>
          <div className="bg-white/5 rounded-lg p-2 sm:p-3"><div className="text-[10px] sm:text-xs text-gray-400">Email</div><div className="text-xs sm:text-sm text-white mt-1 break-all">{bio?.email || 'rafideveloper7@gmail.com'}</div></div>
        </div>
        {(bio?.github || bio?.linkedin) && (
          <div className="flex gap-3 flex-wrap">
            {bio.github && <a href={bio.github} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">🐙 GitHub</a>}
            {bio.linkedin && <a href={bio.linkedin} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">💼 LinkedIn</a>}
          </div>
        )}
      </div>
    );

    if (id === 'projects') return (
      <div className="p-3 sm:p-4 space-y-3 overflow-auto h-full">
        {projects.length === 0 ? <div className="text-center text-gray-400 py-10 text-sm">No projects yet.</div> :
          projects.map((p, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition">
              <h3 className="font-semibold text-white text-sm">{p.title}</h3>
              <p className="text-xs text-blue-400 mt-1">{p.stack}</p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description}</p>
              <div className="flex gap-3 mt-2 flex-wrap">
                {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">🔗 Live</a>}
                {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:underline">🐙 Code</a>}
              </div>
            </div>
          ))}
      </div>
    );

    if (id === 'skills') return (
      <div className="p-3 sm:p-5 space-y-4 overflow-auto h-full">
        {skills.length === 0 ? <div className="text-center text-gray-400 py-10 text-sm">No skills yet.</div> :
          skills.map((cat, i) => (
            <div key={i}>
              <h3 className="text-blue-400 text-xs font-semibold mb-2 uppercase tracking-wider">{cat.category}</h3>
              <div className="space-y-2">
                {cat.skills.map((skill, j) => (
                  <div key={j}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-300">{skill.name}</span><span className="text-gray-500">{skill.percentage}%</span></div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${skill.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    );

    if (id === 'terminal') return (
      <div className="bg-black/80 h-full flex flex-col">
        <div className="flex-1 p-3 font-mono text-xs overflow-auto">
          <div className="text-green-400 mb-1">RafiOS Terminal v1.0</div>
          <div className="text-gray-500 mb-3">Type 'help' for commands</div>
          {terminalOutput.map((item, i) => (
            <div key={i} className="mb-2">
              <div className="flex gap-2"><span className="text-green-400">$</span><span className="text-white">{item.command}</span></div>
              <div className="text-gray-400 whitespace-pre-wrap mt-1 pl-3 border-l border-gray-700">{item.output}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 p-2 flex items-center gap-2 bg-black/50">
          <span className="text-green-400 font-mono text-sm">$</span>
          <input type="text" value={terminalInput} onChange={e => setTerminalInput(e.target.value)} onKeyDown={handleTerminalCommand}
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs sm:text-sm" placeholder="Type a command..." />
        </div>
      </div>
    );

    if (id === 'contact') return (
      <div className="p-4 sm:p-6 overflow-auto h-full">
        <form onSubmit={handleContactSubmit} className="space-y-3">
          {[
            { key: 'name', placeholder: 'Your Name', type: 'text' },
            { key: 'email', placeholder: 'Your Email', type: 'email' },
            { key: 'subject', placeholder: 'Subject', type: 'text' },
          ].map(f => (
            <input key={f.key} type={f.type} placeholder={f.placeholder} value={formData[f.key]}
              onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" required />
          ))}
          <textarea placeholder="Your Message" rows="3" value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" required />
          <button type="submit" disabled={sending}
            className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-semibold text-white text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {sending ? 'Sending...' : <><FiSend size={14} /> Send Message</>}
          </button>
        </form>
      </div>
    );

    if (id === 'gallery') return <Gallery />;
    if (id === 'music') return <MusicPlayer />;
  };

  // ── Dock icons ───────────────────────────────────────────────────
  const dockIcons = [
    { id: 'about',    label: 'About',    icon: '👤' },
    { id: 'projects', label: 'Projects', icon: '💼' },
    { id: 'skills',   label: 'Skills',   icon: '⚡' },
    { id: 'terminal', label: 'Terminal', icon: '💻' },
    { id: 'contact',  label: 'Contact',  icon: '📬' },
    { id: 'gallery',  label: 'Gallery',  icon: '🖼️' },
    { id: 'music',    label: 'Music',    icon: '🎵' },
  ];

  const openApp = (app) => openWindow(app.id, app.label, app.width, app.height);

  // ── MOBILE LAYOUT ────────────────────────────────────────────────
  if (isMobile) {
    const activeWin = Object.values(windows).find(w => w.visible);
    return (
      <div className={`fixed inset-0 overflow-hidden ${bgClass}`} style={getWallpaperStyle()}>
        <div id="stars" className="absolute inset-0 pointer-events-none" />

        {/* Mobile top bar */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-black/60 backdrop-blur-md flex items-center justify-between px-3 z-50 border-b border-white/10">
          <span className="text-blue-400 font-bold text-sm">RafiOS</span>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/admin/login')} className="text-white/60 hover:text-white text-xs px-2 py-1 rounded bg-white/5 flex items-center gap-1">
              <FiUser size={10} /> Admin
            </button>
            <span className="text-white/40 text-xs">{time}</span>
          </div>
        </div>

        {/* App grid */}
        {!activeWin && (
          <div className="absolute top-10 left-0 right-0 bottom-0 overflow-auto p-4">
            <div className="grid grid-cols-3 xs:grid-cols-4 gap-4 pt-2">
              {apps.map(app => (
                <button key={app.id} onClick={() => openApp(app)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-white/10 active:bg-white/20 transition">
                  <div className="w-14 h-14 bg-gradient-to-br from-white/15 to-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-lg">{app.icon}</div>
                  <span className="text-white/80 text-[10px] text-center leading-tight">{app.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile full-screen window */}
        {activeWin && (
          <div className="absolute top-10 left-0 right-0 bottom-0 bg-[#1a1f2e] flex flex-col z-40">
            <div className="h-10 bg-[#14192a] flex items-center px-3 gap-2 border-b border-white/10 shrink-0">
              <button onClick={() => closeWindow(activeWin.id)} className="w-7 h-7 rounded-full bg-red-500/20 hover:bg-red-500 flex items-center justify-center transition">
                <FiX size={12} className="text-red-400 hover:text-white" />
              </button>
              <span className="text-white/70 text-sm font-medium ml-1">{activeWin.title}</span>
            </div>
            <div className="flex-1 overflow-auto">{renderWindowContent(activeWin.id)}</div>
          </div>
        )}
      </div>
    );
  }

  // ── DESKTOP LAYOUT ───────────────────────────────────────────────
  return (
    <div className={`fixed inset-0 overflow-hidden ${bgClass}`} style={getWallpaperStyle()}>
      <div id="stars" className="absolute inset-0 pointer-events-none" />

      {/* Menu Bar */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/50 backdrop-blur-md flex items-center px-4 gap-3 z-50 border-b border-white/10">
        <span className="text-blue-400 font-semibold text-sm">RafiOS</span>
        {apps.slice(0, 4).map(app => (
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

      {/* Desktop Icons — left column */}
      <div className="absolute top-10 left-2 flex flex-col gap-1">
        {apps.map(app => (
          <div key={app.id} className="w-16 flex flex-col items-center gap-0.5 cursor-pointer hover:bg-white/5 rounded-lg p-1 transition group"
            onDoubleClick={() => openApp(app)}>
            <div className="w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{app.icon}</div>
            <span className="text-white/70 text-[9px] text-center leading-tight">{app.label}</span>
          </div>
        ))}
      </div>

      {/* Windows */}
      {Object.values(windows).filter(w => w.visible).map(win => (
        <div key={win.id}
          className="fixed bg-[#1a1f2e] rounded-xl border border-white/20 flex flex-col shadow-2xl"
          style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex }}
          onMouseDown={() => focusWindow(win.id)}>
          <div
            className="h-9 bg-[#14192a] rounded-t-xl flex items-center px-3 gap-2 border-b border-white/10 cursor-grab active:cursor-grabbing select-none shrink-0"
            onMouseDown={(e) => onTitleBarMouseDown(e, win.id)}
            onTouchStart={(e) => onTitleBarTouchStart(e, win.id)}>
            <button onClick={() => closeWindow(win.id)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition shrink-0" />
            <button className="w-3 h-3 rounded-full bg-yellow-500 shrink-0" />
            <button className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
            <span className="text-white/50 text-xs ml-2 truncate">{win.title}</span>
          </div>
          <div className="flex-1 overflow-auto">{renderWindowContent(win.id)}</div>
        </div>
      ))}

      {/* Dock */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-2xl px-2 py-1.5 flex gap-1 border border-white/20 z-50 max-w-[calc(100vw-16px)] overflow-x-auto">
        {dockIcons.map(icon => {
          const app = apps.find(a => a.id === icon.id);
          return (
            <div key={icon.id} onClick={() => app && openApp(app)}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl sm:text-2xl cursor-pointer hover:scale-110 hover:bg-white/10 transition-all duration-200 relative group shrink-0">
              {icon.icon}
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">{icon.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
