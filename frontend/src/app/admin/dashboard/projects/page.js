// frontend/src/app/admin/dashboard/projects/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheck } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;
const empty = { title: '', description: '', stack: '', tags: '', liveLink: '', githubLink: '', featured: false };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [selectedFile, setSelectedFile] = useState(null);
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
        tags: form.tags ? (Array.isArray(form.tags) ? form.tags : form.tags.split(',').map(t => t.trim()).filter(Boolean)) : [],
      };
      const body = new FormData();
      body.append('data', JSON.stringify(payload));
      if (selectedFile) {
        body.append('image', selectedFile);
      }

      if (editId) {
        await axios.put(`${API}/api/projects/${editId}`, body, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token()}` 
          }
        });
        toast.success('Project updated');
      } else {
        await axios.post(`${API}/api/projects`, body, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token()}` 
          }
        });
        toast.success('Project added');
      }
      setForm(empty); setSelectedFile(null); setEditId(null); setShowForm(false); load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setForm({ ...p, tags: Array.isArray(p.tags) ? p.tags.join(', ') : '' });
    setEditId(p._id);
    setSelectedFile(null);
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
          onClick={() => { setForm(empty); setSelectedFile(null); setEditId(null); setShowForm(false); setTimeout(() => setShowForm(true), 50); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
        >
          <FiPlus size={14} /> Add Project
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold">{editId ? 'Edit Project' : 'New Project'}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white p-1 bg-white/5 border border-white/10 rounded-lg"><FiX /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {[
              { key: 'title', label: 'Title', full: true },
              { key: 'stack', label: 'Tech Stack' },
              { key: 'tags', label: 'Tags (comma separated)' },
              { key: 'liveLink', label: 'Live URL' },
              { key: 'githubLink', label: 'GitHub URL' },
            ].map(({ key, label, full }) => (
              <div key={key} className={full ? 'col-span-2' : ''}>
                <label className="block text-xs text-gray-400 mb-1.5 font-semibold">{label}</label>
                <input
                  type="text"
                  value={form[key] || ''}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Project Image</label>
              <div className="flex items-center gap-4 mt-1">
                {form.image && !selectedFile && (
                  <div className="w-16 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0">
                    <img src={form.image} alt="Current" className="w-full h-full object-cover" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setSelectedFile(e.target.files[0])}
                  className="text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-white/10 file:text-xs file:font-semibold file:bg-white/5 file:text-gray-200 hover:file:bg-white/10 cursor-pointer"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Description</label>
              <textarea
                rows={3}
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
            <div className="col-span-2 flex items-center gap-3 mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={form.featured || false}
                  onChange={e => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 rounded border-white/10 bg-black/40 focus:ring-0"
                />
                Featured Project
              </label>
              <button
                type="submit"
                disabled={saving}
                className="ml-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 transition disabled:opacity-50"
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
          <div key={p._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-white/15 transition-all">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {p.image ? (
                <div className="w-16 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-[10px] text-gray-500 shrink-0 select-none">
                  No Image
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold truncate">{p.title}</h3>
                  {p.featured && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono shrink-0">Featured</span>}
                </div>
                <p className="text-xs text-blue-400 mt-0.5 truncate">{p.stack}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{p.description}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(p)} className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition"><FiEdit2 size={14} /></button>
              <button onClick={() => handleDelete(p._id)} className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition"><FiTrash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
