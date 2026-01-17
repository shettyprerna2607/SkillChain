import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

interface LeaderboardItem {
    username: string;
    fullName: string;
    points: number;
    badgeCount: number;
    rank: number;
}

const Leaderboard = () => {
    const [data, setData] = useState<LeaderboardItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/leaderboard');
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch leaderboard", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-2">Hall of Champions</h1>
                <p className="text-gray-400">The most helpful and skilled members of our community.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="p-6 border-b border-white/10 bg-indigo-900/20 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Global Ranking</h2>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Updated Live</span>
                </div>

                <div className="divide-y divide-white/5">
                    {data.map((item, index) => (
                        <div key={item.username} className={`p-8 flex items-center gap-6 transition hover:bg-white/5 group ${index < 3 ? 'bg-indigo-600/5' : ''}`}>
                            {/* Rank */}
                            <div className="flex-shrink-0 w-12 text-center text-3xl">
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" :
                                    <span className="text-lg font-bold text-gray-600 group-hover:text-white">#{item.rank}</span>}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition">{item.fullName}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">@{item.username}</span>
                                    <div className="w-1 h-1 rounded-full bg-gray-700" />
                                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{item.badgeCount} Badges</span>
                                </div>
                            </div>

                            {/* Points */}
                            <div className="text-right">
                                <p className="text-2xl font-bold text-white group-hover:scale-105 transition origin-right">
                                    {item.points.toLocaleString()}
                                </p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Skill XP</p>
                            </div>
                        </div>
                    ))}
                    {data.length === 0 && (
                        <div className="p-20 text-center text-gray-500 text-sm">
                            No champions have emerged yet. Join a chain to start!
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-gray-500 text-xs italic">
                    Earn points by teaching skills and completing verified skill paths.
                </p>
            </div>
        </div>
    );
};

export default Leaderboard;
