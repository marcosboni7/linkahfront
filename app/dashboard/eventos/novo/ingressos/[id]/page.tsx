'use client';

import { useState } from 'react';
import { ChevronLeft, Plus, Ticket, Trash2, CheckCircle2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function CadastroIngressos() {
  const router = useRouter();
  const { id } = useParams(); // Pega o ID da URL automaticamente
  const [loading, setLoading] = useState(false);

  const [ingressos, setIngressos] = useState([
    { nome: 'Ingresso Meia', preco: '', quantidade: '', tipo: 'Pago' }
  ]);

  const addIngresso = () => setIngressos([...ingressos, { nome: '', preco: '', quantidade: '', tipo: 'Pago' }]);
  
  const removeIngresso = (index: number) => {
    if (ingressos.length > 1) setIngressos(ingressos.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const novos = [...ingressos];
    novos[index] = { ...novos[index], [field]: value };
    setIngressos(novos);
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      // CONFIGURAÇÃO DINÂMICA DA URL
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://linkah-api.onrender.com';
      
      const response = await fetch(`${apiBaseUrl}/api/eventos/${id}/ingressos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingressos }),
      });

      if (response.ok) {
        alert("🎉 Evento publicado com sucesso!");
        router.push('/dashboard/eventos');
      } else {
        alert("Erro ao salvar ingressos. Verifique os dados.");
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
      alert("Não foi possível conectar ao servidor da AWS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      <header className="border-b border-slate-100 px-10 py-5 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-full text-slate-400">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-slate-800 font-bold text-lg tracking-tight">Configurar Ingressos</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Passo 2 de 2</p>
          </div>
        </div>
        <button 
          onClick={handleFinalizar}
          disabled={loading}
          className="bg-[#C22973] text-white px-10 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-[#a62262] transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? 'Publicando...' : 'Finalizar e Publicar'}
        </button>
      </header>

      <main className="max-w-[1100px] mx-auto p-10">
        
        {/* STEPPER DINÂMICO */}
        <div className="flex justify-center items-center mb-16 px-20">
          <div className="flex items-center gap-4 opacity-40">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-sm font-bold text-slate-800 tracking-tight">Dados do Evento</span>
          </div>
          <div className="w-40 h-[2px] bg-emerald-100 mx-8"></div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#C22973] text-white flex items-center justify-center shadow-lg shadow-pink-100 font-bold text-sm">
              2
            </div>
            <span className="text-sm font-bold text-slate-800 tracking-tight">Ingressos</span>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto space-y-6">
           {ingressos.map((ing, index) => (
             <div key={index} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 flex flex-col md:flex-row items-end gap-6 animate-in slide-in-from-bottom-4">
                <div className="flex-1 w-full space-y-2">
                  <label className="text-[10px] text-slate-400 font-black uppercase ml-1">Tipo de Ingresso</label>
                  <input 
                    value={ing.nome} 
                    onChange={(e) => handleChange(index, 'nome', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold" 
                    placeholder="Ex: VIP"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <label className="text-[10px] text-slate-400 font-black uppercase ml-1">Preço (R$)</label>
                  <input 
                    type="number" 
                    value={ing.preco} 
                    onChange={(e) => handleChange(index, 'preco', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold" 
                    placeholder="0,00"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <label className="text-[10px] text-slate-400 font-black uppercase ml-1">Qtd</label>
                  <input 
                    type="number" 
                    value={ing.quantidade} 
                    onChange={(e) => handleChange(index, 'quantidade', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold" 
                    placeholder="100"
                  />
                </div>
                {ingressos.length > 1 && (
                  <button onClick={() => removeIngresso(index)} className="p-4 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                )}
             </div>
           ))}

           <button 
             onClick={addIngresso}
             className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:border-[#C22973]/30 hover:text-[#C22973] transition-all bg-white/50"
           >
             + Adicionar outro lote
           </button>
        </div>
      </main>
    </div>
  );
}