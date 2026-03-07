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
  Info, 
  Link as LinkIcon, 
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
    tipo: 'online', 
    regras: '',
    visibilidade: 'Publico'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // IMPORTANTE: Guardamos o arquivo bruto aqui
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSalvar = async () => {
    const token = localStorage.getItem('@Linkah:Token');
    const userRaw = localStorage.getItem('@Linkah:User');
    let emailProdutor = '';

    try {
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        emailProdutor = userObj.email || userObj.user?.email || userObj.data?.email;
      }
    } catch (e) {
      console.error("Erro ao processar user:", e);
    }

    if (!token || !emailProdutor || !formData.nome) {
      alert("Por favor, preencha o nome do evento e verifique seu login.");
      return;
    }

    setIsLoading(true);

    try {
      // Voltamos para FormData para o arquivo ser processado como binário (image/jpeg, etc)
      const dataToSend = new FormData();
      
      // 1. Campos de texto OBRIGATÓRIOS primeiro
      dataToSend.append('produtor_email', emailProdutor);
      dataToSend.append('nome', formData.nome);
      
      // 2. Outros campos
      dataToSend.append('tipo', 'online');
      dataToSend.append('cidade', 'Online');
      dataToSend.append('estado', 'ON');
      dataToSend.append('link_reuniao', formData.link_reuniao);
      dataToSend.append('descricao', formData.descricao);
      dataToSend.append('categoria', formData.categoria);
      dataToSend.append('data_inicio', formData.data_inicio);
      dataToSend.append('hora_inicio', formData.hora_inicio);
      dataToSend.append('capacidade', formData.capacidade || '0');
      dataToSend.append('status', 'Ativo');
      dataToSend.append('visibilidade', 'Publico');

      // 3. O ARQUIVO REAL (não o preview em base64)
      if (selectedFile) {
        dataToSend.append('imagem_capa', selectedFile);
      }

      const response = await fetch(`${API_URL}/api/eventos/novo-online`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
          // SEM Content-Type aqui, o navegador resolve o boundary
        },
        body: dataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        router.push(`/dashboard/eventos/novo/ingressos/${result.id}`);
      } else {
        alert(`Erro: ${result.message || result.error}`);
      }
    } catch (error) {
      alert("Falha ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans antialiased pb-24 text-slate-900">
      <header className="border-b border-slate-200/60 px-6 md:px-12 py-6 flex justify-between items-center bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <button onClick={() => router.back()} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
            <ChevronLeft size={20} className="text-slate-500" />
          </button>
          <h1 className="text-slate-900 font-black text-xl uppercase italic flex items-center gap-2">
            <Globe className="text-[#C22973]" size={20} /> Evento Online
          </h1>
        </div>

        <button 
          onClick={handleSalvar} 
          disabled={isLoading}
          className="bg-slate-900 text-white px-8 md:px-12 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl disabled:opacity-50 flex items-center gap-3"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Próximo Passo"}
        </button>
      </header>

      <main className="max-w-[1300px] mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase">Título do Evento</label>
                <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Masterclass de Marketing" className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase">Categoria</label>
                  <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold">
                    <option value="">Selecione...</option>
                    <option value="Educação">Educação</option>
                    <option value="Entretenimento">Entretenimento</option>
                    <option value="Tecnologia">Tecnologia</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase">Link da Transmissão</label>
                  <input name="link_reuniao" value={formData.link_reuniao} onChange={handleChange} placeholder="https://..." className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase">Descrição</label>
                <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={4} className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
              <h4 className="text-[10px] text-slate-400 font-black uppercase mb-6 text-center">Capa do Evento</h4>
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => {setPreviewImage(null); setSelectedFile(null);}} className="absolute top-4 right-4 bg-white w-10 h-10 rounded-xl text-red-500 flex items-center justify-center">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-[4/5] border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 cursor-pointer flex flex-col items-center justify-center hover:bg-white transition-all">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <ImageIcon size={32} className="text-slate-300 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Upload Imagem</p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
              <h4 className="text-[10px] font-black uppercase mb-4 tracking-widest">Data e Hora</h4>
              <div className="space-y-4">
                <input name="data_inicio" value={formData.data_inicio} onChange={handleChange} type="date" className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold" />
                <input name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} type="time" className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}