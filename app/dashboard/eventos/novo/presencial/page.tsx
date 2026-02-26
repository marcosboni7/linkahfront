'use client';

import { useState } from 'react';
import { ChevronLeft, ImageIcon, Calendar, Globe, X, Loader2, Users, Info, Ticket, Link as LinkIcon } from 'lucide-react';
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
    local_nome: 'Plataforma Online', // Nome genérico para o banco
    url_transmissao: '', // Campo específico para Online
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
      alert("Por favor, preencha Nome, Categoria e Data de Início.");
      return;
    }

    setIsLoading(true);

    const payload = { 
      ...formData, 
      produtor_email: emailProdutor,
      imagem_capa: previewImage,
      capacidade: Number(formData.capacidade) || 0,
      // Para o back-end não quebrar se esperar campos de endereço:
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
      alert("Falha de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] font-sans antialiased pb-20">
      
      {/* HEADER */}
      <header className="border-b border-slate-100 px-6 md:px-10 py-5 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-full transition-all text-slate-400">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-slate-800 font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
              <Globe className="text-[#C22973]" size={20} /> Criar Evento Online
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Live, Webinar ou Workshop Digital</p>
          </div>
        </div>
        <button 
          onClick={handleSalvar} 
          disabled={isLoading}
          className="bg-[#C22973] text-white px-10 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#a62262] transition-all shadow-xl shadow-pink-100 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Próximo Passo"}
        </button>
      </header>

      <main className="max-w-[1100px] mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-8">
            {/* SEÇÃO 1: DETALHES */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><Info size={14}/> Informações Gerais</h3>
              <div className="space-y-6">
                <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Título da sua Live ou Evento" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-700 focus:border-[#C22973]" />
                
                <div className="grid grid-cols-2 gap-6">
                   <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-600 focus:border-[#C22973]">
                      <option value="">Categoria</option>
                      <option value="Educação">Cursos & Educação</option>
                      <option value="Webinar">Webinar & Palestras</option>
                      <option value="Entretenimento">Show Online / Live</option>
                      <option value="Gamer">Games & E-sports</option>
                   </select>
                   <div className="relative">
                      <Users size={16} className="absolute left-4 top-4 text-slate-400" />
                      <input name="capacidade" value={formData.capacidade} onChange={handleChange} type="number" placeholder="Limite de Acessos" className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none font-bold text-slate-700" />
                   </div>
                </div>

                <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={4} placeholder="O que os participantes vão aprender ou ver?" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] resize-none font-medium text-slate-600" />
              </div>
            </section>

            {/* SEÇÃO 2: TRANSMISSÃO */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><LinkIcon size={14}/> Acesso ao Evento</h3>
              <div className="space-y-4">
                <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 mb-4">
                  <p className="text-[10px] font-bold text-[#C22973] uppercase tracking-wider">Dica Linkah</p>
                  <p className="text-xs text-slate-500 mt-1">Este link será enviado automaticamente para os compradores após a aprovação do Pix ou Stripe.</p>
                </div>
                <input name="url_transmissao" value={formData.url_transmissao} onChange={handleChange} placeholder="Link da Transmissão (YouTube, Zoom, Google Meet...)" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700 focus:border-[#C22973]" />
                <textarea name="regras" value={formData.regras} onChange={handleChange} rows={2} placeholder="Instruções de acesso (Ex: O link será liberado 15 min antes)" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:border-[#C22973] resize-none text-sm" />
              </div>
            </section>

            {/* SEÇÃO 3: QUANDO? */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><Calendar size={14}/> Data e Hora</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input name="data_inicio" value={formData.data_inicio} onChange={handleChange} type="date" className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600" />
                <input name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} type="time" className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600" />
                <input name="data_termino" value={formData.data_termino} onChange={handleChange} type="date" className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600" />
                <input name="hora_termino" value={formData.hora_termino} onChange={handleChange} type="time" className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600" />
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 text-center">
              <label className="text-[10px] text-slate-400 font-black uppercase mb-4 block tracking-widest italic">Capa Digital</label>
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full h-64 rounded-[2.5rem] overflow-hidden group shadow-lg">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full text-[#C22973] shadow-lg"><X size={18} /></button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 bg-slate-50/50 cursor-pointer flex flex-col items-center hover:bg-pink-50/50 transition-all group">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <ImageIcon size={28} className="text-[#C22973]" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tamanho ideal:<br/>1920x1080px</p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-[#C22973] rounded-[3rem] p-8 text-white shadow-2xl shadow-pink-200">
               <Ticket className="mb-4 opacity-50" size={32} />
               <h4 className="font-black italic text-xl uppercase leading-tight mb-2">Próxima etapa:<br/>Tickets Online</h4>
               <p className="text-[11px] font-bold opacity-80 uppercase tracking-wider leading-relaxed">Defina se o evento será gratuito ou pago via Stripe/Pix.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}