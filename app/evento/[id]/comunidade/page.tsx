'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Paperclip, 
  X, 
  Send, 
  Calendar, 
  ChevronLeft, 
  Users, 
  Sparkles, 
  Image as ImageIcon, 
  Plus,
  Heart,
  MoreVertical
} from 'lucide-react';

export default function SalaComunidade() {
  const { id } = useParams();
  const router = useRouter();
  
  // --- ESTADOS DE DADOS ---
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  
  // --- ESTADOS DE INTERFACE ---
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroAcesso, setErroAcesso] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. VALIDAÇÃO DE USUÁRIO (SEGURANÇA)
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
        throw new Error("User invalid");
      }
    } catch (e) {
      setErroAcesso(true);
      setCarregando(false);
    }
  }, [router]);

  // 2. SINCRONIZAÇÃO EM TEMPO REAL (EVENTO, CHAT E ONLINE)
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

        // Atualiza Presença e Busca Usuários Online
        const resOn = await fetch(
          `https://linkah-api.onrender.com/api/comunidade/${id}/online?usuario_nome=${encodeURIComponent(dadosUsuario.nome)}`
        );
        if (resOn.ok) {
          setUsuariosOnline(await resOn.json());
        }
        
        setCarregando(false);
      } catch (err) {
        console.error("Erro na sincronização:", err);
      }
    };

    carregarTudo();
    const interval = setInterval(carregarTudo, 4000); // Polling a cada 4 segundos
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  // 3. AUTO-SCROLL
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // 4. LÓGICA DE ANEXO
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagemAnexada(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 5. ENVIO DE MENSAGEM
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!novoTexto.trim() && !imagemAnexada) || !dadosUsuario) return;

    const backupTexto = novoTexto;
    const backupImg = imagemAnexada;

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

  // --- RENDERS DE ESTADO ---
  if (erroAcesso) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-8 text-center font-sans">
      <div className="w-20 h-20 bg-pink-50 text-[#d6006d] rounded-full flex items-center justify-center mb-6 animate-bounce">
        <X size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 uppercase">Acesso Bloqueado</h2>
      <p className="text-slate-400 mt-2">Faça login para participar da comunidade.</p>
    </div>
  );

  if (carregando) return (
    <div className="h-screen bg-gradient-to-br from-[#d6006d] to-[#ff4da6] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="text-white font-black tracking-[0.3em] text-sm animate-pulse">LINKAH</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#FDF2F7] text-slate-900 font-sans overflow-hidden">
      
      {/* HEADER EXCLUSIVO LINKAH 
          Design: Bordas ultra arredondadas e sombra flutuante.
      */}
      <header className="bg-white px-6 pt-8 pb-6 rounded-b-[45px] shadow-[0_15px_50px_rgba(214,0,109,0.15)] z-30">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.back()} 
            className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-400 hover:text-[#d6006d] transition-all active:scale-90"
          >
            <ChevronLeft size={28} strokeWidth={3} />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#d6006d] animate-pulse" />
              <h1 className="text-[18px] font-black uppercase tracking-tight text-slate-800 line-clamp-1 max-w-[180px]">
                {dadosEvento?.nome || 'Comunidade'}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1.5 bg-pink-50 px-4 py-1 rounded-full border border-pink-100">
              <Calendar size={12} className="text-[#d6006d]" />
              <span className="text-[11px] text-[#d6006d] font-black uppercase tracking-wider">
                {dadosEvento?.data_inicio ? new Date(dadosEvento.data_inicio).toLocaleDateString('pt-BR') : 'Live Now'}
              </span>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#d6006d] to-[#ff4da6] flex items-center justify-center text-white text-lg font-black shadow-[0_8px_20px_rgba(214,0,109,0.35)] ring-4 ring-pink-50">
            {dadosUsuario?.nome?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* PARTICIPANTES ONLINE (HORIZONTAL SCROLL) */}
        <div className="flex items-center gap-4 px-1 overflow-x-auto no-scrollbar">
           <div className="flex -space-x-4">
              {usuariosOnline.map((u, i) => (
                <div 
                  key={i} 
                  title={u.usuario_nome}
                  className="w-14 h-14 rounded-[22px] bg-white border-4 border-pink-50 flex items-center justify-center shadow-md relative overflow-hidden transition-transform hover:-translate-y-1"
                >
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#d6006d]/10" />
                   <span className="text-md font-black text-[#d6006d]">{u.usuario_nome.charAt(0).toUpperCase()}</span>
                </div>
              ))}
           </div>
           <button className="h-14 px-5 rounded-[22px] bg-[#d6006d] text-white text-[12px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-pink-200 active:scale-95 transition-all shrink-0">
              <Plus size={18} strokeWidth={3} /> Convidar
           </button>
        </div>
      </header>

      {/* ÁREA DE MENSAGENS 
          Design: Balões em gradiente e tipografia bold.
      */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {mensagens.map((msg, idx) => {
          const souEu = dadosUsuario?.nome === msg.usuario_nome;
          return (
            <div key={idx} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
              <div className="flex items-center gap-2 mb-2 px-2">
                {!souEu && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  {msg.usuario_nome}
                </span>
              </div>
              
              <div className={`group relative p-1 rounded-[30px] ${souEu ? 'bg-gradient-to-br from-[#d6006d] to-[#ff4da6]' : 'bg-white shadow-sm border border-pink-100/50'}`}>
                <div className={`px-6 py-4 rounded-[26px] ${souEu ? 'bg-white/10 text-white backdrop-blur-sm' : 'bg-white text-slate-700'}`}>
                  
                  {msg.imagem && (
                    <div className="mb-3 rounded-[20px] overflow-hidden shadow-inner border border-black/5">
                      <img src={msg.imagem} alt="Anexo Linkah" className="w-full h-auto block max-h-80 object-cover" />
                    </div>
                  )}
                  
                  {msg.texto && <p className="text-[16px] leading-relaxed font-bold tracking-tight">{msg.texto}</p>}
                  
                  <div className={`text-[10px] mt-2 font-black opacity-50 flex items-center justify-end gap-1`}>
                     {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                     {souEu && <Heart size={10} fill="white" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-4" />
      </main>

      {/* FOOTER / INPUT BAR 
          Design: Barra flutuante tipo "Island".
      */}
      <footer className="p-6 pb-10 bg-transparent shrink-0">
        <div className="max-w-5xl mx-auto">
          {imagemAnexada && (
            <div className="mb-5 relative inline-block animate-in zoom-in duration-300">
              <img src={imagemAnexada} className="h-32 w-32 object-cover rounded-[35px] border-4 border-white shadow-2xl ring-8 ring-pink-500/10" alt="Preview" />
              <button 
                onClick={() => setImagemAnexada(null)} 
                className="absolute -top-3 -right-3 bg-slate-900 text-white rounded-full p-2.5 shadow-xl border-2 border-white hover:bg-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form 
            onSubmit={enviarMensagem} 
            className="flex items-center gap-4 bg-white p-3 rounded-[35px] shadow-[0_25px_60px_rgba(214,0,109,0.18)] border border-pink-50 transition-all focus-within:ring-4 focus-within:ring-[#d6006d]/5"
          >
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="w-14 h-14 flex items-center justify-center bg-pink-50 text-[#d6006d] rounded-[26px] hover:bg-[#d6006d] hover:text-white transition-all shadow-inner"
            >
              <Paperclip size={26} strokeWidth={2.5} />
            </button>
            
            <input 
              type="file" 
              accept="image/*" 
              hidden 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            
            <input 
              type="text" 
              value={novoTexto} 
              onChange={(e) => setNovoTexto(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[16px] font-bold px-2 placeholder:text-slate-300" 
              placeholder="Envie sua energia para o chat..."
            />
            
            <button 
              type="submit" 
              disabled={!novoTexto.trim() && !imagemAnexada} 
              className="w-14 h-14 bg-gradient-to-tr from-[#d6006d] to-[#ff4da6] text-white rounded-[26px] flex items-center justify-center shadow-lg shadow-pink-200 disabled:opacity-20 disabled:grayscale transition-all active:scale-90"
            >
              <Send size={24} fill="currentColor" />
            </button>
          </form>

          <div className="flex justify-center mt-4">
             <div className="flex items-center gap-6 text-slate-300">
                <button className="hover:text-[#d6006d] transition-colors"><MoreVertical size={20} /></button>
                <div className="h-1 w-12 bg-slate-100 rounded-full" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Linkah Community v2.0</p>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}