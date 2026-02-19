'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Loader2, Info } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';

export default function CadastroIngressos() {
  const router = useRouter();
  const params = useParams();
  
  // 1. Pegamos o ID diretamente dos params do Next.js
  const idDoEvento = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [ingressos, setIngressos] = useState([
    { nome: 'Ingresso Meia', preco: '', quantidade: '' }
  ]);

  // Pequeno log para você ver no console se o ID está chegando
  useEffect(() => {
    console.log("ID do Evento capturado da URL:", idDoEvento);
  }, [idDoEvento]);

  const handleChange = (index: number, field: string, value: string) => {
    const novos = [...ingressos];
    novos[index] = { ...novos[index], [field]: value };
    setIngressos(novos);
  };

  const handleFinalizar = async () => {
    // 2. Validação de ID Robusta
    if (!idDoEvento || idDoEvento === 'undefined' || idDoEvento === '[id]') {
      Swal.fire({
        title: 'ID ausente',
        text: 'Não conseguimos identificar a qual evento esses ingressos pertencem. Volte e tente abrir o evento novamente.',
        icon: 'error',
        confirmButtonColor: '#C22973'
      });
      return;
    }

    const hasEmpty = ingressos.some(ing => !ing.nome || ing.preco === '' || ing.quantidade === '');
    if (hasEmpty) {
      Swal.fire('Atenção', 'Preencha todos os campos de todos os lotes.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const ingressosFormatados = ingressos.map(ing => ({
        nome: String(ing.nome).trim(),
        preco: parseFloat(String(ing.preco).replace(',', '.')),
        quantidade: parseInt(String(ing.quantidade), 10)
      }));

      const apiBaseUrl = 'https://linkah-api.onrender.com';
      const url = `${apiBaseUrl}/api/eventos/${idDoEvento}/ingressos`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingressos: ingressosFormatados }),
      });

      if (response.ok) {
        Swal.fire({
          title: '🎉 Sucesso!',
          text: 'Ingressos publicados com sucesso!',
          icon: 'success',
          confirmButtonColor: '#C22973',
        }).then(() => router.push('/dashboard/eventos'));
      } else {
        Swal.fire('Erro', 'O servidor recusou os dados. Verifique os valores.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro de Conexão', 'Não foi possível falar com o servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      {/* ... (restante do seu layout permanece igual) ... */}
      <header className="border-b border-slate-100 px-10 py-5 flex justify-between items-center bg-white/90 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-full transition-colors text-slate-400">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-slate-800 font-black text-lg tracking-tight uppercase">Publicar Ingressos</h1>
        </div>
        <button 
          onClick={handleFinalizar}
          disabled={loading || !idDoEvento}
          className="bg-[#C22973] text-white px-10 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#a62262] transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-pink-100"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'FINALIZAR E PUBLICAR'}
        </button>
      </header>

      <main className="max-w-[850px] mx-auto p-10 space-y-6">
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex gap-4 text-blue-700 text-sm">
          <Info className="shrink-0" size={20} />
          <p>
             Evento: <strong>{idDoEvento || "Identificando..."}</strong>
          </p>
        </div>
        
        {/* Renderização dos inputs dos ingressos (igual ao seu) */}
        {ingressos.map((ing, index) => (
           <div key={index} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-end gap-6">
             {/* Seus inputs aqui... */}
             <input 
                value={ing.nome} 
                onChange={(e) => handleChange(index, 'nome', e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700" 
             />
             {/* ... */}
           </div>
        ))}
      </main>
    </div>
  );
}