import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="absolute top-0 w-full z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 text-teal-700 font-extrabold text-xl italic tracking-tight">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
              MediGuard
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
