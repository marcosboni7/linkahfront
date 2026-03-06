'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Edit3, X, Loader2, Ticket, Upload, Trash2, ChevronDown, 
  MapPin, Monitor, Search, ExternalLink, TrendingUp 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function TabelaEventos() {
  const { language }: any = useLanguage();
  const [eventos, setEventos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lógica de Filtro em tempo real
  const eventosFiltrados = eventos.filter(evento => 
    evento.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    evento.categoria?.toLowerCase().includes(busca.toLowerCase())
  );

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validarImagem = (url: any) => {
    if (!url || url === "null" || url === "undefined" || String(url).includes('[object Object]')) {
      return 'https://placehold.co/400x400/e2e8f0/64748b?text=Linkah';
    }
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      if (url.includes('default-event.png')) {
        return 'https://placehold.co/400x400/e2e8f0/64748b?text=Evento';
      }
      return url;
    }
    return `${API_URL}/uploads/${url}`;
  };

  const formatarDataLocal = (dataString: string) => {
    if (!dataString) return '---';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString(language === 'PT' ? 'pt-BR' : 'en-US');
    } catch (e) { return dataString; }
  };

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';
      let emailBase = localStorage.getItem('userEmail') || localStorage.getItem('email') || "";
      const emailLimpo = emailBase.replace(/['"]+/g, '').trim().toLowerCase();

      let url = `${API_URL}/api/eventos/listar?email=${encodeURIComponent(emailLimpo)}&t=${Date.now()}`;
      
      let res = await fetch(url, { 
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      let data = await res.json();

      if (res.ok) {
        setEventos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("❌ Erro ao buscar lista:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarEventos(); }, []);

  const abrirModalEdicao = (evento: any) => {
    setEventoParaEditar({ ...evento });
    setPreviewUrl(validarImagem(evento.imagem_capa));
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoParaEditar?.nome) return;
    
    setSaving(true);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';
      
      const formData = new FormData();
      formData.append('nome', eventoParaEditar.nome.trim());
      formData.append('categoria', eventoParaEditar.categoria || 'Entretenimento');
      
      if (selectedFile) {
        formData.append('imagem_capa', selectedFile);
      } else {
        formData.append('imagem_capa', eventoParaEditar.imagem_capa || '');
      }

      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        await Swal.fire({ title: "Sucesso!", text: "Evento atualizado", icon: 'success', timer: 1500, showConfirmButton: false });
        carregarEventos();
      }
    } catch (err) {
      Swal.fire('Erro', 'Falha na comunicação', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: any) => {
    const result = await Swal.fire({
      title: 'Excluir evento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    });

    if (result.isConfirmed) {
      try {
        const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
        const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';
        await fetch(`${API_URL}/api/eventos/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        carregarEventos();
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-sans">
      
      {/* HEADER COM BUSCA E BOTÃO NOVO */}
      <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Painel do Produtor</h2>
          <p className="text-slate-950 font-bold text-2xl tracking-tighter">Meus Eventos</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* BARRA DE BUSCA */}
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Pesquisar evento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-black transition-all"
            />
          </div>

          {/* DROPDOWN NOVO EVENTO */}
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              className="w-full bg-[#030712] text-white px-8 py-4 rounded-2xl font-bold text-xs hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
            >
              + Novo Evento
              <ChevronDown size={14} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <button 
                  onClick={() => { setShowDropdown(false); router.push('/dashboard/eventos/novo/presencial'); }}
                  className="w-full px-5 py-4 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <MapPin size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-bold text-sm">Presencial</span>
                    <span className="text-slate-400 text-[10px]">Locais físicos e check-in</span>
                  </div>
                </button>

                <div className="h-[1px] bg-slate-50 mx-4 my-1" />

                <button 
                  onClick={() => { setShowDropdown(false); router.push('/dashboard/eventos/novo/online'); }}
                  className="w-full px-5 py-4 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Monitor size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-bold text-sm">Online</span>
                    <span className="text-slate-400 text-[10px]">Lives, Cursos e Vídeos</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABELA DE EVENTOS */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-10 py-5">Evento / Tipo</th>
              <th className="px-6 py-5 text-center">Vendas</th>
              <th className="px-6 py-5 text-center">Data</th>
              <th className="px-10 py-5 text-right">Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-[#FF4D4D]" size={32} /></td></tr>
            ) : eventosFiltrados.length === 0 ? (
                <tr><td colSpan={4} className="py-24 text-center text-slate-400">Nenhum evento encontrado.</td></tr>
            ) : (
              eventosFiltrados.map((evento) => (
                <tr key={evento.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-50 shadow-inner shrink-0">
                        <img 
                          src={validarImagem(evento.imagem_capa)} 
                          className="w-full h-full object-cover" 
                          alt={evento.nome}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-base">{evento.nome || "Sem nome"}</p>
                          {/* BADGE DE TIPO */}
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                            evento.tipo === 'online' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {evento.tipo || 'Presencial'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#FF4D4D] font-black uppercase tracking-widest">{evento.categoria || 'Evento'}</p>
                      </div>
                    </div>
                  </td>

                  {/* COLUNA DE VENDAS */}
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-950 font-bold text-sm leading-none">{evento.vendas_count || 0}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Vendidos</span>
                    </div>
                  </td>

                  <td className="px-6 py-6 text-center text-xs font-bold text-slate-500 uppercase">
                    {formatarDataLocal(evento.data_inicio)}
                  </td>

                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      {/* VER PÁGINA PÚBLICA */}
                      <button 
                        onClick={() => window.open(`https://linkah.com/evento/${evento.slug || evento.id}`, '_blank')} 
                        className="p-3 bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        title="Ver página pública"
                      >
                        <ExternalLink size={18} />
                      </button>

                      <button onClick={() => abrirModalEdicao(evento)} className="p-3 bg-slate-50 text-slate-400 hover:text-black hover:bg-slate-100 rounded-xl transition-all" title="Editar"><Edit3 size={18} /></button>
                      
                      <button onClick={() => router.push(`/dashboard/eventos/novo/ingressos/${evento.id}`)} className="p-3 bg-slate-50 text-slate-400 hover:text-[#FF4D4D] hover:bg-red-50 rounded-xl transition-all" title="Ingressos"><Ticket size={18} /></button>
                      
                      <button onClick={() => handleExcluir(evento.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Excluir"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-2xl tracking-tighter">Editar Evento</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleSalvarEdicao} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Imagem de Capa</label>
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#FF4D4D] transition-all"
                >
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <Upload size={32} className="text-slate-300" />
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e:any) => {
                    const file = e.target.files?.[0];
                    if (file) { 
                      setSelectedFile(file); 
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }} 
                  accept="image/*" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Evento</label>
                <input 
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-black focus:bg-white transition-all shadow-sm" 
                  value={eventoParaEditar.nome || ""} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})} 
                />
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-[#030712] text-white py-5 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}