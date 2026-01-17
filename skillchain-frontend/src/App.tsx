import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Component Imports
import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SkillChains from './components/SkillChains';
import AdminDashboard from './components/AdminDashboard';
import AddSkillForm from './components/AddSkillForm';
import CommunityChat from './components/CommunityChat';
import Leaderboard from './components/Leaderboard';
import AICoach from './components/AICoach';
import ProtectedRoute from './components/ProtectedRoute';

// Provider Imports
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-indigo-950 font-['Verdana'] selection:bg-indigo-500 selection:text-white relative">
          {/* Global Design Elements */}
          <div className="bg-mesh" />
          <Navbar />

          <main className="pt-24 pb-16 px-4 relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Public Routes */}
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

              {/* Protected Internal Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/skill-chains" element={<SkillChains />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/add-skill" element={<AddSkillForm />} />
                <Route path="/community" element={<CommunityChat />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/ai-coach" element={<AICoach />} />
                <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Intelligent Catch-all */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" /> : children;
};

export default App;