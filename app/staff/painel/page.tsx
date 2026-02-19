'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, LogOut, 
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
      text: `Deseja apagar permanentemente: ${nome}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C22973',
      cancelButtonColor: '#cbd5e1',
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
    evt.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    evt.id?.toString().includes(filtro)
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky h-screen top-0">
        <div className="p-6 text-xl font-black text-slate-800 italic tracking-tighter uppercase">
          Linkah <span className="text-[#C22973]">Staff</span>
        </div>
        <nav className="flex-1 px-4 mt-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-[#C22973] text-white shadow-lg shadow-pink-100">
            <LayoutDashboard size={18} /> Painel Geral
          </button>
          <button onClick={() => window.location.href = '/staff/novo'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all">
            <Plus size={18} /> Novo Evento
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
           <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar evento..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs outline-none focus:border-[#C22973]"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
           </div>
        </header>

        <div className="p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Gestão de Eventos</h2>
              <p className="text-slate-500 text-sm font-medium">Controle total dos eventos da Linkah.</p>
            </div>
            <button 
              onClick={() => window.location.href = '/staff/novo'}
              className="bg-white border-2 border-[#C22973] text-[#C22973] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#C22973] hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
              <Plus size={16} /> Criar Evento
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#C22973]" size={40} />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Sincronizando...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">Informações</th>
                    <th className="px-8 py-5">Local</th>
                    <th className="px-8 py-5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventosFiltrados.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-[#C22973] transition-colors">{evt.nome}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">ID: #{evt.id}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <MapPin size={12} className="text-[#C22973]" />
                          {evt.cidade} - {evt.estado}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex justify-center gap-2">
                          {/* ROTA CORRIGIDA PARA STAFF/EDITAR */}
                          <button 
                            onClick={() => window.location.href = `/staff/editar/${evt.id}`} 
                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
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
        </div>
      </main>
    </div>
  );
}