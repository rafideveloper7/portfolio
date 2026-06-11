// frontend/src/app/admin/dashboard/bio/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSave, FiUpload, FiUser, FiMail, FiPhone, FiMapPin, FiTrash2 } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function BioPage() {
  const [bio, setBio] = useState({
    name: '', title: '', location: '', email: '', phone: '',
    bio: '', github: '', linkedin: '', twitter: '', experience: '',
    funFacts: [],
    tags: [],
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/bio`)
      .then(res => {
        const data = res.data || {};
        setBio({
          name: data.name || '',
          title: data.title || '',
          location: data.location || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          github: data.github || '',
          linkedin: data.linkedin || '',
          twitter: data.twitter || '',
          experience: data.experience || '',
          funFacts: data.funFacts || [],
          tags: data.tags || [],
        });
        setImage(data.image || null);
        setLoading(false);
      })
      .catch(() => { toast.error('Failed to load bio'); setLoading(false); });
  }, []);

  const updateField = (field, value) => {
    setBio(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error('Cloudinary not configured');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'rafios-bio');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        const token = localStorage.getItem('adminToken');
        await axios.post(`${API}/api/bio/upload-image`,
          { image: data.secure_url, filename: data.public_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setImage(data.secure_url);
        toast.success('Photo updated');
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    const token = localStorage.getItem('adminToken');
    await axios.delete(`${API}/api/bio/image`, { headers: { Authorization: `Bearer ${token}` } });
    setImage(null);
    toast.success('Photo removed');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const payload = { ...bio };
      delete payload.image;
      delete payload.imagePublicId;
      await axios.put(`${API}/api/bio`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Profile saved successfully');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-blue-400 text-sm animate-pulse">Loading profile...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Profile Settings</h1>
          <p className="text-gray-400 text-sm">Tell the world about yourself</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Photo Card */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Profile Photo</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden">
                  {image ? (
                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="text-gray-500" size={32} />
                  )}
                </div>
                {image && (
                  <button type="button" onClick={handleDeleteImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition">
                    <FiTrash2 size={12} />
                  </button>
                )}
              </div>
              <div>
                <label className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl cursor-pointer transition text-sm font-medium ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <FiUpload size={14} />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                <p className="text-xs text-gray-500 mt-2">Square image, 500x500px recommended</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Full Name *</label>
                <input value={bio.name} onChange={e => updateField('name', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Job Title</label>
                <input value={bio.title} onChange={e => updateField('title', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Location</label>
                <input value={bio.location} onChange={e => updateField('location', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Experience (years)</label>
                <input type="number" value={bio.experience} onChange={e => updateField('experience', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
                <input type="email" value={bio.email} onChange={e => updateField('email', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Phone</label>
                <input value={bio.phone} onChange={e => updateField('phone', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">GitHub URL</label>
                <input value={bio.github} onChange={e => updateField('github', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">LinkedIn URL</label>
                <input value={bio.linkedin} onChange={e => updateField('linkedin', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition text-sm" />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">About</h3>
            <textarea value={bio.bio} onChange={e => updateField('bio', e.target.value)} rows={5}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition text-sm resize-none" />
          </div>

          {/* Tags & Fun Facts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-3">Tags</h3>
              <input value={(bio.tags || []).join(', ')} onChange={e => updateField('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="MERN, Next.js, AI..." className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none transition" />
            </div>
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-3">Fun Facts</h3>
              <input value={(bio.funFacts || []).join(', ')} onChange={e => updateField('funFacts', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="Love Badminton, Travelling..." className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none transition" />
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white rounded-xl font-semibold transition disabled:opacity-50 shadow-lg shadow-blue-500/20">
              <FiSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
