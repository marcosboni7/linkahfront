'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import { 
  Calendar, MapPin, Ticket, ShieldCheck, Share2, 
  Loader2, Plus, Minus, Zap, ChevronLeft, Globe,
  CheckCircle2, Info, Clock, Heart, Users 
} from 'lucide-react';
import Link from 'next/link';

export default function DetalhesEvento() {
  const { id } = useParams();
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    async function carregarEvento() {
      if (!id) return;
      
      try {
        setLoading(true);
        // Adicionamos um timestamp para evitar que o navegador pegue uma resposta antiga do cache
        const res = await fetch(`https://linkah-api.onrender.com/api/eventos/${id}?t=${Date.now()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Dados do evento recebidos:", data); // Para você ver no F12
          setEvento(data);
        } else {
          console.error("Erro na resposta da API:", res.status);
        }
      } catch (err) {
        console.error("Erro ao carregar:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarEvento();
  }, [id]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#E30031]" size={40} />
    </div>
  );

  if (!evento) return (
    <div className="p-20 text-center">
      <p className="text-slate-500 font-medium mb-4">Evento não encontrado ou ainda sendo processado.</p>
      <button onClick={() => window.location.reload()} className="text-[#E30031] font-bold underline">Tentar novamente</button>
    </div>
  );

  // MELHORIA: Busca o preço do primeiro ingresso disponível, 
  // tratando se ele vem como 'ingressos' ou 'Ingressos' (maiúsculo)
  const listaIngressos = evento.ingressos || evento.Ingressos || [];
  const precoBase = listaIngressos.length > 0 ? Number(listaIngressos[0].preco) : 0;
  const total = precoBase * quantidade;

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        {/* ... (resto do seu JSX continua igual) ... */}
        
        {/* BREADCRUMB & ACTIONS */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold">
            <ChevronLeft size={18} />
            Explorar Eventos
          </Link>
          <div className="flex gap-2">
            <button className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-all text-slate-600">
              <Share2 size={18} />
            </button>
            <button className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-all text-slate-600">
              <Heart size={18} />
            </button>
          </div>
        </div>

        {/* IMAGEM DE CAPA */}
        <div className="relative w-full aspect-[21/9] md:aspect-[25/9] rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 bg-slate-100">
          <img 
            src={evento.imagem_capa || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            alt={evento.nome}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white">
             <span className="bg-[#E30031] px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">
                {evento.categoria || 'Destaque'}
             </span>
             <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none">
                {evento.nome}
             </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* COLUNA ESQUERDA */}
          <div className="lg:col-span-8 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <Calendar className="text-[#E30031] mt-1" size={24} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Quando</p>
                  <p className="font-bold text-slate-800">
                    {evento.data_inicio ? new Date(evento.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Data a definir'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {evento.hora_inicio ? String(evento.hora_inicio).split(':').slice(0, 2).join(':') : '19:00'}h
                  </p>
                </div>
              </div>
              
              {/* Onde */}
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <MapPin className="text-[#E30031] mt-1" size={24} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Onde</p>
                  <p className="font-bold text-slate-800 line-clamp-1">{evento.tipo === 'online' ? 'Online' : (evento.local_nome || 'Local não informado')}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{evento.cidade || 'Remoto'}, {evento.estado || 'BR'}</p>
                </div>
              </div>

              {/* Produtor */}
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <Users className="text-[#E30031] mt-1" size={24} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Organizador</p>
                  <p className="font-bold text-slate-800 line-clamp-1">{evento.produtor_nome || 'Produtor Linkah'}</p>
                  <button className="text-xs text-[#E30031] font-bold">Ver perfil</button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">Sobre o Evento</h3>
              <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-line border-l-4 border-slate-100 pl-6">
                {evento.descricao}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: CHECKOUT */}
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 md:p-10 space-y-8">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-slate-900 uppercase italic tracking-tighter">Ingressos</h4>
                    <span className="bg-green-100 text-green-600 text-[10px] font-black px-2 py-1 rounded">DISPONÍVEL</span>
                  </div>

                  <div className="space-y-4">
                    {listaIngressos.length > 0 ? (
                      listaIngressos.map((ing: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-4">
                          <div>
                            <p className="font-bold text-slate-800">{ing.nome}</p>
                            <p className="text-xs text-slate-400">Quantidade disponível: {ing.quantidade}</p>
                          </div>
                          <span className="text-lg font-black text-slate-900">
                            {Number(ing.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">Carregando valores...</p>
                    )}

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Quantidade</p>
                      <div className="flex items-center gap-5">
                        <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <Minus size={14} />
                        </button>
                        <span className="font-black text-lg">{quantidade}</span>
                        <button onClick={() => setQuantidade(quantidade + 1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t-2 border-dashed border-slate-100 space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-400 text-[10px] font-black uppercase pb-1">Total</span>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">
                        {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <Link 
                      href={`/venda?eventoId=${id}&qtd=${quantidade}`}
                      className="flex items-center justify-center w-full bg-[#E30031] py-6 rounded-[2rem] font-black text-white uppercase text-xs tracking-widest gap-3"
                    >
                      <Ticket size={20} />
                      Comprar Agora
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}