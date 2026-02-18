import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Link import kiya
import { Lock, User, ShieldCheck, Zap } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Sahi dashboard par redirect karne ke liye logic
    if (role === 'student') {
      navigate('/student-dashboard');
    } else if (role === 'ta') {
      navigate('/ta-dashboard');
    } else {
      navigate('/faculty-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[130px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-sm">Security Assessment Management System</p>
        </div>

        {/* ROLE TOGGLE */}
        <div className="bg-slate-800/50 p-1.5 rounded-2xl flex mb-8 relative border border-slate-700">
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(33.33%-6px)] bg-blue-600 rounded-xl transition-all duration-300 shadow-lg ${role === 'student' ? 'left-1.5' : role === 'ta' ? 'left-[34.5%]' : 'left-[67.5%]'
              }`}
          />
          <button type="button" onClick={() => setRole('student')} className={`flex-1 py-2.5 z-10 font-semibold ${role === 'student' ? 'text-white' : 'text-slate-400'}`}>Student</button>
          <button type="button" onClick={() => setRole('ta')} className={`flex-1 py-2.5 z-10 font-semibold ${role === 'ta' ? 'text-white' : 'text-slate-400'}`}>TA</button>
          <button type="button" onClick={() => setRole('faculty')} className={`flex-1 py-2.5 z-10 font-semibold ${role === 'faculty' ? 'text-white' : 'text-slate-400'}`}>Faculty</button>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input required type="text" placeholder={role === 'student' ? "Email ID" : "Email ID"} className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input required type="password" placeholder="Password" className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/30 transform active:scale-[0.98]"
          >
            Initialize {role.charAt(0).toUpperCase() + role.slice(1)} Session
          </button>
        </form>

        {/* NAYA SIGNUP LINK */}
        <p className="mt-6 text-center text-slate-400 text-sm">
          New user? <Link to="/signup" className="text-blue-400 hover:underline">Create an account</Link>
        </p>

        <p className="mt-8 text-center text-slate-500 text-xs tracking-wider">
          PROTECTED ACADEMIC ENVIRONMENT
        </p>
      </div>
    </div>
  );
};

export default Login;