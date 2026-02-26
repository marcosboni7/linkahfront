'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronDown, MapPin, 
  Globe, Calendar, Clock, Edit3, Trash2, Image as ImageIcon, X, Save, Loader2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function TabelaEventos() {
  const { t, language }: any = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const formatarDataLocal = (dataString: string) => {
    if (!dataString) return '---';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString(language === 'PT' ? 'pt-BR' : 'en-US');
    } catch (e) {
      return dataString;
    }
  };

  const carregarEventos = async () => {
    setLoading(true);
    try {
      // 1. Captura os dados do Storage
      const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const userStorage = localStorage.getItem('@Linkah:User') || localStorage.getItem('user');
      
      if (!token || !userStorage) {
        console.error("Auth missing");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStorage);
      const email = user.email;

      if (!email) {
        console.error("Email não encontrado no objeto de usuário");
        setLoading(false);
        return;
      }

      // 2. Chamada para a API (Voltamos para o parâmetro ?email= para evitar o erro 400)
      const timestamp = new Date().getTime();
      const res = await fetch(`${API_URL}/api/eventos/listar?email=${email}&t=${timestamp}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setEventos(Array.isArray(data) ? data : []);
      } else {
        const errorMsg = await res.text();
        console.error(`Erro ${res.status}: ${errorMsg}`);
      }
    } catch (err) {
      console.error("AWS Connection fail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    carregarEventos(); 
  }, []);

  const handleExcluir = async (id: number) => {
    const result = await Swal.fire({
      title: t.confirmDeleteTitle || "Excluir Evento?",
      text: t.confirmDeleteText || "Esta ação não pode ser desfeita.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C22973',
      cancelButtonColor: '#0f172a',
      confirmButtonText: t.btnConfirmDelete || "Sim, excluir",
      cancelButtonText: t.btnCancel || "Cancelar",
      customClass: { popup: 'rounded-[2.5rem] font-sans' }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/eventos/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setEventos((prev) => prev.filter((ev) => ev.id !== id));
          Swal.fire({ title: t.done || "Sucesso", icon: 'success', confirmButtonColor: '#0f172a' });
        }
      } catch (err) {
        Swal.fire('Error', 'AWS Connection fail', 'error');
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
      const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventoParaEditar),
      });

      if (res.ok) {
        Swal.fire({ title: t.done || "Evento Atualizado", icon: 'success', confirmButtonColor: '#0f172a' });
        setIsEditModalOpen(false);
        carregarEventos();
      }
    } catch (err) {
      Swal.fire('Error', 'AWS Save fail', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-sans">
      <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C22973]" />
            <h2 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Painel Administrativo</h2>
          </div>
          <p className="text-slate-950 font-bold text-2xl tracking-tighter">{t.manageEvents || "Meus Eventos"}</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 text-xs"
          >
            {t.newEvent || "Criar Novo Evento"}
            <ChevronDown size={18} className={`transition-transform duration-300 text-[#C22973] ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
              <div className="absolute right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-20 overflow-hidden py-3 animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => { setIsOpen(false); router.push('/dashboard/eventos/novo/presencial'); }}
                  className="w-full flex items-center gap-4 px-6 py-4 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  <MapPin size={18} className="text-[#C22973]" /> {t.btnPresencial || "Presencial"}
                </button>
                <div className="h-px bg-slate-50 mx-4" />
                <button
                  onClick={() => { setIsOpen(false); router.push('/dashboard/eventos/novo/online'); }}
                  className="w-full flex items-center gap-4 px-6 py-4 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  <Globe size={18} className="text-blue-500" /> {t.btnOnline || "Online / Live"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-10 py-6">{t.thEventInfo || "Evento"}</th>
              <th className="px-6 py-6">{t.thLocation || "Localização"}</th>
              <th className="px-6 py-6">{t.thDateTimeShort || "Data & Hora"}</th>
              <th className="px-6 py-6">{t.thSales || "Vendas"}</th>
              <th className="px-6 py-6">{t.thStatus || "Status"}</th>
              <th className="px-10 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-32 text-center">
                   <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-[#C22973]" size={40} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Sincronizando AWS Cloud...</span>
                   </div>
                </td>
              </tr>
            ) : eventos.length > 0 ? (
              eventos.map((evento: any) => (
                <tr key={evento.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0 shadow-sm">
                        {evento.imagem_capa ? (
                          <img src={evento.imagem_capa} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={20} /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{evento.nome}</p>
                        <p className="text-[10px] text-[#C22973] font-bold uppercase tracking-widest mt-0.5">{evento.categoria}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{evento.local_nome || '---'}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{evento.cidade}, {evento.estado}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{formatarDataLocal(evento.data_inicio)}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{evento.hora_inicio?.slice(0, 5)}h</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-xs font-bold text-slate-700">
                    {evento.total_vendidos || 0} vendidos
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-3 py-1.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {evento.status || 'Ativo'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => abrirModalEdicao(evento)} className="p-3 text-slate-400 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleExcluir(evento.id)} className="p-3 text-slate-400 hover:text-[#C22973] hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-40 text-center opacity-30">
                   <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                   <p className="font-bold uppercase text-xs tracking-widest text-slate-400">{t.emptyList || "Nenhum evento encontrado"}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <span>Total: {eventos.length} eventos</span>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:text-slate-950 transition-all"><ChevronLeft size={18} /></button>
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:text-slate-950 transition-all"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-950">{t.editTitle || "Editar Evento"}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-slate-400 border border-slate-100"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSalvarEdicao} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Nome do Evento</label>
                <input required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:bg-white focus:border-slate-950 font-bold text-slate-900 transition-all" value={eventoParaEditar.nome} onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, nome: e.target.value })} />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-slate-950 text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} className="text-[#C22973]" /> Salvar Alterações</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}