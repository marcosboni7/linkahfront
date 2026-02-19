'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronDown, MapPin, Globe, Calendar, Clock, Edit3, Trash2, 
  Image as ImageIcon, X, Save, Loader2, Ticket, AlertCircle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function TabelaEventos() {
  const [isOpen, setIsOpen] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>(''); // Para mostrar erro na tela
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const apiBaseUrl = 'https://linkah-api.onrender.com';

  const formatarDataLocal = (dataString: string) => {
    if (!dataString) return 'S/D';
    try {
      const data = new Date(dataString);
      return new Date(data.getTime() + data.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
    } catch { return 'Data Inválida'; }
  };

  const carregarEventos = async () => {
    console.log("🚀 [DEBUG] Iniciando carregarEventos...");
    setLoading(true);
    setDebugInfo('');

    try {
      // 1. Verificar LocalStorage
      const userJSON = localStorage.getItem('@Linkah:User');
      console.log("📂 [DEBUG] Conteúdo do LocalStorage:", userJSON);

      if (!userJSON) {
        setDebugInfo('Usuário não encontrado no LocalStorage (@Linkah:User)');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userJSON);
      // Tentativa de pegar o email em diferentes níveis (previne erro de estrutura)
      const email = user.email || (user.user && user.user.email);
      
      console.log("📧 [DEBUG] Email extraído:", email);

      if (!email) {
        setDebugInfo('Objeto de usuário existe, mas o campo "email" está vazio.');
        setLoading(false);
        return;
      }

      // 2. Chamada da API
      const url = `${apiBaseUrl}/api/eventos/listar?email=${email}&t=${Date.now()}`;
      console.log("📡 [DEBUG] Chamando API:", url);

      const res = await fetch(url);
      console.log("📊 [DEBUG] Status da Resposta:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("✅ [DEBUG] Dados recebidos:", data);
        setEventos(data);
        if (data.length === 0) {
          console.warn("⚠️ [DEBUG] A API retornou uma lista VAZIA []. Verifique se há eventos vinculados a este email no Banco.");
        }
      } else {
        const errorText = await res.text();
        setDebugInfo(`Erro API (${res.status}): ${errorText}`);
      }
    } catch (err: any) {
      console.error("❌ [DEBUG] Erro catastrófico:", err);
      setDebugInfo(`Erro de conexão: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  // ... (mantenha handleExcluir e abrirModalEdicao iguais)
  const handleExcluir = async (id: number) => { /* seu código original */ };
  const abrirModalEdicao = (evento: any) => { /* seu código original */ };

  return (
    <div className="space-y-4">
      {/* PAINEL DE DEBUG - Só aparece se houver erro ou info importante */}
      {debugInfo && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-amber-600" size={20} />
          <div>
            <p className="text-amber-800 font-bold text-xs uppercase tracking-tight">Aviso do Sistema (Debug)</p>
            <p className="text-amber-700 text-sm">{debugInfo}</p>
          </div>
          <button onClick={() => carregarEventos()} className="ml-auto bg-amber-200 px-3 py-1 rounded-lg text-xs font-bold hover:bg-amber-300">Tentar Novamente</button>
        </div>
      )}

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
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-20 overflow-hidden py-3">
                  <button onClick={() => { setIsOpen(false); router.push('/dashboard/eventos/novo/presencial'); }} className="w-full flex items-center gap-3 px-5 py-3 text-slate-600 hover:bg-pink-50 hover:text-[#C22973] transition-colors text-left font-bold text-sm">
                    <MapPin size={18} className="text-[#C22973]" /> Presencial
                  </button>
                  <button onClick={() => { setIsOpen(false); router.push('/dashboard/eventos/novo/online'); }} className="w-full flex items-center gap-3 px-5 py-3 text-slate-600 hover:bg-pink-50 hover:text-[#C22973] transition-colors text-left font-bold text-sm">
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
                          {evento.imagem_capa ? <img src={evento.imagem_capa} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>}
                        </div>
                        <div className="space-y-1.5">
                          <div>
                            <p className="font-black text-slate-800 text-sm leading-tight uppercase">{evento.nome}</p>
                            <p className="text-[10px] text-pink-500 font-black uppercase tracking-widest mt-0.5">{evento.categoria}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {evento.ingressos?.map((ing: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm">
                                <Ticket size={10} className="text-slate-400" />
                                <span className="text-[9px] font-bold text-slate-600 uppercase">{ing.nome}</span>
                                <span className="text-[9px] font-black text-[#C22973]">{Number(ing.preco) === 0 ? 'GRÁTIS' : `R$ ${ing.preco}`}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 font-bold text-xs text-slate-700">
                      {evento.tipo === 'online' ? <span className="flex items-center gap-1 text-blue-500"><Globe size={12}/> Online</span> : <span>{evento.local_nome}<br/><small className="text-slate-400">{evento.cidade}-{evento.estado}</small></span>}
                    </td>
                    <td className="px-4 py-5 font-bold text-xs text-slate-700">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-400"/> {formatarDataLocal(evento.data_inicio)}</span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase mt-1"><Clock size={12}/> {evento.hora_inicio?.slice(0, 5)}h</span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${evento.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {evento.status || 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => abrirModalEdicao(evento)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => handleExcluir(evento.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-full text-slate-200"><Calendar size={40} /></div>
                      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum evento criado por você</p>
                      <button onClick={() => setIsOpen(true)} className="text-[#C22973] text-[10px] font-black uppercase hover:underline">Comece agora</button>
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