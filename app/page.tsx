'use client';

import { useEffect, useState } from 'react';
import { Navbar } from './site/Navbar'; 
import { EventCard } from './site/EventCard';
import { Footer } from './site/Footer';
import { CategoryFilter } from './site/CategoryFilter';
import { SectionHeader } from './site/SectionHeader';
import { 
  Search, Ticket, Music, Mic2, Theater, Gamepad2, 
  Utensils, GraduationCap, PartyPopper, Heart,
  Clock, Sparkles, Users, ChevronRight, TrendingUp,
  Zap, PlusCircle, MessageCircle, Calendar
} from 'lucide-react';
import Link from 'next/link';

const iconMap: { [key: string]: any } = {
  'Todos': Ticket, 'Show': Music, 'Mentoria': Mic2, 'Teatro': Theater,
  'Games': Gamepad2, 'Gastronomia': Utensils, 'Workshop': GraduationCap,
  'Festa': PartyPopper, 'Infantil': Heart,
};

const SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070', title: 'Descubra o seu', highlight: 'próximo momento' },
  { id: 2, url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070', title: 'Sinta a vibe dos', highlight: 'melhores shows' },
  { id: 3, url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=2070', title: 'Conecte-se com', highlight: 'novas experiências' }
];

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);
  const [buscaNome, setBuscaNome] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';
  const API_COMUNIDADES = 'https://linkah-api.onrender.com/api/comunidades';

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1)), 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const [resEventos, resComunidades] = await Promise.all([
          fetch(API_URL),
          fetch(API_COMUNIDADES)
        ]);

        if (resEventos.ok) {
          const dados = await resEventos.json();
          setEventos(dados);
          const extrair = dados.map((ev: any) => ev.categoria).filter(Boolean);
          setCategoriasExistentes(['Todos', ...Array.from(new Set(extrair)) as string[]]);
        }

        if (resComunidades.ok) {
          const dadosCom = await resComunidades.json();
          setComunidades(dadosCom.slice(0, 3));
        }
      } catch (error) { 
        console.error("Erro ao carregar dados da API:", error); 
      } finally { 
        setLoading(false); 
      }
    }
    carregarDados();
  }, []);

  // --- LÓGICA DE DATAS CORRIGIDA ---
  // Pegamos a data atual sem horas para comparar apenas o dia
  const hojeObj = new Date();
  hojeObj.setHours(0, 0, 0, 0);
  const hojeStr = hojeObj.toISOString().split('T')[0];

  const seteDiasDepois = new Date();
  seteDiasDepois.setDate(hojeObj.getDate() + 7);
  seteDiasDepois.setHours(23, 59, 59, 999);
  const seteDiasStr = seteDiasDepois.toISOString().split('T')[0];

  // Função auxiliar para pegar a data independente do nome do campo no banco (data ou data_inicio)
  const formatarDataBanco = (ev: any) => {
    const d = ev.data || ev.data_inicio;
    if (!d) return "";
    // Se a data vier como 2026-02-23T00:00... pegamos só a parte da data
    return d.split('T')[0];
  };

  const oQueFazerHoje = eventos.filter(ev => {
    const dataEv = formatarDataBanco(ev);
    return dataEv === hojeStr;
  });
  
  const eventosChegando = eventos.filter(ev => {
    const dataEv = formatarDataBanco(ev);
    return dataEv > hojeStr && dataEv <= seteDiasStr;
  });
  
  const vitrineFiltrada = eventos.filter(ev => {
    const nomeMatch = ev.nome.toLowerCase().includes(buscaNome.toLowerCase());
    const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
    return nomeMatch && catMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBFA] text-slate-900 font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden bg-slate-900 shrink-0">
        {SLIDES.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out" style={{ backgroundImage: `url('${slide.url}')`, transform: index === currentSlide ? 'scale(1.05)' : 'scale(1.2)' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-[#FCFBFA]" />
            </div>
            <div className="relative z-10 text-center px-6 mt-[-80px]">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-[0.3em] px-5 py-2 rounded-full mb-6 border border-white/20">
                <Sparkles size={14} className="text-[#ff4d4d]" /> Linkah Experience
              </div>
              <h1 className="text-6xl md:text-9xl font-bold text-white mb-6 tracking-tighter">
                {slide.title} <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d4d] to-[#ff8080]">{slide.highlight}</span>
              </h1>
            </div>
          </div>
        ))}
        
        <div className="absolute bottom-16 z-30 w-full px-6">
          <div className="bg-white p-3 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center max-w-4xl mx-auto border border-slate-100">
            <div className="flex-[1.5] flex items-center px-6 py-3 w-full border-b md:border-b-0 md:border-r border-slate-100">
              <Search size={22} className="text-slate-400 mr-4" />
              <input 
                type="text" 
                value={buscaNome} 
                onChange={(e) => setBuscaNome(e.target.value)} 
                placeholder="Qual evento ou chat você busca?" 
                className="w-full bg-transparent outline-none text-lg font-medium text-slate-800 placeholder:text-slate-400" 
              />
            </div>
            <button className="bg-[#ff4d4d] hover:bg-black text-white px-12 py-5 rounded-[2rem] font-bold text-sm uppercase tracking-wider transition-all w-full md:w-auto ml-2">Explorar</button>
          </div>
        </div>
      </section>

      <div className="sticky top-[68px] z-40 bg-white/80 backdrop-blur-xl py-5 border-b border-slate-100">
        <CategoryFilter categories={categoriasExistentes} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 space-y-28 w-full">
        {!buscaNome && categoriaAtiva === 'Todos' && (
          <>
            {/* HOJE */}
            {oQueFazerHoje.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-[#ff4d4d]/10 p-2 rounded-xl text-[#ff4d4d]"><Zap size={24} fill="currentColor"/></div>
                  <SectionHeader title="Acontecendo" highlight="hoje" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {oQueFazerHoje.map(ev => <EventCard key={ev.id} evento={ev} />)}
                </div>
              </section>
            )}

            {/* BREVE */}
            {eventosChegando.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-blue-500/10 p-2 rounded-xl text-blue-500"><Calendar size={24} /></div>
                  <SectionHeader title="Chegando" highlight="em breve" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {eventosChegando.map(ev => <EventCard key={ev.id} evento={ev} />)}
                </div>
              </section>
            )}

            {/* COMUNIDADES */}
            {comunidades.length > 0 && (
              <section className="space-y-10">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Comunidades <span className="text-[#ff4d4d]">em alta</span></h2>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Interaja com quem já garantiu o ingresso.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {comunidades.map((com) => (
                    <Link href={`/evento/${com.id}/comunidade`} key={com.id} className="group relative h-64 rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                      <img src={com.imagem_url || 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=500'} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={com.nome} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                      <div className="absolute bottom-8 left-8 right-8">
                        <h4 className="text-white font-bold text-2xl leading-tight mb-3">{com.nome}</h4>
                        <span className="text-white/80 text-xs font-bold">+{com.total_membros} membros</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* VITRINE PRINCIPAL */}
        <section id="vitrine-principal">
          <SectionHeader 
            title={buscaNome ? `Resultados para "${buscaNome}"` : (categoriaAtiva === 'Todos' ? 'Descubra novas' : categoriaAtiva)} 
            highlight={buscaNome ? "" : (categoriaAtiva === 'Todos' ? "experiências" : "")} 
            count={vitrineFiltrada.length} 
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
            {vitrineFiltrada.map(ev => <EventCard key={ev.id} evento={ev} />)}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}