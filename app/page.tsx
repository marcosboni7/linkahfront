'use client';

import { useEffect, useState } from 'react';
import { Navbar } from './site/Navbar'; 
import { EventCard } from './site/EventCard';
import { Footer } from './site/Footer';
import { CategoryFilter } from './site/CategoryFilter';
import { SectionHeader } from './site/SectionHeader';
import { 
  Search, MapPin, Ticket, 
  Music, Mic2, Theater, Gamepad2, 
  Utensils, GraduationCap, PartyPopper, Heart,
  Clock, X, FilterX, ChevronRight
} from 'lucide-react';

const iconMap: { [key: string]: any } = {
  'Todos': Ticket, 'Show': Music, 'Mentoria': Mic2, 'Teatro': Theater,
  'Games': Gamepad2, 'Gastronomia': Utensils, 'Workshop': GraduationCap,
  'Festa': PartyPopper, 'Infantil': Heart,
};

// Cores do padrão Linkah (Imagens): #ff4d4d (laranja/coral) até #702082 (roxo/pink)
const SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=2000', title: 'Linkah conectando', highlight: 'pessoas.' },
  { id: 2, url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=2000', title: 'Momentos que se', highlight: 'tornam reais.' },
  { id: 3, url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?auto=format&fit=crop&q=80&w=2000', title: 'Experiências que se', highlight: 'eternizam.' }
];

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);
  const [buscaNome, setBuscaNome] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1)), 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const dados = await response.json();
          setEventos(dados);
          const extrair = dados.map((ev: any) => ev.categoria).filter(Boolean);
          setCategoriasExistentes(['Todos', ...Array.from(new Set(extrair)) as string[]]);
        }
      } catch (error) { console.error("Erro API:", error); } finally { setLoading(false); }
    }
    carregarDados();
  }, []);

  const vitrineFiltrada = eventos.filter(ev => {
    const nomeMatch = ev.nome.toLowerCase().includes(buscaNome.toLowerCase());
    const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
    return nomeMatch && catMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-100">
      <Navbar />

      {/* Hero Section - Alinhada com a Imagem 1 */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden">
        {SLIDES.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms]" 
                 style={{ backgroundImage: `url('${slide.url}')`, transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)' }}>
              {/* Overlay suave conforme o layout */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>
            
            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-8xl font-bold text-white mb-6 tracking-tight leading-tight">
                {slide.title} <br /> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff6b6b] to-[#ff9f43] drop-shadow-sm">
                   {slide.highlight}
                </span>
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-8">
                A plataforma completa onde as conexões se encontram, momentos se criam e experiências se eternizam.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="bg-gradient-to-r from-[#ff4d4d] to-[#ff8c42] hover:scale-105 transition-transform text-white px-10 py-4 rounded-full font-semibold shadow-xl">
                  Comprar Ingresso
                </button>
                <button className="bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 transition-all text-white px-10 py-4 rounded-full font-semibold">
                  Criar Evento
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Barra de Busca - Estilo Floating Card */}
        <div className="absolute bottom-0 z-30 w-full px-6 translate-y-1/2">
          <div className="bg-white p-3 rounded-3xl md:rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col md:flex-row items-center max-w-5xl mx-auto border border-slate-100">
            <div className="flex-[1.5] flex items-center px-6 py-3 w-full border-b md:border-b-0 md:border-r border-slate-100">
              <Search size={22} className="text-orange-500 mr-4 shrink-0" />
              <input 
                type="text" 
                value={buscaNome} 
                onChange={(e) => setBuscaNome(e.target.value)} 
                placeholder="Qual experiência você busca?" 
                className="w-full bg-transparent outline-none text-lg text-slate-800 placeholder:text-slate-400" 
              />
            </div>
            <div className="flex-1 flex items-center px-6 py-3 w-full group">
              <MapPin size={22} className="text-slate-400 mr-4 group-hover:text-orange-500 transition-colors shrink-0" />
              <input 
                type="text" 
                placeholder="Onde?" 
                className="w-full bg-transparent outline-none text-lg text-slate-800 placeholder:text-slate-400" 
              />
            </div>
            <button className="bg-[#ff4d4d] hover:bg-[#e63e3e] text-white px-12 py-5 rounded-2xl md:rounded-full font-bold text-base transition-all w-full md:w-auto shadow-lg shadow-orange-200">
              Explorar
            </button>
          </div>
        </div>
      </section>

      {/* Espaçador para compensar a barra de busca flutuante */}
      <div className="h-24 md:h-32" />

      {/* Filtros de Categoria - Background Clean */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md py-6 border-b border-slate-100">
        <CategoryFilter 
          categories={categoriasExistentes} 
          activeCategory={categoriaAtiva} 
          onSelect={setCategoriaAtiva} 
          iconMap={iconMap} 
        />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 space-y-24 w-full">
        
        <section id="vitrine-principal">
          <div className="flex justify-between items-end mb-10">
            <div>
               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                {categoriaAtiva === 'Todos' ? 'Eventos em destaque' : categoriaAtiva}
              </h2>
              <p className="text-slate-500 mt-2">As melhores experiências selecionadas para você.</p>
            </div>
            {vitrineFiltrada.length > 4 && (
              <button className="text-[#ff4d4d] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Ver todos <ChevronRight size={20} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-slate-50 rounded-[2.5rem] h-[420px] border border-slate-100" />
              ))}
            </div>
          ) : vitrineFiltrada.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {vitrineFiltrada.map(ev => <EventCard key={ev.id} evento={ev} />)}
            </div>
          ) : (
            <div className="py-24 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <div className="inline-flex items-center justify-center p-8 bg-white rounded-full mb-6 shadow-sm">
                <FilterX size={48} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Nenhum evento encontrado</h3>
              <p className="text-slate-500 mt-3 max-w-md mx-auto text-lg">
                Tente ajustar seus filtros ou buscar por outro termo.
              </p>
              <button 
                onClick={() => {setBuscaNome(''); setCategoriaAtiva('Todos');}}
                className="mt-8 bg-white border border-slate-200 px-8 py-3 rounded-full font-bold hover:bg-slate-50 transition-colors shadow-sm"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}