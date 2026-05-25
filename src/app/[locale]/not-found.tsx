import Link from "next/link";
import { Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-xl w-full text-center">
        <div className="w-24 h-24 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Search className="w-12 h-12" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 leading-tight">
          Page Not Found
        </h1>
        
        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg mx-auto">
          The link you followed may be broken, or the page may have been removed.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="flex items-center justify-center w-full sm:w-auto h-14 px-8 text-lg font-bold bg-brand-green hover:bg-brand-green-dark text-white rounded-xl shadow-lg shadow-brand-green/20 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Return to Home
          </Link>
          
          <Link 
            href="/search"
            className="flex items-center justify-center w-full sm:w-auto h-14 px-8 text-lg font-bold text-brand-blue border border-slate-200 hover:bg-brand-blue/5 rounded-xl transition-colors"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
