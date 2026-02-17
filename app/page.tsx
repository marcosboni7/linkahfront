'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { 
  Search, MapPin, Sparkles, Ticket, Loader2, 
  MessagesSquare, X, ArrowRight, Music, Mic2, Theater, 
  Gamepad2, Utensils, GraduationCap, PartyPopper, Heart, Star,
  Compass, Calendar, Zap
} from 'lucide-react';
import Link from 'next/link';

const iconMap: { [key: string]: any } = {
  'Todos': Zap,
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
    <div className="bg-[#f8f9fc] min-h-screen text-slate-900 font-sans selection:bg-[#ff0082] selection:text-white">
      <Navbar />

      {/* HERO SECTION - STYLE "LINKAH MAGAZINE" */}
      <section className="relative pt-20 pb-40 overflow-hidden bg-white">
        {/* Background Gradients */}
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-gradient-to-br from-[#ff0082]/20 to-blue-500/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full opacity-30" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2 rounded-2xl rotate-[-1deg] shadow-xl">
              <Zap size={18} className="text-yellow-400 fill-yellow-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Live Experience 2026</span>
            </div>

            <h1 className="text-6xl md:text-9xl font-black tracking-[ -0.05em] leading-[0.85] uppercase italic">
              VIVA A <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0082] via-[#ff0082] to-blue-600">CONEXÃO.</span>
            </h1>

            <p className="max-w-xl text-slate-500 font-medium text-lg md:text-xl leading-relaxed">
              Descubra eventos que combinam com você e entre para a nossa comunidade exclusiva.
            </p>

            {/* SEARCH BAR - NEUMORPHIC STYLE */}
            <div className="w-full max-w-4xl mt-12">
              <div className="bg-white/80 backdrop-blur-xl p-2 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white flex flex-col md:flex-row items-center">
                <div className="flex-1 flex items-center px-6 py-4 w-full">
                  <Search className="text-[#ff0082] mr-3" size={24} />
                  <input 
                    type="text" 
                    value={buscaNome}
                    onChange={(e) => setBuscaNome(e.target.value)}
                    placeholder="Qual a sua próxima vibe?" 
                    className="w-full bg-transparent outline-none font-bold text-lg placeholder:text-slate-300"
                  />
                </div>
                <div className="hidden md:block w-px h-10 bg-slate-100" />
                <div className="flex-1 flex items-center px-6 py-4 w-full">
                  <MapPin className="text-blue-500 mr-3" size={24} />
                  <input 
                    type="text" 
                    value={buscaCidade}
                    onChange={(e) => setBuscaCidade(e.target.value)}
                    placeholder="Perto de onde?" 
                    className="w-full bg-transparent outline-none font-bold text-lg placeholder:text-slate-300"
                  />
                </div>
                <button className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-[#ff0082] transition-all shadow-lg active:scale-95 w-full md:w-auto">
                  {loading ? <Loader2 className="animate-spin" /> : 'Explorar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION - UNIQUE GRID */}
      <section className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
        <div className="bg-white rounded-[3.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-50">
          <div className="flex items-center justify-between mb-10 px-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              Explore <span className="text-[#ff0082]">Categorias</span>
            </h2>
            <div className="hidden sm:flex gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-100" />
              <div className="w-2 h-2 rounded-full bg-pink-200" />
              <div className="w-8 h-2 rounded-full bg-[#ff0082]" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {categoriasExistentes.map((cat) => {
              const Icon = iconMap[cat] || Ticket;
              const isAtiva = categoriaAtiva === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaAtiva(cat)}
                  className={`group relative flex flex-col items-center justify-center min-w-[130px] h-[140px] rounded-[3rem] transition-all duration-500 ${
                    isAtiva 
                    ? 'bg-slate-900 text-white scale-110 shadow-2xl shadow-pink-200' 
                    : 'bg-slate-50 text-slate-400 hover:bg-white hover:shadow-xl hover:border-slate-100 border border-transparent'
                  }`}
                >
                  <div className={`mb-3 p-4 rounded-full transition-all duration-500 ${isAtiva ? 'bg-[#ff0082]' : 'bg-white shadow-sm group-hover:bg-pink-50'}`}>
                    <Icon size={28} className={isAtiva ? 'text-white' : 'text-slate-400 group-hover:text-[#ff0082]'} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
                  {isAtiva && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* VITRINE */}
      <main id="vitrine" className="max-w-6xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-16 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 text-[#ff0082] mb-2">
              <Compass size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Descobertas</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
              {buscaNome ? `Buscando por: ${buscaNome}` : 'Destaques da Semana'}
            </h2>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultados</p>
              <p className="text-xl font-black text-slate-900">{eventosFiltrados.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-[2.5rem] h-[400px] border border-slate-100" />
            ))
          ) : (
            eventosFiltrados.map((evento: any) => (
              <div key={evento.id} className="group cursor-pointer">
                <EventCard evento={evento} />
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />

      {/* UNIQUE MODAL COMUNIDADE */}
      {showComunidadeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowComunidadeModal(false)} />
          <div className="relative bg-[#ff0082] text-white w-full max-w-lg rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(255,0,130,0.3)]">
            <div className="p-12 text-center relative">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3">
                  <MessagesSquare size={40} />
                </div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">A vibe começa no chat.</h2>
                <p className="text-white/80 font-medium mb-10 text-lg">Junte-se a milhares de pessoas nas nossas comunidades exclusivas de eventos.</p>
                <Link href="/comunidades" className="inline-flex items-center gap-4 bg-white text-[#ff0082] px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-2xl">
                  Bora pro chat <ArrowRight size={18} />
                </Link>
                <button onClick={() => setShowComunidadeModal(false)} className="block w-full mt-6 text-white/50 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors">
                  FECHAR JANELA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}