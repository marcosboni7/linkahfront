'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ImageIcon, Search, Calendar, MapPin, X, Loader2, Users, Info, Ticket, Sparkles, Navigation } from 'lucide-react';
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

  const initGoogleMaps = () => {
    if (typeof window === 'undefined' || !window.google || !mapContainerRef.current || googleMap.current) return;

    googleMap.current = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: -23.5505, lng: -46.6333 },
      zoom: 15,
      disableDefaultUI: true,
      styles: [
        { featureType: "all", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }] },
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
      ]
    });
    
    marker.current = new window.google.maps.Marker({
      map: googleMap.current,
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: "#C22973",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff",
      }
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

    if (!formData.nome || !formData.data_inicio || !formData.local_nome) {
      alert("Campos obrigatórios: Nome, Data e Local.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/eventos/novo-presencial`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, produtor_email: emailProdutor, imagem_capa: previewImage }),
      });

      const data = await response.json();
      if (response.ok) router.push(`/dashboard/eventos/novo/ingressos/${data.id}`);
      else alert(data.message || "Erro ao salvar");
    } catch (error) {
      alert("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans antialiased pb-24 text-slate-900">
      <Script src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`} strategy="afterInteractive" onLoad={initGoogleMaps} />

      {/* HEADER GLASS */}
      <header className="border-b border-slate-200/60 px-6 md:px-12 py-6 flex justify-between items-center bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <button onClick={() => router.back()} className="group flex items-center justify-center w-12 h-12 bg-white rounded-2xl transition-all shadow-sm border border-slate-100 hover:border-pink-200 hover:shadow-md active:scale-95">
            <ChevronLeft size={20} className="text-slate-500 group-hover:text-[#C22973] transition-colors" />
          </button>
          <div>
            <h1 className="text-slate-900 font-black text-xl tracking-tight uppercase italic flex items-center gap-2">
              <MapPin className="text-[#C22973]" size={20} /> Evento Presencial
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em]">Localização & Logística</p>
          </div>
        </div>

        <button 
          onClick={handleSalvar} 
          disabled={isLoading}
          className="relative overflow-hidden bg-slate-900 text-white px-8 md:px-12 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 flex items-center gap-3 group"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <>Próximo Passo <Sparkles size={14} className="text-pink-400" /></>}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#C22973] to-[#E53E3E] opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            {/* SEÇÃO 1: INFOS GERAIS */}
            <section className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 space-y-8 transition-all hover:shadow-lg">
              <h3 className="text-slate-800 text-sm font-black uppercase tracking-widest italic flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center"><Info size={16} className="text-[#C22973]"/></div>
                Identidade do Evento
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Nome Oficial</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Conferência Internacional de Design" className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl outline-none font-bold text-lg text-slate-800 focus:border-pink-100 focus:bg-white transition-all shadow-inner" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Categoria</label>
                    <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl outline-none font-bold text-slate-600 focus:border-pink-100 focus:bg-white transition-all shadow-inner appearance-none">
                        <option value="">{t.selectDefault}</option>
                        <option value="Arte & Cultura">🎨 Arte & Cultura</option>
                        <option value="Negócios">💼 Negócios</option>
                        <option value="Entretenimento">🍿 Entretenimento</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Capacidade Total</label>
                    <div className="relative">
                      <Users size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input name="capacidade" value={formData.capacidade} onChange={handleChange} type="number" placeholder="Limite de pessoas" className="w-full bg-slate-50 border-2 border-transparent p-5 pl-14 rounded-3xl outline-none font-bold text-slate-800 focus:border-pink-100 focus:bg-white transition-all shadow-inner" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Sobre o Evento</label>
                  <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={4} placeholder="Descreva os detalhes importantes..." className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] outline-none focus:border-pink-100 focus:bg-white transition-all shadow-inner resize-none font-medium text-slate-600 leading-relaxed" />
                </div>
              </div>
            </section>

            {/* SEÇÃO 2: LOCALIZAÇÃO AVANÇADA */}
            <section className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 space-y-8">
              <h3 className="text-slate-800 text-sm font-black uppercase tracking-widest italic flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center"><Navigation size={16} className="text-[#C22973]"/></div>
                Onde vai acontecer?
              </h3>

              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-slate-200 pr-4">
                    <Search size={18} className="text-[#C22973]" />
                  </div>
                  <input ref={searchInputRef} placeholder="Comece a digitar o endereço ou nome do local..." className="w-full bg-slate-900 text-white p-6 pl-24 rounded-3xl outline-none font-bold text-sm focus:ring-4 focus:ring-pink-100/50 transition-all shadow-2xl" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Estabelecimento</label>
                    <input name="local_nome" value={formData.local_nome} onChange={handleChange} placeholder="Ex: Centro de Convenções" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP</label>
                    <input name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-700" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rua / Logradouro</label>
                  <input name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Av. Principal, s/n" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-700" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número</label>
                      <input name="numero" value={formData.numero} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold" />
                   </div>
                   <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Complemento</label>
                      <input name="complemento" value={formData.complemento} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UF</label>
                      <input name="estado" value={formData.estado} onChange={handleChange} maxLength={2} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-center uppercase" />
                   </div>
                </div>
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-4 space-y-10">
            {/* CARD DE CAPA */}
            <div className="bg-white rounded-[3rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
              <h4 className="text-[10px] text-slate-400 font-black uppercase mb-6 tracking-[0.2em] text-center italic">Arte Visual</h4>
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden group shadow-2xl">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <button onClick={() => setPreviewImage(null)} className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm w-12 h-12 rounded-2xl text-[#C22973] shadow-lg flex items-center justify-center hover:bg-white transition-all"><X size={20} /></button>
                  </div>
                ) : (
                  <label className="aspect-[4/5] border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white hover:border-pink-200 transition-all group shadow-inner">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-slate-50 group-hover:scale-110 transition-all duration-500">
                        <ImageIcon size={32} className="text-[#C22973]" />
                    </div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Adicionar Capa</p>
                  </label>
                )}
              </div>
            </div>

            {/* MAPA INTEGRADO */}
            <div className="bg-white rounded-[3rem] p-2 shadow-2xl border border-slate-100 h-[380px] relative group overflow-hidden">
               <div ref={mapContainerRef} className="w-full h-full rounded-[2.8rem] grayscale-[0.4] group-hover:grayscale-0 transition-all duration-700" />
               <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Preview do Mapa</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{formData.local_nome || 'Aguardando endereço...'}</p>
               </div>
            </div>

            {/* PRÓXIMO PASSO */}
            <div className="bg-gradient-to-br from-[#C22973] to-[#8a1d52] rounded-[3rem] p-10 text-white shadow-2xl shadow-pink-200 relative overflow-hidden group">
               <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12"><Ticket size={180} /></div>
               <Ticket className="mb-6 opacity-60" size={40} />
               <h4 className="font-black italic text-2xl uppercase leading-tight mb-3 tracking-tighter">Ingressos & Lotes</h4>
               <p className="text-[11px] font-bold text-pink-100 uppercase tracking-wider leading-relaxed opacity-90">
                 No próximo passo você definirá os preços, quantidade e a taxa de serviço.
               </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}