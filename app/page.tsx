'use client';

import { useEffect, useState } from 'react';
// Certifique-se de que os caminhos abaixo batem com a sua estrutura de pastas
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer'; // Ajuste o caminho se necessário
import { Search, MapPin, Sparkles, Ticket, ChevronRight } from 'lucide-react';

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const urlFetch = categoriaAtiva === 'Todos' ? API_URL : `${API_URL}?categoria=${categoriaAtiva}`;
        const response = await fetch(urlFetch);
        if (response.ok) {
          const dados = await response.json();
          setEventos(dados);

          if (categoriaAtiva === 'Todos') {
            const extrair = dados.map((ev: any) => ev.categoria).filter(Boolean);
            const unicas = Array.from(new Set(extrair)) as string[];
            setCategoriasExistentes(['Todos', ...unicas]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [categoriaAtiva]);

  return (
    <div className="bg-[#FCFCFD] min-h-screen text-slate-800 font-sans">
      <Navbar />

      {/* HERO SECTION - IMPACTO VISUAL */}
      <section className="relative bg-[#0B0121] py-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ff0082] opacity-10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 bg-[#ff0082] rounded-full animate-pulse" />
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Live Experience 2026</span>
              </div>
              <h1 className="text-white text-5xl md:text-7xl font-black italic tracking-tighter leading-none uppercase mb-8">
                Sinta a <br/> <span className="text-[#ff0082]">Vibe Única</span>
              </h1>
              <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto lg:mx-0 font-medium">
                Os melhores shows, festas e teatros estão aqui. Garanta seu lugar.
              </p>
              <button className="bg-white text-black px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#ff0082] hover:text-white transition-all shadow-2xl flex items-center gap-2 mx-auto lg:mx-0 active:scale-95">
                Explorar Tudo <ChevronRight size={16} />
              </button>
            </div>

            {/* BOX DE BUSCA */}
            <div className="w-full max-w-[480px] bg-white rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
              <h3 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-6 border-b border-slate-100 pb-4">
                Encontre seu evento
              </h3>
              <div className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff0082] transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Nome do evento ou artista" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[#ff0082] focus:bg-white transition-all"
                  />
                </div>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff0082] transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Em qual cidade?" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[#ff0082] focus:bg-white transition-all"
                  />
                </div>
                <button className="w-full bg-[#ff0082] text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-pink-500/30 hover:brightness-110 transition-all active:scale-95">
                  Buscar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS EM CÁPSULAS */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-5">
            {categoriasExistentes.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap border ${
                  categoriaAtiva === cat 
                  ? 'bg-[#ff0082] text-white border-[#ff0082] shadow-lg shadow-pink-500/20 scale-105' 
                  : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* GRID DE EVENTOS */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase italic tracking-tighter">
            <Sparkles className="text-[#ff0082]" size={28} />
            {categoriaAtiva === 'Todos' ? 'Eventos em Destaque' : categoriaAtiva}
          </h2>
          <div className="bg-white px-4 py-1.5 rounded-full border border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            {eventos.length} Disponíveis
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-[2rem] h-80 shadow-sm" />
            ))
          ) : eventos.length > 0 ? (
            eventos.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          ) : (
            <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
              <Ticket className="mx-auto text-slate-100 mb-6" size={64} />
              <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-sm">
                Nenhum evento em "{categoriaAtiva}" no momento.
              </p>
              <button onClick={() => setCategoriaAtiva('Todos')} className="mt-4 text-[#ff0082] font-black uppercase text-[10px] tracking-widest hover:underline decoration-2 underline-offset-4">
                Voltar para todos
              </button>
            </div>
          )}
        </div>
      </main>
      
      {/* FOOTER */}
      <Footer />
    </div>
  );
}