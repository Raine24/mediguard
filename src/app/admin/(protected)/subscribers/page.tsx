"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { 
  Search, Filter, MoreVertical, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, Clock, ShieldAlert, ArrowUpDown, 
  Trash2, Send, Calendar, PlayCircle, PauseCircle, Download
} from "lucide-react";
import { getSubscribers, bulkUpdateSubscriptions, bulkDeleteAccounts } from "@/actions/admin/subscribers";

type SubscriberData = Awaited<ReturnType<typeof getSubscribers>>["subscribers"][0];

export default function SubscriberManagement() {
  const [subscribers, setSubscribers] = useState<SubscriberData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  // Fetch logic with basic debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, planFilter, statusFilter, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getSubscribers(searchQuery, { plan: planFilter, status: statusFilter }, page, 20);
      setSubscribers(res.subscribers);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(subscribers.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkAction = (action: "ACTIVATE" | "DEACTIVATE" | "EXTEND") => {
    if (selectedIds.size === 0) return;
    
    let days = 0;
    if (action === "EXTEND") {
      const p = prompt("How many days to extend the renewal date by?");
      if (!p) return;
      days = parseInt(p, 10);
      if (isNaN(days)) return alert("Invalid number of days");
    }

    startTransition(async () => {
      const res = await bulkUpdateSubscriptions(Array.from(selectedIds), action, days);
      if (res.error) alert(res.error);
      else {
        setSelectedIds(new Set());
        fetchData();
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const pwd = prompt("SUPER ADMIN REQUIRED: Enter your password to confirm bulk deletion:");
    if (!pwd) return;

    startTransition(async () => {
      const res = await bulkDeleteAccounts(Array.from(selectedIds), pwd);
      if (res.error) alert(res.error);
      else {
        setSelectedIds(new Set());
        fetchData();
      }
    });
  };

  const handleExportCSV = () => {
    if (selectedIds.size === 0) return;
    const selectedSubs = subscribers.filter(s => selectedIds.has(s.id));
    const csvRows = ["Patient Name,Email,WhatsApp,Plan,Status,Joined"];
    
    selectedSubs.forEach(sub => {
      csvRows.push(`${sub.name},${sub.email},${sub.phone},${sub.plan},${sub.status},${new Date(sub.createdAt).toLocaleDateString()}`);
    });

    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mediguard_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3" /> Active</span>;
      case "INACTIVE": return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700"><Clock className="w-3 h-3" /> Inactive</span>;
      case "EXPIRED": return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> Expired</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan.toUpperCase()) {
      case "FAMILY": return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Family</span>;
      case "STANDARD": return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Standard</span>;
      case "BASIC": return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Basic</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold uppercase tracking-wider">{plan}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriber Management</h1>
          <p className="text-gray-500 mt-1">View and manage {total} patient accounts</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col xl:flex-row justify-between gap-4 bg-gray-50/50 items-start xl:items-center">
          
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <div className="relative max-w-sm w-full shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-sm"
              />
            </div>
            
            <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500">
              <option value="All">All Plans</option>
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Family">Family</option>
            </select>

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500">
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-xl border border-teal-100 overflow-x-auto hide-scrollbar w-full xl:w-auto">
              <span className="text-sm font-bold text-teal-800 shrink-0 mr-2">{selectedIds.size} selected</span>
              
              <button onClick={() => handleBulkAction("ACTIVATE")} disabled={isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-50 shrink-0">
                <PlayCircle className="w-3.5 h-3.5" /> Activate
              </button>
              
              <button onClick={() => handleBulkAction("DEACTIVATE")} disabled={isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 shrink-0">
                <PauseCircle className="w-3.5 h-3.5" /> Deactivate
              </button>

              <button onClick={() => handleBulkAction("EXTEND")} disabled={isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-50 shrink-0">
                <Calendar className="w-3.5 h-3.5" /> Extend Days
              </button>

              <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 shrink-0">
                <Download className="w-3.5 h-3.5" /> Export
              </button>

              <div className="w-px h-6 bg-teal-200 mx-1 shrink-0"></div>

              <button onClick={handleBulkDelete} disabled={isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500 shrink-0">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}

        </div>

        {/* Data Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300"
                    checked={subscribers.length > 0 && selectedIds.size === subscribers.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-1">Patient <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Meds</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 font-medium">
                    No subscribers found matching your criteria.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className={`hover:bg-teal-50/30 transition-colors group ${selectedIds.has(sub.id) ? 'bg-teal-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300"
                        checked={selectedIds.has(sub.id)}
                        onChange={() => handleSelectOne(sub.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
                          {sub.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/admin/subscribers/${sub.id}`} className="font-bold text-gray-900 hover:text-teal-600 transition-colors">
                            {sub.name}
                          </Link>
                          <div className="text-xs text-gray-500 mt-0.5">{sub.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getPlanBadge(sub.plan)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                        {sub.medicinesCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/subscribers/${sub.id}`}>
                        <button className="text-sm font-bold text-teal-600 hover:text-teal-800 transition-colors">
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50 mt-auto">
          <span className="text-sm text-gray-500 font-medium">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} entries
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-500 disabled:text-gray-300 hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-teal-500 text-white font-bold text-sm shadow-sm">
              {page}
            </span>
            <button 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 rounded-lg border border-gray-300 text-gray-500 disabled:text-gray-300 hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
