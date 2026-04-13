'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  ImageIcon,
  Search,
  MapPin,
  Loader2,
  Users,
  Sparkles,
  Navigation,
  Clock,
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
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Swal from 'sweetalert2';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';

const API_URL = 'https://api-linkah.onrender.com';
const DRAFT_KEY = '@Linkah:NovoEventoPresencial:Draft';

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

export default function NovoEventoPresencial() {
  const { t }: any = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRestoringDraft, setIsRestoringDraft] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<any>(null);
  const marker = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    status: 'Ativo',
    descricao: '',
    data_inicio: '',
    hora_inicio: '',
    data_termino: '',
    hora_termino: '',
    local_nome: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    cidade: '',
    estado: '',
    capacidade: '',
    tipo: 'Presencial',
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
          'Conte os detalhes da experiência, use negrito para destacar e listas para cronogramas...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, descricao: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none focus:outline-none min-h-[250px] p-6 text-slate-600 font-medium leading-relaxed',
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
        console.error('❌ Erro ao restaurar rascunho presencial:', error);
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
        console.error('❌ Erro ao salvar rascunho presencial:', error);
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

  const handleGerarComIA = async () => {
    const { value: text } = await Swal.fire({
      title: 'Gerar Evento com IA',
      input: 'textarea',
      inputLabel: 'Cole aqui o texto do evento (ex: post do insta, mensagem de zap...)',
      inputPlaceholder: 'Ex: Workshop de Design dia 20/05 às 14h no SESC...',
      showCancelButton: true,
      confirmButtonText: 'Mágica! ✨',
      confirmButtonColor: '#C22973',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'rounded-[2rem]' },
    });

    if (!text) return;

    setIsAiLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/eventos/gerar-ia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: text }),
      });

      if (!response.ok) throw new Error('Falha na IA');
      const aiData = await response.json();

      setFormData((prev) => ({
        ...prev,
        nome: aiData.nome || prev.nome,
        categoria: aiData.categoria || prev.categoria,
        data_inicio: aiData.data_inicio || prev.data_inicio,
        hora_inicio: aiData.hora_inicio || prev.hora_inicio,
        data_termino: aiData.data_termino || aiData.data_inicio || prev.data_termino,
        hora_termino: aiData.hora_termino || prev.hora_termino,
        local_nome: aiData.local_nome || prev.local_nome,
        endereco: aiData.rua || prev.endereco,
        numero: aiData.numero || prev.numero,
        cidade: aiData.cidade || prev.cidade,
        estado: aiData.estado || prev.estado,
        cep: aiData.cep || prev.cep,
        capacidade: aiData.capacidade || prev.capacidade,
        moeda: aiData.moeda || prev.moeda,
      }));

      if (aiData.descricao) {
        editor?.commands.setContent(aiData.descricao);
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Campos preenchidos!',
        showConfirmButton: false,
        timer: 3000,
      });
    } catch {
      Swal.fire('Erro', 'A IA não conseguiu processar esse texto.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const initGoogleMaps = useCallback(async () => {
    if (typeof window === 'undefined' || !window.google || !mapContainerRef.current) {
      return;
    }
    if (googleMap.current) return;

    try {
      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        window.google.maps.importLibrary('maps') as any,
        window.google.maps.importLibrary('marker') as any,
      ]);

      const { Autocomplete } = (await window.google.maps.importLibrary(
        'places'
      )) as any;

      googleMap.current = new Map(mapContainerRef.current, {
        center: { lat: -23.5505, lng: -46.6333 },
        zoom: 15,
        mapId: 'LINKAH_MAP_ID',
        disableDefaultUI: true,
      });

      marker.current = new AdvancedMarkerElement({
        map: googleMap.current,
        position: { lat: -23.5505, lng: -46.6333 },
      });

      if (searchInputRef.current && !autocompleteRef.current) {
        autocompleteRef.current = new Autocomplete(searchInputRef.current, {
          types: ['establishment', 'geocode'],
          fields: ['address_components', 'formatted_address', 'name', 'geometry'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          googleMap.current.setCenter(place.geometry.location);
          googleMap.current.setZoom(17);
          marker.current.position = place.geometry.location;

          const getComp = (type: string) =>
            place.address_components?.find((c: any) => c.types.includes(type))
              ?.long_name || '';

          setFormData((prev) => ({
            ...prev,
            local_nome: place.name || prev.local_nome,
            endereco: getComp('route'),
            numero: getComp('street_number'),
            cep: getComp('postal_code').replace(/\D/g, ''),
            cidade: getComp('administrative_area_level_2') || getComp('locality'),
            estado:
              place.address_components?.find((c: any) =>
                c.types.includes('administrative_area_level_1')
              )?.short_name || '',
          }));
        });
      }
    } catch (error) {
      console.error('Erro no mapa:', error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(initGoogleMaps, 500);
    return () => clearTimeout(timer);
  }, [initGoogleMaps]);

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith('blob:')) URL.revokeObjectURL(previewImage);
      if (previewBanner?.startsWith('blob:')) URL.revokeObjectURL(previewBanner);
    };
  }, [previewImage, previewBanner]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile(file);
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedBanner(file);
      setPreviewBanner(reader.result as string);
    };
    reader.readAsDataURL(file);
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

    if (!token) {
      Swal.fire('Erro', 'Sessão expirada', 'warning');
      return;
    }

    setIsLoading(true);
    const dataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) dataToSend.append(key, value.toString());
    });

    dataToSend.append('produtor_email', emailProdutor);
    dataToSend.append('usuario_nome', nomeUsuario);

    if (selectedFile) dataToSend.append('imagem_capa', selectedFile);
    if (selectedBanner) dataToSend.append('banner_patrocinio', selectedBanner);

    try {
      const response = await fetch(`${API_URL}/api/eventos/novo-presencial`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem(DRAFT_KEY);
        router.push(`/dashboard/eventos/novo/ingressos/${data.id || data.evento?.id}`);
      } else {
        Swal.fire('Erro', data.message || 'Erro ao salvar', 'error');
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
            <h1 className="text-slate-900 font-black text-xl tracking-tighter uppercase italic flex items-center gap-2">
              <MapPin className="text-[#C22973]" size={18} />
              Novo Evento Presencial
            </h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">
              Step 01: Core Information
            </p>
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
            className="bg-black text-white px-10 py-4 rounded-[1.3rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#C22973] transition-all shadow-xl disabled:opacity-50 flex items-center gap-3 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                Próximo Passo <Sparkles size={14} className="text-pink-400" />
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <div className="space-y-6">
                <div className="space-y-3 relative">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Título da Experiência
                    </label>
                    <button
                      onClick={handleGerarComIA}
                      disabled={isAiLoading}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#C22973] transition-all active:scale-95"
                    >
                      {isAiLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Wand2 size={12} />
                      )}
                      IA Linkah
                    </button>
                  </div>

                  <input
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: Festival de Jazz 2026"
                    className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-xl focus:bg-white border-2 border-transparent focus:border-pink-100 transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Vibe / Categoria
                    </label>
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-slate-600 focus:bg-white border-2 border-transparent focus:border-pink-100 transition-all shadow-inner appearance-none"
                    >
                      <option value="">Selecione...</option>
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
                      Capacidade Estimada
                    </label>
                    <div className="relative">
                      <input
                        name="capacidade"
                        value={formData.capacidade}
                        onChange={handleChange}
                        type="number"
                        placeholder="0"
                        className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-slate-800 shadow-inner"
                      />
                      <Users className="absolute right-8 top-6 text-slate-300" size={20} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Moeda do Evento
                    </label>
                    <select
                      name="moeda"
                      value={formData.moeda}
                      onChange={handleChange}
                      className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-slate-600 focus:bg-white border-2 border-transparent focus:border-pink-100 transition-all shadow-inner appearance-none"
                    >
                      <option value="BRL">R$ BRL</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Data de Início
                    </label>
                    <input
                      name="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={handleChange}
                      className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Hora de Início
                    </label>
                    <input
                      name="hora_inicio"
                      type="time"
                      value={formData.hora_inicio}
                      onChange={handleChange}
                      className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Data de Término
                    </label>
                    <input
                      name="data_termino"
                      type="date"
                      value={formData.data_termino}
                      onChange={handleChange}
                      className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Hora de Término
                    </label>
                    <input
                      name="hora_termino"
                      type="time"
                      value={formData.hora_termino}
                      onChange={handleChange}
                      className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                  Buscar local
                </label>
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    placeholder="Pesquise o local do evento..."
                    className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                  />
                  <Search className="absolute right-8 top-6 text-slate-300" size={20} />
                </div>
              </div>

              <div
                ref={mapContainerRef}
                className="w-full h-[320px] rounded-[2rem] bg-slate-100 overflow-hidden"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input
                  name="local_nome"
                  value={formData.local_nome}
                  onChange={handleChange}
                  placeholder="Nome do local"
                  className="bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                />

                <input
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="CEP"
                  className="bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                />

                <input
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Endereço"
                  className="bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                />

                <input
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="Número"
                  className="bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                />

                <input
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  placeholder="Complemento"
                  className="bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                />

                <input
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  placeholder="Cidade"
                  className="bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                />

                <input
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  placeholder="Estado"
                  className="bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                />
              </div>
            </section>

            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-3">
                <Navigation className="text-[#C22973]" size={18} />
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
                <textarea
                  name="regras"
                  value={formData.regras}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Regras do evento"
                  className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-medium shadow-inner resize-none"
                />

                <div className="space-y-6">
                  <select
                    name="visibilidade"
                    value={formData.visibilidade}
                    onChange={handleChange}
                    className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                  >
                    <option value="Publico">Público</option>
                    <option value="Privado">Privado</option>
                  </select>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold shadow-inner"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Pausado">Pausado</option>
                  </select>
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
                Mesmo se a pessoa sair da página, os dados voltam quando ela abrir novamente.
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