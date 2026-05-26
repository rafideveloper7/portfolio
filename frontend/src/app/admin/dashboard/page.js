// frontend/src/app/admin/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FiUser, FiFolder, FiCode, FiMessageSquare } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  const [stats, setStats] = useState({ projects: 0, skills: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    Promise.all([
      axios.get(`${API}/api/projects`).catch(() => ({ data: [] })),
      axios.get(`${API}/api/skills`).catch(() => ({ data: [] })),
      axios.get(`${API}/api/contact/messages`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
    ]).then(([projects, skills, messages]) => {
      setStats({
        projects: projects.data?.length || 0,
        skills: skills.data?.length || 0,
        messages: messages.data?.length || 0,
      });
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Projects', value: stats.projects, icon: FiFolder, href: '/admin/dashboard/projects', color: 'text-green-400' },
    { label: 'Skill Categories', value: stats.skills, icon: FiCode, href: '/admin/dashboard/skills', color: 'text-purple-400' },
    { label: 'Messages', value: stats.messages, icon: FiMessageSquare, href: '/admin/dashboard/messages', color: 'text-yellow-400' },
    { label: 'Bio', value: '—', icon: FiUser, href: '/admin/dashboard/bio', color: 'text-blue-400' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-8">Welcome back, Admin.</p>

      {loading ? (
        <div className="text-gray-400">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, href, color }) => (
            <Link
              key={label}
              href={href}
              className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-500 transition group"
            >
              <div className={`${color} mb-3`}><Icon size={22} /></div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition">{label}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
