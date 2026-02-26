'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ImageIcon, Search, Calendar, MapPin, X, Loader2, Users, Info, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Script from 'next/script';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';
const GOOGLE_MAPS_KEY = 'AIzaSyDlGFav-T-Dig9xkdqpqfr98pJP8zmWbE8'; // Troque pela nova se já criou

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
    capacidade: '',
    tipo: 'Presencial',
    regras: '', // Seção que tinha antes
    visibilidade: 'Publico'
  });

  // Função de inicialização com proteção de re-render
  const initGoogleMaps = () => {
    if (typeof window === 'undefined' || !window.google || !mapContainerRef.current || googleMap.current) return;

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
      });
    }
  };

  const handleSalvar = async () => {
    setIsLoading(true);
    // ... lógica de envio (Stripe/Pix seriam no próximo passo de ingressos)
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] font-sans antialiased pb-20">
      <Script src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`} strategy="afterInteractive" onLoad={initGoogleMaps} />

      {/* HEADER IGUAL AO QUE ESTÁVAMOS USANDO */}
      <header className="border-b border-slate-100 px-6 md:px-10 py-5 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-full transition-all text-slate-400">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-slate-800 font-black text-lg tracking-tight uppercase italic">Criar Evento Presencial</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Configuração Geral e Localização</p>
          </div>
        </div>
        <button onClick={handleSalvar} className="bg-[#C22973] text-white px-10 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#a62262] transition-all shadow-xl shadow-pink-100 disabled:opacity-50">
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Próximo Passo"}
        </button>
      </header>

      <main className="max-w-[1300px] mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* COLUNA DA ESQUERDA - FORMULÁRIO */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><Info size={14}/> O que vai rolar?</h3>
              <div className="space-y-6">
                <input name="nome" placeholder="Nome do Evento" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-700 focus:border-[#C22973]" />
                
                <div className="grid grid-cols-2 gap-6">
                   <select name="categoria" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-600">
                      <option value="">Selecione a Categoria</option>
                      <option value="Show">Show / Festa</option>
                      <option value="Workshop">Workshop</option>
                   </select>
                   <div className="relative">
                      <Users size={16} className="absolute left-4 top-4 text-slate-400" />
                      <input name="capacidade" type="number" placeholder="Capacidade" className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none font-bold text-slate-700" />
                   </div>
                </div>

                <textarea name="descricao" rows={4} placeholder="Conte mais sobre o evento..." className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] resize-none font-medium text-slate-600" />
              </div>
            </section>

            {/* SEÇÃO 2: DATA E HORA */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><Calendar size={14}/> Quando?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input name="data_inicio" type="date" className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600" />
                <input name="hora_inicio" type="time" className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600" />
                <input name="data_termino" type="date" className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600" />
                <input name="hora_termino" type="time" className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none text-slate-600" />
              </div>
            </section>

            {/* SEÇÃO 3: LOCALIZAÇÃO (COMPLETA) */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><MapPin size={14}/> Onde?</h3>
              <div className="space-y-4">
                <div className="relative group">
                  <Search size={16} className="absolute left-4 top-4 text-[#C22973]" />
                  <input ref={searchInputRef} placeholder="Buscar endereço no Google Maps..." className="w-full bg-pink-50/40 border border-pink-100 p-4 pl-12 rounded-2xl outline-none italic text-sm font-bold focus:border-[#C22973] text-slate-700" />
                </div>
                <input name="local_nome" placeholder="Nome do Local (Ex: Teatro Municipal)" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                <div className="grid grid-cols-4 gap-4">
                   <input name="cep" placeholder="CEP" className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                   <input name="endereco" placeholder="Rua / Avenida" className="col-span-3 bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input name="numero" placeholder="Número" className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                   <input name="complemento" placeholder="Complemento" className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                   <input name="cidade" placeholder="Cidade" className="col-span-3 bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                   <input name="estado" placeholder="UF" maxLength={2} className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700 text-center uppercase" />
                </div>
              </div>
            </section>

            {/* SEÇÃO 4: REGRAS (QUE TINHA ANTES) */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
               <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">Regras e Observações</h3>
               <textarea name="regras" rows={3} placeholder="Ex: Proibido entrada de menores, traje esporte fino..." className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] resize-none font-medium text-slate-600" />
            </section>

          </div>

          {/* COLUNA DA DIREITA */}
          <div className="lg:col-span-4 space-y-8">
            {/* CAPA */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 text-center">
              <label className="text-[10px] text-slate-400 font-black uppercase mb-4 block tracking-widest italic">Capa do Evento</label>
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full h-64 rounded-[2.5rem] overflow-hidden group shadow-lg">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full text-[#C22973] shadow-lg"><X size={18} /></button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 bg-slate-50/50 cursor-pointer flex flex-col items-center hover:bg-pink-50/50 transition-all group">
                    <input type="file" accept="image/*" className="hidden" />
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <ImageIcon size={28} className="text-[#C22973]" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload da Imagem</p>
                  </label>
                )}
              </div>
            </div>

            {/* MAPA VISUAL */}
            <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-50 h-[350px] relative overflow-hidden">
                <div ref={mapContainerRef} className="w-full h-full rounded-[2.2rem]" />
            </div>

            {/* CARD DE PRÓXIMO PASSO (INGRESSOS) */}
            <div className="bg-[#C22973] rounded-[3rem] p-8 text-white shadow-2xl shadow-pink-200">
               <Ticket className="mb-4 opacity-50" size={32} />
               <h4 className="font-black italic text-xl uppercase leading-tight mb-2">Próxima etapa:<br/>Ingressos</h4>
               <p className="text-[11px] font-bold opacity-80 uppercase tracking-wider leading-relaxed">Na próxima tela você configurará os valores, lotes e a integração com o Stripe (Pix/Cartão).</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}