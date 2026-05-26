// frontend/src/app/admin/dashboard/wallpaper/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

const GRADIENTS = [
  { name: 'Dark Blue (Default)', value: 'gradient-default', preview: 'from-gray-900 via-blue-900/20 to-gray-900' },
  { name: 'Deep Purple',         value: 'gradient-purple',  preview: 'from-gray-900 via-purple-900/30 to-gray-900' },
  { name: 'Dark Green',          value: 'gradient-green',   preview: 'from-gray-900 via-green-900/20 to-gray-900' },
  { name: 'Midnight Red',        value: 'gradient-red',     preview: 'from-gray-900 via-red-900/20 to-gray-900' },
  { name: 'Pure Dark',           value: 'gradient-dark',    preview: 'from-gray-950 to-gray-900' },
];

export default function WallpaperPage() {
  const [type, setType] = useState('gradient');
  const [value, setValue] = useState('gradient-default');
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('adminToken');

  useEffect(() => {
    axios.get(`${API}/api/settings`)
      .then(res => {
        if (res.data) {
          setType(res.data.wallpaperType || 'gradient');
          setValue(res.data.wallpaperValue || 'gradient-default');
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/api/settings`, { wallpaperType: type, wallpaperValue: value }, { headers: { Authorization: `Bearer ${token()}` } });
      toast.success('Wallpaper saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-6">Background Wallpaper</h2>

      {/* Type selector */}
      <div className="flex gap-2 mb-6">
        {['gradient', 'image', 'color'].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition ${type === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Gradient picker */}
      {type === 'gradient' && (
        <div className="grid grid-cols-2 gap-3">
          {GRADIENTS.map(g => (
            <button key={g.value} onClick={() => setValue(g.value)}
              className={`relative h-20 rounded-xl overflow-hidden border-2 transition ${value === g.value ? 'border-blue-500' : 'border-transparent hover:border-gray-500'}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${g.preview}`} />
              <span className="absolute bottom-2 left-3 text-white text-xs font-medium drop-shadow">{g.name}</span>
              {value === g.value && <span className="absolute top-2 right-2 text-blue-400 text-lg">✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* Image URL */}
      {type === 'image' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Image URL</label>
            <input type="url" value={value} onChange={e => setValue(e.target.value)}
              placeholder="https://example.com/wallpaper.jpg"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
          </div>
          {value && (
            <div className="h-40 rounded-xl overflow-hidden border border-gray-700">
              <img src={value} alt="Preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
            </div>
          )}
          <p className="text-xs text-gray-500">Use a direct image URL (jpg, png, webp). Unsplash, Imgur, etc. work well.</p>
        </div>
      )}

      {/* Solid color */}
      {type === 'color' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input type="color" value={value.startsWith('#') ? value : '#07090f'} onChange={e => setValue(e.target.value)}
              className="w-16 h-16 rounded-xl cursor-pointer border-0 bg-transparent" />
            <div>
              <label className="block text-sm text-gray-300 mb-1">Hex Color</label>
              <input type="text" value={value} onChange={e => setValue(e.target.value)}
                placeholder="#07090f"
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white w-36 focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="w-24 h-16 rounded-xl border border-gray-600" style={{ background: value }} />
          </div>
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 font-medium">
        {saving ? 'Saving...' : 'Save Wallpaper'}
      </button>
    </div>
  );
}
