'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronDown, MapPin, 
  Globe, Calendar, Clock, Edit3, Trash2, Image as ImageIcon, X, Save, Loader2, Ticket 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// --- CONFIGURAÇÃO DA API DA AWS ATUALIZADA ---
const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function TabelaEventos() {
  const [isOpen, setIsOpen] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const formatarDataLocal = (dataString: string) => {
    if (!dataString) return 'S/D';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const carregarEventos = async () => {
    const token = localStorage.getItem('@Linkah:Token');
    const email = localStorage.getItem('userEmail');

    if (!email || !token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/eventos/listar?email=${email}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEventos(data);
      }
    } catch (err) {
      console.error("Erro ao carregar eventos da AWS:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  const handleExcluir = async (id: number) => {
    const result = await Swal.fire({
      title: 'EXCLUIR EVENTO?',
      text: "Isso apagará todos os ingressos e registros vinculados.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C22973',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'SIM, APAGAR',
      cancelButtonText: 'CANCELAR',
      customClass: { popup: 'rounded-[2rem] font-sans' }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('@Linkah:Token');
        const res = await fetch(`${API_URL}/api/eventos/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setEventos((prev: any) => prev.filter((ev: any) => ev.id !== id));
          Swal.fire({ title: 'Removido!', icon: 'success', confirmButtonColor: '#C22973', customClass: { popup: 'rounded-[2rem]' } });
        }
      } catch (err) {
        Swal.fire('Erro', 'Erro ao conectar com a AWS.', 'error');
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
      const token = localStorage.getItem('@Linkah:Token');
      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventoParaEditar),
      });

      if (res.ok) {
        Swal.fire({ title: 'Sucesso!', text: 'Dados atualizados na nuvem.', icon: 'success', confirmButtonColor: '#C22973', customClass: { popup: 'rounded-[2rem]' } });
        setIsEditModalOpen(false);
        carregarEventos();
      }
    } catch (err) {
      Swal.fire('Erro', 'Falha ao salvar na AWS.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-sans">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-[#C22973] font-black uppercase text-[10px] tracking-[0.4em] mb-1 italic">Producer Hub</h2>
          <p className="text-slate-800 font-black text-xl tracking-tighter">Gerenciar Eventos</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-[#C22973] text-white px-8 py-4 rounded-[1.4rem] font-black flex items-center gap-3 hover:bg-[#a62262] transition-all shadow-xl shadow-pink-100 active:scale-95 uppercase text-[11px] tracking-widest"
          >
            Novo Evento
            <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
              <div className="absolute right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-20 overflow-hidden py-4 animate-in fade-in zoom-in duration-200 ring-1 ring-black/5">
                <button
                  onClick={() => { setIsOpen(false); router.push('/dashboard/eventos/novo/presencial'); }}
                  className="w-full flex items-center gap-4 px-6 py-4 text-slate-600 hover:bg-pink-50 hover:text-[#C22973] transition-colors text-left font-black text-xs uppercase tracking-widest"
                >
                  <MapPin size={18} className="text-[#C22973]" /> Presencial
                </button>
                <div className="h-px bg-slate-50 mx-6 my-1"></div>
                <button
                  onClick={() => { setIsOpen(false); router.push('/dashboard/eventos/novo/online'); }}
                  className="w-full flex items-center gap-4 px-6 py-4 text-slate-600 hover:bg-pink-50 hover:text-[#C22973] transition-colors text-left font-black text-xs uppercase tracking-widest"
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
          <thead className="bg-[#F8FAFC] text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="px-10 py-6">Evento / Infos</th>
              <th className="px-6 py-6">Localização</th>
              <th className="px-6 py-6">Data & Hora</th>
              <th className="px-6 py-6">Vendas</th>
              <th className="px-6 py-6">Status</th>
              <th className="px-10 py-6 text-right">Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-24 text-center">
                   <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-[#C22973]" size={40} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Acessando AWS Cloud...</span>
                   </div>
                </td>
              </tr>
            ) : eventos.length > 0 ? (
              eventos.map((evento: any) => (
                <tr key={evento.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 rounded-[1.3rem] bg-slate-100 overflow-hidden border border-slate-100 shrink-0 shadow-sm relative group-hover:shadow-md transition-all">
                        {evento.imagem_capa ? (
                          <img src={evento.imagem_capa} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="font-black text-slate-800 text-sm leading-tight uppercase tracking-tight">{evento.nome}</p>
                          <p className="text-[9px] text-[#C22973] font-black uppercase tracking-[0.2em] mt-1 italic">{evento.categoria}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {evento.ingressos?.slice(0, 2).map((ing: any, idx: number) => (
                            <span key={idx} className="bg-white border border-slate-200 text-[8px] font-black px-2 py-1 rounded-lg text-slate-500 uppercase tracking-tighter">
                              {ing.nome}: <span className="text-[#C22973]">R$ {ing.preco}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{evento.local_nome || 'A definir'}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{evento.cidade}, {evento.estado}</span>
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 tracking-tight">{formatarDataLocal(evento.data_inicio)}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{evento.hora_inicio?.slice(0, 5)}h</span>
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center w-32">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                          {evento.total_vendidos || 0} / {evento.total_vagas || 0}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 italic">vendas</span>
                      </div>
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-pink-400 to-[#C22973] rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(((evento.total_vendidos || 0) / (evento.total_vagas || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border-2 ${
                      evento.status === 'Ativo' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50' 
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {evento.status}
                    </span>
                  </td>

                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => abrirModalEdicao(evento)} className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all shadow-sm bg-white border border-slate-100 active:scale-90">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleExcluir(evento.id)} className="p-3 text-slate-400 hover:text-white hover:bg-red-500 rounded-2xl transition-all shadow-sm bg-white border border-slate-100 active:scale-90">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-40 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-10">
                    <Calendar size={64} strokeWidth={1} />
                    <p className="font-black uppercase text-sm tracking-[0.4em]">Sua lista está vazia</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER DA TABELA */}
      <div className="p-8 bg-[#F8FAFC] border-t border-slate-50 flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
        <span>Mostrando {eventos.length} produções ativas</span>
        <div className="flex gap-4">
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:text-[#C22973] transition-all"><ChevronLeft size={20} /></button>
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:text-[#C22973] transition-all"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO RÁPIDA */}
      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-300 border border-white/20">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Editar</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configurações de Produção</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl text-slate-400 transition-all shadow-sm border border-slate-100"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSalvarEdicao} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Título da Obra</label>
                <input required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-[#C22973] font-bold text-slate-800 transition-all shadow-inner" value={eventoParaEditar.nome} onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, nome: e.target.value })} />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Cidade</label>
                  <input className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-[#C22973] font-bold text-slate-800 transition-all shadow-inner" value={eventoParaEditar.cidade} onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, cidade: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">UF</label>
                  <input maxLength={2} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-[#C22973] font-bold text-slate-800 text-center transition-all shadow-inner uppercase" value={eventoParaEditar.estado} onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, estado: e.target.value })} />
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full bg-[#C22973] text-white py-6 rounded-[1.8rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-pink-100 hover:bg-[#a62262] transition-all flex items-center justify-center gap-3 active:scale-[0.97]">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} strokeWidth={3} /> Sincronizar AWS</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}