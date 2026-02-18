'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Ticket, Settings, LogOut, 
  Search, Bell, MoreHorizontal, ArrowUpRight, 
  Calendar, DollarSign, Trash2, Edit, Loader2 
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function PainelStaff() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const apiBaseUrl = 'https://linkah-api.onrender.com';

  // 1. BUSCAR EVENTOS DO BACK-END
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
      title: 'Tem certeza?',
      text: `Você está prestes a excluir o evento: ${nome}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, apagar!',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacao.isConfirmed) {
      try {
        const res = await fetch(`${apiBaseUrl}/api/eventos/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          Swal.fire('Deletado!', 'O evento foi removido com sucesso.', 'success');
          carregarEventos(); // Atualiza a lista
        } else {
          Swal.fire('Erro', 'Não foi possível deletar o evento.', 'error');
        }
      } catch (error) {
        Swal.fire('Erro', 'Falha na conexão com o servidor.', 'error');
      }
    }
  };

  // 3. FUNÇÃO PARA EDITAR (Redireciona para a página de edição)
  const handleEditar = (id: number) => {
    // Aqui você redireciona para a rota de edição que criou antes
    window.location.href = `/dashboard/eventos/novo?edit=${id}`;
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
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
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Buscar eventos..." className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:border-[#C22973]" />
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-black text-slate-800">Admin Staff</span>
             <div className="w-9 h-9 rounded-full bg-[#C22973] flex items-center justify-center text-white font-bold text-xs">AD</div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gerenciamento de Eventos</h2>
            <p className="text-slate-500 text-sm font-medium">Administre todos os eventos criados na plataforma.</p>
          </div>

          {/* TABELA CONECTADA */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#C22973]" size={40} />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Carregando Eventos...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
                    <th className="px-8 py-4">Evento</th>
                    <th className="px-8 py-4">Local</th>
                    <th className="px-8 py-4">Data</th>
                    <th className="px-8 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventos.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold text-slate-700">{evt.nome}</p>
                        <p className="text-[10px] text-slate-400 font-medium">ID: #{evt.id}</p>
                      </td>
                      <td className="px-8 py-4 text-xs font-bold text-slate-500">{evt.local || 'Não definido'}</td>
                      <td className="px-8 py-4 text-xs font-bold text-slate-500">
                        {evt.data ? new Date(evt.data).toLocaleDateString('pt-BR') : '---'}
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEditar(evt.id)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar Evento"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeletar(evt.id, evt.nome)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
            )}
            {!loading && eventos.length === 0 && (
              <div className="p-20 text-center text-slate-400 font-medium">
                Nenhum evento encontrado no banco de dados.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}