import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="absolute top-4 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[1200px] flex items-center justify-between px-6 py-3.5 bg-[#FAF8F4]/80 backdrop-blur-md border border-[#0D3D56]/10 rounded-[24px] z-50 transition-all">
      <Link href="/" className="flex items-center gap-2 text-[#0D3D56] font-extrabold text-[1.4rem] italic tracking-tight font-sans">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
        MediGuard
      </Link>
      
      <div className="flex items-center gap-6">
        <Link href="/" className="text-[0.875rem] font-medium text-[#3a3a3c] hover:text-[#0D3D56] hidden md:block transition-colors">Home</Link>
        <Link href="/#how-it-works" className="text-[0.875rem] font-medium text-[#3a3a3c] hover:text-[#0D3D56] hidden md:block transition-colors">How it Works</Link>
        <Link href="/#pricing" className="text-[0.875rem] font-medium text-[#3a3a3c] hover:text-[#0D3D56] hidden md:block transition-colors">Pricing</Link>
        <div className="flex items-center gap-3 ml-2">
          <Link href="/login" className="text-[0.9rem] font-semibold text-[#0D3D56] border-[1.5px] border-[#0D3D56] px-[22px] py-[10px] rounded-[50px] hover:bg-[#0D3D56] hover:text-white transition-all hidden sm:inline-flex">Log In</Link>
          <Link href="/register" className="text-[0.9rem] font-semibold bg-[#F4A300] text-[#1C1C1E] px-[22px] py-[10px] rounded-[50px] hover:bg-[#fdb73a] hover:-translate-y-[1px] shadow-[0_4px_16px_rgba(244,163,0,0.3)] hover:shadow-[0_6px_24px_rgba(244,163,0,0.4)] transition-all inline-flex">Get Started</Link>
        </div>
      </div>
    </header>
  );
}
