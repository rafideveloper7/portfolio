"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BiLogoTiktok } from "react-icons/bi";
import {
  FiUser,
  FiSend,
  FiChevronLeft,
  FiDownload,
  FiX,
  FiBriefcase,
  FiCpu,
  FiTerminal,
  FiMail,
  FiFolder,
  FiMusic,
  FiFileText,
  FiFacebook,
  FiInstagram,
  FiGithub,
  FiLinkedin,
  FiMenu


} from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios"; // Fixed: Corrected import from 'ajax' to 'axios'
import Gallery from "../components/Gallery";
import MusicPlayer from "../components/MusicPlayer";

const API = process.env.NEXT_PUBLIC_API_URL;
const FORMSUBMIT = "https://formsubmit.co/ajax/rafideveloper7@gmail.com";

const GRADIENT_MAP = {
  "gradient-default":
    "bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900",
  "gradient-purple":
    "bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900",
  "gradient-green":
    "bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900",
  "gradient-red": "bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900",
  "gradient-dark": "bg-gradient-to-br from-gray-950 to-gray-900",
  "gradient-ocean":
    "bg-gradient-to-br from-gray-900 via-cyan-900/25 to-gray-900",
  "gradient-sunset":
    "bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900",
  "gradient-galaxy":
    "bg-gradient-to-br from-indigo-950 via-purple-900/40 to-gray-950",
};

const apps = [
  // --- EXTERNAL SOCIAL MEDIA ACCELERATORS ---
  {
    id: "linkedin",
    label: "LinkedIn",
    name: "LinkedIn",
    icon: <FiLinkedin className="w-5 h-5 text-white" />,
    isExternal: true,
    url: "https://linkedin.com/in/your-username", // Replace with your links
    color: "text-blue-500 hover:text-blue-400",
  },
  {
    id: "github",
    label: "GitHub",
    name: "GitHub",
    icon: <FiGithub className="w-5 h-5 text-white" />,
    isExternal: true,
    url: "https://github.com/your-username",
    color: "text-slate-200 hover:text-white",
  },
  {
    id: "instagram",
    label: "Instagram",
    name: "Instagram",
    icon: <FiInstagram className="w-5 h-5 text-white" />,
    isExternal: true,
    url: "https://instagram.com/your-username",
    color: "text-pink-500 hover:text-pink-400",
  },
  {
    id: "tiktok",
    name: "TikTok",
    label: "TikTok",
    icon: <BiLogoTiktok className="w-5 h-5 text-white" />,
    isExternal: true,
    url: "https://tiktok.com/@your-username",
    color: "text-cyan-400 hover:text-cyan-300",
  },
  {
    label: "Facebook",
    id: "facebook",
    name: "Facebook",
    icon: <FiFacebook className="w-5 h-5 text-white" />,
    isExternal: true,
    url: "https://facebook.com/your-username",
    color: "text-blue-600 hover:text-blue-500",
  },
  {
    id: "about",
    label: "About Me",
    icon: <FiUser className="w-5 h-5 text-white" />,
    // color: "from-green-300 to-green-700",
    width: 520,
    height: 500,
    dock: false,
  },
  {
    id: "projects",
    label: "Projects",
    icon: <FiBriefcase className="w-5 h-5 text-white" />,
    color: "from-emerald-500 to-teal-700",
    width: 640,
    height: 550,
    dock: false,
  },
  {
    id: "skills",
    label: "Skills",
    icon: <FiCpu className="w-5 h-5 text-white" />,
    color: "from-amber-500 to-orange-600",
    width: 540,
    height: 500,
    dock: false,
  },
  {
    id: "terminal",
    label: "Terminal",
    icon: <FiTerminal className="w-5 h-5 text-emerald-400" />,
    color: "from-zinc-800 to-gray-950",
    width: 600,
    height: 420,
    dock: false,
  },
  {
    id: "contact",
    label: "Contact",
    icon: <FiMail className="w-5 h-5 text-white" />,
    color: "from-rose-500 to-pink-700",
    width: 500,
    height: 520,
    dock: false,
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: <FiFolder className="w-5 h-5 text-white" />,
    color: "from-violet-500 to-purple-700",
    width: 640,
    height: 520,
    dock: false,
  },
  {
    id: "music",
    label: "Music",
    icon: <FiMusic className="w-5 h-5 text-white" />,
    color: "from-pink-500 to-rose-600",
    width: 540,
    height: 500,
    dock: false,
  },
  {
    id: "cv",
    label: "CV",
    icon: <FiFileText className="w-5 h-5 text-white" />,
    color: "from-indigo-500 to-indigo-700",
    width: 680,
    height: 680,
    dock: false,
  },

];

