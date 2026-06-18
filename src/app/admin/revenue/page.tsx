"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { 
  CreditCard, TrendingUp, ArrowDownRight, ArrowUpRight, DollarSign, 
  Download, Filter, CheckCircle2, XCircle, RefreshCcw, Search, Calendar,
  AlertTriangle, ShieldAlert, PlayCircle, Clock
} from "lucide-react";
import { 
  getFinancialMetrics, getTransactions, getUpcomingRenewals, 
  processRefund, extendSubscription, switchPlan 
} from "@/actions/admin/revenue";

const COLORS = ['#94a3b8', '#3b82f6', '#a855f7'];

export default function RevenueAndBilling() {
  const [activeTab, setActiveTab] = useState<"overview" | "failed" | "renewals">("overview");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Metrics Data
  const [metrics, setMetrics] = useState<any>(null);
  
  // Ledger Data
  const [transactions, setTransactions] = useState<any[]>([]);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Failed Data
  const [failedTxs, setFailedTxs] = useState<any[]>([]);
  
  // Renewals Data
  const [renewals, setRenewals] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [searchQuery, ledgerPage, activeTab]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const mets = await getFinancialMetrics();
      setMetrics(mets);
      
      const failed = await getTransactions("", { status: "FAILED" }, 1, 50);
      setFailedTxs(failed.transactions);
      
      const rens = await getUpcomingRenewals(1, 50);
      setRenewals(rens.renewals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
    try {
      if (activeTab === "overview") {
        const res = await getTransactions(searchQuery, {}, ledgerPage, 20);
        setTransactions(res.transactions);
        setLedgerTotal(res.totalPages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefund = (txId: string) => {
    const pwd = prompt("SUPER ADMIN REQUIRED: Enter your password to process refund:");
    if (!pwd) return;
    const reason = prompt("Enter reason for refund:");
    if (!reason) return;

    startTransition(async () => {
      const res = await processRefund(txId, reason, pwd);
      if (res.error) alert(res.error);
      else {
        alert("Refund processed successfully.");
        fetchInitialData();
        fetchLedger();
      }
    });
  };

  const handleExtend = (subId: string) => {
    const days = prompt("How many days to extend the subscription?");
    if (!days || isNaN(Number(days))) return;
    const reason = prompt("Enter reason for extension:");
    if (!reason) return;

    startTransition(async () => {
      const res = await extendSubscription(subId, Number(days), reason);
      if (res.error) alert(res.error);
      else fetchInitialData();
    });
  };

  const handleSwitchPlan = (subId: string) => {
    const newPlan = prompt("Enter new plan (BASIC, STANDARD, FAMILY):");
    if (!newPlan || !['BASIC', 'STANDARD', 'FAMILY'].includes(newPlan.toUpperCase())) return alert("Invalid plan");
    const reason = prompt("Enter reason for plan switch:");
    if (!reason) return;

    startTransition(async () => {
      const res = await switchPlan(subId, newPlan, reason);
      if (res.error) alert(res.error);
      else fetchInitialData();
    });
  };

  const handleRetryPayment = (txId: string) => {
    // In a real implementation, this would trigger an email/whatsapp via Server Action
    alert(`Payment retry link sent to user for transaction ${txId}.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCEEDED": return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3" /> Succeeded</span>;
      case "FAILED": return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> Failed</span>;
      case "REFUNDED": return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700"><RefreshCcw className="w-3 h-3" /> Refunded</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue & Billing</h1>
          <p className="text-gray-500 mt-1">Financial metrics, transaction ledger, and subscription management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export Financial Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-px hide-scrollbar">
        {[
          { id: "overview", label: "Overview & Ledger", icon: TrendingUp },
          { id: "failed", label: "Failed Payments", icon: AlertTriangle },
          { id: "renewals", label: "Upcoming Renewals", icon: Calendar },
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

      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border-teal-100">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${metrics?.thisMonthRevenue >= metrics?.lastMonthRevenue ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {metrics?.thisMonthRevenue >= metrics?.lastMonthRevenue ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  vs last month
                </span>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(metrics?.totalRevenue || 0)}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border-indigo-100">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Monthly Recurring Revenue (MRR)</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(metrics?.mrr || 0)}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border-blue-100">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Avg Revenue Per User</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(metrics?.arpu || 0)}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border-red-100">
                  <RefreshCcw className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Revenue Churn Rate</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{(metrics?.churnRate || 0).toFixed(1)}%</h3>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Growth (Trailing 12 Months)</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics?.mrrData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`$${value}`, 'Revenue']}
                    />
                    <Bar dataKey="mrr" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue by Plan</h2>
              <div className="h-[300px] w-full flex flex-col items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics?.planDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {(metrics?.planDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-gray-900">{metrics?.activeSubsCount}</span>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Active Subs</span>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  {(metrics?.planDistribution || []).map((entry: any, index: number) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs font-semibold text-gray-700">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-900">Payment Transactions Ledger</h2>
            </div>
            
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search by patient name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Plan & Cycle</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{tx.user.name}</div>
                        <div className="text-xs text-gray-500">{tx.user.email}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">${tx.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-purple-700">{tx.planType}</span>
                        <div className="text-xs text-gray-500">{tx.billingCycle}</div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                      <td className="px-6 py-4 text-right">
                        {tx.status === "SUCCEEDED" && (
                          <button 
                            disabled={isPending}
                            onClick={() => handleRefund(tx.id)} 
                            className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors bg-red-50 px-2 py-1 rounded"
                          >
                            Refund
                          </button>
                        )}
                        {tx.receiptUrl && (
                          <a href={tx.receiptUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-teal-600 ml-2 hover:underline">
                            Receipt
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-500">No transactions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "failed" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in">
          <div className="p-6 border-b border-gray-100 bg-red-50/50">
            <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Failed Payments Queue
            </h2>
            <p className="text-sm text-red-700 mt-1">Transactions that failed due to card declines, insufficient funds, or other gateway errors.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Amount & Plan</th>
                  <th className="px-6 py-3 w-1/3">Failure Reason</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {failedTxs.map(tx => (
                  <tr key={tx.id} className="hover:bg-red-50/30">
                    <td className="px-6 py-4 font-medium text-gray-900">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{tx.user.name}</div>
                      <div className="text-xs text-gray-500">{tx.user.email} • {tx.user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">${tx.amount.toFixed(2)}</div>
                      <div className="text-xs text-purple-700 font-bold">{tx.planType}</div>
                    </td>
                    <td className="px-6 py-4 text-red-600 font-medium text-xs">{tx.failureReason || "Gateway Error / Card Declined"}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleRetryPayment(tx.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500 ml-auto"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" /> Retry Payment
                      </button>
                    </td>
                  </tr>
                ))}
                {failedTxs.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-500 font-medium">No failed payments requiring attention.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "renewals" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in">
          <div className="p-6 border-b border-gray-100 bg-indigo-50/50">
            <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Subscription Management
            </h2>
            <p className="text-sm text-indigo-700 mt-1">Upcoming renewals and manual subscription overrides.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Renewal Date</th>
                  <th className="px-6 py-3 text-right">Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {renewals.map(sub => {
                  const daysToExpiry = sub.expiryDate ? Math.ceil((new Date(sub.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 999;
                  const rowClass = daysToExpiry <= 1 ? "bg-red-50 hover:bg-red-100" : daysToExpiry <= 7 ? "bg-orange-50 hover:bg-orange-100" : "hover:bg-gray-50";
                  const textClass = daysToExpiry <= 1 ? "text-red-700 font-bold" : daysToExpiry <= 7 ? "text-orange-700 font-bold" : "text-gray-900 font-medium";

                  return (
                    <tr key={sub.id} className={rowClass}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{sub.user.name}</div>
                        <div className="text-xs text-gray-500">{sub.user.email}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-purple-700">{sub.planType}</td>
                      <td className="px-6 py-4">
                        <div className={textClass}>
                          {sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {daysToExpiry <= 1 ? "Due in 24h" : `In ${daysToExpiry} days`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          disabled={isPending}
                          onClick={() => handleExtend(sub.id)}
                          className="px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50"
                        >
                          Extend
                        </button>
                        <button 
                          disabled={isPending}
                          onClick={() => handleSwitchPlan(sub.id)}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500"
                        >
                          Switch Plan
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {renewals.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-500 font-medium">No upcoming renewals found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
