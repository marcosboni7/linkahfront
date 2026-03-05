'use client';

import { useState, useEffect, useRef } from 'react';
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
  Navigation
} from 'lucide-react';
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

  // --- LÓGICA DO GOOGLE MAPS ---
  const initGoogleMaps = () => {
    if (typeof window === 'undefined' || !window.google || !mapContainerRef.current || googleMap.current) return;

    googleMap.current = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: -23.5505, lng: -46.6333 },
      zoom: 15,
      disableDefaultUI: true,
      styles: [
        { featureType: "all", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }] },
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] }
      ]
    });
    
    marker.current = new window.google.maps.Marker({
      map: googleMap.current,
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 7,
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

  // --- HANDLERS ---
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
    console.log("🚀 Iniciando processo de salvamento...");
    
    const token = localStorage.getItem('@Linkah:Token');
    let emailProdutor = localStorage.getItem('userEmail');

    if (!emailProdutor) {
      const userJSON = localStorage.getItem('@Linkah:User');
      if (userJSON) {
        try {
          const parsed = JSON.parse(userJSON);
          emailProdutor = parsed.email || parsed.user?.email;
        } catch (e) { console.error("❌ Falha ao parsear user"); }
      }
    }

    console.log("🔑 Dados de Autenticação:", { hasToken: !!token, emailProdutor });

    if (!token || !emailProdutor) {
      alert("Sessão expirada. Por favor, faça login novamente.");
      return;
    }

    if (!formData.nome || !formData.data_inicio || !formData.local_nome || !formData.categoria) {
      console.warn("⚠️ Campos obrigatórios ausentes:", formData);
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setIsLoading(true);

    const dataToSend = new FormData();
    
    // Adiciona campos de texto
    Object.entries(formData).forEach(([key, value]) => {
      dataToSend.append(key, value);
    });
    
    dataToSend.append('produtor_email', emailProdutor);
    
    if (selectedFile) {
      console.log("📸 Imagem anexada:", selectedFile.name);
      dataToSend.append('imagem_capa', selectedFile);
    } else {
      console.log("📸 Nenhuma imagem selecionada.");
    }

    // Log para conferir o que está indo no FormData (DEBUG)
    console.log("📦 Dados enviados (FormData):");
    for (let [key, value] of (dataToSend as any).entries()) {
        console.log(`${key}:`, value);
    }

    try {
      const response = await fetch(`${API_URL}/api/eventos/novo-presencial`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`
        },
        body: dataToSend,
      });

      console.log("📡 Resposta do servidor (Status):", response.status);
      const data = await response.json();
      console.log("📥 Dados recebidos do servidor:", data);

      if (response.ok) {
        console.log("✅ Sucesso! Redirecionando...");
        router.push(`/dashboard/eventos/novo/ingressos/${data.id}`);
      } else {
        console.error("❌ Erro retornado pela API:", data);
        alert(`Erro: ${data.message || "Erro ao salvar"}`);
      }
    } catch (error) {
      console.error("🚨 Erro de conexão/rede:", error);
      alert("Falha de conexão com o servidor AWS.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans antialiased pb-24 text-slate-900">
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`} 
        strategy="afterInteractive" 
        onLoad={initGoogleMaps} 
      />

      <header className="border-b border-slate-200/60 px-6 md:px-12 py-6 flex justify-between items-center bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <button onClick={() => router.back()} className="group flex items-center justify-center w-12 h-12 bg-white rounded-2xl transition-all shadow-sm border border-slate-100 hover:border-pink-200 active:scale-95">
            <ChevronLeft size={20} className="text-slate-500 group-hover:text-[#C22973]" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-slate-900 font-black text-xl tracking-tight uppercase italic flex items-center gap-2">
              <MapPin className="text-[#C22973]" size={20} /> Novo Evento Presencial
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em]">Passo 1 de 2: Informações</p>
          </div>
        </div>

        <button 
          onClick={handleSalvar} 
          disabled={isLoading}
          className="bg-slate-900 text-white px-8 md:px-12 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-black transition-all shadow-xl disabled:opacity-50 flex items-center gap-3"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : (<>Salvar e Continuar <Sparkles size={14} className="text-pink-400" /></>)}
        </button>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <h3 className="text-[#C22973] text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center"><Info size={16}/></div>
                Dados do Evento
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Título do Evento</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Show de Lançamento" className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold text-slate-800 focus:bg-white border-2 border-transparent focus:border-pink-100 transition-all" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Categoria</label>
                    <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold text-slate-600">
                        <option value="">Selecione...</option>
                        <option value="Arte & Cultura">🎨 Arte & Cultura</option>
                        <option value="Entretenimento">🍿 Entretenimento</option>
                        <option value="Negócios">💼 Negócios</option>
                        <option value="Educação">🧠 Educação</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Capacidade</label>
                    <input name="capacidade" value={formData.capacidade} onChange={handleChange} type="number" placeholder="Qtd Pessoas" className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold text-slate-800" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Descrição</label>
                  <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={4} className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none resize-none font-medium text-slate-600" />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <h3 className="text-[#C22973] text-[11px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center"><Calendar size={16}/></div>
                Cronograma
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Início</label>
                  <input name="data_inicio" value={formData.data_inicio} onChange={handleChange} type="date" className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora Início</label>
                  <input name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} type="time" className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Fim</label>
                  <input name="data_termino" value={formData.data_termino} onChange={handleChange} type="date" className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora Fim</label>
                  <input name="hora_termino" value={formData.hora_termino} onChange={handleChange} type="time" className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none" />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <h3 className="text-[#C22973] text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center"><Navigation size={16}/></div>
                Localização
              </h3>
              
              <div className="space-y-6">
                <div className="relative">
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#C22973]" />
                  <input ref={searchInputRef} placeholder="Busque o endereço no Google Maps..." className="w-full bg-slate-900 text-white p-6 pl-16 rounded-3xl outline-none font-bold text-sm" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input name="local_nome" value={formData.local_nome} onChange={handleChange} placeholder="Nome do Local" className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold" />
                  <input name="cep" value={formData.cep} onChange={handleChange} placeholder="CEP" className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold" />
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                   <input name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Endereço" className="col-span-3 w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold" />
                   <input name="numero" value={formData.numero} onChange={handleChange} placeholder="Nº" className="col-span-1 w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold" />
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
              <h4 className="text-[10px] text-slate-400 font-black uppercase mb-6 tracking-widest text-center italic">Capa do Evento</h4>
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => {setPreviewImage(null); setSelectedFile(null);}} className="absolute top-6 right-6 bg-white w-12 h-12 rounded-2xl text-[#C22973] shadow-lg flex items-center justify-center hover:scale-110 transition-all">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-[4/5] border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white hover:border-pink-200 transition-all group">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <ImageIcon size={28} className="text-[#C22973]" />
                    </div>
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Fazer Upload</p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-2 shadow-2xl border border-slate-100 h-[380px] relative overflow-hidden">
               <div ref={mapContainerRef} className="w-full h-full rounded-[2.8rem]" />
            </div>

            <div className="bg-gradient-to-br from-[#C22973] to-[#8a1d52] rounded-[3rem] p-10 text-white shadow-2xl">
               <Ticket className="mb-6 opacity-60" size={40} />
               <h4 className="font-black italic text-2xl uppercase leading-tight mb-3 tracking-tighter">Tickets</h4>
               <p className="text-[11px] font-bold opacity-90 uppercase tracking-wider">Configure os preços no próximo passo.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}