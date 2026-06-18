"use client";

import { useState } from "react";
import { Plus, Clock, FileText, Trash2, Edit2, Play, Pause } from "lucide-react";
import MedicineFormModal from "./MedicineFormModal";
import { toggleMedicineStatus, deleteMedicine } from "@/app/dashboard/medicines/actions";

type MedicineProps = {
  id: string;
  name: string;
  dosage: string | null;
  daysActive: string;
  note: string | null;
  status: string;
  reminders: { time: string }[];
};

export default function MedicinesClient({ 
  medicines, 
  isBasicPlan 
}: { 
  medicines: MedicineProps[];
  isBasicPlan: boolean;
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
    if (confirm("Are you sure you want to delete this medicine? This will also delete its reminder history.")) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Medicines</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage your medication schedule
          </p>
        </div>
      </div>

      {medicines.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pill className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No medicines added yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't set up any reminders. Tap the button below to add your first medicine.
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Medicine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.map((med) => {
            const isPaused = med.status === "PAUSED";
            
            return (
              <div 
                key={med.id} 
                className={`bg-white rounded-2xl border p-5 transition-all ${isPaused ? 'border-gray-200 opacity-75 grayscale-[30%]' : 'border-gray-200 hover:border-teal-300 hover:shadow-md'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${isPaused ? 'text-gray-600' : 'text-gray-900'}`}>
                      {med.name}
                    </h3>
                    {med.dosage && (
                      <p className="text-sm text-gray-500 font-medium mt-0.5">{med.dosage}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleToggle(med.id, med.status)}
                    disabled={loadingId === med.id}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isPaused ? 'bg-gray-300' : 'bg-teal-500'} disabled:opacity-50`}
                  >
                    <span className="sr-only">Toggle active</span>
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isPaused ? 'translate-x-1' : 'translate-x-6'}`}
                    />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex flex-wrap gap-2">
                    {med.reminders.map(r => (
                      <span key={r.time} className={`px-2.5 py-1 rounded-md text-sm font-semibold flex items-center gap-1 ${isPaused ? 'bg-gray-100 text-gray-600' : 'bg-teal-50 text-teal-700'}`}>
                        <Clock className="w-3.5 h-3.5 opacity-70" />
                        {r.time}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                      {med.daysActive.replace("_", " ")}
                    </span>
                  </div>

                  {med.note && (
                    <div className="flex items-start gap-2 text-sm text-gray-500 italic mt-2 bg-gray-50 p-2 rounded-lg">
                      <FileText className="w-4 h-4 shrink-0 mt-0.5 opacity-60" />
                      {med.note}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(med.id)}
                    disabled={loadingId === med.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button for Mobile / Fixed Bottom Right */}
      {medicines.length > 0 && (
        <button
          onClick={() => setIsAddOpen(true)}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-700 hover:scale-105 transition-all z-20"
          aria-label="Add Medicine"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <MedicineFormModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        isBasicPlan={isBasicPlan}
      />
    </div>
  );
}

// Just a quick Pill icon since it wasn't imported from lucide-react in the component
function Pill(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  );
}
