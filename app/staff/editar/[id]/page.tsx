'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, MapPin, Calendar, Tag } from 'lucide-react';
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
    estado: '',
    categoria: '',
    data_inicio: '',
    preco_minimo: ''
  });

  const apiBaseUrl = 'https://linkah-api.onrender.com';

  useEffect(() => {
    async function carregarEvento() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/eventos/${id}`);
        if (res.ok) {
          const data = await res.json();
          // Formata a data para o input HTML (YYYY-MM-DD)
          const dataFormatada = data.data_inicio ? data.data_inicio.split('T')[0] : '';
          
          setFormData({
            nome: data.nome || '',
            local_nome: data.local_nome || '',
            cidade: data.cidade || '',
            estado: data.estado || '',
            categoria: data.categoria || '',
            data_inicio: dataFormatada,
            preco_minimo: data.preco_minimo || ''
          });
        }
      } catch (error) {
        console.error("Erro ao carregar evento:", error);
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
        await Swal.fire({
          title: 'Atualizado!',
          text: 'O evento foi alterado com sucesso.',
          icon: 'success',
          confirmButtonColor: '#C22973'
        });
        router.push('/staff/painel');
      } else {
        throw new Error();
      }
    } catch (error) {
      Swal.fire('Erro', 'Não foi possível salvar as alterações.', 'error');
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
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.push('/staff/painel')} 
          className="flex items-center gap-2 text-slate-500 hover:text-[#C22973] mb-6 font-bold text-sm transition-all"
        >
          <ArrowLeft size={16} /> VOLTAR AO PAINEL
        </button>

        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm">
          <div className="mb-8">
            <span className="text-[10px] font-black text-[#C22973] uppercase tracking-[0.2em]">Editor de Eventos</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Editar Registro</h2>
            <p className="text-slate-400 text-xs font-bold mt-1">ID DO EVENTO: #{id}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NOME */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">
                <Tag size={12} /> Nome do Evento
              </label>
              <input 
                type="text" 
                required
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-[#C22973] focus:ring-4 focus:ring-pink-50 transition-all"
              />
            </div>

            {/* LOCAL E CIDADE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">
                  <MapPin size={12} /> Local (Nome)
                </label>
                <input 
                  type="text" 
                  value={formData.local_nome}
                  onChange={e => setFormData({...formData, local_nome: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-[#C22973] transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 block">Cidade / UF</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Cidade"
                    value={formData.cidade}
                    onChange={e => setFormData({...formData, cidade: e.target.value})}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-[#C22973] transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="UF"
                    maxLength={2}
                    value={formData.estado}
                    onChange={e => setFormData({...formData, estado: e.target.value})}
                    className="w-16 bg-slate-50 border border-slate-200 rounded-2xl py-4 text-center text-sm font-bold outline-none focus:border-[#C22973] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* DATA E CATEGORIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">
                  <Calendar size={12} /> Data do Evento
                </label>
                <input 
                  type="date" 
                  value={formData.data_inicio}
                  onChange={e => setFormData({...formData, data_inicio: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-[#C22973] transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 block">Categoria</label>
                <input 
                  type="text" 
                  value={formData.categoria}
                  onChange={e => setFormData({...formData, categoria: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-[#C22973] transition-all"
                />
              </div>
            </div>

            <button 
              disabled={salvando}
              className="w-full bg-[#C22973] text-white font-black py-5 rounded-2xl shadow-xl shadow-pink-100 hover:bg-[#a61d5f] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
            >
              {salvando ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <><Save size={20} /> ATUALIZAR EVENTO</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}