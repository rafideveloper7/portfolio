// frontend/src/app/admin/dashboard/music/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiTrash2, FiUpload, FiLink, FiPlus, FiMusic } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^.]+$/, ''));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API}/api/music/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token()}`);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      setProgress(0);
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        if (res.success) { toast.success('Uploaded'); load(); }
        else toast.error(res.error || 'Upload failed');
      } else {
        toast.error('Upload failed');
      }
      e.target.value = '';
    };
    xhr.onerror = () => { setUploading(false); toast.error('Upload error'); };
    xhr.send(formData);
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    try {
      await axios.post(`${API}/api/music/add-url`,
        { url: urlInput.trim(), title: titleInput.trim() || urlInput.split('/').pop() },
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

  const handleDelete = async (filename) => {
    if (!confirm('Delete this song?')) return;
    try {
      await axios.delete(`${API}/api/music/delete?filename=${encodeURIComponent(filename)}`, { headers: { Authorization: `Bearer ${token()}` } });
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const songName = (url) => {
    const name = url.split('/').pop().split('?')[0];
    return decodeURIComponent(name.replace(/^v\d+\//, '').replace(/\.[^.]+$/, ''));
  };

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-xl font-bold text-white mb-6">Music Management</h2>

      {/* Add music tabs */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('upload')} className={`px-4 py-1.5 rounded-lg text-sm transition ${tab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
            <span className="flex items-center gap-2"><FiUpload size={13} /> File Upload</span>
          </button>
          <button onClick={() => setTab('url')} className={`px-4 py-1.5 rounded-lg text-sm transition ${tab === 'url' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
            <span className="flex items-center gap-2"><FiLink size={13} /> Add by URL</span>
          </button>
        </div>

        {tab === 'upload' && (
          <div>
            <label className="flex items-center gap-3 px-5 py-3 bg-gray-700 hover:bg-gray-600 border border-dashed border-gray-500 rounded-xl cursor-pointer transition w-fit">
              <FiUpload className="text-blue-400" />
              <span className="text-sm text-gray-300">{uploading ? `Uploading... ${progress}%` : 'Choose audio file (mp3, wav, ogg)'}</span>
              <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
            {uploading && (
              <div className="mt-3 w-64 bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}

        {tab === 'url' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Audio URL</label>
              <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                placeholder="https://example.com/song.mp3"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Title (optional)</label>
              <input type="text" value={titleInput} onChange={e => setTitleInput(e.target.value)}
                placeholder="Song title"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <button onClick={handleAddUrl} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">
              <FiPlus size={14} /> Add Song
            </button>
          </div>
        )}
      </div>

      {/* Song list */}
      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : songs.length === 0 ? (
        <div className="text-gray-500 text-sm">No songs yet. Upload a file or add a URL above.</div>
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
