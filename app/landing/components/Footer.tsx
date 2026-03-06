import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white font-black">L</div>
              <span className="text-2xl font-black tracking-tighter uppercase">Linkah</span>
            </div>
            <p className="text-slate-500 max-w-xs font-medium leading-relaxed">
              Transformando a forma como você vive e organiza eventos através da conexão real entre pessoas.
            </p>
          </div>
          
          <div>
            <h5 className="font-black uppercase tracking-widest text-xs mb-6 text-slate-400">Plataforma</h5>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><Link href="#" className="hover:text-pink-600 transition-colors">Encontrar Eventos</Link></li>
              <li><Link href="#" className="hover:text-pink-600 transition-colors">Criar Evento</Link></li>
              <li><Link href="#" className="hover:text-pink-600 transition-colors">Segurança</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-black uppercase tracking-widest text-xs mb-6 text-slate-400">Suporte</h5>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><Link href="#" className="hover:text-pink-600 transition-colors">Central de Ajuda</Link></li>
              <li><Link href="#" className="hover:text-pink-600 transition-colors">Termos de Uso</Link></li>
              <li><Link href="#" className="hover:text-pink-600 transition-colors">Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">© 2026 Linkah. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            {/* Ícones de redes sociais aqui */}
            <span className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-pink-600 cursor-pointer">Instagram</span>
            <span className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-pink-600 cursor-pointer">LinkedIn</span>
          </div>
        </div>
      </div>
    </footer>
  );
}