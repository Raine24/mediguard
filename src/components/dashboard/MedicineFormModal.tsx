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
  voiceCallEnabled: boolean;
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
  const [voiceCallEnabled, setVoiceCallEnabled] = useState(false);
  
  const [times, setTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState("");
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setErrorMsg("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result;
        try {
          const res = await fetch('/api/scan-medicine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64 })
          });
          const data = await res.json();
          if (data.success) {
            if (data.data.name) setName(data.data.name);
            if (data.data.dose) setDosage(data.data.dose);
          } else {
            setErrorMsg(data.error || "Failed to scan medicine.");
          }
        } catch (err) {
          setErrorMsg("Error communicating with scanner.");
        } finally {
          setIsScanning(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
    } catch (err) {
      setIsScanning(false);
      setErrorMsg("Failed to process image.");
    }
  };


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
        setVoiceCallEnabled(medicineToEdit.voiceCallEnabled || false);
        setTimes(medicineToEdit.reminders.map(r => r.time));
      } else {
        setName(""); setDosage(""); setFoodContext("NONE"); setDaysActive("EVERY_DAY"); setNote(""); setVoiceCallEnabled(false); setTimes([]); setCustomDays([]);
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
        await editMedicine(medicineToEdit.id, { name, dosage, foodContext, daysActive, note, times, voiceCallEnabled });
      } else {
        await addMedicine({ name, dosage, foodContext, daysActive, note, times, voiceCallEnabled });
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
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Paracetamol"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none font-medium pr-12"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleScan}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="flex shrink-0 items-center justify-center gap-2 px-4 py-3 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    {isScanning ? (
                      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline">{isScanning ? "Scanning..." : "Scan Pack"}</span>
                  </button>
                </div>
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
              <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden mb-3">
                <input
                  type="time"
                  onClick={(e) => { try { (e.target as any).showPicker(); } catch(err) {} }}
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="flex-1 px-4 py-3 border-0 focus:ring-0 focus:outline-none text-base bg-transparent min-w-0"
                />
                <div className="flex border-l border-gray-300">
                  <button
                    type="button"
                    onClick={handleAddTime}
                    className="px-3 py-3 bg-blue-800 text-white hover:bg-blue-900 font-semibold flex items-center justify-center gap-1.5 transition-colors text-sm whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
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
                    className={`px-3 py-3 font-medium flex items-center justify-center gap-1.5 transition-colors text-sm whitespace-nowrap border-l ${
                      isEditMode 
                        ? "bg-blue-800 text-white hover:bg-blue-900 border-blue-700" 
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300"
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{isEditMode ? "Cancel" : "Edit"}</span>
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
                          : 'bg-blue-800 text-white border-blue-900'
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
                        className={`ml-1 focus:outline-none ${editingTimeIndex === index ? 'text-blue-200 hover:text-white' : 'text-blue-200 hover:text-white'}`}
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

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
              <div>
                <label className="block text-sm font-semibold text-gray-900">Voice Call Alerts</label>
                <p className="text-xs text-gray-500 mt-0.5">Receive an automated phone call for this medicine's reminders.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={voiceCallEnabled} onChange={(e) => setVoiceCallEnabled(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
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
