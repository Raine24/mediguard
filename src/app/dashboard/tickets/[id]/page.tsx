"use client";

import { useEffect, useState, useTransition, use } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Send, User, Shield } from "lucide-react";
import { getUserTicketDetails, replyToTicketPatient } from "@/actions/tickets";

export default function PatientTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    const res = await getUserTicketDetails(id);
    if (res.ticket) setTicket(res.ticket);
    setLoading(false);
  };

  const handleReply = () => {
    if (!replyText.trim()) return;

    startTransition(async () => {
      const res = await replyToTicketPatient(id, replyText);
      if (res.error) {
        alert(res.error);
      } else {
        setReplyText("");
        fetchTicket(); // Refresh thread
      }
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
        <Link href="/dashboard/tickets" className="text-teal-600 hover:underline mt-2 inline-block">Back to Support Tickets</Link>
      </div>
    );
  }

  const isResolved = ticket.status === "RESOLVED";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard/tickets" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {ticket.subject}
            <span className="text-sm font-mono text-gray-400 font-normal">#{ticket.id.slice(-6).toUpperCase()}</span>
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-500" /> Conversation Thread
          </h2>
          {isResolved && (
            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-800 rounded uppercase tracking-wider">Resolved</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          {ticket.messages.length === 0 && (
            <div className="text-center text-gray-400 font-medium py-12">No messages in this thread yet.</div>
          )}
          
          {ticket.messages.map((msg: any) => {
            const isPatient = msg.sender.id === ticket.userId;

            return (
              <div key={msg.id} className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  isPatient 
                    ? 'bg-teal-600 text-white rounded-tr-none shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                }`}>
                  <div className={`flex items-center gap-2 mb-1.5 ${isPatient ? 'text-teal-100' : 'text-gray-500'}`}>
                    {isPatient ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5 text-teal-500" />}
                    <span className="text-xs font-bold">{isPatient ? 'You' : 'Support Team'}</span>
                    <span className="text-[10px]">• {new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-white border-t border-gray-200 shrink-0">
          <div className="border-2 rounded-2xl transition-colors overflow-hidden border-gray-200 focus-within:border-teal-500">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              className="w-full bg-transparent p-4 outline-none resize-none min-h-[100px] text-sm text-gray-900"
            ></textarea>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[10px] text-gray-400 font-medium">
                {isResolved ? "Replying will reopen this ticket." : "Our team usually replies within 24 hours."}
              </p>
              <button 
                disabled={isPending || !replyText.trim()}
                onClick={handleReply}
                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 bg-teal-500 hover:bg-teal-400"
              >
                <Send className="w-4 h-4" />
                Send Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
