'use client';

import Link from 'next/link';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  ShieldCheck, 
  CreditCard, 
  Smartphone 
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* COLUNA 1: LOGO E SOBRE */}
          <div className="space-y-6">
            <Link href="/" className="text-slate-900 text-3xl font-black tracking-tighter italic">
              LINKAH<span className="text-[#ff0082]">.</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              A maior plataforma de experiências e ingressos para quem vive o extraordinário. Conectando você aos melhores momentos.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-[#ff0082] hover:text-white transition-all">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-[#ff0082] hover:text-white transition-all">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-[#ff0082] hover:text-white transition-all">
                <Twitter size={18} />
              </Link>
            </div>
          </div>

          {/* COLUNA 2: CATEGORIAS */}
          <div>
            <h4 className="text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] mb-6">Explorar</h4>
            <ul className="space-y-4">
              {['Shows e Festas', 'Teatro e Cultura', 'Congressos', 'Esportes', 'Cursos e Workshops'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-500 hover:text-[#ff0082] text-sm font-bold transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUNA 3: INSTITUCIONAL */}
          <div>
            <h4 className="text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] mb-6">Institucional</h4>
            <ul className="space-y-4">
              {['Sobre a Linkah', 'Central de Ajuda', 'Termos e Políticas', 'Venda com a gente', 'Trabalhe conosco'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-500 hover:text-[#ff0082] text-sm font-bold transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUNA 4: APP & SEGURANÇA */}
          <div className="space-y-8">
            <div>
              <h4 className="text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] mb-4">Segurança</h4>
              <div className="flex items-center gap-3 text-[#ff0082] bg-pink-50 px-4 py-3 rounded-2xl border border-pink-100">
                <ShieldCheck size={20} />
                <span className="text-[10px] font-black uppercase text-pink-700">Ambiente 100% Seguro</span>
              </div>
            </div>
            <div>
              <h4 className="text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] mb-4">Pagamento</h4>
              <div className="flex flex-wrap gap-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                <CreditCard size={24} />
                <Smartphone size={24} />
                <span className="font-black text-xs">PIX</span>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA FINAL */}
        <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] text-center md:text-left leading-relaxed">
            © 2026 LINKAH TECNOLOGIA EM EVENTOS LTDA.<br/>
            CNPJ 00.000.000/0001-00 • VOTUPORANGA, SP
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors">Privacidade</Link>
            <Link href="#" className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}