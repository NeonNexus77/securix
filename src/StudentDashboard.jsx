import React, { useState } from 'react';
import { Shield, Activity, Search, AlertTriangle, Award, CheckCircle, PlayCircle } from 'lucide-react';

const StudentDashboard = () => {
  const [targetIp, setTargetIp] = useState('');
  const [scanning, setScanning] = useState(false);

  // Data for Grades & Feedback (Abhi constant rakha hai warnings hatane ke liye)
  const assessmentResults = {
    score: 85,
    feedback: "Excellent work on SQLi PoC. Try to document the XSS payload better.",
    status: "Graded"
  };

  const runScan = () => {
    if (!targetIp) return alert("Please enter a Target IP!");
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col gap-8">
        <div className="text-2xl font-bold tracking-tighter text-blue-500 italic">SECURE<span className="text-white">LAB</span></div>
        <nav className="flex flex-col gap-2">
          <NavItem icon={<Activity size={20} />} label="Overview" active />
          <NavItem icon={<Shield size={20} />} label="Attacks Log" />
          <NavItem icon={<Award size={20} />} label="Grades" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-white">Student Terminal</h1>
            <p className="text-slate-500 font-medium">Session Active: Group-07 (Ayush)</p>
          </div>

          {/* Marks Display Card */}
          <div className="bg-blue-600/10 border border-blue-500/20 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-lg shadow-blue-900/10">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Award size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest leading-none mb-1">Final Score</p>
              <p className="text-2xl font-black text-white leading-none">{assessmentResults.score}<span className="text-sm text-slate-500">/100</span></p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Config & Terminal */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <Search size={20} className="text-blue-400" /> Target Configuration
              </h2>
              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Target IP (e.g. 172.16.5.101)"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={targetIp}
                  onChange={(e) => setTargetIp(e.target.value)}
                />
                <button
                  onClick={runScan}
                  className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                >
                  {scanning ? 'Scanning...' : <><PlayCircle size={18} /> Start Attack</>}
                </button>
              </div>

              {/* Fake Terminal View */}
              <div className="bg-black/80 rounded-2xl p-5 font-mono text-sm h-48 border border-slate-800 text-emerald-500 shadow-inner overflow-hidden">
                <p className="opacity-50 tracking-tighter">SECURE-LAB OS v4.2.0-STABLE</p>
                <p className="mt-2 text-slate-300">{`> Initializing audit on ${targetIp || '0.0.0.0'}...`}</p>
                {scanning && (
                  <div className="mt-2 space-y-1">
                    <p className="animate-pulse text-blue-400 font-bold">{`> [SCANNING] Checking open ports...`}</p>
                    <p className="text-yellow-500">{`> [WARN] Port 8080 (HTTP-PROXY) is exposed.`}</p>
                    <p className="text-blue-400">{`> [INFO] Searching for known CVEs...`}</p>
                  </div>
                )}
                {!scanning && targetIp && <p className="mt-2 text-emerald-400">{`> Audit ready. 1 potential entry point detected.`}</p>}
              </div>
            </div>

            {/* TA Feedback Section */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl backdrop-blur-sm">
              <h3 className="text-emerald-400 font-bold flex items-center gap-2 mb-2 uppercase text-xs tracking-widest">
                <CheckCircle size={16} /> TA Feedback
              </h3>
              <p className="text-slate-300 italic text-sm">"{assessmentResults.feedback}"</p>
            </div>
          </div>

          {/* Right Column: Logging Form */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-md h-fit">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white italic tracking-tight">
              <AlertTriangle size={20} className="text-yellow-500" /> Log Vulnerability
            </h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Attack Type (e.g. SQLi)" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none text-white" />
              <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300">
                <option>Severity: Critical</option>
                <option>Severity: High</option>
                <option>Severity: Medium</option>
              </select>
              <textarea placeholder="Paste your PoC payload or description..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm h-32 focus:border-blue-500 outline-none text-white resize-none"></textarea>
              <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-blue-900/30 uppercase tracking-widest">
                Submit for Review
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-bold' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}>
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

export default StudentDashboard;