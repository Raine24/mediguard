"use client";

import { useState } from "react";
import { X, Plus, Clock, Info, Edit2, AlertCircle } from "lucide-react";
import { addFamilyMedicine } from "@/app/dashboard/family/actions";

export default function FamilyMedicineModal({ 
  isOpen, 
  onClose,
  familyMemberId
}: { 
  isOpen: boolean; 
  onClose: () => void;
  familyMemberId: string;
}) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [foodContext, setFoodContext] = useState("NONE");
  const [daysActive, setDaysActive] = useState("EVERY_DAY");
  const [note, setNote] = useState("");
  
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [newTime, setNewTime] = useState("");
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddTime = () => {
    if (!newTime) return;

    if (editingTimeIndex !== null) {
      const updatedTimes = [...times];
      updatedTimes[editingTimeIndex] = newTime;
      setTimes(updatedTimes.sort());
      setEditingTimeIndex(null);
      setIsEditMode(false);
    } else {
      if (!times.includes(newTime)) {
        setTimes([...times, newTime].sort());
      }
    }
    setNewTime("");
  };

  const removeTime = (t: string) => {
    setTimes(times.filter((x) => x !== t));
  };

  const handleEditTime = (index: number) => {
    setNewTime(times[index]);
    setEditingTimeIndex(index);
    setIsEditMode(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (times.length === 0) {
      setStatus("error");
      setErrorMsg("Please add at least one reminder time");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      await addFamilyMedicine(familyMemberId, { name, dosage, foodContext, daysActive, note, times });
      
      // Reset form
      setName(""); setDosage(""); setFoodContext("NONE"); setDaysActive("EVERY_DAY"); setNote(""); setTimes(["08:00"]);
      setStatus("idle");
      setEditingTimeIndex(null);
      setIsEditMode(false);
      onClose();
    } catch (error: any) {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Add Medicine</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                  placeholder="e.g. Amlodipine"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage (Optional)</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                  placeholder="e.g. 10mg or 2 tablets"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Instructions</label>
                <select
                  value={foodContext}
                  onChange={(e) => setFoodContext(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none bg-white"
                >
                  <option value="NONE">None (No specific instruction)</option>
                  <option value="BEFORE_FOOD">Before Food (Empty Stomach)</option>
                  <option value="WITH_FOOD">With Food / After Food</option>
                </select>
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Times *</label>
              
              <div className="flex flex-wrap gap-2 mb-3">
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
                    <Clock className="w-4 h-4 opacity-70" />
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

              <div className="flex flex-col sm:flex-row gap-2">
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
