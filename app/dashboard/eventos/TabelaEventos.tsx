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

  if (valor.startsWith('http://') || valor.startsWith('https://')) {
    return valor;
  }

  if (valor.startsWith('/uploads/')) {
    return `${API_URL}${valor}`;
  }

  if (valor.startsWith('uploads/')) {
    return `${API_URL}/${valor}`;
  }

  if (valor.startsWith('linkah/eventos/')) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${valor}`;
  }

  return `${API_URL}/uploads/${valor}`;
}

function parseMoney(value: any): number {
  if (value === null || value === undefined || value === '') return 0;

  if (typeof value === 'number') {
    return Number.isNaN(value) ? 0 : value;
  }

  const normalized = String(value)
    .trim()
    .replace(/\s/g, '')
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');

  const parsed = parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function obterPrecoBase(data: any, fallbackEvento?: any) {
  const ingressos = Array.isArray(data?.ingressos) ? data.ingressos : [];

  const precosValidos = ingressos
    .map((ing: any) => parseMoney(ing?.preco))
    .filter((preco: number) => preco > 0);

  if (precosValidos.length > 0) {
    return Math.min(...precosValidos);
  }

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
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-xl transition-all ${
          editor.isActive('bold')
            ? 'bg-slate-900 text-white shadow-lg'
            : 'bg-white text-slate-400 hover:text-purple-600'
        }`}
      >
        <Bold size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-xl transition-all ${
          editor.isActive('italic')
            ? 'bg-slate-900 text-white shadow-lg'
            : 'bg-white text-slate-400 hover:text-purple-600'
        }`}
      >
        <Italic size={18} />
      </button>

      <div className="w-[1px] h-8 bg-slate-200 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-xl transition-all ${
          editor.isActive('bulletList')
            ? 'bg-slate-900 text-white shadow-lg'
            : 'bg-white text-slate-400 hover:text-purple-600'
        }`}
      >
        <List size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-xl transition-all ${
          editor.isActive('orderedList')
            ? 'bg-slate-900 text-white shadow-lg'
            : 'bg-white text-slate-400 hover:text-purple-600'
        }`}
      >
        <ListOrdered size={18} />
      </button>

      <div className="w-[1px] h-8 bg-slate-200 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded-xl transition-all ${
          editor.isActive({ textAlign: 'left' })
            ? 'bg-slate-900 text-white shadow-lg'
            : 'bg-white text-slate-400 hover:text-purple-600'
        }`}
      >
        <AlignLeft size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded-xl transition-all ${
          editor.isActive({ textAlign: 'center' })
            ? 'bg-slate-900 text-white shadow-lg'
            : 'bg-white text-slate-400 hover:text-purple-600'
        }`}
      >
        <AlignCenter size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded-xl transition-all ${
          editor.isActive({ textAlign: 'right' })
            ? 'bg-slate-900 text-white shadow-lg'
            : 'bg-white text-slate-400 hover:text-purple-600'
        }`}
      >
        <AlignRight size={18} />
      </button>

      <div className="w-[1px] h-8 bg-slate-200 mx-1" />

      <div className="flex items-center gap-2 bg-white px-3 rounded-xl border border-slate-100">
        <Palette size={16} className="text-slate-400" />
        <input
          type="color"
          onInput={(event: any) =>
            editor.chain().focus().setColor(event.target.value).run()
          }
          value={editor.getAttributes('textStyle').color || '#64748b'}
          className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
        />
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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder:
          'Descreva seu evento aqui... adicione informações, listas, regras e destaque o que for importante.',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setEventoParaEditar((prev: any) =>
        prev ? { ...prev, descricao: editor.getHTML() } : prev
      );
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none focus:outline-none min-h-[220px] p-6 text-slate-700 font-medium leading-relaxed',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    if (!isEditModalOpen) return;

    const html = eventoParaEditar?.descricao || '<p></p>';
    editor.commands.setContent(html, { emitUpdate: false });
  }, [editor, isEditModalOpen, eventoParaEditar?.descricao]);

  const eventosFiltrados = eventos.filter((evento) => {
    if (isEventoExcluido(evento)) return false;

    const nome = String(evento.nome || '').toLowerCase();
    const categoria = String(evento.categoria || '').toLowerCase();
    const termo = busca.toLowerCase();

    return nome.includes(termo) || categoria.includes(termo);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      if (!emailProdutor) {
        emailProdutor = localStorage.getItem('userEmail') || '';
      }

      const res = await fetch(
        `${API_URL}/api/eventos/listar?email=${encodeURIComponent(emailProdutor.toLowerCase())}&t=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }
      );

      const data = await res.json();

      if (res.ok) {
        const lista = Array.isArray(data) ? data : [];
        const listaFiltrada = lista
          .filter((evento) => !isEventoExcluido(evento))
          .map((evento) => ({
            ...evento,
            imagem_capa_url: resolverImagemEvento(evento.imagem_capa),
          }));

        setEventos(listaFiltrada);
      } else {
        setEventos([]);
      }
    } catch (err) {
      console.error('Erro ao carregar:', err);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  const abrirModalEdicao = async (evento: any) => {
    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';

      const res = await fetch(`${API_URL}/api/eventos/${evento.id}?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Erro ao carregar evento');
      }

      const precoBase = obterPrecoBase(data, evento);

      console.log('🧾 EVENTO TABELA PREÇO:', evento?.preco);
      console.log('🧾 EVENTO DETALHE PREÇO:', data?.preco);
      console.log('🧾 EVENTO DETALHE PREÇO_MINIMO:', data?.preco_minimo);
      console.log('🧾 EVENTO DETALHE INGRESSOS:', data?.ingressos);
      console.log('💰 PREÇO BASE FINAL:', precoBase);

      const eventoCompleto = {
        ...data,
        categoria: data.categoria || CATEGORIAS_VALIDAS[0],
        nome: data.nome || '',
        descricao: data.descricao || '',
        local_nome: data.local_nome || '',
        preco: precoBase > 0 ? String(precoBase) : '',
        data_inicio: formatDateToInput(data.data_inicio),
        imagem_capa: data.imagem_capa || '',
      };

      setEventoParaEditar(eventoCompleto);
      setPreviewUrl(resolverImagemEvento(data.imagem_capa));
      setSelectedFile(null);
      setIsEditModalOpen(true);
    } catch (err: any) {
      console.error('Erro ao abrir edição:', err);

      Swal.fire({
        title: 'Erro',
        text: err.message || 'Não foi possível carregar os dados completos do evento.',
        icon: 'error',
      });
    }
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';
      const formData = new FormData();

      const precoBase = parseMoney(eventoParaEditar.preco);

      formData.append('nome', eventoParaEditar.nome || '');
      formData.append('categoria', eventoParaEditar.categoria || '');
      formData.append('descricao', eventoParaEditar.descricao || '');
      formData.append('local_nome', eventoParaEditar.local_nome || '');
      formData.append('preco', String(precoBase));

      const dataInicioFormatada = formatDateToBackend(eventoParaEditar.data_inicio);
      if (dataInicioFormatada) {
        formData.append('data_inicio', dataInicioFormatada);
      }

      if (selectedFile) {
        formData.append('imagem_capa', selectedFile);
      } else if (eventoParaEditar.imagem_capa) {
        formData.append('imagem_capa', eventoParaEditar.imagem_capa);
      }

      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseEvento = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(responseEvento?.error || 'Erro ao salvar alterações');
      }

      const resIngressos = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}/ingressos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingressos: [
            {
              nome: 'Ingresso Geral',
              preco: precoBase,
              quantidade: 9999,
            },
          ],
        }),
      });

      const responseIngressos = await resIngressos.json().catch(() => null);

      if (!resIngressos.ok) {
        throw new Error(responseIngressos?.error || 'Erro ao salvar valor base do ingresso');
      }

      setIsEditModalOpen(false);

      Swal.fire({
        title: 'Atualizado!',
        text: 'As alterações foram salvas com sucesso.',
        icon: 'success',
        confirmButtonColor: '#7C3AED',
      });

      await carregarEventos();
    } catch (err: any) {
      Swal.fire({
        title: 'Erro',
        text: err.message || 'Erro ao salvar alterações.',
        icon: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (evento: any) => {
    const result = await Swal.fire({
      title: 'Remover evento?',
      text: `O evento "${evento.nome}" será ocultado da sua lista.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7C3AED',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    setIsDeleting(evento.id);

    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';

      const res = await fetch(`${API_URL}/api/eventos/${evento.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'Excluído',
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Falha ao excluir evento');
      }

      setEventos((prev) => prev.filter((ev) => String(ev.id) !== String(evento.id)));

      Swal.fire({
        title: 'Removido!',
        text: 'O evento foi ocultado com sucesso.',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error('Erro ao excluir evento:', err);
      Swal.fire({
        title: 'Erro',
        text: err.message || 'Não foi possível excluir o evento.',
        icon: 'error',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Seus Eventos</h1>
            <p className="text-slate-500 font-medium">
              Gerencie suas experiências e acompanhe as vendas em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all w-full md:w-64"
              />
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-purple-700 transition-all shadow-md shadow-purple-200 flex items-center gap-2 active:scale-95"
              >
                <Plus size={18} />
                Criar Evento
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => router.push(`/dashboard/eventos/novo/presencial`)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-colors text-left group"
                  >
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      <MapPin size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Presencial</span>
                  </button>

                  <button
                    onClick={() => router.push(`/dashboard/eventos/novo/online`)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-colors text-left group"
                  >
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <Globe size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Online</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Inscritos
                </th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-purple-600" size={32} />
                    <p className="text-slate-400 text-sm mt-4 font-medium">
                      Carregando experiências...
                    </p>
                  </td>
                </tr>
              ) : eventosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="text-slate-300" size={24} />
                    </div>
                    <p className="text-slate-500 font-semibold">Nenhum evento encontrado.</p>
                  </td>
                </tr>
              ) : (
                eventosFiltrados.map((evento) => (
                  <tr key={evento.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <img
                          src={evento.imagem_capa_url || resolverImagemEvento(evento.imagem_capa)}
                          className="w-14 h-14 rounded-2xl object-cover ring-1 ring-slate-100 bg-slate-50"
                          alt={evento.nome || 'Evento'}
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-base leading-tight mb-1">
                            {evento.nome}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                              {evento.categoria}
                            </span>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Calendar size={12} />
                              <span className="text-[11px] font-medium tracking-tight">
                                {formatDateToBR(evento.data_inicio)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6 text-center font-bold text-slate-700 text-lg">
                      {evento.vendas_count || 0}
                    </td>

                    <td className="px-6 py-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                        {evento.status || 'Ativo'}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => abrirModalEdicao(evento)}
                          className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>

                        <button
                          onClick={() => router.push(`/dashboard/eventos/novo/ingressos/${evento.id}`)}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Ingressos"
                        >
                          <Ticket size={18} />
                        </button>

                        <button
                          onClick={() => handleExcluir(evento)}
                          disabled={isDeleting === evento.id}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                          title="Excluir"
                        >
                          {isDeleting === evento.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
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

      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl text-slate-900">Configurações da Experiência</h3>
                <p className="text-sm text-slate-500">Ajuste os detalhes gerais do seu evento.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="p-10 overflow-y-auto max-h-[75vh] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 ml-1">Capa do Evento</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-purple-300 transition-colors"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        className="w-full h-full object-cover"
                        alt="Prévia"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    ) : (
                      <Upload size={32} className="text-slate-300" />
                    )}
                    <div className="absolute inset-0 bg-purple-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-bold">Alterar Imagem</p>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 ml-1">Nome</label>
                    <input
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
                      value={eventoParaEditar.nome || ''}
                      onChange={(e) =>
                        setEventoParaEditar({ ...eventoParaEditar, nome: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-purple-600 flex items-center gap-1.5 ml-1">
                      <DollarSign size={14} /> Valor Base
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl font-bold text-purple-700 outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
                      value={eventoParaEditar.preco ?? ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(',', '.');
                        if (/^\d*\.?\d*$/.test(value)) {
                          setEventoParaEditar({
                            ...eventoParaEditar,
                            preco: value,
                          });
                        }
                      }}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 ml-1">Data</label>
                    <input
                      type="date"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
                      value={eventoParaEditar.data_inicio || ''}
                      onChange={(e) =>
                        setEventoParaEditar({ ...eventoParaEditar, data_inicio: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Categoria</label>
                  <select
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all appearance-none"
                    value={eventoParaEditar.categoria}
                    onChange={(e) =>
                      setEventoParaEditar({ ...eventoParaEditar, categoria: e.target.value })
                    }
                  >
                    {CATEGORIAS_VALIDAS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Localização/Link</label>
                  <input
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
                    value={eventoParaEditar.local_nome || ''}
                    onChange={(e) =>
                      setEventoParaEditar({ ...eventoParaEditar, local_nome: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 ml-1">
                  <FileText size={16} className="text-purple-500" />
                  <label className="text-xs font-bold text-slate-700">Descrição</label>
                </div>

                <div className="border border-slate-200 rounded-[1.7rem] bg-white overflow-hidden">
                  <div className="p-4">
                    <MenuBar editor={editor} />
                  </div>

                  <div className="border-t border-slate-100">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] bg-purple-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}