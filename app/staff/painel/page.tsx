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
  const [filtro, setFiltro] = useState(''); // Estado para a busca
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
        } else {
          Swal.fire('Erro', 'Não foi possível deletar o evento.', 'error');
        }
      } catch (e) {
        Swal.fire('Erro', 'Falha na conexão com o servidor', 'error');
      }
    }
  };

  // Lógica de busca simples
  const eventosFiltrados = eventos.filter(evt => 
    evt.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    evt.id?.toString().includes(filtro)
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky h-screen top-0">
        <div className="p-6 text-xl font-black text-slate-800 italic tracking-tighter uppercase">
          Linkah <span className="text-[#C22973]">Staff</span>
        </div>
        <nav className="flex-1 px-4 mt-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-[#C22973] text-white shadow-lg shadow-pink-100 transition-all">
            <LayoutDashboard size={18} /> Painel Geral
          </button>
          {/* Rota de criação - Verifique se esta pasta existe! */}
          <button onClick={() => window.location.href = '/staff/editar/${evt.id}'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all">
            <Plus size={18} /> Novo Evento
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
           <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar evento..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs outline-none focus:border-[#C22973] transition-all"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Administrador</span>
              <div className="w-8 h-8 rounded-full bg-[#C22973] flex items-center justify-center text-white text-[10px] font-black shadow-inner">AD</div>
           </div>
        </header>

        <div className="p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestão de Eventos</h2>
              <p className="text-slate-500 text-sm font-medium">Visualize, edite ou remova eventos da plataforma.</p>
            </div>
            <button 
              onClick={() => window.location.href = '/dashboard/eventos/novo'}
              className="bg-white border-2 border-[#C22973] text-[#C22973] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#C22973] hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
              <Plus size={16} /> Criar Evento
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#C22973]" size={40} />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Sincronizando Banco de Dados...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">Informações do Evento</th>
                    <th className="px-8 py-5">Local / Cidade</th>
                    <th className="px-8 py-5">Data e Hora</th>
                    <th className="px-8 py-5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventosFiltrados.map((evt) => {
                    const dataISO = evt.data_inicio;
                    let dataFormatada = '---';
                    let horaFormatada = '---';

                    if (dataISO) {
                      const d = new Date(dataISO);
                      dataFormatada = d.toLocaleDateString('pt-BR');
                      horaFormatada = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    }

                    return (
                      <tr key={evt.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-[#C22973] transition-colors">{evt.nome}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                            ID: #{evt.id} • <span className="text-[#C22973]/70">{evt.categoria}</span>
                          </p>
                        </td>
                        
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                              <MapPin size={12} className="text-[#C22973]" />
                              {evt.local_nome || 'Local não informado'}
                            </div>
                            <span className="text-[10px] text-slate-400 ml-5 font-bold uppercase">{evt.cidade}, {evt.estado}</span>
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                              <Calendar size={13} className="text-slate-400" />
                              {dataFormatada}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-[#C22973] uppercase tracking-tighter">
                              <Clock size={13} />
                              {horaFormatada}
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-5 text-center">
                          <div className="flex justify-center gap-2">
                            {/* AJUSTE AQUI: Se você não criou a pasta staff/editar, use o link abaixo que aponta para a página de novo com edit mode */}
                            <button 
                              onClick={() => window.location.href = `/dashboard/eventos/novo?edit=${evt.id}`} 
                              className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                              title="Editar evento"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeletar(evt.id, evt.nome)} 
                              className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                              title="Excluir evento"
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
            
            {!loading && eventosFiltrados.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center">
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Nenhum evento encontrado</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}