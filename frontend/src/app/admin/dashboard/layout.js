// frontend/src/app/admin/dashboard/layout.js
'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiUser, FiFolder, FiCode, FiMessageSquare, FiLogOut, FiImage, FiMusic, FiMonitor } from 'react-icons/fi';

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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-white font-bold text-lg">RafiOS Admin</h1>
          <p className="text-gray-400 text-xs mt-0.5">Dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition w-full"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
