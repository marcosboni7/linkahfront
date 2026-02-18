'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function EditarEvento() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    local_nome: '',
    cidade: '',
    data_inicio: '',
    categoria: ''
  });

  const apiBaseUrl = 'https://linkah-api.onrender.com';

  // Carregar dados atuais do evento
  useEffect(() => {
    async function carregarEvento() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/eventos/${id}`);
        if (res.ok) {
          const data = await res.json();
          // Ajusta a data para o formato que o input tipo "date" entende (YYYY-MM-DD)
          const dataFormatada = data.data_inicio ? data.data_inicio.split('T')[0] : '';
          
          setFormData({
            nome: data.nome || '',
            local_nome: data.local_nome || '',
            cidade: data.cidade || '',
            data_inicio: dataFormatada,
            categoria: data.categoria || ''
          });
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarEvento();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/eventos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire('Sucesso!', 'Evento atualizado com sucesso.', 'success');
        router.push('/staff/painel'); // Volta para o painel
      } else {
        Swal.fire('Erro', 'Não foi possível salvar as alterações.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro', 'Falha na conexão com o servidor.', 'error');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#C22973]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-bold text-sm transition-all">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">Editar Evento</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Nome do Evento</label>
              <input 
                type="text" 
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#C22973]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Local</label>
                <input 
                  type="text" 
                  value={formData.local_nome}
                  onChange={(e) => setFormData({...formData, local_nome: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#C22973]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Cidade</label>
                <input 
                  type="text" 
                  value={formData.cidade}
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#C22973]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Data</label>
                <input 
                  type="date" 
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#C22973]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Categoria</label>
                <input 
                  type="text" 
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#C22973]"
                />
              </div>
            </div>

            <button 
              disabled={salvando}
              className="w-full bg-[#C22973] text-white font-black py-4 rounded-2xl mt-4 shadow-lg shadow-pink-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {salvando ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Salvar Alterações</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}