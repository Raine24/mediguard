import { Megaphone, Download, Image as ImageIcon, MessageCircle } from "lucide-react";

export default function MarketingPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Megaphone className="w-8 h-8 text-teal-600" />
        <h1 className="text-2xl font-bold text-slate-800">Marketing Assets</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Social Media Copy */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-800">Ready-to-Use Messages</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 relative">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">WhatsApp Message</h3>
              <p className="text-slate-700 text-sm whitespace-pre-line">
                Hi! I've been using MediGuard to make sure I never forget to take my medication. It sends me WhatsApp reminders when it's time for my pills. 💊 
                {"\n\n"}
                If you or a family member struggle to remember meds, I highly recommend it. You can try it out for free here: [YOUR_LINK]
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 relative">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Twitter / X</h3>
              <p className="text-slate-700 text-sm">
                Never forget your medication again. 🕒 MediGuard sends automated WhatsApp reminders right to your phone. Super helpful for managing family prescriptions too! Try it out: [YOUR_LINK] #Health #MediGuard
              </p>
            </div>
          </div>
        </div>

        {/* Visual Assets */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="w-6 h-6 text-purple-500" />
            <h2 className="text-lg font-bold text-slate-800">Banners & Explainer PDFs</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">Instagram Square Post</h4>
                  <p className="text-xs text-slate-500">1080x1080px PNG</p>
                </div>
              </div>
              <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg" title="Download placeholder">
                <Download className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">Website Banner</h4>
                  <p className="text-xs text-slate-500">728x90px PNG</p>
                </div>
              </div>
              <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg" title="Download placeholder">
                <Download className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                  <span className="font-bold">PDF</span>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">MediGuard Explainer Flyer</h4>
                  <p className="text-xs text-slate-500">Print-ready A4 format</p>
                </div>
              </div>
              <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg" title="Download placeholder">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 mt-6 text-center">Note: Current assets are placeholders. Official marketing materials will be uploaded soon.</p>
        </div>
      </div>
    </div>
  );
}
