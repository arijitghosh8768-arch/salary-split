import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Lock, Key, Server, Terminal, ShieldAlert, Cpu } from 'lucide-react';

export default function Security() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const res = await api.get('/analytics/audit-logs');
        setLogs(res.data.logs || []);
      } catch (err) {
        console.error('Failed to fetch security audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, []);

  const securityFeatures = [
    {
      title: 'Argon2 / Bcrypt Password Hashing',
      desc: 'Salting & high-work factor key stretching prevents hash table cracking and offline rainbow attacks.',
      icon: Lock,
      status: 'Active',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    {
      title: 'SQL Injection Defense',
      desc: '100% Parameterized queries across SQLite/PostgreSQL engine prevent malicious payload injections.',
      icon: Server,
      status: 'Active',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
    },
    {
      title: 'JWT Bearer Authentication',
      desc: 'Signed JWT session tokens stored securely with client-side expiration checks & 24h refresh validity.',
      icon: Key,
      status: 'Active',
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
    },
    {
      title: 'Brute-Force Rate Limiting',
      desc: 'Auth endpoint restricted to 15 attempts/15m; general API capped at 300 requests per IP window.',
      icon: ShieldAlert,
      status: 'Enforced',
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    },
    {
      title: 'HTTP Security Headers (Helmet)',
      desc: 'Protection against XSS, clickjacking, MIME-type sniffing via Helmet middleware headers.',
      icon: Cpu,
      status: 'Active',
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          Cybersecurity Architecture & Audit Logs 🔐
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore the threat model mitigations, input sanitization, rate limiting, and real-time security logs
        </p>
      </div>

      {/* Security Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {securityFeatures.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${sec.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-700">
                  {sec.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{sec.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{sec.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Live Security Audit Log Viewer */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Security Audit Trail (Last 50 Events)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Status: Monitoring IP & User Actions</span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No audit log entries recorded yet. Perform actions like saving salary or updating rules to populate audit trails!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Client IP</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{log.ip_address}</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">{log.details || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
