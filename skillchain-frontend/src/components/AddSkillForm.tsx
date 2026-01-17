import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AddSkillForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        skillName: '',
        category: 'TECH',
        type: 'LEARN',
        proficiencyLevel: 'BEGINNER',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post('/skills/add', formData);
            navigate('/dashboard');
        } catch (error: any) {
            const msg = error.response?.data || "Failed to add skill";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold text-center mb-6 text-white">Add a Skill</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm mb-1">Skill Name</label>
                        <input type="text" name="skillName" value={formData.skillName} onChange={handleChange} required
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white outline-none">
                                <option value="TECH">Tech</option>
                                <option value="ART">Art</option>
                                <option value="MUSIC">Music</option>
                                <option value="LANGUAGE">Language</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white outline-none">
                                <option value="LEARN">I want to Learn</option>
                                <option value="TEACH">I can Teach</option>
                            </select>
                        </div>
                    </div>

                    {formData.type === 'TEACH' && (
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Proficiency Level</label>
                            <select name="proficiencyLevel" value={formData.proficiencyLevel} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white outline-none">
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                                <option value="EXPERT">Expert</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-300 text-sm mb-1">Description (Optional)</label>
                        <textarea name="description" value={formData.description} onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 outline-none h-24" />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition transform hover:scale-105">
                        {loading ? 'Adding...' : 'Add Skill'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddSkillForm;
