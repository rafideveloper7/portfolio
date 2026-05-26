// frontend/src/app/admin/dashboard/wallpaper/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUpload, FiMonitor, FiSmartphone } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const GRADIENTS = [
  { name: 'Dark Blue',   value: 'gradient-default', cls: 'from-gray-900 via-blue-900/20 to-gray-900' },
  { name: 'Deep Purple', value: 'gradient-purple',  cls: 'from-gray-900 via-purple-900/30 to-gray-900' },
  { name: 'Dark Green',  value: 'gradient-green',   cls: 'from-gray-900 via-green-900/20 to-gray-900' },
  { name: 'Midnight Red',value: 'gradient-red',     cls: 'from-gray-900 via-red-900/20 to-gray-900' },
  { name: 'Pure Dark',   value: 'gradient-dark',    cls: 'from-gray-950 to-gray-900' },
  { name: 'Ocean',       value: 'gradient-ocean',   cls: 'from-gray-900 via-cyan-900/25 to-gray-900' },
  { name: 'Sunset',      value: 'gradient-sunset',  cls: 'from-gray-900 via-orange-900/20 to-gray-900' },
  { name: 'Galaxy',      value: 'gradient-galaxy',  cls: 'from-indigo-950 via-purple-900/40 to-gray-950' },
];

function WallpaperEditor({ label, icon: Icon, type, value, onChange, onSave, saving, uploading, onUpload }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-blue-400" />
        <h3 className="text-white font-semibold">{label}</h3>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-5">
        {['gradient', 'image', 'color'].map(t => (
          <button key={t} onClick={() => onChange(t, t === 'gradient' ? 'gradient-default' : t === 'color' ? '#07090f' : '')}
            className={`px-3 py-1.5 rounded-lg text-xs capitalize transition ${type === t ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Gradient grid */}
      {type === 'gradient' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {GRADIENTS.map(g => (
            <button key={g.value} onClick={() => onChange('gradient', g.value)}
              className={`relative h-16 rounded-xl overflow-hidden border-2 transition ${value === g.value ? 'border-blue-500 scale-105' : 'border-transparent hover:border-gray-500'}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${g.cls}`} />
              <span className="absolute bottom-1 left-2 text-white text-[9px] font-medium drop-shadow">{g.name}</span>
              {value === g.value && <span className="absolute top-1 right-1.5 text-blue-300 text-sm">✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* Image */}
      {type === 'image' && (
        <div className="space-y-3 mb-4">
          {/* Upload from device */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Upload from device</p>
            <label className={`flex items-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-dashed border-gray-500 rounded-xl cursor-pointer transition w-fit ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <FiUpload className="text-blue-400" size={14} />
              <span className="text-sm text-gray-300">{uploading ? 'Uploading...' : 'Choose image'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
            </label>
          </div>
          {/* Or URL */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Or paste image URL</p>
            <input type="url" value={value} onChange={e => onChange('image', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          {value && (
            <div className="h-32 rounded-xl overflow-hidden border border-gray-600">
              <img src={value} alt="Preview" className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; }} />
            </div>
          )}
        </div>
      )}

      {/* Color */}
      {type === 'color' && (
        <div className="flex items-center gap-4 mb-4">
          <input type="color" value={value?.startsWith('#') ? value : '#07090f'}
            onChange={e => onChange('color', e.target.value)}
            className="w-14 h-14 rounded-xl cursor-pointer border-0 bg-transparent" />
          <div>
            <p className="text-xs text-gray-400 mb-1">Hex</p>
            <input type="text" value={value} onChange={e => onChange('color', e.target.value)}
              placeholder="#07090f"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm w-32 focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="w-20 h-14 rounded-xl border border-gray-600 shrink-0" style={{ background: value }} />
        </div>
      )}

      <button onClick={onSave} disabled={saving}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition disabled:opacity-50 font-medium">
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

export default function WallpaperPage() {
  const [desktop, setDesktop] = useState({ type: 'gradient', value: 'gradient-default' });
  const [mobile, setMobile] = useState({ type: 'gradient', value: 'gradient-default' });
  const [savingDesktop, setSavingDesktop] = useState(false);
  const [savingMobile, setSavingMobile] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  const token = () => localStorage.getItem('adminToken');

  useEffect(() => {
    axios.get(`${API}/api/settings`).then(res => {
      if (res.data) {
        setDesktop({ type: res.data.wallpaperType || 'gradient', value: res.data.wallpaperValue || 'gradient-default' });
        setMobile({ type: res.data.mobileWallpaperType || 'gradient', value: res.data.mobileWallpaperValue || 'gradient-default' });
      }
    }).catch(() => {});
  }, []);

  const uploadImage = async (file, setUploading, onDone) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error('Cloudinary env vars missing');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'rafios-wallpapers');
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) { onDone(data.secure_url); toast.success('Image uploaded'); }
      else toast.error(data.error?.message || 'Upload failed');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const saveDesktop = async () => {
    setSavingDesktop(true);
    try {
      await axios.put(`${API}/api/settings`, { wallpaperType: desktop.type, wallpaperValue: desktop.value }, { headers: { Authorization: `Bearer ${token()}` } });
      toast.success('Desktop wallpaper saved');
    } catch { toast.error('Failed to save'); }
    finally { setSavingDesktop(false); }
  };

  const saveMobile = async () => {
    setSavingMobile(true);
    try {
      await axios.put(`${API}/api/settings`, { mobileWallpaperType: mobile.type, mobileWallpaperValue: mobile.value }, { headers: { Authorization: `Bearer ${token()}` } });
      toast.success('Mobile wallpaper saved');
    } catch { toast.error('Failed to save'); }
    finally { setSavingMobile(false); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl space-y-6">
      <h2 className="text-xl font-bold text-white">Background Wallpaper</h2>
      <p className="text-gray-400 text-sm">Set separate wallpapers for desktop and mobile views.</p>

      <WallpaperEditor
        label="Desktop Wallpaper"
        icon={FiMonitor}
        type={desktop.type}
        value={desktop.value}
        onChange={(t, v) => setDesktop({ type: t, value: v })}
        onSave={saveDesktop}
        saving={savingDesktop}
        uploading={uploadingDesktop}
        onUpload={e => {
          const f = e.target.files[0];
          if (f) uploadImage(f, setUploadingDesktop, url => setDesktop({ type: 'image', value: url }));
          e.target.value = '';
        }}
      />

      <WallpaperEditor
        label="Mobile Wallpaper"
        icon={FiSmartphone}
        type={mobile.type}
        value={mobile.value}
        onChange={(t, v) => setMobile({ type: t, value: v })}
        onSave={saveMobile}
        saving={savingMobile}
        uploading={uploadingMobile}
        onUpload={e => {
          const f = e.target.files[0];
          if (f) uploadImage(f, setUploadingMobile, url => setMobile({ type: 'image', value: url }));
          e.target.value = '';
        }}
      />
    </div>
  );
}
