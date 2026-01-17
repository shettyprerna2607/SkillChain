import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

interface RequestSessionModalProps {
  teacherId: number;
  teacherName: string;
  skillName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RequestSessionModal: React.FC<RequestSessionModalProps> = ({ teacherId, teacherName, skillName, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    scheduledAt: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/sessions/request', {
        teacherId,
        skillName,
        scheduledAt: formData.scheduledAt,
        description: formData.description
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to request session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Request Session</h2>
        <p className="text-gray-400 mb-6">Learning <span className="text-purple-400 font-bold">{skillName}</span> from <span className="text-white">{teacherName}</span></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Date & Time</label>
            <input 
              type="datetime-local" 
              name="scheduledAt" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
              onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Message (Goal for the session)</label>
            <textarea 
              name="description" 
              rows={3}
              placeholder="Hi! I'd love to learn..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-purple-600 rounded-xl text-white font-bold hover:bg-purple-700">
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestSessionModal;
