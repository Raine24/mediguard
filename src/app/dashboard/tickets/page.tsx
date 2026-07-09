"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { getUserTickets } from "@/actions/tickets";

export default function PatientTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      const res = await getUserTickets();
      if (res.tickets) setTickets(res.tickets);
      setLoading(false);
    }
    fetchTickets();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700 flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Open</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-yellow-50 text-yellow-700 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Working</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-green-50 text-green-700 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-50 text-gray-700">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Ticket className="w-6 h-6 text-teal-600" />
          My Support Tickets
        </h1>
        <p className="text-gray-600 mt-2">View your past inquiries and continue the conversation with our support team.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No tickets yet</h3>
          <p className="text-gray-500 mb-6">If you need help, click the Support button in the sidebar to create a ticket.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className="block hover:bg-gray-50 transition-colors p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{ticket.subject}</h3>
                    <p className="text-xs text-gray-500 font-medium">Ticket #{ticket.id.slice(-6).toUpperCase()} • Last updated {new Date(ticket.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(ticket.status)}
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
