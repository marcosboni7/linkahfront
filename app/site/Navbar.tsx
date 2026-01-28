import Link from 'next/link';
import { Ticket, User, Search } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-[#C22973] rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
          <Ticket className="text-white" size={22} />
        </div>
        <span className="text-2xl font-black italic tracking-tighter">LINKAH</span>
      </Link>
      
      <div className="hidden md:flex items-center bg-slate-100 px-4 py-2 rounded-full w-1/3">
        <Search size={16} className="text-slate-400" />
        <input type="text" placeholder="Procurar eventos..." className="bg-transparent border-none outline-none px-3 text-sm font-bold w-full" />
      </div>

      <Link href="/auth/login" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#C22973] transition-all">
        <User size={14} /> Entrar
      </Link>
    </nav>
  );
}