'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronDown, MapPin, 
  Globe, Calendar, Clock, Edit3, Trash2, Image as ImageIcon, 
  X, Save, Loader2, Ticket, Upload, Camera
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

  // Estados para Edição e Anexo
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formata data para exibição na tabela
  const formatarDataLocal = (dataString: string) => {
    if (!dataString) return '---';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString(language === 'PT' ? 'pt-BR' : 'en-US');
    } catch (e) {
      return dataString;
    }
  };

  // Função para buscar eventos na AWS
  const carregarEventos = async () => {
    try {
      const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token') || localStorage.getItem('userToken');
      const userStorage = localStorage.getItem('@Linkah:User') || localStorage.getItem('user') || localStorage.getItem('userData');
      
      if (!token || !userStorage) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStorage);
      const email = user.email || user.user?.email || user.userData?.email;
      const timestamp = new Date().getTime();

      const res = await fetch(`${API_URL}/api/eventos/listar?email=${email}&t=${timestamp}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setEventos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("💥 Erro AWS:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    carregarEventos(); 
  }, []);

  // Abre o modal carregando os dados atuais
  const abrirModalEdicao = (evento: any) => {
    setEventoParaEditar({ ...evento });
    setPreviewUrl(evento.imagem_capa); 
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  // Gerencia o anexo do arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Salva as alterações na AWS usando FormData
  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('nome', eventoParaEditar.nome);
      formData.append('categoria', eventoParaEditar.categoria || '');
      formData.append('data_inicio', eventoParaEditar.data_inicio);
      formData.append('moeda', eventoParaEditar.moeda || 'BRL');
      formData.append('valor_minimo', String(eventoParaEditar.valor_minimo || '0'));
      
      // Só anexa se houver um arquivo novo selecionado
      if (selectedFile) {
        formData.append('imagem', selectedFile); 
      }

      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`
          // Não definir Content-Type manual! O navegador faz isso para o FormData.
        },
        body: formData,
      });

      if (res.ok) {
        Swal.fire({ 
          title: "Evento Atualizado!", 
          text: "As alterações foram sincronizadas na AWS.",
          icon: 'success', 
          confirmButtonColor: '#0f172a' 
        });
        setIsEditModalOpen(false);
        // Recarrega a lista para atualizar os cards com os nomes e imagens novas
        await carregarEventos(); 
      } else {
        throw new Error('Erro ao salvar');
      }
    } catch (err) {
      Swal.fire('Erro', 'Falha ao atualizar na AWS. Verifique os campos.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: number) => {
    const result = await Swal.fire({
      title: "Excluir Evento?",
      text: "Esta ação removerá o evento permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C22973',
      cancelButtonColor: '#0f172a',
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar"
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
          Swal.fire("Excluído!", "Evento removido com sucesso.", "success");
        }
      } catch (err) {
        Swal.fire('Erro', 'Falha ao deletar', 'error');
      }
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-sans">
      
      {/* HEADER DA SEÇÃO */}
      <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C22973]" />
            <h2 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Painel de Controle</h2>
          </div>
          <p className="text-slate-950 font-bold text-2xl tracking-tighter">Gerenciar Eventos</p>
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
                <button onClick={() => { setIsOpen(false); router.push('/dashboard/eventos/novo/presencial'); }} className="w-full flex items-center gap-4 px-6 py-4 text-slate-600 hover:bg-slate-50 font-bold text-xs text-left">
                  <MapPin size={18} className="text-[#C22973]" /> Presencial
                </button>
                <div className="h-px bg-slate-50 mx-4" />
                <button onClick={() => { setIsOpen(false); router.push('/dashboard/eventos/novo/online'); }} className="w-full flex items-center gap-4 px-6 py-4 text-slate-600 hover:bg-slate-50 font-bold text-xs text-left">
                  <Globe size={18} className="text-blue-500" /> Online / Live
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* TABELA DE LISTAGEM */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-10 py-6">Evento</th>
              <th className="px-6 py-6">Local / Cidade</th>
              <th className="px-6 py-6">Data</th>
              <th className="px-6 py-6 text-center">Moeda</th>
              <th className="px-10 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-[#C22973]" size={40} /></td></tr>
            ) : eventos.map((evento) => (
              <tr key={evento.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
                      {evento.imagem_capa ? (
                        <img src={evento.imagem_capa} className="w-full h-full object-cover" alt={evento.nome} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight">{evento.nome || 'Evento sem título'}</p>
                      <p className="text-[10px] text-[#C22973] font-bold uppercase tracking-widest mt-1">{evento.categoria || 'Geral'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 text-xs font-bold text-slate-700">{evento.cidade || '---'}</td>
                <td className="px-6 py-6 text-xs font-bold text-slate-700">{formatarDataLocal(evento.data_inicio)}</td>
                <td className="px-6 py-6 text-center">
                  <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600">
                    {evento.moeda || 'BRL'}
                  </span>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => router.push(`/dashboard/eventos/novo/ingressos/${evento.id}`)} title="Ingressos" className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Ticket size={18} /></button>
                    <button onClick={() => abrirModalEdicao(evento)} title="Editar" className="p-3 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => handleExcluir(evento.id)} title="Excluir" className="p-3 text-slate-400 hover:text-[#C22973] hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO COM ANEXO DE IMAGEM REAL */}
      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-950">Editar Evento</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-slate-400 border border-slate-100 hover:text-rose-500 transition-colors"><X size={18} /></button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
              
              {/* COMPONENTE DE UPLOAD (ANEXO) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Capa do Evento (Anexar Arquivo)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-full h-52 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-[#C22973] transition-all"
                >
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                          <Camera className="text-white" size={24} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-full shadow-sm mx-auto mb-3 w-fit">
                        <Upload className="text-[#C22973]" size={24} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Clique para selecionar imagem</p>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CAMPOS DE TEXTO */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Nome do Evento</label>
                  <input 
                    required 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:bg-white focus:border-slate-950 font-bold text-slate-900 transition-all" 
                    value={eventoParaEditar.nome || ''} 
                    onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, nome: e.target.value })} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Data de Início</label>
                  <input 
                    type="date"
                    required 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:bg-white focus:border-slate-950 font-bold text-slate-900 transition-all" 
                    value={eventoParaEditar.data_inicio ? eventoParaEditar.data_inicio.split('T')[0] : ''} 
                    onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, data_inicio: e.target.value })} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Categoria</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-slate-900 outline-none focus:border-slate-950 transition-all"
                    value={eventoParaEditar.categoria || ''}
                    onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, categoria: e.target.value })}
                  >
                    <option value="Show">Show</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conferência">Conferência</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Valor Base</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:bg-white focus:border-slate-950 font-bold text-slate-900 transition-all" 
                    value={eventoParaEditar.valor_minimo || '0'} 
                    onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, valor_minimo: e.target.value })} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Moeda</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-slate-900 outline-none focus:border-slate-950 transition-all"
                    value={eventoParaEditar.moeda || 'BRL'}
                    onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, moeda: e.target.value })}
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* BOTÃO DE AÇÃO */}
              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-slate-950 text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <><Save size={18} className="text-[#C22973]" /> Salvar na Cloud AWS</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}