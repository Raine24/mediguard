"use client";

import { useState } from "react";
import { Plus, Users, ShieldAlert, CheckCircle2, Clock, Trash2, Edit2, FileText, Lock } from "lucide-react";
import Link from "next/link";
import FamilyMemberModal from "./FamilyMemberModal";
import FamilyMedicineModal from "./FamilyMedicineModal";
import { toggleMedicineStatus, deleteMedicine } from "@/app/dashboard/medicines/actions";

type ReminderProps = { time: string };
type MedicineProps = {
  id: string;
  name: string;
  dosage: string | null;
  daysActive: string;
  note: string | null;
  status: string;
  reminders: ReminderProps[];
};

type FamilyMemberProps = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  medicines: MedicineProps[];
};

export default function FamilyClient({ 
  members, 
  planType 
}: { 
  members: FamilyMemberProps[];
  planType: string;
}) {
  const isFamilyPlan = planType === "FAMILY";
  const [activeTabId, setActiveTabId] = useState<string | null>(members.length > 0 ? members[0].id : null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isFamilyPlan) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Family Plan</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage reminders for your loved ones</p>
        </div>

        <div className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-lg shadow-teal-100/50 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50"></div>
          
          <div className="p-8 md:p-12 relative z-10 text-center">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Upgrade to Family Plan
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Add up to 4 family members. They will receive their own WhatsApp reminders on their personal phones, while you can monitor their history from your dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <div className="flex items-center gap-2 text-gray-700 font-medium bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                Up to 4 Members
              </div>
              <div className="flex items-center gap-2 text-gray-700 font-medium bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                Independent Reminders
              </div>
            </div>

            <Link 
              href="/dashboard/billing"
              className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-teal-700 hover:scale-105 transition-all shadow-md"
            >
              <Lock className="w-5 h-5" />
              Upgrade Now — $17.99/mo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeMember = members.find(m => m.id === activeTabId);

  const handleToggle = async (id: string, currentStatus: string) => {
    setLoadingId(id);
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      await toggleMedicineStatus(id, newStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      setLoadingId(id);
      try {
        await deleteMedicine(id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Family Members</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage medicines for your loved ones</p>
        </div>
        <button
          onClick={() => setIsAddMemberOpen(true)}
          disabled={members.length >= 4}
          className="bg-teal-50 text-teal-700 border border-teal-200 font-semibold py-2 px-4 rounded-xl hover:bg-teal-100 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Member ({members.length}/4)
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No family members yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add a family member to manage their medication reminders directly from your dashboard.
          </p>
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Family Member
          </button>
        </div>
      ) : (
        <>
          {/* Member Switcher Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {members.map(member => (
              <button
                key={member.id}
                onClick={() => setActiveTabId(member.id)}
                className={`whitespace-nowrap px-5 py-3 rounded-xl font-semibold text-sm transition-colors border ${
                  activeTabId === member.id 
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm" 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {member.name}
              </button>
            ))}
          </div>

          {/* Active Member View */}
          {activeMember && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{activeMember.name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 font-medium">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-md">{activeMember.relationship}</span>
                    <span>{activeMember.phone}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsAddMedOpen(true)}
                  className="bg-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Medicine
                </button>
              </div>

              {activeMember.medicines.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium">No medicines added for {activeMember.name.split(' ')[0]} yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeMember.medicines.map((med) => {
                    const isPaused = med.status === "PAUSED";
                    
                    return (
                      <div 
                        key={med.id} 
                        className={`bg-white rounded-2xl border p-5 transition-all ${isPaused ? 'border-gray-200 opacity-75 grayscale-[30%]' : 'border-gray-200 hover:border-teal-300 shadow-sm'}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className={`text-lg font-bold ${isPaused ? 'text-gray-600' : 'text-gray-900'}`}>
                              {med.name}
                            </h3>
                            {med.dosage && (
                              <p className="text-sm text-gray-500 font-medium mt-0.5">{med.dosage}</p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleToggle(med.id, med.status)}
                            disabled={loadingId === med.id}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPaused ? 'bg-gray-300' : 'bg-teal-500'} disabled:opacity-50`}
                          >
                            <span className="sr-only">Toggle active</span>
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPaused ? 'translate-x-1' : 'translate-x-6'}`}
                            />
                          </button>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex flex-wrap gap-2">
                            {med.reminders.map(r => (
                              <span key={r.time} className={`px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 ${isPaused ? 'bg-gray-100 text-gray-600' : 'bg-teal-50 text-teal-700'}`}>
                                <Clock className="w-3 h-3 opacity-70" />
                                {r.time}
                              </span>
                            ))}
                          </div>

                          {med.note && (
                            <div className="flex items-start gap-2 text-xs text-gray-500 italic mt-2 bg-gray-50 p-2 rounded-lg">
                              <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-60" />
                              {med.note}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                          <button 
                            onClick={() => handleDelete(med.id)}
                            disabled={loadingId === med.id}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <FamilyMemberModal 
        isOpen={isAddMemberOpen} 
        onClose={() => setIsAddMemberOpen(false)} 
      />

      {activeMember && (
        <FamilyMedicineModal
          isOpen={isAddMedOpen}
          onClose={() => setIsAddMedOpen(false)}
          familyMemberId={activeMember.id}
        />
      )}
    </div>
  );
}
