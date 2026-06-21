import React from 'react';
import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';

export default function AffiliateLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <PublicHeader />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-slate-900 text-white pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Partner with MedicinTime</h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-10">
              Join our affiliate program and earn a recurring 20% commission for every patient, family, or clinic you refer to MedicinTime.
            </p>
            <Link 
              href="/affiliates/register" 
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors inline-block"
            >
              Apply Now
            </Link>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16 text-slate-800">Why Partner with Us?</h2>
            
            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">High Recurring Commissions</h3>
                <p className="text-slate-600">Earn 20% of the subscription value every single month your referred user stays subscribed. Build a passive income stream.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Advanced Dashboard</h3>
                <p className="text-slate-600">Track clicks, conversions, and payouts in real-time using our dedicated partner dashboard. Full transparency on your earnings.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Help Save Lives</h3>
                <p className="text-slate-600">By promoting MedicinTime, you are helping patients take their medication on time. It's a product you can be proud to recommend.</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white py-20 px-6 border-t border-slate-200">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16 text-slate-800">How It Works</h2>
            
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-16 h-16 shrink-0 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold">1</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-slate-800">Apply & Get Approved</h3>
                  <p className="text-slate-600 text-lg">Submit your application. Once approved, you'll gain access to your partner dashboard and receive your unique tracking link.</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-16 h-16 shrink-0 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold">2</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-slate-800">Share Your Link</h3>
                  <p className="text-slate-600 text-lg">Use our ready-made marketing materials to promote MedicinTime to your audience via social media, blog posts, or directly to patients in clinics.</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-16 h-16 shrink-0 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold">3</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-slate-800">Earn Commissions</h3>
                  <p className="text-slate-600 text-lg">When someone clicks your link, signs up, and pays for a subscription, you automatically earn a commission. We handle the payouts directly to your PayPal or Bank Account.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>© {new Date().getFullYear()} MedicinTime Affiliate Program. All rights reserved.</p>
      </footer>
    </div>
  );
}
