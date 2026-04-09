'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft, ImageIcon, Globe, X, Loader2,
  Users, Sparkles, Link2, Clock, Layout,
  Building2, Wand2, Bold, Italic, List, 
  ListOrdered, Palette
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Swal from 'sweetalert2';

// --- IMPORTS TIPTAP (RICHTEXT) ---
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';

const API_URL = 'https://api-linkah.onrender.com';

// --- SUB-COMPONENTE: BARRA DE FERRAMENTAS DO EDITOR ---
const MenuBar = ({ editor }: any) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 sticky top-0 z-10">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-xl transition-all ${editor.isActive('bold') ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-pink-500'}`}
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-xl transition-all ${editor.isActive('italic') ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-pink-500'}`}
      >
        <Italic size={18} />
      </button>
      <div className="w-[1px] h-8 bg-slate-200 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-xl transition-all ${editor.isActive('bulletList') ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-pink-500'}`}
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-xl transition-all ${editor.isActive('orderedList') ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-pink-500'}`}
      >
        <ListOrdered size={18} />
      </button>
      <div className="w-[1px] h-8 bg-slate-200 mx-1" />
      <div className="flex items-center gap-2 bg-white px-3 rounded-xl border border-slate-100">
        <Palette size={16} className="text-slate-400" />
        <input
          type="color"
          onInput={(event: any) => editor.chain().focus().setColor(event.target.value).run()}
          value={editor.getAttributes('textStyle').color || '#64748b'}
          className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
        />
      </div>
    </div>
  );
};

