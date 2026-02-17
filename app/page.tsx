'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { 
  Search, MapPin, Ticket, Loader2, 
  Music, Mic2, Theater, Gamepad2, 
  Utensils, GraduationCap, PartyPopper, Heart, Sparkles
} from 'lucide-react';

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
    <div className="bg-[#F8F9FA] min-h-screen text-slate-900 font-sans">
      <Navbar />

      {/* BANNER FICTÍCIO COM FOCO CENTRAL */}
      <section className="relative h-[550px] flex items-center justify-center overflow-hidden">
        {/* Imagem de Fundo - Estilo Festival Clean */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop')` }}
        >
          {/* Gradiente de proteção para o texto e transição suave para o conteúdo */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-[#F8F9FA]" />
        </div>

        <div className="relative z-10 max-w-4xl px-6 text-center">
          <span className="inline-block bg-[#ff0082] text-white text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-6 shadow-lg shadow-pink-500/20">
            Linkah Experience
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight uppercase italic">
            Descubra o seu <br /> <span className="text-[#ff0082]">próximo momento</span>
          </h1>

          {/* BARRA DE BUSCA FLOATING GLASS */}
          <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl md:rounded-full shadow-2xl border border-white/50 flex flex-col md:flex-row items-center max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-6 py-3 w-full border-b md:border-b-0 md:border-r border-slate-200/50">
              <Search size={18} className="text-[#ff0082] mr-3" />
              <input 
                type="text" 
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="O que você busca?" 
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="flex-1 flex items-center px-6 py-3 w-full">
              <MapPin size={18} className="text-slate-400 mr-3" />
              <input 
                type="text" 
                value={buscaCidade}
                onChange={(e) => setBuscaCidade(e.target.value)}
                placeholder="Onde?" 
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <button className="bg-slate-900 hover:bg-[#ff0082] text-white px-10 py-4 rounded-xl md:rounded-full font-black text-xs uppercase tracking-widest transition-all active:scale-95 w-full md:w-auto">
              Explorar
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORIAS - MODELO PILLS (MUITO CLEAN) */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-6 px-2">
            <Sparkles size={16} className="text-[#ff0082]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Filtrar por Vibe</h3>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            {categoriasExistentes.map((cat) => {
              const Icon = iconMap[cat] || Ticket;
              const isAtiva = categoriaAtiva === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaAtiva(cat)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 whitespace-nowrap ${
                    isAtiva 
                    ? 'bg-[#ff0082] border-[#ff0082] text-white shadow-lg shadow-pink-200 scale-105' 
                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-pink-200 hover:text-[#ff0082]'
                  }`}
                >
                  <Icon size={16} strokeWidth={isAtiva ? 3 : 2} />
                  <span className="text-xs font-bold uppercase tracking-wider">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* VITRINE DE EVENTOS */}
      <main id="vitrine" className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1.5 bg-[#ff0082] rounded-full" />
            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
              {categoriaAtiva === 'Todos' ? 'Perto de você' : categoriaAtiva}
            </h2>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {eventosFiltrados.length} encontrados
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-3xl h-[400px]" />
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