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
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Skills</h2>
        <div className="flex gap-2">
          <button
            onClick={addCategory}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
          >
            <FiPlus size={14} /> Add Category
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition disabled:opacity-50"
          >
            <FiSave size={14} /> {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                placeholder="Category name (e.g. Frontend)"
                value={cat.category || ''}
                onChange={e => updateCategory(catIdx, 'category', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
              />
              <button onClick={() => removeCategory(catIdx)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition">
                <FiTrash2 size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {(cat.skills || []).map((skill, skillIdx) => (
                <div key={skillIdx} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Skill name"
                    value={skill.name || ''}
                    onChange={e => updateSkill(catIdx, skillIdx, 'name', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={skill.percentage || 0}
                    onChange={e => updateSkill(catIdx, skillIdx, 'percentage', Number(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-gray-400 text-xs w-6">%</span>
                  <button onClick={() => removeSkill(catIdx, skillIdx)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition">
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSkill(catIdx)}
              className="mt-3 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
            >
              <FiPlus size={12} /> Add Skill
            </button>

            <div className="mt-4">
              <label className="block text-xs text-gray-400 mb-1">Tools (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. VS Code, Git, Docker"
                value={Array.isArray(cat.tools) ? cat.tools.join(', ') : (cat.tools || '')}
                onChange={e => updateCategory(catIdx, 'tools', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-gray-500 text-sm">No skill categories yet. Click "Add Category" to start.</p>
        )}
      </div>
    </div>
  );
}
