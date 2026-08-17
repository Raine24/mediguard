"use client";

import Link from "next/link";

export default function PublicFooter() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --charcoal: #1C1C1E;
          --amber: #F5A623;
          --white: #ffffff;
          --font-display: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .footer {
          background: var(--charcoal);
          padding: 80px 0 24px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .footer-inner {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.2fr 1fr;
          gap: 40px;
          margin-bottom: 64px;
        }
        .footer-brand-name {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 1.6rem;
          color: var(--white);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-tagline {
          font-size: .95rem;
          color: rgba(255,255,255,.6);
          line-height: 1.6;
          max-width: 280px;
          margin-bottom: 24px;
        }
        .footer-built {
          font-size: .85rem;
          color: rgba(255,255,255,.4);
        }
        .footer-built a {
          color: var(--amber);
          font-weight: 600;
        }
        .footer-col-title {
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--white);
          margin-bottom: 24px;
        }
        .footer-nav {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .footer-nav a {
          font-size: .95rem;
          color: rgba(255,255,255,.6);
          transition: color .2s ease;
          text-decoration: none;
        }
        .footer-nav a:hover { color: var(--amber); }
        
        .footer-platform {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          font-size: .95rem;
          color: rgba(255,255,255,.8);
        }
        .footer-platform svg {
          width: 22px; height: 22px;
        }
        .platform-wa { color: #25D366; }
        .platform-tg { color: #229ED9; }
        .platform-sms { color: var(--amber); }

        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,.1);
          padding-top: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: .85rem;
          color: rgba(255,255,255,.4);
        }

        @media (max-width: 900px) {
          .footer-inner {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}} />
      <footer className="footer" id="footer" aria-label="Site footer">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <div className="footer-inner">
            <div>
              <div className="footer-brand-name">
                <img src="/brand-logo.png" alt="MedicINtime Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <p className="footer-tagline">Your health, delivered to your favourite chat app. Never miss a dose again.</p>
              <div style={{ marginTop: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', padding: '6px', borderRadius: '12px', display: 'inline-block' }}>
                  <img src="/qr-code.jpg" alt="Scan to visit MedicINtime" style={{ width: '90px', height: '90px', borderRadius: '6px', display: 'block' }} />
                </div>
              </div>
              <p className="footer-built">Built by <a href="#" target="_blank" rel="noopener noreferrer">Baker Web Solution</a></p>
            </div>
            
            <div>
              <div className="footer-col-title">Navigation</div>
              <nav className="footer-nav" aria-label="Footer navigation">
                <Link href="/">Home</Link>
                <Link href="/#how-it-works">How It Works</Link>
                <Link href="/about">About Us</Link>
                <Link href="/pricing">Pricing</Link>
                <Link href="/login">Referral Program</Link>
                <Link href="/affiliates">Affiliate Program</Link>
                <Link href="/contact">Contact</Link>
              </nav>
            </div>

            <div>
              <div className="footer-col-title">Supported Platforms</div>
              
              <div className="footer-platform">
                <svg className="platform-wa" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </div>
              
              <div className="footer-platform">
                <svg className="platform-tg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.33-1.08-.7.02-.19.27-.39.75-.59 2.95-1.28 4.91-2.13 5.89-2.54 2.79-1.16 3.37-1.36 3.75-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
                </svg>
                Telegram
              </div>

              <div className="footer-platform">
                <svg className="platform-sms" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                SMS / Text
              </div>
            </div>

            <div>
              <div className="footer-col-title">Legal & Contact</div>
              <nav className="footer-nav" aria-label="Legal navigation">
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms and Conditions</Link>
                <Link href="/cookies">Cookie Policy</Link>
                <Link href="/refunds">Refund Policy</Link>
                <Link href="/disclaimer">Disclaimer</Link>
                <a href="mailto:info@medicintime.com">info@medicintime.com</a>
              </nav>
            </div>

          </div>
          <div className="footer-bottom">
            <span>© 2026 MedicINtime. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