export default function NovoEventoOnline() {
  const { t }: any = useLanguage();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    status: 'Ativo',
    descricao: '', // Será atualizado pelo TipTap
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
    visibilidade: 'Publico'
  });

  // --- CONFIGURAÇÃO DO TIPTAP ---
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: 'Descreva a experiência digital, adicione links importantes ou cronograma da live...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, descricao: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[200px] p-6 text-slate-600 font-medium leading-relaxed',
      },
    },
  });

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
      if (previewBanner) URL.revokeObjectURL(previewBanner);
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
      customClass: { popup: 'rounded-[2rem] font-sans' }
    });

    if (!text) return;

    setIsGeneratingIA(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('@Linkah:Token') : null;

    try {
      const response = await fetch(`${API_URL}/api/eventos/gerar-ia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ texto: text })
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          ...data,
          tipo: 'Online',
          local_nome: data.local_nome || 'Plataforma Online'
        }));

        if (data.descricao) {
            editor?.commands.setContent(data.descricao);
        }

        Swal.fire({
          icon: 'success',
          title: 'DADOS EXTRAÍDOS',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[2rem]' }
        });
      }
    } catch (error) {
      Swal.fire('Erro na IA', 'Não conseguimos processar agora.', 'error');
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedBanner(file);
    setPreviewBanner(URL.createObjectURL(file));
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
    } catch (e) { nomeUsuario = 'Admin'; }

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
        dataToSend.append(key, value);
      });

      if (selectedFile) dataToSend.append('imagem_capa', selectedFile);
      if (selectedBanner) dataToSend.append('banner_patrocinio', selectedBanner);

      const response = await fetch(`${API_URL}/api/eventos/novo-online`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend
      });

      const result = await response.json();
      if (response.ok) {
        router.push(`/dashboard/eventos/novo/ingressos/${result.id}`);
      } else {
        Swal.fire('Erro', result.error || 'Erro ao salvar', 'error');
      }
    } catch (error) {
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
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            {/* --- SEÇÃO PRINCIPAL --- */}
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <Layout size={20} />
                  </div>
                  <h2 className="font-black italic uppercase text-xs tracking-widest text-slate-800">Dados da Experiência</h2>
                </div>

                <button
                  onClick={handleIA}
                  disabled={isGeneratingIA}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-[#C22973] transition-all active:scale-95"
                >
                  {isGeneratingIA ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                  IA Linkah
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Nome do Evento</label>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Categoria</label>
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
                    <option value="Educação & Desenvolvimento">🎓 Educação & Desenvolvimento</option>
                    <option value="Esportes & Bem-estar">💙 Esportes & Bem-estar</option>
                    <option value="Experiências & Lifestyle">✨ Experiências & Lifestyle</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Capacidade</label>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Moeda</label>
                  <select
                    name="moeda"
                    value={formData.moeda}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold text-slate-600 focus:border-pink-100 focus:bg-white transition-all shadow-inner appearance-none"
                  >
                    <option value="BRL">🇧🇷 Real (BRL)</option>
                    <option value="EUR">🇪🇺 Euro (EUR)</option>
                    <option value="USD">🇺🇸 Dólar (USD)</option>
                  </select>
                </div>
              </div>

              {/* TRANSFORMEI DESCRIÇÃO EM RICH TEXT */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Sobre o Evento (Editor)</label>
                <div className="bg-slate-50 rounded-[2.5rem] p-2 border-2 border-transparent focus-within:border-pink-100 transition-all shadow-inner bg-white overflow-hidden">
                  <MenuBar editor={editor} />
                  <div className="max-h-[400px] overflow-y-auto">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 ml-2">
                  <Link2 size={14} className="text-[#C22973]" />
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Link da Transmissão</label>
                </div>
                <input
                  name="link_reuniao"
                  value={formData.link_reuniao}
                  onChange={handleChange}
                  placeholder="https://zoom.us/j/..."
                  className="w-full bg-slate-900 text-pink-400 p-6 rounded-2xl outline-none font-mono text-sm border-2 border-slate-800 focus:border-[#C22973] transition-all"
                />
              </div>
            </section>

            {/* --- CRONOGRAMA --- */}
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><Clock size={20} /></div>
                <h2 className="font-black italic uppercase text-xs tracking-widest text-slate-800">Datas & Horários</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Início</label>
                  <div className="flex gap-4">
                    <input name="data_inicio" type="date" value={formData.data_inicio} onChange={handleChange} className="flex-1 bg-slate-50 p-5 rounded-2xl font-bold outline-none" />
                    <input name="hora_inicio" type="time" value={formData.hora_inicio} onChange={handleChange} className="w-32 bg-slate-50 p-5 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Término</label>
                  <div className="flex gap-4">
                    <input name="data_termino" type="date" value={formData.data_termino} onChange={handleChange} className="flex-1 bg-slate-50 p-5 rounded-2xl font-bold outline-none" />
                    <input name="hora_termino" type="time" value={formData.hora_termino} onChange={handleChange} className="w-32 bg-slate-50 p-5 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* MEDIA CENTER: CAPA */}
            <div className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-slate-100">
              <h4 className="text-[9px] text-slate-300 font-black uppercase mb-8 text-center tracking-[0.4em] italic">Media Center: Capa</h4>
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-white">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <button type="button" onClick={() => { setPreviewImage(null); setSelectedFile(null); }} className="absolute top-6 right-6 bg-white w-14 h-14 rounded-3xl text-[#C22973] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"><X size={24} /></button>
                  </div>
                ) : (
                  <label className="aspect-[3/4] border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white hover:border-pink-200 transition-all group overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-all"><ImageIcon size={36} className="text-[#C22973]" /></div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest italic">Capa do Evento</p>
                  </label>
                )}
              </div>
            </div>

            {/* BANNER PATROCÍNIO */}
            <div className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-slate-100">
              <h4 className="text-[9px] text-slate-300 font-black uppercase mb-8 text-center tracking-[0.4em] italic">Media Center: Patrocínio</h4>
              <div className="relative">
                {previewBanner ? (
                  <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl group border-4 border-white">
                    <img src={previewBanner} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setPreviewBanner(null); setSelectedBanner(null); }} className="absolute top-4 right-4 bg-white/90 backdrop-blur w-10 h-10 rounded-2xl text-slate-900 shadow-xl flex items-center justify-center hover:scale-110"><X size={20} /></button>
                  </div>
                ) : (
                  <label className="aspect-video border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white transition-all group">
                    <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                    <Building2 size={24} className="text-blue-500 mb-3" />
                    <p className="text-[9px] font-black uppercase italic">Banner Patrocinador</p>
                  </label>
                )}
              </div>
            </div>

            {/* SETUP NUVEM */}
            <div className="p-8 bg-slate-900 rounded-[3.5rem] text-white">
              <div className="flex items-center gap-4 mb-4">
                <Globe className="text-emerald-400" size={20} />
                <p className="text-[10px] font-black uppercase tracking-widest italic">Setup de Nuvem</p>
              </div>
              <p className="text-[11px] opacity-60 font-bold leading-relaxed uppercase">O ambiente virtual será provisionado automaticamente após a criação.</p>
              <p className="mt-4 text-[11px] font-black uppercase text-pink-300">Moeda: {formData.moeda}</p>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}