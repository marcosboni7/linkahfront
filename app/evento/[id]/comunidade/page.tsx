'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Paperclip, X, Image as ImageIcon, Send, Calendar, ChevronLeft } from 'lucide-react';

export default function SalaComunidade() {
  const { id } = useParams();
  const router = useRouter();
  
  // Estados
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroAcesso, setErroAcesso] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Validar Acesso do Usuário
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (!savedUser) {
      setErroAcesso(true);
      setCarregando(false);
      setTimeout(() => router.push('/site/login'), 2000);
      return;
    }
    try {
      const user = JSON.parse(savedUser);
      if (user?.nome) {
        setDadosUsuario(user);
      } else {
        throw new Error("Usuário inválido");
      }
    } catch (e) {
      setErroAcesso(true);
      setCarregando(false);
    }
  }, [router]);

  // 2. Buscar Dados do Evento e Mensagens (Polling a cada 3s)
  useEffect(() => {
    if (!id || !dadosUsuario) return;

    const carregarTudo = async () => {
      try {
        // Busca Informações do Evento
        const resEv = await fetch(`https://linkah-api.onrender.com/api/eventos/${id}`);
        if (resEv.ok) {
          const evData = await resEv.json();
          setDadosEvento(evData);
        }

        // Busca Mensagens do Chat
        const resMsg = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`);
        if (resMsg.ok) {
          setMensagens(await resMsg.json());
        }
        
        setCarregando(false);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setCarregando(false);
      }
    };

    carregarTudo();
    const interval = setInterval(carregarTudo, 3000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  // Scroll automático para o fim
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // Lógica de Imagem
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagemAnexada(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Enviar Mensagem
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!novoTexto.trim() && !imagemAnexada) || !dadosUsuario) return;

    const backupTexto = novoTexto;
    const backupImg = imagemAnexada;

    // Limpa os campos na hora (Optimistic UI)
    setNovoTexto('');
    setImagemAnexada(null);

    try {
      const res = await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: Number(id),
          usuario_nome: dadosUsuario.nome,
          texto: backupTexto,
          imagem: backupImg
        })
      });

      if (!res.ok) throw new Error();
    } catch (err) {
      alert("Erro ao enviar. Tente novamente.");
      setNovoTexto(backupTexto);
      setImagemAnexada(backupImg);
    }
  };

  if (erroAcesso) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        <X size={32} />
      </div>
      <h2 className="text-xl font-black text-slate-900 uppercase">Acesso Negado</h2>
      <p className="text-slate-500 mt-2">Redirecionando para o login...</p>
    </div>
  );

  if (carregando) return (
    <div className="h-screen bg-white flex items-center justify-center">
      <div className="text-[#d6006d] font-black text-xl animate-bounce tracking-tighter">LINKAH</div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 font-sans overflow-hidden">
      
      {/* HEADER ROBUSTO */}
      <header className="p-5 flex items-center justify-between border-b border-slate-100 bg-white shrink-0 shadow-md z-20">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors"
        >
          <ChevronLeft size={32} strokeWidth={3} />
        </button>
        
        <div className="text-center flex-1 px-4">
          <h1 className="text-[17px] font-extrabold uppercase tracking-tight text-slate-900 line-clamp-1 leading-tight">
            {dadosEvento?.nome || 'Comunidade'}
          </h1>
          
          <div className="flex items-center gap-3 justify-center mt-1.5">
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Calendar size={12} className="text-[#d6006d]" />
                  <span className="text-[11px] text-slate-700 font-black tracking-wide">
                    {dadosEvento?.data_inicio ? new Date(dadosEvento.data_inicio).toLocaleDateString('pt-BR') : 'Data Indisponível'}
                  </span>
              </div>
              <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Chat Ativo</span>
              </div>
          </div>
        </div>

        <div className="w-12 h-12 rounded-full bg-[#d6006d] flex items-center justify-center text-white text-[15px] font-black border-4 border-pink-50 shadow-lg shrink-0">
          {dadosUsuario?.nome?.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* ÁREA DE MENSAGENS */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f8fafc]">
        {mensagens.map((msg, idx) => {
          const souEu = dadosUsuario?.nome === msg.usuario_nome;
          return (
            <div key={idx} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter px-1">
                {msg.usuario_nome}
              </span>
              
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-sm border ${
                souEu 
                ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' 
                : 'bg-white border-slate-200 text-slate-700 rounded-tl-none'
              }`}>
                
                {msg.imagem && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-black/5">
                    <img src={msg.imagem} alt="Anexo" className="w-full h-auto block max-h-72 object-cover" />
                  </div>
                )}
                
                {msg.texto && <p className="text-[15px] leading-relaxed font-medium">{msg.texto}</p>}
                
                <div className={`text-[9px] mt-1 font-bold opacity-60 text-right`}>
                   {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-2" />
      </main>

      {/* FOOTER / INPUT */}
      <footer className="p-4 bg-white border-t border-slate-100 shrink-0">
        {imagemAnexada && (
          <div className="mb-3 relative inline-block">
            <img src={imagemAnexada} className="h-24 w-24 object-cover rounded-2xl border-2 border-[#d6006d] shadow-xl" alt="Preview" />
            <button 
              onClick={() => setImagemAnexada(null)} 
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={enviarMensagem} className="flex items-center gap-2 max-w-5xl mx-auto bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:border-[#d6006d] focus-within:ring-1 focus-within:ring-[#d6006d]/20 transition-all">
          <input 
            type="file" 
            accept="image/*" 
            hidden 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-400 hover:text-[#d6006d] hover:bg-pink-50 rounded-xl transition-all"
          >
            <Paperclip size={24} />
          </button>

          <input 
            type="text" 
            value={novoTexto} 
            onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[15px] px-2 py-2 text-slate-800 placeholder:text-slate-400" 
            placeholder="Envie uma mensagem..."
          />
          
          <button 
            type="submit" 
            disabled={!novoTexto.trim() && !imagemAnexada} 
            className="bg-[#d6006d] text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-40 disabled:grayscale transition-all"
          >
            <Send size={20} fill="currentColor" />
          </button>
        </form>
      </footer>
    </div>
  );
}