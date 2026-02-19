'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown, MapPin, Globe, Calendar, Clock, Edit3, Trash2, 
  Image as ImageIcon, X, Save, Loader2, Ticket
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

  const apiBaseUrl = 'https://linkah-api.onrender.com';

  // Formatação de data resiliente
  const formatarDataLocal = (dataString: string) => {
    if (!dataString) return 'S/D';
    try {
      const data = new Date(dataString);
      // Ajuste para evitar que o fuso horário mude o dia
      return new Date(data.getTime() + data.getTimezoneOffset() * 60000)
        .toLocaleDateString('pt-BR');
    } catch {
      return 'Data Inválida';
    }
  };

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const userJSON = localStorage.getItem('@Linkah:User');
      if (!userJSON) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userJSON);
      const email = user.email;

      // Chama a rota que ajustamos no back-end
      const res = await fetch(`${apiBaseUrl}/api/eventos/listar?email=${email}&t=${Date.now()}`);
      
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
      text: "Isso removerá o evento e todos os ingressos vinculados!",
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
          Swal.fire({ 
            title: 'Removido!', 
            icon: 'success', 
            confirmButtonColor: '#C22973', 
            customClass: { popup: 'rounded-[2rem]' } 
          });
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

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
        <h2 className="text-[#C22973] font-black border-b-2 border-[#C22973] pb-1 px-2 uppercase text-xs tracking-[0.2em]">
          Gerenciar Eventos
        </h2>

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
              <th className="px-4 py-5">Status</th>
              <th className="px-4 py-5 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-[#C22973]" size={40} />
                  <p className="text-slate-400 text-xs font-bold mt-4 uppercase">Carregando seus eventos...</p>
                </td>
              </tr>
            ) : eventos.length > 0 ? (
              eventos.map((evento: any) => (
                <tr key={evento.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0 shadow-sm">
                        {evento.imagem_capa ? (
                          <img src={evento.imagem_capa} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <p className="font-black text-slate-800 text-sm leading-tight uppercase">{evento.nome}</p>
                          <p className="text-[10px] text-pink-500 font-black uppercase tracking-widest mt-0.5">{evento.categoria}</p>
                        </div>
                        {/* Listagem de Ingressos dinâmica vinda do Back */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {evento.ingressos && evento.ingressos.length > 0 ? (
                            evento.ingressos.map((ing: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm">
                                <Ticket size={10} className="text-slate-400" />
                                <span className="text-[9px] font-bold text-slate-600 uppercase">{ing.nome}</span>
                                <span className="text-[9px] font-black text-[#C22973]">
                                  {Number(ing.preco) === 0 ? 'GRÁTIS' : `R$ ${ing.preco}`}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-400 italic font-bold">Sem ingressos configurados</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 font-bold text-xs text-slate-700">
                    {evento.tipo === 'online' ? (
                      <span className="flex items-center gap-1 text-blue-500"><Globe size={12}/> Online</span>
                    ) : (
                      <>
                        {evento.local_nome || 'Local não definido'}<br/>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">{evento.cidade} - {evento.estado}</span>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-5 font-bold text-xs text-slate-700">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-400"/> {formatarDataLocal(evento.data_inicio)}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase mt-1"><Clock size={12}/> {evento.hora_inicio ? evento.hora_inicio.slice(0, 5) : '--:--'}h</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      evento.status === 'Ativo' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {evento.status || 'Pendente'}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => abrirModalEdicao(evento)} 
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Editar Evento"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleExcluir(evento.id)} 
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Excluir Evento"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-32 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-slate-50 rounded-full text-slate-200">
                      <Calendar size={40} />
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum evento criado por você</p>
                    <button 
                      onClick={() => setIsOpen(true)}
                      className="text-[#C22973] text-[10px] font-black uppercase hover:underline"
                    >
                      Comece criando o primeiro agora
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}