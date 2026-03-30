'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Edit3, X, Loader2, Ticket, Upload, Trash2, ChevronDown, 
  MapPin, Monitor, Search, Lock, Calendar, AlignLeft, Tag, Link as LinkIcon,
  Music, Theater, Briefcase, GraduationCap, Heart, Sparkles, Users, MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://linkah-api.onrender.com';

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
  const { t }: any = useLanguage();
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
      confirmButtonColor: '#C22973',
      background: '#fff',
      customClass: {
        popup: 'rounded-[2rem]',
        confirmButton: 'rounded-xl font-bold uppercase text-xs px-8 py-4'
      }
    });
  };

  const validarImagem = (url: any) => {
    if (!url || url === "null" || url === "undefined" || String(url).includes('[object Object]')) {
      return 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Sem+Capa';
    }
    if (typeof url === 'string' && (url.startsWith('http'))) return url;
    return `${API_URL}/uploads/${url}`;
  };

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';
      
      const userRaw = localStorage.getItem('@Linkah:User');
      let emailProdutor = "";
      if (userRaw) {
          const userObj = JSON.parse(userRaw);
          emailProdutor = userObj.email || userObj.user?.email || "";
      }
      if (!emailProdutor) emailProdutor = localStorage.getItem('userEmail') || "";

      const res = await fetch(`${API_URL}/api/eventos/listar?email=${encodeURIComponent(emailProdutor.toLowerCase())}&t=${Date.now()}`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
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
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';
      
      const formData = new FormData();
      formData.append('nome', eventoParaEditar.nome);
      formData.append('categoria', eventoParaEditar.categoria);
      formData.append('descricao', eventoParaEditar.descricao || '');
      formData.append('local_nome', eventoParaEditar.local_nome || eventoParaEditar.localizacao || '');
      formData.append('data_inicio', eventoParaEditar.data_inicio || '');

      if (selectedFile) formData.append('imagem_capa', selectedFile);

      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        Swal.fire({ title: "Sucesso!", text: "Evento atualizado.", icon: 'success', timer: 2000, showConfirmButton: false });
        carregarEventos();
      }
    } catch (err) {
      Swal.fire('Erro', 'Conexão falhou', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
      
      {/* HEADER DA TABELA */}
      <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-[#C22973] font-black uppercase text-[10px] tracking-[0.3em] mb-1 italic">Gestão de Experiências</h2>
          <p className="text-slate-900 font-black text-2xl tracking-tighter uppercase italic">Meus Eventos</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C22973] transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Buscar por nome ou categoria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-pink-500/5 transition-all"
            />
          </div>

          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              className="w-full bg-slate-950 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#C22973] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
            >
              <Sparkles size={14} className="text-pink-400" />
              Criar Evento
              <ChevronDown size={14} className={showDropdown ? 'rotate-180' : ''} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 py-4 animate-in fade-in zoom-in-95 duration-200">
                <button onClick={() => router.push('/dashboard/eventos/novo/presencial')} className="w-full px-6 py-4 text-left hover:bg-slate-50 flex items-center gap-4 transition-colors group">
                  <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><MapPin size={20} /></div>
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-black text-[11px] uppercase tracking-wider">Presencial</span>
                    <span className="text-slate-400 text-[9px] font-medium uppercase">Locais físicos e shows</span>
                  </div>
                </button>
                <button onClick={() => router.push('/dashboard/eventos/novo/online')} className="w-full px-6 py-4 text-left hover:bg-slate-50 flex items-center gap-4 transition-colors group">
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Monitor size={20} /></div>
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-black text-[11px] uppercase tracking-wider">Digital / Online</span>
                    <span className="text-slate-400 text-[9px] font-medium uppercase">Lives, Cursos e Mentorias</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="px-10 py-6 italic">Evento & Vibe</th>
              <th className="px-6 py-6 text-center italic">Performance</th>
              <th className="px-6 py-6 text-center italic">Status</th>
              <th className="px-10 py-6 text-right italic">Ações de Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-[#C22973]" size={40} /></td></tr>
            ) : eventosFiltrados.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">Nenhuma experiência encontrada.</td></tr>
            ) : eventosFiltrados.map((evento) => (
              <tr key={evento.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img src={validarImagem(evento.imagem_capa)} className="w-16 h-16 rounded-[1.3rem] object-cover shadow-md group-hover:scale-105 transition-transform" alt="" />
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center ${evento.tipo?.toLowerCase() === 'online' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                         {evento.tipo?.toLowerCase() === 'online' ? <Monitor size={10} className="text-white" /> : <MapPin size={10} className="text-white" />}
                      </div>
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">{evento.nome}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-[#C22973] font-black uppercase tracking-widest">{evento.categoria}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase italic">
                          {new Date(evento.data_inicio).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-8 text-center">
                  <div className="inline-flex flex-col items-center">
                    <span className="text-slate-950 font-black text-xl leading-none">{evento.vendas_count || 0}</span>
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter mt-1 italic">Tickets</p>
                  </div>
                </td>
                <td className="px-6 py-8 text-center">
                  <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[8px] font-black uppercase tracking-widest">Ativo</span>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button onClick={handlePaginaPublicaEmBreve} className="w-11 h-11 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:text-[#C22973] hover:border-pink-100 transition-all shadow-sm"><ExternalLink size={18} /></button>
                    <button onClick={() => abrirModalEdicao(evento)} className="w-11 h-11 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:text-black hover:border-slate-300 transition-all shadow-sm"><Edit3 size={18} /></button>
                    <button onClick={() => router.push(`/dashboard/eventos/novo/ingressos/${evento.id}`)} className="w-11 h-11 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"><Ticket size={18} /></button>
                    <button onClick={() => {}} className="w-11 h-11 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:text-red-600 hover:border-red-100 transition-all shadow-sm"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO PREMIUM */}
      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh] border border-white/20">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="font-black text-2xl tracking-tighter uppercase italic text-slate-900">Editar Experiência</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">ID: #{eventoParaEditar.id?.substring(0,8)}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all"><X size={20}/></button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">Capa Visual</label>
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex items-center justify-center cursor-pointer overflow-hidden relative group">
                    {previewUrl ? (
                        <>
                            <img src={previewUrl} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-[#C22973]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="text-white" size={32} />
                            </div>
                        </>
                    ) : <Upload size={40} className="text-slate-200" />}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e:any) => { 
                    const file = e.target.files?.[0]; 
                    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
                  }} />
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Nome</label>
                    <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none focus:bg-white border border-transparent focus:border-slate-200 transition-all" value={eventoParaEditar.nome || ""} onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Categoria</label>
                    <select className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none appearance-none cursor-pointer" value={eventoParaEditar.categoria} onChange={(e) => setEventoParaEditar({...eventoParaEditar, categoria: e.target.value})}>
                      {CATEGORIAS.map(cat => <option key={cat.id} value={cat.id}>{cat.id}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Início</label>
                    <input type="date" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={eventoParaEditar.data_inicio?.split('T')[0] || ""} onChange={(e) => setEventoParaEditar({...eventoParaEditar, data_inicio: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                  {eventoParaEditar.tipo?.toLowerCase() === 'online' ? 'Link da Transmissão' : 'Nome do Local / Arena'}
                </label>
                <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={eventoParaEditar.local_nome || eventoParaEditar.localizacao || ""} onChange={(e) => setEventoParaEditar({...eventoParaEditar, local_nome: e.target.value})} />
              </div>

              <button type="submit" disabled={saving} className="w-full bg-slate-950 text-white p-6 rounded-[1.8rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-[#C22973] transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 active:scale-[0.98]">
                {saving ? <Loader2 className="animate-spin" size={20} /> : (<>Confirmar Alterações <Sparkles size={16} className="text-pink-400" /></>)}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}