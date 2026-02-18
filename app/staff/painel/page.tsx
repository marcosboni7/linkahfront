'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Ticket, Settings, LogOut, 
  Search, Bell, MoreHorizontal, ArrowUpRight, 
  Calendar, DollarSign, Trash2, Edit, Loader2, MapPin, Clock 
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function PainelStaff() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const apiBaseUrl = 'https://linkah-api.onrender.com';

  // 1. CARREGAR EVENTOS DO BACK-END
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

  // 2. FUNÇÃO PARA APAGAR EVENTO
  const handleDeletar = async (id: number, nome: string) => {
    const confirmacao = await Swal.fire({
      title: 'Tens a certeza?',
      text: `Vais excluir permanentemente o evento: ${nome}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C22973',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'Sim, apagar!',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacao.isConfirmed) {
      try {
        const res = await fetch(`${apiBaseUrl}/api/eventos/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          Swal.fire('Eliminado!', 'O evento foi removido.', 'success');
          carregarEventos(); 
        } else {
          Swal.fire('Erro', 'Não foi possível eliminar o evento.', 'error');
        }
      } catch (error) {
        Swal.fire('Erro', 'Falha na conexão com o servidor.', 'error');
      }
    }
  };

  // 3. FUNÇÃO PARA EDITAR
  const handleEditar = (id: number) => {
    // Redireciona para a tua página de edição existente
    window.location.href = `/dashboard/eventos/novo?edit=${id}`;
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky h-screen top-0">
        <div className="p-6">
          <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">
            Linkah <span className="text-[#C22973]">Staff</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-[#C22973] text-white shadow-lg shadow-pink-100">
            <LayoutDashboard size={18} /> Painel Geral
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all">
            <Calendar size={18} /> Eventos
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all">
            <Users size={18} /> Utilizadores
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Procurar eventos..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:border-[#C22973] transition-all" 
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-xs font-black text-slate-800 tracking-tight">Admin Linkah</p>
               <p className="text-[10px] text-slate-400 font-bold uppercase">Staff Master</p>
             </div>
             <div className="w-9 h-9 rounded-full bg-[#C22973] flex items-center justify-center text-white font-bold text-xs shadow-inner">AD</div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gerenciamento de Eventos</h2>
              <p className="text-slate-500 text-sm font-medium">Lista de todos os eventos ativos e passados no banco de dados.</p>
            </div>
            <button 
              onClick={carregarEventos}
              className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-slate-50 transition-all shadow-sm"
            >
              Atualizar Lista
            </button>
          </div>

          {/* TABELA */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#C22973]" size={40} />
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Sincronizando com Back-end...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] border-b border-slate-100">
                      <th className="px-8 py-5">Evento / ID</th>
                      <th className="px-8 py-5">Localização</th>
                      <th className="px-8 py-5">Data e Hora</th>
                      <th className="px-8 py-5 text-center">Gestão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eventos.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-[#C22973] transition-colors">{evt.nome}</p>
                          <p className="text-[10px] text-slate-400 font-bold tracking-wider">REF: {evt.id}</p>
                        </td>
                        
                        {/* LÓGICA DE LOCALIZAÇÃO */}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin size={14} className="text-slate-300" />
                            <span className="text-xs font-bold">
                              {evt.local || evt.localizacao || 'Não informado'}
                            </span>
                          </div>
                        </td>

                        {/* LÓGICA DE DATA E HORA */}
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar size={13} className="text-slate-300" />
                              <span className="text-xs font-bold">
                                {evt.data ? new Date(evt.data).toLocaleDateString('pt-BR') : '---'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[#C22973]">
                              <Clock size={13} className="opacity-60" />
                              <span className="text-[10px] font-black uppercase tracking-tighter">
                                {evt.hora || evt.horario || '---'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* AÇÕES */}
                        <td className="px-8 py-5">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleEditar(evt.id)}
                              className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                              title="Editar Evento"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeletar(evt.id, evt.nome)}
                              className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                              title="Excluir Evento"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && eventos.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="text-slate-200" size={32} />
                </div>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Base de dados vazia</p>
                <p className="text-slate-300 text-xs mt-1">Nenhum evento foi registado até ao momento.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}