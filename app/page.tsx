'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar';
import { EventCard } from '../app/site/EventCard';
import { ChevronRight, ChevronLeft, Loader2, Sparkles, Zap, Ticket } from 'lucide-react';

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);

  // URL DA API
  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        // 1. Busca os eventos baseados na categoria selecionada
        const urlFetch = categoriaAtiva === 'Todos' 
          ? API_URL 
          : `${API_URL}?categoria=${categoriaAtiva}`;
          
        const response = await fetch(urlFetch);
        if (response.ok) {
          const dados = await response.json();
          setEventos(dados);

          // 2. Lógica Dinâmica: Se estivermos em "Todos", vamos atualizar a lista de botões 
          // baseada no que existe no banco de dados para a dashboard
          if (categoriaAtiva === 'Todos') {
            const extrairCategorias = dados.map((ev: any) => ev.categoria).filter(Boolean);
            const unicas = Array.from(new Set(extrairCategorias)) as string[];
            setCategoriasExistentes(['Todos', ...unicas]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar vitrine:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [categoriaAtiva]);

  return (
    <div className="bg-[#0B0121] min-h-screen text-white font-sans overflow-x-hidden">
      <Navbar />

      {/* BARRA DE AVISO SUPERIOR */}
      <div className="bg-[#1a0b3d] border-b border-white/5 py-3 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 flex items-center justify-center gap-2">
          <Zap size={12} fill="currentColor" /> Plataforma Oficial Linkah <Zap size={12} fill="currentColor" />
        </p>
      </div>

      {/* HERO SECTION - IMPACTO VISUAL */}
      <section className="relative h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0121] via-transparent to-[#0B0121] z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0121] via-transparent to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070" 
            className="w-full h-full object-cover opacity-40 scale-105 transition-transform duration-[10s] hover:scale-110"
            alt="Hero Background"
          />
        </div>

        <div className="relative z-20 text-center max-w-4xl px-6">
          <span className="bg-pink-500/20 text-pink-400 border border-pink-500/30 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
            Tour 2026 Confirmada
          </span>
          <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none italic uppercase">
            Ensaios da Anitta <br/> <span className="text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">Cosmos</span>
          </h2>
          <p className="text-xl md:text-2xl font-bold mb-10 opacity-80 max-w-2xl mx-auto leading-tight">
            A experiência carnavalesca mais aguardada do Brasil está de volta.
          </p>
          <button className="bg-white text-[#0B0121] px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-pink-500 hover:text-white transition-all shadow-2xl active:scale-95">
            Comprar Agora
          </button>
        </div>
      </section>

      {/* FILTROS DINÂMICOS (VINDOS DA DASHBOARD) */}
      <div className="max-w-6xl mx-auto -mt-10 relative z-40 px-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-3 flex flex-wrap justify-center gap-3 border border-slate-100">
          {categoriasExistentes.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                categoriaAtiva === cat
                  ? 'bg-[#C22973] text-white shadow-xl shadow-pink-200 scale-105'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* VITRINE DE EVENTOS */}
      <main className="bg-white text-slate-900 py-24 mt-16 rounded-t-[4rem] shadow-[0_-30px_60px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-4xl md:text-5xl font-black flex items-center justify-center md:justify-start gap-3 italic tracking-tighter uppercase leading-none">
                <Sparkles className="text-pink-500" size={32} /> 
                {categoriaAtiva === 'Todos' ? 'Próximos Eventos' : catAtivaTranslate(categoriaAtiva)}
              </h2>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Inspirado nos seus interesses</p>
            </div>
            
            <div className="hidden md:flex bg-slate-100 p-1.5 rounded-2xl gap-2 border border-slate-200">
               <div className="bg-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-sm border border-slate-100">Grid</div>
               <div className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-slate-400 cursor-not-allowed">Lista</div>
            </div>
          </div>

          {/* LISTAGEM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="bg-slate-100 rounded-[2.5rem] h-72 shadow-inner" />
                  <div className="h-4 bg-slate-100 rounded-full w-3/4 mx-auto md:mx-0" />
                  <div className="h-4 bg-slate-100 rounded-full w-1/2 mx-auto md:mx-0" />
                </div>
              ))
            ) : eventos.length > 0 ? (
              eventos.map((evento: any) => (
                <div key={evento.id} className="hover:-translate-y-2 transition-transform duration-500">
                  <EventCard evento={evento} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-40 text-center bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Ticket className="text-slate-200" size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-300 uppercase italic mb-2 tracking-tighter">Nada por aqui ainda</h3>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-8">Não encontramos eventos na categoria {categoriaAtiva}</p>
                <button 
                  onClick={() => setCategoriaAtiva('Todos')} 
                  className="bg-[#C22973] text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-pink-100"
                >
                  Voltar para o Início
                </button>
              </div>
            )}
          </div>

          {/* BANNER DE CURADORIA FINAL */}
          <div className="mt-32 relative h-96 rounded-[4rem] overflow-hidden group shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)]">
            <img 
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" 
              alt="Festivais"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent flex flex-col justify-center p-12 md:p-20">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-[2px] bg-pink-500" />
                  <span className="text-pink-500 font-black uppercase text-[10px] tracking-[0.4em]">Curadoria Premium</span>
               </div>
               <h3 className="text-white text-5xl md:text-7xl font-black italic uppercase tracking-tighter max-w-xl leading-[0.9] mb-8">
                 Os Melhores <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Festivais de Verão</span>
               </h3>
               <button className="bg-white text-black w-fit px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-pink-500 hover:text-white transition-all shadow-2xl">
                 Explorar Coleção
               </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white py-20 border-t border-slate-50 flex flex-col items-center">
        <div className="text-3xl font-black text-[#0B0121] italic tracking-tighter mb-4">
          LINKAH<span className="text-pink-500">.</span>
        </div>
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em] text-center">
          © 2026 Inteligência Digital para Eventos <br/> 
          <span className="opacity-50 font-medium">CNPJ 00.000.000/0001-00</span>
        </p>
      </footer>
    </div>
  );
}

// Função auxiliar para deixar o título da categoria bonito
function catAtivaTranslate(cat: string) {
  return `Vibe: ${cat}`;
}