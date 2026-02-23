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
  Clock, X, FilterX, Sparkles, Flame
} from 'lucide-react';

const iconMap: { [key: string]: any } = {
  'Todos': Ticket, 'Show': Music, 'Mentoria': Mic2, 'Teatro': Theater,
  'Games': Gamepad2, 'Gastronomia': Utensils, 'Workshop': GraduationCap,
  'Festa': PartyPopper, 'Infantil': Heart,
};

const SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop', title: 'Descubra o seu', highlight: 'próximo momento' },
  { id: 2, url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop', title: 'Sinta a vibe dos', highlight: 'melhores shows' },
  { id: 3, url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=2070&auto=format&fit=crop', title: 'Conecte-se com', highlight: 'novas experiências' }
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

  // --- LÓGICA DE FILTRAGEM POR DATA ---
  const hojeObj = new Date();
  const hojeStr = hojeObj.toLocaleDateString('en-CA');

  const oQueFazerHoje = eventos.filter(ev => {
    if (!ev.data_inicio) return false;
    return new Date(ev.data_inicio).toLocaleDateString('en-CA') === hojeStr;
  });

  const ultimaChamada = eventos.filter(ev => {
    if (!ev.data_inicio) return false;
    const dataEv = new Date(ev.data_inicio);
    const dataEvStr = dataEv.toLocaleDateString('en-CA');
    
    if (dataEvStr === hojeStr) return false; // Se for hoje, já está na outra seção

    const diffTime = dataEv.getTime() - hojeObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 1 && diffDays <= 2; // Falta 1 ou 2 dias
  });

  const vitrineFiltrada = eventos.filter(ev => {
    const nomeMatch = ev.nome.toLowerCase().includes(buscaNome.toLowerCase());
    const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
    return nomeMatch && catMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBFA] text-slate-900 font-sans selection:bg-[#ff4d4d]/10">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-slate-900 shrink-0">
        {SLIDES.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out" 
              style={{ 
                backgroundImage: `url('${slide.url}')`, 
                transform: index === currentSlide ? 'scale(1.05)' : 'scale(1.2)' 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#FCFBFA]" />
            </div>
            <div className="relative z-10 text-center px-6 mt-[-60px]">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-[0.3em] px-5 py-2 rounded-full mb-6 border border-white/20">
                <Sparkles size={14} className="text-[#ff4d4d]" /> Linkah Experience
              </div>
              <h1 className="text-5xl md:text-8xl font-bold text-white mb-6 tracking-tight">
                {slide.title} <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d4d] to-[#ff8080]">
                  {slide.highlight}
                </span>
              </h1>
            </div>
          </div>
        ))}
        
        {/* BUSCA ESTILO LUMA (FLOATING) */}
        <div className="absolute bottom-12 z-30 w-full px-6">
          <div className="bg-white p-3 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row items-center max-w-4xl mx-auto border border-slate-100">
            <div className="flex-[1.5] flex items-center px-6 py-3 w-full border-b md:border-b-0 md:border-r border-slate-100">
              <Search size={20} className="text-slate-400 mr-4 shrink-0" />
              <input 
                type="text" 
                value={buscaNome} 
                onChange={(e) => setBuscaNome(e.target.value)} 
                placeholder="Qual evento você está procurando?" 
                className="w-full bg-transparent outline-none text-base font-medium text-slate-800 placeholder:text-slate-300" 
              />
              {buscaNome && (
                <button onClick={() => setBuscaNome('')} className="ml-2 text-slate-300 hover:text-slate-500 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
            <div className="flex-1 flex items-center px-6 py-3 w-full group hidden md:flex">
              <MapPin size={20} className="text-slate-300 mr-4 group-hover:text-[#ff4d4d] transition-colors shrink-0" />
              <input 
                type="text" 
                placeholder="Perto de você" 
                className="w-full bg-transparent outline-none text-base font-medium text-slate-800 placeholder:text-slate-300" 
              />
            </div>
            <button className="bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-[2rem] font-bold text-sm uppercase tracking-wider transition-all w-full md:w-auto active:scale-95">
              Explorar
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORIAS - FIXA AO SCROLL */}
      <div className="sticky top-[68px] z-40 bg-white/80 backdrop-blur-xl py-5 border-b border-slate-100">
        <CategoryFilter 
          categories={categoriasExistentes} 
          activeCategory={categoriaAtiva} 
          onSelect={setCategoriaAtiva} 
          iconMap={iconMap} 
        />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 space-y-24 w-full">
        {!buscaNome && categoriaAtiva === 'Todos' && (
          <>
            {/* HOJE */}
            {oQueFazerHoje.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SectionHeader title="Acontecendo" highlight="hoje" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {oQueFazerHoje.map(ev => <EventCard key={ev.id} evento={ev} />)}
                </div>
              </section>
            )}

            {/* ÚLTIMA CHAMADA (1-2 DIAS) */}
            {ultimaChamada.length > 0 && (
              <section className="bg-rose-50/40 p-10 rounded-[3rem] border border-rose-100/50 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-500">
                      <Clock size={24} className="animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Última Chamada</h2>
                      <p className="text-sm text-rose-400 font-medium">Eventos que começam em breve!</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 bg-rose-100 text-rose-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Flame size={14} /> Quase na hora
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {ultimaChamada.map(ev => <EventCard key={ev.id} evento={ev} />)}
                </div>
              </section>
            )}

            {/* DESTAQUE DE CURADORIA */}
            <section className="relative bg-slate-900 rounded-[3rem] p-12 overflow-hidden text-white shadow-2xl shadow-slate-200">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                 <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070" className="w-full h-full object-cover" alt="Curadoria" />
              </div>
              <div className="relative z-10 max-w-md space-y-4">
                <span className="text-[#ff4d4d] font-bold text-xs uppercase tracking-[0.2em]">Exclusivo Linkah</span>
                <h2 className="text-4xl font-bold leading-tight">Crie memórias <br/> inesquecíveis.</h2>
                <p className="text-slate-400 font-light text-lg">Eventos selecionados a dedo para quem busca o extraordinário.</p>
                <button className="mt-4 bg-white text-slate-900 px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform">Ver Curadoria</button>
              </div>
            </section>
          </>
        )}

        {/* VITRINE PRINCIPAL */}
        <section id="vitrine-principal">
          <SectionHeader 
            title={buscaNome ? `Resultados para "${buscaNome}"` : (categoriaAtiva === 'Todos' ? 'Explore todos os' : categoriaAtiva)} 
            highlight={buscaNome ? "" : (categoriaAtiva === 'Todos' ? "eventos" : "")}
            count={vitrineFiltrada.length} 
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-[2.5rem] h-[450px] border border-slate-100" />
              ))}
            </div>
          ) : vitrineFiltrada.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {vitrineFiltrada.map(ev => <EventCard key={ev.id} evento={ev} />)}
            </div>
          ) : (
            <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="inline-flex items-center justify-center p-8 bg-slate-50 rounded-[2rem] mb-6 text-slate-300">
                <FilterX size={48} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Nenhum evento encontrado</h3>
              <p className="text-slate-400 mt-2 max-w-sm mx-auto font-light">
                Tente ajustar sua busca ou categoria para encontrar o que procura.
              </p>
              <button 
                onClick={() => {setBuscaNome(''); setCategoriaAtiva('Todos');}}
                className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-80 transition-all"
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