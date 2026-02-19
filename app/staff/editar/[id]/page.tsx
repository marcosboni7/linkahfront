'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, MapPin, Tag, Calendar, Clock } from 'lucide-react';
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
    hora_inicio: ''  
  });

  const apiBaseUrl = 'https://linkah-api.onrender.com';

  useEffect(() => {
    async function carregarEvento() {
      try {
        setLoading(true);
        // O timestamp evita cache de dados antigos
        const res = await fetch(`${apiBaseUrl}/api/eventos/${id}?t=${Date.now()}`);
        
        if (res.status === 401 || res.status === 403) {
           console.error("Sessão expirada");
           return; 
        }

        if (res.ok) {
          const data = await res.json();
          
          // Formata data e hora para os inputs HTML
          const dataISO = data.data_inicio ? data.data_inicio.substring(0, 10) : '';
          const horaISO = data.hora_inicio ? data.hora_inicio.substring(0, 5) : '';

          setFormData({
            nome: data.nome || '',
            local_nome: data.local_nome || '',
            cidade: data.cidade || '',
            estado: data.estado || '',
            categoria: data.categoria || '',
            data_inicio: dataISO,
            hora_inicio: horaISO
          });
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) carregarEvento();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/eventos/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          // Se o seu backend exige token, verifique se ele está sendo passado aqui:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Evento atualizado com sucesso!',
          confirmButtonColor: '#C22973',
          timer: 1500 // Fecha rápido para não dar tempo de bugar o estado
        });
        
        // Em vez de refresh pesado, vamos apenas empurrar para o painel
        window.location.href = '/staff/painel'; 
      } else {
        const errorData = await res.json();
        Swal.fire('Erro', errorData.message || 'Falha ao salvar.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro', 'Erro de conexão.', 'error');
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
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-slate-500 mb-6 font-bold text-sm hover:text-[#C22973] transition-colors"
        >
          <ArrowLeft size={16} /> VOLTAR
        </button>

        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-sm">
          <div className="mb-8">
            <span className="text-[10px] font-black text-[#C22973] uppercase tracking-[0.2em]">Editor</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none mt-1">Editar Evento</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">
                <Tag size={12} /> Nome do Evento
              </label>
              <input 
                type="text" required value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-[#C22973] text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">
                  <Calendar size={12} /> Data
                </label>
                <input 
                  type="date" required value={formData.data_inicio}
                  onChange={e => setFormData({...formData, data_inicio: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-[#C22973] text-slate-700"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">
                  <Clock size={12} /> Hora
                </label>
                <input 
                  type="time" required value={formData.hora_inicio}
                  onChange={e => setFormData({...formData, hora_inicio: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-[#C22973] text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">
                <MapPin size={12} /> Local
              </label>
              <input 
                type="text" value={formData.local_nome}
                onChange={e => setFormData({...formData, local_nome: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-[#C22973] text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 block">Cidade</label>
                <input 
                  type="text" value={formData.cidade}
                  onChange={e => setFormData({...formData, cidade: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-[#C22973] text-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 block">UF</label>
                <input 
                  type="text" maxLength={2} value={formData.estado}
                  onChange={e => setFormData({...formData, estado: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-[#C22973] uppercase text-slate-700"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={salvando}
              className="w-full bg-[#C22973] text-white font-black py-5 rounded-2xl shadow-xl hover:bg-[#a61d5f] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
            >
              {salvando ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {salvando ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}