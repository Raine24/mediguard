"use client";

import { useState } from "react";
import { 
  Settings2, 
  MessageCircle, 
  CreditCard, 
  Save, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("api");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500 mt-1">Configure core platform integrations and parameters</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-400 transition-colors disabled:opacity-70"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab("api")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'api' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <MessageCircle className={`w-5 h-5 ${activeTab === 'api' ? 'text-teal-600' : 'text-gray-400'}`} />
            Messaging APIs
          </button>
          <button 
            onClick={() => setActiveTab("billing")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'billing' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <CreditCard className={`w-5 h-5 ${activeTab === 'billing' ? 'text-teal-600' : 'text-gray-400'}`} />
            Billing & Plans
          </button>
          <button 
            onClick={() => setActiveTab("scheduler")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'scheduler' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings2 className={`w-5 h-5 ${activeTab === 'scheduler' ? 'text-teal-600' : 'text-gray-400'}`} />
            Scheduler Engine
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'security' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ShieldCheck className={`w-5 h-5 ${activeTab === 'security' ? 'text-teal-600' : 'text-gray-400'}`} />
            Security Rules
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          
          {activeTab === "api" && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">WhatsApp Integration (Meta Cloud API)</h2>
                <p className="text-sm text-gray-500 mb-6">Configure your Meta App settings for sending WhatsApp reminders.</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number ID</label>
                    <input type="text" defaultValue="1154282011101705" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Access Token</label>
                    <input type="password" defaultValue="EAALg8BZA8l..." className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none font-mono" />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">SMS Fallback (Twilio)</h2>
                <p className="text-sm text-gray-500 mb-6">Configure SMS delivery for Standard and Caretaker plans.</p>
                
                <div className="space-y-5">
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">Enable SMS Fallback</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Automatically send SMS if WhatsApp fails.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Twilio Account SID</label>
                    <input type="text" defaultValue="AC1234567890abcdef" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Twilio Auth Token</label>
                    <input type="password" defaultValue="••••••••••••••••" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Pricing Tiers</h2>
                <p className="text-sm text-gray-500 mb-6">Manage subscription limits and prices.</p>
                
                <div className="grid gap-6">
                  <div className="border border-gray-200 p-5 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-4">Basic Plan</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Price (USD)</label>
                        <input type="number" defaultValue="4.99" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Max Meds</label>
                        <input type="number" defaultValue="3" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 outline-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 p-5 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-4">Standard Plan</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Price (USD)</label>
                        <input type="number" defaultValue="9.99" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Max Meds</label>
                        <input type="number" defaultValue="10" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "scheduler" && (
            <div className="space-y-8 animate-in fade-in flex flex-col items-center justify-center py-12 text-center">
              <Settings2 className="w-12 h-12 text-gray-300 mb-4 animate-spin-slow" />
              <h3 className="text-lg font-bold text-gray-900">Scheduler Engine Configuration</h3>
              <p className="text-gray-500 mt-2 max-w-sm">Advanced cron tuning limits and retry logic will be available in the next deployment.</p>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in flex flex-col items-center justify-center py-12 text-center">
              <ShieldCheck className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Security Rules</h3>
              <p className="text-gray-500 mt-2 max-w-sm">Global 2FA policies and IP whitelisting configurations will be available in the next deployment.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
