"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  DollarSign, 
  UserPlus, 
  Send, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Download,
  Plus
} from "lucide-react";
import { getDashboardMetrics } from "@/actions/admin/dashboard";
import { addSubscriber } from "@/actions/admin/subscribers";
import { exportDailyReport } from "@/actions/admin/export";
import { useRouter } from "next/navigation";

type DashboardData = Awaited<ReturnType<typeof getDashboardMetrics>>;

export default function OverviewDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  
  // Quick Actions State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const fetchMetrics = async () => {
    try {
      const result = await getDashboardMetrics();
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Poll every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col h-64 items-center justify-center text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Failed to load dashboard</h2>
          <p className="text-gray-500 mt-1">There was a problem connecting to the database.</p>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchMetrics(); }}
          className="px-4 py-2 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { kpis, alerts, feed } = data;

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-gray-500 mt-1 text-sm flex items-center gap-2">
            Last updated: {lastRefreshed.toLocaleTimeString()} 
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-100 rounded-xl text-sm font-semibold hover:bg-teal-100 transition-colors">
            <Plus className="w-4 h-4" /> Add Subscriber Manually
          </button>
          <button onClick={() => router.push('/admin/messages?tab=broadcast')} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
            <Send className="w-4 h-4" /> Send Broadcast Message
          </button>
          <button onClick={async () => {
              const csv = await exportDailyReport();
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `medicintime-report-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
            <Download className="w-4 h-4" /> Export Today's Report
          </button>
          <button onClick={() => router.push('/admin/messages?filter=failed')} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
            <AlertTriangle className="w-4 h-4" /> View Failed Reminders
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Column: KPIs and Alerts */}
        <div className="flex-1 space-y-6">
          
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <KPICard 
              title="Total Active Subscribers" 
              value={kpis.activeSubs.toString()} 
              icon={Users} 
              change={kpis.subsChange} 
              changeLabel="from last month"
              colorClass="text-teal-600 bg-teal-50 border-teal-100" 
            />
            
            <KPICard 
              title="Total Revenue This Month" 
              value={`$${kpis.revenueThisMonth.toLocaleString()}`} 
              icon={DollarSign} 
              change={kpis.revChange} 
              changeLabel="from last month"
              colorClass="text-emerald-600 bg-emerald-50 border-emerald-100" 
            />

            <KPICard 
              title="New Sign-ups Today" 
              value={kpis.signupsToday.toString()} 
              icon={UserPlus} 
              subtext={`${kpis.signupsThisWeek} this week`}
              colorClass="text-blue-600 bg-blue-50 border-blue-100" 
            />

            <KPICard 
              title="Reminders Sent Today" 
              value={kpis.remindersSentToday.toLocaleString()} 
              icon={Send} 
              subtext="Total across all patients"
              colorClass="text-purple-600 bg-purple-50 border-purple-100" 
            />

            <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-200 ${kpis.remindersFailedToday > 0 ? 'border-red-300 ring-1 ring-red-100' : ''}`}>
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl ${kpis.remindersFailedToday > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-500'}`}>
                  <XCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Failed Reminders Today</p>
                <h3 className={`text-2xl font-black mt-1 ${kpis.remindersFailedToday > 0 ? 'text-red-600' : 'text-gray-900'}`}>{kpis.remindersFailedToday}</h3>
              </div>
            </div>

            <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-200 ${kpis.expiringSubs > 0 ? 'border-amber-300 ring-1 ring-amber-100' : ''}`}>
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl ${kpis.expiringSubs > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-50 text-gray-500'}`}>
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Expiring in 7 Days</p>
                <h3 className={`text-2xl font-black mt-1 ${kpis.expiringSubs > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{kpis.expiringSubs}</h3>
              </div>
            </div>

          </div>

          {/* Alerts Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-red-50/30">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="font-bold text-sm uppercase tracking-wider">Action Required</h2>
              </div>
            </div>
            <div className="p-2 space-y-2">
              
              {alerts.failedRemindersCount > 0 ? (
                <AlertItem 
                  title={`${alerts.failedRemindersCount} Reminders failed to deliver in the last hour`}
                  icon={XCircle}
                  actionLabel="View Failed Reminders"
                />
              ) : null}

              {alerts.failedPaymentsCount > 0 ? (
                <AlertItem 
                  title={`${alerts.failedPaymentsCount} Subscribers whose payment failed at renewal`}
                  icon={CreditCard}
                  actionLabel="Retry Payments"
                />
              ) : null}

              {alerts.noMedicinesCount > 0 ? (
                <AlertItem 
                  title={`${alerts.noMedicinesCount} Subscribers have not set up medicines 48h after subscribing`}
                  icon={ShieldAlert}
                  actionLabel="Contact Patients"
                />
              ) : null}

              {alerts.apiErrorRate > 5 ? (
                <AlertItem 
                  title={`WhatsApp API error rate is ${alerts.apiErrorRate}% in the last hour`}
                  icon={MessageSquare}
                  actionLabel="View API Logs"
                />
              ) : null}

              {/* Assuming Scheduler is up, if we had real scheduler checks we'd show it here. Let's pretend it's fine for now unless we manually trigger it */}
              
              {(alerts.failedRemindersCount === 0 && alerts.failedPaymentsCount === 0 && alerts.noMedicinesCount === 0 && alerts.apiErrorRate <= 5) && (
                <div className="p-6 text-center text-gray-500">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="font-medium text-sm">All systems normal. No urgent actions required.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Activity Feed */}
        <div className="xl:w-96 shrink-0 flex flex-col h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Live Activity Feed</h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Live
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {feed.map((event) => (
              <div key={event.id} className="relative pl-6 pb-4 border-l-2 border-gray-100 last:border-transparent last:pb-0 group">
                <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white
                  ${event.status === 'success' ? 'bg-green-500' : event.status === 'failure' ? 'bg-red-500' : 'bg-yellow-500'}
                `} />
                
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-gray-900">{event.type}</span>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-2">{event.timeAgo}</span>
                </div>
                
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">{event.patientName}</span>
                  <span className="text-gray-400 mx-1">•</span>
                  <span className="uppercase text-[10px] font-bold text-gray-500 tracking-wider">{event.plan}</span>
                </p>
                
                {event.channel && (
                  <span className="inline-flex mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                    Via {event.channel}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Subscriber Manually</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form action={async (formData) => {
              setIsSubmitting(true);
              await addSubscriber(formData);
              await fetchMetrics(); // Refresh dashboard
              setShowAddModal(false);
              setIsSubmitting(false);
            }} className="space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input required name="name" type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input required name="email" type="email" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                <input required name="phone" type="text" placeholder="+1234567890" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input required name="password" type="password" placeholder="Set initial password" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subscription Plan</label>
                <select name="plan" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                  <option value="BASIC">Basic Plan</option>
                  <option value="STANDARD">Standard Plan</option>
                  <option value="FAMILY">Caretaker Plan</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-400 disabled:opacity-50">
                  {isSubmitting ? "Adding..." : "Add Subscriber"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function KPICard({ title, value, icon: Icon, colorClass, change, changeLabel, subtext }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl border ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        {changeLabel && change !== undefined && <p className="text-[10px] text-gray-400 mt-1">{changeLabel}</p>}
      </div>
    </div>
  );
}

function AlertItem({ title, icon: Icon, actionLabel }: any) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 border border-red-100 hover:bg-red-50 transition-colors">
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <span className="text-sm font-semibold text-red-900 leading-tight">{title}</span>
      </div>
      <button className="shrink-0 text-xs font-bold px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg shadow-sm hover:bg-red-50 transition-colors">
        {actionLabel}
      </button>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
