// frontend/src/app/admin/dashboard/skills/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SkillsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('adminToken');

  useEffect(() => {
    axios.get(`${API}/api/skills`)
      .then(res => { setCategories(res.data || []); setLoading(false); })
      .catch(() => { toast.error('Failed to load skills'); setLoading(false); });
  }, []);

  const addCategory = () => {
    setCategories([...categories, { category: '', skills: [{ name: '', percentage: 80 }], tools: [] }]);
  };

  const removeCategory = (i) => {
    setCategories(categories.filter((_, idx) => idx !== i));
  };

  const updateCategory = (i, field, value) => {
    const updated = [...categories];
    updated[i] = { ...updated[i], [field]: value };
    setCategories(updated);
  };

  const addSkill = (catIdx) => {
    const updated = [...categories];
    updated[catIdx].skills = [...(updated[catIdx].skills || []), { name: '', percentage: 80 }];
    setCategories(updated);
  };

  const removeSkill = (catIdx, skillIdx) => {
    const updated = [...categories];
    updated[catIdx].skills = updated[catIdx].skills.filter((_, i) => i !== skillIdx);
    setCategories(updated);
  };

  const updateSkill = (catIdx, skillIdx, field, value) => {
    const updated = [...categories];
    updated[catIdx].skills[skillIdx] = { ...updated[catIdx].skills[skillIdx], [field]: value };
    setCategories(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/api/skills`, categories, { headers: { Authorization: `Bearer ${token()}` } });
      toast.success('Skills saved');
    } catch {
      toast.error('Failed to save skills');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">Skills & Technologies</h2>
          <p className="text-gray-400 text-sm mt-1">Manage your stack categories, proficiency, and tools.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addCategory}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold border border-white/10 transition-all duration-200"
          >
            <FiPlus size={14} /> Add Category
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 transition-all duration-200 disabled:opacity-50"
          >
            <FiSave size={14} /> {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:border-white/15 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <input
                type="text"
                placeholder="Category name (e.g. Frontend)"
                value={cat.category || ''}
                onChange={e => updateCategory(catIdx, 'category', e.target.value)}
                className="flex-1 px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm font-semibold focus:border-blue-500 focus:outline-none transition"
              />
              <button onClick={() => removeCategory(catIdx)} className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition">
                <FiTrash2 size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {(cat.skills || []).map((skill, skillIdx) => (
                <div key={skillIdx} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                  <input
                    type="text"
                    placeholder="Skill name (e.g. React)"
                    value={skill.name || ''}
                    onChange={e => updateSkill(catIdx, skillIdx, 'name', e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={skill.percentage || 0}
                    onChange={e => updateSkill(catIdx, skillIdx, 'percentage', Number(e.target.value))}
                    className="w-20 px-3.5 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm font-mono text-center focus:border-blue-500 focus:outline-none transition"
                  />
                  <span className="text-gray-400 text-xs font-semibold w-6">%</span>
                  <button onClick={() => removeSkill(catIdx, skillIdx)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => addSkill(catIdx)}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
              >
                <FiPlus size={14} /> Add Skill
              </button>
            </div>

            <div className="mt-5 border-t border-white/5 pt-4">
              <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Tools & Libraries (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. VS Code, Git, Docker"
                value={Array.isArray(cat.tools) ? cat.tools.join(', ') : (cat.tools || '')}
                onChange={e => updateCategory(catIdx, 'tools', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-16 bg-white/5 border border-white/10 border-dashed rounded-2xl">
            <p className="text-gray-400 text-sm">No skill categories yet. Click "Add Category" to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}
