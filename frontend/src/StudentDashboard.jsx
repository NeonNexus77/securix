import React, { useState, useRef, useEffect } from 'react';
import { Shield, Activity, Search, AlertTriangle, Award, CheckCircle, PlayCircle, Terminal, Wifi, Server, LogOut, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import API_BASE from './api';
import { io } from 'socket.io-client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StudentDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [targetIp, setTargetIp] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanType, setScanType] = useState('quick');
  const [scanResults, setScanResults] = useState(null);
  const [terminalLines, setTerminalLines] = useState([
    { text: 'SECURE-LAB OS v4.2.0-STABLE', color: 'text-slate-500' },
    { text: '> Ready. Enter a target IP and start scanning.', color: 'text-emerald-500' }
  ]);

  const terminalRef = useRef(null);
  const socketRef = useRef(null);

  // Scan history
  const [scanHistory, setScanHistory] = useState([]);
  // Vuln form
  const [vulnForm, setVulnForm] = useState({ attackType: '', severity: 'Critical', description: '' });
  const [vulnMsg, setVulnMsg] = useState('');

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Connect socket on mount
  useEffect(() => {
    const socket = io(API_BASE, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected');
    });

    socket.on('scan-line', ({ line, color }) => {
      setTerminalLines(prev => [...prev, { text: line, color: color || 'text-slate-400' }]);
    });

    socket.on('scan-complete', (data) => {
      setScanResults(data);
      setScanning(false);
      setTerminalLines(prev => [
        ...prev,
        { text: '> ─────────────────────────────────────────', color: 'text-slate-700' },
        { text: `> ✅ Scan Complete! ${data.parsed.openPorts} open ports found.`, color: 'text-emerald-400 font-bold' }
      ]);
      fetchScanHistory();
    });

    socket.on('scan-error', ({ error }) => {
      setScanning(false);
      setTerminalLines(prev => [
        ...prev,
        { text: `> [ERROR] ${error}`, color: 'text-red-500 font-bold' }
      ]);
    });

    socket.on('connect_error', (err) => {
      console.log('[Socket] Connection error, falling back to REST:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Fetch scan history on mount
  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setScanHistory(data.scans);
    } catch (err) { /* silent */ }
  };

  // Grades & Feedback (constant for now)
  const assessmentResults = {
    score: 85,
    feedback: "Excellent work on SQLi PoC. Try to document the XSS payload better.",
    status: "Graded"
  };

  // ========== REAL NMAP SCAN (WebSocket) ==========
  const runScan = async () => {
    if (!targetIp) return alert("Please enter a Target IP!");

    setScanning(true);
    setScanResults(null);
    setTerminalLines([
      { text: 'SECURE-LAB OS v4.2.0-STABLE', color: 'text-slate-500' },
    ]);

    // Try WebSocket first
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('start-scan', { targetIp, scanType });
      return;
    }

    // Fallback to REST API
    setTerminalLines(prev => [
      ...prev,
      { text: `> Initializing ${scanType.toUpperCase()} scan on ${targetIp}...`, color: 'text-slate-300' },
      { text: '> [SCANNING] Running Nmap... Please wait.', color: 'text-blue-400 animate-pulse' }
    ]);

    try {
      const response = await fetch(`${API_BASE}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetIp, scanType })
      });

      const data = await response.json();

      if (data.success) {
        const lines = [
          { text: 'SECURE-LAB OS v4.2.0-STABLE', color: 'text-slate-500' },
          { text: `> Scan Complete! Target: ${data.target}`, color: 'text-emerald-400 font-bold' },
          { text: `> Scan Type: ${data.scanType.toUpperCase()}`, color: 'text-slate-400' },
          { text: `> Host Status: ${data.parsed.hostStatus}`, color: data.parsed.hostStatus.includes('up') ? 'text-emerald-400' : 'text-red-400' },
          { text: `> ─────────────────────────────────────────`, color: 'text-slate-700' },
          { text: `> PORTS FOUND: ${data.parsed.totalPorts} total | ${data.parsed.openPorts} open | ${data.parsed.closedPorts} closed | ${data.parsed.filteredPorts} filtered`, color: 'text-yellow-400 font-bold' },
          { text: `> ─────────────────────────────────────────`, color: 'text-slate-700' },
        ];

        if (data.parsed.ports.length > 0) {
          lines.push({ text: `>   PORT       STATE      SERVICE`, color: 'text-slate-500 font-bold' });
          data.parsed.ports.forEach(port => {
            const stateColor = port.state === 'open' ? 'text-red-400' : port.state === 'filtered' ? 'text-yellow-500' : 'text-slate-600';
            const portStr = `${port.port}/${port.protocol}`.padEnd(10);
            const stateStr = port.state.padEnd(10);
            lines.push({ text: `>   ${portStr} ${stateStr} ${port.service}`, color: stateColor });
          });
        } else {
          lines.push({ text: `> No open ports found.`, color: 'text-slate-500' });
        }

        if (data.parsed.osGuess) {
          lines.push({ text: `> ─────────────────────────────────────────`, color: 'text-slate-700' });
          lines.push({ text: `> ${data.parsed.osGuess}`, color: 'text-cyan-400' });
        }
        if (data.parsed.scanTime) {
          lines.push({ text: `> ─────────────────────────────────────────`, color: 'text-slate-700' });
          lines.push({ text: `> ${data.parsed.scanTime}`, color: 'text-slate-500' });
        }

        setTerminalLines(lines);
        setScanResults(data);
        fetchScanHistory();
      } else {
        setTerminalLines([
          { text: 'SECURE-LAB OS v4.2.0-STABLE', color: 'text-slate-500' },
          { text: `> [ERROR] ${data.error}`, color: 'text-red-500 font-bold' }
        ]);
      }
    } catch (err) {
      setTerminalLines([
        { text: 'SECURE-LAB OS v4.2.0-STABLE', color: 'text-slate-500' },
        { text: `> [ERROR] Backend not reachable!`, color: 'text-red-500 font-bold' },
        { text: `> Make sure backend is running:`, color: 'text-yellow-400' },
        { text: `>   cd backend && node server.js`, color: 'text-yellow-400' },
      ]);
    } finally {
      setScanning(false);
    }
  };

  // Scan type chart data
  const scanTypeData = scanHistory.reduce((acc, scan) => {
    const type = scan.scanType || 'quick';
    const existing = acc.find(a => a.type === type);
    if (existing) existing.count++;
    else acc.push({ type, count: 1 });
    return acc;
  }, []);
  const chartColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold tracking-tighter text-blue-500 italic mb-8">SECURE<span className="text-white">LAB</span></div>
          <nav className="flex flex-col gap-2">
            <NavItem icon={<Activity size={20} />} label="Overview" active />
            <NavItem icon={<Shield size={20} />} label="Attacks Log" />
            <NavItem icon={<Award size={20} />} label="Grades" />
          </nav>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-white">Student Terminal</h1>
            <p className="text-slate-500 font-medium">Session Active: {user?.name || 'Student'} ({user?.email})</p>
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

              {/* IP Input + Scan Type + Button */}
              <div className="flex gap-4 mb-6 flex-wrap">
                <input
                  type="text"
                  placeholder="Target IP (e.g. 192.168.1.1 or scanme.nmap.org)"
                  className="flex-1 min-w-[200px] bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={targetIp}
                  onChange={(e) => setTargetIp(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runScan()}
                />
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 cursor-pointer"
                >
                  <option value="quick">⚡ Quick Scan</option>
                  <option value="full">🔍 Full Port Scan</option>
                  <option value="service">🧩 Service Detection</option>
                  <option value="vuln">🛡️ Vulnerability Scan</option>
                  <option value="os">💻 OS Detection</option>
                </select>
                <button
                  onClick={runScan}
                  disabled={scanning}
                  className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 ${scanning
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                >
                  {scanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                      Scanning...
                    </>
                  ) : (
                    <><PlayCircle size={18} /> Start Scan</>
                  )}
                </button>
              </div>

              {/* Live WebSocket Terminal View */}
              <div
                ref={terminalRef}
                className="bg-black/80 rounded-2xl p-5 font-mono text-sm h-72 border border-slate-800 shadow-inner overflow-y-auto scroll-smooth"
              >
                {terminalLines.map((line, i) => (
                  <p key={i} className={`${line.color} ${i === 0 ? 'opacity-50 tracking-tighter mb-2' : 'mt-0.5'}`}>
                    {line.text}
                  </p>
                ))}
                {scanning && (
                  <p className="animate-pulse text-blue-400 font-bold mt-2">
                    {'> [SCANNING] Live output streaming...'}
                  </p>
                )}
              </div>

              {/* WebSocket Status */}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <div className={`w-2 h-2 rounded-full ${socketRef.current?.connected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                {socketRef.current?.connected ? 'Live Mode (WebSocket)' : 'Standard Mode (REST)'}
              </div>
            </div>

            {/* Scan Summary Cards (shown after scan) */}
            {scanResults && (
              <div className="grid grid-cols-3 gap-4">
                <ScanStatCard
                  icon={<Wifi size={20} />}
                  label="Host Status"
                  value={scanResults.parsed.hostStatus.includes('up') ? 'UP' : 'DOWN'}
                  color={scanResults.parsed.hostStatus.includes('up') ? 'emerald' : 'red'}
                />
                <ScanStatCard
                  icon={<Server size={20} />}
                  label="Open Ports"
                  value={scanResults.parsed.openPorts.toString()}
                  color="red"
                />
                <ScanStatCard
                  icon={<Terminal size={20} />}
                  label="Total Ports"
                  value={scanResults.parsed.totalPorts.toString()}
                  color="blue"
                />
              </div>
            )}

            {/* TA Feedback Section */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl backdrop-blur-sm">
              <h3 className="text-emerald-400 font-bold flex items-center gap-2 mb-2 uppercase text-xs tracking-widest">
                <CheckCircle size={16} /> TA Feedback
              </h3>
              <p className="text-slate-300 italic text-sm">"{assessmentResults.feedback}"</p>
            </div>
          </div>

          {/* Right Column: Logging Form + Scan History + Analytics */}
          <div className="space-y-8">
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-md h-fit">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white italic tracking-tight">
                <AlertTriangle size={20} className="text-yellow-500" /> Log Vulnerability
              </h2>
              {vulnMsg && (
                <div className={`mb-4 px-4 py-2 rounded-xl text-sm text-center ${vulnMsg.includes('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {vulnMsg}
                </div>
              )}
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                setVulnMsg('');
                try {
                  const res = await fetch(`${API_BASE}/api/vulnerabilities`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(vulnForm)
                  });
                  const data = await res.json();
                  if (data.success) {
                    setVulnMsg('✅ Vulnerability submitted!');
                    setVulnForm({ attackType: '', severity: 'Critical', description: '' });
                  } else {
                    setVulnMsg(data.error);
                  }
                } catch { setVulnMsg('Backend not reachable'); }
              }}>
                <input type="text" required placeholder="Attack Type (e.g. SQLi)" value={vulnForm.attackType} onChange={e => setVulnForm({ ...vulnForm, attackType: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none text-white" />
                <select value={vulnForm.severity} onChange={e => setVulnForm({ ...vulnForm, severity: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300">
                  <option value="Critical">Severity: Critical</option>
                  <option value="High">Severity: High</option>
                  <option value="Medium">Severity: Medium</option>
                  <option value="Low">Severity: Low</option>
                </select>
                <textarea required placeholder="Paste your PoC payload or description..." value={vulnForm.description} onChange={e => setVulnForm({ ...vulnForm, description: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm h-32 focus:border-blue-500 outline-none text-white resize-none"></textarea>
                <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-blue-900/30 uppercase tracking-widest">
                  Submit for Review
                </button>
              </form>
            </div>

            {/* Scan History */}
            {scanHistory.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-blue-400" /> Scan History
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {scanHistory.map((scan, i) => (
                    <div key={scan._id || i} className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-blue-400">{scan.target}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">{scan.scanType}</span>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-slate-400">
                        <span>{scan.parsed?.openPorts || 0} open ports</span>
                        <span>{new Date(scan.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mini Scan Type Chart */}
            {scanTypeData.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-purple-400" /> My Scans by Type
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={scanTypeData}>
                    <XAxis dataKey="type" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {scanTypeData.map((_, idx) => (
                        <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

// ========== REUSABLE COMPONENTS ==========

const NavItem = ({ icon, label, active }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-bold' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}>
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

const ScanStatCard = ({ icon, label, value, color }) => {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className={`${colors} border p-5 rounded-2xl backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-2 opacity-70">{icon} <span className="text-xs font-bold uppercase tracking-widest">{label}</span></div>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
};

export default StudentDashboard;