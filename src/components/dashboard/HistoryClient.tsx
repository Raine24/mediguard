"use client";

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { CheckCircle2, XCircle, Filter, Calendar, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

type MessageLogProps = {
  id: string;
  type: string;
  channel: string;
  status: string;
  errorReason: string | null;
  sentAt: Date;
  medicine: { name: string } | null;
};

export default function HistoryClient({ logs }: { logs: MessageLogProps[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [medFilter, setMedFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Extract unique medicine names for the filter dropdown
  const uniqueMedicines = useMemo(() => {
    const names = new Set<string>();
    logs.forEach(log => {
      if (log.medicine?.name) names.add(log.medicine.name);
    });
    return Array.from(names).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (statusFilter !== "ALL" && log.status !== statusFilter) return false;
      if (medFilter !== "ALL" && log.medicine?.name !== medFilter) return false;
      return true;
    });
  }, [logs, statusFilter, medFilter]);

  if (logs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Reminder History</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Review your past reminders</p>
        </div>
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No history yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Your reminder history will appear here once your first reminder is sent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Reminder History</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Last 30 days of activity</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status
          </label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5"
          >
            <option value="ALL">All Statuses</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Medicine
          </label>
          <select 
            value={medFilter}
            onChange={(e) => setMedFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5"
          >
            <option value="ALL">All Medicines</option>
            {uniqueMedicines.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No reminders match your filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map(log => {
              const isFailed = log.status === "FAILED";
              const isExpanded = expandedId === log.id;

              return (
                <div key={log.id} className="flex flex-col">
                  <div 
                    onClick={() => isFailed && setExpandedId(isExpanded ? null : log.id)}
                    className={`p-4 flex items-center gap-4 transition-colors ${isFailed ? 'cursor-pointer hover:bg-red-50/50' : ''}`}
                  >
                    <div className="flex-shrink-0">
                      {isFailed ? (
                        <XCircle className="w-8 h-8 text-red-500 bg-red-50 rounded-full" />
                      ) : (
                        <CheckCircle2 className="w-8 h-8 text-green-500 bg-green-50 rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                        <div>
                          <p className="text-base font-bold text-gray-900 truncate">
                            {log.medicine?.name || "System Reminder"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(log.sentAt), "MMM d, h:mm a")}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {log.channel === "WHATSAPP" ? "WhatsApp" : "SMS"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 md:mt-0">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${isFailed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {log.status}
                          </span>
                          {isFailed && (
                            isExpanded ? <ChevronUp className="w-4 h-4 text-red-400" /> : <ChevronDown className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Failure Reason */}
                  {isFailed && isExpanded && (
                    <div className="px-4 pb-4 pl-16">
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-800">
                        <span className="font-bold">Failure Reason:</span> {log.errorReason || "Message failed to deliver, please check your WhatsApp number."}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Icon for empty state
function History(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
