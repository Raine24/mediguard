import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer - MedicINtime",
  description: "Medical and Service Disclaimer for MedicINtime.",
};

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-2">Disclaimer</h1>
          <p className="text-slate-300">Last Updated: June 2026</p>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-12 prose prose-slate max-w-none text-slate-700">
          
          <p className="lead text-lg mb-8 font-semibold text-slate-800">
            Please read this Medical and Service Disclaimer carefully before using MedicINtime. By using our platform, you acknowledge and agree to the terms outlined below.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Not Medical Advice</h2>
          <p className="mb-6">
            MedicINtime is a technological tool designed strictly to help you remember to take your medications. <strong>It is NOT a medical device, nor is it a substitute for professional medical advice, diagnosis, or treatment.</strong> Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or medication schedule. Never disregard professional medical advice or delay in seeking it because of information provided by or scheduled through this application.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. User Responsibility for Accuracy</h2>
          <p className="mb-6">
            You are entirely responsible for the accuracy of the information you input into the MedicINtime platform. This includes, but is not limited to:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>The name and dosage of the medication.</li>
            <li>The exact times, frequency, and days the medication should be taken.</li>
            <li>The phone numbers provided for WhatsApp and SMS delivery.</li>
          </ul>
          <p className="mb-6">
            MedicINtime does not verify your prescriptions, dosages, or schedules against medical databases. We merely transmit the data you have provided at the times you have specified.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. No Guarantee of Delivery</h2>
          <p className="mb-6">
            While MedicINtime utilizes industry-leading communication partners (such as Twilio and MessageBird) to deliver SMS and WhatsApp notifications, <strong>we cannot and do not guarantee 100% successful or timely delivery of reminders.</strong>
          </p>
          <p className="mb-6">
            Delivery may be delayed or fail entirely due to numerous factors outside of our control, including:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Mobile network outages or poor cellular reception.</li>
            <li>Internet connectivity issues on your device.</li>
            <li>Carrier-level filtering, blocking, or spam protections.</li>
            <li>Your phone being turned off, out of battery, or in "Do Not Disturb" mode.</li>
            <li>Service interruptions at our third-party messaging gateways or cloud hosting providers.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. Limitation of Liability</h2>
          <p className="mb-6">
            Under no circumstances, including negligence, shall MedicINtime, its creators, affiliates, partners, or employees be liable for any direct, indirect, incidental, special, consequential, or punitive damages that result from the use of, or the inability to use, our service.
          </p>
          <p className="mb-6">
            This includes any medical emergencies, missed medications, overdoses, health complications, or death resulting from missed, delayed, or inaccurate reminders. You explicitly agree that relying on MedicINtime to manage critical health conditions is done entirely at your own risk. You should always maintain a physical backup method for tracking essential medications.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. Third-Party Links</h2>
          <p className="mb-6">
            Our service may contain links to third-party web sites or services that are not owned or controlled by MedicINtime. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third party web sites or services.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">6. Contact Information</h2>
          <p className="mb-6">
            If you have any questions regarding this Disclaimer, please contact us at:
          </p>
          <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">
            <p className="font-medium text-slate-800 mb-1">MedicINtime Support</p>
            <p>Email: <a href="mailto:info@medicintime.com" className="text-blue-600 hover:underline">info@medicintime.com</a></p>
          </div>
          
        </div>
        
        {/* Footer Actions */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex justify-center">
          <Link href="/" className="inline-block px-6 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors">
            Return to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
