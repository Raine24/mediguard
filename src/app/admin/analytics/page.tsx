"use client";

import { useState, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";
import { 
  TrendingUp, Users, Activity, Download, DollarSign, MessageSquare, MapPin, 
  RefreshCcw, AlertTriangle, ShieldCheck
} from "lucide-react";
import { 
  getGrowthAnalytics, getRevenueAnalytics, getMessagingAnalytics, getGeographicAnalytics 
} from "@/actions/admin/analytics";

const COLORS = ['#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<"growth" | "revenue" | "messaging" | "geography">("growth");
  const [loading, setLoading] = useState(true);
  
  const [growth, setGrowth] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [messaging, setMessaging] = useState<any>(null);
  const [geography, setGeography] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gr, rev, msg, geo] = await Promise.all([
        getGrowthAnalytics(),
        getRevenueAnalytics(),
        getMessagingAnalytics(),
        getGeographicAnalytics()
      ]);
      setGrowth(gr);
      setRevenue(rev);
      setMessaging(msg);
      setGeography(geo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    alert("Exporting full analytics to CSV... (Mock Download Triggered)");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">Enterprise dashboard for business intelligence and growth tracking.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-px hide-scrollbar">
        {[
          { id: "growth", label: "Growth & Retention", icon: Users },
          { id: "revenue", label: "Financials", icon: DollarSign },
          { id: "messaging", label: "Platform Usage", icon: MessageSquare },
          { id: "geography", label: "Demographics", icon: MapPin }
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

      {/* GROWTH TAB */}
      {activeTab === "growth" && growth && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Active Subscribers</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{growth.totalActive}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Avg Subscription Length</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{growth.avgSubscriptionLength}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Renewal Rate</p>
              <h3 className="text-2xl font-black text-green-600 mt-1">{growth.renewalRate}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">Subscriber Growth (Trailing 12 Months)</h2>
                <p className="text-sm text-gray-500">New acquisitions vs Churn</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growth.growthData} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="newUsers" name="New Subscribers" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorNew)" />
                    <Area type="monotone" dataKey="churned" name="Churned" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorChurn)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">Plan Distribution</h2>
                <p className="text-sm text-gray-500">Active subs by tier</p>
              </div>
              <div className="h-[200px] w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={growth.planData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {growth.planData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Cohort Retention Analysis</h2>
              <p className="text-sm text-gray-500">Percentage of users still active after N months</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-6 py-4">Cohort</th>
                    <th className="px-6 py-4">Users</th>
                    <th className="px-6 py-4">Month 1</th>
                    <th className="px-6 py-4">Month 2</th>
                    <th className="px-6 py-4">Month 3</th>
                    <th className="px-6 py-4">Month 6</th>
                    <th className="px-6 py-4">Month 12</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {growth.cohortData.map((c: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900">{c.cohort}</td>
                      <td className="px-6 py-4 text-gray-500">{c.users}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-teal-50 text-teal-700 rounded font-bold">{c.m1}%</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-teal-50/70 text-teal-700 rounded font-bold">{c.m2}%</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-teal-50/50 text-teal-700 rounded font-bold">{c.m3}%</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded font-bold">{c.m6}%</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded font-bold">{c.m12}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REVENUE TAB */}
      {activeTab === "revenue" && revenue && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">${revenue.totalRevenueAllTime}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-teal-500">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">MRR</p>
              <h3 className="text-2xl font-black text-teal-600 mt-1">${revenue.mrr}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">ARR</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">${revenue.arr}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">ARPU / LTV</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">${revenue.arpu} <span className="text-sm text-gray-400 font-medium">/ ${revenue.ltv}</span></h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">Revenue Trend (Trailing 12 Months)</h2>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenue.revenueTrend} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col justify-center h-[170px]">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold">Payment Failure Rate</h3>
                </div>
                <p className="text-4xl font-black text-red-700">{revenue.failureRate}</p>
                <p className="text-xs text-red-600 mt-2">Percentage of transactions that declined.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col justify-center h-[170px]">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <RefreshCcw className="w-5 h-5" />
                  <h3 className="font-bold">Refund Rate</h3>
                </div>
                <p className="text-4xl font-black text-gray-800">{revenue.refundRate}</p>
                <p className="text-xs text-gray-500 mt-2">Percentage of successful payments later refunded.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGING TAB */}
      {activeTab === "messaging" && messaging && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Reminders Sent</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{messaging.totalMessagesSent}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Delivery Success Rate</p>
              <h3 className="text-2xl font-black text-green-600 mt-1 flex items-center gap-2">
                {messaging.successRate} <ShieldCheck className="w-5 h-5" />
              </h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">SMS Fallback Rate</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{messaging.smsFallbackRate}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">Peak Reminder Times</h2>
                <p className="text-sm text-gray-500">System load heatmap by time of day</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={messaging.peakTimes} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}}/>
                    <Bar dataKey="volume" name="Reminders Sent" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Most Common Medicines</h2>
                <p className="text-sm text-gray-500">Anonymised aggregate of user entries</p>
              </div>
              <div className="p-0">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {messaging.topMedicines.map((m: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-3.5 font-bold text-gray-800">{m.name}</td>
                        <td className="px-6 py-3.5 text-right font-medium text-gray-500">{m.count} users</td>
                      </tr>
                    ))}
                    {messaging.topMedicines.length === 0 && (
                      <tr><td colSpan={2} className="px-6 py-12 text-center text-gray-500">No medicines logged yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GEOGRAPHY TAB */}
      {activeTab === "geography" && geography && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Geographic Distribution</h2>
                <p className="text-sm text-gray-500 mt-1">Subscribers and plan popularity by region</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2 border-r border-gray-100">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                      <th className="px-6 py-4">Country</th>
                      <th className="px-6 py-4">Total Users</th>
                      <th className="px-6 py-4">Basic</th>
                      <th className="px-6 py-4">Standard</th>
                      <th className="px-6 py-4">Family</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {geography.countryData.map((c: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-teal-500" /> {c.country}
                        </td>
                        <td className="px-6 py-4 font-bold text-teal-600">{c.users}</td>
                        <td className="px-6 py-4 text-gray-600">{c.basic}</td>
                        <td className="px-6 py-4 text-gray-600">{c.standard}</td>
                        <td className="px-6 py-4 text-gray-600">{c.family}</td>
                      </tr>
                    ))}
                    {geography.countryData.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No geographic data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 mb-4">Top Markets</h3>
                <div className="space-y-4">
                  {geography.countryData.slice(0, 5).map((c: any, i: number) => {
                    const max = geography.countryData[0]?.users || 1;
                    const pct = Math.max(5, Math.round((c.users / max) * 100));
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                          <span>{c.country}</span>
                          <span>{c.users}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
