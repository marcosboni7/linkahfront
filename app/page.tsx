'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { 
  Search, MapPin, Ticket, Loader2, 
  MessagesSquare, Music, Mic2, Theater, 
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

      {/* BANNER DE FUNDO COM OVERLAY */}
      <section className="relative h-[500px] flex items-center justify-center px-6 overflow-hidden">
        {/* Imagem de Fundo (Pode trocar a URL pela sua imagem da Linkah) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')` }}
        >
          {/* Overlay Rosa/Preto para dar contraste */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white" />
        </div>

        <div className="max-w-4xl w-full mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-8 drop-shadow-md">
            Sua próxima experiência <br /> começa aqui.
          </h1>

          {/* BUSCA CLEAN SOBRE O BANNER */}
          <div className="flex flex-col md:flex-row items-center bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full p-2 shadow-2xl border border-white/20">
            <div className="flex-1 flex items-center px-6 py-3 w-full">
              <Search size={20} className="text-[#ff0082] mr-3" />
              <input 
                type="text" 
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="O que você quer viver hoje?" 
                className="w-full bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="hidden md:block w-[1px] h-8 bg-slate-200" />
            <div className="flex-1 flex items-center px-6 py-3 w-full">
              <MapPin size={20} className="text-slate-400 mr-3" />
              <input 
                type="text" 
                value={buscaCidade}
                onChange={(e) => setBuscaCidade(e.target.value)}
                placeholder="Em qual cidade?" 
                className="w-full bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <button className="bg-[#ff0082] hover:bg-[#e60076] text-white px-8 py-4 rounded-xl md:rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 w-full md:w-auto">
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORIAS CENTRALIZADAS */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Explore por categoria</h3>
        </div>
        
        <div className="flex flex-wrap justify-center gap-10 md:gap-16">
          {categoriasExistentes.map((cat) => {
            const Icon = iconMap[cat] || Ticket;
            const isAtiva = categoriaAtiva === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className="group flex flex-col items-center gap-3"
              >
                <div className={`transition-all duration-300 p-4 rounded-2xl ${isAtiva ? 'bg-pink-50 text-[#ff0082] shadow-sm scale-110' : 'text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-50'}`}>
                  <Icon size={26} strokeWidth={isAtiva ? 2.5 : 2} />
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${isAtiva ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <hr className="max-w-5xl mx-auto border-slate-100" />

      {/* VITRINE */}
      <main id="vitrine" className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            {categoriaAtiva === 'Todos' ? 'Eventos em Destaque' : categoriaAtiva}
          </h2>
          <span className="text-xs font-medium text-slate-400">{eventosFiltrados.length} eventos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-50 rounded-3xl h-80" />
            ))
          ) : (
            eventosFiltrados.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}