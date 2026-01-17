import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';

import { getWsUrl } from '../api/config';

interface VideoSessionProps {
    sessionId: number;
    isInitiator: boolean;
    onClose: () => void;
}

const VideoSession: React.FC<VideoSessionProps> = ({ sessionId, isInitiator, onClose }) => {
    const { user } = useAuth();
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const stompClient = useRef<Client | null>(null);
    const [status, setStatus] = useState("Initializing Encryption...");

    const configuration = useMemo(() => ({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    }), []);

    useEffect(() => {
        let localStreamRef: MediaStream;

        const setupWebSockets = () => {
            const client = new Client({
                webSocketFactory: () => new SockJS(getWsUrl()),
                reconnectDelay: 5000,
            });

            client.onConnect = () => {
                client.subscribe(`/topic/video/${sessionId}`, async (message) => {
                    const signal = JSON.parse(message.body);
                    if (signal.sender === user?.username) return;

                    if (signal.type === 'OFFER') {
                        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(signal.data));
                        const answer = await peerConnection.current?.createAnswer();
                        await peerConnection.current?.setLocalDescription(answer);
                        sendSignal('ANSWER', answer);
                    } else if (signal.type === 'ANSWER') {
                        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(signal.data));
                    } else if (signal.type === 'CANDIDATE') {
                        try {
                            await peerConnection.current?.addIceCandidate(new RTCIceCandidate(signal.data));
                        } catch (e) {
                            console.warn("Error adding ICE candidate", e);
                        }
                    }
                });

                startCall();
            };

            client.activate();
            stompClient.current = client;
        };

        const sendSignal = (type: string, data: any) => {
            if (stompClient.current?.connected) {
                stompClient.current.publish({
                    destination: `/app/video/${sessionId}/signal`,
                    body: JSON.stringify({ type, data, sender: user?.username })
                });
            }
        };

        const startCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                peerConnection.current = new RTCPeerConnection(configuration);

                stream.getTracks().forEach(track => {
                    peerConnection.current?.addTrack(track, stream);
                });

                peerConnection.current.ontrack = (event) => {
                    setRemoteStream(event.streams[0]);
                    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
                };

                peerConnection.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        sendSignal('CANDIDATE', event.candidate);
                    }
                };

                // Create Offer ONLY if we are the initiator (e.g. Teacher)
                if (isInitiator) {
                    const offer = await peerConnection.current?.createOffer();
                    await peerConnection.current?.setLocalDescription(offer);
                    sendSignal('OFFER', offer);
                    setStatus("Calling Peer...");
                } else {
                    setStatus("Waiting for Call...");
                }

            } catch (err) {
                console.error("Call error", err);
                setStatus("Peripheral Access Denied");
            }
        };

        setupWebSockets();

        return () => {
            if (localStreamRef) localStreamRef.getTracks().forEach(track => track.stop());
            if (stompClient.current) stompClient.current.deactivate();
            peerConnection.current?.close();
        };
    }, [sessionId, configuration, user]);

    return (
        <div className="fixed inset-0 bg-[#0f172a]/95 z-[500] flex flex-col items-center justify-center p-8 font-['Verdana'] backdrop-blur-2xl">
            <div className="bg-mesh" />

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                {/* Local Video - Glass themed */}
                <div className="relative glass rounded-[3rem] overflow-hidden border-white/20 shadow-2xl aspect-video group">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-8 left-8 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">YO</div>
                        <div className="bg-white/10 px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-xl border border-white/20">
                            Local Feed
                        </div>
                    </div>
                </div>

                {/* Remote Video */}
                <div className="relative glass rounded-[3rem] overflow-hidden border-white/20 shadow-2xl aspect-video flex items-center justify-center group">
                    {remoteStream ? (
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center px-10">
                            <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-[2rem] animate-spin mx-auto mb-8 shadow-[0_0_30px_rgba(99,102,241,0.3)]"></div>
                            <p className="text-2xl font-black text-white mb-2 tracking-tighter uppercase italic">{status}</p>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Waiting for Peer Matrix</p>
                        </div>
                    )}
                    <div className="absolute bottom-8 left-8 flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">RP</div>
                        <div className="bg-purple-600/20 px-6 py-2 rounded-full text-purple-200 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl border border-purple-500/30">
                            Remote Peer
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-8">
                <button
                    onClick={onClose}
                    className="bg-white text-indigo-950 px-16 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-95 flex items-center gap-4"
                >
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    End Mission
                </button>
            </div>
        </div>
    );
};

export default VideoSession;
