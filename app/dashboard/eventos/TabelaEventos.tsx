'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Edit3,
  X,
  Loader2,
  Ticket,
  Upload,
  Search,
  Sparkles,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  FileText,
  Bold,
  Italic,
  List,
  ListOrdered,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Users,
  Copy,
  Check,
  Percent,
  User,
  Instagram,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';

const API_URL = 'https://api-linkah.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dj32txsol';
const FALLBACK_IMAGE =
  'https://placehold.co/600x400/f8fafc/cbd5e1?text=Event+Cover';

const CATEGORIAS_VALIDAS = [
  'Arte & Cultura',
  'Entretenimento',
  'Negócios',
  'Educação & Desenvolvimento',
  'Esportes & Bem-estar',
  'Experiências & Lifestyle',
  'Família & Comunidade',
];

function formatDateToInput(dateValue: any): string {
  if (!dateValue) return '';
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
  if (typeof dateValue === 'string' && dateValue.includes('T')) return dateValue.split('T')[0];

  const d = new Date(dateValue);
  if (!isNaN(d.getTime())) {
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
  return '';
}

function formatDateToBR(dateValue: any): string {
  if (!dateValue) return 'A definir';
  const data = formatDateToInput(dateValue);
  if (!data) return 'A definir';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatDateToBackend(dateValue: any): string {
  if (!dateValue) return '';
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;

  const d = new Date(dateValue);
  if (!isNaN(d.getTime())) {
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
  return '';
}

// Verifica status excluído
function isEventoExcluido(evento: any) {
  const status = String(evento?.status || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return status === 'excluido';
}

function resolverImagemEvento(url: any) {
  if (!url || url === 'null' || url === 'undefined' || String(url).includes('[object Object]')) {
    return FALLBACK_IMAGE;
  }
  const valor = String(url).trim();
  if (!valor) return FALLBACK_IMAGE;
  if (valor.startsWith('http://') || valor.startsWith('https://')) return valor;
  if (valor.startsWith('/uploads/')) return `${API_URL}${url}`;
  if (valor.startsWith('uploads/')) return `${API_URL}/${valor}`;
  if (valor.startsWith('linkah/eventos/')) return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${valor}`;
  return `${API_URL}/uploads/${valor}`;
}

function parseMoney(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return Number.isNaN(value) ? 0 : value;
  const normalized = String(value).trim().replace(/\s/g, '').replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function obterPrecoBase(data: any, fallbackEvento?: any) {
  const ingressos = Array.isArray(data?.ingressos) ? data.ingressos : [];
  const precosValidos = ingressos.map((ing: any) => parseMoney(ing?.preco)).filter((preco: number) => preco > 0);
  if (precosValidos.length > 0) return Math.min(...precosValidos);
  const precoMinimo = parseMoney(data?.preco_minimo);
  if (precoMinimo > 0) return precoMinimo;
  const precoEventoDetalhe = parseMoney(data?.preco);
  if (precoEventoDetalhe > 0) return precoEventoDetalhe;
  const precoTabela = parseMoney(fallbackEvento?.preco);
  if (precoTabela > 0) return precoTabela;
  return 0;
}

const MenuBar = ({ editor }: any) => {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 sticky top-0 z-10">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-xl transition-all ${editor.isActive('bold') ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-400 hover:text-slate-900'}`}><Bold size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-xl transition-all ${editor.isActive('italic') ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-400 hover:text-slate-900'}`}><Italic size={18} /></button>
      <div className="w-[1px] h-8 bg-slate-200 mx-1" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-xl transition-all ${editor.isActive('bulletList') ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-400 hover:text-slate-900'}`}><List size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-xl transition-all ${editor.isActive('orderedList') ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-400 hover:text-slate-900'}`}><ListOrdered size={18} /></button>
      <div className="w-[1px] h-8 bg-slate-200 mx-1" />
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded-xl transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-400 hover:text-slate-900'}`}><AlignLeft size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded-xl transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-400 hover:text-slate-900'}`}><AlignCenter size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded-xl transition-all ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-400 hover:text-slate-900'}`}><AlignRight size={18} /></button>
      <div className="w-[1px] h-8 bg-slate-200 mx-1" />
      <div className="flex items-center gap-2 bg-white px-3 rounded-xl border border-slate-100">
        <Palette size={16} className="text-slate-400" />
        <input type="color" onInput={(event: any) => editor.chain().focus().setColor(event.target.value).run()} value={editor.getAttributes('textStyle').color || '#64748b'} className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer" />
      </div>
    </div>
  );
};

export default function TabelaEventos() {
  const { t }: any = useLanguage();
  const [eventos, setEventos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Estados Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADOS: AFILIADOS ---
  const [isAfiliadoModalOpen, setIsAfiliadoModalOpen] = useState(false);
  const [selectedEventoAfiliado, setSelectedEventoAfiliado] = useState<any>(null);
  const [nomeAfiliado, setNomeAfiliado] = useState('');
  const [comissaoAfiliado, setComissaoAfiliado] = useState('10');
  const [linkGerado, setLinkGerado] = useState('');
  const [copiado, setCopiado] = useState(false);

  // --- ESTADOS: LISTA DE PARTICIPANTES CUSTOMIZADA ---
  const [isParticipantesModalOpen, setIsParticipantesModalOpen] = useState(false);
  const [selectedEventoParticipantes, setSelectedEventoParticipantes] = useState<any>(null);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [buscaParticipante, setBuscaParticipante] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit, TextStyle, Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Descreva seu evento aqui...' }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setEventoParaEditar((prev: any) => prev ? { ...prev, descricao: editor.getHTML() } : prev);
    },
    editorProps: { attributes: { class: 'prose prose-slate max-w-none focus:outline-none min-h-[220px] p-6 text-slate-700 font-medium leading-relaxed' } },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor || !isEditModalOpen) return;
    editor.commands.setContent(eventoParaEditar?.descricao || '<p></p>', { emitUpdate: false });
  }, [editor, isEditModalOpen, eventoParaEditar?.descricao]);

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';
      const userRaw = localStorage.getItem('@Linkah:User');
      let emailProdutor = '';

      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        emailProdutor = userObj.email || userObj.user?.email || '';
      }
      if (!emailProdutor) emailProdutor = localStorage.getItem('userEmail') || '';

      const res = await fetch(`${API_URL}/api/eventos/listar?email=${encodeURIComponent(emailProdutor.toLowerCase())}&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok) {
        const lista = Array.isArray(data) ? data : [];
        setEventos(lista.filter(ev => !isEventoExcluido(ev)).map(ev => ({ ...ev, imagem_capa_url: resolverImagemEvento(ev.imagem_capa) })));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { carregarEventos(); }, []);

  const eventosFiltrados = eventos.filter((evento) => {
    const nome = String(evento.nome || '').toLowerCase();
    const categoria = String(evento.categoria || '').toLowerCase();
    return nome.includes(busca.toLowerCase()) || categoria.includes(busca.toLowerCase());
  });

  // --- LÓGICA DE AFILIADOS ---
  const abrirModalAfiliados = (evento: any) => {
    setSelectedEventoAfiliado(evento);
    setNomeAfiliado('');
    setComissaoAfiliado('10');
    setLinkGerado('');
    setCopiado(false);
    setIsAfiliadoModalOpen(true);
  };

  const gerarLinkAfiliado = () => {
    if (!nomeAfiliado) return;
    const ref = nomeAfiliado.toLowerCase().trim().replace(/\s+/g, '_');
    const url = `https://linkah.eu/evento/${selectedEventoAfiliado.id}?ref=${ref}&pct=${comissaoAfiliado}`;
    setLinkGerado(url);
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkGerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // --- LÓGICA DE CARREGAMENTO DOS PARTICIPANTES DO CONGRESSO ---
  const abrirModalParticipantes = async (evento: any) => {
    setSelectedEventoParticipantes(evento);
    setIsParticipantesModalOpen(true);
    setLoadingParticipantes(true);
    setParticipantes([]);
    setBuscaParticipante('');

    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';

      const res = await fetch(`${API_URL}/api/pagamento/compras-evento/${evento.id}?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setParticipantes(data);
      } else {
        setParticipantes([]);
      }
    } catch (err) {
      console.error('Erro ao buscar participantes:', err);
    } finally {
      setLoadingParticipantes(false);
    }
  };

  const participantesFiltrados = participantes.filter((p) => {
    const email = String(p.usuario_email || '').toLowerCase();
    const cracha = String(p.nome_cracha || '').toLowerCase();
    const insta = String(p.instagram_user || '').toLowerCase();
    const termo = buscaParticipante.toLowerCase();
    return email.includes(termo) || cracha.includes(termo) || insta.includes(termo);
  });

  // --- MÉTODOS ORIGINAIS ---
  const abrirModalEdicao = async (evento: any) => {
    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';
      const res = await fetch(`${API_URL}/api/eventos/${evento.id}?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Erro ao carregar');
      const precoBase = obterPrecoBase(data, evento);
      setEventoParaEditar({
        ...data,
        categoria: data.categoria || CATEGORIAS_VALIDAS[0],
        preco: precoBase > 0 ? String(precoBase) : '',
        data_inicio: formatDateToInput(data.data_inicio),
      });
      setPreviewUrl(resolverImagemEvento(data.imagem_capa));
      setIsEditModalOpen(true);
    } catch (err) { console.error(err); }
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';
      const formData = new FormData();
      formData.append('nome', eventoParaEditar.nome || '');
      formData.append('categoria', eventoParaEditar.categoria || '');
      formData.append('descricao', eventoParaEditar.descricao || '');
      formData.append('local_nome', eventoParaEditar.local_nome || '');
      formData.append('preco', String(parseMoney(eventoParaEditar.preco)));
      const dataFmt = formatDateToBackend(eventoParaEditar.data_inicio);
      if (dataFmt) formData.append('data_inicio', dataFmt);
      if (selectedFile) formData.append('imagem_capa', selectedFile);

      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        Swal.fire('Atualizado!', 'Sucesso.', 'success');
        carregarEventos();
      }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  // ---------------------------------------------------------------------
  // CORRIGIDO: agora chama PATCH /api/eventos/:id/status (rota dedicada,
  // sem multer/multipart no meio) em vez de PUT /api/eventos/:id, que caía
  // na rota de edição completa (com multer) e descartava o "status" quando
  // o body vinha como JSON puro, fazendo o evento "voltar" após excluir.
  // ---------------------------------------------------------------------
  const handleExcluir = async (evento: any) => {
    const result = await Swal.fire({
      title: 'Remover?',
      text: 'Este evento será marcado como excluído e sumirá da sua lista.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F172A',
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    setIsDeleting(evento.id);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';

      const res = await fetch(`${API_URL}/api/eventos/${evento.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Excluído' }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Falha ao excluir evento');
      }

      setEventos(prev => prev.filter(ev => String(ev.id) !== String(evento.id)));
      Swal.fire('Removido!', 'O evento foi excluído.', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Erro', 'Não foi possível excluir o evento. Tente novamente.', 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Seus Eventos</h1>
            <p className="text-slate-500 font-medium">Gerencie suas experiências e acompanhe as vendas.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Pesquisar..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm w-full md:w-64 outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all" />
            </div>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setShowDropdown(!showDropdown)} className="bg-slate-900 hover:bg-slate-800 text-white pl-5 pr-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 transition-colors">
                <Plus size={18} /> Criar evento
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[100]">
                  <button onClick={() => router.push(`/dashboard/eventos/novo/presencial`)} className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition-colors">
                    <span className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center"><MapPin size={14} className="text-violet-600" /></span>
                    <span className="text-sm font-semibold text-slate-700">Presencial</span>
                  </button>
                  <button onClick={() => router.push(`/dashboard/eventos/novo/online`)} className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition-colors">
                    <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center"><Globe size={14} className="text-blue-600" /></span>
                    <span className="text-sm font-semibold text-slate-700">Online</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABELA */}
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Evento</th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wide text-center">Inscritos</th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wide text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wide text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td></tr>
              ) : eventosFiltrados.length === 0 ? (
                <tr><td colSpan={4} className="py-24 text-center text-slate-500 font-semibold">Nenhum evento.</td></tr>
              ) : (
                eventosFiltrados.map((evento) => (
                  <tr key={evento.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <img src={evento.imagem_capa_url} className="w-14 h-14 rounded-2xl object-cover ring-1 ring-slate-100" alt="" />
                        <div>
                          <p className="font-bold text-slate-900">{evento.nome}</p>
                          <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full mt-1">{evento.categoria}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center font-bold text-slate-700">{evento.vendas_count || 0}</td>
                    <td className="px-6 py-6 text-center">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wide">{evento.status || 'Ativo'}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => abrirModalParticipantes(evento)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all" title="Ver Participantes / Crachás">
                          <FileText size={18} />
                        </button>
                        <button onClick={() => abrirModalAfiliados(evento)} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all" title="Afiliados">
                          <Users size={18} />
                        </button>
                        <button onClick={() => abrirModalEdicao(evento)} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all" title="Editar"><Edit3 size={18} /></button>
                        <button onClick={() => router.push(`/dashboard/eventos/novo/ingressos/${evento.id}`)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all" title="Ingressos"><Ticket size={18} /></button>
                        <button
                          onClick={() => handleExcluir(evento)}
                          disabled={isDeleting === evento.id}
                          title="Excluir"
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all disabled:opacity-50"
                        >
                          {isDeleting === evento.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARTICIPANTES (CONGRESSO / FORMULÁRIO AVANÇADO) */}
      {isParticipantesModalOpen && selectedEventoParticipantes && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/40 shrink-0">
              <div className="flex items-center gap-3 text-blue-600">
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"><FileText size={20} /></span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Lista de participantes</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedEventoParticipantes.nome}</p>
                </div>
              </div>
              <button onClick={() => setIsParticipantesModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 bg-slate-50 border-b border-slate-100 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Buscar por e-mail, nome no crachá ou instagram..." value={buscaParticipante} onChange={(e) => setBuscaParticipante(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 transition-all" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {loadingParticipantes ? (
                <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={28} /></div>
              ) : participantesFiltrados.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium">Nenhum participante encontrado com os critérios digitados.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participantesFiltrados.map((p, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between border-b border-slate-50 pb-3">
                        <div className="space-y-0.5">
                          <p className="text-[10px] uppercase tracking-wide font-bold text-slate-300">Comprador</p>
                          <p className="text-sm font-bold text-slate-700 truncate max-w-[250px]">{p.usuario_email}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-wide">Aprovado</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1"><User size={12} /> No crachá</span>
                          <p className="font-bold text-slate-900">{p.nome_cracha || 'Não informado'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1"><Instagram size={12} /> Instagram</span>
                          <p className="font-bold text-indigo-600">{p.instagram_user ? `@${p.instagram_user.replace('@', '')}` : 'Não informado'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1"><AlertTriangle size={12} className="text-amber-500" /> Alergias</span>
                          <p className="font-medium text-slate-600 line-clamp-2">{p.alergias || 'Nenhuma restrição'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1"><HelpCircle size={12} /> Origem</span>
                          <p className="font-semibold text-slate-700">{p.como_conheceu || 'Não informado'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL AFILIADOS */}
      {isAfiliadoModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/40">
              <div className="flex items-center gap-3 text-emerald-600">
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"><Users size={20} /></span>
                <h3 className="text-lg font-bold text-slate-900">Afiliados</h3>
              </div>
              <button onClick={() => setIsAfiliadoModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-500 font-medium">Configure o vendedor e a taxa de comissão.</p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">Nome do vendedor</label>
                <input type="text" value={nomeAfiliado} onChange={(e) => setNomeAfiliado(e.target.value)} placeholder="Ex: Marcos Boni" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 font-semibold text-slate-700 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1 flex items-center gap-2">
                  <Percent size={14} className="text-emerald-500" /> Taxa de comissão (%)
                </label>
                <div className="relative">
                  <input type="number" min="0" max="100" value={comissaoAfiliado} onChange={(e) => setComissaoAfiliado(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 font-semibold text-slate-700 pr-12 transition-all" />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                </div>
              </div>

              <button onClick={gerarLinkAfiliado} disabled={!nomeAfiliado} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-full font-bold transition-all disabled:opacity-50">Gerar link com comissão</button>

              {linkGerado && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-full border border-dashed border-emerald-200 animate-in slide-in-from-top-2">
                  <input readOnly value={linkGerado} className="flex-1 bg-transparent border-none text-[10px] font-mono text-slate-500 px-3 outline-none" />
                  <button onClick={copiarLink} className="p-3 bg-white text-emerald-600 rounded-full border border-emerald-100 shadow-sm shrink-0">
                    {copiado ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIÇÃO */}
      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div><h3 className="font-bold text-xl text-slate-900">Configurações</h3></div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSalvarEdicao} className="p-10 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 ml-1">Capa</label>
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center cursor-pointer overflow-hidden relative group">
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="" /> : <Upload size={32} className="text-slate-300" />}
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><p className="text-white text-xs font-bold">Alterar</p></div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e: any) => { const file = e.target.files?.[0]; if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); } }} />
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 ml-1">Nome</label>
                    <input className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all" value={eventoParaEditar.nome || ''} onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, nome: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 ml-1">Valor base</label>
                    <input className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all" value={eventoParaEditar.preco ?? ''} onChange={(e) => { const v = e.target.value.replace(',', '.'); if (/^\d*\.?\d*$/.test(v)) setEventoParaEditar({...eventoParaEditar, preco: v}); }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 ml-1">Data</label>
                    <input type="date" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all" value={eventoParaEditar.data_inicio || ''} onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, data_inicio: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700">Descrição</label>
                <div className="border border-slate-200 rounded-3xl bg-white overflow-hidden">
                  <div className="p-4"><MenuBar editor={editor} /></div>
                  <div className="border-t border-slate-100"><EditorContent editor={editor} /></div>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-full font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-full font-bold flex items-center justify-center gap-3 disabled:opacity-50 transition-colors">{saving ? <Loader2 className="animate-spin" /> : 'Salvar alterações'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}