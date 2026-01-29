'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, ChevronDown, MapPin,
  Globe, Calendar, Clock, Edit3, Trash2, Image as ImageIcon, X, Save, Loader2, Ticket
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function TabelaEventos() {
  const [isOpen, setIsOpen] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://linkah-api.onrender.com';

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

  const handleExcluir = async (id: number) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Todos os ingressos vinculados também serão apagados!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C22973',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'SIM, EXCLUIR',
      cancelButtonText: 'CANCELAR',
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${apiBaseUrl}/api/eventos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setEventos((prev: any) => prev.filter((ev: any) => ev.id !== id));
          Swal.fire({ title: 'Removido!', icon: 'success', confirmButtonColor: '#C22973', customClass: { popup: 'rounded-[2rem]' } });
        }
      } catch (err) {
        Swal.fire('Erro', 'Erro ao conectar com o servidor.', 'error');
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
      const res = await fetch(`${apiBaseUrl}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventoParaEditar),
      });

      if (res.ok) {
        Swal.fire({ title: 'Sucesso!', text: 'Evento atualizado.', icon: 'success', confirmButtonColor: '#C22973', customClass: { popup: 'rounded-[2rem]' } });
        setIsEditModalOpen(false);
        carregarEventos();
      }
    } catch (err) {
      Swal.fire('Erro', 'Falha ao salvar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
        <button className="text-[#C22973] font-black border-b-2 border-[#C22973] pb-1 px-2 uppercase text-xs tracking-[0.2em]">
          Meus Eventos
        </button>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-[#C22973] text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-[#a62262] transition-all shadow-lg shadow-pink-100 active:scale-95 uppercase text-[11px] tracking-widest"
          >
            Criar Novo Evento
            <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-20 overflow-hidden py-3 animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => { setIsOpen(false); router.push('/dashboard/eventos/novo/presencial'); }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-slate-600 hover:bg-pink-50 hover:text-[#C22973] transition-colors text-left font-bold text-sm"
                >
                  <MapPin size={18} className="text-[#C22973]" /> Presencial
                </button>
                <div className="h-px bg-slate-50 mx-4 my-1"></div>
                <button
                  onClick={() => { setIsOpen(false); router.push('/dashboard/eventos/novo/online'); }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-slate-600 hover:bg-pink-50 hover:text-[#C22973] transition-colors text-left font-bold text-sm"
                >
                  <Globe size={18} className="text-blue-500" /> Online
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
              <th className="px-8 py-5">Evento & Ingressos</th>
              <th className="px-4 py-5">Onde</th>
              <th className="px-4 py-5">Quando</th>
              <th className="px-4 py-5">Vendas</th>
              <th className="px-4 py-5">Status</th>
              <th className="px-4 py-5 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={40} /></td>
              </tr>
            ) : eventos.length > 0 ? (
              eventos.map((evento: any) => (
                <tr key={evento.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0 shadow-sm">
                        {evento.imagem_capa ? (
                          <img
                            // Se a imagem vier como "/uploads/...", ele concatena com a base da API
                            src={evento.imagem_capa.startsWith('http')
                              ? evento.imagem_capa
                              : `${apiBaseUrl}${evento.imagem_capa}`
                            }
                            className="w-full h-full object-cover"
                            alt={evento.nome}
                            onError={(e) => {
                              // Fallback caso a URL falhe
                              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Erro+Imagem';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <p className="font-black text-slate-800 text-sm leading-tight uppercase">{evento.nome}</p>
                          <p className="text-[10px] text-pink-500 font-black uppercase tracking-widest mt-0.5">{evento.categoria}</p>
                        </div>

                        {/* BADGES DOS INGRESSOS */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {evento.ingressos && evento.ingressos.length > 0 ? (
                            evento.ingressos.map((ing: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm">
                                <Ticket size={10} className="text-slate-400" />
                                <span className="text-[9px] font-bold text-slate-600 uppercase">{ing.nome}</span>
                                <span className="text-[9px] font-black text-[#C22973]">R$ {ing.preco}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-400 italic font-bold">Nenhum ingresso cadastrado</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{evento.local_nome || 'A definir'}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{evento.cidade}, {evento.estado}</span>
                    </div>
                  </td>

                  <td className="px-4 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{new Date(evento.data_inicio).toLocaleDateString('pt-BR')}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{evento.hora_inicio?.slice(0, 5)}h</span>
                    </div>
                  </td>

                  {/* COLUNA VENDIDOS/TOTAL COM BARRA ROSA */}
                  <td className="px-4 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-700 uppercase">
                        {evento.total_vendidos || 0} / {evento.total_vagas || 0}
                      </span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C22973] rounded-full transition-all duration-700"
                          style={{ width: `${(evento.total_vendidos / (evento.total_vagas || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${evento.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                      {evento.status}
                    </span>
                  </td>

                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => abrirModalEdicao(evento)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleExcluir(evento.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-32 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <Calendar size={48} />
                    <p className="font-bold uppercase text-xs tracking-widest">Nenhum evento por aqui</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
        <span>Mostrando {eventos.length} eventos</span>
        <div className="flex gap-4">
          <button className="hover:text-[#C22973] transition-colors"><ChevronLeft size={20} /></button>
          <button className="hover:text-[#C22973] transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300 border border-white">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Editar Evento</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all shadow-sm border border-slate-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleSalvarEdicao} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nome do Evento</label>
                <input required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-[#C22973] font-bold text-slate-700 transition-all shadow-inner" value={eventoParaEditar.nome} onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, nome: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Cidade</label>
                  <input className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-[#C22973] font-bold text-slate-700 transition-all shadow-inner" value={eventoParaEditar.cidade} onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, cidade: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Estado</label>
                  <input className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-[#C22973] font-bold text-slate-700 transition-all shadow-inner" value={eventoParaEditar.estado} onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, estado: e.target.value })} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-[#C22973] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-pink-100 hover:bg-[#a62262] transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> ATUALIZAR AGORA</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}