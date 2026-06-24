import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - MedicINtime",
  description: "Cookie Policy and tracking information for MedicINtime.",
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-slate-300">Last Updated: June 2026</p>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-12 prose prose-slate max-w-none text-slate-700">
          
          <p className="lead text-lg mb-8">
            This Cookie Policy explains how MedicINtime uses cookies and similar tracking technologies when you visit our website or use our application. By continuing to browse our site, you consent to our use of cookies as described in this policy.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. What Are Cookies?</h2>
          <p className="mb-6">
            Cookies are small text files placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently, provide a secure login experience, and remember your preferences.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. How We Use Cookies</h2>
          <p className="mb-6">
            MedicINtime strictly limits the use of cookies to those that are necessary for the platform to function securely and efficiently. We do not use third-party advertising trackers. Our cookies fall into the following categories:
          </p>

          <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">A. Strictly Necessary Cookies</h3>
          <p className="mb-4">
            These cookies are essential for you to navigate our application and use its features securely. Without these cookies, services like secure login, authentication, and session management cannot be provided.
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Authentication:</strong> Keeping you securely logged into your dashboard.</li>
            <li><strong>Security:</strong> Preventing CSRF (Cross-Site Request Forgery) attacks and unauthorized access.</li>
          </ul>

          <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">B. Functional Cookies</h3>
          <p className="mb-4">
            These cookies allow our website to remember choices you make (such as dismissing the cookie banner) and provide enhanced functionality.
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Consent Preferences:</strong> Remembering whether you have accepted or declined non-essential cookies.</li>
          </ul>

          <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">C. Affiliate & Referral Tracking Cookies</h3>
          <p className="mb-4">
            If you click on an affiliate or referral link to visit our website, we use a temporary tracking cookie (such as <code>medicintime_ref</code>) to securely attribute the signup to the correct partner.
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Attribution:</strong> These cookies last for a maximum of 30 days and are only used to calculate partner commissions. They do not track your browsing activity outside of MedicINtime.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Managing Your Cookies</h2>
          <p className="mb-6">
            You can control or delete cookies using your browser settings. Most browsers allow you to refuse cookies or alert you when a cookie is being placed on your device. However, if you disable strictly necessary cookies, you will not be able to log in or use the MedicINtime dashboard.
          </p>
          <p className="mb-6">
            To learn more about managing cookies on popular browsers, you can visit the help pages of Google Chrome, Mozilla Firefox, Apple Safari, or Microsoft Edge.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. Updates to this Policy</h2>
          <p className="mb-6">
            We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business operations. Any updates will be posted on this page with an updated revision date.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. Contact Us</h2>
          <p className="mb-6">
            If you have any questions about our use of cookies, please contact us at:
          </p>
          <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">
            <p className="font-medium text-slate-800 mb-1">MedicINtime Support</p>
            <p>Email: <a href="mailto:info@medicintime.com" className="text-blue-600 hover:underline">info@medicintime.com</a></p>
          </div>
          
        </div>
        
        {/* Footer Actions */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex justify-center">
          <Link href="/" className="inline-block px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
            Return to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
