'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ImageIcon, Search, Calendar, MapPin, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- CONFIGURAÇÃO DA API DA AWS ATUALIZADA ---
const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function NovoEventoPresencial() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  
  // Refs para Google Maps
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
    tipo: 'Presencial'
  });

  // Inicialização do Mapa e Autocomplete
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      if (mapContainerRef.current && !googleMap.current) {
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
          componentRestrictions: { country: 'br' },
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
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        alert("Sessão expirada. Faça login novamente.");
        router.push('/auth/login');
        return;
    }
    
    if (!validate()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        body: JSON.stringify({ 
          ...formData, 
          produtor_email: emailProdutor,
          imagem_capa: previewImage 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Redireciona para o passo 2 (ingressos) passando o ID gerado na AWS
        router.push(`/dashboard/eventos/novo/ingressos/${data.id}`);
      } else {
        alert("Erro ao salvar: " + (data.message || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro na conexão AWS:", error);
      alert("❌ Erro na conexão com o servidor da AWS.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] font-sans antialiased">
      <header className="border-b border-slate-100 px-6 md:px-10 py-5 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-full transition-all text-slate-400">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-slate-800 font-black text-lg tracking-tight uppercase italic">Novo Evento Presencial</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Configuração Inicial • Passo 1</p>
          </div>
        </div>
        
        <button 
          onClick={handleSalvar}
          disabled={isLoading}
          className="bg-[#C22973] text-white px-8 md:px-10 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#a62262] transition-all shadow-xl shadow-pink-100 disabled:opacity-50 flex items-center gap-2 active:scale-95"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'PRÓXIMO PASSO'}
        </button>
      </header>

      <main className="max-w-[1300px] mx-auto p-6 md:p-10">
        
        {/* PROGRESSO */}
        <div className="flex justify-center items-center mb-16 px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#C22973] text-white flex items-center justify-center shadow-lg shadow-pink-200 font-black text-sm italic">1</div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Dados</span>
          </div>
          <div className="w-24 md:w-40 h-[2px] bg-slate-100 mx-4"></div>
          <div className="flex items-center gap-4 opacity-30">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center font-black text-sm italic">2</div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Ingressos</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8">1. O que vai acontecer?</h3>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 font-black uppercase ml-1 italic tracking-widest">Nome do Evento *</label>
                  <input 
                    name="nome" 
                    value={formData.nome} 
                    onChange={handleChange} 
                    className={`w-full bg-slate-50 border ${errors.nome ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100 focus:border-[#C22973]'} p-4 rounded-2xl outline-none focus:bg-white transition-all font-bold text-slate-700`} 
                    placeholder="Ex: Workshop Producer Masterclass" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-slate-400 font-black uppercase ml-1 italic tracking-widest">Categoria *</label>
                    <select 
                        name="categoria" 
                        value={formData.categoria} 
                        onChange={handleChange} 
                        className={`w-full bg-slate-50 border ${errors.categoria ? 'border-red-400' : 'border-slate-100'} p-4 rounded-2xl outline-none bg-white font-bold text-slate-600`}
                    >
                      <option value="">Selecione...</option>
                      <option value="Show">Música & Show</option>
                      <option value="Workshop">Workshop & Palestra</option>
                      <option value="Teatro">Teatro & Cultura</option>
                      <option value="Esportes">Esportes</option>
                      <option value="Gastronomia">Gastronomia</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-slate-400 font-black uppercase ml-1 italic tracking-widest">Visibilidade</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none bg-white font-bold text-slate-600">
                      <option value="Ativo">Publicar Imediatamente</option>
                      <option value="Rascunho">Salvar Rascunho</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 font-black uppercase ml-1 italic tracking-widest">Descrição do Evento</label>
                  <textarea name="descricao" value={formData.descricao} rows={4} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-[#C22973] transition-all resize-none font-medium text-slate-600" placeholder="Conte detalhes sobre o evento para seu público..." />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><Calendar size={14}/> 2. Quando será?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input name="data_inicio" value={formData.data_inicio} type="date" onChange={handleChange} className={`bg-slate-50 border ${errors.data_inicio ? 'border-red-400' : 'border-slate-100'} p-4 rounded-xl text-xs font-bold outline-none`} />
                <input name="hora_inicio" value={formData.hora_inicio} type="time" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none" />
                <input name="data_termino" value={formData.data_termino} type="date" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none" />
                <input name="hora_termino" value={formData.hora_termino} type="time" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none" />
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><MapPin size={14}/> 3. Onde será?</h3>
              <div className="space-y-4">
                <div className="relative group">
                  <Search size={16} className="absolute left-4 top-4 text-[#C22973]" />
                  <input ref={searchInputRef} placeholder="Busque pelo endereço ou nome do local..." className="w-full bg-pink-50/40 border border-pink-100 p-4 pl-12 rounded-2xl outline-none italic text-sm font-bold focus:border-[#C22973] transition-all" />
                </div>
                <input name="local_nome" value={formData.local_nome} placeholder="Nome do Local (Ex: Teatro Municipal)" onChange={handleChange} className={`w-full bg-slate-50 border ${errors.local_nome ? 'border-red-400' : 'border-slate-100'} p-4 rounded-xl outline-none font-bold text-slate-700`} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <input name="cep" value={formData.cep} placeholder="CEP" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                   <input name="endereco" value={formData.endereco} placeholder="Endereço" onChange={handleChange} className="md:col-span-2 bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input name="cidade" value={formData.cidade} placeholder="Cidade" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                   <input name="estado" value={formData.estado} placeholder="UF" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none font-bold text-slate-700" />
                </div>
              </div>
            </section>
          </div>

          {/* SIDEBAR DE PREVIEW / MAPA */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 text-center">
              <label className="text-[10px] text-slate-400 font-black uppercase mb-4 block tracking-widest italic">Capa do Evento</label>
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enviar Imagem</p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-50 h-[400px] relative overflow-hidden">
                <div ref={mapContainerRef} className="w-full h-full rounded-[2.2rem]" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl">
                    <p className="text-[9px] font-black text-[#C22973] uppercase tracking-tighter italic">Preview Geo-localização</p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}