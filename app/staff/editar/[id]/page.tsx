'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Calendar, LogOut, 
  Search, MapPin, Clock, Trash2, Edit, Loader2, Plus
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function PainelStaff() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const apiBaseUrl = 'https://linkah-api.onrender.com';

  const carregarEventos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/eventos`);
      if (res.ok) {
        const data = await res.json();
        setEventos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  const handleDeletar = async (id: number, nome: string) => {
    const confirmacao = await Swal.fire({
      title: 'Excluir evento?',
      text: `Deseja apagar: ${nome}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C22973',
      confirmButtonText: 'Sim, apagar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacao.isConfirmed) {
      try {
        const res = await fetch(`${apiBaseUrl}/api/eventos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          carregarEventos();
          Swal.fire('Sucesso', 'Evento removido!', 'success');
        }
      } catch (e) {
        Swal.fire('Erro', 'Falha na conexão', 'error');
      }
    }
  };

  const eventosFiltrados = eventos.filter(evt => 
    evt.nome?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky h-screen top-0">
        <div className="p-6 text-xl font-black text-slate-800 italic tracking-tighter uppercase">
          Linkah <span className="text-[#C22973]">Staff</span>
        </div>
        <nav className="flex-1 px-4 mt-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-[#C22973] text-white shadow-lg shadow-pink-100">
            <LayoutDashboard size={18} /> Painel Geral
          </button>
          {/* CORREÇÃO: Link para criar novo evento dentro de staff */}
          <button onClick={() => window.location.href = '/staff/novo'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all">
            <Plus size={18} /> Novo Evento
          </button>
        </nav>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 flex flex-col p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestão de Eventos</h2>
            <p className="text-slate-500 text-sm">Visualize ou edite eventos da plataforma.</p>
          </div>
          {/* CORREÇÃO: Botão superior também corrigido */}
          <button 
            onClick={() => window.location.href = '/staff/novo'}
            className="bg-[#C22973] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-pink-100 flex items-center gap-2"
          >
            <Plus size={16} /> Criar Evento
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-24 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-[#C22973]" size={40} />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Informações</th>
                  <th className="px-8 py-5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eventosFiltrados.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-800">{evt.nome}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">ID: #{evt.id}</p>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center gap-2">
                        {/* CORREÇÃO CRUCIAL: Link de edição para a pasta staff/editar */}
                        <button 
                          onClick={() => window.location.href = `/staff/editar/${evt.id}`} 
                          className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeletar(evt.id, evt.nome)} 
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}