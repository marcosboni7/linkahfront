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
];

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaLocal, setBuscaLocal] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}?t=${Date.now()}`, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          const dados = await response.json();
          console.log("DEBUG VITRINE - Dados brutos:", dados);
          
          // Ordena e limpa dados
          const ordenados = (dados || []).sort((a: any, b: any) => b.id - a.id);
          setEventos(ordenados);

          // Extrai categorias dinamicamente
          const extrair = ordenados.map((ev: any) => ev.categoria).filter(Boolean);
          setCategoriasExistentes(['Todos', ...Array.from(new Set(extrair)) as string[]]);
        }
      } catch (error) { 
        console.error("Erro API Vitrine:", error); 
      } finally { 
        setLoading(false); 
      }
    }
    carregarDados();
  }, []);

  // FILTRO PRINCIPAL (Ajustado para ser menos rigoroso)
  const vitrineFiltrada = eventos.filter(ev => {
    const nomeVal = (ev.nome || "").toLowerCase();
    const buscaNomeVal = buscaNome.toLowerCase();
    const nomeMatch = nomeVal.includes(buscaNomeVal);

    const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;

    const localVal = `${ev.cidade} ${ev.estado} ${ev.local_nome}`.toLowerCase();
    const localMatch = localVal.includes(buscaLocal.toLowerCase());
    
    // Status: Deixa passar quase tudo (ativo, ATÍVO, pendente, null)
    const status = (ev.status || "").toLowerCase();
    const naoExcluido = status !== 'excluido' && status !== 'deletado';
    
    return nomeMatch && catMatch && localMatch && naoExcluido;
  });

  const limparFiltros = () => {
    setBuscaNome('');
    setBuscaLocal('');
    setCategoriaAtiva('Todos');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F3F4F6] text-slate-900">
      <Navbar />

      {/* HERO / BUSCA */}
      <section className="relative h-[480px] bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url('${SLIDES[0].url}')` }} />
        <div className="relative z-10 w-full max-w-5xl px-6">
          <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:row items-center gap-2">
            <div className="flex-1 flex items-center px-4 w-full border-r border-slate-100">
              <Search className="text-pink-500 mr-2" size={20} />
              <input 
                value={buscaNome} 
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Nome do evento..." 
                className="w-full py-3 outline-none font-medium" 
              />
            </div>
            <button className="bg-[#ff0082] text-white px-8 py-3 rounded-xl font-bold uppercase text-sm">Buscar</button>
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b">
        <CategoryFilter categories={categoriasExistentes} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 w-full">
        <SectionHeader title="Explorar" highlight="Eventos" count={vitrineFiltrada.length} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white animate-pulse rounded-2xl" />)}
          </div>
        ) : vitrineFiltrada.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {vitrineFiltrada.map(ev => <EventCard key={ev.id} evento={ev} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <FilterX size={60} className="mx-auto text-slate-200 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Nenhum evento encontrado</h2>
            <p className="text-slate-500 mb-6">Não encontramos nada com esses filtros.</p>
            <button onClick={limparFiltros} className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold">
              Limpar Filtros
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}