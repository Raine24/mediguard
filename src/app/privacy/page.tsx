import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - MedicINtime",
  description: "Privacy Policy and data protection details for MedicINtime.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-slate-300">Last Updated: June 2026</p>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-12 prose prose-slate max-w-none text-slate-700">
          
          <p className="lead text-lg mb-8">
            At MedicINtime, your privacy and data security are our highest priorities. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our medication reminder service.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-6">
            We collect information that you provide directly to us when setting up your account and scheduling reminders. This includes:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Account Details:</strong> Your name, email address, phone number (for WhatsApp/SMS), and time zone.</li>
            <li><strong>Medication Data:</strong> Names of your medications, dosages, frequency, and specific time schedules.</li>
            <li><strong>Caretaker Information:</strong> If using the Caretaker plan, we collect the basic contact details of your dependents to send them reminders.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-6">
            We use your data strictly to provide and improve the MedicINtime service. Specifically, we use it to:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Send accurate, timely medication reminders to you or your dependents via your chosen platform (WhatsApp, SMS, or Email).</li>
            <li>Manage your account, subscription billing, and support requests.</li>
            <li>Track Affiliate and Referral program payouts and commissions.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Data Sharing and Third Parties</h2>
          <p className="mb-6">
            <strong>We do not sell, rent, or trade your personal or health data to third parties.</strong> We only share necessary information with trusted service providers to operate our platform, including:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Messaging Partners:</strong> such as Bird (MessageBird) and Twilio, strictly for the purpose of delivering your reminders securely over WhatsApp or SMS.</li>
            <li><strong>Payment Processors:</strong> such as PayPal, to securely process your subscription payments. We do not store your raw credit card data on our servers.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. Data Security</h2>
          <p className="mb-6">
            We implement industry-standard encryption protocols (SSL/TLS) to protect your data in transit. Your passwords and sensitive credentials are mathematically hashed (using bcrypt) before being saved in our secure database. While we strive for 100% security, no digital system is completely invulnerable, and we cannot guarantee absolute security against all unauthorized breaches.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. Your Privacy Rights</h2>
          <p className="mb-6">
            Depending on your location, you have the right to access, update, or permanently delete your data. You can manage and delete your medication schedules directly from your dashboard. If you wish to completely close your account and erase all historical data from our servers, please contact support.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">6. Cookies and Tracking</h2>
          <p className="mb-6">
            We use essential cookies to maintain your login session and store your preferences. We also use functional cookies to track Affiliate and Referral links so that we can appropriately credit our partners for new signups. We do not use intrusive third-party advertising trackers.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">7. Contact Us</h2>
          <p className="mb-6">
            If you have any questions or concerns regarding your privacy or this policy, please reach out to our privacy team:
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
