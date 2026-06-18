"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { 
  Ticket, Search, Filter, CheckCircle2, Clock, AlertCircle, 
  MoreVertical, MessageSquare, Plus, Activity, User, Briefcase
} from "lucide-react";
import { getTickets, getTicketMetrics, getAdminUsers } from "@/actions/admin/tickets";

export default function SupportTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [searchQuery, statusFilter, assigneeFilter]);

  const fetchInitialData = async () => {
    try {
      const met = await getTicketMetrics();
      const adm = await getAdminUsers();
      setMetrics(met);
      setAdmins(adm);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getTickets(searchQuery, { status: statusFilter, assignee: assigneeFilter }, 1, 50);
      setTickets(res.tickets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN": return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700"><AlertCircle className="w-3.5 h-3.5" /> Open</span>;
      case "IN_PROGRESS": return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700"><Clock className="w-3.5 h-3.5" /> In Progress</span>;
      case "RESOLVED": return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700"><CheckCircle2 className="w-3.5 h-3.5" /> Resolved</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 mt-1">Manage patient inquiries and technical issues</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-400 transition-colors">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Open Tickets</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{metrics?.openCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-green-50 text-green-600 border border-green-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Resolved Today</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{metrics?.resolvedToday || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Avg Response Time</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{metrics?.avgResponseTime || "--"}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Busiest Topic</p>
            <h3 className="text-lg font-bold text-gray-900 mt-1 truncate">{metrics?.busiestTopic || "--"}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by subject or patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select 
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Assignees</option>
              <option value="Unassigned">Unassigned</option>
              {admins.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading && tickets.length === 0 ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((tk) => {
                  const isUnread = tk.messages && tk.messages.length > 0 && tk.messages[0].senderId === tk.user?.id && tk.status !== "RESOLVED";

                  return (
                    <tr key={tk.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/admin/tickets/${tk.id}`} className="block">
                          <div className={`font-bold transition-colors flex items-center gap-2 ${isUnread ? 'text-gray-900' : 'text-gray-700 group-hover:text-teal-600'}`}>
                            {isUnread && <span className="w-2 h-2 rounded-full bg-teal-500"></span>}
                            {tk.subject}
                          </div>
                          <div className="text-xs text-gray-500 font-mono mt-1">#{tk.id.slice(-6).toUpperCase()} • {new Date(tk.createdAt).toLocaleDateString()}</div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{tk.user?.name || "Unknown"}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{tk.user?.email || "No email"}</div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(tk.status)}</td>
                      <td className="px-6 py-4">
                        {tk.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-bold text-gray-700">{tk.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/tickets/${tk.id}`} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors">
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {tickets.length === 0 && !loading && (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-500 font-medium">No tickets found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
