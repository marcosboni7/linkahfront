'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Calendar, MapPin, Type, AlignLeft } from 'lucide-react';
import Swal from 'sweetalert2';

export default function NovoEvento() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estado do formulário
  const [form, setForm] = useState({
    nome: '',
    data: '',
    local: '',
    cidade: '',
    estado: '',
    descricao: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Envia os dados para a API
      const response = await fetch('https://linkah-api.onrender.com/api/eventos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. BUSCA O ID QUE O BANCO GEROU (Pode ser .id ou ._id)
        // Adicionamos várias verificações para garantir que o ID seja capturado
        const eventoId = data._id || data.id || (data.evento && (data.evento._id || data.evento.id));

        if (eventoId) {
          console.log("Sucesso! ID gerado:", eventoId);
          // 3. REDIRECIONA PARA O ID REAL (Não mais para 'undefined')
          router.push(`/dashboard/eventos/${eventoId}/ingressos`);
        } else {
          console.error("Resposta da API sem ID:", data);
          Swal.fire('Erro no ID', 'O evento foi criado, mas a API não retornou o código de identificação.', 'error');
        }
      } else {
        Swal.fire('Erro', data.message || 'Falha ao criar o evento.', 'error');
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      Swal.fire('Erro de Conexão', 'Não foi possível conectar ao servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase mb-8 hover:text-[#C22973] transition-colors">
          <ChevronLeft size={16} /> Voltar ao Painel
        </button>

        <h1 className="text-3xl font-black text-slate-800 mb-8 uppercase italic tracking-tighter">
          Criar Novo <span className="text-[#C22973]">Evento</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome do Evento *</label>
              <div className="relative">
                <Type className="absolute left-4 top-4 text-slate-300" size={18} />
                <input required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700" placeholder="Ex: Baile da Linkah" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Data do Evento *</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-4 text-slate-300" size={18} />
                <input type="date" required value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Local / Arena *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-slate-300" size={18} />
                <input required value={form.local} onChange={e => setForm({...form, local: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700" placeholder="Ex: Estádio Municipal" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cidade *</label>
              <input required value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700" placeholder="Ex: São Paulo" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Estado (UF) *</label>
              <input required maxLength={2} value={form.estado} onChange={e => setForm({...form, estado: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700" placeholder="Ex: SP" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Descrição do Evento</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-4 text-slate-300" size={18} />
              <textarea rows={3} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] font-bold text-slate-700" placeholder="Conte mais sobre o evento..." />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#C22973] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#a62262] transition-all flex items-center justify-center gap-3 shadow-lg shadow-pink-100 active:scale-[0.98]">
            {loading ? <Loader2 className="animate-spin" /> : 'Próximo Passo: Definir Ingressos'}
          </button>
        </form>
      </div>
    </div>
  );
}