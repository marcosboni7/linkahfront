'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Lock, 
  LogIn, 
  ArrowRight, 
  MessageCircle, 
  Loader2, 
  Sparkles, 
  Users, 
  ShieldCheck,
  Hash
} from 'lucide-react';
import { Navbar } from '../site/Navbar';
import { Footer } from '../site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com';

interface Comunidade {
  id: string;
  nome: string;
  imagem_capa?: string;
  descricao?: string;
  membros_count?: number;
}

export default function ListaComunidades() {
  const { t } = useLanguage();
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [estaLogado, setEstaLogado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('@Linkah:Token');
    const user = localStorage.getItem('@Linkah:User');

    if (!token || !user) {
      setEstaLogado(false);
      setLoading(false);
      return;
    }

    setEstaLogado(true);

    const fetchComunidades = async () => {
      try {
        const res = await fetch(`${API_URL}/api/eventos/vitrine`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        setComunidades(data);
      } catch (err) {
        console.error("Erro ao carregar comunidades");
      } finally {
        setLoading(false);
      }
    };

    fetchComunidades();
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-white">
      <Loader2 className="animate-spin text-orange-600 mb-4" size={32} />
      <p className="text-sm font-medium text-slate-400 tracking-tight">Entrando no ecossistema...</p>
    </div>
  );

  if (!estaLogado) return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="text-orange-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Área de Membros</h1>
          <p className="text-slate-500 mb-8 text-sm">Faça login para acessar os chats e conexões exclusivas.</p>
          <div className="space-y-3">
            <Link href="/auth/login" className="block w-full bg-orange-600 text-white py-3.5 rounded-full font-semibold hover:bg-orange-700 transition-all">
              Entrar agora
            </Link>
            <Link href="/auth/registro" className="block w-full bg-slate-50 text-slate-600 py-3.5 rounded-full font-semibold hover:bg-slate-100 transition-all text-sm">
              Criar minha conta
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFF] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 pt-24 pb-32 w-full">
        {/* Header Clean */}
        <div className="max-w-2xl mb-16">
          <div className="flex items-center gap-2 text-orange-600 font-bold text-[11px] uppercase tracking-widest mb-4">
            <Hash size={14} strokeWidth={3} />
            Sua Rede Privada
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Comunidades & Grupos
          </h1>
          <p className="text-slate-500 text-lg">
            Acesse os canais de conversa e faça networking com outros participantes.
          </p>
        </div>

        {/* Grid de Cards Estilo Luma */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comunidades.map((com) => (
            <Link 
              key={com.id} 
              href={`/evento/${com.id}/comunidade`}
              className="group bg-white rounded-2xl border border-slate-200/60 hover:border-orange-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Cover Image */}
              <div className="relative h-40 bg-slate-100">
                <img 
                  src={com.imagem_capa || 'https://images.unsplash.com/photo-1522152302542-71a8e5373356?w=800'} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={com.nome}
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm border border-white px-2.5 py-1 rounded-lg text-[10px] font-bold text-orange-600 flex items-center gap-1.5 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    CHAT ATIVO
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 mb-2 text-slate-400">
                  <ShieldCheck size={14} className="text-orange-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Grupo Verificado</span>
                </div>
                
                <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors leading-tight">
                  {com.nome}
                </h2>
                
                <p className="text-xs text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                  {com.descricao || "Entre no canal para trocar ideias e expandir seu networking neste evento."}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Users size={14} />
                    <span className="text-[11px] font-medium">Comunidade Aberta</span>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-full text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Card Empty/Placeholder para sugerir mais */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-center p-8 text-center flex-col justify-center items-center opacity-60">
             <MessageCircle className="text-slate-300 mb-3" size={32} />
             <p className="text-xs font-medium text-slate-400 leading-tight">Mais comunidades <br/>serão liberadas em breve</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}