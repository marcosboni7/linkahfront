'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { 
  Search, MapPin, Sparkles, Ticket, Loader2, 
  MessagesSquare, X, ArrowRight, Music, Mic2, Theater, 
  Gamepad2, Utensils, GraduationCap, PartyPopper, Heart, Star
} from 'lucide-react';
import Link from 'next/link';

// Mapeamento de ícones para as categorias
const iconMap: { [key: string]: any } = {
  'Todos': Ticket,
  'Show': Music,
  'Mentoria': Mic2,
  'Teatro': Theater,
  'Games': Gamepad2,
  'Gastronomia': Utensils,
  'Workshop': GraduationCap,
  'Festa': PartyPopper,
  'Infantil': Heart,
};

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);
  const [showComunidadeModal, setShowComunidadeModal] = useState(false);
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaCidade, setBuscaCidade] = useState('');

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  useEffect(() => {
    const avisado = sessionStorage.getItem('@Linkah:AvisoComunidade');
    if (!avisado) {
      const timer = setTimeout(() => {
        setShowComunidadeModal(true);
        sessionStorage.setItem('@Linkah:AvisoComunidade', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const urlFetch = categoriaAtiva === 'Todos' ? API_URL : `${API_URL}?categoria=${categoriaAtiva}`;
        const response = await fetch(urlFetch);
        if (response.ok) {
          const dados = await response.json();
          setEventos(dados);
          setEventosFiltrados(dados);

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

  useEffect(() => {
    const resultado = eventos.filter((evento: any) => {
      const nomeMatch = evento.nome.toLowerCase().includes(buscaNome.toLowerCase());
      const cidadeMatch = evento.cidade?.toLowerCase().includes(buscaCidade.toLowerCase()) || 
                          evento.estado?.toLowerCase().includes(buscaCidade.toLowerCase());
      return buscaCidade === '' ? nomeMatch : (nomeMatch && cidadeMatch);
    });
    setEventosFiltrados(resultado);
  }, [buscaNome, buscaCidade, eventos]);

  return (
    <div className="bg-[#FDFDFF] min-h-screen text-slate-900 font-sans">
      <Navbar />

      {/* HERO - WHITE & PINK ENERGY */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden bg-white">
        {/* Detalhes de fundo suaves */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff0082]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 px-4 py-2 rounded-full mb-8">
            <Star size={14} className="text-[#ff0082] fill-[#ff0082]" />
            <span className="text-[#ff0082] text-[10px] font-black uppercase tracking-[0.2em]">A sua melhor conexão</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none uppercase mb-12">
            Sinta a <span className="text-[#ff0082]">Vibe</span> <br/>
            Viva o <span className="underline decoration-blue-500 underline-offset-8">Momento</span>
          </h1>

          {/* BUSCA HORIZONTAL - LIMPA */}
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-3 border border-slate-100">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <div className="flex-[1.5] flex items-center px-5 py-3 w-full border-b md:border-b-0 md:border-r border-slate-50">
                <Search className="text-[#ff0082] mr-4" size={22} />
                <input 
                  type="text" 
                  value={buscaNome}
                  onChange={(e) => setBuscaNome(e.target.value)}
                  placeholder="Procurar evento ou artista..." 
                  className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>
              <div className="flex-1 flex items-center px-5 py-3 w-full">
                <MapPin className="text-slate-300 mr-4" size={22} />
                <input 
                  type="text" 
                  value={buscaCidade}
                  onChange={(e) => setBuscaCidade(e.target.value)}
                  placeholder="Onde?" 
                  className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>
              <button 
                onClick={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#ff0082] hover:bg-[#d6006d] text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-pink-200 active:scale-95 w-full md:w-auto"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Buscar'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS - CARDS CRIATIVOS (Fundo Branco, Ícones Rosa) */}
      <section className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-6">
          {categoriasExistentes.map((cat) => {
            const Icon = iconMap[cat] || Ticket;
            const isAtiva = categoriaAtiva === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`flex flex-col items-center justify-center min-w-[120px] h-[120px] rounded-[2.5rem] transition-all duration-500 border shadow-sm ${
                  isAtiva 
                  ? 'bg-white border-[#ff0082] shadow-pink-100 shadow-2xl scale-110' 
                  : 'bg-white border-slate-50 hover:border-pink-200 text-slate-400'
                }`}
              >
                <div className={`p-3 rounded-2xl mb-2 transition-colors ${isAtiva ? 'bg-pink-50' : 'bg-slate-50 group-hover:bg-pink-50'}`}>
                  <Icon size={28} className={isAtiva ? 'text-[#ff0082]' : 'text-slate-300'} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isAtiva ? 'text-slate-900' : 'text-slate-400'}`}>
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* VITRINE DE EVENTOS */}
      <main id="vitrine" className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
              <Sparkles className="text-[#ff0082]" size={28} />
              {buscaNome ? `Resultados: ${buscaNome}` : (categoriaAtiva === 'Todos' ? 'Eventos em Destaque' : categoriaAtiva)}
            </h2>
            <div className="h-1.5 w-20 bg-[#ff0082] rounded-full mt-2" />
          </div>
          
          <div className="bg-white border border-slate-100 px-6 py-2 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest shadow-sm">
            {eventosFiltrados.length} Eventos encontrados
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-50 border border-slate-100 rounded-[2.5rem] h-80 shadow-sm" />
            ))
          ) : (
            eventosFiltrados.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          )}
        </div>
      </main>

      <Footer />

      {/* MODAL COMUNIDADE - BRANCO E ROSA */}
      {showComunidadeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowComunidadeModal(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden p-10 text-center border border-pink-50">
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessagesSquare size={32} className="text-[#ff0082]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter">Entra na <br/><span className="text-[#ff0082]">Nossa Vibe</span></h2>
            <p className="text-slate-500 text-sm font-medium mb-8">Converse com a galera antes do evento começar.</p>
            <Link href="/comunidades" className="block w-full bg-[#ff0082] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-pink-200">
              Explorar agora
            </Link>
            <button onClick={() => setShowComunidadeModal(false)} className="mt-4 text-slate-300 text-[10px] font-bold uppercase tracking-widest hover:text-slate-500">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}