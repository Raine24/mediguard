"use client";

import { useState, useEffect } from "react";
import { X, Plus, Clock, Info } from "lucide-react";
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
  
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [newTime, setNewTime] = useState("");

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
        setName(""); setDosage(""); setDaysActive("EVERY_DAY"); setNote(""); setTimes(["08:00"]);
      }
      setStatus("idle");
      setErrorMsg("");
      setNewTime("");
    }
  }, [isOpen, medicineToEdit]);

  const handleAddTime = () => {
    if (!newTime) return;
    if (times.includes(newTime)) return;
    if (isBasicPlan && times.length >= 3) {
      setErrorMsg("Basic plan is limited to 3 reminders per medicine.");
      return;
    }
    setTimes([...times, newTime].sort());
    setNewTime("");
  };

  const removeTime = (t: string) => {
    if (times.length <= 1) return; // Must have at least 1 time
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
              <div className="flex gap-2 mb-3">
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
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
