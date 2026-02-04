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
  ShieldCheck, 
  MoreHorizontal,
  Smile,
  Video
} from 'lucide-react';

export default function SalaComunidade() {
  const { id } = useParams();
  const router = useRouter();
  
  // Estados de Dados
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  
  // Estados de Interface
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroAcesso, setErroAcesso] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Validar Acesso do Usuário no LocalStorage
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

  // 2. Carregar Tudo (Dados do Evento, Mensagens e Presença Online)
  useEffect(() => {
    if (!id || !dadosUsuario) return;

    const carregarInformacoes = async () => {
      try {
        // Busca Detalhes do Evento
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

        // Atualiza Heartbeat (Presença) e busca quem está online
        const resOn = await fetch(
          `https://linkah-api.onrender.com/api/comunidade/${id}/online?usuario_nome=${encodeURIComponent(dadosUsuario.nome)}`
        );
        if (resOn.ok) {
          setUsuariosOnline(await resOn.json());
        }
        
        setCarregando(false);
      } catch (err) {
        console.error("Erro ao sincronizar dados:", err);
      }
    };

    carregarInformacoes();
    const interval = setInterval(carregarInformacoes, 4000); // Sincroniza a cada 4 segundos
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // Lógica de Processamento de Imagem para Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagemAnexada(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Enviar Mensagem para a API
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!novoTexto.trim() && !imagemAnexada) || !dadosUsuario) return;

    const backupTexto = novoTexto;
    const backupImg = imagemAnexada;

    // Limpeza imediata (Optimistic UI)
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
      alert("Falha na conexão. A mensagem não foi enviada.");
      setNovoTexto(backupTexto);
      setImagemAnexada(backupImg);
    }
  };

  if (erroAcesso) return (
    <div className="h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-6 text-center text-white font-sans">
      <X size={48} className="text-red-500 mb-4" />
      <h2 className="text-xl font-bold uppercase tracking-widest">Acesso Restrito</h2>
      <p className="text-slate-400 mt-2">Você precisa estar logado para entrar na reunião.</p>
    </div>
  );

  if (carregando) return (
    <div className="h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white font-bold tracking-[0.2em] animate-pulse">CONECTANDO AO ZOOM...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#f4f4f7] text-slate-900 font-sans overflow-hidden">
      
      {/* ZOOM HEADER (BARRA SUPERIOR ESCURA) */}
      <header className="bg-[#242424] text-white p-4 shadow-2xl z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors font-semibold"
          >
            <ChevronLeft size={20} strokeWidth={3} />
            <span className="text-sm">Sair</span>
          </button>
          
          <div className="flex flex-col items-center flex-1 mx-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              <h1 className="text-[15px] font-bold tracking-tight truncate max-w-[180px] sm:max-w-md">
                {dadosEvento?.nome || 'Comunidade Linkah'}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                ID: {id} • {dadosEvento?.data_inicio ? new Date(dadosEvento.data_inicio).toLocaleDateString('pt-BR') : '--/--/--'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex bg-[#3d3d3d] p-1.5 rounded-lg text-slate-300">
                <Video size={18} />
             </div>
             <div className="w-9 h-9 rounded-xl bg-[#0b5cff] flex items-center justify-center font-black text-sm border border-white/20 shadow-lg">
               {dadosUsuario?.nome?.charAt(0).toUpperCase()}
             </div>
          </div>
        </div>

        {/* PARTICIPANTES (GALLERY VIEW) */}
        <div className="flex justify-center mt-4">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 px-4">
             {usuariosOnline.map((u, i) => (
               <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-[#3d3d3d] border-2 border-emerald-500/40 flex items-center justify-center relative overflow-hidden shadow-xl ring-offset-2 ring-offset-[#242424]">
                    <span className="text-2xl font-black text-slate-200">{u.usuario_nome.charAt(0).toUpperCase()}</span>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm py-0.5 px-1">
                       <p className="text-[9px] text-center truncate text-white font-medium">{u.usuario_nome}</p>
                    </div>
                  </div>
               </div>
             ))}
             {/* BOTÃO CONVIDAR */}
             <div className="w-16 h-16 rounded-2xl bg-[#2d2d2d] border-2 border-dashed border-slate-600 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-slate-400 hover:text-slate-300 transition-all">
                <Users size={20} />
                <span className="text-[8px] font-bold mt-1 uppercase">Convidar</span>
             </div>
          </div>
        </div>
      </header>

      {/* ÁREA DO CHAT (MENSAGENS) */}
      <main className="flex-1 overflow-y-auto bg-white p-4 space-y-5">
        <div className="flex flex-col items-center py-4 space-y-2">
           <span className="bg-slate-100 text-slate-500 text-[10px] px-4 py-1 rounded-full font-black uppercase tracking-widest">
             Início do Chat da Reunião
           </span>
           <p className="text-[11px] text-slate-400">Mensagens enviadas aqui podem ser vistas por todos os participantes.</p>
        </div>

        {mensagens.map((msg, idx) => {
          const souEu = dadosUsuario?.nome === msg.usuario_nome;
          return (
            <div key={idx} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className={`text-[12px] font-bold ${souEu ? 'text-[#0b5cff]' : 'text-slate-700'}`}>
                  {msg.usuario_nome} {souEu && '(Eu)'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                </span>
              </div>
              
              <div className={`px-4 py-2.5 rounded-xl max-w-[85%] shadow-sm ${
                souEu 
                ? 'bg-[#e7f0ff] text-[#0b5cff] border border-[#cfdfff] rounded-tr-none' 
                : 'bg-[#f0f2f4] text-slate-800 border border-slate-200 rounded-tl-none'
              }`}>
                {msg.imagem && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-black/5 shadow-sm">
                    <img src={msg.imagem} alt="Anexo" className="w-full h-auto block max-h-80 object-cover" />
                  </div>
                )}
                {msg.texto && <p className="text-[15px] leading-relaxed font-medium">{msg.texto}</p>}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-4" />
      </main>

      {/* FOOTER (INPUT ZOOM STYLE) */}
      <footer className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto">
          {/* Preview de imagem com botão de fechar */}
          {imagemAnexada && (
            <div className="mb-4 relative inline-block group">
              <img src={imagemAnexada} className="h-24 w-24 object-cover rounded-xl border-2 border-[#0b5cff] shadow-xl" alt="Preview" />
              <button 
                onClick={() => setImagemAnexada(null)} 
                className="absolute -top-3 -right-3 bg-slate-900 text-white rounded-full p-1.5 shadow-lg border-2 border-white hover:bg-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex flex-col bg-[#f0f2f4] rounded-2xl border border-transparent focus-within:bg-white focus-within:border-[#0b5cff] focus-within:ring-4 focus-within:ring-indigo-50 transition-all overflow-hidden">
            
            <div className="flex items-center gap-2 px-3 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Enviar para:</span>
              <span className="bg-[#0b5cff]/10 text-[#0b5cff] text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                Todos <Users size={10} />
              </span>
            </div>

            <div className="flex items-end gap-2 p-2">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()} 
                className="p-2.5 text-slate-500 hover:text-[#0b5cff] hover:bg-white rounded-xl transition-all"
              >
                <Paperclip size={22} />
              </button>
              
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
              
              <textarea 
                rows={1}
                value={novoTexto} 
                onChange={(e) => setNovoTexto(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[15px] px-1 py-2.5 text-slate-800 placeholder:text-slate-400 resize-none max-h-32" 
                placeholder="Digite a mensagem aqui..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    enviarMensagem(e as any);
                  }
                }}
              />
              
              <button 
                onClick={enviarMensagem}
                disabled={!novoTexto.trim() && !imagemAnexada} 
                className="bg-[#0b5cff] hover:bg-[#0048cc] text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all disabled:opacity-30 disabled:grayscale flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95"
              >
                <span>Enviar</span>
                <Send size={16} fill="currentColor" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-3 px-2">
             <div className="flex items-center gap-5 text-slate-400">
                <button className="hover:text-indigo-600 transition-colors"><Smile size={20} /></button>
                <button className="hover:text-indigo-600 transition-colors"><MoreHorizontal size={20} /></button>
             </div>
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                As mensagens são visíveis para <span className="text-[#0b5cff]">Todos</span>
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
}