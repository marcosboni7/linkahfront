'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ImageIcon,
  Calendar,
  Globe,
  X,
  Loader2,
  Users,
  Sparkles,
  Link2,
  Clock,
  Layout,
  Building2,
  Wand2 // Ícone extra para o botão de IA
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Swal from 'sweetalert2';

const API_URL = 'https://api-linkah.onrender.com';

export default function NovoEventoOnline() {
  const { t }: any = useLanguage();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false); // State para o loading da IA
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
    local_nome: 'Plataforma Online',
    link_reuniao: '',
    capacidade: '',
    tipo: 'Online',
    regras: '',
    visibilidade: 'Publico'
  });

  // --- FUNÇÃO PARA GERAR COM IA ---
  const handleIA = async () => {
    const { value: text } = await Swal.fire({
      title: 'GERADOR INTELIGENTE',
      input: 'textarea',
      inputLabel: 'Cole o texto do seu evento (WhatsApp, E-mail, Post)',
      inputPlaceholder: 'Ex: Workshop de React dia 20/05 as 19h no Zoom...',
      showCancelButton: true,
      confirmButtonText: 'Gerar Dados ✨',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#000',
      inputAttributes: { 'aria-label': 'Texto do evento' },
      customClass: { popup: 'rounded-[2rem] font-sans', input: 'rounded-xl' }
    });

    if (!text) return;

    setIsGeneratingIA(true);
    const token = localStorage.getItem('@Linkah:Token');

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
          // Garante que campos vazios da IA não sobrescrevam o padrão "Online"
          tipo: 'Online',
          local_nome: data.local_nome || 'Plataforma Online'
        }));
        
        Swal.fire({
          icon: 'success',
          title: 'DADOS EXTRAÍDOS',
          text: 'Revise os campos preenchidos pela IA.',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[2rem]' }
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire('Erro na IA', 'Não conseguimos processar esse texto agora.', 'error');
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1080;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas Context Error'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const originalBase64 = reader.result as string;
      try {
        const compressed = await compressImage(originalBase64);
        setPreviewImage(compressed);
      } catch {
        setPreviewImage(originalBase64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedBanner(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewBanner(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSalvar = async () => {
    const token = localStorage.getItem('@Linkah:Token');
    const userRaw = localStorage.getItem('@Linkah:User');
    let emailProdutor = '';
    let nomeUsuario = '';

    try {
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        emailProdutor = userObj.email || userObj.user?.email || userObj.data?.email || '';
        nomeUsuario = userObj.nome || userObj.user?.nome || userObj.data?.nome || userObj.username || '';
      }
    } catch (e) {
      emailProdutor = localStorage.getItem('userEmail') || '';
      nomeUsuario = localStorage.getItem('userName') || 'Admin';
    }

    if (!formData.nome || !formData.categoria || !formData.data_inicio) {
        Swal.fire({
            title: 'CAMPOS OBRIGATÓRIOS',
            text: 'Nome, categoria e data de início são fundamentais.',
            icon: 'warning',
            confirmButtonColor: '#000',
            customClass: { popup: 'rounded-[2rem]' }
        });
        return;
    }

    setIsLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append('produtor_email', emailProdutor.trim());
      dataToSend.append('usuario_nome', nomeUsuario.trim());

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
        Swal.fire('Erro', result.error || 'Falha ao registrar evento', 'error');
      }
    } catch (error) {
      Swal.fire('Erro de Conexão', 'Não foi possível contatar o servidor.', 'error');
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
               <span className="bg-black text-[8px] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
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
          className="bg-black text-white px-8 py-4 rounded-[1.3rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#C22973] transition-all flex items-center gap-3 shadow-2xl shadow-slate-200 disabled:opacity-50 active:scale-95"
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
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <Layout size={20} />
                    </div>
                    <h2 className="font-black italic uppercase text-xs tracking-widest text-slate-800">Dados da Experiência</h2>
                  </div>

                  {/* BOTÃO DA IA */}
                  <button 
                    onClick={handleIA}
                    disabled={isGeneratingIA}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isGeneratingIA ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    {isGeneratingIA ? 'Processando...' : 'Preencher com IA'}
                  </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Nome do Evento</label>
                <input
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Workshop Internacional de UX Design"
                  className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none font-bold text-xl focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    <option value="Família & Comunidade">👥 Família & Comunidade</option>
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
                  className="w-full bg-slate-900 text-pink-400 p-6 rounded-2xl outline-none font-mono text-sm border-2 border-slate-800 focus:border-[#C22973] transition-all shadow-2xl"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Sobre o Evento</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={5}
                  placeholder="O que os participantes podem esperar?"
                  className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2.5rem] outline-none font-medium text-slate-700 focus:border-pink-100 focus:bg-white transition-all shadow-inner resize-none"
                />
              </div>
            </section>

            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <Clock size={20} />
                 </div>
                 <h2 className="font-black italic uppercase text-xs tracking-widest text-slate-800">Cronograma</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Início</label>
                  <div className="flex gap-4">
                    <input name="data_inicio" type="date" value={formData.data_inicio} onChange={handleChange} className="flex-1 bg-slate-50 p-5 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" />
                    <input name="hora_inicio" type="time" value={formData.hora_inicio} onChange={handleChange} className="w-32 bg-slate-50 p-5 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Término</label>
                  <div className="flex gap-4">
                    <input name="data_termino" type="date" value={formData.data_termino} onChange={handleChange} className="flex-1 bg-slate-50 p-5 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" />
                    <input name="hora_termino" type="time" value={formData.hora_termino} onChange={handleChange} className="w-32 bg-slate-50 p-5 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-slate-100">
              <h4 className="text-[9px] text-slate-300 font-black uppercase mb-8 text-center tracking-[0.4em] italic">Media Center: Capa</h4>
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-white">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <button type="button" onClick={() => { setPreviewImage(null); setSelectedFile(null); }} className="absolute top-6 right-6 bg-white w-14 h-14 rounded-3xl text-[#C22973] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                      <X size={24} />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-[3/4] border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white hover:border-pink-200 transition-all group overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-all">
                      <ImageIcon size={36} className="text-[#C22973]" />
                    </div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest italic">Capa do Evento</p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-slate-100">
              <h4 className="text-[9px] text-slate-300 font-black uppercase mb-8 text-center tracking-[0.4em] italic">Media Center: Patrocínio</h4>
              <div className="relative">
                {previewBanner ? (
                  <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl group border-4 border-white">
                    <img src={previewBanner} alt="Patrocinador" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => {setPreviewBanner(null); setSelectedBanner(null);}} className="absolute top-4 right-4 bg-white/90 backdrop-blur w-10 h-10 rounded-2xl text-slate-900 shadow-xl flex items-center justify-center hover:scale-110">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-video border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white hover:border-blue-200 transition-all group">
                    <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                        <Building2 size={24} className="text-blue-500" />
                    </div>
                    <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">Banner Patrocinador</p>
                  </label>
                )}
              </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-[3.5rem] text-white">
                <div className="flex items-center gap-4 mb-4">
                  <Globe className="text-emerald-400" size={20} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Setup de Nuvem</p>
                </div>
                <p className="text-[11px] opacity-60 font-bold uppercase italic leading-relaxed">
                  O ambiente virtual será provisionado automaticamente após a criação.
                </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}