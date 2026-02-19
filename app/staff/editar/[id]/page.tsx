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
        // O timestamp ?t= é vital aqui para não ler o horário antigo do cache
        const res = await fetch(`${apiBaseUrl}/api/eventos/${id}?t=${Date.now()}`, {
          cache: 'no-store'
        });
        
        if (res.ok) {
          const data = await res.json();
          
          // Tratamento rigoroso para o input type="time"
          const dataISO = data.data_inicio ? data.data_inicio.substring(0, 10) : '';
          
          // Se vier "03:00:00", pegamos apenas "03:00"
          let horaISO = '';
          if (data.hora_inicio) {
            horaISO = data.hora_inicio.split(':').slice(0, 2).join(':');
          }

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
      console.log("Enviando horário:", formData.hora_inicio);

      const res = await fetch(`${apiBaseUrl}/api/eventos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Evento atualizado!',
          timer: 1000,
          showConfirmButton: false
        });
        
        // CORREÇÃO MESTRA: Em vez de push, usamos o reload do sistema para 
        // garantir que o banco de dados entregue o valor novo na próxima leitura.
        window.location.assign('/staff/painel'); 
      } else {
        Swal.fire('Erro', 'Falha ao salvar.', 'error');
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
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 mb-6 font-bold text-sm">
          <ArrowLeft size={16} /> VOLTAR
        </button>

        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-sm">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic mb-8">Editar Evento</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Nome</label>
              <input 
                type="text" required value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-bold text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Data</label>
                <input 
                  type="date" required value={formData.data_inicio}
                  onChange={e => setFormData({...formData, data_inicio: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Hora (Horário Local)</label>
                <input 
                  type="time" required value={formData.hora_inicio}
                  onChange={e => setFormData({...formData, hora_inicio: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-bold text-slate-700"
                />
              </div>
            </div>

            {/* Restante dos campos (Cidade, Estado, etc) */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Cidade</label>
                <input 
                  type="text" value={formData.cidade}
                  onChange={e => setFormData({...formData, cidade: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">UF</label>
                <input 
                  type="text" maxLength={2} value={formData.estado}
                  onChange={e => setFormData({...formData, estado: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-bold uppercase text-slate-700"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={salvando}
              className="w-full bg-[#C22973] text-white font-black py-5 rounded-2xl shadow-xl hover:opacity-90 flex items-center justify-center gap-3"
            >
              {salvando ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              SALVAR ALTERAÇÕES
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}