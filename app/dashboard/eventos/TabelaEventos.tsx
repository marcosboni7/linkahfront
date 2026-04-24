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
  'Outros',
];

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive('bold')
            ? 'bg-purple-100 text-purple-600'
            : 'hover:bg-white text-slate-400'
        }`}
      >
        <Bold size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive('italic')
            ? 'bg-purple-100 text-purple-600'
            : 'hover:bg-white text-slate-400'
        }`}
      >
        <Italic size={18} />
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive({ textAlign: 'left' })
            ? 'bg-purple-100 text-purple-600'
            : 'hover:bg-white text-slate-400'
        }`}
      >
        <AlignLeft size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive({ textAlign: 'center' })
            ? 'bg-purple-100 text-purple-600'
            : 'hover:bg-white text-slate-400'
        }`}
      >
        <AlignCenter size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive({ textAlign: 'right' })
            ? 'bg-purple-100 text-purple-600'
            : 'hover:bg-white text-slate-400'
        }`}
      >
        <AlignRight size={18} />
      </button>
    </div>
  );
};

export default function TabelaEventos() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<any>(null);

  // Estados para Afiliados
  const [isAfiliadoModalOpen, setIsAfiliadoModalOpen] = useState(false);
  const [nomeAfiliado, setNomeAfiliado] = useState('');
  const [linkGerado, setLinkGerado] = useState('');
  const [copiado, setCopiado] = useState(false);

  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Conte os detalhes do seu evento...',
      }),
    ],
    content: '',
  });

  useEffect(() => {
    carregarEventos();
  }, []);

  async function carregarEventos() {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      const res = await fetch(`${API_URL}/api/eventos`);
      if (!res.ok) throw new Error('Erro ao carregar');
      const data = await res.json();

      // Se não houver utilizador logado, mostra tudo por enquanto para não ficar vazio
      if (!user || !user.id) {
        console.log("Utilizador não logado ou sem ID no localStorage. Mostrando todos os eventos.");
        setEventos(data);
        return;
      }

      // Filtro dinâmico: tenta filtrar por usuario_id ou id_usuario
      const meusEventos = data.filter((ev: any) => {
        return ev.usuario_id === user.id || ev.id_usuario === user.id;
      });

      // Se o filtro resultou em nada, mas o banco tem dados, pode ser o nome do campo
      if (meusEventos.length === 0 && data.length > 0) {
        console.log("Filtro ativo, mas nenhum evento corresponde ao seu ID. Verifique o campo de ID no Banco.");
        // Se quiseres ver os eventos mesmo assim enquanto testas, descomenta a linha abaixo:
        // setEventos(data); 
      }

      setEventos(meusEventos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (evento: any) => {
    setSelectedEvento(evento);
    editor?.commands.setContent(evento.descricao || '');
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvento) return;

    setSaving(true);
    try {
      const descHtml = editor?.getHTML() || '';
      const body = { ...selectedEvento, descricao: descHtml };

      const res = await fetch(`${API_URL}/api/eventos/${selectedEvento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Falha ao atualizar');

      await carregarEventos();
      setIsEditModalOpen(false);
      Swal.fire('Sucesso', 'Evento atualizado!', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Erro', 'Não foi possível salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Funções de Afiliados
  const handleAfiliadosClick = (evento: any) => {
    setSelectedEvento(evento);
    setNomeAfiliado('');
    setLinkGerado('');
    setCopiado(false);
    setIsAfiliadoModalOpen(true);
  };

  const gerarLinkAfiliado = () => {
    if (!nomeAfiliado) return;
    const ref = nomeAfiliado.toLowerCase().trim().replace(/\s+/g, '_');
    const url = `https://linkah.eu/evento/${selectedEvento.id}?ref=${ref}`;
    setLinkGerado(url);
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkGerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                Evento
              </th>
              <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                Data
              </th>
              <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {eventos.map((evento) => (
              <tr
                key={evento.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={evento.imagem_capa || FALLBACK_IMAGE}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                      alt=""
                    />
                    <div>
                      <p className="font-bold text-slate-900">{evento.nome}</p>
                      <p className="text-xs text-slate-400 font-medium">
                        {evento.categoria}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600 font-medium">
                  {new Date(evento.data_inicio).toLocaleDateString()}
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">
                    Ativo
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleAfiliadosClick(evento)}
                      className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title="Gerenciar Afiliados"
                    >
                      <Users size={18} />
                    </button>

                    <button
                      onClick={() => handleEditClick(evento)}
                      className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE AFILIADOS */}
      {isAfiliadoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
              <div className="flex items-center gap-3 text-emerald-600">
                <Users size={24} />
                <h3 className="text-xl font-black tracking-tight">Afiliados</h3>
              </div>
              <button
                onClick={() => setIsAfiliadoModalOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Crie um link de rastreamento para seus vendedores.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                  Nome do Afiliado
                </label>
                <input
                  type="text"
                  value={nomeAfiliado}
                  onChange={(e) => setNomeAfiliado(e.target.value)}
                  placeholder="Ex: Marcos Boni"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-bold text-slate-700"
                />
              </div>

              <button
                onClick={gerarLinkAfiliado}
                disabled={!nomeAfiliado}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                Gerar Link
              </button>

              {linkGerado && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-dashed border-emerald-200">
                    <input
                      readOnly
                      value={linkGerado}
                      className="flex-1 bg-transparent border-none text-xs font-mono text-slate-500 px-3 outline-none"
                    />
                    <button
                      onClick={copiarLink}
                      className="p-3 bg-white text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"
                    >
                      {copiado ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO COMPLETO */}
      {isEditModalOpen && selectedEvento && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl my-8 animate-in fade-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Edit3 size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Editar Evento
                  </h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                    Informações Gerais
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-3 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-700 px-1">
                    Nome do Evento
                  </label>
                  <input
                    type="text"
                    value={selectedEvento.nome}
                    onChange={(e) =>
                      setSelectedEvento({
                        ...selectedEvento,
                        nome: e.target.value,
                      })
                    }
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-700 px-1">
                    Categoria
                  </label>
                  <select
                    value={selectedEvento.categoria}
                    onChange={(e) =>
                      setSelectedEvento({
                        ...selectedEvento,
                        categoria: e.target.value,
                      })
                    }
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all font-bold text-slate-700 appearance-none"
                  >
                    {CATEGORIAS_VALIDAS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <FileText size={16} className="text-purple-500" />
                  <label className="text-xs font-bold text-slate-700">
                    Descrição
                  </label>
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
                  {saving ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}