import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      title: "Skill Staking",
      desc: "Bet on your own growth. Lock points and earn massive bonuses by completing paths on time.",
      icon: "🎲",
      color: "bg-purple-600"
    },
    {
      title: "Live Video Exchange",
      desc: "Don't just watch videos. Interact live with peer mentors via high-quality WebRTC calls.",
      icon: "🎥",
      color: "bg-indigo-600"
    },
    {
      title: "AI Journey Coach",
      desc: "A personal learning assistant that analyzes your skills and charts your next big achievement.",
      icon: "🤖",
      color: "bg-pink-600"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 pb-24 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-block bg-indigo-600/20 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            Version 2.0 Live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Master Anything via <br />
            <span className="text-indigo-500">Mutual Exchange</span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The world's first peer-to-peer skill chain platform. Trade what you know for what you want to learn. No fees, just growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg">Start Your Chain</Link>
            <Link to="/skill-chains" className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-xl font-bold text-lg transition">Explore Library</Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-3xl font-bold text-white">5k+</p>
              <p className="text-sm text-gray-500 font-bold uppercase">Masters</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">12k+</p>
              <p className="text-sm text-gray-500 font-bold uppercase">Sessions</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">85+</p>
              <p className="text-sm text-gray-500 font-bold uppercase">Skills</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">4.9/5</p>
              <p className="text-sm text-gray-500 font-bold uppercase">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-16 text-center">Reinventing Learning.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-indigo-950/50 border border-white/10 p-10 rounded-3xl hover:border-indigo-500/50 transition">
                <div className={`${f.color} w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center bg-indigo-600 rounded-3xl p-16 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to evolve?</h2>
          <p className="text-lg text-indigo-100 mb-10 max-w-xl mx-auto">
            Join thousands of learners trading expertise every day. Your first session is only 30 seconds away.
          </p>
          <Link to="/register" className="bg-white text-indigo-600 px-12 py-4 rounded-xl font-bold text-xl hover:shadow-xl transition inline-block">Create Free Account</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">© 2026 SkillChain. All rights reserved.</p>
          <div className="flex gap-8 text-sm text-gray-500 font-bold uppercase tracking-wider">
            <a href="#!" className="hover:text-white transition">Privacy</a>
            <a href="#!" className="hover:text-white transition">Terms</a>
            <a href="#!" className="hover:text-white transition">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
