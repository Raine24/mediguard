"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Download,
  Terminal,
  User
} from "lucide-react";

export default function AuditLog() {
  const [searchQuery, setSearchQuery] = useState("");

  const auditLogs = [
    { id: "log_1", admin: "Super Admin", action: "LOGIN_SUCCESS", target: null, ip: "192.168.1.1", device: "Chrome / MacOS", timestamp: "2 mins ago" },
    { id: "log_2", admin: "Admin Agent", action: "UPDATED_SUBSCRIPTION", target: "usr_124", ip: "10.0.0.5", device: "Safari / iOS", timestamp: "1 hour ago" },
    { id: "log_3", admin: "Super Admin", action: "CHANGED_SETTING", target: "SYSTEM_SMS_FALLBACK", ip: "192.168.1.1", device: "Chrome / MacOS", timestamp: "3 hours ago" },
    { id: "log_4", admin: "System", action: "CRON_RUN", target: "Daily Reminder Job", ip: "localhost", device: "Node.js", timestamp: "12 hours ago" },
  ];

  const getActionColor = (action: string) => {
    if (action.includes("FAILED") || action.includes("DELETED")) return "text-red-600 bg-red-50";
    if (action.includes("SUCCESS") || action.includes("CREATED")) return "text-green-600 bg-green-50";
    if (action.includes("UPDATED") || action.includes("CHANGED")) return "text-blue-600 bg-blue-50";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-500 mt-1">Immutable record of all administrative actions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by action, admin, or target..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-sm font-mono"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filter Events
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Admin / System</th>
                <th className="px-6 py-4">Target / Details</th>
                <th className="px-6 py-4">IP & Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center shrink-0">
                        {log.admin === "System" ? <Terminal className="w-3.5 h-3.5 text-gray-600" /> : <User className="w-3.5 h-3.5 text-gray-600" />}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{log.admin}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {log.target || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-mono text-gray-900">{log.ip}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{log.device}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
