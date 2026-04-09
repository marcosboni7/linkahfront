'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ChevronLeft, ImageIcon, Search, MapPin, X, Loader2,
  Users, Ticket, Sparkles, Navigation, Clock, Building2,
  Wand2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import Swal from 'sweetalert2';

const API_URL = 'https://api-linkah.onrender.com';

export default function NovoEventoPresencial() {
  const { t }: any = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<any>(null);
  const marker = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);

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
    moeda: 'BRL',
    regras: '',
    visibilidade: 'Publico'
  });

  const handleGerarComIA = async () => {
    const { value: text } = await Swal.fire({
      title: 'Gerar Evento com IA',
      input: 'textarea',
      inputLabel: 'Cole aqui o texto do evento (ex: post do insta, mensagem de zap...)',
      inputPlaceholder: 'Ex: Workshop de Design dia 20/05 às 14h no SESC Votuporanga...',
      showCancelButton: true,
      confirmButtonText: 'Mágica! ✨',
      confirmButtonColor: '#C22973',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (!text) return;

    setIsAiLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/eventos/gerar-ia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: text }),
      });

      if (!response.ok) throw new Error('Falha na IA');
      const aiData = await response.json();

      setFormData(prev => ({
        ...prev,
        nome: aiData.nome || prev.nome,
        categoria: aiData.categoria || prev.categoria,
        descricao: aiData.descricao || prev.descricao,
        data_inicio: aiData.data_inicio || prev.data_inicio,
        hora_inicio: aiData.hora_inicio || prev.hora_inicio,
        data_termino: aiData.data_termino || aiData.data_inicio || prev.data_termino,
        hora_termino: aiData.hora_termino || prev.hora_termino,
        local_nome: aiData.local_nome || prev.local_nome,
        endereco: aiData.rua || prev.endereco,
        numero: aiData.numero || prev.numero,
        cidade: aiData.cidade || prev.cidade,
        estado: aiData.estado || prev.estado,
        cep: aiData.cep || prev.cep,
        capacidade: aiData.capacidade || prev.capacidade,
        moeda: aiData.moeda || prev.moeda,
      }));

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Campos preenchidos!',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      Swal.fire('Erro', 'A IA não conseguiu processar esse texto.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const initGoogleMaps = useCallback(async () => {
    if (typeof window === 'undefined' || !window.google || !mapContainerRef.current) return;
    if (googleMap.current) return;

    try {
      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        window.google.maps.importLibrary('maps') as any,
        window.google.maps.importLibrary('marker') as any,
      ]);

      const { Autocomplete } = await window.google.maps.importLibrary('places') as any;

      googleMap.current = new Map(mapContainerRef.current, {
        center: { lat: -23.5505, lng: -46.6333 },
        zoom: 15,
        mapId: 'LINKAH_MAP_ID',
        disableDefaultUI: true,
      });

      marker.current = new AdvancedMarkerElement({
        map: googleMap.current,
        position: { lat: -23.5505, lng: -46.6333 },
      });

      if (searchInputRef.current && !autocompleteRef.current) {
        autocompleteRef.current = new Autocomplete(searchInputRef.current, {
          types: ['establishment', 'geocode'],
          fields: ['address_components', 'formatted_address', 'name', 'geometry']
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          googleMap.current.setCenter(place.geometry.location);
          googleMap.current.setZoom(17);
          marker.current.position = place.geometry.location;

          const getComp = (type: string) =>
            place.address_components?.find((c: any) => c.types.includes(type))?.long_name || '';

          setFormData(prev => ({
            ...prev,
            local_nome: place.name || prev.local_nome,
            endereco: getComp('route'),
            numero: getComp('street_number'),
            cep: getComp('postal_code').replace(/\D/g, ''),
            cidade: getComp('administrative_area_level_2') || getComp('locality'),
            estado: place.address_components?.find((c: any) =>
              c.types.includes('administrative_area_level_1')
            )?.short_name || '',
          }));
        });
      }
    } catch (error: any) {
      console.error('Erro no mapa:', error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(initGoogleMaps, 500);
    return () => clearTimeout(timer);
  }, [initGoogleMaps]);

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

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedBanner(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewBanner(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSalvar = async () => {
    const token = localStorage.getItem('@Linkah:Token')?.replace(/['"]+/g, '');
    const userRaw = localStorage.getItem('@Linkah:User');
    let emailProdutor = '';
    let nomeUsuario = '';

    try {
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        emailProdutor = userObj.email || userObj.user?.email || '';
        nomeUsuario = userObj.nome || userObj.user?.nome || 'Organizador';
      }
    } catch (e) {
      nomeUsuario = 'Admin';
    }

    if (!token) return Swal.fire('Erro', 'Sessão expirada', 'warning');

    setIsLoading(true);
    const dataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) dataToSend.append(key, value.toString());
    });

    dataToSend.append('produtor_email', emailProdutor);
    dataToSend.append('usuario_nome', nomeUsuario);

    if (selectedFile) dataToSend.append('imagem_capa', selectedFile);
    if (selectedBanner) dataToSend.append('banner_patrocinio', selectedBanner);

    try {
      const response = await fetch(`${API_URL}/api/eventos/novo-presencial`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });

      const data = await response.json();
      if (response.ok) {
        router.push(`/dashboard/eventos/novo/ingressos/${data.id || data.evento?.id}`);
      } else {
        Swal.fire('Erro', data.message || data.error || 'Erro ao salvar evento', 'error');
      }
    } catch (error) {
      Swal.fire('Erro', 'Falha na conexão', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] font-sans antialiased pb-24 text-slate-900">
      <header className="border-b border-slate-200/50 px-6 md:px-12 py-6 flex justify-between items-center bg-white/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 hover:border-pink-200 transition-all active:scale-95"
          >
            <ChevronLeft size={20} className="text-slate-400" />
          </button>
          <div>
            <h1 className="text-slate-900 font-black text-xl tracking-tighter uppercase italic flex items-center gap-2">
              <MapPin className="text-[#C22973]" size={18} /> Novo Evento Presencial
            </h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">
              Step 01: Core Information
            </p>
          </div>
        </div>

        <button
          onClick={handleSalvar}
          disabled={isLoading}
          className="bg-black text-white px-10 py-4 rounded-[1.3rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#C22973] transition-all shadow-xl disabled:opacity-50 flex items-center gap-3 active:scale-95"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              Próximo Passo <Sparkles size={14} className="text-pink-400" />
            </>
          )}
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <div className="space-y-6">
                <div className="space-y-3 relative">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Título da Experiência
                    </label>
                    <button
                      onClick={handleGerarComIA}
                      disabled={isAiLoading}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#C22973] transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                      IA Linkah
                    </button>
                  </div>
                  <input
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: Festival de Jazz 2026"
                    className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-xl focus:bg-white border-2 border-transparent focus:border-pink-100 transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Vibe / Categoria
                    </label>
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-slate-600 focus:bg-white border-2 border-transparent focus:border-pink-100 transition-all shadow-inner appearance-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="Arte & Cultura">🎨 Arte & Cultura</option>
                      <option value="Entretenimento">🎭 Entretenimento</option>
                      <option value="Negócios">💼 Negócios</option>
                      <option value="Educação & Desenvolvimento">🎓 Educação & Desenvolvimento</option>
                      <option value="Esportes & Bem-estar">💙 Esportes & Bem-estar</option>
                      <option value="Experiências & Lifestyle">✨ Experiências & Lifestyle</option>
                      <option value="Família & Comunidade">👥 Família & Comunidade</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Capacidade Estimada
                    </label>
                    <div className="relative">
                      <input
                        name="capacidade"
                        value={formData.capacidade}
                        onChange={handleChange}
                        type="number"
                        placeholder="0"
                        className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-slate-800 shadow-inner"
                      />
                      <Users className="absolute right-8 top-6 text-slate-300" size={20} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                      Moeda do Evento
                    </label>
                    <select
                      name="moeda"
                      value={formData.moeda}
                      onChange={handleChange}
                      className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-slate-600 focus:bg-white border-2 border-transparent focus:border-pink-100 transition-all shadow-inner appearance-none"
                    >
                      <option value="BRL">🇧🇷 Real (BRL)</option>
                      <option value="EUR">🇪🇺 Euro (EUR)</option>
                      <option value="USD">🇺🇸 Dólar (USD)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                    Descrição do Evento
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-slate-50 p-6 rounded-[2.5rem] outline-none resize-none font-medium text-slate-600 focus:bg-white border-2 border-transparent focus:border-pink-100 transition-all shadow-inner"
                    placeholder="Conte mais sobre a experiência..."
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Clock size={20} />
                </div>
                <h2 className="font-black italic uppercase text-xs tracking-widest text-slate-800">
                  Datas & Horários
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    Início
                  </label>
                  <div className="flex gap-4">
                    <input
                      name="data_inicio"
                      value={formData.data_inicio}
                      onChange={handleChange}
                      type="date"
                      className="flex-1 bg-slate-50 p-5 rounded-2xl font-bold outline-none"
                    />
                    <input
                      name="hora_inicio"
                      value={formData.hora_inicio}
                      onChange={handleChange}
                      type="time"
                      className="w-32 bg-slate-50 p-5 rounded-2xl font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    Término
                  </label>
                  <div className="flex gap-4">
                    <input
                      name="data_termino"
                      value={formData.data_termino}
                      onChange={handleChange}
                      type="date"
                      className="flex-1 bg-slate-50 p-5 rounded-2xl font-bold outline-none"
                    />
                    <input
                      name="hora_termino"
                      value={formData.hora_termino}
                      onChange={handleChange}
                      type="time"
                      className="w-32 bg-slate-50 p-5 rounded-2xl font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-[#C22973]">
                  <Navigation size={20} />
                </div>
                <h2 className="font-black italic uppercase text-xs tracking-widest text-slate-800">
                  Localização
                </h2>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-400" />
                  <input
                    ref={searchInputRef}
                    placeholder="Busque cidades ou locais em qualquer lugar do mundo..."
                    className="w-full bg-slate-900 text-white p-7 pl-16 rounded-[2rem] outline-none font-bold text-sm shadow-2xl focus:ring-4 focus:ring-pink-500/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    name="local_nome"
                    value={formData.local_nome}
                    onChange={handleChange}
                    placeholder="Nome do Local"
                    className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner"
                  />
                  <input
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    placeholder="CEP / Postal Code"
                    className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner"
                  />
                  <input
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    placeholder="Rua / Avenida"
                    className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner md:col-span-2"
                  />
                  <input
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="Número"
                    className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner"
                  />
                  <input
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                    placeholder="Complemento"
                    className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner"
                  />
                  <input
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="Cidade"
                    className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner"
                  />
                  <input
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    placeholder="Estado / Província / UF"
                    className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold shadow-inner"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                    Regras / Informações Extras
                  </label>
                  <textarea
                    name="regras"
                    value={formData.regras}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-slate-50 p-6 rounded-[2.5rem] outline-none resize-none font-medium text-slate-600 focus:bg-white border-2 border-transparent focus:border-pink-100 transition-all shadow-inner"
                    placeholder="Ex: Proibida entrada com bebidas, classificação etária, instruções..."
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8 gap-4">
                <h4 className="text-[9px] text-slate-300 font-black uppercase text-center tracking-[0.4em] italic">
                  Media Center: Capa
                </h4>
                <span className="px-4 py-2 rounded-full bg-pink-50 text-[#C22973] text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  1080 x 1350
                </span>
              </div>

              <div className="relative">
                {previewImage ? (
                  <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-white">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute left-5 top-5 bg-black/70 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                      1080 x 1350
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setSelectedFile(null);
                      }}
                      className="absolute top-6 right-6 bg-white w-14 h-14 rounded-3xl text-[#C22973] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                    >
                      <X size={24} />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-[4/5] border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white hover:border-pink-200 transition-all group overflow-hidden px-6 text-center">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-all">
                      <ImageIcon size={36} className="text-[#C22973]" />
                    </div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest italic">
                      Capa do Evento
                    </p>
                    <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      Tamanho ideal: 1080 x 1350 px
                    </p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8 gap-4">
                <h4 className="text-[9px] text-slate-300 font-black uppercase text-center tracking-[0.4em] italic">
                  Media Center: Patrocinador
                </h4>
                <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  236 x 354
                </span>
              </div>

              <div className="relative">
                {previewBanner ? (
                  <div className="relative w-full aspect-[2/3] rounded-[2rem] overflow-hidden shadow-2xl group border-4 border-white">
                    <img
                      src={previewBanner}
                      alt="Preview Banner"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute left-4 top-4 bg-black/70 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                      236 x 354
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewBanner(null);
                        setSelectedBanner(null);
                      }}
                      className="absolute top-4 right-4 bg-white w-12 h-12 rounded-2xl text-blue-500 flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-[2/3] border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center hover:bg-white hover:border-blue-200 transition-all group px-6 text-center">
                    <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                      <Building2 size={24} className="text-blue-500" />
                    </div>
                    <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">
                      Capa Patrocinador
                    </p>
                    <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      Tamanho ideal: 236 x 354 px
                    </p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-slate-100 h-[350px] relative overflow-hidden">
              <div ref={mapContainerRef} className="w-full h-full rounded-[3.2rem]" />
            </div>

            <div className="bg-gradient-to-br from-black to-slate-800 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Ticket size={120} />
              </div>
              <h4 className="font-black italic text-2xl uppercase leading-tight mb-4 tracking-tighter">
                Financeiro
              </h4>
              <p className="text-[11px] font-bold opacity-60 uppercase tracking-[0.2em]">
                Tickets e Lotes serão configurados no próximo estágio.
              </p>
              <p className="mt-6 text-sm font-bold text-pink-300">
                Moeda atual: {formData.moeda}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}