// frontend/src/app/admin/dashboard/messages/page.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiTrash2, FiMail, FiMailOpen } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const token = () => localStorage.getItem('adminToken');

  const load = () => {
    axios.get(`${API}/api/contact/messages`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(res => { setMessages(res.data || []); setLoading(false); })
      .catch(() => { toast.error('Failed to load messages'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try {
      await axios.put(`${API}/api/contact/messages/${id}/read`, {}, { headers: { Authorization: `Bearer ${token()}` } });
      load();
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await axios.delete(`${API}/api/contact/messages/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      toast.success('Deleted');
      if (selected?._id === id) setSelected(null);
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleOpen = (msg) => {
    setSelected(msg);
    if (!msg.read) markRead(msg._id);
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6 flex gap-4 h-[calc(100vh-0px)]">
      {/* List */}
      <div className="w-80 shrink-0 space-y-2 overflow-auto">
        <h2 className="text-xl font-bold text-white mb-4">Messages ({messages.length})</h2>
        {messages.length === 0 && <p className="text-gray-500 text-sm">No messages yet.</p>}
        {messages.map(msg => (
          <div
            key={msg._id}
            onClick={() => handleOpen(msg)}
            className={`p-3 rounded-xl border cursor-pointer transition ${
              selected?._id === msg._id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium flex items-center gap-2">
                {msg.read ? <FiMailOpen size={12} className="text-gray-500" /> : <FiMail size={12} className="text-blue-400" />}
                {msg.name}
              </span>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(msg._id); }}
                className="p-1 text-gray-500 hover:text-red-400 rounded transition"
              >
                <FiTrash2 size={12} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{msg.subject}</p>
            <p className="text-xs text-gray-500 mt-0.5">{new Date(msg.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {/* Detail */}
      <div className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-6 overflow-auto">
        {selected ? (
          <>
            <h3 className="text-white text-lg font-semibold">{selected.subject}</h3>
            <div className="flex gap-4 mt-2 text-sm text-gray-400">
              <span>From: <span className="text-white">{selected.name}</span></span>
              <span>Email: <a href={`mailto:${selected.email}`} className="text-blue-400">{selected.email}</a></span>
              <span>{new Date(selected.createdAt).toLocaleString()}</span>
            </div>
            <hr className="border-gray-700 my-4" />
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
            <div className="mt-6">
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition inline-block"
              >
                Reply via Email
              </a>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a message to read
          </div>
        )}
      </div>
    </div>
  );
}
