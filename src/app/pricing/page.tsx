"use client";

import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useState } from "react";
import Link from "next/link";

export default function PricingPage() {
  const [interval, setBillingInterval] = useState<"monthly" | "biannual" | "annual">("monthly");

  return (
    <>
      <PublicHeader />
      
      {/* 
        We inject the specific CSS from index.html here so the pricing section 
        looks exactly identical to the homepage without rewriting to Tailwind.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --charcoal: #1C1C1E;
          --charcoal-soft: #48484A;
          --teal: #0D3D56;
          --shadow-sm: 0 4px 12px rgba(0,0,0,0.05);
          --shadow-md: 0 12px 32px rgba(13,61,86,0.12);
        }

        .pricing-section {
          padding: 100px 20px;
          background: #fafafa;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 60px;
        }
        
        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--charcoal);
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        .section-title .accent {
          color: var(--teal);
        }

        .billing-toggle-wrap {
          display: flex;
          justify-content: center;
          gap: 8px;
          background: rgba(13,61,86,0.05);
          padding: 6px;
          border-radius: 8px;
          width: max-content;
          margin: 30px auto 0;
        }

        .toggle-btn {
          border: none;
          background: transparent;
          padding: 8px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          color: var(--charcoal-soft);
          transition: all 0.2s;
        }
        .toggle-btn.active {
          background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          color: var(--charcoal);
        }

        .pricing-card-wrap {
          display: flex;
          gap: 30px;
          max-width: 1100px;
          margin: 0 auto;
          align-items: stretch;
          justify-content: center;
          flex-wrap: wrap;
        }

        .pricing-card {
          flex: 1;
          min-width: 300px;
          background: #fff;
          border-radius: 24px;
          padding: 40px 32px;
          box-shadow: var(--shadow-sm);
          position: relative;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(0,0,0,0.04);
        }

        .pricing-card:hover { box-shadow: var(--shadow-md); }

        .pricing-card.popular {
          background: var(--teal);
          color: #fff;
          border: none;
          transform: translateY(-10px);
          box-shadow: var(--shadow-md);
        }
        .pricing-card.popular:hover {
          transform: translateY(-15px);
        }

        .pricing-badge {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }

        .pricing-card:not(.popular) .pricing-badge { color: var(--teal); }
        .pricing-card.popular .pricing-badge { color: #fff; opacity: 0.9; }

        .pricing-desc {
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 24px;
          min-height: 42px;
        }

        .pricing-card:not(.popular) .pricing-desc { color: var(--charcoal-soft); }
        .pricing-card.popular .pricing-desc { color: rgba(255,255,255,.8); }

        .pricing-price {
          display: flex;
          align-items: baseline;
          margin-bottom: 24px;
        }

        .pricing-currency {
          font-size: 24px;
          font-weight: 600;
          margin-right: 4px;
          transform: translateY(-12px);
        }

        .pricing-card:not(.popular) .pricing-currency { color: var(--charcoal-soft); }
        .pricing-card.popular .pricing-currency { color: rgba(255,255,255,.6); }

        .pricing-amount {
          font-size: 56px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .pricing-period {
          font-size: 16px;
          font-weight: 500;
          margin-left: 6px;
        }

        .pricing-card:not(.popular) .pricing-period { color: var(--charcoal-soft); }
        .pricing-card.popular .pricing-period { color: rgba(255,255,255,.5); }

        .pricing-divider {
          height: 1px;
          width: 100%;
          margin: 0 0 24px 0;
        }

        .pricing-card:not(.popular) .pricing-divider { background: rgba(13,61,86,.08); }
        .pricing-card.popular .pricing-divider { background: rgba(255,255,255,.1); }

        .pricing-features {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;
          flex-grow: 1;
        }

        .pricing-feature {
          display: flex;
          align-items: flex-start;
          font-size: 15px;
          line-height: 1.4;
          margin-bottom: 16px;
        }

        .pricing-card:not(.popular) .pricing-feature { color: var(--charcoal); }
        .pricing-card.popular .pricing-feature { color: rgba(255,255,255,.85); }

        .pricing-check {
          margin-right: 12px;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(13,61,86,.1);
          flex-shrink: 0;
        }
        .pricing-card.popular .pricing-check { background: rgba(255,255,255,.2); }
        .pricing-card:not(.popular) .pricing-check svg path { stroke: var(--teal); }
        .pricing-card.popular .pricing-check svg path { stroke: #fff; }

        .pricing-check svg { width: 10px; height: 10px; }

        .btn-pricing {
          width: 100%;
          padding: 16px 20px;
          border-radius: 12px;
          text-align: center;
          font-weight: 700;
          font-size: 16px;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s;
        }
        .btn-ghost {
          background: rgba(13,61,86,.05);
          color: var(--teal);
        }
        .btn-ghost:hover { background: rgba(13,61,86,.1); }
        
        .btn-amber {
          background: #F5A623;
          color: #fff;
        }
        .btn-amber:hover { background: #E0951C; }

        .pricing-subnote {
          font-size: 12px;
          text-align: center;
          margin-top: 12px;
        }
        .pricing-card:not(.popular) .pricing-subnote { color: var(--charcoal-soft); }
        .pricing-card.popular .pricing-subnote { color: rgba(255,255,255,.6); }

        .pricing-footer {
          text-align: center;
          margin-top: 40px;
          font-size: 15px;
          color: var(--charcoal-soft);
        }
        .pricing-footer a {
          color: var(--teal);
          font-weight: 600;
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .pricing-card-wrap {
            flex-direction: column;
            align-items: stretch;
            padding: 0 10px;
          }
          .pricing-card.popular {
            transform: none;
          }
          .pricing-card.popular:hover {
            transform: translateY(-5px);
          }
        }
      `}} />

      <main className="bg-[#fafafa] font-sans">
        <section className="pricing-section">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="pricing-header">
              <h2 className="section-title" id="pricing-heading">Simple plans for <span className="accent">everyone.</span></h2>
              <p className="text-gray-600 text-lg mt-3 text-center">Cancel anytime. Try Basic free for 3 days.</p>
              
              <div className="billing-toggle-wrap">
                <button 
                  className={`toggle-btn ${interval === 'monthly' ? 'active' : ''}`} 
                  onClick={() => setBillingInterval('monthly')}
                >
                  Monthly
                </button>
                <button 
                  className={`toggle-btn ${interval === 'biannual' ? 'active' : ''}`}
                  onClick={() => setBillingInterval('biannual')}
                >
                  6 Months
                </button>
                <button 
                  className={`toggle-btn ${interval === 'annual' ? 'active' : ''}`}
                  onClick={() => setBillingInterval('annual')}
                >
                  Annually
                </button>
              </div>
            </div>

            <div className="pricing-card-wrap">
              
              {/* BASIC TIER */}
              <div className="pricing-card">
                <div className="pricing-badge">Basic</div>
                <p className="pricing-desc">Best for patients on a tight budget who just need simple daily reminders.</p>
                <div className="pricing-price">
                  <span className="pricing-currency">$</span>
                  <span className="pricing-amount">
                    {interval === 'monthly' ? "2.50" : interval === 'biannual' ? "14.00" : "27.00"}
                  </span>
                  <span className="pricing-period"> / {interval === 'annual' ? 'year' : interval === 'biannual' ? '6 months' : 'month'}</span>
                </div>
                <div className="pricing-divider"></div>
                <ul className="pricing-features" aria-label="Basic plan features">
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>1 patient (1 WhatsApp number)</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Up to 3 medicines</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Up to 3 reminders per day</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>WhatsApp delivery only</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Self-service patient portal</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Basic email support</li>
                </ul>
                <Link href="/register?plan=basic" className="btn-pricing btn-ghost">Start 3-Day Free Trial</Link>
              </div>

              {/* STANDARD TIER */}
              <div className="pricing-card popular">
                <div className="pricing-badge">Most Popular</div>
                <p className="pricing-desc">Best for patients managing multiple conditions or medicines.</p>
                <div className="pricing-price">
                  <span className="pricing-currency">$</span>
                  <span className="pricing-amount">
                    {interval === 'monthly' ? "5.00" : interval === 'biannual' ? "20.00" : "45.00"}
                  </span>
                  <span className="pricing-period"> / {interval === 'annual' ? 'year' : interval === 'biannual' ? '6 months' : 'month'}</span>
                </div>
                <div className="pricing-divider"></div>
                <ul className="pricing-features" aria-label="Standard plan features">
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>1 patient (1 WhatsApp number)</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Up to 10 medicines</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Unlimited reminders per day</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div><strong>Reliable WhatsApp delivery</strong></li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Self-service patient portal</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Priority support</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Subscription expiry reminders</li>
                </ul>
                <Link href="/register?plan=standard" className="btn-pricing btn-amber">Subscribe Now</Link>
              </div>

              {/* FAMILY TIER */}
              <div className="pricing-card">
                <div className="pricing-badge">Caretakers / Parental Care</div>
                <p className="pricing-desc">Best for families managing medication for elderly parents or multiple members.</p>
                <div className="pricing-price">
                  <span className="pricing-currency">$</span>
                  <span className="pricing-amount">
                    {interval === 'monthly' ? "4.75" : interval === 'biannual' ? "27.00" : "52.00"}
                  </span>
                  <span className="pricing-period"> / {interval === 'annual' ? 'year' : interval === 'biannual' ? '6 months' : 'month'}</span>
                </div>
                <div className="pricing-divider"></div>
                <ul className="pricing-features" aria-label="Caretaker plan features">
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div><strong>Up to 2 patients (2 numbers max)</strong></li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Up to 10 medicines per person</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Unlimited reminders per person</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Reliable WhatsApp delivery for all</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Caretaker admin dashboard</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Priority support</li>
                  <li className="pricing-feature"><div className="pricing-check" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1C1C1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>Expiry reminders for all</li>
                </ul>
                <Link href="/register?plan=family" className="btn-pricing btn-ghost">Subscribe Now</Link>
                <div className="pricing-subnote">Works out to just $6.00 per person</div>
              </div>

            </div>
            
            <div className="pricing-footer">
              Are you a clinic or pharmacy managing 10+ patients? <Link href="/contact">Contact us for clinic pricing</Link>.
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
