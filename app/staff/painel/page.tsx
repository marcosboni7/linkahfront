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
        await fetch(`${apiBaseUrl}/api/eventos/${id}`, { method: 'DELETE' });
        carregarEventos();
        Swal.fire('Sucesso', 'Evento removido!', 'success');
      } catch (e) {
        Swal.fire('Erro', 'Falha ao deletar', 'error');
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
        <nav className="flex-1 px-4 mt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-[#C22973] text-white shadow-lg shadow-pink-100">
            <LayoutDashboard size={18} /> Painel Geral
          </button>
        </nav>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase text-slate-400">Sistema Online</span>
           </div>
           <div className="w-8 h-8 rounded-full bg-[#C22973] flex items-center justify-center text-white text-[10px] font-black">AD</div>
        </header>

        <div className="p-8">
          <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">Gestão de Eventos</h2>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#C22973]" size={40} />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sincronizando...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">Evento</th>
                    <th className="px-8 py-5">Local / Cidade</th>
                    <th className="px-8 py-5">Data e Hora</th>
                    <th className="px-8 py-5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventos.map((evt) => {
                    // --- AJUSTE DOS DADOS REAIS ---
                    const dataISO = evt.data_inicio; // "2026-02-17T00:00:00.000Z"
                    let dataFormatada = '---';
                    let horaFormatada = '---';

                    if (dataISO) {
                      const d = new Date(dataISO);
                      dataFormatada = d.toLocaleDateString('pt-BR');
                      // Extrai a hora (se for 00:00 no banco, vai aparecer 00:00)
                      horaFormatada = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    }

                    return (
                      <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-[#C22973] transition-colors">{evt.nome}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: #{evt.id} • {evt.categoria}</p>
                        </td>
                        
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                              <MapPin size={12} className="text-[#C22973]" />
                              {evt.local_nome || 'Local não informado'}
                            </div>
                            <span className="text-[10px] text-slate-400 ml-5 font-medium">{evt.cidade}, {evt.estado}</span>
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                              <Calendar size={13} className="text-slate-400" />
                              {dataFormatada}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-[#C22973] uppercase">
                              <Clock size={13} />
                              {horaFormatada}
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-5 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => window.location.href = `/dashboard/eventos/novo?edit=${evt.id}`} 
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeletar(evt.id, evt.nome)} 
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
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
          </div>
        </div>
      </main>
    </div>
  );
}