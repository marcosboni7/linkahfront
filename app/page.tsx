'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { CategoryFilter } from './site/CategoryFilter';
import { SectionHeader } from './site/SectionHeader';
import { 
  Search, MapPin, Ticket, 
  Music, Mic2, Theater, Gamepad2, 
  Utensils, GraduationCap, PartyPopper, Heart,
  Clock, X, FilterX
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
    const interval = setInterval(() => setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1)), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const dados = await response.json();
          // Garante que é um array
          const listaSaneada = Array.isArray(dados) ? dados : [];
          setEventos(listaSaneada);
          
          const extrair = listaSaneada.map((ev: any) => ev.categoria).filter(Boolean);
          setCategoriasExistentes(['Todos', ...Array.from(new Set(extrair)) as string[]]);
        }
      } catch (error) { 
        console.error("Erro API:", error); 
      } finally { 
        setLoading(false); 
      }
    }
    carregarDados();
  }, []);

  // --- LÓGICA DE FILTRAGEM E ORDENAÇÃO ---
  
  // 1. Vitrine Geral (Filtra apenas por Nome e Categoria)
  const vitrineFiltrada = eventos.filter(ev => {
    const nomeMatch = (ev.nome || "").toLowerCase().includes(buscaNome.toLowerCase());
    const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
    // Não esconde nada, a menos que seja excluído
    const status = (ev.status || "").toLowerCase();
    return nomeMatch && catMatch && status !== 'excluido';
  });

  // 2. Ordenação (Recentes Primeiro - ID maior no topo)
  const vitrineOrdenada = [...vitrineFiltrada].sort((a, b) => Number(b.id) - Number(a.id));

  // 3. Lógica para "O que fazer hoje" (Ajustada para fuso horário)
  const hojeStr = new Date().toLocaleDateString('en-CA'); // Retorna YYYY-MM-DD
  const oQueFazerHoje = vitrineOrdenada.filter(ev => {
    if (!ev.data_inicio) return false;
    const dataEvStr = new Date(ev.data_inicio).toLocaleDateString('en-CA');
    return dataEvStr === hojeStr;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#F3F4F6] text-slate-900 font-sans">
      <Navbar />

      {/* HERO / CARROSSEL */}
      <section className="relative h-[520px] flex items-center justify-center overflow-hidden bg-black shrink-0">
        {SLIDES.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms]" style={{ backgroundImage: `url('${slide.url}')`, transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-[#F3F4F6]" />
            </div>
            <div className="relative z-10 text-center px-6">
              <span className="inline-block bg-[#ff0082] text-white text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-4 shadow-lg shadow-pink-500/20 animate-bounce">Linkah Experience</span>
              <h1 className="text-4xl md:text-7xl font-black text-white mb-6 uppercase italic tracking-tighter">
                {slide.title} <br /> <span className="text-[#ff0082]">{slide.highlight}</span>
              </h1>
            </div>
          </div>
        ))}
        
        <div className="absolute bottom-10 z-30 w-full px-6">
          <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center max-w-5xl mx-auto border border-white/40">
            <div className="flex-1 flex items-center px-5 py-3 w-full border-b md:border-b-0 md:border-r border-slate-200">
              <Search size={20} className="text-[#ff0082] mr-3 shrink-0" />
              <input 
                type="text" 
                value={buscaNome} 
                onChange={(e) => setBuscaNome(e.target.value)} 
                placeholder="Qual evento você está procurando?" 
                className="w-full bg-transparent outline-none text-base font-medium text-slate-800 placeholder:text-slate-400" 
              />
            </div>
            <div className="flex-1 flex items-center px-5 py-3 w-full group">
              <MapPin size={20} className="text-slate-400 mr-3 group-hover:text-[#ff0082] transition-colors shrink-0" />
              <input 
                type="text" 
                placeholder="Localização (Cidade ou Estado)" 
                className="w-full bg-transparent outline-none text-base font-medium text-slate-800 placeholder:text-slate-400" 
              />
            </div>
            <button className="bg-[#ff0082] hover:bg-[#d9006f] text-white px-10 py-4 rounded-xl md:rounded-full font-black text-sm uppercase tracking-widest transition-all w-full md:w-auto shadow-lg shadow-pink-200 active:scale-95">
              Buscar Agora
            </button>
          </div>
        </div>
      </section>

      {/* FILTRO DE CATEGORIAS */}
      <div className="sticky top-0 z-40 bg-[#F3F4F6]/80 backdrop-blur-md py-4 border-b border-slate-200">
        <CategoryFilter 
          categories={categoriasExistentes} 
          activeCategory={categoriaAtiva} 
          onSelect={setCategoriaAtiva} 
          iconMap={iconMap} 
        />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 space-y-20 w-full">
        {!buscaNome && oQueFazerHoje.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader title="O que fazer" highlight="hoje" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {oQueFazerHoje.map(ev => <EventCard key={ev.id} evento={ev} />)}
            </div>
          </section>
        )}

        <section id="vitrine-principal">
          <SectionHeader 
            title={buscaNome ? `Resultados para "${buscaNome}"` : (categoriaAtiva === 'Todos' ? 'Novidades' : categoriaAtiva)} 
            count={vitrineOrdenada.length} 
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-[2rem] h-[400px] border border-slate-100 shadow-sm" />
              ))}
            </div>
          ) : vitrineOrdenada.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vitrineOrdenada.map(ev => <EventCard key={ev.id} evento={ev} />)}
            </div>
          ) : (
            <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-300">
              <div className="inline-flex items-center justify-center p-6 bg-slate-50 rounded-full mb-6">
                <FilterX size={48} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic">Nenhum evento encontrado</h3>
              <button 
                onClick={() => {setBuscaNome(''); setCategoriaAtiva('Todos');}}
                className="mt-6 text-[#ff0082] font-bold hover:underline"
              >
                Ver todos os eventos
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}