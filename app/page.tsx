'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { 
  Search, MapPin, Sparkles, Ticket, Loader2, 
  MessagesSquare, X, ArrowRight, Music, Mic2, Theater, 
  Gamepad2, Utensils, GraduationCap, PartyPopper, Heart
} from 'lucide-react';
import Link from 'next/link';

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
    <div className="bg-white min-h-screen text-slate-900 font-sans">
      <Navbar />

      {/* HERO CLEAN - FOCO TOTAL NA BUSCA */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-10">
            Descubra eventos incríveis.
          </h1>

          {/* BARRA DE BUSCA MINIMALISTA */}
          <div className="flex flex-col md:flex-row items-center bg-white border border-slate-200 rounded-full p-2 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex-1 flex items-center px-6 py-2 w-full">
              <Search size={18} className="text-slate-400 mr-3" />
              <input 
                type="text" 
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Nome do evento" 
                className="w-full bg-transparent outline-none text-sm text-slate-700"
              />
            </div>
            <div className="hidden md:block w-[1px] h-8 bg-slate-100" />
            <div className="flex-1 flex items-center px-6 py-2 w-full">
              <MapPin size={18} className="text-slate-400 mr-3" />
              <input 
                type="text" 
                value={buscaCidade}
                onChange={(e) => setBuscaCidade(e.target.value)}
                placeholder="Localização" 
                className="w-full bg-transparent outline-none text-sm text-slate-700"
              />
            </div>
            <button className="bg-[#ff0082] text-white p-3 rounded-full hover:bg-[#e60076] transition-colors">
              <Search size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORIAS CLEAN - CENTRALIZADAS */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Explore categorias</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {categoriasExistentes.map((cat) => {
            const Icon = iconMap[cat] || Ticket;
            const isAtiva = categoriaAtiva === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className="group flex flex-col items-center gap-3 transition-all"
              >
                <div className={`transition-all duration-300 ${isAtiva ? 'text-[#ff0082] scale-110' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  <Icon size={24} strokeWidth={isAtiva ? 2.5 : 2} />
                </div>
                <span className={`text-xs font-medium transition-colors ${isAtiva ? 'text-slate-900 border-b-2 border-[#ff0082] pb-1' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <hr className="max-w-6xl mx-auto border-slate-100" />

      {/* GRID DE EVENTOS */}
      <main id="vitrine" className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900">
            {categoriaAtiva === 'Todos' ? 'Eventos recentes' : categoriaAtiva}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-50 rounded-2xl h-72" />
            ))
          ) : (
            eventosFiltrados.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          )}
        </div>
      </main>

      <Footer />

      {/* MODAL MINIMALISTA */}
      {showComunidadeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowComunidadeModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-xl p-8 text-center border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Comunidade Linkah</h2>
            <p className="text-slate-500 text-sm mb-6">Conecte-se com pessoas que vão aos mesmos eventos que você.</p>
            <Link href="/comunidades" className="block w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90">
              Conhecer agora
            </Link>
            <button onClick={() => setShowComunidadeModal(false)} className="mt-4 text-slate-400 text-xs font-medium">Lembrar depois</button>
          </div>
        </div>
      )}
    </div>
  );
}