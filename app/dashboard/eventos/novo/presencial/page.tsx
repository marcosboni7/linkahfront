'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ImageIcon, 
  Search, 
  Calendar, 
  MapPin, 
  X, 
  Loader2, 
  Users, 
  Info, 
  Ticket, 
  Sparkles, 
  Navigation,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Script from 'next/script';
import Swal from 'sweetalert2';

const API_URL = 'https://api-linkah.onrender.com';
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

  const initGoogleMaps = useCallback(() => {
    if (typeof window === 'undefined' || !window.google || !mapContainerRef.current) return;

    if (!googleMap.current) {
      googleMap.current = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: -23.5505, lng: -46.6333 },
        zoom: 15,
        disableDefaultUI: true,
        styles: [
          { featureType: "all", elementType: "geometry", stylers: [{ color: "#f8f9fa" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9ecef" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] }
        ]
      });
      
      marker.current = new window.google.maps.Marker({
        map: googleMap.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#C22973",
          fillOpacity: 1,
          strokeWeight: 4,
          strokeColor: "#ffffff",
        }
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

        const getComp = (type: string) => 
          place.address_components!.find((c: any) => c.types.includes(type))?.long_name || '';
        
        const getUF = () => 
          place.address_components!.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';

        setFormData(prev => ({
          ...prev,
          local_nome: place.name || prev.local_nome,
          endereco: getComp('route'),
          numero: getComp('street_number'),
          cep: getComp('postal_code').replace(/\D/g, ''),
          cidade: getComp('administrative_area_level_2') || getComp('locality'),
          estado: getUF(),
        }));
      });
    }
  }, []);

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
    const token = localStorage.getItem('@Linkah:Token');
    const userRaw = localStorage.getItem('@Linkah:User');
    let emailProdutor = '';

    try {
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        emailProdutor = userObj.email || userObj.user?.email || userObj.data?.email || '';
      }
    } catch (e) { emailProdutor = ''; }

    if (!token) return Swal.fire('Sessão Expirada', 'Faça login novamente.', 'warning');
    if (!formData.nome || !formData.data_inicio) return Swal.fire('Atenção', 'Nome e Data de Início são obrigatórios.', 'info');

    setIsLoading(true);
    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => dataToSend.append(key, value));
    dataToSend.append('produtor_email', emailProdutor);
    if (selectedFile) dataToSend.append('imagem_capa', selectedFile);

    try {
      const response = await fetch(`${API_URL}/api/eventos/novo-presencial`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: dataToSend,
      });

      const data = await response.json();
      if (response.ok) {
        router.push(`/dashboard/eventos/novo/ingressos/${data.id}`);
      } else {
        Swal.fire('Erro', data.message || "Falha ao salvar", 'error');
      }
    } catch (error) {
      Swal.fire('Erro de Rede', 'Verifique sua conexão.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] font-sans antialiased pb-24 text-slate-900">
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`} 
        strategy="afterInteractive" 
        onLoad={initGoogleMaps} 
      />

      {/* HEADER PREMIUM */}
      <header className="border-b border-slate-200/50 px-6 md:px-12 py-6 flex justify-between items-center bg-white/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-pink-200 transition-all active:scale-95">
            <ChevronLeft size={20} className="text-slate-400" />
          </button>
          <div>
            <h1 className="text-slate-900 font-black text-xl tracking-tighter uppercase italic flex items-center gap-2">
              <MapPin className="text-[#C22973]" size={18} /> Novo Evento Presencial
            </h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">Step 01: Core Information</p>
          </div>
        </div>

        <button 
          onClick={handleSalvar} 
          disabled={isLoading}
          className="bg-black text-white px-10 py-4 rounded-[1.3rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#C22973] transition-all shadow-xl disabled:opacity-50 flex items-center gap-3 active:scale-95"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : (<>Próximo Passo <Sparkles size={14} className="text-pink-400" /></>)}
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LADO ESQUERDO: CAMPOS */}
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Título da Experiência</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Festival de Jazz 2026" className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-xl focus:bg-white border-2 border-transparent focus:border-pink-100 transition-all shadow-inner" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Vibe / Categoria</label>
                    <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-slate-600 focus:bg-white border-2 border-transparent focus:border-pink-100 transition-all shadow-inner appearance-none">
                        <option value="">Selecione...</option>
                        <option value="Arte & Cultura">🎨 Arte & Cultura</option>
                        <option value="Entretenimento">🍿 Entretenimento</option>
                        <option value="Negócios">💼 Negócios</option>
                        <option value="Esportes">🏃‍♂️ Esportes</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Capacidade Estimada</label>
                    <div className="relative">
                        <input name="capacidade" value={formData.capacidade} onChange={handleChange} type="number" placeholder="0" className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-slate-800 shadow-inner" />
                        <Users className="absolute right-8 top-6 text-slate-300" size={20} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Descrição do Evento</label>
                  <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={4} className="w-full bg-slate-50 p-6 rounded-[2.5rem] outline-none resize-none font-medium text-slate-600 focus:bg-white border-2 border-transparent focus:border-pink-100 transition-all shadow-inner" placeholder="Conte mais sobre a experiência..." />
                </div>
              </div>
            </section>

            {/* CRONOGRAMA */}
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
               <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <Clock size={20} />
                 </div>
                 <h2 className="font-black italic uppercase text-xs tracking-widest text-slate-800">Datas & Horários</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Check-in / Início</label>
                  <div className="flex gap-4">
                    <input name="data_inicio" value={formData.data_inicio} onChange={handleChange} type="date" className="flex-1 bg-slate-50 p-5 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" />
                    <input name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} type="time" className="w-32 bg-slate-50 p-5 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Checkout / Término</label>
                  <div className="flex gap-4">
                    <input name="data_termino" value={formData.data_termino} onChange={handleChange} type="date" className="flex-1 bg-slate-50 p-5 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" />
                    <input name="hora_termino" value={formData.hora_termino} onChange={handleChange} type="time" className="w-32 bg-slate-50 p-5 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" />
                  </div>
                </div>
              </div>
            </section>

            {/* LOCALIZAÇÃO DETALHADA */}
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-[#C22973]">
                    <Navigation size={20} />
                 </div>
                 <h2 className="font-black italic uppercase text-xs tracking-widest text-slate-800">Localização do Evento</h2>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-400" />
                  <input 
                    ref={searchInputRef} 
                    placeholder="Onde será o evento? Digite o endereço ou nome do local..." 
                    className="w-full bg-slate-900 text-white p-7 pl-16 rounded-[2rem] outline-none font-bold text-sm shadow-2xl focus:ring-4 focus:ring-pink-500/10 transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input name="local_nome" value={formData.local_nome} onChange={handleChange} placeholder="Nome do Local (Ex: Arena Linkah)" className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner" />
                  <input name="cep" value={formData.cep} onChange={handleChange} placeholder="CEP" className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <input name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Endereço / Rua" className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner" />
                  </div>
                  <input name="numero" value={formData.numero} onChange={handleChange} placeholder="Número" className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input name="cidade" value={formData.cidade} onChange={handleChange} placeholder="Cidade" className="bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner" />
                  <input name="estado" value={formData.estado} onChange={handleChange} placeholder="UF" className="bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner text-center" />
                  <input name="complemento" value={formData.complemento} onChange={handleChange} placeholder="Complemento" className="bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner" />
                </div>
              </div>
            </section>
          </div>

          {/* COLUNA LATERAL: MEDIA E MAPA */}
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-slate-100">
              <h4 className="text-[9px] text-slate-300 font-black uppercase mb-8 text-center tracking-[0.4em] italic">Media Center</h4>
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-white">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <button onClick={() => {setPreviewImage(null); setSelectedFile(null);}} className="absolute top-6 right-6 bg-white w-14 h-14 rounded-3xl text-[#C22973] shadow-2xl flex items-center justify-center hover:scale-110 transition-all">
                      <X size={24} />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-[4/5] border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white hover:border-pink-200 transition-all group">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                        <ImageIcon size={32} className="text-[#C22973]" />
                    </div>
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest italic">Portrait Capa</p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[3.5rem] p-2 shadow-2xl border border-slate-100 h-[400px] relative overflow-hidden group">
               <div ref={mapContainerRef} className="w-full h-full rounded-[3.2rem] grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-lg border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live View no Mapa</p>
               </div>
            </div>

            <div className="bg-gradient-to-br from-black to-slate-800 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Ticket size={120} />
               </div>
               <h4 className="font-black italic text-2xl uppercase leading-tight mb-4 tracking-tighter">Financeiro</h4>
               <p className="text-[11px] font-bold opacity-60 uppercase tracking-[0.2em]">Tickets e Lotes serão configurados no próximo estágio da engine.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}