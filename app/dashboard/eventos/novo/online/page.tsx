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
      alert("Por favor, preencha Nome, Categoria e Data de Início.");
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
      alert("Falha de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] font-sans antialiased pb-20">
      
      {/* HEADER PREMIUM */}
      <header className="border-b border-slate-100 px-6 md:px-10 py-5 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 border border-transparent hover:border-slate-100">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-slate-800 font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
              <Globe className="text-[#C22973]" size={20} /> Criar Evento Online
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Workshop, Webinar ou Streaming</p>
          </div>
        </div>
        <button 
          onClick={handleSalvar} 
          disabled={isLoading}
          className="bg-[#C22973] text-white px-10 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#a62262] transition-all shadow-xl shadow-pink-100 disabled:opacity-50 flex items-center gap-3"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Configurar Ingressos"}
        </button>
      </header>

      <main className="max-w-[1200px] mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-8">
            {/* SEÇÃO 1: O QUE? */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <Info size={14}/> Detalhes da Experiência
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome do Evento Digital</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Masterclass de Marketing Digital" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-700 focus:border-[#C22973] focus:bg-white transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Categoria</label>
                     <select 
                       name="categoria" 
                       value={formData.categoria} 
                       onChange={handleChange} 
                       className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-600 focus:border-[#C22973] focus:bg-white transition-all appearance-none"
                     >
                        <option value="">{t.selectDefault}</option>
                        <option value="Arte & Cultura">{t.catArt}</option>
                        <option value="Entretenimento">{t.catEnt}</option>
                        <option value="Negócios">{t.catBiz}</option>
                        <option value="Educação & Desenvolvimento">{t.catEdu}</option>
                        <option value="Esportes & Bem-estar">{t.catHealth}</option>
                        <option value="Experiências & Lifestyle">{t.catLife}</option>
                        <option value="Família & Comunidade">{t.catFamily}</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Limite de Vendas (Opcional)</label>
                     <div className="relative">
                        <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input name="capacidade" value={formData.capacidade} onChange={handleChange} type="number" placeholder="Sem limite" className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none font-bold text-slate-700 focus:border-[#C22973] focus:bg-white transition-all" />
                     </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sobre o Evento</label>
                  <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={4} placeholder="Descreva o que será entregue na transmissão..." className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] focus:bg-white transition-all resize-none font-medium text-slate-600" />
                </div>
              </div>
            </section>

            {/* SEÇÃO 2: ACESSO DIGITAL */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <LinkIcon size={14}/> Link de Transmissão
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-5 bg-pink-50/50 rounded-2xl border border-pink-100 mb-4">
                  <Info className="text-[#C22973] shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-[10px] font-bold text-[#C22973] uppercase tracking-wider">Atenção</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Este link ficará protegido e será exibido apenas na área de ingressos do comprador após a confirmação do pagamento.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">URL da Live (YouTube, Zoom, Meet, etc)</label>
                  <input name="url_transmissao" value={formData.url_transmissao} onChange={handleChange} placeholder="https://youtube.com/live/..." className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700 focus:border-[#C22973] transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Instruções de Acesso</label>
                  <textarea name="regras" value={formData.regras} onChange={handleChange} rows={2} placeholder="Ex: O link será ativado 15 minutos antes do início." className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:border-[#C22973] resize-none text-sm font-medium text-slate-600" />
                </div>
              </div>
            </section>

            {/* SEÇÃO 3: QUANDO? */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <Calendar size={14}/> Horário da Transmissão
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Data Início</label>
                  <input name="data_inicio" value={formData.data_inicio} onChange={handleChange} type="date" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600 focus:border-[#C22973]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Hora Início</label>
                  <input name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} type="time" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600 focus:border-[#C22973]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Data Término</label>
                  <input name="data_termino" value={formData.data_termino} onChange={handleChange} type="date" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600 focus:border-[#C22973]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Hora Término</label>
                  <input name="hora_termino" value={formData.hora_termino} onChange={handleChange} type="time" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600 focus:border-[#C22973]" />
                </div>
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-4 space-y-8">
            {/* UPLOAD CAPA */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
              <label className="text-[10px] text-slate-400 font-black uppercase mb-4 block tracking-widest italic text-center">Capa Digital</label>
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full h-64 rounded-[2.5rem] overflow-hidden group shadow-lg">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-[#C22973] shadow-lg hover:bg-white transition-all">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 bg-slate-50/50 cursor-pointer flex flex-col items-center hover:bg-pink-50/50 hover:border-pink-200 transition-all group">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <ImageIcon size={28} className="text-[#C22973]" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Upload da capa<br/>(1920x1080px)</p>
                  </label>
                )}
              </div>
            </div>

            {/* INFO PRÓXIMO PASSO */}
            <div className="bg-[#C22973] rounded-[3rem] p-8 text-white shadow-2xl shadow-pink-200 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <Ticket size={120} />
               </div>
               <Ticket className="mb-4 opacity-50" size={32} />
               <h4 className="font-black italic text-xl uppercase leading-tight mb-2">Próxima etapa:<br/>Tickets Online</h4>
               <p className="text-[11px] font-bold opacity-80 uppercase tracking-wider leading-relaxed">
                 Você poderá definir se o acesso será gratuito ou cobrado via Stripe/Pix no próximo passo.
               </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}