'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
  Calendar, MapPin, Ticket, ShieldCheck, Share2, 
  Loader2, Plus, Minus, Zap, ChevronLeft,
  CheckCircle2, Clock, Heart, Users, Verified, Info
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function DetalhesEvento() {
  const { id } = useParams();
  const router = useRouter();
  const { t, language }: any = useLanguage(); 
  
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar a quantidade de cada ingresso
  // Usamos um objeto onde a chave é o ID do ingresso
  const [quantidades, setQuantidades] = useState<{[key: string]: number}>({});

  useEffect(() => {
    async function carregarEvento() {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`${API_URL}/api/eventos/${id}?t=${timestamp}`, {
          cache: 'no-store'
        });
        
        if (res.ok) {
          const data = await res.json();
          setEvento(data);
          
          // Inicializa as quantidades com 0 para cada lote encontrado
          if (data.ingressos) {
            const qts: any = {};
            data.ingressos.forEach((ing: any) => {
              qts[ing.id] = 0;
            });
            // Opcional: Começar com 1 no primeiro ingresso se quiser
            if (data.ingressos.length > 0) qts[data.ingressos[0].id] = 1;
            setQuantidades(qts);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar da AWS:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) carregarEvento();
  }, [id]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#C22973]" size={40} />
        <p className="text-slate-400 font-medium animate-pulse">{t.sync || 'Sincronizando...'}</p>
      </div>
    </div>
  );

  if (!evento) return <div className="p-20 text-center text-slate-500 font-medium">Evento não encontrado.</div>;

  const moedaFinal = (evento.moeda || 'BRL').toUpperCase();
  const locale = language === 'PT' ? 'pt-BR' : 'en-US';

  // Cálculo do total geral somando todos os ingressos selecionados
  const calcularTotalGeral = () => {
    if (!evento.ingressos) return 0;
    return evento.ingressos.reduce((acc: number, ing: any) => {
      const qtd = quantidades[ing.id] || 0;
      return acc + (Number(ing.preco) * qtd);
    }, 0);
  };

  const totalGeral = calcularTotalGeral();
  const temIngressoSelecionado = totalGeral > 0;

  const handleMudarQuantidade = (ingId: string, operacao: 'soma' | 'sub') => {
    setQuantidades(prev => {
      const atual = prev[ingId] || 0;
      const novaQtd = operacao === 'soma' ? atual + 1 : Math.max(0, atual - 1);
      return { ...prev, [ingId]: novaQtd };
    });
  };

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        
        {/* NAVEGAÇÃO SUPERIOR */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => router.back()} className="group inline-flex items-center gap-2 text-slate-400 hover:text-[#C22973] transition-all text-sm font-bold">
            <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
              <ChevronLeft size={20} />
            </div>
            {language === 'PT' ? 'Voltar' : 'Back'}
          </button>
          <div className="flex gap-3">
            <button className="p-3 rounded-full border border-slate-100 hover:bg-slate-50 transition-all text-slate-400 shadow-sm active:scale-90">
              <Share2 size={18} />
            </button>
            <button className="p-3 rounded-full border border-slate-100 hover:bg-slate-50 transition-all text-slate-400 shadow-sm active:scale-90">
              <Heart size={18} />
            </button>
          </div>
        </div>

        {/* SEÇÃO HERO */}
        <div className="relative w-full aspect-[21/9] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl mb-16 bg-slate-100 group">
          <img 
            src={evento.imagem_capa || evento.imagem || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt={evento.nome}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-10 left-10 right-10 text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-gradient-to-r from-[#C22973] to-[#ff8c42] px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg">
                  {evento.categoria || t.catEnt || "Evento"}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/80 backdrop-blur-md bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                  <Verified size={14} className="text-blue-400" /> {language === 'PT' ? 'Verificado na AWS' : 'AWS Verified'}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none drop-shadow-md italic uppercase">
                {evento.nome}
              </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* COLUNA ESQUERDA: INFORMAÇÕES */}
          <div className="lg:col-span-8 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-pink-50 flex items-center justify-center text-[#C22973] shrink-0">
                  <Calendar size={28} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{language === 'PT' ? 'DATA' : 'DATE'}</p>
                  <p className="font-bold text-slate-800 text-lg">
                    {evento.data_inicio ? new Date(evento.data_inicio).toLocaleDateString(locale, {day: '2-digit', month: 'long'}) : '---'}
                  </p>
                  <p className="text-sm text-slate-500 font-medium">{evento.horario || (evento.hora_inicio ? evento.hora_inicio.slice(0,5) : '19:00')}</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                  <MapPin size={28} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t.thLocation || 'Local'}</p>
                  <p className="font-bold text-slate-800 text-lg line-clamp-1">
                    {evento.tipo === 'online' ? (language === 'PT' ? 'Plataforma Linkah' : 'Linkah Platform') : (evento.local_nome || evento.local)}
                  </p>
                  <p className="text-sm text-slate-500 font-medium line-clamp-1">{evento.cidade || 'Linkah Transmissão'}{evento.estado ? `, ${evento.estado}` : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                  <Users size={28} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{language === 'PT' ? 'ORGANIZADOR' : 'ORGANIZER'}</p>
                  <p className="font-bold text-slate-800 text-lg line-clamp-1 capitalize">{evento.produtor_nome || t.producerDefaultName || 'Organizador'}</p>
                  <button className="text-sm text-[#C22973] font-bold hover:underline">{language === 'PT' ? 'Ver Perfil' : 'View Profile'}</button>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{language === 'PT' ? 'Sobre esta experiência' : 'About this experience'}</h3>
                <div className="h-[1px] flex-1 bg-slate-100"></div>
              </div>
              <div className="text-slate-600 leading-relaxed text-xl font-light whitespace-pre-line max-w-3xl">
                {evento.descricao}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: CHECKOUT - AGORA COM LISTA DE LOTES */}
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] overflow-hidden">
                <div className="p-8 md:p-10 space-y-8">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 text-xl tracking-tight italic uppercase">{t.tickets || 'Ingressos'}</h4>
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-emerald-100">
                      <CheckCircle2 size={12} /> {language === 'PT' ? 'DISPONÍVEL' : 'AVAILABLE'}
                    </span>
                  </div>

                  {/* LISTAGEM DE INGRESSOS/LOTES DINÂMICA */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {evento.ingressos && evento.ingressos.length > 0 ? (
                      evento.ingressos.map((ing: any) => (
                        <div key={ing.id} className={`p-5 rounded-[2.5rem] border transition-all ${quantidades[ing.id] > 0 ? 'bg-pink-50/30 border-[#C22973]/20 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 italic uppercase text-sm leading-tight">{ing.nome || (language === 'PT' ? 'Individual' : 'Single')}</p>
                              {ing.descricao && <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{ing.descricao}</p>}
                              <p className="text-[#C22973] font-black text-lg italic mt-1">
                                {Number(ing.preco).toLocaleString(locale, { style: 'currency', currency: moedaFinal })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                            <button 
                              onClick={() => handleMudarQuantidade(ing.id, 'sub')} 
                              className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#C22973] active:scale-90 transition-all"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-black text-lg text-slate-900 italic">{quantidades[ing.id] || 0}</span>
                            <button 
                              onClick={() => handleMudarQuantidade(ing.id, 'soma')} 
                              className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#C22973] active:scale-90 transition-all"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-xs italic">
                        Nenhum lote disponível no momento.
                      </div>
                    )}
                  </div>

                  {/* RESUMO E BOTÃO */}
                  <div className="pt-6 border-t border-slate-100 space-y-6">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Total da Reserva</p>
                      <p className="text-3xl font-black text-slate-900 italic tracking-tighter">
                        {totalGeral.toLocaleString(locale, { style: 'currency', currency: moedaFinal })}
                      </p>
                    </div>

                    <Link 
                      href={temIngressoSelecionado ? `/venda?eventoId=${id}&payload=${encodeURIComponent(JSON.stringify(quantidades))}&currency=${moedaFinal}` : '#'}
                      onClick={(e) => !temIngressoSelecionado && e.preventDefault()}
                      className={`group flex items-center justify-center w-full py-7 rounded-[2.5rem] font-black text-white transition-all shadow-xl text-base gap-3 italic uppercase tracking-widest ${temIngressoSelecionado ? 'bg-gradient-to-r from-[#C22973] to-[#ff8c42] hover:scale-[1.02]' : 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none'}`}
                    >
                      <Ticket size={24} />
                      {language === 'PT' ? 'CONTINUAR' : 'CONTINUE'}
                    </Link>

                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">
                        Checkout AWS • Stripe & Pix
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex items-center gap-4 px-6">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-[11px] text-slate-400 font-bold leading-tight uppercase tracking-wider italic">
                  {language === 'PT' ? 'Compra Protegida' : 'Secure Checkout'} <br/> 
                  <span className="text-slate-900">{language === 'PT' ? 'Garantia Linkah' : 'Linkah Guarantee'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}