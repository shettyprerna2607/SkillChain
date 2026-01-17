import React, { useState } from 'react';

interface RatingModalProps {
    onClose: () => void;
    onSubmit: (rating: number, feedback: string) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ onClose, onSubmit }) => {
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Rate Session</h2>
                <p className="text-gray-400 mb-6">How was your learning experience?</p>

                <div className="flex justify-center gap-4 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-3xl transition ${rating >= star ? 'text-yellow-400' : 'text-gray-600'}`}>
                            ★
                        </button>
                    ))}
                </div>

                <textarea
                    rows={3}
                    placeholder="Optional feedback..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none mb-6"
                    onChange={(e) => setFeedback(e.target.value)}
                ></textarea>

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5">
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(rating, feedback)}
                        className="flex-1 px-4 py-3 bg-green-600 rounded-xl text-white font-bold hover:bg-green-700">
                        Submit & Complete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
