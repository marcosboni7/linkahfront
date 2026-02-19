'use client';

import { useState, useEffect } from 'react'; // Adicionado useEffect
import { ChevronLeft, Plus, Trash2, CheckCircle2, Loader2, Info } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation'; // Adicionado useParams
import Swal from 'sweetalert2';

export default function CadastroIngressos() {
  const router = useRouter();
  const params = useParams(); // Forma mais segura de pegar params no Next.js moderno
  
  // Tentamos pegar o ID de duas formas para garantir
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      setId(params.id as string);
    }
  }, [params]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    // Verificação de segurança: se o ID não existir, nem tenta a requisição
    if (!id || id === 'undefined') {
      Swal.fire('Erro Crítico', 'ID do evento não encontrado na URL. Tente atualizar a página.', 'error');
      return;
    }

    const hasEmpty = ingressos.some(ing => !ing.nome || !ing.preco || !ing.quantidade);
    if (hasEmpty) {
      Swal.fire('Atenção', 'Preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const apiBaseUrl = 'https://linkah-api.onrender.com';
      
      const ingressosFormatados = ingressos.map(ing => ({
        nome: ing.nome,
        preco: parseFloat(ing.preco.toString()),
        quantidade: parseInt(ing.quantidade.toString())
      }));

      // ROTA CORRIGIDA: Inverti para bater com o seu salvarIngressos (id/ingressos)
      // Se o seu controller for buscarEventoPorId(id) e salvar ingressos, a rota costuma ser:
      const url = `${apiBaseUrl}/api/eventos/ingressos/${id}`;
      
      console.log("Tentando salvar para o ID:", id); // Log de depuração

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingressos: ingressosFormatados }),
      });

      if (response.ok) {
        Swal.fire({
          title: '🎉 Sucesso!',
          text: 'Seu evento foi publicado!',
          icon: 'success',
          confirmButtonColor: '#C22973',
        }).then(() => router.push('/dashboard/eventos'));
      } else {
        const erroMsg = await response.text();
        console.error("Erro do servidor:", erroMsg);
        Swal.fire('Erro', 'Não conseguimos salvar. O servidor disse: ' + erroMsg, 'error');
      }
    } catch (error) {
      Swal.fire('Erro', 'Falha na conexão com o servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ... (Mantenha o resto do seu JSX de retorno exatamente como está)
  // Certifique-se apenas de usar o handleFinalizar no botão de PUBLICAR EVENTO
  return (
    <div className="min-h-screen bg-[#FAFBFF]">
       <header className="border-b border-slate-100 px-6 md:px-10 py-5 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-full text-slate-400">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-slate-800 font-black text-lg tracking-tight uppercase">Configurar Ingressos</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">ID: {id}</p> 
          </div>
        </div>
        <button 
          onClick={handleFinalizar}
          disabled={loading || !id}
          className="bg-[#C22973] text-white px-10 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'PUBLICAR EVENTO'}
        </button>
      </header>
      
      <main className="max-w-[1100px] mx-auto p-10">
          {/* O resto do seu formulário que já funciona bem */}
          {/* Reutilize o seu código dos inputs aqui */}
          <div className="max-w-[850px] mx-auto space-y-6">
            {ingressos.map((ing, index) => (
               <div key={index} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-end gap-6">
                 <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Nome do Ingresso</label>
                    <input 
                      value={ing.nome} 
                      onChange={(e) => handleChange(index, 'nome', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold" 
                      placeholder="Ex: Lote 1"
                    />
                 </div>
                 <div className="w-full md:w-40 space-y-2">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Preço R$</label>
                    <input 
                      type="number" 
                      value={ing.preco} 
                      onChange={(e) => handleChange(index, 'preco', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold" 
                    />
                 </div>
                 <div className="w-full md:w-32 space-y-2">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Qtd</label>
                    <input 
                      type="number" 
                      value={ing.quantidade} 
                      onChange={(e) => handleChange(index, 'quantidade', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold" 
                    />
                 </div>
                 {ingressos.length > 1 && (
                    <button onClick={() => removeIngresso(index)} className="p-4 text-slate-300 hover:text-red-500">
                      <Trash2 size={20} />
                    </button>
                 )}
               </div>
            ))}
            <button onClick={addIngresso} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black uppercase text-[10px] flex items-center justify-center gap-2">
              <Plus size={16} /> Adicionar Novo Lote
            </button>
          </div>
      </main>
    </div>
  );
}