'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ImageIcon, Search, Calendar, MapPin, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Script from 'next/script';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';
// CHAVE ATUALIZADA ABAIXO
const GOOGLE_MAPS_KEY = 'AIzaSyBqf-csMr6NdQNz5YfFISRPMWhne-mVNPA';

export default function NovoEventoPresencial() {
  const { t }: any = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<any>(null);
  const marker = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '', categoria: '', status: 'Ativo', descricao: '',
    data_inicio: '', hora_inicio: '', data_termino: '', hora_termino: '',
    local_nome: '', cep: '', endereco: '', numero: '', complemento: '', cidade: '', estado: '',
    tipo: 'Presencial',
    preco: 0 
  });

  const initGoogleMaps = () => {
    if (typeof window !== 'undefined' && window.google && mapContainerRef.current) {
      if (!googleMap.current) {
        googleMap.current = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat: -23.5505, lng: -46.6333 },
          zoom: 12,
          disableDefaultUI: true,
          styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
        });
        
        marker.current = new window.google.maps.Marker({
          map: googleMap.current,
          animation: window.google.maps.Animation.DROP,
        });
      }

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
            cidade: getComponent('administrative_area_level_2'),
            estado: getUF(),
          }));
          setErrors(prev => ({ ...prev, local_nome: false }));
        });
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (value.trim() !== "") {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.nome.trim()) newErrors.nome = true;
    if (!formData.categoria.trim()) newErrors.categoria = true;
    if (!formData.data_inicio) newErrors.data_inicio = true;
    if (!formData.local_nome.trim()) newErrors.local_nome = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalvar = async () => {
    const token = localStorage.getItem('@Linkah:Token');
    const emailProdutor = localStorage.getItem('userEmail');

    if (!token || !emailProdutor) {
      alert(t.errorSession || "Sessão expirada");
      router.push('/auth/login');
      return;
    }
    
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);

    const payload = { 
      ...formData, 
      produtor_email: emailProdutor,
      imagem_capa: previewImage,
      preco: Number(formData.preco) || 0 
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
        router.push(`/dashboard/eventos/novo/ingressos/${data.id}`);
      } else {
        alert(`Error ${response.status}: ${data.message || "Erro no servidor"}`);
      }
    } catch (error) {
      alert("Falha de conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] font-sans antialiased">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`}
        strategy="beforeInteractive"
        onLoad={initGoogleMaps}
      />

      <header className="border-b border-slate-100 px-6 md:px-10 py-5 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-full transition-all text-slate-400">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-slate-800 font-black text-lg tracking-tight uppercase italic">{t.eventPresencialTitle}</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">{t.eventInitialConfig}</p>
          </div>
        </div>
        
        <button 
          onClick={handleSalvar}
          disabled={isLoading}
          className="bg-[#C22973] text-white px-8 md:px-10 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#a62262] transition-all shadow-xl shadow-pink-100 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : t.btnNextStep}
        </button>
      </header>

      <main className="max-w-[1300px] mx-auto p-6 md:p-10">
        <div className="flex justify-center items-center mb-16 px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#C22973] text-white flex items-center justify-center shadow-lg font-black text-sm italic">1</div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest italic">{t.stepInfo}</span>
          </div>
          <div className="w-24 md:w-40 h-[2px] bg-slate-100 mx-4"></div>
          <div className="flex items-center gap-4 opacity-30">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center font-black text-sm italic">2</div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">{t.stepTickets}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8">{t.sectionWhat}</h3>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 font-black uppercase ml-1 italic tracking-widest">{t.labelEventName}</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} className={`w-full bg-slate-50 border ${errors.nome ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100 focus:border-[#C22973]'} p-4 rounded-2xl outline-none font-bold text-slate-700`} placeholder={t.placeholderEventName} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-slate-400 font-black uppercase ml-1 italic tracking-widest">{t.labelCategory}</label>
                    <select name="categoria" value={formData.categoria} onChange={handleChange} className={`w-full bg-slate-50 border ${errors.categoria ? 'border-red-400' : 'border-slate-100'} p-4 rounded-2xl outline-none bg-white font-bold text-slate-600`}>
                      <option value="">{t.selectDefault}</option>
                      <option value="Show">{t.catMusic}</option>
                      <option value="Workshop">{t.catWorkshop}</option>
                      <option value="Teatro">{t.catTheater}</option>
                      <option value="Esportes">{t.catSports}</option>
                      <option value="Gastronomia">{t.catFood}</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-slate-400 font-black uppercase ml-1 italic tracking-widest">{t.labelVisibility}</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none bg-white font-bold text-slate-600">
                      <option value="Ativo">{t.visActive}</option>
                      <option value="Rascunho">{t.visDraft}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 font-black uppercase ml-1 italic tracking-widest">{t.labelDescription}</label>
                  <textarea name="descricao" value={formData.descricao} rows={4} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-[#C22973] transition-all resize-none font-medium text-slate-600" placeholder={t.placeholderDescription} />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><Calendar size={14}/> {t.sectionWhen}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input name="data_inicio" value={formData.data_inicio} type="date" onChange={handleChange} className={`bg-slate-50 border ${errors.data_inicio ? 'border-red-400' : 'border-slate-100'} p-4 rounded-xl text-xs font-bold outline-none text-slate-600`} />
                <input name="hora_inicio" value={formData.hora_inicio} type="time" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600" />
                <input name="data_termino" value={formData.data_termino} type="date" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600" />
                <input name="hora_termino" value={formData.hora_termino} type="time" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600" />
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><MapPin size={14}/> {t.sectionWhere}</h3>
              <div className="space-y-4">
                <div className="relative group">
                  <Search size={16} className="absolute left-4 top-4 text-[#C22973]" />
                  <input ref={searchInputRef} placeholder={t.placeholderSearchMap} className="w-full bg-pink-50/40 border border-pink-100 p-4 pl-12 rounded-2xl outline-none italic text-sm font-bold focus:border-[#C22973] transition-all text-slate-700" />
                </div>
                <input name="local_nome" value={formData.local_nome} placeholder={t.placeholderVenue} onChange={handleChange} className={`w-full bg-slate-50 border ${errors.local_nome ? 'border-red-400' : 'border-slate-100'} p-4 rounded-xl outline-none font-bold text-slate-700`} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <input name="cep" value={formData.cep} placeholder="CEP / Zip" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                   <input name="endereco" value={formData.endereco} placeholder="Endereço" onChange={handleChange} className="md:col-span-2 bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 text-center">
              <label className="text-[10px] text-slate-400 font-black uppercase mb-4 block tracking-widest italic">{t.labelCover}</label>
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full h-64 rounded-[2.5rem] overflow-hidden group shadow-lg">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full text-[#C22973] shadow-lg active:scale-90 transition-all"><X size={18} /></button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 bg-slate-50/50 cursor-pointer flex flex-col items-center hover:bg-pink-50/50 hover:border-[#C22973]/30 transition-all group">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <ImageIcon size={28} className="text-[#C22973]" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.labelUpload}</p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-50 h-[350px] relative overflow-hidden">
                <div ref={mapContainerRef} className="w-full h-full rounded-[2.2rem]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}