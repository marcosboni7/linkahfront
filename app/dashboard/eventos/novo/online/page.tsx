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
  Layout
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Swal from 'sweetalert2';

const API_URL = 'https://linkah-api.onrender.com';

export default function NovoEventoOnline() {
  const { t }: any = useLanguage();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  // Função de compressão para não sobrecarregar o upload em conexões móveis
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

  const handleSalvar = async () => {
    const token = localStorage.getItem('@Linkah:Token');
    const userRaw = localStorage.getItem('@Linkah:User');
    let emailProdutor = '';

    try {
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        emailProdutor = userObj.email || userObj.user?.email || userObj.data?.email || '';
      }
    } catch (e) {
      emailProdutor = localStorage.getItem('userEmail') || '';
    }

    // Validações básicas com SweetAlert para manter o estilo
    if (!formData.nome || !formData.categoria || !formData.data_inicio) {
        Swal.fire({
            title: 'CAMPOS OBRIGATÓRIOS',
            text: 'Nome, categoria e data de início são fundamentais para o provisionamento.',
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
      Object.entries(formData).forEach(([key, value]) => {
        dataToSend.append(key, value);
      });

      if (selectedFile) dataToSend.append('imagem_capa', selectedFile);

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
      Swal.fire('Erro de Conexão', 'Não foi possível contatar o servidor Linkah.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] font-sans antialiased pb-24 text-slate-900">
      
      {/* HEADER ESTRUTURAL */}
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
          
          {/* COLUNA DE FORMULÁRIO */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* CARD: INFORMAÇÕES BÁSICAS */}
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <Layout size={20} />
                 </div>
                 <h2 className="font-black italic uppercase text-xs tracking-widest text-slate-800">Dados da Experiência</h2>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                  Nome do Evento
                </label>
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
                    <option value="Tecnologia & Inovação">🚀 Tecnologia & Inovação</option>
                    <option value="Música & Performance">🎸 Música & Performance</option>
                    <option value="Educação & Workshops">📚 Educação & Workshops</option>
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
                <p className="text-[9px] text-slate-400 ml-4 font-medium uppercase tracking-tighter">O link será enviado automaticamente após a confirmação do pagamento.</p>
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

            {/* CARD: CRONOGRAMA */}
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <Clock size={20} />
                 </div>
                 <h2 className="font-black italic uppercase text-xs tracking-widest text-slate-800">Cronograma</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Check-in / Início</label>
                  <div className="flex gap-4">
                    <input name="data_inicio" type="date" value={formData.data_inicio} onChange={handleChange} className="flex-1 bg-slate-50 p-5 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" />
                    <input name="hora_inicio" type="time" value={formData.hora_inicio} onChange={handleChange} className="w-32 bg-slate-50 p-5 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Checkout / Término</label>
                  <div className="flex gap-4">
                    <input name="data_termino" type="date" value={formData.data_termino} onChange={handleChange} className="flex-1 bg-slate-50 p-5 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" />
                    <input name="hora_termino" type="time" value={formData.hora_termino} onChange={handleChange} className="w-32 bg-slate-50 p-5 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* COLUNA LATERAL: PREVIEW DA CAPA */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-slate-100 sticky top-32">
              <h4 className="text-[9px] text-slate-300 font-black uppercase mb-8 text-center tracking-[0.4em] italic">
                Media Center
              </h4>

              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-white">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => { setPreviewImage(null); setSelectedFile(null); }}
                        className="bg-white w-14 h-14 rounded-3xl text-[#C22973] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="aspect-[3/4] border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white hover:border-pink-200 transition-all group overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <ImageIcon size={36} className="text-[#C22973]" />
                    </div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest italic">Capa do Evento</p>
                    <p className="text-[9px] text-slate-400 mt-2 font-medium">PNG, JPG até 10MB</p>
                  </label>
                )}
              </div>

              <div className="mt-10 p-6 bg-slate-50/80 rounded-[2.5rem] border border-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Acesso Global</p>
                    <p className="text-[11px] font-bold text-slate-700 uppercase italic">Visível em Linkah.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 text-center border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Linkah Cloud Nodes &copy; 2026</p>
      </footer>
    </div>
  );
}