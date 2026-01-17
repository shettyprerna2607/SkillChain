import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';

interface Suggestion {
    id: number;
    title: string;
    description: string;
    icon: string;
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    suggestions?: Suggestion[];
}

const AICoach = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! I'm your SkillChain AI Coach. How can I help you level up today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await axiosInstance.post('/ai/coach', { query: input });
            const aiMsg: Message = {
                id: Date.now() + 1,
                text: res.data.response,
                sender: 'ai',
                suggestions: res.data.suggestions
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error("Coach error", err);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Connection issues. Please try again.", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 h-[80vh] flex flex-col">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">AI Career Coach</h1>
                <p className="text-gray-400">Personalized roadmap & skill suggestions.</p>
            </div>

            <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-xl">
                {/* Chat Display */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex flex-col max-w-[85%]">
                                <div className={`px-6 py-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg'
                                    : 'bg-white/10 text-white rounded-tl-none border border-white/10'
                                    }`}>
                                    {msg.text}
                                </div>

                                {msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                        {msg.suggestions.map(s => (
                                            <Link
                                                key={s.id}
                                                to="/skill-chains"
                                                className="bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-2xl hover:bg-indigo-600 transition group flex items-start gap-4"
                                            >
                                                <span className="text-2xl">{s.icon}</span>
                                                <div>
                                                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Recommended</p>
                                                    <p className="text-sm font-bold text-white group-hover:text-white">{s.title}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 px-6 py-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input area */}
                <div className="p-6 bg-black/10 border-t border-white/10">
                    <form onSubmit={handleSendMessage} className="relative flex gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about roadmaps or points..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl font-bold shadow-lg transition"
                        >
                            Ask
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AICoach;
