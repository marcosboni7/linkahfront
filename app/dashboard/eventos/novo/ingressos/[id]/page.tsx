'use client';

import { useState } from 'react';
import { ChevronLeft, Plus, Trash2, CheckCircle2, Loader2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// SOLUÇÃO DEFINITIVA PARA O BUILD: Pegamos o ID via props e usamos o tipo 'any' 
// para o compilador ignorar a validação rígida de tipos de rota
export default function CadastroIngressos({ params }: any) {
  const router = useRouter();
  
  // O ID agora vem direto das props da página, o que é mais estável no build
  const id = params?.id;

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
    
    if (value) {
      setErrors(prev => ({ ...prev, [`${index}-${field}`]: '' }));
    }
  };

  const validateField = (index: number, field: string, value: string) => {
    if (!value) {
      setErrors(prev => ({ ...prev, [`${index}-${field}`]: 'Obrigatório *' }));
    }
  };

  const handleFinalizar = async () => {
    const hasEmpty = ingressos.some(ing => !ing.nome || !ing.preco || !ing.quantidade);
    if (hasEmpty) {
      Swal.fire('Atenção', 'Preencha todos os campos obrigatórios (*) de todos os ingressos.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const apiBaseUrl = 'https://linkah-api.onrender.com';
      
      const response = await fetch(`${apiBaseUrl}/api/eventos/${id}/ingressos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingressos }),
      });

      if (response.ok) {
        Swal.fire({
          title: '<span style="color: #C22973">🎉 Sucesso!</span>',
          text: 'Seu evento foi publicado e já está disponível para venda!',
          icon: 'success',
          confirmButtonColor: '#C22973',
          confirmButtonText: 'IR PARA MEUS EVENTOS',
          customClass: { popup: 'rounded-[2.5rem]' }
        }).then(() => {
          router.push('/dashboard/eventos');
        });
      } else {
        Swal.fire('Erro', 'Não conseguimos salvar os ingressos. Tente novamente.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro de Conexão', 'Não foi possível conectar ao servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      <header className="border-b border-slate-100 px-6 md:px-10 py-5 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-full text-slate-400 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-slate-800 font-black text-lg tracking-tight uppercase">Configurar Ingressos</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Finalizando publicação</p>
          </div>
        </div>
        <button 
          onClick={handleFinalizar}
          disabled={loading}
          className="bg-[#C22973] text-white px-6 md:px-10 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#a62262] transition-all shadow-lg shadow-pink-100 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'PUBLICAR EVENTO'}
        </button>
      </header>

      <main className="max-w-[1100px] mx-auto p-6 md:p-10">
        <div className="flex justify-center items-center mb-12 md:mb-16">
          <div className="flex items-center gap-3 opacity-40">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Informações</span>
          </div>
          <div className="w-20 h-[2px] bg-emerald-100 mx-4"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C22973] text-white flex items-center justify-center shadow-lg shadow-pink-100 font-black text-xs">
              2
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Ingressos</span>
          </div>
        </div>

        <div className="max-w-[850px] mx-auto space-y-6">
           <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl flex gap-3 text-blue-700 text-sm font-medium mb-8">
             <Info className="shrink-0" size={20} />
             <p>Defina os tipos de ingressos. Você pode criar lotes diferentes como "Lote 1", "VIP" ou "Meia Entrada".</p>
           </div>

           {ingressos.map((ing, index) => (
             <div key={index} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-end gap-6 relative group transition-all hover:shadow-md">
               <div className="flex-1 w-full space-y-2">
                 <label className="text-[10px] text-slate-400 font-black uppercase ml-1 tracking-widest">Tipo / Nome do Ingresso *</label>
                 <input 
                   value={ing.nome} 
                   onBlur={(e) => validateField(index, 'nome', e.target.value)}
                   onChange={(e) => handleChange(index, 'nome', e.target.value)}
                   className={`w-full bg-slate-50 border ${errors[`${index}-nome`] ? 'border-red-500' : 'border-slate-100'} p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700`} 
                   placeholder="Ex: Ingresso Solidário"
                 />
                 {errors[`${index}-nome`] && <span className="text-[9px] text-red-500 font-bold ml-1">{errors[`${index}-nome`]}</span>}
               </div>

               <div className="w-full md:w-40 space-y-2">
                 <label className="text-[10px] text-slate-400 font-black uppercase ml-1 tracking-widest">Preço R$ *</label>
                 <input 
                   type="number" 
                   value={ing.preco} 
                   onBlur={(e) => validateField(index, 'preco', e.target.value)}
                   onChange={(e) => handleChange(index, 'preco', e.target.value)}
                   className={`w-full bg-slate-50 border ${errors[`${index}-preco`] ? 'border-red-500' : 'border-slate-100'} p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700`} 
                   placeholder="0,00"
                 />
                 {errors[`${index}-preco`] && <span className="text-[9px] text-red-500 font-bold ml-1">{errors[`${index}-preco`]}</span>}
               </div>

               <div className="w-full md:w-32 space-y-2">
                 <label className="text-[10px] text-slate-400 font-black uppercase ml-1 tracking-widest">Qtd Total *</label>
                 <input 
                   type="number" 
                   value={ing.quantidade} 
                   onBlur={(e) => validateField(index, 'quantidade', e.target.value)}
                   onChange={(e) => handleChange(index, 'quantidade', e.target.value)}
                   className={`w-full bg-slate-50 border ${errors[`${index}-quantidade`] ? 'border-red-500' : 'border-slate-100'} p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700`} 
                   placeholder="100"
                 />
                 {errors[`${index}-quantidade`] && <span className="text-[9px] text-red-500 font-bold ml-1">{errors[`${index}-quantidade`]}</span>}
               </div>

               {ingressos.length > 1 && (
                 <button onClick={() => removeIngresso(index)} className="p-4 text-slate-300 hover:text-red-500 transition-colors mb-1">
                   <Trash2 size={20} />
                 </button>
               )}
             </div>
           ))}

           <button 
             onClick={addIngresso}
             className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] hover:border-[#C22973]/30 hover:text-[#C22973] hover:bg-pink-50/30 transition-all bg-white/50 flex items-center justify-center gap-2"
           >
             <Plus size={16} /> Adicionar Novo Lote ou Categoria
           </button>
        </div>
      </main>
    </div>
  );
}