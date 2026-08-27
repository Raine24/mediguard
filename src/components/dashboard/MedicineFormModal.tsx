"use client";

import { useState, useEffect } from "react";
import { X, Plus, Clock, Info, Edit2, AlertCircle } from "lucide-react";
import { addMedicine, editMedicine } from "@/app/dashboard/medicines/actions";

export type MedicineProps = {
  id: string;
  name: string;
  dosage: string | null;
  foodContext: string | null;
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
  const [foodContext, setFoodContext] = useState("NONE");
  const [daysActive, setDaysActive] = useState("EVERY_DAY");
  const [customDays, setCustomDays] = useState<string[]>([]);
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
        setFoodContext(medicineToEdit.foodContext || "NONE");
        setDaysActive(medicineToEdit.daysActive);
        if (medicineToEdit.daysActive.startsWith('CUSTOM:')) {
          setCustomDays(medicineToEdit.daysActive.split(':')[1].split(','));
        } else {
          setCustomDays([]);
        }
        setNote(medicineToEdit.note || "");
        setTimes(medicineToEdit.reminders.map(r => r.time));
      } else {
        setName(""); setDosage(""); setFoodContext("NONE"); setDaysActive("EVERY_DAY"); setNote(""); setTimes([]); setCustomDays([]);
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
    
    // Validate if user has basic plan, they can't add more than 3 times
    if (isBasicPlan && times.length >= 3 && editingTimeIndex === null) {
      setStatus("error");
      setErrorMsg("Basic plan is limited to 3 reminders per medicine.");
      return;
    }

    if (editingTimeIndex !== null) {
      const newTimes = [...times];
      newTimes[editingTimeIndex] = newTime;
      setTimes(newTimes.sort());
      setEditingTimeIndex(null);
    } else {
      if (!times.includes(newTime)) {
        setTimes([...times, newTime].sort());
      }
    }
    setNewTime("");
    setIsEditMode(false);
  };

  const handleRemoveTime = (indexToRemove: number) => {
    setTimes(times.filter((_, idx) => idx !== indexToRemove));
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
      setErrorMsg("Please add at least one reminder time.");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      if (medicineToEdit) {
        await editMedicine(medicineToEdit.id, { name, dosage, foodContext, daysActive, note, times });
      } else {
        await addMedicine({ name, dosage, foodContext, daysActive, note, times });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {medicineToEdit ? "Edit Medicine" : "Add Medicine"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
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

          <form id="medicine-form" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paracetamol"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none font-medium"
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
                    className="flex-1 sm:flex-none px-4 py-3 bg-blue-800 text-white border border-blue-900 rounded-xl hover:bg-blue-900 font-semibold flex items-center justify-center gap-2 transition-colors"
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
                      onClick={() => handleEditTime(index)}
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
                          handleRemoveTime(index);
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
                {["EVERY_DAY", "WEEKDAYS", "WEEKENDS", "CUSTOM"].map((opt) => {
                  const isSelected = opt === "CUSTOM" ? daysActive.startsWith("CUSTOM") : daysActive === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDaysActive(opt === "CUSTOM" ? (customDays.length > 0 ? `CUSTOM:${customDays.join(',')}` : "CUSTOM") : opt)}
                      className={`py-2 px-3 text-sm font-medium rounded-lg border text-center transition-colors ${
                        isSelected 
                          ? "bg-teal-50 border-teal-600 text-teal-700" 
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.replace("_", " ")}
                    </button>
                  );
                })}
              </div>
              
              {daysActive.startsWith("CUSTOM") && (
                <div className="mt-3 grid grid-cols-7 gap-1">
                  {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(day => {
                    const isSelected = customDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const newDays = isSelected ? customDays.filter(d => d !== day) : [...customDays, day];
                          setCustomDays(newDays);
                          setDaysActive(`CUSTOM:${newDays.join(',')}`);
                        }}
                        className={`py-2 text-xs font-semibold rounded border transition-colors ${
                          isSelected ? "bg-blue-800 text-white border-blue-900" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              )}
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
                className="w-full bg-blue-900 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-blue-950 disabled:opacity-50 transition-colors flex justify-center items-center"
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
