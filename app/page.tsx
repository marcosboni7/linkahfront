'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../app/site/Navbar'; 
import { EventCard } from '../app/site/EventCard';
import { Footer } from '../app/site/Footer';
import { Search, MapPin, Sparkles, Ticket, ChevronRight, Loader2, MessagesSquare, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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

  // Cores Sympla-Style Customizadas (Roxo)
  const primaryColor = "#6D28D9"; // Roxo vibrante

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

  const handleLimparBusca = () => {
    setBuscaNome('');
    setBuscaCidade('');
    setCategoriaAtiva('Todos');
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-slate-800 font-sans">
      <Navbar />

      {/* MODAL DE AVISO - ESTILO CLEAN */}
      {showComunidadeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowComunidadeModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowComunidadeModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full">
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessagesSquare size={30} className="text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Comunidade Linkah</h2>
              <p className="text-slate-500 mb-8">Conecte-se com outras pessoas e tire dúvidas sobre os eventos.</p>
              <div className="space-y-3">
                <Link href="/comunidades" className="block w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition-all">
                  Explorar Comunidades
                </Link>
                <button onClick={() => setShowComunidadeModal(false)} className="w-full py-2 text-slate-400 font-medium hover:text-slate-600 text-sm">
                  Agora não
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO BUSCA - ESTILO SYMPLA */}
      <section className="bg-white pt-12 pb-16 px-6 border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">
            Olá, viva o <span className="text-violet-600">agora</span>
          </h1>

          {/* BARRA DE BUSCA HORIZONTAL */}
          <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 p-2 gap-2">
            <div className="flex-[1.5] relative border-b md:border-b-0 md:border-r border-slate-100">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Nomes, artistas ou eventos" 
                className="w-full py-4 pl-12 pr-4 outline-none text-slate-700"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                value={buscaCidade}
                onChange={(e) => setBuscaCidade(e.target.value)}
                placeholder="São Paulo, SP" 
                className="w-full py-4 pl-12 pr-4 outline-none text-slate-700"
              />
            </div>
            <button 
              onClick={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-violet-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Buscar'}
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORIAS - NAVEGAÇÃO POR ABAS */}
      <nav className="bg-white sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {categoriasExistentes.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategoriaAtiva(cat); setBuscaNome(''); }}
                className={`py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                  categoriaAtiva === cat 
                  ? 'border-violet-600 text-violet-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* GRID DE EVENTOS */}
      <main id="vitrine" className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-violet-600" size={20} />
            {buscaNome ? `Resultados para "${buscaNome}"` : 'Eventos em destaque'}
          </h2>
          <span className="text-sm text-slate-400 font-medium">
            {eventosFiltrados.length} eventos encontrados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-200 rounded-xl h-72 shadow-sm" />
            ))
          ) : eventosFiltrados.length > 0 ? (
            eventosFiltrados.map((evento: any) => (
              <EventCard key={evento.id} evento={evento} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Ticket className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-500 font-medium mb-6">Nenhum evento encontrado para essa busca.</p>
              <button 
                onClick={handleLimparBusca} 
                className="text-violet-600 font-bold border border-violet-600 px-6 py-2 rounded-lg hover:bg-violet-50 transition-colors"
              >
                Ver todos os eventos
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}