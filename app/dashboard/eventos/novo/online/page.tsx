'use client';

import { useState } from 'react';
import { ArrowRight, ChevronLeft, Camera, ChevronDown, Check } from 'lucide-react'; // ✅ Correto
import { useRouter } from 'next/navigation';

export default function NovoEventoOnline() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    produtor_email: typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '',
    nome: '',
    categoria: '',
    link_transmissao: '',
    descricao: '',
    data_inicio: '',
    hora_inicio: '',
    data_termino: '',
    hora_termino: '',
    imagem_capa: '',
    status: 'Ativo',
    tipo: 'Online'
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://linkah-api.onrender.com';

      const res = await fetch(`${apiBaseUrl}/api/eventos/novo-online`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Redireciona para o passo 2 (Ingressos) usando o ID retornado
        router.push(`/dashboard/eventos/novo/ingressos/${data.id}`);
      } else {
        alert(data.message || "Erro ao salvar evento.");
      }
    } catch (err) {
      console.error("Erro na conexão:", err);
      alert("Não foi possível conectar ao servidor da AWS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-[#C22973] transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-slate-800 font-black text-xl tracking-tight leading-none">Criar Evento Online</h1>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Linkah Dashboard</p>
          </div>
        </div>

        <button 
          onClick={() => handleSubmit()}
          disabled={loading}
          className="bg-[#C22973] text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#a12160] transition-all shadow-lg shadow-pink-100 flex items-center gap-2"
        >
          {loading ? 'Salvando...' : 'Salvar e Continuar'}
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* BARRA DE PROGRESSO */}
        <div className="flex justify-center items-center mb-16 relative">
          <div className="flex items-center gap-12 md:gap-24 z-10">
            <div className="flex items-center gap-3 bg-white pr-4 py-1">
              <div className="w-10 h-10 rounded-2xl bg-[#C22973] text-white flex items-center justify-center text-sm font-black shadow-lg shadow-pink-200 italic">1</div>
              <span className="text-xs font-black text-slate-700 tracking-tight">Dados do Evento</span>
            </div>
            
            <div className="flex items-center gap-3 opacity-30">
              <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center text-sm font-black">2</div>
              <span className="text-xs font-bold text-slate-400 tracking-tight">Ingressos</span>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-[2px] bg-slate-100 -z-0"></div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* COLUNA ESQUERDA */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white space-y-8">
              <div>
                <h2 className="text-[#C22973] font-black text-xl tracking-tight">Informações Principais</h2>
                <p className="text-slate-400 text-xs font-bold">Preencha os detalhes básicos da sua transmissão</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nome do evento</label>
                  <input required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none focus:border-[#C22973] focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300" placeholder="Ex: Masterclass de Marketing Digital" onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Link da Transmissão</label>
                  <input required className="w-full bg-slate-50 border border-indigo-50 p-5 rounded-3xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-indigo-600 placeholder:text-indigo-200" placeholder="https://zoom.us/j/..." onChange={(e) => setFormData({...formData, link_transmissao: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Categoria</label>
                    <div className="relative">
                      <select className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none appearance-none font-bold text-slate-700 cursor-pointer" onChange={(e) => setFormData({...formData, categoria: e.target.value})}>
                        <option value="">Selecione</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Mentoria">Mentoria</option>
                        <option value="Show">Show Online</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-pink-400 uppercase ml-2 tracking-widest">Visibilidade</label>
                    <div className="relative">
                      <select className="w-full bg-pink-50/30 border border-pink-100 p-5 rounded-3xl outline-none appearance-none font-bold text-[#C22973] cursor-pointer" onChange={(e) => setFormData({...formData, status: e.target.value})}>
                        <option value="Ativo">Publicado (Ativo)</option>
                        <option value="Rascunho">Privado (Rascunho)</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#C22973] pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Sobre o evento</label>
                  <textarea rows={5} className="w-full bg-slate-50 border border-slate-100 p-6 rounded-[2rem] outline-none focus:border-[#C22973] focus:bg-white transition-all font-medium text-slate-600 leading-relaxed" placeholder="Conte mais detalhes..." onChange={(e) => setFormData({...formData, descricao: e.target.value})} />
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-[2px] w-8 bg-[#C22973]"></div>
                  <h3 className="text-[#C22973] font-black text-xs uppercase tracking-widest italic">Cronograma</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Início em', field: 'data_inicio', type: 'date' },
                    { label: 'Às', field: 'hora_inicio', type: 'time' },
                    { label: 'Termina em', field: 'data_termino', type: 'date' },
                    { label: 'Às', field: 'hora_termino', type: 'time' },
                  ].map((item) => (
                    <div key={item.field} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">{item.label}</label>
                      <input 
                        type={item.type} 
                        className="w-full bg-transparent font-bold text-slate-700 outline-none text-xs" 
                        onChange={(e) => setFormData({...formData, [item.field]: e.target.value})} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white">
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-4 tracking-widest text-center">Capa do Evento</label>
              <div className="aspect-square bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-4 group hover:border-[#C22973] hover:bg-pink-50/30 transition-all cursor-pointer relative overflow-hidden">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera size={28} className="text-slate-300 group-hover:text-[#C22973]" />
                </div>
                <div className="text-center px-6">
                  <span className="text-[10px] font-black uppercase tracking-tighter block text-slate-400 group-hover:text-[#C22973]">Upload da Imagem</span>
                </div>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="bg-[#4B0082] p-8 rounded-[3rem] text-white space-y-4 shadow-xl shadow-indigo-100">
              <h4 className="font-black text-xs uppercase tracking-[0.2em]">Dica Linkah</h4>
              <p className="text-[11px] font-medium text-indigo-100 leading-relaxed">
                Eventos com boas descrições e capas vendem até <span className="text-pink-400 font-black">45% mais</span>.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}