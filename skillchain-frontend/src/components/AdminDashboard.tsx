import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface Stats {
    totalUsers: number;
    totalSessions: number;
    totalSkills: number;
    totalChains: number;
    activeSessions: number;
}

interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    points: number;
    role: string;
    createdAt: string;
}

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [statsRes, usersRes] = await Promise.all([
                    axiosInstance.get('/admin/stats'),
                    axiosInstance.get('/admin/users')
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data);
            } catch (err) {
                console.error("Failed to fetch admin data", err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'ADMIN') {
            fetchAdminData();
        }
    }, [user]);

    if (user?.role !== 'ADMIN') {
        return <Navigate to="/dashboard" />;
    }

    if (loading) return <div className="text-white text-center mt-20 font-['Verdana']">Loading Admin Console...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 font-['Verdana']">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Command Center</h1>
                    <p className="text-gray-400">Overview of the SkillChain ecosystem.</p>
                </div>
                <div className="bg-purple-600/20 border border-purple-500/30 px-6 py-3 rounded-2xl">
                    <span className="text-purple-300 font-bold">Admin Session Active</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Users', value: stats?.totalUsers, color: 'from-blue-600 to-indigo-600' },
                    { label: 'Active Sessions', value: stats?.activeSessions, color: 'from-green-600 to-teal-600' },
                    { label: 'Skill Library', value: stats?.totalSkills, color: 'from-purple-600 to-pink-600' },
                    { label: 'Global Points', value: users.reduce((acc, u) => acc + u.points, 0).toLocaleString(), color: 'from-orange-600 to-yellow-600' }
                ].map((s, i) => (
                    <div key={i} className={`bg-gradient-to-br ${s.color} p-8 rounded-3xl shadow-xl transform hover:scale-105 transition`}>
                        <p className="text-white/80 text-sm font-bold uppercase tracking-wider mb-2">{s.label}</p>
                        <p className="text-4xl font-black text-white">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* User Management Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Registered Users</h2>
                    <span className="bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-bold">{users.length} Users Total</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-8 py-4">User</th>
                                <th className="px-8 py-4">Role</th>
                                <th className="px-8 py-4">Points</th>
                                <th className="px-8 py-4">Registered</th>
                                <th className="px-8 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-white/5 transition">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                                                {u.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">{u.fullName}</p>
                                                <p className="text-xs text-gray-500 font-mono">@{u.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-blue-500/20 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-white">{u.points}</td>
                                    <td className="px-8 py-5 text-sm text-gray-500">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-5">
                                        <button className="text-gray-500 hover:text-white transition">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
