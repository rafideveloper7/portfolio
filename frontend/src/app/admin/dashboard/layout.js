// frontend/src/app/admin/dashboard/layout.js
'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiUser, FiFolder, FiCode, FiMessageSquare, FiLogOut, FiImage, FiMusic, FiMonitor, FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { href: '/admin/dashboard',           label: 'Dashboard', icon: FiHome },
  { href: '/admin/dashboard/bio',       label: 'Bio',       icon: FiUser },
  { href: '/admin/dashboard/projects',  label: 'Projects',  icon: FiFolder },
  { href: '/admin/dashboard/skills',    label: 'Skills',    icon: FiCode },
  { href: '/admin/dashboard/gallery',   label: 'Gallery',   icon: FiImage },
  { href: '/admin/dashboard/music',     label: 'Music',     icon: FiMusic },
  { href: '/admin/dashboard/wallpaper', label: 'Wallpaper', icon: FiMonitor },
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
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-gray-700">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition w-full">
          <FiLogOut size={15} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 bg-gray-800 border-r border-gray-700 flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-white font-bold">RafiOS Admin</h1>
          <p className="text-gray-400 text-xs mt-0.5">Dashboard</p>
        </div>
        <NavLinks onNavigate={() => {}} />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 z-50">
        <h1 className="text-white font-bold text-sm">RafiOS Admin</h1>
        <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-white p-1">
          <FiMenu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-56 bg-gray-800 flex flex-col h-full shadow-2xl">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h1 className="text-white font-bold">RafiOS Admin</h1>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white"><FiX size={18} /></button>
            </div>
            <NavLinks onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-12 min-w-0">
        {children}
      </main>
    </div>
  );
}
