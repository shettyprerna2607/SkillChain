import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

interface Node {
    id: number;
    title: string;
    description: string;
}

interface Chain {
    id: number;
    title: string;
    description: string;
    category: string;
    icon: string;
    nodes: Node[];
}

const SkillChains = () => {
    const [chains, setChains] = useState<Chain[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedChain, setSelectedChain] = useState<Chain | null>(null);

    const handleStake = async (chainId: number) => {
        try {
            await axiosInstance.post(`/stakes/chain/${chainId}`, { amount: 100 });
            alert("🎯 Stake Successful! You've committed 100 points to this path. Check your Dashboard to track progress.");
            setSelectedChain(null);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to stake. Minimum 100 XP required.");
        }
    };

    const fetchChains = useCallback(async () => {
        try {
            console.log("Fetching skill chains...");
            const res = await axiosInstance.get('/skill-chains');
            console.log("Fetched chains:", res.data);
            setChains(res.data);
        } catch (err) {
            console.error("Failed to load skill chains:", err);
            setError("Could not load skill chains.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChains();
    }, [fetchChains]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Skill <span className="text-indigo-500">Chains</span></h1>
                <p className="text-gray-400">Structured paths verified by the community.</p>
            </div>

            {error ? (
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-400 font-bold">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {chains.map((chain) => (
                        <div key={chain.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 transition group">
                            <span className="text-4xl mb-6 block bg-white/5 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition">{chain.icon}</span>
                            <h2 className="text-xl font-bold text-white mb-2">{chain.title}</h2>
                            <p className="text-sm text-gray-500 mb-6 font-bold uppercase tracking-widest">{chain.category}</p>
                            <p className="text-gray-400 text-sm mb-10 line-clamp-2">{chain.description}</p>
                            <button
                                onClick={() => setSelectedChain(chain)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-bold text-sm transition shadow-lg"
                            >
                                View Roadmap
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedChain && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
                    <div className="bg-indigo-950 border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-10 border-b border-white/5 flex justify-between items-start">
                            <div className="flex items-center gap-6">
                                <span className="text-5xl">{selectedChain.icon}</span>
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-1">{selectedChain.title}</h2>
                                    <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest">Mastery Path</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedChain(null)} className="text-gray-500 hover:text-white text-3xl">&times;</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 space-y-8">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Curriculum Nodes</h3>
                                <div className="space-y-6 relative">
                                    <div className="skill-tree-line" />
                                    {selectedChain.nodes.map((node, i) => (
                                        <div key={node.id} className="skill-node bg-white/5 border border-white/5 p-6 rounded-2xl flex items-start gap-5 hover:bg-white/10">
                                            <span className="skill-node-circle bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all duration-300">
                                                {i + 1}
                                            </span>
                                            <div>
                                                <h4 className="text-white font-bold mb-1">{(node as any).skill?.name || node.title}</h4>
                                                <p className="text-xs text-gray-500 leading-relaxed font-medium uppercase tracking-tighter">Level {i + 1} Node</p>
                                                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{node.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-indigo-600 p-8 rounded-[2rem] text-white">
                                    <h3 className="text-lg font-bold mb-4">Start Growing</h3>
                                    <p className="text-sm text-indigo-100 mb-8 leading-relaxed">Stake 100 XP to commit to this path. Complete all nodes to earn double bonuses!</p>
                                    <button
                                        onClick={() => handleStake(selectedChain.id)}
                                        className="w-full bg-white text-indigo-600 font-bold py-4 rounded-2xl hover:bg-gray-100 transition shadow-xl"
                                    >
                                        Stake 100 XP
                                    </button>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Duration</p>
                                    <p className="text-white font-bold text-sm">~ 14 Days to Mastery</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillChains;
