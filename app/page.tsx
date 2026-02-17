'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { CategoryFilter } from './site/CategoryFilter';
import { SectionHeader } from './site/SectionHeader';
import { 
  Search, MapPin, Ticket, Loader2, 
  Music, Mic2, Theater, Gamepad2, 
  Utensils, GraduationCap, PartyPopper, Heart, Sparkles,
  ChevronLeft, ChevronRight
} from 'lucide-react';

// Mapeamento de ícones para as categorias do back-end
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

// Dados dos Banners do Carrossel
const SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop', title: 'Descubra o seu', highlight: 'próximo momento' },
  { id: 2, url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop', title: 'Sinta a vibe dos', highlight: 'melhores shows' },
  { id: 3, url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=2070&auto=format&fit=crop', title: 'Conecte-se com', highlight: 'novas experiências' }
];

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaCidade, setBuscaCidade] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  // Lógica do Timer do Carrossel (Troca a cada 5s)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Busca dados da API baseada na categoria
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
        console.error("Erro ao carregar back-end:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [categoriaAtiva]);

  // Filtro de busca local (Nome e Cidade)
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
    <div className="bg-[#F3F4F6] min-h-screen text-slate-900 font-sans">
      <Navbar />

      {/* SEÇÃO HERO - CARROSSEL COM ZOOM E BUSCA GLASSMORPHISM */}
      <section className="relative h-[480px] flex items-center justify-center overflow-hidden bg-black">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
              style={{ backgroundImage: `url('${slide.url}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#F3F4F6]" />
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pb-12">
              <span className="inline-block bg-[#ff0082] text-white text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-4 shadow-lg shadow-pink-500/20">
                Linkah Experience
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight uppercase italic drop-shadow-2xl">
                {slide.title} <br /> <span className="text-[#ff0082]">{slide.highlight}</span>
              </h1>
            </div>
          </div>
        ))}

        {/* Controles de Navegação do Carrossel */}
        <button 
          onClick={() => setCurrentSlide(currentSlide === 0 ? SLIDES.length - 1 : currentSlide - 1)}
          className="absolute left-4 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hidden md:block"
        >
          <ChevronLeft size={28} />
        </button>
        <button 
          onClick={() => setCurrentSlide(currentSlide === SLIDES.length - 1 ? 0 : currentSlide + 1)}
          className="absolute right-4 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hidden md:block"
        >
          <ChevronRight size={28} />
        </button>

        {/* BARRA DE BUSCA FLUTUANTE */}
        <div className="absolute bottom-10 z-30 w-full px-6">
          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center max-w-4xl mx-auto border border-white/20">
            <div className="flex-1 flex items-center px-5 py-2 w-full border-b md:border-b-0 md:border-r border-slate-100">
              <Search size={18} className="text-[#ff0082] mr-3" />
              <input 
                type="text" 
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Encontre sua vibe..." 
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="flex-1 flex items-center px-5 py-2 w-full">
              <MapPin size={18} className="text-slate-400 mr-3" />
              <input 
                type="text" 
                value={buscaCidade}
                onChange={(e) => setBuscaCidade(e.target.value)}
                placeholder="Onde você está?" 
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <button className="bg-slate-900 hover:bg-[#ff0082] text-white px-8 py-3 rounded-xl md:rounded-full font-black text-xs uppercase tracking-widest transition-all w-full md:w-auto active:scale-95">
              Buscar
            </button>
          </div>
        </div>

        {/* Indicadores de Slide */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {SLIDES.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-6 bg-[#ff0082]' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* COMPONENTE: FILTRO DE CATEGORIAS (CENTRALIZADO) */}
      <CategoryFilter 
        categories={categoriasExistentes}
        activeCategory={categoriaAtiva}
        onSelect={setCategoriaAtiva}
        iconMap={iconMap}
      />

      {/* VITRINE DE EVENTOS */}
      <main id="vitrine" className="max-w-7xl mx-auto px-6 py-10">
        
        {/* COMPONENTE: HEADER DA SEÇÃO */}
        <SectionHeader 
          title={categoriaAtiva === 'Todos' ? 'Perto de você' : categoriaAtiva} 
          count={eventosFiltrados.length}
        />

        {/* Grid de Eventos com Skeleton Loading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-[360px] border border-slate-100 shadow-sm" />
            ))
          ) : (
            eventosFiltrados.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          )}
        </div>

        {/* Estado vazio */}
        {!loading && eventosFiltrados.length === 0 && (
          <div className="text-center py-20">
            <Ticket size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-400">Nenhum evento encontrado nesta vibe.</h3>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}