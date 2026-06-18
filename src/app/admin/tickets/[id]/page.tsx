"use client";

import { useState, useEffect, useTransition, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, MessageSquare, Send, User, Clock, CheckCircle2, AlertCircle, 
  Briefcase, Mail, Phone, Lock, Unlock, EyeOff
} from "lucide-react";
import { 
  getTicketDetails, replyToTicket, updateTicketStatus, assignTicket, getAdminUsers 
} from "@/actions/admin/tickets";

export default function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [ticket, setTicket] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Reply Form
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [tk, adm] = await Promise.all([
        getTicketDetails(id),
        getAdminUsers()
      ]);
      setTicket(tk);
      setAdmins(adm);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = () => {
    if (!replyText.trim()) return;

    startTransition(async () => {
      const res = await replyToTicket(id, replyText, isInternal, sendWhatsapp);
      if (res.error) alert(res.error);
      else {
        setReplyText("");
        setIsInternal(false);
        setSendWhatsapp(false);
        fetchData();
      }
    });
  };

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      const res = await updateTicketStatus(id, status);
      if (res.error) alert(res.error);
      else fetchData();
    });
  };

  const handleAssign = (assigneeId: string) => {
    startTransition(async () => {
      const res = await assignTicket(id, assigneeId === "unassigned" ? null : assigneeId);
      if (res.error) alert(res.error);
      else fetchData();
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Ticket not found</h2>
        <Link href="/admin/tickets" className="text-teal-600 hover:underline mt-2 inline-block">Back to Inbox</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/tickets" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {ticket.subject}
            <span className="text-sm font-mono text-gray-400 font-normal">#{ticket.id.slice(-6).toUpperCase()}</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat Thread */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500" /> Conversation Thread
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
              {ticket.messages.length === 0 && (
                <div className="text-center text-gray-400 font-medium py-12">No messages in this thread yet.</div>
              )}
              {ticket.messages.map((msg: any) => {
                const isPatient = msg.sender.id === ticket.user.id;
                const isSystem = msg.sender.role === "SYSTEM";

                if (msg.isInternal) {
                  return (
                    <div key={msg.id} className="flex justify-center my-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-md w-full shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-yellow-800">
                          <EyeOff className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Internal Note by {msg.sender.name}</span>
                          <span className="text-[10px] ml-auto opacity-70">{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-yellow-900 font-medium">{msg.message}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isPatient ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      isPatient 
                        ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm' 
                        : 'bg-teal-600 text-white rounded-tr-none shadow-md'
                    }`}>
                      <div className={`flex items-center gap-2 mb-1.5 ${isPatient ? 'text-gray-500' : 'text-teal-100'}`}>
                        <span className="text-xs font-bold">{isPatient ? msg.sender.name : (isSystem ? 'System' : `${msg.sender.name} (Support)`)}</span>
                        <span className="text-[10px]">• {new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Composer */}
            <div className="p-4 bg-white border-t border-gray-200 shrink-0">
              <div className={`border-2 rounded-2xl transition-colors overflow-hidden ${isInternal ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 focus-within:border-teal-500'}`}>
                {isInternal && (
                  <div className="bg-yellow-100 px-4 py-1.5 flex items-center gap-2 border-b border-yellow-200">
                    <EyeOff className="w-3.5 h-3.5 text-yellow-700" />
                    <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider">Internal Note Mode (Hidden from patient)</span>
                  </div>
                )}
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={isInternal ? "Type a private note for other admins..." : "Type your reply to the patient..."}
                  className="w-full bg-transparent p-4 outline-none resize-none min-h-[100px] text-sm text-gray-900"
                ></textarea>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isInternal}
                        onChange={e => {
                          setIsInternal(e.target.checked);
                          if (e.target.checked) setSendWhatsapp(false);
                        }}
                        className="rounded text-yellow-500 focus:ring-yellow-500 border-gray-300"
                      />
                      <span className="text-xs font-bold text-gray-600 flex items-center gap-1"><Lock className="w-3.5 h-3.5"/> Internal Note</span>
                    </label>

                    {!isInternal && (
                      <label className="flex items-center gap-2 cursor-pointer border-l border-gray-300 pl-4">
                        <input 
                          type="checkbox" 
                          checked={sendWhatsapp}
                          onChange={e => setSendWhatsapp(e.target.checked)}
                          className="rounded text-teal-500 focus:ring-teal-500 border-gray-300"
                        />
                        <span className="text-xs font-bold text-gray-600">Send via WhatsApp</span>
                      </label>
                    )}
                  </div>
                  <button 
                    disabled={isPending || !replyText.trim()}
                    onClick={handleReply}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 ${isInternal ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-teal-500 hover:bg-teal-400'}`}
                  >
                    <Send className="w-4 h-4" />
                    {isInternal ? "Add Note" : "Send Reply"}
                  </button>
                </div>
              </div>
              {!isInternal && <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">Replies are automatically delivered via email by default.</p>}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          
          {/* Patient Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Patient Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{ticket.user.name}</div>
                  <Link href={`/admin/subscribers/${ticket.user.id}`} className="text-xs font-bold text-teal-600 hover:underline">View Full Profile</Link>
                </div>
              </div>
              <div className="space-y-2 pt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400"/> {ticket.user.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400"/> {ticket.user.phone || "No phone"}</div>
                {ticket.user.subscription && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${ticket.user.subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {ticket.user.subscription.planType} • {ticket.user.subscription.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Ticket Controls</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    disabled={isPending}
                    onClick={() => handleStatusChange("OPEN")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${ticket.status === 'OPEN' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                  >Open</button>
                  <button 
                    disabled={isPending}
                    onClick={() => handleStatusChange("IN_PROGRESS")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${ticket.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                  >Working</button>
                  <button 
                    disabled={isPending}
                    onClick={() => handleStatusChange("RESOLVED")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${ticket.status === 'RESOLVED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                  >Resolved</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Assigned Agent</label>
                <select 
                  disabled={isPending}
                  value={ticket.assigneeId || "unassigned"}
                  onChange={e => handleAssign(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                >
                  <option value="unassigned">-- Unassigned --</option>
                  {admins.map(adm => (
                    <option key={adm.id} value={adm.id}>{adm.name} ({adm.role})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
