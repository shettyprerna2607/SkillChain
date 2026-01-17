import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import RequestSessionModal from './RequestSessionModal';
import RatingModal from './RatingModal';
import VideoSession from './VideoSession';

interface Skill {
    id: number;
    name: string;
    category: string;
}

interface UserSkill {
    id: number;
    skill: Skill;
    type: 'LEARN' | 'TEACH';
    proficiencyLevel?: string;
}

interface Match {
    id: number;
    username: string;
    fullName: string;
    bio: string;
    location: string;
    skillName: string;
    proficiencyLevel: string;
    isMutuallyBeneficial: boolean;
}

interface Session {
    id: number;
    teacher: { id: number; fullName: string; username: string };
    learner: { id: number; fullName: string; username: string };
    skill: Skill;
    scheduledAt: string;
    status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
    description: string;
}

const Dashboard = () => {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'sessions'>('overview');
    const [mySkills, setMySkills] = useState<UserSkill[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [badges, setBadges] = useState<any[]>([]);
    const [stakes, setStakes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [ratingSessionId, setRatingSessionId] = useState<number | null>(null);
    const [activeVideoSessionId, setActiveVideoSessionId] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        try {
            // Fetch Skills separately to ensure they load even if other services fail
            try {
                const skillsRes = await axiosInstance.get('/skills/my');
                console.log("Skills Loaded:", skillsRes.data);
                setMySkills(skillsRes.data);
            } catch (e) {
                console.error("Failed to load skills", e);
            }

            // Fetch other data
            try {
                const [matchesRes, sessionsRes, badgesRes, stakesRes] = await Promise.all([
                    axiosInstance.get('/matches'),
                    axiosInstance.get('/sessions/my'),
                    axiosInstance.get('/badges/my'),
                    axiosInstance.get('/stakes/my'),
                    refreshUser()
                ]);
                setMatches(matchesRes.data);
                setSessions(sessionsRes.data);
                setBadges(badgesRes.data);
                setStakes(stakesRes.data);
            } catch (e) {
                console.error("Failed to load other dashboard data", e);
            }

        } catch (error) {
            console.error("Critical Dashboard Error", error);
        } finally {
            setLoading(false);
        }
    }, [refreshUser]);

    const handleCheckStake = async (stakeId: number) => {
        try {
            const res = await axiosInstance.post(`/stakes/${stakeId}/check`);
            if (res.data.status === 'completed') {
                alert(`🔥 SUCCESS! ${res.data.message}`);
            } else if (res.data.status === 'failed_deadline') {
                alert(`❌ FAILED: ${res.data.message}`);
            } else {
                alert(`⏳ Status: In Progress. Nodes remaining: ${res.data.skills_needed}`);
            }
            fetchData();
        } catch (err) {
            console.error("Check stake error", err);
        }
    };

    const handleUpdateSessionStatus = async (sessionId: number, status: string, rating?: number, feedback?: string) => {
        try {
            let url = `/sessions/${sessionId}/status?status=${status}`;
            if (rating) url += `&rating=${rating}`;
            if (feedback) url += `&feedback=${encodeURIComponent(feedback)}`;

            await axiosInstance.patch(url, {});
            setRatingSessionId(null);
            fetchData();
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status. Please check console for details.");
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-white/10 pb-10">
                <div className="flex items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Hello, {user?.fullName || user?.username}!</h1>
                        <p className="text-gray-400">Points: <span className="text-indigo-400 font-bold">{user?.points} XP</span></p>
                    </div>
                    {user?.streakCount !== undefined && user.streakCount > 0 && (
                        <div className="bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-2xl flex items-center gap-2 animate-bounce">
                            <span className="text-xl">🔥</span>
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-orange-400 uppercase leading-none">STREAK</p>
                                <p className="text-lg font-black text-white leading-none">{user.streakCount} DAYS</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex gap-4 items-center">
                    <div className="bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-2 rounded-lg transition font-bold text-sm ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('sessions')}
                            className={`px-6 py-2 rounded-lg transition font-bold text-sm ${activeTab === 'sessions' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                            Sessions
                        </button>
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                await axiosInstance.post('/ai/claim-xp');
                                fetchData();
                                alert("💎 1,000 Beta XP Granted! Happy Staking.");
                            } catch (err) {
                                console.error("Claim error", err);
                            }
                        }}
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm transition border border-white/10"
                    >
                        Claim Beta XP
                    </button>
                    <Link to="/add-skill" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg">
                        Add New Skill
                    </Link>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-10">
                    {/* Active Stakes */}
                    {stakes.filter(s => !s.completed && !s.failed).length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                🎲 Accountability Engine
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {stakes.filter(s => !s.completed && !s.failed).map((stake) => (
                                    <div key={stake.id} className="bg-indigo-900/30 border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-3xl bg-white/5 w-12 h-12 flex items-center justify-center rounded-xl">{stake.skillChain.icon}</span>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Staked</p>
                                                <p className="text-lg font-bold text-white">{stake.amount} XP</p>
                                            </div>
                                        </div>
                                        <h3 className="text-base font-bold text-white mb-1">{stake.skillChain.title}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold mb-6">Deadline: {new Date(stake.deadline).toLocaleDateString()}</p>
                                        <button
                                            onClick={() => handleCheckStake(stake.id)}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-lg">
                                            Verify Progress
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Skills and Badges */}
                        <div className="lg:col-span-1 space-y-10">
                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                                <h2 className="text-xl font-bold text-white mb-6">My Skills</h2>
                                <div className="space-y-3">
                                    {mySkills.length === 0 ? <p className="text-gray-500 text-sm">Add skills to start matching!</p> :
                                        mySkills.map(us => (
                                            <div key={us.id} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5 hover:border-indigo-500/30 transition">
                                                <div>
                                                    <p className="text-white font-bold text-sm">{us.skill.name}</p>
                                                    <span className={`text-[10px] font-bold uppercase ${us.type === 'TEACH' ? 'text-green-400' : 'text-blue-400'}`}>{us.type}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-500">{us.proficiencyLevel || 'Learner'}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                                <h2 className="text-xl font-bold text-white mb-6">Badges & Achievements</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    {badges.length === 0 ? <p className="text-gray-500 text-xs col-span-3">No badges earned yet.</p> :
                                        badges.map(badge => (
                                            <div key={badge.id} className="bg-white/5 p-3 rounded-xl text-center group hover:bg-white/10 transition" title={badge.badgeName}>
                                                <span className="text-2xl mb-1 block">{badge.icon}</span>
                                                <span className="text-[8px] font-bold text-gray-500 uppercase truncate block">{badge.badgeName}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Matches */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-2xl font-bold text-white">Recommended Mentors</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {matches.length === 0 ? <p className="text-gray-500">No matches found.</p> :
                                    matches.map((match, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition group">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white text-xl">
                                                    {match.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">{match.fullName}</h3>
                                                    <p className="text-xs text-gray-500">@{match.username}</p>
                                                </div>
                                                {match.isMutuallyBeneficial && <span className="ml-auto bg-green-500/20 text-green-400 text-[8px] font-bold px-2 py-1 rounded-full border border-green-500/20">MUTUAL</span>}
                                            </div>
                                            <p className="text-gray-400 text-sm mb-8 line-clamp-2">{match.bio || "No bio available."}</p>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Teaches</p>
                                                    <p className="text-sm font-bold text-white">{match.skillName}</p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedMatch(match)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg">
                                                    Connect
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'sessions' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Live Sessions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions.length === 0 ? <p className="text-gray-500">No sessions scheduled.</p> :
                            sessions.map((session) => {
                                const isTeacher = session.teacher.username === user?.username;
                                const partnerName = isTeacher ? session.learner.fullName : session.teacher.fullName;
                                return (
                                    <div key={session.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between mb-4">
                                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${session.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    session.status === 'ACCEPTED' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-green-500/20 text-green-400'
                                                    }`}>{session.status}</span>
                                                <span className="text-[10px] text-gray-500 font-bold">{new Date(session.scheduledAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1">{partnerName}</h3>
                                            <p className="text-sm text-gray-400 mb-6">{isTeacher ? 'Learning from you' : 'Teaching you'}: <span className="text-indigo-400 font-bold">{session.skill.name}</span></p>
                                        </div>

                                        <div className="space-y-2">
                                            {session.status === 'PENDING' && isTeacher && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleUpdateSessionStatus(session.id, 'ACCEPTED')} className="flex-1 bg-indigo-600 py-2 rounded-xl text-xs font-bold text-white">Accept</button>
                                                    <button onClick={() => handleUpdateSessionStatus(session.id, 'CANCELLED')} className="flex-1 bg-white/5 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white">Decline</button>
                                                </div>
                                            )}
                                            {session.status === 'ACCEPTED' && (
                                                <button onClick={() => setActiveVideoSessionId(session.id)} className="w-full bg-indigo-600 py-3 rounded-xl text-xs font-bold text-white shadow-lg">Join Video Session</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Modals */}
            {selectedMatch && (
                <RequestSessionModal
                    teacherId={selectedMatch.id}
                    teacherName={selectedMatch.fullName}
                    skillName={selectedMatch.skillName}
                    onClose={() => setSelectedMatch(null)}
                    onSuccess={() => { fetchData(); setSelectedMatch(null); }}
                />
            )}
            {ratingSessionId && (
                <RatingModal
                    onClose={() => setRatingSessionId(null)}
                    onSubmit={(rating, feedback) => handleUpdateSessionStatus(ratingSessionId, 'COMPLETED', rating, feedback)}
                />
            )}
            {activeVideoSessionId && (
                <VideoSession
                    sessionId={activeVideoSessionId}
                    isInitiator={sessions.find(s => s.id === activeVideoSessionId)?.teacher.username === user?.username}
                    onClose={() => setActiveVideoSessionId(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
