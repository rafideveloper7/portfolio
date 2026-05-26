// frontend/src/app/admin/login/page.js
'use client';
import { useState } from 'react';
import { FiUser } from 'react-icons/fi';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, formData);
      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        toast.success('Login successful');
        router.push('/admin/dashboard');
      } else {
        toast.error(res.data.error || 'Login failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Admin Login</h2>
          <p className="text-gray-400">Sign in to access the dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition"
              required
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition"
              required
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full"></span>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <FiUser size={16} />
                <span>Login</span>
              </>
            )}
          </button>
          <p className="text-center text-gray-500 text-sm">
            username <code className="text-blue-400">admin</code> / password <code className="text-blue-400">rafideveloper7</code>
          </p>
        </form>
      </div>
    </div>
  );
}