'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Loader2, Info } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';

export default function CadastroIngressos() {
  const router = useRouter();
  const params = useParams();
  
  // Captura o ID da URL dinamicamente
  const eventoId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [ingressos, setIngressos] = useState([
    { nome: 'Ingresso Meia', preco: '', quantidade: '' }
  ]);

  const handleChange = (index: number, field: string, value: string) => {
    const novos = [...ingressos];
    novos[index] = { ...novos[index], [field]: value };
    setIngressos(novos);
  };

  const handleFinalizar = async () => {
    // VALIDAÇÃO CRÍTICA DO ID
    if (!eventoId || eventoId === 'undefined' || eventoId === 'novo') {
      Swal.fire('Erro', 'ID do evento inválido. Recomece o cadastro.', 'error');
      return;
    }

    setLoading(true);

    try {
      const ingressosFormatados = ingressos.map(ing => ({
        nome: String(ing.nome).trim(),
        preco: parseFloat(String(ing.preco).replace(',', '.')),
        quantidade: parseInt(String(ing.quantidade), 10)
      }));

      const response = await fetch(`https://linkah-api.onrender.com/api/eventos/${eventoId}/ingressos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingressos: ingressosFormatados }),
      });

      if (response.ok) {
        Swal.fire({
          title: '🎉 Tudo Pronto!',
          text: 'Evento e ingressos publicados!',
          icon: 'success',
          confirmButtonColor: '#C22973',
        }).then(() => router.push('/dashboard/eventos'));
      } else {
        Swal.fire('Erro', 'Erro ao salvar os ingressos.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro', 'Conexão falhou.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      <header className="border-b border-slate-100 px-10 py-5 flex justify-between items-center bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-full text-slate-400">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-slate-800 font-black text-lg uppercase">Configurar Ingressos</h1>
        </div>
        <button 
          onClick={handleFinalizar}
          disabled={loading}
          className="bg-[#C22973] text-white px-10 py-3 rounded-2xl font-black uppercase text-[11px] hover:bg-[#a62262] disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'PUBLICAR EVENTO'}
        </button>
      </header>

      <main className="max-w-[850px] mx-auto p-10 space-y-6">
        <div className="bg-pink-50 border border-pink-100 p-6 rounded-[2rem] text-[#C22973] text-sm flex gap-3 italic font-bold">
          <Info size={20} />
          Evento ID: {eventoId}
        </div>

        {ingressos.map((ing, index) => (
          <div key={index} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 w-full">
              <label className="text-[10px] text-slate-400 font-black uppercase">Nome do Lote</label>
              <input value={ing.nome} onChange={(e) => handleChange(index, 'nome', e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl outline-none" />
            </div>
            <div className="w-40">
              <label className="text-[10px] text-slate-400 font-black uppercase">Preço (R$)</label>
              <input type="number" value={ing.preco} onChange={(e) => handleChange(index, 'preco', e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl outline-none" />
            </div>
            <div className="w-32">
              <label className="text-[10px] text-slate-400 font-black uppercase">Qtd</label>
              <input type="number" value={ing.quantidade} onChange={(e) => handleChange(index, 'quantidade', e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl outline-none" />
            </div>
            <button onClick={() => setIngressos(ingressos.filter((_, i) => i !== index))} className="p-4 text-slate-300 hover:text-red-500"><Trash2 /></button>
          </div>
        ))}

        <button 
          onClick={() => setIngressos([...ingressos, { nome: '', preco: '', quantidade: '' }])}
          className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black uppercase text-[10px] hover:border-[#C22973] hover:text-[#C22973] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Adicionar outro lote
        </button>
      </main>
    </div>
  );
}