const statusMessages = [
  "👋 Welcome! I'm Rafi Ullah — a Full Stack Developer.",
  "🚀 I build beautiful, functional, scalable apps.",
  "☁️ Full Stack: MERN, Next.js, Node.js, Express, MongoDB.",
  "⚡ Passionate about clean code & modern UI/UX design.",
  "💡 Let's build something amazing together!",
];

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [windows, setWindows] = useState({});
  const [bio, setBio] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [cvs, setCvs] = useState([]);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [zIndex, setZIndex] = useState(10);
  const [time, setTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [wallpaper, setWallpaper] = useState({
    type: "gradient",
    value: "gradient-default",
  });
  const [mobileWallpaper, setMobileWallpaper] = useState({
    type: "gradient",
    value: "gradient-galaxy",
  });
  const [isMobile, setIsMobile] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  const [statusMsg, setStatusMsg] = useState(statusMessages[0]);
  const [activeCvIdx, setActiveCvIdx] = useState(0);
  const [stats, setStats] = useState({
    projects: 0,
    hours: 2400,
    clients: 12,
    experience: 4,
  });
  const dragRef = useRef(null);

  const API_BASE = API || "http://localhost:5001";

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    fetchData();
    createStars();
    updateClock();
    const cycleCleanup = cycleStatus();
    const t = setInterval(updateClock, 1000);
    return () => {
      clearInterval(t);
      cycleCleanup();
      window.removeEventListener("resize", check);
    };
  }, []);

  const cycleStatus = () => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % statusMessages.length;
      setStatusMsg(statusMessages[idx]);
    }, 5000);
    return () => clearInterval(interval);
  };

  const updateClock = () => {
    const now = new Date();
    setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setCurrentDate(
      now.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    );
  };

  const fetchData = async () => {
    try {
      const [bioRes, projRes, skillRes, settRes, cvRes] = await Promise.all([
        axios.get(`${API_BASE}/api/bio`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/api/projects`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/skills`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/settings`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/api/cv/list`).catch(() => ({ data: [] })),
      ]);
      setBio(
        bioRes.data || {
          name: "Rafi Ullah",
          title: "Full Stack Developer",
          location: "Kohat, Pakistan",
          email: "rafideveloper7@gmail.com",
        },
      );
      setProjects(projRes.data || []);
      setSkills(skillRes.data || []);
      setStats((s) => ({
        ...s,
        projects: (projRes.data || []).length,
        experience: bioRes.data?.experience || 4,
      }));
      setCvs(cvRes.data || []);
      if (settRes.data) {
        setWallpaper({
          type: settRes.data.wallpaperType || "gradient",
          value: settRes.data.wallpaperValue || "gradient-default",
        });
        setMobileWallpaper({
          type: settRes.data.mobileWallpaperType || "gradient",
          value: settRes.data.mobileWallpaperValue || "gradient-galaxy",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createStars = () => {
    const c = document.getElementById("stars");
    if (!c) return;
    c.innerHTML = "";
    const count = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 25
      : 60;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      s.className = "star";
      const size = Math.random() * 2 + 1;
      s.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:white;border-radius:50%;left:${Math.random() * 100}%;top:${Math.random() * 100}%;opacity:${Math.random() * 0.3 + 0.1};animation:twinkle ${Math.random() * 4 + 2}s infinite alternate;`;
      c.appendChild(s);
    }
  };

  const getBgStyle = (wp) => {
    if (wp.type === "image" && wp.value)
      return {
        backgroundImage: `url(${wp.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    if (wp.type === "color" && wp.value) return { backgroundColor: wp.value };
    return {};
  };

  const getBgClass = (wp) =>
    wp.type === "gradient"
      ? GRADIENT_MAP[wp.value] || GRADIENT_MAP["gradient-default"]
      : "";

  const handleAppLaunch = (app) => {
    if (isMobile) {
      setActiveApp(app.id);
    } else {
      const newZ = zIndex + 1;
      setZIndex(newZ);
      setWindows((prev) => ({
        ...prev,
        [app.id]: {
          id: app.id,
          title: app.label,
          visible: true,
          zIndex: newZ,
          x: Math.max(20, ((window.innerWidth - app.width) / 2) | 0),
          y: Math.max(60, ((window.innerHeight - app.height) / 2.5) | 0),
          width: Math.min(app.width, window.innerWidth - 40),
          height: Math.min(app.height, window.innerHeight - 120),
        },
      }));
    }
  };

  const closeWindow = (id) => {
    if (isMobile) {
      setActiveApp(null);
    } else {
      setWindows((p) => ({ ...p, [id]: { ...p[id], visible: false } }));
    }
  };

  const focusWindow = (id) => {
    const z = zIndex + 1;
    setZIndex(z);
    setWindows((p) => ({ ...p, [id]: { ...p[id], zIndex: z } }));
  };

  const startDrag = useCallback(
    (cx, cy, id) => {
      setWindows((prev) => {
        const win = prev[id];
        if (!win) return prev;
        dragRef.current = {
          id,
          startX: cx,
          startY: cy,
          origX: win.x,
          origY: win.y,
          winW: win.width,
          winH: win.height,
        };
        return { ...prev, [id]: { ...win, zIndex: zIndex + 1 } };
      });
      setZIndex((z) => z + 1);

      const move = (x, y) => {
        if (!dragRef.current) return;
        const {
          id: wid,
          startX,
          startY,
          origX,
          origY,
          winW,
          winH,
        } = dragRef.current;
        setWindows((p) => {
          if (!p[wid]) return p;
          return {
            ...p,
            [wid]: {
              ...p[wid],
              x: Math.max(
                0,
                Math.min(window.innerWidth - winW, origX + x - startX),
              ),
              y: Math.max(
                40,
                Math.min(window.innerHeight - 48, origY + y - startY),
              ),
            },
          };
        });
      };
      const mm = (e) => move(e.clientX, e.clientY);
      const tm = (e) => {
        e.preventDefault();
        move(e.touches[0].clientX, e.touches[0].clientY);
      };
      const stop = () => {
        dragRef.current = null;
        window.removeEventListener("mousemove", mm);
        window.removeEventListener("mouseup", stop);
        window.removeEventListener("touchmove", tm);
        window.removeEventListener("touchend", stop);
      };
      window.addEventListener("mousemove", mm);
      window.addEventListener("mouseup", stop);
      window.addEventListener("touchmove", tm, { passive: false });
      window.addEventListener("touchend", stop);
    },
    [zIndex],
  );

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API_BASE}/api/contact`, formData);
      const res = await fetch(FORMSUBMIT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.message === "error" || !res.ok)
        throw new Error("FormSubmit error");
      toast.success("Message parameters pushed successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
      closeWindow("contact");
      setActiveApp(null);
    } catch {
      toast.error("Pipeline blocked. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleTerminalCommand = (e) => {
    if (e.key !== "Enter") return;
    const cmd = terminalInput.toLowerCase().trim();
    let out = "";
    if (cmd === "help")
      out = "whoami · skills · projects · contact · open admin · clear";
    else if (cmd === "whoami")
      out = `${bio?.name} — ${bio?.title}\n📍 ${bio?.location}\n📧 ${bio?.email}`;
    else if (cmd === "skills")
      out =
        skills
          .map(
            (s) =>
              `📌 ${s.category}: ${s.skills.map((sk) => sk.name).join(", ")}`,
          )
          .join("\n") || "No skills mapped.";
    else if (cmd === "projects")
      out =
        projects.map((p) => `📁 ${p.title} — ${p.stack}`).join("\n") ||
        "No localized data clusters.";
    else if (cmd === "contact")
      out = `📧 ${bio?.email}\n🐙 github.com/rafideveloper7`;
    else if (cmd === "open admin") {
      router.push("/admin/login");
      out = "Redirecting execution node...";
    } else if (cmd === "clear") {
      setTerminalOutput([]);
      setTerminalInput("");
      return;
    } else if (cmd)
      out = `Command not recognized: '${cmd}'. Type 'help' for schema mapping.`;

    if (out)
      setTerminalOutput((p) => [...p, { command: terminalInput, output: out }]);
    setTerminalInput("");
  };

  const fmt = (url) =>
    (url || "")
      .split("/")
      .pop()
      .split("?")[0]
      .replace(/\.pdf$/i, "")
      .replace(/^v\d+\//, "");

  const renderContent = (id) => {
    if (id === "about") {
      return (
        <div className="h-full overflow-y-auto bg-slate-950/60 text-slate-100 custom-scrollbar p-5 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-900/50 p-5 rounded-2xl border border-white/5">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-40 animate-pulse" />
              {bio?.image ? (
                <img
                  src={bio.image}
                  alt={bio?.name}
                  className="relative w-20 h-20 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="relative w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-2xl border border-white/10">
                  <FiUser />
                </div>
              )}
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h2 className="text-xl font-bold tracking-tight text-white truncate">
                {bio?.name || "Rafi Ullah"}
              </h2>
              <p className="text-xs text-cyan-400 font-mono tracking-wider mt-0.5">
                {bio?.title || "Full Stack Developer"}
              </p>
              <p className="text-xs text-slate-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />{" "}
                {bio?.location || "Kohat, Pakistan"}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/30 p-4 rounded-2xl border border-white/5 text-sm text-slate-300 leading-relaxed">
            {bio?.bio ||
              "Full Stack Developer passionate about clean structures, custom execution pipelines, and robust responsive designs."}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Experience",
                value: `${stats.experience} Yrs`,
                text: "text-blue-400",
              },
              {
                label: "Projects",
                value: stats.projects,
                text: "text-emerald-400",
              },
              {
                label: "Clients",
                value: stats.clients,
                text: "text-purple-400",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center"
              >
                <p className={`text-base font-bold font-mono ${s.text}`}>
                  {s.value}
                </p>
                <p className="text-[10px] text-slate-500 uppercase mt-0.5 tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                label: "Primary Route",
                value: bio?.email,
                link: `mailto:${bio?.email}`,
              },
              {
                label: "Network Matrix",
                value: "LinkedIn Profile",
                link: bio?.linkedin,
              },
              {
                label: "Code Cluster",
                value: "GitHub Engine",
                link: bio?.github,
              },
            ]
              .filter((f) => f.link)
              .map((network, index) => (
                <a
                  key={index}
                  href={network.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl p-3 text-xs text-slate-300 transition-colors"
                >
                  <span className="text-slate-500 font-medium">
                    {network.label}
                  </span>
                  <span className="text-blue-400 font-mono text-[11px] truncate max-w-[60%]">
                    {network.value}
                  </span>
                </a>
              ))}
          </div>
        </div>
      );
    }

    if (id === "projects") {
      return (
        <div className="p-4 space-y-4 overflow-y-auto h-full bg-slate-950/40 custom-scrollbar">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-mono text-xs">
              <FiBriefcase className="text-2xl mb-2 text-slate-600" />{" "}
              [EMPTY_CLUSTER_REGISTRY]
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p, i) => (
                <div
                  key={p._id || i}
                  className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-blue-500/30 transition-colors"
                >
                  {p.image && (
                    <div className="h-36 bg-slate-950 relative overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-white text-sm tracking-tight">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                    <div>
                      {p.stack && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {p.stack.split(",").map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono bg-white/5 text-slate-400 px-2 py-0.5 rounded border border-white/5"
                            >
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold pt-2 border-t border-white/5">
                        {p.liveLink && (
                          <a
                            href={p.liveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded-lg transition-colors"
                          >
                            Live Demo
                          </a>
                        )}
                        {p.githubLink && (
                          <a
                            href={p.githubLink}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white/5 hover:bg-white/10 text-slate-300 py-1.5 rounded-lg transition-colors border border-white/5"
                          >
                            Source
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (id === "skills") {
      return (
        <div className="p-4 space-y-4 overflow-y-auto h-full bg-slate-950/40 custom-scrollbar">
          {skills.length === 0 ? (
            <div className="text-center text-slate-600 py-20 font-mono text-xs">
              [INDEX_NOT_MAPPED]
            </div>
          ) : (
            skills.map((cat, i) => (
              <div
                key={i}
                className="bg-slate-900/40 border border-white/5 rounded-2xl p-4"
              >
                <p className="text-cyan-400 text-[10px] font-mono uppercase tracking-widest border-b border-white/5 pb-1.5 mb-3">
                  // {cat.category}
                </p>
                <div className="space-y-3">
                  {(cat.skills || []).map((sk, j) => (
                    <div key={j}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">
                          {sk.name}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {sk.percentage}%
                        </span>
                      </div>
                      <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${sk.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    if (id === "terminal") {
      return (
        <div className="bg-slate-950 h-full flex flex-col font-mono text-slate-300">
          <div className="flex items-center justify-between px-4 h-9 bg-slate-900/60 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider select-none shrink-0">
            <span>Terminal Kernel Instance</span>
            <span className="text-emerald-500">Online</span>
          </div>
          <div className="flex-1 p-4 text-xs overflow-y-auto space-y-3 custom-scrollbar">
            <p className="text-slate-500">
              System initialization complete. Type{" "}
              <span className="text-cyan-400 font-bold">help</span> to scan
              layout instructions.
            </p>
            {terminalOutput.map((item, i) => (
              <div key={i} className="space-y-1">
                <p className="text-blue-400 font-bold">
                  <span className="text-slate-600">❯</span> {item.command}
                </p>
                <p className="text-slate-400 whitespace-pre-wrap pl-3 border-l border-slate-800 text-[11px]">
                  {item.output}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 p-2 bg-slate-900/20 flex items-center gap-2 shrink-0">
            <span className="text-cyan-400 ml-1">❯</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={handleTerminalCommand}
              className="flex-1 bg-transparent border-none outline-none text-white text-xs font-mono"
              placeholder="Enter routine task..."
              autoFocus
            />
          </div>
        </div>
      );
    }

    if (id === "contact") {
      return (
        <div className="p-5 overflow-y-auto h-full bg-slate-950/40 custom-scrollbar flex flex-col justify-center">
          <form
            onSubmit={handleContactSubmit}
            className="space-y-3 max-w-sm mx-auto w-full"
          >
            <div className="text-center mb-4">
              <h3 className="text-white font-bold text-base">
                Direct Pipeline Link
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Populate parameters to transmit mail payload directly.
              </p>
            </div>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs outline-none focus:border-blue-500/50 transition-colors"
              required
            />
            <input
              type="email"
              placeholder="Email Cluster"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs outline-none focus:border-blue-500/50 transition-colors"
              required
            />
            <input
              type="text"
              placeholder="Subject Token"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs outline-none focus:border-blue-500/50 transition-colors"
              required
            />
            <textarea
              placeholder="Message Parameters..."
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs outline-none resize-none focus:border-blue-500/50 transition-colors"
              required
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-40 text-xs tracking-wide uppercase font-mono"
            >
              {sending ? "Streaming..." : "Transmit Payload"}
            </button>
          </form>
        </div>
      );
    }

    if (id === "gallery")
      return (
        <div className="h-full overflow-hidden">
          <Gallery />
        </div>
      );
    if (id === "music")
      return (
        <div className="h-full overflow-hidden">
          <MusicPlayer />
        </div>
      );

    if (id === "cv") {
      return (
        <div className="h-full flex flex-col bg-slate-900/60">
          {/* Top Control Header */}
          <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0 gap-2">
            <select
              onChange={(e) => setActiveCvIdx(Number(e.target.value))}
              value={activeCvIdx}
              className="bg-slate-950 text-white text-xs border border-white/10 rounded-lg p-1.5 outline-none max-w-[55%] truncate"
            >
              {cvs &&
                cvs.map((c, idx) => (
                  <option key={idx} value={idx}>
                    {c.originalName || `CV Entry #${idx + 1}`}
                  </option>
                ))}
            </select>

            {/* Download Link Block */}
            {cvs && cvs[activeCvIdx] && (
              <a
                href={cvs[activeCvIdx].path || cvs[activeCvIdx].fileUrl}
                download={cvs[activeCvIdx].originalName || "Download_CV.pdf"}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <FiDownload size={13} /> Download CV
              </a>
            )}
          </div>

          {/* Browser Default PDF Layout Workspace Viewport */}
          <div className="flex-1 relative bg-slate-950">
            {cvs && cvs[activeCvIdx] ? (
              /* Using the <embed> tag with type="application/pdf" forces Chrome, Edge, 
                and Safari to render their native browser PDF application layout view 
                directly inside the component dimensions.
              */
              <embed
                src={cvs[activeCvIdx].path || cvs[activeCvIdx].fileUrl}
                type="application/pdf"
                className="w-full h-full absolute inset-0 border-none bg-slate-950"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-mono text-xs">
                NO_CV_CONTAINERS_LOADED_
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const currentWp = isMobile ? mobileWallpaper : wallpaper;

  return (
    <div
      className={`fixed inset-0 select-none overflow-hidden transition-all duration-500 ${getBgClass(currentWp)}`}
      style={getBgStyle(currentWp)}
    >
      <div
        id="stars"
        className="absolute inset-0 pointer-events-none z-0 opacity-50"
      />

      {/* ── MOBILE / TABLET VIEW LAYOUT ENGINE (SAMSUNG ONE UI COMPATIBLE) ── */}
      {isMobile ? (
        <div className="w-full h-full flex flex-col justify-between relative px-4 pb-6 pt-2 z-10">
          {/* Top Virtualized Status Indicators */}
          <div className="w-full flex justify-between items-center px-1 text-white/90 font-mono text-[11px] font-bold tracking-wider z-20">
            <span>{time}</span>
            <div className="flex items-center gap-2">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-white/40 rounded-sm p-[1px] flex items-center">
                <div className="w-full h-full bg-white/90 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Home Screen Central Widget Clusters */}
          {!activeApp && (
            <div className="w-full flex flex-col items-center mt-6 text-center animate-fade-in select-none">
              <h1 className="text-4xl font-light text-white tracking-wide drop-shadow-md">
                {time}
              </h1>
              <p className="text-xs text-white/70 font-medium mt-0.5">
                {currentDate}
              </p>
              <div className="mt-3 px-3 py-1 bg-black/20 backdrop-blur-md rounded-full border border-white/5 flex items-center gap-1.5 text-[10px] text-white/90 font-mono">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span>Book a free Meet/Call</span>
              </div>
            </div>
          )}

          {/* Central Context Responsive Grid Layout */}
          {!activeApp && (
            <div className="w-full bg-black/10 backdrop-blur-md border border-white/5 rounded-3xl p-2 grid grid-cols-3 gap-y-5 gap-x-2 my-auto max-h-[auto] overflow-y-auto custom-scrollbar">
              {apps
                .filter((a) => !a.dock)
                .map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleAppLaunch(app)}
                    className="flex flex-col items-center group active:scale-95 transition-transform"
                  >
                    <div
                      className={`w-16 h-16 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${app.color} shadow-lg flex items-center justify-center border border-white/10 group-hover:border-white/20 shadow-black/30`}
                    >
                      {app.icon}
                    </div>
                    <span className="text-[10px] sm:text-xs text-white font-medium mt-1.5 text-center truncate w-full drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">
                      {app.label}
                    </span>
                  </button>
                ))}
            </div>
          )}

          {/* Screen Content Modal Portals */}
          {activeApp && (
            <div className="absolute inset-0 bg-white z-40 flex flex-col animate-slide-up">
              <div className="h-12 border-b border-white/15 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-3 shrink-0">
                <button
                  onClick={() => setActiveApp(null)}
                  className="p-2 text-white text-lg active:opacity-50"
                >
                  <FiChevronLeft />
                </button>
                <span className="text-xs font-bold font-mono tracking-widest uppercase text-white/90">
                  {apps.find((a) => a.id === activeApp)?.label}
                </span>
                <button
                  onClick={() => setActiveApp(null)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden relative">
                {renderContent(activeApp)}
              </div>
            </div>
          )}

          {/* Dynamic Bottom Launch Dock */}
          
            <div className="w-full bg-black/20 backdrop-blur-xl border-white/10 rounded-2xl p-2 grid grid gap-3 shadow-xl max-w-md mx-auto md:hidden">
              <button
                className="flex justify-center items-center active:scale-90 transition-transform" >
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br shadow-md flex items-center justify-center border border-white/10`}
                >
                  <FiMenu className="w-16 h-16 text-white" />
                </div>
              </button>
                
            </div>
          
        </div>
      ) : (
        /* ── WORKSPACE DESKTOP PERFORMANCE PLATFORM LAYOUT ── */
        <div className="w-full h-full relative flex flex-col justify-between p-3 z-10">
          {/* Top Control Core Header Bar */}
          <div className="w-full h-8 bg-black/20 backdrop-blur-md rounded-full border border-white/5 flex items-center justify-between px-5 text-[11px] text-slate-300 z-30 shrink-0 shadow-sm">
            <span className="font-bold text-white tracking-widest font-mono">
              Rafi Ullah
            </span>
            <div className="flex items-center justify-between gap-[260px] max-w-[60%] ">
              <span className="font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-800/20 px-3 py-0.5 rounded-md text-[10px]  truncate max-w-md">
                {statusMsg}
              </span>
              <span className="font-medium text-white/90 font-mono tracking-wide shrink-0">
                {currentDate} · {time}
              </span>
            </div>
          </div>

          {/* Main Bottom Panel - Centered Layout with Two Lines */}
          <div className="flex-1 w-[65vw] m-8 p-4 flex flex-col items-center justify-end gap-6 mx-auto">

            {/* LINE 1: Social Icons (Top Line) */}
            <div className="flex items-center justify-center gap-6">
              {apps
                .filter((app) => app.socialIcon) // Sirf wo apps filter hongi jinki socialIcon maujood hai
                .map((app) => (
                  <a
                    key={`social-${app.id}`}
                    href={app.socialUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center justify-center text-white/90 hover:text-white hover:bg-zinc-800 hover:-translate-y-1 transition-all duration-200 shadow-md shadow-black/20"
                    title={app.label}
                  >
                    <div className="w-5 h-5">
                      {app.socialIcon}
                    </div>
                  </a>
                ))}
            </div>

            {/* LINE 2: App Icons (Bottom Line) */}
            <div className="flex flex-wrap items-center justify-center gap-16">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppLaunch(app)}
                  className="w-22 flex flex-col items-center group transition-transform duration-200 hover:-translate-y-0.5"
                >
                  {/* Main App Container */}
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${app.color} shadow-md flex items-center justify-center border border-white/10 group-hover:scale-105 transition-all duration-200 shadow-black/30`}
                  >
                    {app.icon}
                  </div>

                  {/* App Label */}
                  <span className="text-[10px] text-white/90 font-mono tracking-wide mt-1.5 text-center truncate max-w-full bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/5 shadow-sm">
                    {app.label}
                  </span>
                </button>
              ))}
            </div>

          </div>

          {/* Desktop Multi-Window Task Render Pipeline */}
          {Object.values(windows).map((win) => {
            if (!win.visible) return null;
            return (
              <div
                key={win.id}
                style={{
                  zIndex: win.zIndex,
                  left: win.x,
                  top: win.y,
                  width: win.width,
                  height: win.height,
                }}
                className="absolute bg-slate-950/70 border border-white/10 rounded-xl shadow-2xl flex flex-col backdrop-blur-xl overflow-hidden shadow-black/80 ring-1 ring-white/5"
                onClick={() => focusWindow(win.id)}
              >
                {/* Drag Control Header Node bar */}
                <div
                  onMouseDown={(e) => startDrag(e.clientX, e.clientY, win.id)}
                  onTouchStart={(e) =>
                    startDrag(
                      e.touches[0].clientX,
                      e.touches[0].clientY,
                      win.id,
                    )
                  }
                  className="h-9 border-b border-white/5 bg-slate-900/60 flex items-center justify-between px-3 cursor-move select-none shrink-0"
                >
                  <span className="text-[11px] font-mono font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    {win.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(win.id);
                    }}
                    className="w-5 h-5 rounded-md bg-white/5 hover:bg-rose-600/30 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors border border-white/5"
                  >
                    <FiX size={11} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden relative bg-slate-950/30">
                  {renderContent(win.id)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

