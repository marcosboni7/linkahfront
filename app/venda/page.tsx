'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Loader2, ArrowLeft, MapPin, CreditCard, 
  Calendar, Ticket, ShieldCheck 
} from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

function CheckoutContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  
  const [isSaving, setIsSaving] = useState(false);
  const [evento, setEvento] = useState<any>(null);
  const [error, setError] = useState(false);

  const formatarMoeda = (valor: any) => {
    const num = Number(valor);
    if (isNaN(num) || !num) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: 'BRL',
    }).format(num);
  };

  useEffect(() => {
    const carregarEvento = async () => {
      console.log("🛠️ [Passo 1] Iniciando useEffect. ID da URL:", id);

      if (!id) {
        console.warn("⚠️ [Atenção] ID não detectado na URL ainda.");
        return;
      }

      try {
        const urlFinal = `${API_URL}/api/eventos/${id}`;
        console.log("📡 [Passo 2] Fazendo fetch para:", urlFinal);

        const response = await fetch(urlFinal, { mode: 'cors' });
        
        console.log("Status da Resposta:", response.status);

        if (!response.ok) {
          console.error("❌ [Erro] Servidor retornou erro:", response.status);
          throw new Error("Erro na API");
        }
        
        const data = await response.json();
        console.log("📦 [Passo 3] Dados brutos recebidos do Banco:", data);

        // Mapeamento baseado no seu SQL do Back-end
        const eventoFormatado = {
          id: data.id,
          titulo: data.nome || data.titulo || "Evento sem Nome", 
          preco: data.preco,
          data: data.data_inicio,
          local: data.local_nome || data.local || "Local não informado",
          imagem: data.imagem_url || 'https://via.placeholder.com/600x400?text=Linkah+Evento'
        };

        console.log("✨ [Passo 4] Evento formatado para o Estado:", eventoFormatado);
        setEvento(eventoFormatado);

      } catch (err) {
        setError(true);
        console.error("🚨 [Erro Crítico] Falha ao carregar ou erro de CORS:", err);
      }
    };

    carregarEvento();
  }, [id]);

  const handleFinalizarCompra = async () => {
    console.log("🚀 [Checkout] Botão Pagar clicado.");
    if (!evento) {
        console.error("❌ Tentativa de compra sem dados do evento.");
        return;
    }
    
    setIsSaving(true);

    try {
      const userStorage = localStorage.getItem('@Linkah:User');
      const emailLogado = userStorage ? JSON.parse(userStorage).email : localStorage.getItem('userEmail');

      const payload = {
        evento: { id: id, preco: evento.preco },
        usuarioEmail: emailLogado || 'comprador@teste.com',
        quantidade: 1
      };

      console.log("📤 [Checkout] Enviando Payload para API:", payload);

      const response = await fetch(`${API_URL}/api/pagamento/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("📥 [Checkout] Resposta do Stripe:", data);

      if (data.url) {
        console.log("🔗 Redirecionando para Stripe:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Erro ao gerar URL");
      }
    } catch (error: any) {
      console.error("❌ [Checkout] Erro no processo:", error);
      Swal.fire('Erro', 'Não foi possível iniciar o pagamento.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-slate-500 font-bold uppercase text-xs">Erro de conexão com a API</p>
        <button onClick={() => window.location.reload()} className="bg-[#C22973] text-white px-6 py-2 rounded-full font-bold uppercase text-[10px]">
          Recarregar Página
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 md:p-12 font-sans">
      <div className="max-w-[850px] mx-auto">
        <button onClick={() => router.back()} className="inline-flex items-center gap-3 text-slate-400 hover:text-[#C22973] mb-10 font-black text-[10px] tracking-[0.2em] uppercase">
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="bg-white rounded-[3.5rem] shadow-2xl p-8 md:p-16 border border-slate-50 relative overflow-hidden">
          <div className="flex items-center gap-6 mb-16 relative z-10">
            <div className="w-20 h-20 bg-[#C22973] rounded-[2rem] flex items-center justify-center shadow-lg">
              <Ticket className="text-white" size={40} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 leading-none tracking-tighter italic uppercase">Checkout</h2>
              <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest italic text-pink-500">
                {isSaving ? "Gerando Link..." : "Ambiente Seguro"}
              </p>
            </div>
          </div>
          
          <div className="space-y-12 relative z-10">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100">
              {!evento ? (
                <div className="flex animate-pulse gap-6">
                  <div className="w-48 h-32 bg-slate-200 rounded-3xl" />
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-8">
                  <img src={evento.imagem} className="w-full md:w-48 h-32 object-cover rounded-3xl shadow-md bg-slate-200" alt="Evento" />
                  <div className="space-y-3">
                    <h4 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">{evento.titulo}</h4>
                    <div className="flex items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Calendar size={14}/> {evento.data ? new Date(evento.data).toLocaleDateString() : 'A definir'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14}/> {evento.local}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.3em] italic">Total a Pagar</h3>
                </div>
                <div className="text-right">
                  {!evento ? (
                    <Loader2 className="animate-spin text-slate-300" />
                  ) : (
                    <span className="text-5xl font-black italic tracking-tighter text-[#C22973]">
                      {formatarMoeda(evento.preco)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={handleFinalizarCompra}
              disabled={isSaving || !evento} 
              className="w-full bg-[#C22973] text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.4em] italic flex items-center justify-center gap-4 hover:bg-[#a62262] transition-all shadow-2xl disabled:opacity-50 active:scale-95 group"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <CreditCard size={22} />} 
              {isSaving ? 'Iniciando...' : 'Pagar Agora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-white" />}>
      <CheckoutContent />
    </Suspense>
  );
}