// frontend/src/app/admin/dashboard/layout.js
'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiUser, FiFolder, FiCode, FiMessageSquare, FiLogOut, FiImage, FiMusic, FiMonitor, FiMenu, FiX, FiFileText } from 'react-icons/fi';

const navItems = [
  { href: '/admin/dashboard',           label: 'Dashboard', icon: FiHome },
  { href: '/admin/dashboard/bio',       label: 'Bio',       icon: FiUser },
  { href: '/admin/dashboard/projects',  label: 'Projects',  icon: FiFolder },
  { href: '/admin/dashboard/skills',    label: 'Skills',    icon: FiCode },
  { href: '/admin/dashboard/gallery',   label: 'Gallery',   icon: FiImage },
  { href: '/admin/dashboard/music',     label: 'Music',     icon: FiMusic },
  { href: '/admin/dashboard/wallpaper', label: 'Wallpaper', icon: FiMonitor },
  { href: '/admin/dashboard/cv',        label: 'CV',        icon: FiFileText },
  { href: '/admin/dashboard/messages',  label: 'Messages',  icon: FiMessageSquare },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const NavLinks = ({ onNavigate }) => (
    <>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onNavigate}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                active 
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/5' 
                  : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'
              }`}>
              <Icon size={16} className={active ? 'text-blue-400' : 'text-gray-400'} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all duration-200 w-full">
          <FiLogOut size={16} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0d12] via-[#121420] to-[#0a0a0f] flex relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-black/30 border-r border-white/10 flex-col shrink-0 backdrop-blur-xl z-20">
        <div className="p-5 border-b border-white/10">
          <h1 className="text-white font-bold tracking-tight text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">RafiOS</h1>
          <p className="text-blue-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5 font-mono">Control Panel</p>
        </div>
        <NavLinks onNavigate={() => {}} />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-black/40 border-b border-white/10 backdrop-blur-xl flex items-center justify-between px-4 z-40">
        <div>
          <h1 className="text-white font-bold text-sm">RafiOS</h1>
          <p className="text-blue-400 text-[8px] font-semibold uppercase tracking-wider font-mono">Control Panel</p>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-white p-1.5 bg-white/5 border border-white/10 rounded-lg">
          <FiMenu size={18} />
        </button>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-60 bg-gray-950/95 border-r border-white/10 flex flex-col h-full shadow-2xl backdrop-blur-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h1 className="text-white font-bold">RafiOS</h1>
                <p className="text-blue-400 text-[8px] font-semibold uppercase tracking-wider font-mono">Control Panel</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white p-1 bg-white/5 border border-white/10 rounded-lg"><FiX size={16} /></button>
            </div>
            <NavLinks onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14 min-w-0 z-10">
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
