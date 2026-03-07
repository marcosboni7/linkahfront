'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ImageIcon,
  Calendar,
  Globe,
  X,
  Loader2,
  Users,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

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

        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto do canvas.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressed);
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem para compressão.'));
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📂 [DEBUG] Arquivo selecionado:', file);

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const originalBase64 = reader.result as string;
        console.log(
          '🖼️ [DEBUG] Imagem convertida para Base64 original. Tamanho:',
          originalBase64.length
        );

        const compressedBase64 = await compressImage(originalBase64);

        console.log(
          '⚡ [DEBUG] Imagem comprimida. Novo tamanho da string:',
          compressedBase64.length
        );

        setPreviewImage(compressedBase64);
      } catch (error) {
        console.error('❌ [DEBUG] Erro ao processar preview da imagem:', error);
        setPreviewImage(reader.result as string);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSalvar = async () => {
    const token = localStorage.getItem('@Linkah:Token');
    const userRaw = localStorage.getItem('@Linkah:User');
    let emailProdutor = '';

    console.log('🔑 [DEBUG] Token presente:', !!token);
    console.log('👤 [DEBUG] UserRaw presente:', !!userRaw);

    try {
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        console.log('👤 [DEBUG] Objeto de usuário decodificado:', userObj);
        emailProdutor =
          userObj.email ||
          userObj.user?.email ||
          userObj.data?.email ||
          localStorage.getItem('userEmail') ||
          '';
      }
    } catch (e) {
      console.error('❌ [DEBUG] Erro ao parsear userRaw:', e);
      emailProdutor = localStorage.getItem('userEmail') || '';
    }

    if (!token) {
      alert('Sessão expirada. Faça login novamente.');
      return;
    }

    if (!formData.nome.trim()) {
      alert('O nome do evento é obrigatório.');
      return;
    }

    if (!formData.categoria.trim()) {
      alert('A categoria do evento é obrigatória.');
      return;
    }

    if (!emailProdutor) {
      alert('Erro ao identificar produtor. Faça login novamente.');
      return;
    }

    setIsLoading(true);

    try {
      const dataToSend = new FormData();

      dataToSend.append('produtor_email', emailProdutor.trim());
      dataToSend.append('nome', formData.nome.trim());
      dataToSend.append('categoria', formData.categoria || 'Geral');
      dataToSend.append('status', formData.status || 'Ativo');
      dataToSend.append('descricao', formData.descricao || '');
      dataToSend.append('data_inicio', formData.data_inicio || '');
      dataToSend.append('hora_inicio', formData.hora_inicio || '');
      dataToSend.append('data_termino', formData.data_termino || '');
      dataToSend.append('hora_termino', formData.hora_termino || '');
      dataToSend.append('local_nome', formData.local_nome || 'Plataforma Online');
      dataToSend.append('link_reuniao', formData.link_reuniao || '');
      dataToSend.append('capacidade', formData.capacidade || '');
      dataToSend.append('tipo', 'Online');
      dataToSend.append('regras', formData.regras || '');
      dataToSend.append('visibilidade', formData.visibilidade || 'Publico');

      if (selectedFile) {
        dataToSend.append('imagem_capa', selectedFile);
        console.log('🖼️ [DEBUG] Arquivo de imagem anexado com sucesso.');
      } else {
        console.log('⚠️ [DEBUG] Nenhuma imagem selecionada para upload.');
      }

      const response = await fetch(`${API_URL}/api/eventos/novo-online`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: dataToSend
      });

      const result = await response.json();
      console.log('📥 [DEBUG] Resposta do Servidor:', result);

      if (response.ok) {
        router.push(`/dashboard/eventos/novo/ingressos/${result.id}`);
      } else {
        alert(`Erro: ${result.error || result.message || 'Falha ao registrar evento'}`);
      }
    } catch (error) {
      console.error('🚨 [DEBUG] Erro fatal no fetch:', error);
      alert('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans antialiased pb-24 text-slate-900">
      <header className="border-b border-slate-200/60 px-6 md:px-12 py-6 flex justify-between items-center bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center justify-center w-12 h-12 bg-white rounded-2xl transition-all shadow-sm border border-slate-100 hover:border-pink-200 active:scale-95"
          >
            <ChevronLeft size={20} className="text-slate-500 group-hover:text-[#C22973]" />
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-pink-100 text-[#C22973] px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
              Engine Online
            </span>
            <h1 className="text-slate-900 font-black text-xl tracking-tight uppercase italic flex items-center gap-2">
              <Globe className="text-[#C22973]" size={20} /> Criar Evento Online
            </h1>
          </div>
        </div>

        <button
          onClick={handleSalvar}
          disabled={isLoading}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-black transition-all flex items-center gap-3 shadow-xl disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <span>Próximo Passo</span>
              <Sparkles size={14} className="text-pink-400" />
            </>
          )}
        </button>
      </header>

      <main className="max-w-[1300px] mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-2">
                  Título da Experiência
                </label>
                <input
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Masterclass de Design ou Live Show"
                  className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl outline-none font-bold text-lg focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-2">
                    Vibe / Categoria
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl outline-none font-bold text-slate-600 focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                  >
                    <option value="">Selecione...</option>
                    <option value="Arte & Cultura">🎨 Arte & Cultura</option>
                    <option value="Experiências & Lifestyle">✨ Experiências & Lifestyle</option>
                    <option value="Tecnologia & Inovação">🚀 Tecnologia & Inovação</option>
                    <option value="Música & Performance">🎸 Música & Performance</option>
                    <option value="Educação & Workshops">📚 Educação & Workshops</option>
                    <option value="Família & Comunidade">👨‍👩‍👧 Família & Comunidade</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-2">
                    Capacidade Máxima
                  </label>
                  <div className="relative">
                    <input
                      name="capacidade"
                      type="number"
                      value={formData.capacidade}
                      onChange={handleChange}
                      placeholder="Ilimitado"
                      className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl outline-none font-bold focus:border-pink-100 focus:bg-white transition-all shadow-inner"
                    />
                    <Users className="absolute right-6 top-5 text-slate-300" size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-2">
                  Link da Transmissão (Zoom, Google Meet, YouTube...)
                </label>
                <input
                  name="link_reuniao"
                  value={formData.link_reuniao}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full bg-slate-900 text-pink-400 p-5 rounded-2xl outline-none font-mono text-sm border-2 border-slate-800 focus:border-[#C22973] transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-2">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Descreva sua experiência online..."
                  className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl outline-none font-medium text-slate-700 focus:border-pink-100 focus:bg-white transition-all shadow-inner resize-none"
                />
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8 italic">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-2">
                    Data de Início
                  </label>
                  <input
                    name="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={handleChange}
                    className="w-full bg-slate-50 p-5 rounded-3xl font-bold shadow-inner outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-2">
                    Hora de Início
                  </label>
                  <input
                    name="hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={handleChange}
                    className="w-full bg-slate-50 p-5 rounded-3xl font-bold shadow-inner outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-2">
                    Data de Término
                  </label>
                  <input
                    name="data_termino"
                    type="date"
                    value={formData.data_termino}
                    onChange={handleChange}
                    className="w-full bg-slate-50 p-5 rounded-3xl font-bold shadow-inner outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-2">
                    Hora de Término
                  </label>
                  <input
                    name="hora_termino"
                    type="time"
                    value={formData.hora_termino}
                    onChange={handleChange}
                    className="w-full bg-slate-50 p-5 rounded-3xl font-bold shadow-inner outline-none"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 sticky top-32">
              <h4 className="text-[10px] text-slate-400 font-black uppercase mb-6 text-center italic tracking-widest">
                Capa do Evento
              </h4>

              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl group">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setSelectedFile(null);
                        }}
                        className="bg-white w-12 h-12 rounded-2xl text-[#C22973] flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="aspect-[4/5] border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white hover:border-pink-200 transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon size={32} className="text-[#C22973]" />
                    </div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">
                      Upload Thumbnail
                    </p>
                    <p className="text-[9px] text-slate-400 mt-2">
                      Recomendado: 1080x1350px
                    </p>
                  </label>
                )}
              </div>

              <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pink-500 shadow-sm shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Visibilidade
                    </p>
                    <p className="text-xs font-bold text-slate-700">
                      Público (Listado no Marketplace)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}