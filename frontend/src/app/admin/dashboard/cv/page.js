// frontend/src/app/admin/dashboard/cv/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiTrash2, FiUpload, FiLink, FiPlus, FiFileText, FiDownload } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function CVAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [tab, setTab] = useState('upload');

  const token = () => localStorage.getItem('adminToken');

  const load = async () => {
    try {
      const full = await axios.get(`${API}/api/cv/items`, {
        headers: { Authorization: `Bearer ${token()}` },
      }).catch(() => null);
      if (full?.data) {
        setItems(full.data);
      } else {
        const res = await axios.get(`${API}/api/cv/list`);
        setItems((res.data || []).map(p => ({ path: p, filename: p, originalName: p })));
      }
    } catch {
      toast.error('Failed to load CVs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error('Cloudinary not configured. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in Vercel env vars.');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    setUploading(true);
    setProgress(0);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'rafios-cv');

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

          try {
            await axios.post(`${API}/api/cv/add-url`,
              { url: secureUrl, filename: publicId, originalName: file.name },
              { headers: { Authorization: `Bearer ${token()}` } }
            );
            toast.success('CV uploaded successfully');
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
      await axios.post(`${API}/api/cv/add-url`,
        { url: urlInput.trim(), originalName: 'CV.pdf' },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      toast.success('Added');
      setUrlInput('');
      load();
    } catch {
      toast.error('Failed to add URL');
    }
  };

  const handleDelete = async (filename) => {
    if (!confirm('Delete this CV?')) return;
    try {
      await axios.delete(`${API}/api/cv/delete?filename=${encodeURIComponent(filename)}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-bold text-white mb-6">CV Management</h2>

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
                {uploading ? `Uploading... ${progress}%` : 'Choose PDF file'}
              </span>
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
            {uploading && (
              <div className="mt-3 w-64 bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">PDF files upload directly to Cloudinary.</p>
          </div>
        )}

        {tab === 'url' && (
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs text-gray-400 mb-1">PDF URL</label>
              <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <button onClick={handleAddUrl}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">
              <FiPlus size={14} /> Add
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500 text-sm">No CVs uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const url = item.path || item;
            const filename = item.filename || url.split('/').pop();
            const originalName = item.originalName || 'CV.pdf';
            return (
              <div key={i} className="relative group bg-gray-800 rounded-xl overflow-hidden">
                <div className="aspect-[3/4] bg-gray-700 flex items-center justify-center">
                  <FiFileText size={64} className="text-blue-400" />
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate" title={originalName}>{originalName}</p>
                  <p className="text-gray-500 text-xs mt-1">PDF Document</p>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <a href={url} target="_blank" rel="noreferrer"
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition" title="View">
                    <FiFileText size={16} />
                  </a>
                  <a href={url} download
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition" title="Download">
                    <FiDownload size={16} />
                  </a>
                  <button onClick={() => handleDelete(filename)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition" title="Delete">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}