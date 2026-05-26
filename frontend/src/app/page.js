// frontend/src/app/page.js
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import Gallery from '../components/Gallery';
import MusicPlayer from '../components/MusicPlayer';
import ContextMenu from '../components/ContextMenu';

const API = process.env.NEXT_PUBLIC_API_URL;

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

  // Drag state stored in a ref to avoid re-renders during drag
  const dragRef = useRef(null);

  useEffect(() => {
    fetchData();
    createStars();
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateClock = () => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const createStars = () => {
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
      starsContainer.innerHTML = '';
      for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
          position: absolute;
          width: ${Math.random() * 2 + 1}px;
          height: ${Math.random() * 2 + 1}px;
          background: white;
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          opacity: ${Math.random() * 0.5 + 0.1};
          animation: twinkle ${Math.random() * 4 + 2}s infinite alternate;
        `;
        starsContainer.appendChild(star);
      }
    }
  };

  // ── Wallpaper style ──────────────────────────────────────────────
  const getWallpaperStyle = () => {
    if (wallpaper.type === 'image' && wallpaper.value) {
      return { backgroundImage: `url(${wallpaper.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    if (wallpaper.type === 'color' && wallpaper.value) {
      return { background: wallpaper.value };
    }
    return {}; // default gradient via className
  };

  // ── Window management ────────────────────────────────────────────
  const desktopIcons = [
    { id: 'about',    label: 'About Me',  icon: '👤', x: 20, y: 20,  width: 480, height: 450 },
    { id: 'projects', label: 'Projects',  icon: '💼', x: 20, y: 110, width: 550, height: 500 },
    { id: 'skills',   label: 'Skills',    icon: '⚡', x: 20, y: 200, width: 500, height: 480 },
    { id: 'terminal', label: 'Terminal',  icon: '💻', x: 20, y: 290, width: 550, height: 400 },
    { id: 'contact',  label: 'Contact',   icon: '📬', x: 20, y: 380, width: 450, height: 500 },
    { id: 'gallery',  label: 'Gallery',   icon: '🖼️', x: 20, y: 470, width: 560, height: 460 },
    { id: 'music',    label: 'Music',     icon: '🎵', x: 20, y: 560, width: 520, height: 480 },
  ];

  const openWindow = (id, title, width, height) => {
    if (windows[id]?.visible) {
      setWindows(prev => ({ ...prev, [id]: { ...prev[id], zIndex: zIndex + 1 } }));
      setZIndex(prev => prev + 1);
      return;
    }
    const icon = desktopIcons.find(i => i.id === id);
    const newZ = zIndex + 1;
    setWindows(prev => ({
      ...prev,
      [id]: {
        id, title, visible: true, zIndex: newZ,
        x: icon ? icon.x + 60 : 120,
        y: icon ? icon.y + 40 : 80,
        width: width || 500,
        height: height || 400,
      }
    }));
    setZIndex(newZ);
  };

  const closeWindow = (id) => {
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], visible: false } }));
  };

  const focusWindow = (id) => {
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], zIndex: zIndex + 1 } }));
    setZIndex(prev => prev + 1);
  };

  // ── Drag logic ───────────────────────────────────────────────────
  const onTitleBarMouseDown = useCallback((e, id) => {
    // Only drag on left click on the title bar itself (not buttons)
    if (e.button !== 0) return;
    if (e.target.tagName === 'BUTTON') return;
    e.preventDefault();

    focusWindow(id);

    const win = windows[id];
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: win.x,
      origY: win.y,
    };

    const onMouseMove = (e) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = Math.max(0, dragRef.current.origX + dx);
      const newY = Math.max(32, dragRef.current.origY + dy); // keep below menu bar
      setWindows(prev => ({
        ...prev,
        [dragRef.current.id]: { ...prev[dragRef.current.id], x: newX, y: newY }
      }));
    };

    const onMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [windows, zIndex]); // eslint-disable-line

  // ── Contact form ─────────────────────────────────────────────────
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API}/api/contact`, formData);
      toast.success("Message sent! I'll get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' });
      closeWindow('contact');
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // ── Terminal ─────────────────────────────────────────────────────
  const handleTerminalCommand = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = terminalInput.toLowerCase().trim();
    let output = '';
    if (cmd === 'help') {
      output = 'Available commands:\n  whoami   - About me\n  skills   - My skills\n  projects - My projects\n  contact  - Contact info\n  open admin - Open admin panel\n  clear    - Clear terminal';
    } else if (cmd === 'whoami') {
      output = `${bio?.name || 'Rafi Ullah'} - ${bio?.title || 'Full Stack Developer'}\n📍 ${bio?.location || 'Kohat, Pakistan'}\n📧 ${bio?.email || 'rafideveloper7@gmail.com'}`;
    } else if (cmd === 'skills') {
      output = skills.map(s => `📌 ${s.category}:\n   ${s.skills.map(sk => sk.name).join(', ')}`).join('\n\n') || 'No skills yet.';
    } else if (cmd === 'projects') {
      output = projects.map(p => `📁 ${p.title}\n   ${p.stack}\n   ${p.description}`).join('\n\n') || 'No projects yet.';
    } else if (cmd === 'contact') {
      output = `📧 Email: ${bio?.email || 'rafideveloper7@gmail.com'}\n🐙 GitHub: github.com/rafideveloper7\n💼 LinkedIn: linkedin.com/in/rafi-ullah`;
    } else if (cmd === 'open admin') {
      router.push('/admin/login');
      output = 'Opening admin panel...';
    } else if (cmd === 'clear') {
      setTerminalOutput([]);
      setTerminalInput('');
      return;
    } else if (cmd) {
      output = `Command not found: ${cmd}. Type 'help' for available commands.`;
    }
    if (output) setTerminalOutput(prev => [...prev, { command: terminalInput, output }]);
    setTerminalInput('');
  };

  // ── Window content ───────────────────────────────────────────────
  const renderWindowContent = (id) => {
    if (id === 'about') return (
      <div className="p-6 space-y-4">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-4xl mb-3 shadow-lg">👨‍💻</div>
          <h2 className="text-2xl font-bold text-white">{bio?.name || 'Rafi Ullah'}</h2>
          <p className="text-blue-400 text-sm mt-1">{bio?.title || 'Full Stack Developer'}</p>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{bio?.bio || 'Full Stack Developer passionate about building modern web applications with React, Node.js, and MongoDB.'}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3"><div className="text-xs text-gray-400">Location</div><div className="text-sm text-white mt-1">{bio?.location || 'Kohat, Pakistan'}</div></div>
          <div className="bg-white/5 rounded-lg p-3"><div className="text-xs text-gray-400">Email</div><div className="text-sm text-white mt-1">{bio?.email || 'rafideveloper7@gmail.com'}</div></div>
        </div>
      </div>
    );

    if (id === 'projects') return (
      <div className="p-4 space-y-3 overflow-auto max-h-[400px]">
        {projects.length === 0 ? <div className="text-center text-gray-400 py-10">No projects yet.</div> :
          projects.map((p, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-xl">📁</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <p className="text-xs text-blue-400 mt-1">{p.stack}</p>
                  <p className="text-xs text-gray-400 mt-2">{p.description}</p>
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">🔗 Live</a>}
                </div>
              </div>
            </div>
          ))}
      </div>
    );

    if (id === 'skills') return (
      <div className="p-5 space-y-5 overflow-auto max-h-[400px]">
        {skills.length === 0 ? <div className="text-center text-gray-400 py-10">No skills added yet.</div> :
          skills.map((cat, i) => (
            <div key={i}>
              <h3 className="text-blue-400 text-sm font-semibold mb-3 uppercase tracking-wider">{cat.category}</h3>
              <div className="space-y-2">
                {cat.skills.map((skill, j) => (
                  <div key={j}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-300">{skill.name}</span><span className="text-gray-500">{skill.percentage}%</span></div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500" style={{ width: `${skill.percentage}%` }}></div>
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
        <div className="flex-1 p-4 font-mono text-xs overflow-auto">
          <div className="text-green-400 mb-2">RafiOS Terminal v1.0</div>
          <div className="text-gray-500 mb-4">Type 'help' for commands</div>
          {terminalOutput.map((item, i) => (
            <div key={i} className="mb-3">
              <div className="flex gap-2"><span className="text-green-400">$</span><span className="text-white">{item.command}</span></div>
              <div className="text-gray-400 whitespace-pre-wrap mt-1 pl-4 border-l-2 border-gray-700">{item.output}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 p-3 flex items-center gap-2 bg-black/50">
          <span className="text-green-400 font-mono text-sm">$</span>
          <input type="text" value={terminalInput} onChange={e => setTerminalInput(e.target.value)} onKeyDown={handleTerminalCommand}
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm" placeholder="Type a command..." autoFocus />
        </div>
      </div>
    );

    if (id === 'contact') return (
      <div className="p-6">
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <input type="text" placeholder="Your Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition" required />
          <input type="email" placeholder="Your Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition" required />
          <input type="text" placeholder="Subject" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition" required />
          <textarea placeholder="Your Message" rows="4" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition" required />
          <button type="submit" disabled={sending}
            className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-semibold text-white hover:opacity-90 transition disabled:opacity-50">
            {sending ? 'Sending...' : <span className="flex items-center justify-center gap-2"><FiSend /> Send Message</span>}
          </button>
        </form>
      </div>
    );

    if (id === 'finder') return (
      <div className="p-4 grid grid-cols-3 gap-4">
        {[
          { id: 'about', label: 'About Me', icon: '👤', w: 480, h: 450 },
          { id: 'projects', label: 'Projects', icon: '💼', w: 550, h: 500 },
          { id: 'skills', label: 'Skills', icon: '⚡', w: 500, h: 480 },
          { id: 'terminal', label: 'Terminal', icon: '💻', w: 550, h: 400 },
          { id: 'contact', label: 'Contact', icon: '📬', w: 450, h: 500 },
          { id: 'gallery', label: 'Gallery', icon: '🖼️', w: 560, h: 460 },
          { id: 'music', label: 'Music', icon: '🎵', w: 520, h: 480 },
        ].map(item => (
          <div key={item.id} className="text-center cursor-pointer hover:bg-white/5 rounded-lg p-3 transition" onClick={() => openWindow(item.id, item.label, item.w, item.h)}>
            <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">{item.icon}</div>
            <p className="text-xs text-gray-300 mt-2">{item.label}</p>
          </div>
        ))}
      </div>
    );

    if (id === 'gallery') return <Gallery />;
    if (id === 'music') return <MusicPlayer />;
  };

  const dockIcons = [
    { id: 'finder',   label: 'Finder',   icon: '📁', action: () => openWindow('finder',   'Finder',   500, 380) },
    { id: 'about',    label: 'About',    icon: '👤', action: () => openWindow('about',    'About Me', 480, 450) },
    { id: 'projects', label: 'Projects', icon: '💼', action: () => openWindow('projects', 'Projects', 550, 500) },
    { id: 'skills',   label: 'Skills',   icon: '⚡', action: () => openWindow('skills',   'Skills',   500, 480) },
    { id: 'terminal', label: 'Terminal', icon: '💻', action: () => openWindow('terminal', 'Terminal', 550, 400) },
    { id: 'contact',  label: 'Contact',  icon: '📬', action: () => openWindow('contact',  'Contact',  450, 500) },
    { id: 'gallery',  label: 'Gallery',  icon: '🖼️', action: () => openWindow('gallery',  'Gallery',  560, 460) },
    { id: 'music',    label: 'Music',    icon: '🎵', action: () => openWindow('music',    'Music',    520, 480) },
  ];

  const GRADIENT_MAP = {
    'gradient-default': 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900',
    'gradient-purple':  'bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900',
    'gradient-green':   'bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900',
    'gradient-red':     'bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900',
    'gradient-dark':    'bg-gradient-to-br from-gray-950 to-gray-900',
  };

  const bgClass = wallpaper.type === 'gradient'
    ? (GRADIENT_MAP[wallpaper.value] || GRADIENT_MAP['gradient-default'])
    : '';

  return (
    <div className={`fixed inset-0 overflow-hidden ${bgClass}`} style={getWallpaperStyle()}>
      <ContextMenu />
      <div id="stars" className="absolute inset-0 pointer-events-none"></div>

      {/* Menu Bar */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/50 backdrop-blur-md flex items-center px-4 gap-4 z-50 border-b border-white/10">
        <span className="text-blue-400 font-semibold text-sm">RafiOS</span>
        <button onClick={() => openWindow('finder', 'Finder', 500, 380)} className="text-white/70 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10 transition">Finder</button>
        <button onClick={() => openWindow('about', 'About Me', 480, 450)} className="text-white/70 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10 transition">About</button>
        <button onClick={() => openWindow('projects', 'Projects', 550, 500)} className="text-white/70 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10 transition">Projects</button>
        <button onClick={() => openWindow('terminal', 'Terminal', 550, 400)} className="text-white/70 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10 transition">Terminal</button>
        <div className="flex-1" />
        <button onClick={() => router.push('/admin/login')} className="text-white/70 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10 transition flex items-center gap-1">
          <FiUser size={10} /> Admin
        </button>
        <span className="text-white/50 text-xs">{time}</span>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-8 left-0 right-0 bottom-16">
        {desktopIcons.map(icon => (
          <div key={icon.id} className="absolute w-20 flex flex-col items-center gap-1 cursor-pointer hover:bg-white/5 rounded p-1 transition group"
            style={{ left: icon.x, top: icon.y }}
            onDoubleClick={() => openWindow(icon.id, icon.label, icon.width, icon.height)}>
            <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{icon.icon}</div>
            <span className="text-white/80 text-[10px] text-center">{icon.label}</span>
          </div>
        ))}
      </div>

      {/* Windows */}
      {Object.values(windows).filter(w => w.visible).map(win => (
        <div key={win.id}
          className="fixed bg-[#1a1f2e] rounded-xl border border-white/20 flex flex-col shadow-2xl"
          style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex }}
          onMouseDown={() => focusWindow(win.id)}>
          {/* Title bar — drag handle */}
          <div
            className="h-9 bg-[#14192a] rounded-t-xl flex items-center px-3 gap-2 border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={(e) => onTitleBarMouseDown(e, win.id)}>
            <button onClick={() => closeWindow(win.id)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition" />
            <button className="w-3 h-3 rounded-full bg-yellow-500" />
            <button className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-white/50 text-xs ml-2">{win.title}</span>
          </div>
          <div className="flex-1 overflow-auto">{renderWindowContent(win.id)}</div>
        </div>
      ))}

      {/* Dock */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-2xl px-3 py-2 flex gap-2 border border-white/20 z-50">
        {dockIcons.map(icon => (
          <div key={icon.id} onClick={icon.action}
            className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl cursor-pointer hover:scale-110 hover:bg-white/10 transition-all duration-200 relative group">
            {icon.icon}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">{icon.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
