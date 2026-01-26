'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ImageIcon, Search, Calendar, MapPin, CheckCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NovoEventoPresencial() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs para Google Maps
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<any>(null);
  const marker = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

  // Estados extras para UI
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '', categoria: '', status: 'Ativo', descricao: '',
    data_inicio: '', hora_inicio: '', data_termino: '', hora_termino: '',
    local_nome: '', cep: '', endereco: '', numero: '', complemento: '', cidade: '', estado: '',
    tipo: 'Presencial' // Garantindo o tipo correto para o banco
  });

  // 1. Inicializa Mapa e Autocomplete
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FUNÇÃO CONFIGURADA PARA AWS ---
  const handleSalvar = async () => {
    const emailProdutor = localStorage.getItem('userEmail');
    if (!emailProdutor) return alert("Sessão expirada. Faça login novamente.");
    if (!formData.nome) return alert("Dê um nome ao evento.");

    setIsLoading(true);
    try {
      // DEFINIÇÃO DA URL DINÂMICA
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiBaseUrl}/api/eventos/novo-presencial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          produtor_email: emailProdutor,
          imagem_capa: previewImage 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redireciona para a etapa 2 (Ingressos)
        router.push(`/dashboard/eventos/novo/ingressos/${data.id}`);
      } else {
        alert("Erro ao salvar: " + (data.message || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
      alert("❌ Erro na conexão com o servidor da AWS.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      <header className="border-b border-slate-100 px-10 py-5 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-full transition-all text-slate-400">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-slate-800 font-bold text-lg tracking-tight">Criar Evento Presencial</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Linkah Dashboard</p>
          </div>
        </div>
        
        <button 
          onClick={handleSalvar}
          disabled={isLoading}
          className="bg-[#C22973] text-white px-10 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-[#a62262] transition-all shadow-lg shadow-pink-100 disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar e Continuar'}
        </button>
      </header>

      <main className="max-w-[1300px] mx-auto p-10">
        
        {/* Stepper */}
        <div className="flex justify-center items-center mb-16 px-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#C22973] text-white flex items-center justify-center shadow-lg shadow-pink-100 font-bold text-sm italic">1</div>
            <span className="text-sm font-bold text-slate-800">Dados do Evento</span>
          </div>
          <div className="w-40 h-[2px] bg-slate-100 mx-8"></div>
          <div className="flex items-center gap-4 opacity-30">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center font-bold text-sm italic">2</div>
            <span className="text-sm font-bold text-slate-400">Ingressos</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8">1. Informações Básicas</h3>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase ml-1">Nome do Evento</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-[#C22973] transition-all font-medium" placeholder="Ex: Grande Show de Lançamento" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase ml-1">Categoria</label>
                    <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none bg-white font-medium text-slate-600">
                      <option value="">Selecione...</option>
                      <option value="Show">Música & Show</option>
                      <option value="Workshop">Workshop & Palestra</option>
                      <option value="Show">Teatro</option>
                      <option value="Show">Esportes</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase ml-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none bg-white font-medium text-slate-600">
                      <option value="Ativo">Publicado (Ativo)</option>
                      <option value="Rascunho">Rascunho</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase ml-1">Descrição</label>
                  <textarea name="descricao" value={formData.descricao} rows={4} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-[#C22973] transition-all resize-none" placeholder="O que os participantes podem esperar?" />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><Calendar size={14}/> 2. Data e Horário</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input name="data_inicio" value={formData.data_inicio} type="date" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm outline-none" />
                <input name="hora_inicio" value={formData.hora_inicio} type="time" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm outline-none" />
                <input name="data_termino" value={formData.data_termino} type="date" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm outline-none" />
                <input name="hora_termino" value={formData.hora_termino} type="time" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm outline-none" />
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50">
              <h3 className="text-[#C22973] text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><MapPin size={14}/> 3. Localização</h3>
              <div className="space-y-4">
                <div className="relative group">
                  <Search size={16} className="absolute left-4 top-4 text-[#C22973]" />
                  <input ref={searchInputRef} placeholder="Busque o endereço ou nome do local..." className="w-full bg-pink-50/30 border border-pink-100 p-4 pl-12 rounded-2xl outline-none italic text-sm focus:border-[#C22973]" />
                </div>
                <input name="local_nome" value={formData.local_nome} placeholder="Nome do Local" onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <input name="cep" value={formData.cep} placeholder="CEP" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none" />
                   <input name="endereco" value={formData.endereco} placeholder="Endereço" onChange={handleChange} className="md:col-span-2 bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input name="cidade" value={formData.cidade} placeholder="Cidade" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none" />
                   <input name="estado" value={formData.estado} placeholder="UF" onChange={handleChange} className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none" />
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 text-center">
              <label className="text-[10px] text-slate-400 font-bold uppercase mb-4 block">Thumbnail do Evento</label>
              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full h-64 rounded-[2rem] overflow-hidden">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-[#C22973]"><X size={18} /></button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-100 rounded-[2rem] p-10 bg-slate-50 cursor-pointer flex flex-col items-center">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <ImageIcon size={28} className="text-[#C22973] mb-4" />
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Enviar Capa</p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-50 h-[450px] relative overflow-hidden">
                <div ref={mapContainerRef} className="w-full h-full rounded-[2rem]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}