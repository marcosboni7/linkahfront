'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown, MapPin, Globe, Calendar, Clock, Edit3, Trash2, 
  Image as ImageIcon, X, Save, Loader2, Ticket, AlertCircle, RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function TabelaEventos() {
  const [isOpen, setIsOpen] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);
  const router = useRouter();

  const apiBaseUrl = 'https://linkah-api.onrender.com';

  const formatarDataLocal = (dataString: string) => {
    if (!dataString) return 'S/D';
    try {
      const data = new Date(dataString);
      return new Date(data.getTime() + data.getTimezoneOffset() * 60000)
        .toLocaleDateString('pt-BR');
    } catch {
      return 'Data Inválida';
    }
  };

  const carregarEventos = useCallback(async () => {
    setLoading(true);
    setDebugError(null);

    try {
      const userJSON = localStorage.getItem('@Linkah:User');
      if (!userJSON) {
        setDebugError("Sessão expirada. Por favor, faça login novamente.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userJSON);
      const email = user.email;

      if (!email) {
        setDebugError("Dados do usuário não encontrados.");
        setLoading(false);
        return;
      }

      // TENTATIVA 1: Rota padrão com no-store para forçar atualização
      // Nota: Tentei usar /api/eventos caso /listar esteja com problema
      const res = await fetch(`${apiBaseUrl}/api/eventos?email=${email}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Garante que estamos pegando um Array, mesmo se a API mudar o formato
        setEventos(Array.isArray(data) ? data : (data.eventos || []));
      } else {
        // TENTATIVA 2: Se a primeira falhar, tenta a rota /listar
        const res2 = await fetch(`${apiBaseUrl}/api/eventos/listar?email=${email}&t=${Date.now()}`);
        if (res2.ok) {
          const data2 = await res2.json();
          setEventos(Array.isArray(data2) ? data2 : (data2.eventos || []));
        } else {
          setDebugError(`Erro ao buscar eventos (${res.status})`);
        }
      }
    } catch (err: any) {
      setDebugError("Falha na conexão com o servidor.");
      console.error("Erro fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    carregarEventos();
  }, [carregarEventos]);

  const handleExcluir = async (id: number) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Isso removerá o evento permanentemente!",
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
        Swal.fire('Erro', 'Erro ao excluir.', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {debugError && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
          <AlertCircle className="text-amber-600" />
          <div className="flex-1">
            <p className="text-amber-800 text-[10px] font-black uppercase tracking-widest">Aviso de Sistema</p>
            <p className="text-amber-700 text-sm font-medium">{debugError}</p>
          </div>
          <button onClick={() => carregarEventos()} className="bg-amber-600 text-white text-[10px] font-bold px-4 py-2 rounded-xl uppercase flex items-center gap-2">
            <RefreshCw size={12} /> Tentar de novo
          </button>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-[#C22973] font-black border-b-2 border-[#C22973] pb-1 px-2 uppercase text-xs tracking-[0.2em]">
            Meus Eventos ({eventos.length})
          </h2>

          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full md:w-auto bg-[#C22973] text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#a62262] transition-all shadow-lg shadow-pink-100 active:scale-95 uppercase text-[11px] tracking-widest"
            >
              Criar Novo Evento
              <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-20 overflow-hidden py-3">
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
                  </td>
                </tr>
              ) : eventos.length > 0 ? (
                eventos.map((evento: any) => (
                  <tr key={evento.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
                          <img 
                            src={evento.imagem_capa || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"} 
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-slate-800 text-sm leading-tight uppercase">{evento.nome}</p>
                          <p className="text-[10px] text-pink-500 font-black uppercase tracking-widest">{evento.categoria}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {evento.ingressos?.map((ing: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[9px] font-bold">
                                <Ticket size={10} className="text-slate-400" />
                                <span className="text-slate-600 uppercase">{ing.nome}</span>
                                <span className="text-[#C22973]">{Number(ing.preco) === 0 ? 'GRÁTIS' : `R$ ${ing.preco}`}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 font-bold text-xs text-slate-700">
                      {evento.tipo === 'online' ? '🌐 Online' : `${evento.local_nome || 'Local'}, ${evento.cidade || ''}`}
                    </td>
                    <td className="px-4 py-5 font-bold text-xs text-slate-700">
                      <div className="flex flex-col">
                        <span>{formatarDataLocal(evento.data_inicio)}</span>
                        <span className="text-[10px] text-slate-400">{evento.hora_inicio?.slice(0, 5)}h</span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        evento.status?.toLowerCase() === 'ativo' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {evento.status || 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit3 size={16}/></button>
                        <button onClick={() => handleExcluir(evento.id)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Ticket size={40} className="text-slate-200 mb-2" />
                       <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum evento criado até agora</p>
                       <p className="text-slate-300 text-[10px]">Crie seu primeiro evento no botão acima!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}