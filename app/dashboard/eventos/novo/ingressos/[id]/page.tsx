'use client';

import { useState } from 'react';
import { ChevronLeft, Plus, Trash2, CheckCircle2, Loader2, Info, Globe } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

// Mapeamento de símbolos para facilitar a renderização
const currencyMap: Record<string, string> = {
  'BRL': 'R$',
  'EUR': '€',
  'USD': '$'
};

export default function CadastroIngressos() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Adicionado o campo 'moeda' no estado inicial
  const [ingressos, setIngressos] = useState([
    { nome: '', preco: '', quantidade: '', tipo: 'Pago', moeda: 'BRL' }
  ]);

  const addIngresso = () => setIngressos([...ingressos, { nome: '', preco: '', quantidade: '', tipo: 'Pago', moeda: 'BRL' }]);
  
  const removeIngresso = (index: number) => {
    if (ingressos.length > 1) setIngressos(ingressos.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const novos = [...ingressos];
    novos[index] = { ...novos[index], [field]: value };
    setIngressos(novos);
    if (value) setErrors(prev => ({ ...prev, [`${index}-${field}`]: '' }));
  };

  const validateField = (index: number, field: string, value: string) => {
    if (!value) setErrors(prev => ({ ...prev, [`${index}-${field}`]: t.fieldRequired || 'Campo obrigatório' }));
  };

  const handleFinalizar = async () => {
    const hasEmpty = ingressos.some(ing => !ing.nome || !ing.preco || !ing.quantidade);
    
    if (hasEmpty) {
      Swal.fire({
        title: t.errorIncomplete,
        text: t.errorIncompleteText,
        icon: 'warning',
        confirmButtonColor: '#C22973',
        customClass: { popup: 'rounded-[2rem]' }
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('@Linkah:Token');
      const response = await fetch(`${API_URL}/api/eventos/${id}/ingressos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ingressos }), // Agora envia a moeda junto
      });

      if (response.ok) {
        Swal.fire({
          title: `<span style="color: #C22973; font-family: sans-serif; font-weight: 900; font-style: italic;">${t.publishSuccess}</span>`,
          text: t.publishSuccessText,
          icon: 'success',
          confirmButtonColor: '#C22973',
          confirmButtonText: t.btnViewEvents,
          customClass: { popup: 'rounded-[3rem]' }
        }).then((result) => {
          if (result.isConfirmed) router.push('/dashboard/eventos');
        });
      }
    } catch (error) {
      Swal.fire('Error', 'AWS Connection fail', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] font-sans antialiased">
      <header className="border-b border-slate-100 px-6 md:px-10 py-5 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-full text-slate-400 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-slate-800 font-black text-lg tracking-tight uppercase italic">{t.setupTickets}</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">{t.finalStep}</p>
          </div>
        </div>
        <button 
          onClick={handleFinalizar}
          disabled={loading}
          className="bg-[#C22973] text-white px-6 md:px-10 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#a62262] transition-all shadow-xl shadow-pink-100 disabled:opacity-50 flex items-center gap-2 active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : t.btnPublish}
        </button>
      </header>

      <main className="max-w-[1100px] mx-auto p-6 md:p-10">
        {/* PROGRESS BAR */}
        <div className="flex justify-center items-center mb-12 md:mb-16">
          <div className="flex items-center gap-3 opacity-40">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest italic">{t.stepInfo}</span>
          </div>
          <div className="w-20 h-[2px] bg-emerald-100 mx-4"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C22973] text-white flex items-center justify-center shadow-lg shadow-pink-200 font-black text-xs italic">2</div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest italic">{t.stepTickets}</span>
          </div>
        </div>

        <div className="max-w-[900px] mx-auto space-y-6">
           <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex gap-4 text-blue-700 text-sm font-bold mb-8 items-start">
             <Info className="shrink-0 mt-0.5" size={20} />
             <p className="leading-relaxed uppercase text-[10px] tracking-wider">{t.ticketAlert}</p>
           </div>

           {ingressos.map((ing, index) => (
             <div key={index} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-end gap-6 relative group animate-in fade-in slide-in-from-bottom-4 transition-all">
               
               {/* NOME DO INGRESSO */}
               <div className="flex-1 w-full space-y-2">
                 <label className="text-[10px] text-slate-400 font-black uppercase ml-2 tracking-widest italic">{t.labelTicketName}</label>
                 <input 
                   value={ing.nome} 
                   onBlur={(e) => validateField(index, 'nome', e.target.value)}
                   onChange={(e) => handleChange(index, 'nome', e.target.value)}
                   className={`w-full bg-slate-50 border ${errors[`${index}-nome`] ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100'} p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700 transition-all placeholder:text-slate-200`} 
                   placeholder={t.placeholderTicket}
                 />
                 {errors[`${index}-nome`] && <span className="text-[9px] text-red-500 font-black uppercase italic ml-2">{errors[`${index}-nome`]}</span>}
               </div>

               {/* SELETOR DE MOEDA + PREÇO */}
               <div className="w-full md:w-56 space-y-2">
                 <label className="text-[10px] text-slate-400 font-black uppercase ml-2 tracking-widest italic">Moeda & Preço</label>
                 <div className="flex gap-2">
                    {/* Select de Moeda */}
                    <select 
                      value={ing.moeda}
                      onChange={(e) => handleChange(index, 'moeda', e.target.value)}
                      className="bg-slate-100 border-none p-4 rounded-2xl font-black text-[10px] text-slate-600 outline-none focus:ring-2 focus:ring-pink-100 transition-all cursor-pointer"
                    >
                      <option value="BRL">BRL (R$)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                    </select>

                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">
                        {currencyMap[ing.moeda]}
                      </span>
                      <input 
                        type="number" 
                        value={ing.preco} 
                        onBlur={(e) => validateField(index, 'preco', e.target.value)}
                        onChange={(e) => handleChange(index, 'preco', e.target.value)}
                        className={`w-full pl-10 pr-4 py-4 bg-slate-50 border ${errors[`${index}-preco`] ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100'} rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700 transition-all placeholder:text-slate-200`} 
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                 </div>
                 {errors[`${index}-preco`] && <span className="text-[9px] text-red-500 font-black uppercase italic ml-2">{errors[`${index}-preco`]}</span>}
               </div>

               {/* QUANTIDADE / ESTOQUE */}
               <div className="w-full md:w-32 space-y-2">
                 <label className="text-[10px] text-slate-400 font-black uppercase ml-2 tracking-widest italic">{t.labelStock}</label>
                 <input 
                   type="number" 
                   value={ing.quantidade} 
                   onBlur={(e) => validateField(index, 'quantidade', e.target.value)}
                   onChange={(e) => handleChange(index, 'quantidade', e.target.value)}
                   className={`w-full bg-slate-50 border ${errors[`${index}-quantidade`] ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100'} p-4 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700 transition-all placeholder:text-slate-200`} 
                   placeholder="100"
                 />
                 {errors[`${index}-quantidade`] && <span className="text-[9px] text-red-500 font-black uppercase italic ml-2">{errors[`${index}-quantidade`]}</span>}
               </div>

               {/* BOTÃO REMOVER */}
               {ingressos.length > 1 && (
                 <button onClick={() => removeIngresso(index)} className="p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all mb-1 active:scale-90">
                   <Trash2 size={20} />
                 </button>
               )}
             </div>
           ))}

           <button 
             onClick={addIngresso}
             className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] hover:border-[#C22973]/40 hover:text-[#C22973] hover:bg-pink-50/30 transition-all bg-white/50 flex items-center justify-center gap-3"
           >
             <Plus size={18} /> {t.btnAddCategory || 'Adicionar Categoria'}
           </button>
        </div>
      </main>

      <footer className="mt-20 py-10 text-center border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Linkah AWS Producer Cloud &copy; 2026</p>
      </footer>
    </div>
  );
}