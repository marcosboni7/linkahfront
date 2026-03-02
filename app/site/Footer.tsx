'use client';

import Link from 'next/link';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  ShieldCheck, 
  Ticket,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

export function Footer() {
  return (
    // Alterado de #d6006d para #ff4d4d
    <footer className="bg-[#ff4d4d] text-white pt-20 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* COLUNA 1: MARCA */}
          <div className="space-y-6">
            <Link href="/" className="text-white text-3xl font-black tracking-tighter italic">
              LINKAH<span className="text-red-200">.</span>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed font-medium">
              Conectando você às melhores experiências. Transformamos eventos em momentos inesquecíveis.
            </p>
            <div className="flex gap-4">
              {/* Ajustado hover para o novo vermelho */}
              <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#ff4d4d] transition-all">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#ff4d4d] transition-all">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#ff4d4d] transition-all">
                <Twitter size={18} />
              </Link>
            </div>
          </div>

          {/* COLUNA 2: CATEGORIAS */}
          <div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.2em] mb-6 opacity-60">Categorias</h4>
            <ul className="space-y-4">
              {['Shows e Festas', 'Teatro e Cultura', 'Esportes', 'Congressos', 'Infantil'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/90 hover:text-red-100 text-sm font-bold transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUNA 3: SUPORTE */}
          <div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.2em] mb-6 opacity-60">Suporte</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-bold text-white">
                <Mail size={16} className="text-red-200" /> contato@linkah.com.br
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-white">
                <Phone size={16} className="text-red-200" /> +351 912 907 828
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-white">
                <MapPin size={16} className="text-red-200" /> Florianopolis - SC
              </li>
            </ul>
          </div>

          {/* COLUNA 4: SEGURANÇA */}
          <div className="space-y-8">
            <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck size={24} className="text-red-200" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Plataforma<br/>Segura</span>
              </div>
              <p className="text-[10px] text-white/70 font-medium">
                Seus dados e pagamentos são protegidos com criptografia de ponta a ponta.
              </p>
            </div>
          </div>
        </div>

        {/* BARRA FINAL */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Ticket size={16} className="text-red-200" />
            <p className="text-white/50 text-[9px] font-black uppercase tracking-[0.3em]">
              © 2026 LINKAH TICKETS - CNPJ 00.000.000/0001-00
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Políticas de Privacidade</Link>
            <Link href="#" className="text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Vender Evento</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}