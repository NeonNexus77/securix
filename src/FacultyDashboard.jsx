import React, { useState } from 'react'; // Import sahi hai
import { Users, Award, LogOut, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FacultyDashboard = () => {
    const navigate = useNavigate();

    // FIX: useState ko yahan properly use kiya gaya hai
    const [taManagement] = useState([
        {
            taName: "Rahul Sharma",
            assignedGroups: [
                { id: "G-01", lead: "Ayush", attackHistory: "Attack a,attack b", marks: 85 },
                { id: "G-04", lead: "Amit", attackHistory: "Attack a,attack b,attack c", marks: 92 }
            ]
        },
        {
            taName: "Priya Verma",
            assignedGroups: [
                { id: "G-02", lead: "Rohan", attackHistory: "Attack a,attack b", marks: 78 },
                { id: "G-03", lead: "Sneha", attackHistory: "Attack a,attack b,attack c", marks: 88 }
            ]
        }
    ]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex font-sans">

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900/80 border-r border-slate-800 p-6 flex flex-col justify-between">
                <div>
                    <div className="text-2xl font-black text-blue-500 mb-10 italic">
                        SECURE<span className="text-white">LAB.</span>
                    </div>
                    <nav className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/10 shadow-lg">
                            <Users size={20} />
                            <span className="font-bold text-sm text-left">TA Monitoring</span>
                        </div>
                    </nav>
                </div>

                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
                >
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-10 text-left">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Faculty Oversight Panel</h1>
                    <p className="text-slate-500 mt-1 font-medium">Monitoring Teaching Assistants & Lab Assessments</p>
                </header>

                {/* TA & Group Table Section */}
                <div className="space-y-8">
                    {taManagement.map((ta, index) => (
                        <div key={index} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden backdrop-blur-md">
                            <div className="p-6 border-b border-slate-800 bg-slate-900/20 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30 text-blue-400 font-bold uppercase">
                                        {ta.taName.charAt(0)}
                                    </div>
                                    <h2 className="text-xl font-bold text-white italic">TA: {ta.taName}</h2>
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    {ta.assignedGroups.length} Groups Assigned
                                </span>
                            </div>

                            <table className="w-full text-left">
                                <thead className="bg-slate-800/30 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                                    <tr>
                                        <th className="px-8 py-4">Student Group</th>
                                        <th className="px-8 py-4">Attack History</th>
                                        <th className="px-8 py-4 text-center">Marks Given</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {ta.assignedGroups.map((group) => (
                                        <tr key={group.id} className="hover:bg-slate-800/20 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="font-black text-blue-400 tracking-tight">{group.id}</div>
                                                <div className="text-xs text-slate-500 font-medium">{group.lead} (Lead)</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
                                                    <Activity size={14} className="text-emerald-500" />
                                                    {group.attackHistory}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-xl">
                                                    <Award size={16} className="text-blue-400" />
                                                    <span className="text-lg font-black text-white">{group.marks}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">Points</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default FacultyDashboard;