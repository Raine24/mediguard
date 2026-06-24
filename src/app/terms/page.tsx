import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions - MedicINtime",
  description: "Terms and conditions for using MedicINtime services.",
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-slate-300">Last Updated: June 2026</p>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-12 prose prose-slate max-w-none text-slate-700">
          
          <p className="lead text-lg mb-8">
            Welcome to MedicINtime. By accessing or using our medication reminder service via our website, WhatsApp, or other integrated platforms, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-6">
            By creating an account, subscribing to our service, or using MedicINtime, you agree to these Terms and Conditions. If you do not agree, please do not use our services.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-6">
            MedicINtime provides automated medication reminders via WhatsApp, email, and SMS. The service allows users to schedule reminders for themselves or act as a "Caretaker" to schedule reminders for family members or dependents. 
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Not Medical Advice</h2>
          <p className="mb-6">
            <strong>Important:</strong> MedicINtime is strictly a scheduling and notification tool. We are not a healthcare provider, pharmacy, or medical institution. The reminders sent by our system do not constitute medical advice, diagnosis, or treatment. You should always consult with a qualified healthcare professional regarding your medical conditions and medication regimens. 
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. User Responsibilities</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Accuracy of Information:</strong> You are responsible for ensuring that all medication names, dosages, and schedules entered into MedicINtime are entirely accurate and match your doctor's prescriptions.</li>
            <li><strong>Device Connectivity:</strong> MedicINtime relies on third-party networks (like WhatsApp and cellular providers). You must ensure your device is connected to the internet to receive timely notifications.</li>
            <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials and ensuring unauthorized individuals do not alter your medication schedules.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. Subscription, Free Trials, and Payments</h2>
          <p className="mb-6">
            MedicINtime offers a 3-day free trial for new users. Following the trial period, access to our active reminder service requires a paid subscription. Payments are processed securely via third-party providers (e.g., PayPal). Subscriptions automatically renew unless canceled prior to the billing cycle date. <strong>All subscription payments are strictly non-refundable.</strong> Please see our <Link href="/refunds" className="text-teal-600 hover:underline">Refund Policy</Link> for detailed information.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">6. Partner and Affiliate Programs</h2>
          <p className="mb-6">
            Users may participate in our Referral or Affiliate programs. Misuse, spamming, or fraudulent generation of referrals is strictly prohibited and will result in immediate account termination and forfeiture of any pending commissions.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">7. Limitation of Liability</h2>
          <p className="mb-6">
            MedicINtime strives for 100% uptime, but we cannot guarantee that the service will be entirely free from delays or failures due to network outages, API limits, or unforeseen technical issues. To the maximum extent permitted by law, MedicINtime shall not be held liable for any missed medications, health complications, damages, or losses resulting from delayed, undelivered, or inaccurate reminders.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">8. Privacy and Data Security</h2>
          <p className="mb-6">
            Protecting your health data is our priority. Please review our Privacy Policy to understand how we collect, use, and encrypt your personal and medication information.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">9. Modifications to Terms</h2>
          <p className="mb-6">
            We reserve the right to modify these Terms at any time. Significant changes will be communicated to users via email or WhatsApp. Continued use of the service after such modifications constitutes acceptance of the new terms.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">10. Contact Us</h2>
          <p className="mb-6">
            If you have any questions or concerns regarding these Terms and Conditions, please contact us at:
          </p>
          <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">
            <p className="font-medium text-slate-800 mb-1">MedicINtime Support</p>
            <p>Email: <a href="mailto:info@medicintime.com" className="text-blue-600 hover:underline">info@medicintime.com</a></p>

          </div>
          
        </div>
        
        {/* Footer Actions */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex justify-center">
          <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Return to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
