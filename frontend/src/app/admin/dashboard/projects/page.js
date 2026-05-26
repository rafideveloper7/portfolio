// frontend/src/app/admin/dashboard/projects/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheck } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;
const empty = { title: '', description: '', stack: '', tags: '', liveUrl: '', githubUrl: '', featured: false };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('adminToken');

  const load = () => {
    axios.get(`${API}/api/projects`)
      .then(res => { setProjects(res.data || []); setLoading(false); })
      .catch(() => { toast.error('Failed to load projects'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const body = new FormData();
      body.append('data', JSON.stringify(payload));

      if (editId) {
        await axios.put(`${API}/api/projects/${editId}`, body, { headers: { Authorization: `Bearer ${token()}` } });
        toast.success('Project updated');
      } else {
        await axios.post(`${API}/api/projects`, body, { headers: { Authorization: `Bearer ${token()}` } });
        toast.success('Project added');
      }
      setForm(empty); setEditId(null); setShowForm(false); load();
    } catch {
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setForm({ ...p, tags: Array.isArray(p.tags) ? p.tags.join(', ') : '' });
    setEditId(p._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await axios.delete(`${API}/api/projects/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      toast.success('Deleted'); load();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Projects</h2>
        <button
          onClick={() => { setForm(empty); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
        >
          <FiPlus size={14} /> Add Project
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{editId ? 'Edit Project' : 'New Project'}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><FiX /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {[
              { key: 'title', label: 'Title', full: true },
              { key: 'stack', label: 'Tech Stack' },
              { key: 'tags', label: 'Tags (comma separated)' },
              { key: 'liveUrl', label: 'Live URL' },
              { key: 'githubUrl', label: 'GitHub URL' },
            ].map(({ key, label, full }) => (
              <div key={key} className={full ? 'col-span-2' : ''}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key] || ''}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured || false}
                  onChange={e => setForm({ ...form, featured: e.target.checked })}
                  className="accent-blue-500"
                />
                Featured
              </label>
              <button
                type="submit"
                disabled={saving}
                className="ml-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : editId ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {projects.length === 0 && <p className="text-gray-500 text-sm">No projects yet.</p>}
        {projects.map(p => (
          <div key={p._id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-medium">{p.title}</h3>
                {p.featured && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Featured</span>}
              </div>
              <p className="text-xs text-blue-400 mt-0.5">{p.stack}</p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"><FiEdit2 size={14} /></button>
              <button onClick={() => handleDelete(p._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition"><FiTrash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
