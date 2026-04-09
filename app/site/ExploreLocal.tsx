'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from './site/Navbar';
import { Footer } from './site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';
import { Search, Ticket, Users, Zap, ChevronRight, MessageCircle, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const EventCard = dynamic(() => import('./site/EventCard').then(mod => mod.EventCard), { ssr: false });
const CategoryGrid = dynamic(() => import('./site/CategoryGrid').then(mod => mod.CategoryGrid), { ssr: false });
const ExploreLocal = dynamic(() => import('./site/ExploreLocal').then(mod => mod.ExploreLocal), { ssr: false });

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

export default function BuyTicketHome() {
  const languageData = useLanguage();
  const t = languageData?.t as Record<string, any> | undefined;

  const [isMounted, setIsMounted] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [cidadeAtiva, setCidadeAtiva] = useState('todos');
  const [buscaNome, setBuscaNome] = useState('');

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted) return;
    async function carregarDados() {
      try {
        const res = await fetch(`${API_URL_BASE}/api/eventos/vitrine`, { cache: 'no-store' });
        if (res.ok) setEventos(await res.json());
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    carregarDados();
  }, [isMounted]);

  // 🔥 ESTA É A FUNÇÃO QUE RESOLVE O PROBLEMA DO "PORTO"
  const vitrineFiltrada = useMemo(() => {
    if (!isMounted) return [];

    const normalizar = (str: any) => 
      String(str || '').toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .trim();

    return (eventos || []).filter((ev) => {
      // 1. Match de Nome
      const nomeMatch = normalizar(ev.nome).includes(normalizar(buscaNome));
      
      // 2. Match de Categoria
      const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
      
      // 3. Match de Localização (O FIX SUPREMO)
      let cidadeMatch = true;
      if (cidadeAtiva !== 'todos') {
        const busca = normalizar(cidadeAtiva);
        
        // Criamos uma "Super String" com todos os campos que a sua API pode enviar
        // Adicionei campos comuns de APIs (local, cidade, estado, address, etc)
        const infosLocal = normalizar(`
          ${ev.local} 
          ${ev.cidade} 
          ${ev.estado} 
          ${ev.endereco} 
          ${ev.location?.city} 
          ${ev.location?.address}
        `);

        cidadeMatch = infosLocal.includes(busca);
        
        // Console log para você ver o que está acontecendo no F12
        if (busca === "porto" && cidadeMatch) {
          console.log("Evento encontrado no Porto:", ev.nome);
        }
      }

      return nomeMatch && catMatch && cidadeMatch;
    });
  }, [eventos, buscaNome, categoriaAtiva, cidadeAtiva, isMounted]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      {/* HERO SIMPLIFICADO PARA O FILTRO */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-6xl font-black mb-8 uppercase tracking-tighter">Explorar <span className="text-[#ff4d4d] italic">Eventos</span></h1>
        <div className="max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-lg border flex">
          <input 
            value={buscaNome} 
            onChange={e => setBuscaNome(e.target.value)} 
            placeholder="Nome do evento..." 
            className="flex-grow px-4 outline-none font-bold"
          />
          <div className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs">Buscar</div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 space-y-20 pb-20">
        <CategoryGrid categories={['Todos', 'Arte & Cultura', 'Negócios', 'Educação']} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} />
        
        {/* COMPONENTE DE LOCALIZAÇÃO */}
        <ExploreLocal activeCity={cidadeAtiva} onSelect={setCidadeAtiva} />

        <section>
          <h2 className="text-2xl font-black mb-8 uppercase">Resultados</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {vitrineFiltrada.length > 0 ? (
              vitrineFiltrada.map(ev => <EventCard key={ev.id} evento={ev} />)
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed">
                <p className="text-slate-400 font-bold uppercase tracking-widest">Nenhum evento encontrado para "{cidadeAtiva}"</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}