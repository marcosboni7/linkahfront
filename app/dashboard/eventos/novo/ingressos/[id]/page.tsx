'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, CheckCircle2, Loader2, Info } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';

export default function CadastroIngressos() {
  const router = useRouter();
  const params = useParams();
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [ingressos, setIngressos] = useState([
    { nome: 'Ingresso Meia', preco: '', quantidade: '' }
  ]);

  useEffect(() => {
    if (params?.id) {
      setId(params.id as string);
    }
  }, [params]);

  const handleChange = (index: number, field: string, value: string) => {
    const novos = [...ingressos];
    novos[index] = { ...novos[index], [field]: value };
    setIngressos(novos);
  };

  const handleFinalizar = async () => {
    // 1. Validação de ID
    if (!id || id === 'undefined') {
      Swal.fire('Erro', 'ID do evento não identificado. Tente atualizar a página.', 'error');
      return;
    }

    // 2. Validação de Campos
    const hasEmpty = ingressos.some(ing => !ing.nome || ing.preco === '' || ing.quantidade === '');
    if (hasEmpty) {
      Swal.fire('Atenção', 'Preencha todos os campos de todos os lotes.', 'warning');
      return;
    }

    setLoading(true);

    try {
      // 3. Formatação rigorosa para o Banco de Dados (Garante que preco e qtd sejam números)
      const ingressosFormatados = ingressos.map(ing => ({
        nome: String(ing.nome).trim(),
        preco: parseFloat(String(ing.preco).replace(',', '.')),
        quantidade: parseInt(String(ing.quantidade), 10)
      }));

      const apiBaseUrl = 'https://linkah-api.onrender.com';
      
      // ROTA CORRIGIDA: Invertido para bater com router.post('/:id/ingressos' no Back-end
      const url = `${apiBaseUrl}/api/eventos/${id}/ingressos`;

      console.log("Enviando para:", url);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingressos: ingressosFormatados }),
      });

      // 4. Tratamento de Resposta
      if (response.ok) {
        Swal.fire({
          title: '<span style="color: #C22973">🎉 Sucesso!</span>',
          text: 'Seu evento e ingressos foram publicados com sucesso!',
          icon: 'success',
          confirmButtonColor: '#C22973',
          confirmButtonText: 'IR PARA MEUS EVENTOS',
          customClass: { popup: 'rounded-[2.5rem]' }
        }).then(() => {
          router.push('/dashboard/eventos');
        });
      } else {
        const textoErro = await response.text();
        console.error("Erro do servidor:", textoErro);
        
        Swal.fire({
          title: 'Atenção',
          text: 'Houve um problema ao salvar os ingressos. Verifique se o evento aparece na sua lista.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ver Meus Eventos',
          cancelButtonText: 'Tentar Novamente'
        }).then((result) => {
          if (result.isConfirmed) router.push('/dashboard/eventos');
        });
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      Swal.fire('Erro de Conexão', 'Não foi possível falar com o servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      <header className="border-b border-slate-100 px-10 py-5 flex justify-between items-center bg-white/90 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-full transition-colors text-slate-400">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-slate-800 font-black text-lg tracking-tight uppercase">Publicar Ingressos</h1>
        </div>
        <button 
          onClick={handleFinalizar}
          disabled={loading || !id}
          className="bg-[#C22973] text-white px-10 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#a62262] transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-pink-100"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'FINALIZAR E PUBLICAR'}
        </button>
      </header>

      <main className="max-w-[850px] mx-auto p-10 space-y-6">
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex gap-4 text-blue-700 text-sm">
          <Info className="shrink-0" size={20} />
          <p>
            Defina os valores e quantidades. 
            {id ? <span> O ID do evento é: <strong>{id}</strong></span> : " Carregando identificador..."}
          </p>
        </div>

        {ingressos.map((ing, index) => (
          <div key={index} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-end gap-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex-1 w-full space-y-2">
              <label className="text-[10px] text-slate-400 font-black uppercase ml-1">Nome do Lote *</label>
              <input 
                value={ing.nome} 
                onChange={(e) => handleChange(index, 'nome', e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700" 
                placeholder="Ex: Lote 1 / Meia Entrada"
              />
            </div>
            <div className="w-full md:w-40 space-y-2">
              <label className="text-[10px] text-slate-400 font-black uppercase ml-1">Preço (R$) *</label>
              <input 
                type="number" 
                step="0.01"
                value={ing.preco} 
                onChange={(e) => handleChange(index, 'preco', e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700" 
                placeholder="0.00"
              />
            </div>
            <div className="w-full md:w-32 space-y-2">
              <label className="text-[10px] text-slate-400 font-black uppercase ml-1">Qtd *</label>
              <input 
                type="number" 
                value={ing.quantidade} 
                onChange={(e) => handleChange(index, 'quantidade', e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700" 
                placeholder="100"
              />
            </div>
            {ingressos.length > 1 && (
              <button 
                onClick={() => setIngressos(ingressos.filter((_, i) => i !== index))} 
                className="p-4 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}

        <button 
          onClick={() => setIngressos([...ingressos, { nome: '', preco: '', quantidade: '' }])}
          className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-white hover:border-[#C22973] hover:text-[#C22973] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Adicionar outro tipo de ingresso
        </button>
      </main>
    </div>
  );
}