import PublicHeader from "@/components/PublicHeader";
import { Phone, MapPin, Mail } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - MedicINtime",
  description: "Get in touch with MedicINtime. If you have any questions, please feel free to reach out.",
};

export default function ContactUsPage() {
  return (
    <>
      <PublicHeader />
      
      {/* Dark background wrapper resembling the Dribbble design */}
      <main className="min-h-screen bg-[#111111] relative overflow-hidden py-12 md:py-24 px-4 sm:px-6">
        
        {/* Background decorative waves (approximate using CSS SVG or simple gradients) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,200 Q400,300 800,100 T1600,150" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="10 10"/>
            <path d="M0,400 Q500,500 1000,200 T2000,250" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="10 10"/>
            <path d="M-200,600 Q300,700 800,400 T1800,450" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="10 10"/>
            <path d="M-200,800 Q300,900 800,600 T1800,650" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="10 10"/>
          </svg>
        </div>

        {/* Main Card */}
        <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl relative z-10 overflow-hidden">
          
          {/* Content Padding Wrapper */}
          <div className="p-8 md:p-14">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-12 border-b border-gray-100 pb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight uppercase">
                Contact Us
              </h1>
              <p className="text-gray-500 max-w-sm text-sm md:text-base leading-relaxed">
                If you have any questions, please feel free to get in touch with us via phone, text, email, the form below, or even on social media!
              </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
              
              {/* Left Column: Form (Span 7) */}
              <div className="lg:col-span-7">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-8">
                  Get In Touch
                </h2>

                <form className="space-y-6" action="#" method="POST">
                  
                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        placeholder="Enter your name*" 
                        required
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91629] focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Phone Number</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        placeholder="Enter your phone number*" 
                        required
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91629] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      placeholder="Enter your email*" 
                      required
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91629] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-xs font-bold text-slate-700 uppercase tracking-wide">Your Message</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows={5}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91629] focus:border-transparent transition-all resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="w-full md:w-auto bg-[#D91629] text-white font-bold uppercase tracking-wider py-4 px-10 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md hover:shadow-lg"
                  >
                    Send Message
                  </button>

                </form>
              </div>

              {/* Right Column: Info & Hours (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Contact Information Block */}
                <div className="bg-[#F8F9FA] rounded-2xl p-8 border border-gray-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-8">
                    Contact Information
                  </h3>
                  
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <Phone className="w-5 h-5 text-[#D91629]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Phone</p>
                        <p className="text-gray-600 text-sm">
                          <a href="tel:+1234567890" className="hover:text-[#D91629] transition-colors">+91 98765 43210</a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <MapPin className="w-5 h-5 text-[#D91629]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Address</p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Andhra Pradesh, India
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <Mail className="w-5 h-5 text-[#D91629]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Email</p>
                        <p className="text-gray-600 text-sm">
                          <a href="mailto:vashishttechnologies@gmail.com" className="hover:text-[#D91629] transition-colors">vashishttechnologies@gmail.com</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Hours Block */}
                <div className="bg-[#F8F9FA] rounded-2xl p-8 border border-gray-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-8">
                    Business Hours
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Monday - Friday</p>
                      <p className="text-gray-600 text-sm">9:00 am - 8:00 pm</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Saturday</p>
                      <p className="text-gray-600 text-sm">9:00 am - 6:00 pm</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Sunday</p>
                      <p className="text-gray-600 text-sm">9:00 am - 5:00 pm</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom Map Section */}
          <div className="w-full h-80 bg-gray-200 border-t border-gray-200">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15582372.484227318!2d72.31689626353982!3d17.151703666795493!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3546fd1b7428f5%3A0x6e9f54668df37fb8!2sAndhra%20Pradesh!5e0!3m2!1sen!2sin!4v1708451848523!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="MedicINtime Location Map"
            ></iframe>
          </div>

        </div>
      </main>
    </>
  );
}
