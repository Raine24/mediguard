import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy - MedicINtime",
  description: "Detailed Refund Policy for MedicINtime subscriptions.",
};

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
          <p className="text-slate-300">Last Updated: June 2026</p>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-12 prose prose-slate max-w-none text-slate-700">
          
          <p className="lead text-lg mb-8 font-semibold text-slate-800">
            At MedicINtime, our refund policy is strictly "No Refunds". Please read this document carefully to understand our billing practices and your responsibilities as a subscriber.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Strict No-Refund Policy</h2>
          <p className="mb-6">
            All payments made to MedicINtime for any subscription plan (including Basic and Caretaker plans) are final and non-refundable. We do not provide refunds, prorated refunds, or credits for any partially used subscription periods, accidental renewals, or unused services.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. The 3-Day Free Trial</h2>
          <p className="mb-6">
            To ensure that our service meets your needs before you commit financially, we offer a <strong>3-Day Free Trial</strong> for all new users. During this trial period, you have full access to test our platform, including WhatsApp and SMS reminder delivery.
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>It is your responsibility to evaluate the service during this 3-day window.</li>
            <li>If you decide the service is not for you, you must cancel your subscription <strong>before</strong> the trial period ends.</li>
            <li>Once the trial period expires and your payment method is charged, that charge is final and non-refundable under any circumstances.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Cancellation Policy</h2>
          <p className="mb-6">
            You may cancel your subscription at any time through your MedicINtime Dashboard (under the Billing section). 
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Canceling your subscription prevents any future recurring charges.</li>
            <li>Cancellation does not trigger a refund for the current billing cycle.</li>
            <li>Upon cancellation, you will continue to have access to the service until the end of your currently paid billing period.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. Exceptions</h2>
          <p className="mb-6">
            Because of the nature of our digital infrastructure and the costs associated with our messaging gateways, <strong>there are absolutely no exceptions</strong> to this no-refund policy. This includes, but is not limited to:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Forgetting to cancel before the 3-day trial ends.</li>
            <li>Forgetting to cancel before a subscription renews.</li>
            <li>Failure to use the service after paying for a subscription.</li>
            <li>Technical issues on the user's end (such as losing access to a phone or internet connection).</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. Contact and Billing Disputes</h2>
          <p className="mb-6">
            If you believe your account was compromised or if you see duplicate charges on your bank statement due to a technical error on our end, please contact our support team immediately. Legitimate billing errors on our part will be corrected.
          </p>
          <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">
            <p className="font-medium text-slate-800 mb-1">Billing Support</p>
            <p>Email: <a href="mailto:info@medicintime.com" className="text-blue-600 hover:underline">info@medicintime.com</a></p>
          </div>
          
        </div>
        
        {/* Footer Actions */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex justify-center">
          <Link href="/" className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
            Return to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
