'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { 
  Search, MapPin, Sparkles, Ticket, Loader2, 
  MessagesSquare, X, ArrowRight, Music, Mic2, Theater, 
  Gamepad2, Utensils, GraduationCap, PartyPopper, Heart, Filter
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
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-purple-500">
      <Navbar />

      {/* HERO SECTION - DARK GRADIENT */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Orbes de luz decorativas */}
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 -right-20 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            LINKAH <span className="italic">2026</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
            Sua conexão direta com as melhores experiências e comunidades exclusivas.
          </p>

          {/* SEARCH BOX - GLASSMORPHISM */}
          <div className="max-w-3xl mx-auto p-1.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-3 bg-black/20 rounded-xl">
                <Search className="text-purple-500 mr-3" size={20} />
                <input 
                  type="text" 
                  value={buscaNome}
                  onChange={(e) => setBuscaNome(e.target.value)}
                  placeholder="O que você quer viver?" 
                  className="bg-transparent outline-none w-full text-sm font-semibold placeholder:text-gray-600"
                />
              </div>
              <div className="flex-1 flex items-center px-4 py-3 bg-black/20 rounded-xl">
                <MapPin className="text-purple-500 mr-3" size={20} />
                <input 
                  type="text" 
                  value={buscaCidade}
                  onChange={(e) => setBuscaCidade(e.target.value)}
                  placeholder="Em qual cidade?" 
                  className="bg-transparent outline-none w-full text-sm font-semibold placeholder:text-gray-600"
                />
              </div>
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition-transform px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest">
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Explorar'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES - HORIZONTAL SCROLL CARDS */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-6 text-gray-400">
          <Filter size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Categorias</span>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {categoriasExistentes.map((cat) => {
            const Icon = iconMap[cat] || Ticket;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`flex flex-col items-center justify-center min-w-[100px] h-[100px] rounded-3xl transition-all duration-500 border ${
                  categoriaAtiva === cat 
                  ? 'bg-purple-600 border-purple-400 shadow-[0_0_30px_rgba(147,51,234,0.3)]' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Icon size={28} className={categoriaAtiva === cat ? 'text-white' : 'text-purple-500'} />
                <span className="text-[10px] font-bold mt-2 uppercase">{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* GRID SECTION */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            {categoriaAtiva === 'Todos' ? 'Próximos Eventos' : categoriaAtiva}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-8" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/5 rounded-3xl h-80" />
            ))
          ) : (
            eventosFiltrados.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          )}
        </div>
      </main>

      <Footer />
      
      {/* MODAL - GLASS STYLE */}
      {showComunidadeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-white/10 w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl">
            <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessagesSquare size={30} className="text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Comunidade VIP</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">Não vá sozinho. Conheça pessoas, compartilhe caronas e viva a vibe antes do show.</p>
            <Link href="/comunidades" className="block w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all">
              Entrar no Chat
            </Link>
            <button onClick={() => setShowComunidadeModal(false)} className="mt-4 text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:text-white">Agora não</button>
          </div>
        </div>
      )}
    </div>
  );
}