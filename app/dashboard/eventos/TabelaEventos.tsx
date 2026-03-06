'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Edit3, X, Loader2, Ticket, Upload, Trash2, ChevronDown, 
  MapPin, Monitor, Search, Lock, Calendar, AlignLeft, Tag, Link as LinkIcon,
  Music, Theater, Briefcase, GraduationCap, Heart, Sparkles, Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

// Mapeamento de categorias conforme a imagem enviada
const CATEGORIAS = [
  { id: 'Arte & Cultura', icon: <Music size={14}/> },
  { id: 'Entretenimento', icon: <Theater size={14}/> },
  { id: 'Negócios', icon: <Briefcase size={14}/> },
  { id: 'Educação & Desenvolvimento', icon: <GraduationCap size={14}/> },
  { id: 'Esportes & Bem-estar', icon: <Heart size={14}/> },
  { id: 'Experiências & Lifestyle', icon: <Sparkles size={14}/> },
  { id: 'Família & Comunidade', icon: <Users size={14}/> },
];

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

  const eventosFiltrados = eventos.filter(evento => 
    evento.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    evento.categoria?.toLowerCase().includes(busca.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePaginaPublicaEmBreve = () => {
    Swal.fire({
      title: 'Em Homologação',
      text: 'A visualização externa será liberada junto com a ativação do checkout Stripe/Pix.',
      icon: 'info',
      confirmButtonColor: '#030712'
    });
  };

  const validarImagem = (url: any) => {
    if (!url || url === "null" || url === "undefined" || String(url).includes('[object Object]')) {
      return 'https://placehold.co/400x400/e2e8f0/64748b?text=Linkah';
    }
    return typeof url === 'string' && (url.startsWith('http')) ? url : `${API_URL}/uploads/${url}`;
  };

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';
      let emailBase = localStorage.getItem('userEmail') || localStorage.getItem('email') || "";
      const emailLimpo = emailBase.replace(/['"]+/g, '').trim().toLowerCase();

      let res = await fetch(`${API_URL}/api/eventos/listar?email=${encodeURIComponent(emailLimpo)}&t=${Date.now()}`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let data = await res.json();
      if (res.ok) setEventos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro:", err);
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
    setSaving(true);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';
      
      const formData = new FormData();
      formData.append('nome', eventoParaEditar.nome);
      formData.append('categoria', eventoParaEditar.categoria);
      formData.append('descricao', eventoParaEditar.descricao || '');
      formData.append('localizacao', eventoParaEditar.localizacao || '');
      formData.append('data_inicio', eventoParaEditar.data_inicio || '');

      if (selectedFile) formData.append('imagem_capa', selectedFile);

      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        Swal.fire({ title: "Sucesso!", icon: 'success', timer: 1500, showConfirmButton: false });
        carregarEventos();
      }
    } catch (err) {
      Swal.fire('Erro', 'Falha ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Painel do Produtor</h2>
          <p className="text-slate-950 font-bold text-2xl tracking-tighter">Meus Eventos</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text"
              placeholder="Pesquisar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-black transition-all"
            />
          </div>

          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              className="w-full bg-[#030712] text-white px-8 py-4 rounded-2xl font-bold text-xs hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
            >
              + Novo Evento
              <ChevronDown size={14} className={showDropdown ? 'rotate-180' : ''} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-3 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { setShowDropdown(false); router.push('/dashboard/eventos/novo/presencial'); }} className="w-full px-5 py-4 text-left hover:bg-slate-50 flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><MapPin size={18} /></div>
                  <div className="flex flex-col"><span className="text-slate-900 font-bold text-sm">Presencial</span><span className="text-slate-400 text-[10px]">Locais físicos</span></div>
                </button>
                <button onClick={() => { setShowDropdown(false); router.push('/dashboard/eventos/novo/online'); }} className="w-full px-5 py-4 text-left hover:bg-slate-50 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Monitor size={18} /></div>
                  <div className="flex flex-col"><span className="text-slate-900 font-bold text-sm">Online</span><span className="text-slate-400 text-[10px]">Lives e Mentorias</span></div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-10 py-5">Evento / Tipo</th>
              <th className="px-6 py-5 text-center">Vendas</th>
              <th className="px-10 py-5 text-right">Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={3} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-[#FF4D4D]" size={32} /></td></tr>
            ) : eventosFiltrados.map((evento) => (
              <tr key={evento.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-5">
                    <img src={validarImagem(evento.imagem_capa)} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-base">{evento.nome}</p>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${evento.tipo === 'online' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          {evento.tipo || 'Presencial'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#FF4D4D] font-black uppercase tracking-widest">{evento.categoria}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="text-slate-950 font-bold text-sm">{evento.vendas_count || 0}</span>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Vendidos</p>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={handlePaginaPublicaEmBreve} className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:text-slate-500 transition-all"><Lock size={18} /></button>
                    <button onClick={() => abrirModalEdicao(evento)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => router.push(`/dashboard/eventos/novo/ingressos/${evento.id}`)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-[#FF4D4D] transition-all"><Ticket size={18} /></button>
                    <button onClick={() => {/* Logica delete */}} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO COM AS CATEGORIAS NOVAS */}
      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-2xl tracking-tighter">Editar Evento</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capa</label>
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center cursor-pointer overflow-hidden relative">
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="" /> : <Upload size={32} className="text-slate-300" />}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e:any) => { const file = e.target.files?.[0]; if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }}} />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:border-black border border-transparent transition-all" value={eventoParaEditar.nome || ""} onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                    <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:border-black border border-transparent transition-all appearance-none" 
                      value={eventoParaEditar.categoria} 
                      onChange={(e) => setEventoParaEditar({...eventoParaEditar, categoria: e.target.value})}
                    >
                      {CATEGORIAS.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.id}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Calendar size={12} className="inline mr-1"/> Data</label>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:border-black border border-transparent transition-all" value={eventoParaEditar.data_inicio?.split('T')[0] || ""} onChange={(e) => setEventoParaEditar({...eventoParaEditar, data_inicio: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {eventoParaEditar.tipo === 'online' ? <><LinkIcon size={12} className="inline mr-1"/> Link</> : <><MapPin size={12} className="inline mr-1"/> Local</>}
                  </label>
                  <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:border-black border border-transparent transition-all" value={eventoParaEditar.localizacao || ""} onChange={(e) => setEventoParaEditar({...eventoParaEditar, localizacao: e.target.value})} />
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full bg-[#030712] text-white p-5 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {saving ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}