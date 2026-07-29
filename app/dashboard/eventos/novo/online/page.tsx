'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ImageIcon,
  Globe,
  Loader2,
  Users,
  Sparkles,
  Link2,
  Clock,
  Layout,
  Building2,
  Wand2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Palette,
  Trash2,
  Save,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Tag,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Swal from 'sweetalert2';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';

const API_URL = 'https://api-linkah.onrender.com';
const DRAFT_KEY = '@Linkah:NovoEventoOnline:Draft';

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
            : 'bg-white text-slate-400 hover:text-pink-500'
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
            : 'bg-white text-slate-400 hover:text-pink-500'
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
            : 'bg-white text-slate-400 hover:text-pink-500'
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
            : 'bg-white text-slate-400 hover:text-pink-500'
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
            : 'bg-white text-slate-400 hover:text-pink-500'
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
            : 'bg-white text-slate-400 hover:text-pink-500'
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
            : 'bg-white text-slate-400 hover:text-pink-500'
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

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function base64ToFile(dataUrl: string, fileName: string) {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0]?.match(/:(.*?);/);
  const mime = mimeMatch?.[1] || 'image/png';
  const bstr = atob(arr[1] || '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], fileName, { type: mime });
}

export default function NovoEventoOnline() {
  const { t }: any = useLanguage();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [isRestoringDraft, setIsRestoringDraft] = useState(true);
  const [isGratis, setIsGratis] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    status: 'Ativo',
    descricao: '',
    preco: '0',
    data_inicio: '',
    hora_inicio: '',
    data_termino: '',
    hora_termino: '',
    local_nome: 'Plataforma Online',
    link_reuniao: '',
    capacidade: '',
    tipo: 'Online',
    moeda: 'BRL',
    regras: '',
    visibilidade: 'Publico',
  });

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
          'Descreva a experiência digital, adicione links importantes ou cronograma da live...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, descricao: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none focus:outline-none min-h-[200px] p-6 text-slate-600 font-medium leading-relaxed',
      },
    },
  });

  useEffect(() => {
    const restoreDraft = async () => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) {
          setIsRestoringDraft(false);
          return;
        }

        const draft = JSON.parse(raw);

        if (draft.formData) {
          setFormData((prev) => ({
            ...prev,
            ...draft.formData,
          }));

          if (Number(draft.formData.preco) === 0) {
            setIsGratis(true);
          }

          if (draft.formData.descricao && editor) {
            editor.commands.setContent(draft.formData.descricao);
          }
        }

        if (draft.previewImage) setPreviewImage(draft.previewImage);
        if (draft.previewBanner) setPreviewBanner(draft.previewBanner);

        if (draft.imageBase64) {
          const restoredImage = base64ToFile(
            draft.imageBase64,
            draft.imageName || 'capa.png'
          );
          setSelectedFile(restoredImage);
        }

        if (draft.bannerBase64) {
          const restoredBanner = base64ToFile(
            draft.bannerBase64,
            draft.bannerName || 'banner.png'
          );
          setSelectedBanner(restoredBanner);
        }
      } catch (error) {
        console.error('❌ Erro ao restaurar rascunho online:', error);
      } finally {
        setIsRestoringDraft(false);
      }
    };

    if (editor) {
      restoreDraft();
    }
  }, [editor]);

  useEffect(() => {
    if (isRestoringDraft) return;

    const saveDraft = async () => {
      try {
        const payload: any = {
          formData,
          previewImage,
          previewBanner,
          imageBase64: null,
          imageName: null,
          bannerBase64: null,
          bannerName: null,
        };

        if (selectedFile) {
          payload.imageBase64 = await fileToBase64(selectedFile);
          payload.imageName = selectedFile.name;
        }

        if (selectedBanner) {
          payload.bannerBase64 = await fileToBase64(selectedBanner);
          payload.bannerName = selectedBanner.name;
        }

        localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      } catch (error) {
        console.error('❌ Erro ao salvar rascunho online:', error);
      }
    };

    saveDraft();
  }, [
    formData,
    previewImage,
    previewBanner,
    selectedFile,
    selectedBanner,
    isRestoringDraft,
  ]);

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith('blob:')) URL.revokeObjectURL(previewImage);
      if (previewBanner?.startsWith('blob:')) URL.revokeObjectURL(previewBanner);
    };
  }, [previewImage, previewBanner]);

  const handleIA = async () => {
    const { value: text } = await Swal.fire({
      title: 'GERADOR INTELIGENTE',
      input: 'textarea',
      inputLabel: 'Cole o texto do seu evento (WhatsApp, E-mail, Post)',
      inputPlaceholder: 'Ex: Webinar de Inovação dia 12/06 as 20h no Meet...',
      showCancelButton: true,
      confirmButtonText: 'Mágica ✨',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#000',
      customClass: { popup: 'rounded-[2rem] font-sans' },
    });

    if (!text) return;

    setIsGeneratingIA(true);
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('@Linkah:Token')
        : null;

    try {
      const response = await fetch(`${API_URL}/api/eventos/gerar-ia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ texto: text }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          ...data,
          tipo: 'Online',
          local_nome: data.local_nome || 'Plataforma Online',
          preco: data.preco !== undefined ? String(data.preco) : prev.preco,
        }));

        if (data.preco !== undefined && Number(data.preco) === 0) {
          setIsGratis(true);
        }

        if (data.descricao) {
          editor?.commands.setContent(data.descricao);
        }

        Swal.fire({
          icon: 'success',
          title: 'DADOS EXTRAÍDOS',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[2rem]' },
        });
      } else {
        Swal.fire('Erro', data?.error || 'Falha ao processar com IA.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro na IA', 'Não conseguimos processar agora.', 'error');
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleGratis = (e: any) => {
    const marcado = e.target.checked;
    setIsGratis(marcado);
    if (marcado) {
      setFormData((prev) => ({ ...prev, preco: '0' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewImage?.startsWith('blob:')) URL.revokeObjectURL(previewImage);

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewBanner?.startsWith('blob:')) URL.revokeObjectURL(previewBanner);

    setSelectedBanner(file);
    setPreviewBanner(URL.createObjectURL(file));
  };

  const limparRascunho = async () => {
    const result = await Swal.fire({
      title: 'Limpar rascunho?',
      text: 'Todos os dados preenchidos serão removidos desta tela.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, limpar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#111827',
      cancelButtonColor: '#ef4444',
      customClass: { popup: 'rounded-[2rem]' },
    });

    if (!result.isConfirmed) return;

    localStorage.removeItem(DRAFT_KEY);
    window.location.reload();
  };

  const handleSalvar = async () => {
    const token = localStorage.getItem('@Linkah:Token')?.replace(/['"]+/g, '');
    const userRaw = localStorage.getItem('@Linkah:User');
    let emailProdutor = '';
    let nomeUsuario = '';

    try {
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        emailProdutor = userObj.email || userObj.user?.email || '';
        nomeUsuario = userObj.nome || userObj.user?.nome || 'Organizador';
      }
    } catch {
      nomeUsuario = 'Admin';
    }

    if (!formData.nome || !formData.categoria || !formData.data_inicio) {
      Swal.fire('Aviso', 'Preencha os campos obrigatórios.', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append('produtor_email', emailProdutor);
      dataToSend.append('usuario_nome', nomeUsuario);

      Object.entries(formData).forEach(([key, value]) => {
        dataToSend.append(key, String(value ?? ''));
      });

      if (selectedFile) dataToSend.append('imagem_capa', selectedFile);
      if (selectedBanner) dataToSend.append('banner_patrocinio', selectedBanner);

      const response = await fetch(`${API_URL}/api/eventos/novo-online`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.removeItem(DRAFT_KEY);
        router.push(`/dashboard/eventos/novo/ingressos/${result.id || result.evento?.id}`);
      } else {
        Swal.fire('Erro', result.error || 'Erro ao salvar', 'error');
      }
    } catch {
      Swal.fire('Erro', 'Falha na conexão', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] font-sans antialiased pb-24 text-slate-900">
      <header className="border-b border-slate-200/50 px-6 md:px-12 py-6 flex justify-between items-center bg-white/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-pink-200 transition-all active:scale-95"
          >
            <ChevronLeft size={20} className="text-slate-400" />
          </button>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-black text-[8px] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest italic">
                Cloud Engine
              </span>
              <Globe className="text-[#C22973] animate-pulse" size={14} />
            </div>
            <h1 className="text-slate-900 font-black text-xl tracking-tighter uppercase italic leading-none">
              Evento Online
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={limparRascunho}
            type="button"
            className="bg-white text-slate-700 px-5 py-4 rounded-[1.3rem] font-black uppercase text-[10px] tracking-[0.2em] border border-slate-200 hover:border-rose-200 hover:text-rose-500 transition-all flex items-center gap-2"
          >
            <Trash2 size={14} />
            Limpar
          </button>

          <button
            onClick={handleSalvar}
            disabled={isLoading}
            className="bg-black text-white px-8 py-4 rounded-[1.3rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#C22973] transition-all flex items-center gap-3 shadow-2xl disabled:opacity-50 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <span>Configurar Ingressos</span>
                <Sparkles size={14} className="text-pink-400" />
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <Layout size={20} />
                  </div>
                  <h2 className="font-black italic uppercase text-xs tracking-widest text-slate-800">
                    Dados da Experiência
                  </h2>
                </div>

                <button
                  onClick={handleIA}
                  disabled={isGeneratingIA}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-[#C22973] transition-all active:scale-95"
                >
                  {isGeneratingIA ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Wand2 size={12} />
                  )}
                  IA Linkah
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                  Nome do Evento
                </label>
                <input
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Webinar Internacional de Design"
                  className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold text-xl focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                    Categoria
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold text-slate-600 focus:border-pink-100 focus:bg-white transition-all shadow-inner appearance-none"
                  >
                    <option value="">Defina o estilo...</option>
                    <option value="Arte & Cultura">🎨 Arte & Cultura</option>
                    <option value="Entretenimento">🎭 Entretenimento</option>
                    <option value="Negócios">💼 Negócios</option>
                    <option value="Educação & Desenvolvimento">
                      🎓 Educação & Desenvolvimento
                    </option>
                    <option value="Esportes & Bem-estar">💙 Esportes & Bem-estar</option>
                    <option value="Experiências & Lifestyle">
                      ✨ Experiências & Lifestyle
                    </option>
                    <option value="Família & Comunidade">👥 Família & Comunidade</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                    Capacidade
                  </label>
                  <div className="relative">
                    <input
                      name="capacidade"
                      type="number"
                      value={formData.capacidade}
                      onChange={handleChange}
                      placeholder="Ilimitado"
                      className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                    />
                    <Users className="absolute right-8 top-6 text-slate-300" size={20} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Preço Base
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGratis}
                        onChange={handleToggleGratis}
                        className="rounded border-slate-300 text-black focus:ring-black w-4 h-4"
                      />
                      Gratuito
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      name="preco"
                      value={isGratis ? '0' : formData.preco}
                      onChange={handleChange}
                      disabled={isGratis}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold focus:border-pink-100 focus:bg-white transition-all shadow-inner disabled:opacity-50"
                    />
                    <Tag className="absolute right-8 top-6 text-slate-300" size={20} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    name="data_inicio"
                    value={formData.data_inicio}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                    Hora de Início
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    name="data_termino"
                    value={formData.data_termino}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                    Hora de Término
                  </label>
                  <input
                    type="time"
                    name="hora_termino"
                    value={formData.hora_termino}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                    Plataforma / Local do Evento
                  </label>
                  <div className="relative">
                    <input
                      name="local_nome"
                      value={formData.local_nome}
                      onChange={handleChange}
                      placeholder="Ex: Zoom, Google Meet, YouTube..."
                      className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                    />
                    <Building2
                      className="absolute right-8 top-6 text-slate-300"
                      size={20}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                    Moeda
                  </label>
                  <select
                    name="moeda"
                    value={formData.moeda}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold text-slate-600 focus:border-pink-100 focus:bg-white transition-all shadow-inner appearance-none"
                  >
                    <option value="BRL">R$ BRL</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                  Link da Reunião / Transmissão
                </label>
                <div className="relative">
                  <input
                    name="link_reuniao"
                    value={formData.link_reuniao}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                  />
                  <Link2 className="absolute right-8 top-6 text-slate-300" size={20} />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Clock size={20} />
                </div>
                <h2 className="font-black italic uppercase text-xs tracking-widest text-slate-800">
                  Descrição do Evento
                </h2>
              </div>

              <div className="border border-slate-100 rounded-[2rem] overflow-hidden bg-white">
                <MenuBar editor={editor} />
                <EditorContent editor={editor} />
              </div>
            </section>

            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                    Regras
                  </label>
                  <textarea
                    name="regras"
                    value={formData.regras}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Ex: Entrada permitida 10 minutos antes..."
                    className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-medium focus:border-pink-100 focus:bg-white transition-all shadow-inner resize-none"
                  />
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Visibilidade
                    </label>
                    <select
                      name="visibilidade"
                      value={formData.visibilidade}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                    >
                      <option value="Publico">Público</option>
                      <option value="Privado">Privado</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Pausado">Pausado</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <section className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-3">
                <ImageIcon className="text-[#C22973]" size={18} />
                <h3 className="font-black uppercase text-xs tracking-widest text-slate-800 italic">
                  Capa do Evento
                </h3>
              </div>

              <label className="block cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <div className="aspect-[4/5] rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    <img src={previewImage} alt="Capa" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon size={32} className="mx-auto mb-3" />
                      <p className="font-bold text-sm">Clique para enviar</p>
                    </div>
                  )}
                </div>
              </label>
            </section>

            <section className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-3">
                <ImageIcon className="text-[#C22973]" size={18} />
                <h3 className="font-black uppercase text-xs tracking-widest text-slate-800 italic">
                  Banner Patrocinador
                </h3>
              </div>

              <label className="block cursor-pointer">
                <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                <div className="aspect-[2/3] rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                  {previewBanner ? (
                    <img
                      src={previewBanner}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon size={32} className="mx-auto mb-3" />
                      <p className="font-bold text-sm">Clique para enviar</p>
                    </div>
                  )}
                </div>
              </label>
            </section>

            <section className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <Save className="text-[#C22973]" size={18} />
                <h3 className="font-black uppercase text-xs tracking-widest text-slate-800 italic">
                  Rascunho automático
                </h3>
              </div>

              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Tudo que a pessoa digitar aqui fica salvo automaticamente no navegador, inclusive descrição e imagens.
              </p>

              <button
                type="button"
                onClick={limparRascunho}
                className="w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Limpar Rascunho
              </button>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
