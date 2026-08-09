import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Metadata } from "next";
import Link from "next/link";
import { Users, Target, Lightbulb, Play, Star, ChevronDown, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - MedicINtime",
  description: "Learn about MedicINtime's mission to simplify health through smart, accessible medication reminders.",
};

export default function AboutPage() {
  return (
    <>
      <PublicHeader />
      
      <main className="min-h-screen bg-[#fafafa] font-sans selection:bg-teal-200">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <div className="max-w-2xl">

              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Simplifying Health Through Care
              </h1>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl">
                Driven by care. Powered by technology. We help patients and caretakers unlock peace of mind with ethical, scalable, and user-first medication reminders directly on WhatsApp.
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-[#0D3D56] rounded-full hover:shadow-lg hover:shadow-[#0D3D56]/30 transition-all duration-300"
              >
                Start Free Trial
              </Link>
            </div>

            {/* BENTO BOX HERO GRAPHICS */}
            <div className="relative h-auto md:h-[500px] w-full rounded-3xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Top Left: Progress Circle */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351.86" strokeDashoffset="70.37" className="text-teal-500" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-slate-900">80%</span>
                  <span className="text-xs text-gray-500 font-medium">Adherence</span>
                </div>
              </div>

              {/* Top Right: Chart */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">R</div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">124k+</div>
                    <div className="text-xs text-gray-500">Reminders Sent</div>
                  </div>
                </div>
                <div className="mt-6 flex-grow relative">
                  {/* Mock Chart Line */}
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <path d="M0,30 Q20,10 40,25 T80,15 T100,5" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="80" cy="15" r="4" fill="white" stroke="#2563eb" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Bottom Left: Team */}
              <div className="bg-slate-100 rounded-3xl p-6 border border-gray-100 flex flex-col justify-center">
                <p className="text-sm font-medium text-gray-500 mb-2">Dedicated support.</p>
                <div className="text-4xl font-extrabold text-slate-900 mb-4">24/7</div>
                <div className="flex -space-x-3">
                  <img src="https://i.pravatar.cc/150?img=32" alt="Support" className="w-10 h-10 rounded-full border-2 border-white" />
                  <img src="https://i.pravatar.cc/150?img=12" alt="Support" className="w-10 h-10 rounded-full border-2 border-white" />
                  <img src="https://i.pravatar.cc/150?img=68" alt="Support" className="w-10 h-10 rounded-full border-2 border-white" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">+</div>
                </div>
              </div>

              {/* Bottom Right: Phone Mockup */}
              <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute -bottom-10 -right-4 w-40 h-56 bg-white rounded-[2rem] border-4 border-gray-800 shadow-2xl rotate-12 p-3">
                  <div className="w-full h-full bg-slate-50 rounded-xl overflow-hidden relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-gray-800 rounded-full"></div>
                    <div className="mt-8 px-2 space-y-2">
                      <div className="w-full h-8 bg-green-100 rounded-lg flex items-center px-2"><span className="w-2 h-2 rounded-full bg-green-500"></span></div>
                      <div className="w-3/4 h-8 bg-white shadow-sm rounded-lg"></div>
                      <div className="w-5/6 h-8 bg-white shadow-sm rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TRUSTED BY */}
        <section className="py-10 border-y border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-8">Trusted by caretakers and clinics</p>
            <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-50 grayscale">
              {/* Fake Logos for social proof */}
              <div className="text-xl font-black font-serif">HealthPlus</div>
              <div className="text-xl font-bold tracking-tighter">MedCare.</div>
              <div className="text-xl font-bold uppercase tracking-widest">PharmaNet</div>
              <div className="text-xl font-black italic">CareGivers</div>
              <div className="text-xl font-bold text-gray-700">ElderlyTrust</div>
            </div>
          </div>
        </section>

        {/* STORY & STATS */}
        <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">It All Started with a Frustration</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We were tired of bloated, clunky health apps that required elderly patients to download and learn new software. So we created a better way — combining the familiarity of WhatsApp with ethical, intuitive automation. What began as a simple script is now a growing platform trusted by thousands across the globe.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-48">
              <p className="text-sm font-medium text-gray-500">Reminders Delivered</p>
              <p className="text-4xl md:text-5xl font-extrabold text-slate-900">2M+</p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-48">
              <p className="text-sm font-medium text-gray-500">Active Patients</p>
              <p className="text-4xl md:text-5xl font-extrabold text-slate-900">25k+</p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-48">
              <p className="text-sm font-medium text-gray-500">Adherence Rate</p>
              <p className="text-4xl md:text-5xl font-extrabold text-slate-900">98%</p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-48">
              <p className="text-sm font-medium text-gray-500">Partner Clinics</p>
              <p className="text-4xl md:text-5xl font-extrabold text-slate-900">50+</p>
            </div>
          </div>
        </section>

        {/* VALUES SECTION */}
        <section className="py-24 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">What We Believe In</h2>
              </div>
              <div className="max-w-md">
                <p className="text-gray-600">
                  Our values guide everything we create — from product design to how we handle your health data. They keep us focused, honest, and aligned with our mission.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Value 1 */}
              <div className="bg-slate-50 p-10 rounded-3xl border border-gray-100">
                <div className="w-14 h-14 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mb-8">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">User-First Always</h3>
                <p className="text-gray-600">
                  We don't force users to change their habits. By integrating with WhatsApp, we meet patients where they already are.
                </p>
              </div>
              {/* Value 2 */}
              <div className="bg-slate-50 p-10 rounded-3xl border border-gray-100">
                <div className="w-14 h-14 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-8">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Build What Matters</h3>
                <p className="text-gray-600">
                  No bloated features. Just a simple, robust scheduling engine that reliably delivers alerts exactly when needed.
                </p>
              </div>
              {/* Value 3 */}
              <div className="bg-slate-50 p-10 rounded-3xl border border-gray-100">
                <div className="w-14 h-14 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mb-8">
                  <Lightbulb className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Stay Curious</h3>
                <p className="text-gray-600">
                  We continuously iterate on feedback from caretakers and clinics to refine the simplest medication adherence tool available.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Proven by People Who Use It</h2>
            <p className="text-gray-600">Join thousands of satisfied users who trust us to power their health routines every day.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Column 1 */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex gap-1 text-amber-400 mb-4">
                  <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                  "Everything just works — and that's rare. We've tried multiple apps for my father's medication, but this one stood out because he didn't need to learn a new app. The WhatsApp integration is brilliant."
                </p>
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/150?img=47" alt="User" className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Sarah M.</h4>
                    <p className="text-xs text-gray-500">Caretaker</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex gap-1 text-amber-400 mb-4">
                  <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                  "We've used a lot of tools in the past, but this one feels like it was built for us. Managing prescriptions for 12 residents used to be a nightmare. Now it's fully automated."
                </p>
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Devon K.</h4>
                    <p className="text-xs text-gray-500">Nursing Home Director</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Large Video Feature */}
            <div className="bg-slate-200 rounded-3xl overflow-hidden relative group cursor-pointer border border-gray-100">
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80" alt="Video thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex gap-1 text-amber-400 mb-4">
                  <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                  "As a busy professional, I often forgot my supplements. I needed a tool that seamlessly integrated into my day. Getting a simple WhatsApp message is exactly what I needed without app fatigue."
                </p>
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/150?img=60" alt="User" className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Leo J.</h4>
                    <p className="text-xs text-gray-500">Software Engineer</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex gap-1 text-amber-400 mb-4">
                  <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                  "What impressed me most wasn't just the reliable alerts, but how the team behind it listens to feedback. They added custom schedules precisely because users like me asked for it."
                </p>
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/150?img=5" alt="User" className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Anita R.</h4>
                    <p className="text-xs text-gray-500">Freelancer</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>



        {/* FAQ SECTION */}
        <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know about our product, pricing, and features.</p>
          </div>

          <div className="space-y-4">
            {/* FAQ Item */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex justify-between items-start cursor-pointer hover:border-gray-300 transition-colors">
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Do I need to download an app?</h4>
                <p className="text-gray-600 mt-2">No, MedicINtime works entirely through WhatsApp. You don't need to download or learn any new applications.</p>
              </div>
              <ChevronDown className="w-6 h-6 text-gray-400 rotate-180" />
            </div>
            
            {/* Fake FAQ Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex justify-between items-center cursor-pointer hover:border-gray-300 transition-colors">
              <h4 className="font-bold text-slate-900 text-lg">Can I manage medications for my parents?</h4>
              <ChevronDown className="w-6 h-6 text-gray-400" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex justify-between items-center cursor-pointer hover:border-gray-300 transition-colors">
              <h4 className="font-bold text-slate-900 text-lg">Is my medical data secure?</h4>
              <ChevronDown className="w-6 h-6 text-gray-400" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex justify-between items-center cursor-pointer hover:border-gray-300 transition-colors">
              <h4 className="font-bold text-slate-900 text-lg">How does the 3-day free trial work?</h4>
              <ChevronDown className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600">Still have questions? <Link href="/contact" className="text-blue-600 font-bold hover:underline">Contact our support team</Link></p>
          </div>
        </section>

      </main>
      <PublicFooter />
    </>
  );
}
