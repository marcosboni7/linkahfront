'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar';
import { EventCard } from '../app/site/EventCard';
import { Search, Sparkles, Zap, Ticket, ArrowRight, Calendar, MapPin } from 'lucide-react';

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
            const extrairCategorias = dados.map((ev: any) => ev.categoria).filter(Boolean);
            const unicas = Array.from(new Set(extrairCategorias)) as string[];
            setCategoriasExistentes(['Todos', ...unicas]);
          }
        }
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [categoriaAtiva]);

  return (
    <div className="bg-[#050112] min-h-screen text-white font-sans selection:bg-pink-500 selection:text-white">
      <Navbar />

      {/* HEADER INFO SUTIL */}
      <div className="bg-gradient-to-r from-transparent via-pink-500/10 to-transparent border-b border-white/5 py-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-400">
          ✨ Experiências exclusivas Linkah 2026
        </p>
      </div>

      {/* HERO SECTION REESTILIZADA */}
      <section className="relative h-[85vh] w-full flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[#050112]/60 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050112] via-transparent to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070" 
            className="w-full h-full object-cover animate-slow-zoom"
            alt="Concert"
          />
        </div>

        <div className="relative z-20 text-center max-w-5xl px-6">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Now: Tour Cosmos 2026</span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-none uppercase">
            ANITTA <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-pink-600 drop-shadow-2xl">COSMOS</span>
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button className="group bg-white text-black px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-pink-500 hover:text-white transition-all duration-500 flex items-center gap-3">
              Garantir Ingresso <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* BARRA DE FILTROS GLASSMORPHISM */}
      <div className="max-w-4xl mx-auto -mt-12 relative z-40 px-6">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-3 border border-white/10 shadow-2xl flex flex-wrap justify-center gap-2">
          {categoriasExistentes.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                categoriaAtiva === cat
                  ? 'bg-pink-500 text-white shadow-[0_10px_30px_rgba(236,72,153,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-pink-500">
               <Sparkles size={24} />
               <span className="text-xs font-black uppercase tracking-[0.4em]">Hot Selection</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter uppercase italic">
              {categoriaAtiva === 'Todos' ? 'Eventos Próximos' : categoriaAtiva}
            </h2>
          </div>
          <div className="text-slate-500 font-bold text-sm uppercase tracking-widest border-b border-white/10 pb-2">
            Mostrando {eventos.length} experiências
          </div>
        </div>

        {/* GRID DE EVENTOS REFORMULADO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : eventos.length > 0 ? (
            eventos.map((evento: any) => (
              <NewEventCard key={evento.id} evento={evento} />
            ))
          ) : (
            <div className="col-span-full py-40 text-center border border-white/5 rounded-[4rem] bg-white/[0.02]">
               <Ticket size={48} className="mx-auto text-white/10 mb-6" />
               <p className="text-slate-400 font-black uppercase tracking-widest">Nenhum evento encontrado nesta categoria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// NOVO COMPONENTE DE CARD (DENTRO DO MESMO ARQUIVO OU IMPORTADO)
function NewEventCard({ evento }: { evento: any }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden mb-6 bg-white/5 border border-white/5 transition-all duration-500 group-hover:border-pink-500/50 group-hover:shadow-[0_20px_50px_rgba(236,72,153,0.15)]">
        <img 
          src={evento.imagem_capa} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={evento.nome}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050112] via-transparent to-transparent opacity-80" />
        
        {/* PRICE TAG SUTIL */}
        <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl">
           <p className="text-[10px] font-black text-pink-400">A partir de</p>
           <p className="text-sm font-black text-white">R$ {evento.preco_minimo}</p>
        </div>

        <div className="absolute bottom-8 left-8 right-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <button className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
               Ver Detalhes
            </button>
        </div>
      </div>

      <div className="px-2 space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-pink-500 uppercase tracking-widest">
           <Calendar size={12} />
           {new Date(evento.data_inicio).toLocaleDateString('pt-BR')}
        </div>
        <h3 className="text-xl font-black leading-tight uppercase tracking-tighter group-hover:text-pink-500 transition-colors">
          {evento.nome}
        </h3>
        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase">
           <MapPin size={12} />
           {evento.cidade}, {evento.estado}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[3/4] bg-white/5 rounded-[2rem] mb-6" />
            <div className="h-4 bg-white/5 rounded-full w-3/4 mb-3" />
            <div className="h-4 bg-white/5 rounded-full w-1/2" />
        </div>
    )
}