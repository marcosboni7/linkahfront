'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { Search, MapPin, Sparkles, Ticket, ChevronRight, Loader2 } from 'lucide-react';

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]); // Estado para o resultado da busca
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);

  // ESTADOS DA BUSCA
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaCidade, setBuscaCidade] = useState('');

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  // 1. CARREGAR DADOS DA API
  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const urlFetch = categoriaAtiva === 'Todos' ? API_URL : `${API_URL}?categoria=${categoriaAtiva}`;
        const response = await fetch(urlFetch);
        if (response.ok) {
          const dados = await response.json();
          setEventos(dados);
          setEventosFiltrados(dados); // Inicialmente, os filtrados são todos

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

  // 2. LÓGICA DE FILTRAGEM (Roda sempre que o usuário digita ou os eventos mudam)
  useEffect(() => {
    const resultado = eventos.filter((evento: any) => {
      const nomeMatch = evento.nome.toLowerCase().includes(buscaNome.toLowerCase());
      const cidadeMatch = evento.cidade?.toLowerCase().includes(buscaCidade.toLowerCase()) || 
                          evento.estado?.toLowerCase().includes(buscaCidade.toLowerCase());
      
      // Se não digitou nada na cidade, ignora esse filtro
      return buscaCidade === '' ? nomeMatch : (nomeMatch && cidadeMatch);
    });

    setEventosFiltrados(resultado);
  }, [buscaNome, buscaCidade, eventos]);

  const handleLimparBusca = () => {
    setBuscaNome('');
    setBuscaCidade('');
    setCategoriaAtiva('Todos');
  };

  return (
    <div className="bg-[#FCFCFD] min-h-screen text-slate-800 font-sans">
      <Navbar />

      {/* HERO SECTION */}
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
              <button 
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                className="bg-white text-black px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#ff0082] hover:text-white transition-all shadow-2xl flex items-center gap-2 mx-auto lg:mx-0 active:scale-95"
              >
                Explorar Tudo <ChevronRight size={16} />
              </button>
            </div>

            {/* BOX DE BUSCA COM LÓGICA */}
            <div className="w-full max-w-[480px] bg-white rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
              <h3 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-6 border-b border-slate-100 pb-4">
                Encontre seu evento
              </h3>
              <div className="space-y-4">
                <div className="relative group">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${buscaNome ? 'text-[#ff0082]' : 'text-slate-400'}`} size={18} />
                  <input 
                    type="text" 
                    value={buscaNome}
                    onChange={(e) => setBuscaNome(e.target.value)}
                    placeholder="Nome do evento ou artista" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[#ff0082] focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="relative group">
                  <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${buscaCidade ? 'text-[#ff0082]' : 'text-slate-400'}`} size={18} />
                  <input 
                    type="text" 
                    value={buscaCidade}
                    onChange={(e) => setBuscaCidade(e.target.value)}
                    placeholder="Em qual cidade ou estado?" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[#ff0082] focus:bg-white transition-all font-bold"
                  />
                </div>
                <button 
                  onClick={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full bg-[#ff0082] text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-pink-500/30 hover:brightness-110 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Ver Resultados'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-5">
            {categoriasExistentes.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategoriaAtiva(cat); setBuscaNome(''); }}
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
      <main id="vitrine" className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase italic tracking-tighter">
            <Sparkles className="text-[#ff0082]" size={28} />
            {buscaNome ? `Resultados para "${buscaNome}"` : (categoriaAtiva === 'Todos' ? 'Eventos em Destaque' : categoriaAtiva)}
          </h2>
          <div className="bg-white px-4 py-1.5 rounded-full border border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            {eventosFiltrados.length} Encontrados
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-[2rem] h-80 shadow-sm" />
            ))
          ) : eventosFiltrados.length > 0 ? (
            eventosFiltrados.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          ) : (
            <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
              <Ticket className="mx-auto text-slate-100 mb-6" size={64} />
              <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-sm max-w-xs mx-auto">
                Não encontramos nada para "{buscaNome}" em "{buscaCidade || 'Qualquer lugar'}".
              </p>
              <button 
                onClick={handleLimparBusca} 
                className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-[#ff0082] transition-colors"
              >
                Limpar filtros e voltar
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}