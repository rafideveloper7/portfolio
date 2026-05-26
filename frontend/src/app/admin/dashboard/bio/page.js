// frontend/src/app/admin/dashboard/bio/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function BioPage() {
  const [bio, setBio] = useState({
    name: '', title: '', location: '', email: '', bio: '', github: '', linkedin: '', twitter: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/bio`)
      .then(res => { setBio(res.data || {}); setLoading(false); })
      .catch(() => { toast.error('Failed to load bio'); setLoading(false); });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API}/api/bio`, bio, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Bio updated');
    } catch {
      toast.error('Failed to save bio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-6">Edit Bio</h2>
      <form onSubmit={handleSave} className="space-y-4">
        {[
          { key: 'name', label: 'Name' },
          { key: 'title', label: 'Title' },
          { key: 'location', label: 'Location' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'github', label: 'GitHub URL' },
          { key: 'linkedin', label: 'LinkedIn URL' },
          { key: 'twitter', label: 'Twitter URL' },
        ].map(({ key, label, type }) => (
          <div key={key}>
            <label className="block text-sm text-gray-300 mb-1">{label}</label>
            <input
              type={type || 'text'}
              value={bio[key] || ''}
              onChange={e => setBio({ ...bio, [key]: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Bio / About</label>
          <textarea
            rows={5}
            value={bio.bio || ''}
            onChange={e => setBio({ ...bio, bio: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Bio'}
        </button>
      </form>
    </div>
  );
}
