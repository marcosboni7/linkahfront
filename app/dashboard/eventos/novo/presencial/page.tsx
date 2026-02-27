'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ImageIcon, Search, Calendar, MapPin, X, Loader2, Users, Info, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Script from 'next/script';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';
const GOOGLE_MAPS_KEY = 'AIzaSyDlGFav-T-Dig9xkdqpqfr98pJP8zmWbE8'; 

export default function NovoEventoPresencial() {
  const { t }: any = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<any>(null);
  const marker = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

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
    local_nome: '', 
    cep: '', 
    endereco: '', 
    numero: '', 
    complemento: '', 
    cidade: '', 
    estado: '',
    capacidade: '',
    tipo: 'Presencial',
    regras: '',
    visibilidade: 'Publico'
  });

  // --- LÓGICA DO GOOGLE MAPS ---
  const initGoogleMaps = () => {
    if (typeof window === 'undefined' || !window.google || !mapContainerRef.current || googleMap.current) return;

    googleMap.current = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: -23.5505, lng: -46.6333 },
      zoom: 12,
      disableDefaultUI: true,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] }
      ]
    });
    
    marker.current = new window.google.maps.Marker({
      map: googleMap.current,
      animation: window.google.maps.Animation.DROP,
    });

    if (searchInputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['geocode', 'establishment'],
        fields: ['address_components', 'formatted_address', 'name', 'geometry']
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry || !place.address_components) return;

        googleMap.current.setCenter(place.geometry.location);
        googleMap.current.setZoom(17);
        marker.current.setPosition(place.geometry.location);

        const getComponent = (type: string) => 
          place.address_components!.find((c: any) => c.types.includes(type))?.long_name || '';
        
        const getUF = () => 
          place.address_components!.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';

        setFormData(prev => ({
          ...prev,
          local_nome: place.name || prev.local_nome,
          endereco: getComponent('route'),
          numero: getComponent('street_number'),
          cep: getComponent('postal_code').replace(/\D/g, ''),
          cidade: getComponent('administrative_area_level_2') || getComponent('locality'),
          estado: getUF(),
        }));
      });
    }
  };

  // --- HANDLERS ---
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
    const token = localStorage.getItem('@Linkah:Token');
    const emailProdutor = localStorage.getItem('userEmail');

    if (!token || !emailProdutor) {
      alert("Sessão expirada. Faça login novamente.");
      router.push('/auth/login');
      return;
    }

    if (!formData.nome || !formData.data_inicio || !formData.local_nome || !formData.categoria) {
      alert("Por favor, preencha Nome, Categoria, Data de Início e o Local.");
      return;
    }

    setIsLoading(true);

    const payload = { 
      ...formData, 
      produtor_email: emailProdutor,
      imagem_capa: previewImage,
      capacidade: Number(formData.capacidade) || 0
    };

    try {
      const response = await fetch(`${API_URL}/api/eventos/novo-presencial`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Redireciona para a etapa de ingressos passando o ID do evento criado
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
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`} 
        strategy="afterInteractive" 
        onLoad={initGoogleMaps} 
      />

      {/* HEADER FIXO */}
      <header className="border-b border-slate-100 px-6 md:px-10 py-5 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 border border-transparent hover:border-slate-100">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-slate-800 font-black text-lg tracking-tight uppercase italic">Novo Evento Presencial</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Passo 1: Detalhes e Local</p>
          </div>
        </div>
        <button 
          onClick={handleSalvar} 
          disabled={isLoading}
          className="bg-[#C22973] text-white px-10 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#a62262] transition-all shadow-xl shadow-pink-100 disabled:opacity-50 flex items-center gap-3"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Próximo Passo"}
        </button>
      </header>

      <main className="max-w-[1300px] mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-8">
            {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <Info size={14}/> Informações Gerais
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome do Evento</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Festival de Verão 2026" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-700 focus:border-[#C22973] focus:bg-white transition-all" />
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
                     <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Capacidade Total</label>
                     <div className="relative">
                        <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input name="capacidade" value={formData.capacidade} onChange={handleChange} type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none font-bold text-slate-700 focus:border-[#C22973] focus:bg-white transition-all" />
                     </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Descrição</label>
                  <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={4} placeholder="O que torna este evento único?" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] focus:bg-white transition-all resize-none font-medium text-slate-600" />
                </div>
              </div>
            </section>

            {/* SEÇÃO 2: DATA E HORA */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <Calendar size={14}/> Cronograma
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Data Início</label>
                  <input name="data_inicio" value={formData.data_inicio} onChange={handleChange} type="date" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600 focus:border-[#C22973] transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Hora Início</label>
                  <input name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} type="time" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600 focus:border-[#C22973] transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Data Término</label>
                  <input name="data_termino" value={formData.data_termino} onChange={handleChange} type="date" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600 focus:border-[#C22973] transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Hora Término</label>
                  <input name="hora_termino" value={formData.hora_termino} onChange={handleChange} type="time" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600 focus:border-[#C22973] transition-all" />
                </div>
              </div>
            </section>

            {/* SEÇÃO 3: LOCALIZAÇÃO */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <MapPin size={14}/> Localização
              </h3>
              <div className="space-y-4">
                <div className="relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C22973]" />
                  <input ref={searchInputRef} placeholder="Buscar endereço no Google Maps..." className="w-full bg-pink-50/40 border border-pink-100 p-4 pl-12 rounded-2xl outline-none italic text-sm font-bold focus:border-[#C22973] focus:bg-white text-slate-700 transition-all" />
                </div>
                
                <input name="local_nome" value={formData.local_nome} onChange={handleChange} placeholder="Nome do Local (Ex: Teatro Municipal)" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                
                <div className="grid grid-cols-4 gap-4">
                   <input name="cep" value={formData.cep} onChange={handleChange} placeholder="CEP" className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                   <input name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Rua / Avenida" className="col-span-3 bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <input name="numero" value={formData.numero} onChange={handleChange} placeholder="Número" className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                   <input name="complemento" value={formData.complemento} onChange={handleChange} placeholder="Complemento" className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                   <input name="cidade" value={formData.cidade} onChange={handleChange} placeholder="Cidade" className="col-span-3 bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                   <input name="estado" value={formData.estado} onChange={handleChange} placeholder="UF" maxLength={2} className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700 text-center uppercase" />
                </div>
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA - VISUALIZAÇÃO E AUXILIARES */}
          <div className="lg:col-span-4 space-y-8">
            {/* UPLOAD CAPA */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
              <label className="text-[10px] text-slate-400 font-black uppercase mb-4 block tracking-widest italic text-center">Capa do Evento</label>
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Clique para fazer upload da capa</p>
                  </label>
                )}
              </div>
            </div>

            {/* MAPA VISUAL */}
            <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-50 h-[350px] relative overflow-hidden">
                <div ref={mapContainerRef} className="w-full h-full rounded-[2.2rem]" />
            </div>

            {/* CARD DE STATUS - PRÓXIMO PASSO */}
            <div className="bg-[#C22973] rounded-[3rem] p-8 text-white shadow-2xl shadow-pink-200 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <Ticket size={120} />
               </div>
               <Ticket className="mb-4 opacity-50" size={32} />
               <h4 className="font-black italic text-xl uppercase leading-tight mb-2">Próxima etapa:<br/>Ingressos</h4>
               <p className="text-[11px] font-bold opacity-80 uppercase tracking-wider leading-relaxed">
                 Após salvar, você poderá configurar os lotes, preços e o checkout via Stripe.
               </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}