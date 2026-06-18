"use client";

import { useState, useTransition } from "react";
import { HelpCircle, X, Send, Phone } from "lucide-react";
import { createUserTicket } from "@/actions/tickets";

export default function SupportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    startTransition(async () => {
      const result = await createUserTicket(subject, message);
      if (result.error) {
        setStatus("error");
        alert(result.error);
        return;
      }
      
      setStatus("success");
      setSubject("");
      setMessage("");
      
      setTimeout(() => {
        onClose();
        setStatus("idle");
      }, 3000);
    });
  };

  return (
    <>
      {/* Trigger Buttons are typically placed wherever this is imported, 
          but since it's global, we can attach to a global event or context.
          For simplicity, we export the trigger as well. */}
      
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-teal-600" />
                Contact Support
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {status === "success" ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Received</h3>
                  <p className="text-gray-600">
                    Your message has been received. We will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                      placeholder="What do you need help with?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base resize-none"
                      placeholder="Please describe your issue in detail..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                  >
                    {status === "submitting" ? "Sending..." : "Send Message"}
                  </button>

                  <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500 mb-3">Urgent issue? Reach out on WhatsApp</p>
                    <a 
                      href="https://wa.me/256700000000" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 bg-green-50 px-4 py-2 rounded-full"
                    >
                      <Phone className="w-4 h-4" />
                      WhatsApp Support
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
