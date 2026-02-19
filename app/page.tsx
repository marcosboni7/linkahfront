'use client';

import { useEffect, useState, useCallback } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { CategoryFilter } from './site/CategoryFilter';
import { SectionHeader } from './site/SectionHeader';
import { 
  Search, Ticket, Music, Mic2, Theater, Gamepad2, 
  Utensils, GraduationCap, PartyPopper, Heart,
  FilterX
} from 'lucide-react';

const iconMap: { [key: string]: any } = {
  'Todos': Ticket, 'Show': Music, 'Mentoria': Mic2, 'Teatro': Theater,
  'Games': Gamepad2, 'Gastronomia': Utensils, 'Workshop': GraduationCap,
  'Festa': PartyPopper, 'Infantil': Heart,
};

const SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop', title: 'Descubra o seu', highlight: 'próximo momento' },
];

export default function BuyTicketHome() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaLocal, setBuscaLocal] = useState('');

  const API_URL = 'https://linkah-api.onrender.com/api/eventos/vitrine';

  const carregarDados = useCallback(async () => {
    try {
      // Usamos timestamp para evitar cache do navegador
      const response = await fetch(`${API_URL}?t=${Date.now()}`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const dados = await response.json();
        console.log("DADOS RECEBIDOS:", dados);
        
        // Garante que é um array e ordena pelos mais novos
        const listaSaneada = Array.isArray(dados) ? dados : [];
        const ordenados = listaSaneada.sort((a: any, b: any) => b.id - a.id);
        
        setEventos(ordenados);

        // Atualiza categorias dinamicamente baseada nos eventos reais
        const cats = ordenados.map((ev: any) => ev.categoria).filter(Boolean);
        setCategoriasExistentes(['Todos', ...Array.from(new Set(cats)) as string[]]);
        setLoading(false);
      } else {
        throw new Error("Resposta da API não foi OK");
      }
    } catch (error) { 
      console.error("Erro ao carregar vitrine, tentando novamente...", error);
      // Tenta novamente em 3 segundos caso a API esteja acordando
      setTimeout(carregarDados, 3000);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // FILTRO OTIMIZADO PARA EVENTOS EM 2026
  const vitrineFiltrada = eventos.filter(ev => {
    // 1. Match de Nome
    const nomeVal = (ev.nome || "").toLowerCase();
    const nomeMatch = nomeVal.includes(buscaNome.toLowerCase());

    // 2. Match de Categoria
    const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;

    // 3. Match de Local
    const localString = `${ev.cidade} ${ev.estado} ${ev.local_nome}`.toLowerCase();
    const localMatch = localString.includes(buscaLocal.toLowerCase());
    
    // 4. Match de Status (IMPORTANTE: Aceita 'ATIVO' ou nulo, mas barra 'EXCLUIDO')
    const status = (ev.status || "").toLowerCase();
    const isVisible = status !== 'excluido' && status !== 'deletado';
    
    return nomeMatch && catMatch && localMatch && isVisible;
  });

  const limparFiltros = () => {
    setBuscaNome('');
    setBuscaLocal('');
    setCategoriaAtiva('Todos');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F3F4F6] text-slate-900">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative h-[400px] bg-slate-900 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 opacity-50 bg-cover bg-center transition-transform duration-700 scale-105" 
          style={{ backgroundImage: `url('${SLIDES[0].url}')` }} 
        />
        <div className="relative z-10 w-full max-w-5xl px-6 text-center">
          <h1 className="text-white text-4xl md:text-6xl font-black mb-8 tracking-tighter">
            ENCONTRE SEU <span className="text-pink-500 italic">PRÓXIMO</span> EVENTO
          </h1>
          
          <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-4 w-full">
              <Search className="text-pink-500 mr-2" size={20} />
              <input 
                value={buscaNome} 
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Qual evento você busca?" 
                className="w-full py-3 outline-none font-bold text-slate-700" 
              />
            </div>
            <button className="w-full md:w-auto bg-[#ff0082] hover:bg-[#d4006d] text-white px-10 py-4 rounded-xl font-black uppercase text-sm transition-colors">
              BUSCAR
            </button>
          </div>
        </div>
      </section>

      {/* FILTRO DE CATEGORIAS */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b">
        <CategoryFilter 
          categories={categoriasExistentes} 
          activeCategory={categoriaAtiva} 
          onSelect={setCategoriaAtiva} 
          iconMap={iconMap} 
        />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 w-full">
        <SectionHeader 
          title="Eventos" 
          highlight="Disponíveis" 
          count={vitrineFiltrada.length} 
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[350px] bg-white animate-pulse rounded-3xl border border-slate-100" />
            ))}
          </div>
        ) : vitrineFiltrada.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {vitrineFiltrada.map(ev => (
              <EventCard key={ev.id} evento={ev} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-sm">
            <FilterX size={64} className="mx-auto text-slate-200 mb-6" />
            <h2 className="text-3xl font-black text-slate-800 mb-2">Nenhum evento aqui</h2>
            <p className="text-slate-500 mb-8 font-medium">Tente limpar os filtros para ver todos os eventos ativos.</p>
            <button 
              onClick={limparFiltros} 
              className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all"
            >
              LIMPAR FILTROS
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}