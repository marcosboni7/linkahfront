'use client';

import { useState } from 'react';
import { ChevronLeft, ImageIcon, Calendar, Globe, X, Loader2, Users, Info, Ticket, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function NovoEventoOnline() {
  const { t }: any = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
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
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSalvar = async () => {
    const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
    const userStorage = localStorage.getItem('@Linkah:User') || localStorage.getItem('user');
    
    if (!token || !userStorage) {
      alert("Sessão expirada. Faça login novamente.");
      router.push('/auth/login');
      return;
    }

    const user = JSON.parse(userStorage);
    const emailProdutor = user.email;

    if (!formData.nome || !formData.data_inicio || !formData.categoria) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setIsLoading(true);
    const payload = { 
      ...formData, 
      produtor_email: emailProdutor,
      imagem_capa: previewImage,
      capacidade: Number(formData.capacidade) || 0,
      cidade: 'Online',
      estado: 'ON'
    };

    try {
      const response = await fetch(`${API_URL}/api/eventos/novo-online`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        router.push(`/dashboard/eventos/novo/ingressos/${data.id}`);
      } else {
        alert(`Erro: ${data.message || "Erro ao salvar"}`);
      }
    } catch (error) {
      alert("Falha de conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans antialiased pb-24 text-slate-900">
      
      {/* HEADER GLASSMORPHISM */}
      <header className="border-b border-slate-200/60 px-6 md:px-12 py-6 flex justify-between items-center bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center justify-center w-12 h-12 bg-white rounded-2xl transition-all shadow-sm border border-slate-100 hover:border-pink-200 hover:shadow-md active:scale-95"
          >
            <ChevronLeft size={20} className="text-slate-500 group-hover:text-[#C22973] transition-colors" />
          </button>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-pink-100 text-[#C22973] px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter">Live Engine</span>
              <h1 className="text-slate-900 font-black text-xl tracking-tight uppercase italic flex items-center gap-2">
                <Globe className="text-[#C22973] animate-pulse" size={20} /> Evento Online
              </h1>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em]">Dashboard de Produção Digital</p>
          </div>
        </div>

        <button 
          onClick={handleSalvar} 
          disabled={isLoading}
          className="relative overflow-hidden bg-slate-900 text-white px-8 md:px-12 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 flex items-center gap-3 group"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : (
              <>Próximo Passo <Sparkles size={14} className="text-pink-400" /></>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#C22973] to-[#E53E3E] opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </header>

      <main className="max-w-[1300px] mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            {/* SEÇÃO 1: INFOS */}
            <section className="relative group">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                  <Info size={18} className="text-[#C22973]"/>
                </div>
                <h3 className="text-slate-800 text-sm font-black uppercase tracking-widest italic">Conceito do Evento</h3>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 space-y-8 transition-all hover:shadow-lg">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Título da Experiência</label>
                  <input 
                    name="nome" 
                    value={formData.nome} 
                    onChange={handleChange} 
                    placeholder="Dê um nome impactante ao seu evento..." 
                    className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl outline-none font-bold text-lg text-slate-800 placeholder:text-slate-300 focus:border-pink-100 focus:bg-white transition-all shadow-inner" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Vibe / Categoria</label>
                    <select 
                      name="categoria" 
                      value={formData.categoria} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl outline-none font-bold text-slate-600 focus:border-pink-100 focus:bg-white transition-all shadow-inner cursor-pointer"
                    >
                        <option value="">{t.selectDefault}</option>
                        <option value="Negócios">🚀 {t.catBiz}</option>
                        <option value="Educação & Desenvolvimento">🧠 {t.catEdu}</option>
                        <option value="Entretenimento">🎭 {t.catEnt}</option>
                        <option value="Esportes & Bem-estar">🧘 {t.catHealth}</option>
                        <option value="Arte & Cultura">🎨 {t.catArt}</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Limitar Audiência</label>
                    <div className="relative group">
                      <Users size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C22973] transition-colors" />
                      <input 
                        name="capacidade" 
                        value={formData.capacidade} 
                        onChange={handleChange} 
                        type="number" 
                        placeholder="Ilimitado" 
                        className="w-full bg-slate-50 border-2 border-transparent p-5 pl-14 rounded-3xl outline-none font-bold text-slate-800 focus:border-pink-100 focus:bg-white transition-all shadow-inner" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Release / Descrição</label>
                  <textarea 
                    name="descricao" 
                    value={formData.descricao} 
                    onChange={handleChange} 
                    rows={5} 
                    placeholder="Conte por que as pessoas não podem perder este evento digital..." 
                    className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none focus:border-pink-100 focus:bg-white transition-all shadow-inner resize-none font-medium text-slate-600 leading-relaxed" 
                  />
                </div>
              </div>
            </section>

            {/* SEÇÃO 2: LINK */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                  <LinkIcon size={18} className="text-[#C22973]"/>
                </div>
                <h3 className="text-slate-800 text-sm font-black uppercase tracking-widest italic">Acesso Restrito</h3>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 space-y-6">
                <div className="flex items-center gap-4 p-6 bg-pink-50/30 rounded-3xl border border-pink-100/50">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                    <Sparkles size={20} className="text-[#C22973]" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    <strong className="text-[#C22973]">Privacidade Total:</strong> O link da sua transmissão será criptografado e revelado apenas para quem possuir um ingresso válido.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">URL da Transmissão</label>
                  <input 
                    name="url_transmissao" 
                    value={formData.url_transmissao} 
                    onChange={handleChange} 
                    placeholder="Zoom, Google Meet, YouTube Live ou Vimeo..." 
                    className="w-full bg-slate-900 text-pink-400 p-5 rounded-2xl outline-none font-mono text-sm border-2 border-slate-800 focus:border-[#C22973] transition-all shadow-xl" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Observações de Entrada</label>
                  <input 
                    name="regras" 
                    value={formData.regras} 
                    onChange={handleChange} 
                    placeholder="Ex: O link será liberado no dashboard 10 minutos antes." 
                    className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-2xl outline-none text-sm font-bold text-slate-600 focus:border-pink-100 transition-all shadow-inner" 
                  />
                </div>
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA - SIDEBAR */}
          <div className="lg:col-span-4 space-y-10">
            {/* CARD DE CAPA */}
            <div className="bg-white rounded-[3rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
              <h4 className="text-[10px] text-slate-400 font-black uppercase mb-6 tracking-[0.2em] text-center italic">Key Visual / Capa</h4>
              
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden group shadow-2xl">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <button 
                      onClick={() => setPreviewImage(null)} 
                      className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm w-12 h-12 rounded-2xl text-[#C22973] shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all active:scale-95"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-[4/5] border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white hover:border-pink-200 transition-all group shadow-inner">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-slate-50 group-hover:scale-110 group-hover:shadow-pink-100 group-hover:shadow-xl transition-all duration-500">
                        <ImageIcon size={32} className="text-[#C22973]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-1">Upload Digital Art</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Proporção 4:5 ou 16:9</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* CARD DE DATA TIPO "NEUMORPHIC" */}
            <div className="bg-white rounded-[3rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
              <h4 className="text-[10px] text-slate-400 font-black uppercase mb-6 tracking-[0.2em] italic flex items-center gap-2">
                <Calendar size={14} className="text-[#C22973]" /> Cronograma
              </h4>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase ml-1">Início</p>
                    <input name="data_inicio" value={formData.data_inicio} onChange={handleChange} type="date" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-pink-100 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase ml-1">Hora</p>
                    <input name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} type="time" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-pink-100 transition-all" />
                  </div>
                </div>
                
                <div className="h-px bg-slate-50 w-full" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase ml-1">Fim</p>
                    <input name="data_termino" value={formData.data_termino} onChange={handleChange} type="date" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-pink-100 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase ml-1">Hora</p>
                    <input name="hora_termino" value={formData.hora_termino} onChange={handleChange} type="time" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-pink-100 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD PRÓXIMO PASSO */}
            <div className="bg-gradient-to-br from-[#C22973] to-[#8a1d52] rounded-[3rem] p-10 text-white shadow-2xl shadow-pink-200 relative overflow-hidden group active:scale-[0.98] transition-all cursor-default">
               <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                  <Ticket size={180} />
               </div>
               <Ticket className="mb-6 opacity-60" size={40} />
               <h4 className="font-black italic text-2xl uppercase leading-tight mb-3 tracking-tighter">Monetização & Ingressos</h4>
               <p className="text-[11px] font-bold text-pink-100 uppercase tracking-wider leading-relaxed opacity-90">
                 Próximo passo: Configure o Stripe ou Pix para começar a faturar.
               </p>
               <div className="mt-8 flex items-center gap-2">
                 <div className="w-2 h-2 bg-pink-300 rounded-full animate-ping" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em]">Step 01 de 02</span>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}