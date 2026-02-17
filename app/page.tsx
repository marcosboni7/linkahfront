'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { 
  Search, MapPin, Sparkles, Ticket, ChevronRight, Loader2, 
  MessagesSquare, X, ArrowRight, Music, Mic2, Theater, 
  Gamepad2, Utensils, GraduationCap, PartyPopper, Heart 
} from 'lucide-react';
import Link from 'next/link';

// Mapeamento de ícones por nome de categoria
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

  const handleLimparBusca = () => {
    setBuscaNome('');
    setBuscaCidade('');
    setCategoriaAtiva('Todos');
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-slate-800 font-sans">
      <Navbar />

      {/* MODAL DE AVISO - NOSSA COMUNIDADE */}
      {showComunidadeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B0121]/80 backdrop-blur-md" onClick={() => setShowComunidadeModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10 text-center">
            <button onClick={() => setShowComunidadeModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
              <X size={20} />
            </button>
            <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <MessagesSquare size={36} className="text-[#ff0082]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase mb-4">Chegou a <span className="text-[#ff0082]">Comunidade</span></h2>
            <p className="text-slate-500 font-medium mb-8">Interaja com outras pessoas e sinta a vibe antes do evento!</p>
            <Link href="/comunidades" className="flex items-center justify-center gap-3 w-full bg-[#ff0082] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-pink-200">
              Explorar Comunidades <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}

      {/* HERO SECTION (Estilo Sympla Clean) */}
      <section className="relative bg-[#0045B5] py-20 px-6 text-center">
        <h1 className="text-white text-4xl md:text-6xl font-black mb-10 uppercase italic tracking-tighter">
          Encontre sua <span className="text-pink-400">Próxima Vibe</span>
        </h1>
        
        {/* BUSCA ESTILO SYMPLA */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1 flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-slate-100">
            <Search className="text-slate-400 mr-3" size={20} />
            <input 
              type="text" 
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
              placeholder="O que você quer viver hoje?" 
              className="w-full py-4 outline-none font-bold text-slate-700"
            />
          </div>
          <div className="flex-1 flex items-center px-4 w-full">
            <MapPin className="text-slate-400 mr-3" size={20} />
            <input 
              type="text" 
              value={buscaCidade}
              onChange={(e) => setBuscaCidade(e.target.value)}
              placeholder="Em qual cidade?" 
              className="w-full py-4 outline-none font-bold text-slate-700"
            />
          </div>
          <button 
            onClick={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#ff0082] text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all w-full md:w-auto"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'BUSCAR'}
          </button>
        </div>
      </section>

      {/* CATEGORIAS CRIATIVAS (Cards com Ícones) */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-2">
          {categoriasExistentes.map((cat) => {
            const IconComponent = iconMap[cat] || Ticket;
            return (
              <button
                key={cat}
                onClick={() => { setCategoriaAtiva(cat); setBuscaNome(''); }}
                className={`flex flex-col items-center justify-center min-w-[110px] h-[110px] rounded-2xl transition-all duration-300 border shadow-sm ${
                  categoriaAtiva === cat 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200 shadow-xl scale-105' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200 hover:text-blue-500'
                }`}
              >
                <IconComponent size={32} strokeWidth={categoriaAtiva === cat ? 2.5 : 1.5} className="mb-2" />
                <span className="text-[10px] font-black uppercase tracking-tighter">{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* GRID DE EVENTOS */}
      <main id="vitrine" className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black text-slate-900 uppercase italic flex items-center gap-2">
            <Sparkles className="text-blue-600" size={24} />
            {buscaNome ? `Resultados: ${buscaNome}` : 'Destaques para você'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-200 rounded-2xl h-80 shadow-sm" />
            ))
          ) : eventosFiltrados.length > 0 ? (
            eventosFiltrados.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
              <Ticket className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold uppercase text-xs">Nenhum evento encontrado.</p>
              <button onClick={handleLimparBusca} className="mt-4 text-blue-600 font-black text-[10px] uppercase underline">Ver tudo</button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}