// frontend/src/app/admin/dashboard/music/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiTrash2, FiUpload, FiLink, FiPlus, FiMusic } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function MusicAdminPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [tab, setTab] = useState('upload');

  const token = () => localStorage.getItem('adminToken');

  const load = async () => {
    try {
      const res = await axios.get(`${API}/api/music/list`);
      setSongs(res.data || []);
    } catch {
      toast.error('Failed to load music');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Upload directly to Cloudinary from browser, then save URL to backend
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error('Cloudinary not configured. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in Vercel env vars.');
      return;
    }

    setUploading(true);
    setProgress(0);

    // Cloudinary stores audio under resource_type 'video'
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'rafios-music');

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl);

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
      };

      xhr.onload = async () => {
        setUploading(false);
        setProgress(0);
        e.target.value = '';

        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          const secureUrl = result.secure_url;
          const publicId = result.public_id;
          const title = file.name.replace(/\.[^.]+$/, '');

          try {
            await axios.post(`${API}/api/music/add-url`,
              { url: secureUrl, title, filename: publicId },
              { headers: { Authorization: `Bearer ${token()}` } }
            );
            toast.success('Uploaded successfully');
            load();
          } catch {
            toast.error('Uploaded to Cloudinary but failed to save to database');
          }
        } else {
          const err = JSON.parse(xhr.responseText);
          toast.error('Cloudinary upload failed: ' + (err?.error?.message || xhr.status));
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        toast.error('Upload network error');
      };

      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      toast.error('Upload failed: ' + err.message);
    }
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    try {
      await axios.post(`${API}/api/music/add-url`,
        { url: urlInput.trim(), title: titleInput.trim() || urlInput.split('/').pop().replace(/\.[^.]+$/, '') },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      toast.success('Added');
      setUrlInput('');
      setTitleInput('');
      load();
    } catch {
      toast.error('Failed to add URL');
    }
  };

  const handleDelete = async (url) => {
    if (!confirm('Delete this song?')) return;
    try {
      await axios.delete(`${API}/api/music/delete?filename=${encodeURIComponent(url)}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const songName = (url) => {
    try {
      const name = decodeURIComponent(url.split('/').pop().split('?')[0]);
      return name.replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
    } catch { return url; }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <h2 className="text-xl font-bold text-white mb-6">Music Management</h2>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('upload')}
            className={`px-4 py-1.5 rounded-lg text-sm transition flex items-center gap-2 ${tab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
            <FiUpload size={13} /> File Upload
          </button>
          <button onClick={() => setTab('url')}
            className={`px-4 py-1.5 rounded-lg text-sm transition flex items-center gap-2 ${tab === 'url' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
            <FiLink size={13} /> Add by URL
          </button>
        </div>

        {tab === 'upload' && (
          <div>
            <label className={`flex items-center gap-3 px-5 py-3 bg-gray-700 hover:bg-gray-600 border border-dashed border-gray-500 rounded-xl cursor-pointer transition w-fit ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <FiUpload className="text-blue-400" />
              <span className="text-sm text-gray-300">
                {uploading ? `Uploading to Cloudinary... ${progress}%` : 'Choose audio file (mp3, wav, ogg, m4a)'}
              </span>
              <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
            {uploading && (
              <div className="mt-3 w-64 bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Files upload directly to Cloudinary — works in production.</p>
          </div>
        )}

        {tab === 'url' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Audio URL</label>
              <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Title (optional)</label>
              <input type="text" value={titleInput} onChange={e => setTitleInput(e.target.value)}
                placeholder="Song title"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <button onClick={handleAddUrl}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">
              <FiPlus size={14} /> Add Song
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : songs.length === 0 ? (
        <div className="text-gray-500 text-sm">No songs yet.</div>
      ) : (
        <div className="space-y-2">
          {songs.map((url, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
              <FiMusic className="text-blue-400 shrink-0" size={16} />
              <span className="text-white text-sm flex-1 truncate">{songName(url)}</span>
              <button onClick={() => handleDelete(url)}
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition">
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
