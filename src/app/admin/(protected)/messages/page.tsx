"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  MessageSquare, Send, CheckCircle2, XCircle, Megaphone, 
  FileText, Search, Filter, Plus, AlertCircle, RefreshCcw, Check
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { 
  getMessageLogs, getFailedAlerts, resolveFailedMessage, 
  retryMessage, sendBroadcast, getTemplates 
} from "@/actions/admin/messages";

export default function MessageCentre() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "logs" | "alerts" | "broadcast" | "templates") || "logs";

  const [activeTab, setActiveTab] = useState<"logs" | "alerts" | "broadcast" | "templates">(initialTab);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // State for Logs
  const [logs, setLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for Alerts
  const [alerts, setAlerts] = useState<any[]>([]);

  // State for Templates
  const [templates, setTemplates] = useState<any[]>([]);

  // Form states
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, [searchQuery, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "logs") {
        const res = await getMessageLogs(searchQuery, {}, 1, 50);
        setLogs(res.logs);
      } else if (activeTab === "alerts") {
        const failed = await getFailedAlerts();
        setAlerts(failed);
      } else if (activeTab === "templates") {
        const tpls = await getTemplates();
        setTemplates(tpls);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = (logId: string) => {
    startTransition(async () => {
      const res = await retryMessage(logId);
      if (res.error) alert(res.error);
      else {
        alert("Message resent successfully!");
        fetchData();
      }
    });
  };

  const handleResolve = (logId: string) => {
    startTransition(async () => {
      const res = await resolveFailedMessage(logId);
      if (res.error) alert(res.error);
      else fetchData();
    });
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Message Centre</h1>
          <p className="text-gray-500 mt-1">Complete visibility and control over all communications.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-px hide-scrollbar">
        {[
          { id: "logs", label: "Message Logs", icon: MessageSquare },
          { id: "alerts", label: "Failed Alerts", icon: AlertCircle },
          { id: "broadcast", label: "Broadcast Composer", icon: Megaphone },
          { id: "templates", label: "Template Manager", icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm transition-all relative whitespace-nowrap
              ${activeTab === tab.id ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-xl'}
            `}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-teal-500' : 'text-gray-400'}`} />
            {tab.label}
            {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-t-full" />}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        
        {/* LOGS TAB */}
        {activeTab === "logs" && (
          <div className="animate-in fade-in">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/50">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search by patient phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <Filter className="w-4 h-4" /> Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-6 py-4">Sent At</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Type & Channel</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 w-1/3">Error / Medicine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((msg) => (
                    <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{new Date(msg.sentAt).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{msg.user?.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{msg.user?.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-700">{msg.type}</span>
                        <div className="text-[10px] font-bold text-gray-400 mt-1">{msg.channel}</div>
                      </td>
                      <td className="px-6 py-4">
                        {msg.status === "DELIVERED" ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold uppercase"><CheckCircle2 className="w-4 h-4" /> Delivered</span>
                        ) : msg.status === "FAILED_RESOLVED" ? (
                          <span className="inline-flex items-center gap-1 text-gray-500 text-xs font-bold uppercase"><CheckCircle2 className="w-4 h-4" /> Resolved</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold uppercase"><XCircle className="w-4 h-4" /> Failed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {msg.medicine && <div className="font-semibold text-gray-700 mb-1">Med: {msg.medicine.name}</div>}
                        {msg.errorReason && <div className="text-red-500 font-medium truncate max-w-xs">{msg.errorReason}</div>}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-500 font-medium">No messages found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALERTS TAB */}
        {activeTab === "alerts" && (
          <div className="animate-in fade-in">
            <div className="p-6 border-b border-gray-100 bg-red-50/50">
              <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Failed Message Alerts
              </h2>
              <p className="text-sm text-red-700 mt-1">Requires attention. Retry delivery or mark as resolved.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 w-1/3">Failure Reason</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {alerts.map((msg) => (
                    <tr key={msg.id} className="hover:bg-red-50/30">
                      <td className="px-6 py-4 font-medium text-gray-900">{new Date(msg.sentAt).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{msg.user?.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{msg.user?.phone}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-700">{msg.type}</td>
                      <td className="px-6 py-4 text-red-600 font-medium text-xs">{msg.errorReason || "Unknown Bird API Error"}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          disabled={isPending}
                          onClick={() => handleRetry(msg.id)}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 inline-flex items-center gap-1"
                        >
                          <RefreshCcw className="w-3 h-3" /> Retry
                        </button>
                        <button 
                          disabled={isPending}
                          onClick={() => handleResolve(msg.id)}
                          className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                  {alerts.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-500 font-medium">No active failed message alerts. Everything is running smoothly.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BROADCAST TAB */}
        {activeTab === "broadcast" && (
          <div className="p-6 md:p-8 animate-in fade-in max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 flex gap-4 items-start">
              <Megaphone className="w-6 h-6 text-blue-600 shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900">Broadcast Messaging</h3>
                <p className="text-sm text-blue-800/80 mt-1">Send announcements to user segments using Meta-approved WhatsApp HSM templates.</p>
              </div>
            </div>

            <form action={async (formData) => {
              const confirm = window.confirm("Are you sure you want to send this broadcast? This cannot be undone.");
              if (!confirm) return;

              setAlertMsg("");
              const res = await sendBroadcast(formData);
              if (res.error) setAlertMsg(`Error: ${res.error}`);
              else setAlertMsg(`Success: ${res.message}`);
            }} className="space-y-6">
              
              {alertMsg && (
                <div className={`p-4 rounded-xl text-sm font-bold ${alertMsg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {alertMsg}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Audience</label>
                <select name="audience" className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none">
                  <option value="all_active">All Active Subscribers</option>
                  <option value="basic_only">Basic Plan Only</option>
                  <option value="expired">Expired Accounts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message Template</label>
                <select name="template" className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none">
                  <option value="">-- Custom Text Message (Requires 24h Window) --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.name}>{t.name} ({t.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Custom Message Content</label>
                <textarea name="customMessage" rows={4} placeholder="Type message..." className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"></textarea>
                <p className="text-xs text-gray-500 mt-2">Only applicable if you did not select a template above. Custom messages will only deliver if the user has texted the bot in the last 24 hours.</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button type="submit" disabled={isPending} className="w-full bg-teal-500 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-teal-400 disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  {isPending ? "Processing..." : "Confirm & Send Broadcast"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === "templates" && (
          <div className="animate-in fade-in p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">WhatsApp Templates</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-400">
                <Plus className="w-4 h-4" /> New Template
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {templates.map(tpl => (
                <div key={tpl.id} className="border border-gray-200 rounded-2xl p-5 hover:border-teal-300 transition-colors group bg-gray-50/30">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900">{tpl.name}</h3>
                    {tpl.metaStatus === "APPROVED" ? (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Approved</span>
                    ) : tpl.metaStatus === "REJECTED" ? (
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Rejected</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Pending</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded">{tpl.category}</span>
                  
                  <div className="mt-4 bg-white p-3 rounded-xl border border-gray-200 text-sm text-gray-600 font-mono whitespace-pre-wrap">
                    {tpl.content}
                  </div>

                  <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                    <span className="font-medium">Last edited by {tpl.lastEditedBy}</span>
                    <button className="text-teal-600 font-bold hover:underline">Edit Template</button>
                  </div>
                </div>
              ))}
              {templates.length === 0 && <div className="col-span-2 text-center py-12 text-gray-500 font-medium">No templates synced from Meta Manager yet.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
