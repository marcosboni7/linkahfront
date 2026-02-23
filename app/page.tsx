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
  Zap, PlusCircle, MessageCircle
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

  const hojeStr = new Date().toLocaleDateString('en-CA');
  const oQueFazerHoje = eventos.filter(ev => ev.data_inicio && new Date(ev.data_inicio).toLocaleDateString('en-CA') === hojeStr);
  
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
        
        {/* BUSCA */}
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

      {/* FILTROS */}
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

            {/* COMUNIDADES (ROTA CORRIGIDA PARA /comunidade) */}
            {comunidades.length > 0 && (
              <section className="space-y-10">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Comunidades <span className="text-[#ff4d4d]">em alta</span></h2>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Interaja com quem já garantiu o ingresso.</p>
                  </div>
                  <Link href="/eventos" className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-[#ff4d4d] transition-colors">
                    Ver todas as salas <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {comunidades.map((com) => (
                    <Link 
                      href={`/evento/${com.id}/comunidade`} 
                      key={com.id} 
                      className="group relative h-64 rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                    >
                      <img 
                        src={com.imagem_url || 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=500'} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt={com.nome} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                      
                      <div className="absolute top-6 left-6 bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Chat Ativo</span>
                      </div>

                      <div className="absolute bottom-8 left-8 right-8">
                        <h4 className="text-white font-bold text-2xl leading-tight mb-3">{com.nome}</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                               {[1,2,3].map(i => (
                                 <img key={i} className="h-6 w-6 rounded-full border-2 border-slate-900" src={`https://i.pravatar.cc/100?u=${com.id+i}`} alt="user"/>
                               ))}
                            </div>
                            <span className="text-white/80 text-xs font-bold">+{com.total_membros} membros</span>
                          </div>
                          <div className="bg-[#ff4d4d] text-white text-[10px] font-black uppercase px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2">
                            <MessageCircle size={12} /> Entrar
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* BANNER PRODUTOR */}
            <section className="bg-slate-900 rounded-[3.5rem] p-12 md:p-20 relative overflow-hidden text-white my-20">
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 text-[#ff4d4d] font-bold text-sm uppercase tracking-widest mb-6">
                  <TrendingUp size={18} /> Expanda seu alcance
                </div>
                <h3 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Crie seu evento e <br/> <span className="text-[#ff4d4d]">venda em minutos.</span></h3>
                <p className="text-slate-400 text-lg mb-10 font-medium max-w-md">
                  A Linkah oferece gestão completa de ingressos e salas de chat exclusivas para conectar você ao seu público.
                </p>
                <Link href="/dashboard" className="bg-white text-slate-900 hover:bg-[#ff4d4d] hover:text-white px-10 py-5 rounded-[2rem] font-bold inline-flex items-center gap-3 transition-all transform hover:scale-105">
                  <PlusCircle size={20} /> Começar como Produtor
                </Link>
              </div>
              <div className="absolute right-[-100px] bottom-[-100px] opacity-10 pointer-events-none text-white">
                 <Ticket size={500} className="rotate-12" />
              </div>
            </section>
          </>
        )}

        {/* VITRINE PRINCIPAL */}
        <section id="vitrine-principal">
          <SectionHeader 
            title={buscaNome ? `Resultados para "${buscaNome}"` : (categoriaAtiva === 'Todos' ? 'Descubra novas' : categoriaAtiva)} 
            highlight={buscaNome ? "" : (categoriaAtiva === 'Todos' ? "experiências" : "")} 
            count={vitrineFiltrada.length} 
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="animate-pulse flex flex-col gap-4">
                   <div className="bg-slate-200 rounded-[2.5rem] h-64 w-full" />
                   <div className="h-4 bg-slate-200 rounded w-3/4" />
                   <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {vitrineFiltrada.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
                  {vitrineFiltrada.map(ev => <EventCard key={ev.id} evento={ev} />)}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 mt-10">
                  <Search size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900">Nenhum evento encontrado</h3>
                  <p className="text-slate-500 font-medium">Tente ajustar sua busca ou categoria.</p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}