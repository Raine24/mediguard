"use client";

import { useState, useEffect, useTransition, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Mail, Phone, Calendar, CreditCard, Pill, 
  Activity, History, MessageSquare, ShieldAlert, Ticket, 
  CheckCircle2, XCircle, Send, Plus, Download, Clock, List
} from "lucide-react";
import { getSubscriberProfile, addAdminNote } from "@/actions/admin/subscriberProfile";
import { bulkUpdateSubscriptions, bulkDeleteAccounts, resetUserPassword } from "@/actions/admin/subscribers";
import { useRouter } from "next/navigation";

type ProfileData = NonNullable<Awaited<ReturnType<typeof getSubscriberProfile>>>;

export default function SubscriberProfile({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchProfile = async () => {
    try {
      const data = await getSubscriberProfile(id);
      setUser(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12 text-center text-gray-500">
        User not found.
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "medicines", label: "Medicines", icon: Pill },
    { id: "history", label: "Reminder History", icon: History },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "activity", label: "Activity Log", icon: List },
    { id: "tickets", label: "Support Tickets", icon: Ticket },
    { id: "notes", label: "Admin Notes", icon: MessageSquare },
  ];

  const handleAction = (action: "ACTIVATE" | "DEACTIVATE" | "EXTEND") => {
    let days = 0;
    if (action === "EXTEND") {
      const p = prompt("How many days to extend the renewal date by?");
      if (!p) return;
      days = parseInt(p, 10);
      if (isNaN(days)) return alert("Invalid number of days");
    }

    startTransition(async () => {
      await bulkUpdateSubscriptions([user.id], action, days);
      fetchProfile();
    });
  };

  const handleDelete = () => {
    const pwd = prompt("SUPER ADMIN REQUIRED: Enter your password to delete this account completely:");
    if (!pwd) return;

    startTransition(async () => {
      const res = await bulkDeleteAccounts([user.id], pwd);
      if (res.error) alert(res.error);
      else router.push("/admin/subscribers");
    });
  };

  const getStatusBadge = (status: string | undefined) => {
    if (status === "ACTIVE") return <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md uppercase"><CheckCircle2 className="w-4 h-4" /> ACTIVE</span>;
    if (status === "EXPIRED") return <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md uppercase"><XCircle className="w-4 h-4" /> EXPIRED</span>;
    return <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md uppercase"><Clock className="w-4 h-4" /> {status || "NONE"}</span>;
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <Link href="/admin/subscribers" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-teal-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Subscribers
        </Link>
        <div className="flex gap-2">
          {user.subscription?.status !== "ACTIVE" ? (
            <button onClick={() => handleAction("ACTIVATE")} disabled={isPending} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">Activate</button>
          ) : (
            <button onClick={() => handleAction("DEACTIVATE")} disabled={isPending} className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">Deactivate</button>
          )}
          <button onClick={() => handleAction("EXTEND")} disabled={isPending} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">Extend Subs</button>
          <Link href={`/admin/messages?tab=broadcast`} className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors inline-flex items-center gap-1"><Send className="w-3 h-3" /> Message</Link>
          <button 
            onClick={() => {
              const newPwd = prompt("Enter new password for this user:");
              if (!newPwd) return;
              startTransition(async () => {
                const res = await resetUserPassword(user.id, newPwd);
                if (res.error) alert(res.error);
                else alert("Password reset successfully!");
              });
            }} 
            disabled={isPending} 
            className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors"
          >
            Reset Password
          </button>
          <button onClick={handleDelete} disabled={isPending} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500 transition-colors">Delete</button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-3xl shrink-0 shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-gray-900">{user.name}</h1>
                {user.whatsappVerified && <span title="WhatsApp Verified"><CheckCircle2 className="w-5 h-5 text-green-500" /></span>}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400" /> {user.email}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-400" /> {user.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-center min-w-[120px]">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
              {getStatusBadge(user.subscription?.status)}
            </div>
            <div className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-center min-w-[120px]">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Plan</p>
              <span className="text-sm font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md uppercase">
                {user.subscription?.planType || "NONE"}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-center min-w-[120px]">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Joined</p>
              <span className="text-sm font-bold text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-center min-w-[120px]">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">LTV</p>
              <span className="text-sm font-bold text-emerald-600">
                ${user.totalPaid.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mt-8 border-b border-gray-200 pb-px hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm transition-all relative whitespace-nowrap
                ${activeTab === tab.id ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-xl'}
              `}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-teal-500' : 'text-gray-400'}`} />
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Areas */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 min-h-[400px]">
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 p-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Account Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">System Info</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm font-medium">User ID</span>
                      <span className="font-mono text-xs font-bold text-gray-900 bg-gray-200 px-2 py-0.5 rounded">{user.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm font-medium">Country</span>
                      <span className="font-semibold text-gray-900 text-sm">{user.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm font-medium">Timezone</span>
                      <span className="font-semibold text-gray-900 text-sm">{user.timezone}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3">
                      <span className="text-gray-600 text-sm font-medium">Renewal Date</span>
                      <span className="font-semibold text-gray-900 text-sm">{user.subscription?.expiryDate ? new Date(user.subscription.expiryDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "medicines" && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Medicine Schedule</h2>
              <span className="text-xs font-bold bg-teal-100 text-teal-700 px-2 py-1 rounded">{user.medicines.length} Configured</span>
            </div>
            <div className="p-6">
              {user.medicines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Patient has not configured any medicines.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {user.medicines.map(med => (
                    <div key={med.id} className="border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-900">{med.name}</h3>
                        <p className="text-sm text-gray-500">{med.dosage} • {med.daysActive.replace("_", " ")}</p>
                      </div>
                      <div className="flex gap-2">
                        {med.reminders.map(r => (
                          <span key={r.id} className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">{r.time}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Reminder History</h2>
              <button className="text-sm font-bold text-teal-600 flex items-center gap-1 hover:text-teal-700"><Download className="w-4 h-4"/> Export</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Medicine</th>
                    <th className="px-6 py-3">Channel</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {user.messageLogs.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">No logs found.</td></tr>
                  ) : (
                    user.messageLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">{new Date(log.sentAt).toLocaleString()}</td>
                        <td className="px-6 py-3 text-gray-500 font-bold text-xs">{log.type}</td>
                        <td className="px-6 py-3 text-gray-600">{log.medicine?.name || "-"}</td>
                        <td className="px-6 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{log.channel}</span></td>
                        <td className="px-6 py-3">
                          {log.status === "DELIVERED" ? <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Delivered</span> : <span className="text-red-600 font-bold flex items-center gap-1" title={log.errorReason || ""}><XCircle className="w-4 h-4"/> Failed</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {user.payments.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">No payments found.</td></tr>
                  ) : (
                    user.payments.map(pay => (
                      <tr key={pay.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">{new Date(pay.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-3 font-bold text-purple-700">{pay.planType}</td>
                        <td className="px-6 py-3 font-medium">${pay.amount.toFixed(2)}</td>
                        <td className="px-6 py-3 text-gray-500">{pay.method}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${pay.status === "SUCCEEDED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {pay.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Support Tickets</h2>
            {user.supportTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No support tickets found.</div>
            ) : (
              <div className="space-y-4">
                {user.supportTickets.map(ticket => (
                  <div key={ticket.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase">{ticket.status}</span>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Log</h2>
            {user.auditLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No activity recorded.</div>
            ) : (
              <div className="space-y-4">
                {user.auditLogs.map(log => (
                  <div key={log.id} className="flex gap-4 border-l-2 border-gray-100 pl-4 py-1">
                    <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 -ml-[21px] shrink-0 border-2 border-white"></div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{log.action.replace(/_/g, " ")}</h3>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1">
                        <span className="font-medium text-gray-700">{new Date(log.createdAt).toLocaleString()}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                        {log.device && <span>Device: {log.device}</span>}
                      </div>
                      {log.details && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100">{log.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 p-6 flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Admin Notes</h2>
              <form action={async (formData) => {
                const note = formData.get("note") as string;
                if (!note) return;
                await addAdminNote(user.id, note);
                (document.getElementById("noteInput") as HTMLTextAreaElement).value = "";
                fetchProfile();
              }} className="space-y-3">
                <textarea id="noteInput" name="note" rows={4} placeholder="Add a private note about this patient..." className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"></textarea>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 text-sm">Add Note</button>
              </form>
            </div>
            <div className="flex-1 border-l border-gray-100 pl-8 space-y-4 max-h-[400px] overflow-y-auto">
              {user.adminNotesReceived.length === 0 ? (
                <div className="text-gray-500 text-sm">No notes recorded yet.</div>
              ) : (
                user.adminNotesReceived.map(note => (
                  <div key={note.id} className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <p className="text-gray-800 text-sm mb-3">{note.note}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                      <span>By {note.admin.name}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
