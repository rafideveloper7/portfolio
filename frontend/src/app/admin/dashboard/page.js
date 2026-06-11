// frontend/src/app/admin/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { FiFolder, FiCode, FiMessageSquare, FiUser, FiImage, FiMusic, FiMonitor, FiFileText, FiActivity } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  const router = useRouter();
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = () => localStorage.getItem('adminToken');

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin/login'); return; }
    const token = localStorage.getItem('adminToken');
    axios.get(`${API}/api/contact/messages`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setMessageCount((res.data || []).length); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Bio',          icon: FiUser,      desc: 'Profile & photo',        href: '/admin/dashboard/bio',       color: 'from-blue-500 to-cyan-500' },
    { label: 'Projects',     icon: FiFolder,    desc: 'Portfolio showcase',     href: '/admin/dashboard/projects',  color: 'from-green-500 to-emerald-500' },
    { label: 'Skills',       icon: FiCode,      desc: 'Tech stack & levels',    href: '/admin/dashboard/skills',    color: 'from-purple-500 to-violet-500' },
    { label: 'Gallery',      icon: FiImage,     desc: 'Media showcase',         href: '/admin/dashboard/gallery',   color: 'from-pink-500 to-rose-500' },
    { label: 'Music',        icon: FiMusic,     desc: 'Background playlists',   href: '/admin/dashboard/music',     color: 'from-amber-500 to-orange-500' },
    { label: 'Messages',     icon: FiMessageSquare, desc: 'Contact inquiries',   href: '/admin/dashboard/messages',  color: 'from-teal-500 to-green-500' },
    { label: 'Wallpaper',    icon: FiMonitor,   desc: 'Desktop & mobile bg',    href: '/admin/dashboard/wallpaper', color: 'from-indigo-500 to-blue-500' },
    { label: 'CV',           icon: FiFileText,  desc: 'Resume uploads',         href: '/admin/dashboard/cv',        color: 'from-red-500 to-pink-500' },
  ];

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Admin Dashboard</p>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">Welcome back, <span className="text-blue-400">Rafi</span></h1>
          <p className="text-gray-400 text-sm mt-1">Manage your personal brand identity.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl px-4 py-2">
          <FiActivity className="text-blue-400 animate-pulse" />
          <span className="text-blue-400 text-xs font-semibold">System Active</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Messages', value: messageCount, color: 'text-blue-400' },
          { label: 'Projects', value: '—', color: 'text-green-400' },
          { label: 'Songs', value: '—', color: 'text-purple-400' },
          { label: 'Gallery', value: '—', color: 'text-pink-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:border-white/20 transition-all duration-200">
            <p className={`text-3xl font-extrabold font-mono ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Management grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, icon: Icon, desc, href, color }) => (
          <Link key={label} href={href}
            className="group relative bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 backdrop-blur-xl hover:-translate-y-1 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
            <div className="relative z-10">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg shadow-black/30 group-hover:scale-110 transition-transform`}>
                <Icon className="text-white" size={20} />
              </div>
              <p className="text-white font-bold text-sm tracking-tight">{label}</p>
              <p className="text-gray-400 text-xs mt-1 leading-normal">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
