"use client";

import { useState, useEffect } from "react";
import { X, Plus, Clock, Info, Edit2 } from "lucide-react";
import { addMedicine, editMedicine } from "@/app/dashboard/medicines/actions";

export type MedicineProps = {
  id: string;
  name: string;
  dosage: string | null;
  daysActive: string;
  note: string | null;
  status: string;
  reminders: { time: string }[];
};

export default function MedicineFormModal({ 
  isOpen, 
  onClose,
  isBasicPlan,
  medicineToEdit
}: { 
  isOpen: boolean; 
  onClose: () => void;
  isBasicPlan: boolean;
  medicineToEdit?: MedicineProps | null;
}) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [daysActive, setDaysActive] = useState("EVERY_DAY");
  const [note, setNote] = useState("");
  
  const [times, setTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState("");
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (medicineToEdit) {
        setName(medicineToEdit.name);
        setDosage(medicineToEdit.dosage || "");
        setDaysActive(medicineToEdit.daysActive);
        setNote(medicineToEdit.note || "");
        setTimes(medicineToEdit.reminders.map(r => r.time));
      } else {
        setName(""); setDosage(""); setDaysActive("EVERY_DAY"); setNote(""); setTimes([]);
      }
      setStatus("idle");
      setErrorMsg("");
      setNewTime("");
      setEditingTimeIndex(null);
      setIsEditMode(false);
    }
  }, [isOpen, medicineToEdit]);

  const handleAddTime = () => {
    if (!newTime) return;
    
    // Check if time already exists and we are not editing it
    if (times.includes(newTime)) {
      if (editingTimeIndex === null || times[editingTimeIndex] !== newTime) {
        return;
      }
    }

    if (editingTimeIndex !== null) {
      // Replace the selected time
      const updatedTimes = [...times];
      updatedTimes[editingTimeIndex] = newTime;
      setTimes(updatedTimes.sort());
      setEditingTimeIndex(null);
      setIsEditMode(false);
    } else {
      // Add new time
      if (isBasicPlan && times.length >= 3) {
        setErrorMsg("Basic plan is limited to 3 reminders per medicine.");
        return;
      }
      setTimes([...times, newTime].sort());
    }
    setNewTime("");
  };

  const handleSelectTime = (index: number) => {
    if (!isEditMode) return;
    setEditingTimeIndex(index);
    setNewTime(times[index]);
  };

  const removeTime = (t: string) => {
    setTimes(times.filter(x => x !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (times.length === 0) {
      setErrorMsg("Add at least one reminder time");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      if (medicineToEdit) {
        await editMedicine(medicineToEdit.id, { name, dosage, daysActive, note, times });
      } else {
        await addMedicine({ name, dosage, daysActive, note, times });
      }
      onClose();
    } catch (error: any) {
      setStatus("error");
      if (error.message.includes("PLAN_LIMIT")) {
        setErrorMsg("You have reached your plan limit. Please upgrade to Standard.");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex flex-col justify-end md:items-center md:justify-center">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">{medicineToEdit ? "Edit Medicine" : "Add Medicine"}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex gap-2">
              <Info className="w-5 h-5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Paracetamol"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosage (Optional)</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500mg, 1 tablet"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={daysActive}
                onChange={(e) => setDaysActive(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
              >
                <option value="EVERY_DAY">Every Day</option>
                <option value="WEEKDAYS">Weekdays Only</option>
                <option value="WEEKENDS">Weekends Only</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Reminder Times *</label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{times.length} {times.length === 1 ? 'time' : 'times'} set</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full sm:flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base bg-white"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddTime}
                    className="flex-1 sm:flex-none px-4 py-3 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl hover:bg-teal-100 font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Save Time
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMode(!isEditMode);
                      if (isEditMode) {
                        setEditingTimeIndex(null);
                        setNewTime("");
                      }
                    }}
                    className={`flex-1 sm:flex-none px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                      isEditMode 
                        ? "bg-blue-800 text-white border-blue-800 hover:bg-blue-900" 
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                    {isEditMode ? "Cancel Edit" : "Edit Time"}
                  </button>
                </div>
              </div>
              
              {times.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {times.map((t, index) => (
                    <div 
                      key={t} 
                      onClick={() => handleSelectTime(index)}
                      className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''
                      } ${
                        editingTimeIndex === index 
                          ? 'bg-blue-800 text-white border-blue-900' 
                          : 'bg-teal-50 text-teal-700 border-teal-200'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {t}
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTime(t);
                        }}
                        className={`ml-1 focus:outline-none ${editingTimeIndex === index ? 'text-blue-200 hover:text-white' : 'text-teal-600 hover:text-teal-900'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Days Active</label>
              <div className="grid grid-cols-2 gap-2">
                {["EVERY_DAY", "WEEKDAYS", "WEEKENDS", "CUSTOM"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDaysActive(opt)}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border text-center transition-colors ${
                      daysActive === opt 
                        ? "bg-teal-50 border-teal-600 text-teal-700" 
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {opt.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Personal Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                placeholder="e.g. Take with food"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-teal-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors flex justify-center items-center"
              >
                {status === "submitting" ? "Saving..." : "Save Medicine"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
