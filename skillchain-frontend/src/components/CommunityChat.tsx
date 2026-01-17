import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { getWsUrl } from '../api/config';

interface ChatRoom {
    id: number;
    name: string;
    description: string;
    category: string;
    icon: string;
}

interface ChatMessage {
    id: number;
    content: string;
    sender: {
        id: number;
        username: string;
        fullName: string;
    };
    sentAt: string;
}

const CommunityChat = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const stompClient = useRef<Client | null>(null);

    const fetchRooms = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/chat/rooms');
            setRooms(res.data);
            if (res.data.length > 0 && !selectedRoom) {
                setSelectedRoom(res.data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch rooms", err);
        } finally {
            setLoading(false);
        }
    }, [selectedRoom]);

    const fetchMessages = useCallback(async () => {
        if (!selectedRoom) return;
        try {
            const res = await axiosInstance.get(`/chat/rooms/${selectedRoom.id}/messages`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    }, [selectedRoom]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    useEffect(() => {
        if (!selectedRoom) return;
        fetchMessages();

        // Initialize WebSocket Connection
        const client = new Client({
            webSocketFactory: () => new SockJS(getWsUrl()),
            debug: (str) => console.log(str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log("Connected to WebSocket");
            client.subscribe(`/topic/room/${selectedRoom.id}`, (message) => {
                const receivedMsg = JSON.parse(message.body);
                setMessages(prev => {
                    // Avoid duplicate messages if already in state
                    if (prev.find(m => m.id === receivedMsg.id)) return prev;
                    return [...prev, receivedMsg];
                });
            });
        };

        client.activate();
        stompClient.current = client;

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        };
    }, [selectedRoom, fetchMessages]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoom || !user || !stompClient.current?.connected) return;

        const payload = {
            content: newMessage,
            username: user.username
        };

        stompClient.current.publish({
            destination: `/app/chat/${selectedRoom.id}/send`,
            body: JSON.stringify(payload)
        });

        setNewMessage("");
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 h-[80vh] flex border border-white/10 rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/10 flex flex-col bg-black/20">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Rooms</h2>
                    <p className="text-xs text-gray-500">Pick a community</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {rooms.map(room => (
                        <button
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className={`w-full p-6 flex items-center gap-4 transition hover:bg-white/5 ${selectedRoom?.id === room.id ? 'bg-indigo-600/20 border-r-4 border-indigo-500' : ''}`}
                        >
                            <span className="text-2xl">{room.icon}</span>
                            <div className="text-left">
                                <p className="text-sm font-bold text-white">{room.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-black">{room.category}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedRoom && (
                    <>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h1 className="text-xl font-bold text-white flex items-center gap-3">
                                    <span>{selectedRoom.icon}</span>
                                    {selectedRoom.name}
                                </h1>
                                <p className="text-xs text-gray-400">{selectedRoom.description}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {messages.map((msg) => {
                                const isMe = msg.sender.username === user?.username;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <span className="text-[10px] font-bold text-gray-500">{msg.sender.fullName}</span>
                                            <span className="text-[10px] text-gray-600">{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm ${isMe
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white/10 text-white rounded-tl-none border border-white/10'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messageEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-black/10 border-t border-white/10">
                            <form onSubmit={handleSendMessage} className="relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={`Message ${selectedRoom.name}...`}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-3 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg transition"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CommunityChat;
