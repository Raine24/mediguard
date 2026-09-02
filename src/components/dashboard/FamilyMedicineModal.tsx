"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { X, Plus, Clock, Info, Edit2, AlertCircle, Camera } from "lucide-react";
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
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [voiceCallEnabled, setVoiceCallEnabled] = useState(false);
  
  const [times, setTimes] = useState<string[]>(["08:00"]);
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
            if (!data.data.name && !data.data.dose) {
              setErrorMsg("Could not clearly read medicine details from the photo. Please enter them manually or try a clearer shot.");
            }
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
      await addFamilyMedicine(familyMemberId, { name, dosage, foodContext, daysActive, note, times, voiceCallEnabled });
      
      // Reset form
      setName(""); setDosage(""); setFoodContext("NONE"); setDaysActive("EVERY_DAY"); setNote(""); setVoiceCallEnabled(false); setTimes(["08:00"]); setCustomDays([]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add Family Medicine</h2>
            <p className="text-xs text-gray-500 hidden sm:block">Set up medication schedule and reminders for your family member</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
              {/* Left Column: Medication Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Amlodipine"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none font-medium pr-12 text-sm"
                      />
                    </div>
                    <span className="text-xs text-gray-400 font-medium">or</span>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleScan}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isScanning}
                      className="flex shrink-0 items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-800 text-white hover:bg-blue-900 border border-blue-900 rounded-xl font-semibold transition-colors disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {isScanning ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <span>{isScanning ? "Scanning..." : "Scan Pack"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage (Optional)</label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                      placeholder="e.g. 10mg or 2 tablets"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Food Instructions</label>
                    <select
                      value={foodContext}
                      onChange={(e) => setFoodContext(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none bg-white text-sm"
                    >
                      <option value="NONE">None (No specific instruction)</option>
                      <option value="BEFORE_FOOD">Before Food (Empty Stomach)</option>
                      <option value="WITH_FOOD">With / After Food</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Note (Optional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    placeholder="e.g. Take with food"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl bg-gray-50/70">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Voice Call Alerts</label>
                    <p className="text-xs text-gray-500">Receive an automated phone call for this medicine's reminders.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
                    <input type="checkbox" className="sr-only peer" checked={voiceCallEnabled} onChange={(e) => setVoiceCallEnabled(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>

              {/* Right Column: Schedule & Reminder Times */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Reminder Times *</label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{times.length} {times.length === 1 ? 'time' : 'times'} set</span>
                  </div>
                  
                  <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden mb-2.5 shadow-sm">
                    <input
                      type="time"
                      onClick={(e) => { try { (e.target as any).showPicker(); } catch(err) {} }}
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 border-0 focus:ring-0 focus:outline-none text-sm bg-transparent min-w-0"
                    />
                    <div className="flex border-l border-gray-300">
                      <button
                        type="button"
                        onClick={handleAddTime}
                        className="px-3 py-2.5 bg-blue-800 text-white hover:bg-blue-900 font-semibold flex items-center justify-center gap-1 transition-colors text-xs sm:text-sm whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Save</span>
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
                        className={`px-3 py-2.5 font-medium flex items-center justify-center gap-1 transition-colors text-xs sm:text-sm whitespace-nowrap border-l ${
                          isEditMode 
                            ? "bg-blue-800 text-white hover:bg-blue-900 border-blue-700" 
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300"
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isEditMode ? "Cancel" : "Edit"}</span>
                      </button>
                    </div>
                  </div>

                  {times.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50/70 border border-gray-200/80 rounded-xl">
                      {times.map((t, index) => (
                        <div 
                          key={t} 
                          onClick={() => handleEditTime(index)}
                          className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''
                          } bg-blue-800 text-white border-blue-900`}
                        >
                          <Clock className="w-3.5 h-3.5 opacity-80" />
                          {t}
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTime(t);
                            }} 
                            className="ml-1 text-blue-200 hover:text-white focus:outline-none"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Days Active</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["EVERY_DAY", "WEEKDAYS", "WEEKENDS", "CUSTOM"].map((opt) => {
                      const isSelected = opt === "CUSTOM" ? daysActive.startsWith("CUSTOM") : daysActive === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDaysActive(opt === "CUSTOM" ? (customDays.length > 0 ? `CUSTOM:${customDays.join(',')}` : "CUSTOM") : opt)}
                          className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border text-center transition-colors ${
                            isSelected 
                              ? "bg-teal-50 border-teal-600 text-teal-700 font-semibold" 
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {opt.replace("_", " ")}
                        </button>
                      );
                    })}
                  </div>
                  
                  {daysActive.startsWith("CUSTOM") && (
                    <div className="mt-2.5 grid grid-cols-7 gap-1">
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
                            className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                              isSelected ? "bg-blue-800 text-white border-blue-900" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/70 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="px-6 py-2.5 bg-blue-900 text-white text-sm font-semibold rounded-xl hover:bg-blue-950 disabled:opacity-50 transition-colors flex justify-center items-center shadow-sm"
            >
              {status === "submitting" ? "Saving..." : "Save Medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
