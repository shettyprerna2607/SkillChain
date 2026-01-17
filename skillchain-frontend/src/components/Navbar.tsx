import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-indigo-950/90 backdrop-blur-md shadow-xl' : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            SkillChain
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/skill-chains" className={`text-sm font-semibold hover:text-indigo-400 transition ${location.pathname === '/skill-chains' ? 'text-indigo-400' : 'text-gray-300'}`}>Skill Chains</Link>
          <Link to="/community" className={`text-sm font-semibold hover:text-indigo-400 transition ${location.pathname === '/community' ? 'text-indigo-400' : 'text-gray-300'}`}>Community</Link>
          <Link to="/leaderboard" className={`text-sm font-semibold hover:text-indigo-400 transition ${location.pathname === '/leaderboard' ? 'text-indigo-400' : 'text-gray-300'}`}>Leaderboard</Link>
          <Link to="/ai-coach" className={`text-sm font-semibold hover:text-indigo-400 transition ${location.pathname === '/ai-coach' ? 'text-indigo-400' : 'text-gray-300'}`}>AI Coach</Link>
        </div>

        {/* Account Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationBell />
              <Link to="/dashboard" className={`text-sm font-semibold hover:text-indigo-400 transition ${location.pathname === '/dashboard' ? 'text-indigo-400' : 'text-gray-300'}`}>Dashboard</Link>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl text-sm font-bold transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition">Sign In</Link>
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-lg">Join Now</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
