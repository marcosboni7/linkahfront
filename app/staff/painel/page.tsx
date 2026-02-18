'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Calendar, LogOut, 
  Search, MapPin, Clock, Trash2, Edit, Loader2 
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function PainelStaff() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      title: 'Tem certeza?',
      text: `Você vai excluir o evento: ${nome}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C22973',
      confirmButtonText: 'Sim, apagar!',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacao.isConfirmed) {
      try {
        const res = await fetch(`${apiBaseUrl}/api/eventos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          Swal.fire('Eliminado!', 'Evento removido com sucesso.', 'success');
          carregarEventos();
        }
      } catch (error) {
        Swal.fire('Erro', 'Falha na conexão.', 'error');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky h-screen top-0">
        <div className="p-6 text-xl font-black text-slate-800 italic tracking-tighter uppercase">
          Linkah <span className="text-[#C22973]">Staff</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-[#C22973] text-white shadow-lg shadow-pink-100">
            <LayoutDashboard size={18} /> Painel Geral
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all">
            <Calendar size={18} /> Eventos
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Procurar evento por nome ou ID..." className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:border-[#C22973] transition-all" />
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#C22973] flex items-center justify-center text-white text-[10px] font-black">AD</div>
             <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Administrador</span>
          </div>
        </header>

        <div className="p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestão de Eventos</h2>
              <p className="text-slate-500 text-sm font-medium">Controle total sobre os eventos publicados na Linkah.</p>
            </div>
            <button onClick={carregarEventos} className="text-[10px] font-black uppercase tracking-widest text-[#C22973] bg-pink-50 px-4 py-2 rounded-lg hover:bg-pink-100 transition-all">
              Atualizar Dados
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#C22973]" size={40} />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sincronizando Banco de Dados...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">Nome / ID</th>
                    <th className="px-8 py-5">Localização</th>
                    <th className="px-8 py-5">Data e Hora</th>
                    <th className="px-8 py-5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventos.map((evt) => {
                    // Tenta encontrar a data em vários campos possíveis
                    const rawData = evt.data || evt.data_evento || evt.date || evt.dia;
                    const formatarData = rawData ? new Date(rawData).toLocaleDateString('pt-BR') : 'Sem data';
                    
                    // Tenta encontrar a hora em vários campos possíveis
                    const formatarHora = evt.hora || evt.horario || evt.hora_evento || evt.time || evt.start_time || 'Sem hora';

                    return (
                      <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-[#C22973] transition-colors">{evt.nome}</p>
                          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Ref: {evt.id}</p>
                        </td>
                        
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin size={14} className="text-[#C22973] opacity-50" />
                            <span className="text-xs font-bold">
                              {evt.local || evt.localizacao || evt.cidade || evt.endereco || 'Local pendente'}
                            </span>
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar size={13} className="text-slate-400" />
                              <span className="text-xs font-bold">{formatarData}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#C22973]">
                              <Clock size={13} className="opacity-70" />
                              <span className="text-[10px] font-black uppercase tracking-tighter">
                                {formatarHora}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-5 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                                onClick={() => window.location.href = `/dashboard/eventos/novo?edit=${evt.id}`} 
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                                onClick={() => handleDeletar(evt.id, evt.nome)} 
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {!loading && eventos.length === 0 && (
              <div className="p-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                Nenhum evento encontrado no sistema.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}