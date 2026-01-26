'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronDown, MapPin, 
  Globe, Calendar, Clock, Edit3, Trash2, Image as ImageIcon, X, Save 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TabelaEventos() {
  const [isOpen, setIsOpen] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // --- ESTADOS PARA O MODAL ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Link da API Dinâmico (Usa Render como fallback)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://linkah-api.onrender.com';

  // Buscar eventos do banco de dados
  const carregarEventos = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
        setLoading(false);
        return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/eventos/listar?email=${email}`);
      if (res.ok) {
        const data = await res.json();
        setEventos(data);
      }
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  // FUNÇÃO PARA EXCLUIR EVENTO
  const handleExcluir = async (id: number) => {
    const confirmou = window.confirm("Tem certeza que deseja excluir este evento? Todos os ingressos vinculados também serão apagados.");
    
    if (confirmou) {
      try {
        const res = await fetch(`${apiBaseUrl}/api/eventos/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setEventos((prev: any) => prev.filter((ev: any) => ev.id !== id));
          alert("Evento removido com sucesso!");
        } else {
          const erro = await res.json();
          alert(erro.message || "Erro ao tentar excluir o evento.");
        }
      } catch (err) {
        console.error("Erro ao excluir:", err);
        alert("Erro de conexão com o servidor.");
      }
    }
  };

  const abrirModalEdicao = (evento: any) => {
    setEventoParaEditar({ ...evento });
    setIsEditModalOpen(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // CORREÇÃO: Removido localhost daqui também
      const res = await fetch(`${apiBaseUrl}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventoParaEditar),
      });

      if (res.ok) {
        alert("Evento atualizado com sucesso!");
        setIsEditModalOpen(false);
        carregarEventos(); 
      } else {
        alert("Erro ao salvar as alterações.");
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <button className="text-[#C22973] font-bold border-b-2 border-[#C22973] pb-1 px-2 uppercase text-sm tracking-wider">
          Meus Eventos
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-md active:scale-95"
          >
            NOVO EVENTO 
            <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 overflow-hidden py-2 animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/dashboard/eventos/novo/presencial');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left font-bold text-sm"
                >
                  <MapPin size={18} className="text-indigo-500" />
                  Presencial
                </button>
                <div className="h-px bg-slate-50 mx-2"></div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/dashboard/eventos/novo/online');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left font-bold text-sm"
                >
                  <Globe size={18} className="text-blue-500" />
                  Online
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Evento</th>
              <th className="px-4 py-4">Onde</th>
              <th className="px-4 py-4">Quando</th>
              <th className="px-4 py-4">Horário</th>
              <th className="px-4 py-4">Vendidos/Total</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 animate-pulse font-bold">Carregando eventos...</td>
              </tr>
            ) : eventos.length > 0 ? (
              eventos.map((evento: any) => (
                <tr key={evento.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
                        {evento.imagem_capa ? (
                          <img src={evento.imagem_capa} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={16}/></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm line-clamp-1">{evento.nome}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{evento.categoria}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{evento.local_nome || 'A definir'}</span>
                      <span className="text-[10px] text-slate-400">{evento.cidade}, {evento.estado}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm font-medium text-slate-600">
                    {new Date(evento.data_inicio).toLocaleDateString('pt-BR')}
                  </td>

                  <td className="px-4 py-4 text-sm font-medium text-slate-600">
                    {evento.hora_inicio?.slice(0, 5) || '--:--'}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-700">0 / 100</span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-indigo-500 rounded-full"></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      evento.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {evento.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => abrirModalEdicao(evento)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleExcluir(evento.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-20 text-center text-slate-300 font-medium italic">
                  Nenhum evento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50/30 border-t border-slate-50 flex justify-end items-center gap-4 text-slate-400 text-xs">
        <span>1-{eventos.length} de {eventos.length}</span>
        <div className="flex gap-2">
          <button className="hover:text-slate-600 transition-colors disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          <button className="hover:text-slate-600 transition-colors disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* --- MODAL DE EDIÇÃO --- */}
      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Editar Evento</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all shadow-sm"><X size={20} /></button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nome do Evento</label>
                <input 
                  required
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-700"
                  value={eventoParaEditar.nome}
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Cidade</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-700"
                    value={eventoParaEditar.cidade}
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, cidade: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Estado</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-700"
                    value={eventoParaEditar.estado}
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, estado: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-all text-xs uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 shadow-lg transition-all text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : <><Save size={16} /> Salvar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}