// frontend/src/app/admin/dashboard/music/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiTrash2, FiUpload, FiLink, FiPlus, FiMusic } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Formats Cloudinary accepts natively under resource_type=video
const CLOUDINARY_NATIVE = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'mp4', 'webm'];

// Convert any audio file to WAV using Web Audio API (runs in browser)
async function convertToWav(file, onProgress) {
  onProgress(5);
  const arrayBuffer = await file.arrayBuffer();
  onProgress(20);

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  onProgress(50);

  const numChannels = decoded.numberOfChannels;
  const sampleRate = decoded.sampleRate;
  const length = decoded.length;

  // Interleave channels
  const interleaved = new Float32Array(length * numChannels);
  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = decoded.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      interleaved[i * numChannels + ch] = channelData[i];
    }
  }
  onProgress(65);

  // Convert float32 to int16
  const pcm = new Int16Array(interleaved.length);
  for (let i = 0; i < interleaved.length; i++) {
    const s = Math.max(-1, Math.min(1, interleaved[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  onProgress(75);

  // Build WAV header
  const wavBuffer = new ArrayBuffer(44 + pcm.byteLength);
  const view = new DataView(wavBuffer);
  const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + pcm.byteLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);                          // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
  view.setUint16(32, numChannels * 2, true);             // block align
  view.setUint16(34, 16, true);                          // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, pcm.byteLength, true);
  new Int16Array(wavBuffer, 44).set(pcm);
  onProgress(85);

  await audioCtx.close();
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

export default function MusicAdminPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
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

  const uploadToCloudinary = (blob, filename) => {
    return new Promise((resolve, reject) => {
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'rafios-music');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl);
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          // Map upload progress to 85–100%
          setProgress(85 + Math.round((ev.loaded / ev.total) * 15));
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
        else reject(new Error(JSON.parse(xhr.responseText)?.error?.message || `HTTP ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error('Cloudinary env vars missing. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to Vercel.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const title = file.name.replace(/\.[^.]+$/, '');
      let uploadBlob;
      let uploadName;

      if (CLOUDINARY_NATIVE.includes(ext)) {
        // Native format — upload directly
        setStatusMsg('Uploading...');
        setProgress(10);
        uploadBlob = file;
        uploadName = file.name;
      } else {
        // Unsupported format — convert to WAV first
        setStatusMsg(`Converting ${ext.toUpperCase()} → WAV...`);
        uploadBlob = await convertToWav(file, setProgress);
        uploadName = title + '.wav';
        setStatusMsg('Uploading WAV to Cloudinary...');
      }

      setProgress(85);
      setStatusMsg('Uploading to Cloudinary...');
      const result = await uploadToCloudinary(uploadBlob, uploadName);

      setStatusMsg('Saving...');
      await axios.post(`${API}/api/music/add-url`,
        { url: result.secure_url, title, filename: result.public_id },
        { headers: { Authorization: `Bearer ${token()}` } }
      );

      setProgress(100);
      toast.success('Uploaded successfully');
      load();
    } catch (err) {
      console.error(err);
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setProgress(0);
      setStatusMsg('');
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
      return decodeURIComponent(url.split('/').pop().split('?')[0])
        .replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
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
                {uploading ? statusMsg || `${progress}%` : 'Choose audio file (any format)'}
              </span>
              <input type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.wma,.opus"
                className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>

            {uploading && (
              <div className="mt-3 w-72 space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{statusMsg}</span>
                  <span>{progress}%</span>
                </div>
                <div className="bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Supports mp3, wav, ogg, m4a, aac, flac. Other formats auto-convert to WAV in browser.
            </p>
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
