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
    // Tenta pegar o token de ambas as formas comuns para não ter erro
    const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
    const userStorage = localStorage.getItem('@Linkah:User') || localStorage.getItem('user');
    const user = JSON.parse(userStorage || '{}');
    
    // Prioridade para o ID, se não tiver, usa o email
    const identificador = user.id || user.email;

    if (!token) { 
      console.error("Sem token de acesso");
      setLoading(false); 
      return; 
    }

    try {
      // Ajuste na rota para ser mais genérica ou específica conforme sua API
      // Adicionando um timestamp para evitar cache do navegador
      const timestamp = new Date().getTime();
      const res = await fetch(`${API_URL}/api/eventos/listar?usuarioId=${identificador}&t=${timestamp}`, {
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
        console.error("Erro na resposta da API:", res.status);
      }
    } catch (err) {
      console.error("Falha ao conectar com AWS:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    carregarEventos(); 
  }, []);

  // ... (restante das funções handleExcluir e abrirModal seguem iguais)
  
  const handleExcluir = async (id: number) => {
    const result = await Swal.fire({
      title: t.confirmDeleteTitle || "Excluir Evento?",
      text: t.confirmDeleteText || "Esta ação não pode ser desfeita.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C22973', // Corrigido para o Pink Linkah
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
            <h2 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Painel do Produtor</h2>
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
              <div className="absolute right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-20 overflow-hidden py-3">
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
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Acessando AWS Cloud...</span>
                   </div>
                </td>
              </tr>
            ) : eventos.length > 0 ? (
              eventos.map((evento: any) => (
                <tr key={evento.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
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
                  <td className="px-6 py-6 text-xs font-bold text-slate-700">{evento.cidade || '---'}, {evento.estado}</td>
                  <td className="px-6 py-6 text-xs font-bold text-slate-700">{formatarDataLocal(evento.data_inicio)}</td>
                  <td className="px-6 py-6 text-xs font-bold text-slate-700">{evento.total_vendidos || 0} vendidos</td>
                  <td className="px-6 py-6">
                    <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {evento.status || 'Ativo'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => abrirModalEdicao(evento)} className="p-3 text-slate-400 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleExcluir(evento.id)} className="p-3 text-slate-400 hover:text-[#C22973] hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-40 text-center text-slate-400 font-bold uppercase text-xs tracking-widest opacity-30">
                  {t.emptyList || "Nenhum evento encontrado"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}