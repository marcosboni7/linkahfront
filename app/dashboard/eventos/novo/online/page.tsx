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
  Info, 
  Ticket, 
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
    url_transmissao: '',
    capacidade: '',
    tipo: 'Online',
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
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSalvar = async () => {
    console.log("🚀 Iniciando envio do evento ONLINE...");
    
    const token = localStorage.getItem('@Linkah:Token');
    const userRaw = localStorage.getItem('@Linkah:User');
    let emailProdutor = '';

    try {
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        emailProdutor = userObj.email || userObj.user?.email;
      }
      if (!emailProdutor) emailProdutor = localStorage.getItem('userEmail') || '';
    } catch (e) {
      console.error("Erro ao processar user local");
    }

    if (!token || !emailProdutor) {
      alert("Sessão expirada. Faça login novamente.");
      router.push('/auth/login');
      return;
    }

    if (!formData.nome || !formData.data_inicio || !formData.categoria) {
      alert("Preencha Nome, Data e Categoria.");
      return;
    }

    setIsLoading(true);

    try {
      const dataToSend = new FormData();
      
      // 1. Adiciona os campos do formulário
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'capacidade') {
          dataToSend.append(key, value === '' ? '0' : value);
        } else {
          dataToSend.append(key, value);
        }
      });
      
      // 2. Adiciona campos obrigatórios que o backend espera (mesmo sendo online)
      dataToSend.append('produtor_email', emailProdutor);
      dataToSend.append('cidade', 'Online');
      dataToSend.append('estado', 'ON');
      
      // 3. Anexa o arquivo de imagem
      if (selectedFile) {
        dataToSend.append('imagem_capa', selectedFile);
        console.log("📸 Imagem anexada com sucesso.");
      } else {
        console.warn("⚠️ Nenhuma imagem selecionada.");
      }

      const response = await fetch(`${API_URL}/api/eventos/novo-online`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`
            // Nota: O navegador define o Content-Type automaticamente para multipart/form-data
        },
        body: dataToSend,
      });

      const result = await response.json();
      console.log("📡 Resposta API:", result);

      if (response.ok) {
        router.push(`/dashboard/eventos/novo/ingressos/${result.id}`);
      } else {
        alert(`Erro: ${result.message || "Erro ao salvar"}`);
      }
    } catch (error) {
      console.error("🚨 Erro de Rede:", error);
      alert("Falha ao conectar com o servidor AWS.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans antialiased pb-24 text-slate-900">
      <header className="border-b border-slate-200/60 px-6 md:px-12 py-6 flex justify-between items-center bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <button onClick={() => router.back()} className="group flex items-center justify-center w-12 h-12 bg-white rounded-2xl transition-all shadow-sm border border-slate-100 hover:border-pink-200 active:scale-95">
            <ChevronLeft size={20} className="text-slate-500 group-hover:text-[#C22973]" />
          </button>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-pink-100 text-[#C22973] px-2 py-0.5 rounded-md text-[9px] font-black uppercase">Live Engine</span>
              <h1 className="text-slate-900 font-black text-xl tracking-tight uppercase italic flex items-center gap-2">
                <Globe className="text-[#C22973] animate-pulse" size={20} /> Evento Online
              </h1>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSalvar} 
          disabled={isLoading}
          className="relative overflow-hidden bg-slate-900 text-white px-8 md:px-12 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-black transition-all shadow-2xl disabled:opacity-50 flex items-center gap-3 group"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : (
            <span className="relative z-10 flex items-center gap-2">Próximo Passo <Sparkles size={14} className="text-pink-400" /></span>
          )}
        </button>
      </header>

      <main className="max-w-[1300px] mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                  <Info size={18} className="text-[#C22973]"/>
                </div>
                <h3 className="text-slate-800 text-sm font-black uppercase tracking-widest italic">Conceito do Evento</h3>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Título da Experiência</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome do evento..." className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl outline-none font-bold text-lg text-slate-800 focus:border-pink-100 focus:bg-white transition-all shadow-inner" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Vibe / Categoria</label>
                    <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl outline-none font-bold text-slate-600 focus:border-pink-100 focus:bg-white transition-all shadow-inner cursor-pointer">
                        <option value="">Selecione...</option>
                        <option value="Arte & Cultura">🎨 Arte & Cultura</option>
                        <option value="Entretenimento">🍿 Entretenimento</option>
                        <option value="Negócios">💼 Negócios</option>
                        <option value="Educação & Desenvolvimento">🧠 Educação & Desenvolvimento</option>
                        <option value="Esportes & Bem-estar">🏃‍♂️ Esportes & Bem-estar</option>
                        <option value="Experiências & Lifestyle">✨ Experiências & Lifestyle</option>
                        <option value="Família & Comunidade">👨‍👩‍👧‍👦 Família & Comunidade</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Limitar Audiência</label>
                    <div className="relative group">
                      <Users size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C22973]" />
                      <input name="capacidade" value={formData.capacidade} onChange={handleChange} type="number" placeholder="Ilimitado" className="w-full bg-slate-50 border-2 border-transparent p-5 pl-14 rounded-3xl outline-none font-bold text-slate-800 focus:border-pink-100 focus:bg-white transition-all shadow-inner" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Release / Descrição</label>
                  <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={5} placeholder="Descrição..." className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none focus:border-pink-100 focus:bg-white transition-all shadow-inner resize-none font-medium text-slate-600" />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                  <LinkIcon size={18} className="text-[#C22973]"/>
                </div>
                <h3 className="text-slate-800 text-sm font-black uppercase tracking-widest italic">Acesso Restrito</h3>
              </div>
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">URL da Transmissão</label>
                  <input name="url_transmissao" value={formData.url_transmissao} onChange={handleChange} placeholder="Link da live..." className="w-full bg-slate-900 text-pink-400 p-5 rounded-2xl outline-none font-mono text-sm border-2 border-slate-800 focus:border-[#C22973] transition-all" />
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
              <h4 className="text-[10px] text-slate-400 font-black uppercase mb-6 tracking-[0.2em] text-center italic">Key Visual / Capa</h4>
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden group shadow-2xl">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <button onClick={() => {setPreviewImage(null); setSelectedFile(null);}} className="absolute top-6 right-6 bg-white w-12 h-12 rounded-2xl text-[#C22973] shadow-lg flex items-center justify-center">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-[4/5] border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white hover:border-pink-200 transition-all group">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-slate-50">
                        <ImageIcon size={32} className="text-[#C22973]" />
                    </div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Upload Digital Art</p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
              <h4 className="text-[10px] text-slate-400 font-black uppercase mb-6 tracking-[0.2em] italic flex items-center gap-2">
                <Calendar size={14} className="text-[#C22973]" /> Cronograma
              </h4>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Data</label>
                    <input name="data_inicio" value={formData.data_inicio} onChange={handleChange} type="date" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-xs font-bold text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Hora</label>
                    <input name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} type="time" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-xs font-bold text-slate-700" />
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