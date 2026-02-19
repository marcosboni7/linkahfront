'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function CadastroIngressos() {
  const router = useRouter();
  const params = useParams();
  const idDoEvento = params?.id as string; // Pega o ID da URL

  const [loading, setLoading] = useState(false);
  const [ingressos, setIngressos] = useState([{ nome: 'Lote 1', preco: '', quantidade: '' }]);

  const handleFinalizar = async () => {
    // VERIFICAÇÃO QUE ESTAVA DANDO ERRO NA IMAGEM
    if (!idDoEvento || idDoEvento === 'undefined' || idDoEvento === 'novo') {
      Swal.fire('Erro de Identificação', 'ID do evento não identificado. Tente atualizar a página.', 'error');
      return;
    }

    setLoading(true);
    try {
      const ingressosFormatados = ingressos.map(ing => ({
        nome: ing.nome,
        preco: parseFloat(String(ing.preco)),
        quantidade: parseInt(String(ing.quantidade))
      }));

      const response = await fetch(`https://linkah-api.onrender.com/api/eventos/${idDoEvento}/ingressos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingressos: ingressosFormatados }),
      });

      if (response.ok) {
        Swal.fire('Sucesso!', 'Evento publicado!', 'success').then(() => router.push('/dashboard/eventos'));
      } else {
        Swal.fire('Erro', 'Erro ao salvar ingressos.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro', 'Falha na conexão.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] p-10">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <button onClick={() => router.back()} className="text-slate-400 flex items-center gap-2"><ChevronLeft /> Voltar</button>
          <button onClick={handleFinalizar} disabled={loading} className="bg-[#C22973] text-white px-8 py-3 rounded-2xl font-black uppercase">
            {loading ? <Loader2 className="animate-spin" /> : 'Finalizar Publicação'}
          </button>
        </header>

        <div className="space-y-4">
          {ingressos.map((ing, index) => (
            <div key={index} className="bg-white p-6 rounded-[2rem] border flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Nome do Ingresso</label>
                <input value={ing.nome} onChange={e => {
                  const n = [...ingressos]; n[index].nome = e.target.value; setIngressos(n);
                }} className="w-full p-3 bg-slate-50 rounded-xl" />
              </div>
              <div className="w-32">
                <label className="text-[10px] font-black uppercase text-slate-400">Preço</label>
                <input type="number" value={ing.preco} onChange={e => {
                  const n = [...ingressos]; n[index].preco = e.target.value; setIngressos(n);
                }} className="w-full p-3 bg-slate-50 rounded-xl" />
              </div>
              <button onClick={() => setIngressos(ingressos.filter((_, i) => i !== index))} className="p-3 text-red-400"><Trash2 /></button>
            </div>
          ))}
          <button onClick={() => setIngressos([...ingressos, { nome: '', preco: '', quantidade: '' }])} className="w-full py-4 border-2 border-dashed rounded-[2rem] text-slate-400 font-bold">+ Adicionar Lote</button>
        </div>
      </div>
    </div>
  );
}