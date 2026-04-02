'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, Video, Loader2, Phone, X, User, Bug } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto === 'undefined' || foto.trim() === '') return null;
  if (/^(http|https|blob|data):/.test(foto)) return foto; 
  const cleanBase = API_URL.replace(/\/$/, '');
  const cleanPath = foto.replace(/^\//, '');
  return `${cleanBase}/${cleanPath}`;
};

export default function SalaLinkahSkype() {
  const { t }: any = useLanguage();
  const { id } = useParams();
  const router = useRouter();

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [chamadaAtiva, setChamadaAtiva] = useState(false);
  const [nomeSalaCall, setNomeSalaCall] = useState('');
  const [conviteRecebido, setConviteRecebido] = useState<any>(null);
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleImageError = (e: any) => { 
    console.warn("⚠️ Erro ao carregar imagem específica:", e.target.src);
    e.target.onerror = null; 
    e.target.src = DEFAULT_FOTO; 
  };

  // 1. DEBUG CARREGAMENTO USUÁRIO
  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = localStorage.getItem('@Linkah:User');
      if (!savedUser) {
        router.push('/site/login');
        return;
      }
      
      const parsedUser = JSON.parse(savedUser);
      console.log("🔍 [DEBUG 1] Usuário no LocalStorage:", parsedUser);
      
      try {
        const res = await fetch(`${API_URL}/api/auth/perfil?email=${parsedUser.email}`);
        if (res.ok) {
          const profileData = await res.json();
          console.log("✅ [DEBUG 2] Perfil retornado pelo Banco:", profileData);
          setDadosUsuario(profileData);
          localStorage.setItem('@Linkah:User', JSON.stringify(profileData));
        } else {
          console.error("❌ [DEBUG 2] Erro ao buscar perfil no banco.");
          setDadosUsuario(parsedUser);
        }
      } catch (err) {
        setDadosUsuario(parsedUser);
      }
    };
    loadUserData();
  }, [router]);

  // 2. DEBUG SYNC MENSAGENS
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const atualizar = async () => {
      try {
        const minhaFoto = dadosUsuario.foto_perfil || dadosUsuario.foto || dadosUsuario.usuario_foto || '';
        
        const [resEv, resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/eventos/${id}`),
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`)
        ]);

        if (resMsg.ok) {
          const msgs = await resMsg.json();
          setMensagens(msgs);
          
          // Debug da primeira mensagem da lista para ver a estrutura
          if (msgs.length > 0) {
            console.log("📩 [DEBUG 3] Estrutura da Mensagem Recebida:", {
              texto: msgs[msgs.length-1].texto,
              usuario_foto: msgs[msgs.length-1].usuario_foto,
              foto: msgs[msgs.length-1].foto,
              full_object: msgs[msgs.length-1]
            });
          }
        }
        
        if (resOn.ok) {
          const on = await resOn.json();
          setUsuariosOnline(Array.isArray(on) ? on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome) : []);
        }

        if (resEv.ok) setDadosEvento(await resEv.json());
        setCarregando(false);
      } catch (e) { console.error("Erro na sincronização:", e); }
    };

    atualizar();
    const int = setInterval(atualizar, 4000);
    return () => clearInterval(int);
  }, [id, dadosUsuario]);

  // 3. DEBUG ENVIO DE MENSAGEM
  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() && !imagemAnexada) return;

    const fotoParaEnviar = dadosUsuario.foto_perfil || dadosUsuario.foto || dadosUsuario.usuario_foto || null;
    
    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: fotoParaEnviar,
      texto: novoTexto,
      imagem: imagemAnexada,
      tipo: 'chat'
    };

    console.log("📤 [DEBUG 4] Enviando Payload:", payload);

    setNovoTexto('');
    setImagemAnexada(null);

    try {
      const response = await fetch(`${API_URL}/api/comunidades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) console.error("❌ Erro ao enviar para API");
    } catch (err) { console.error("Erro ao enviar:", err); }
  };

  const iniciarCall = async (destino: string) => {
    if (!dadosUsuario) return;
    const sala = `Call_${id}_${Date.now()}`;
    const fotoCall = dadosUsuario.foto_perfil || dadosUsuario.foto || null;

    try {
      await fetch(`${API_URL}/api/comunidades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: Number(id),
          usuario_nome: dadosUsuario.nome,
          usuario_foto: fotoCall,
          texto: `CALL_INVITE|${destino}|${sala}`,
          tipo: 'status'
        })
      });
      setNomeSalaCall(sala);
      setChamadaAtiva(true);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens]);

  if (carregando) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#ff4d4d]" size={48} /></div>;

  return (
    <div className="flex h-screen bg-[#FCFBFA] overflow-hidden text-slate-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-6 flex items-center justify-between">
          <h2 className="font-bold text-2xl">Membros</h2>
          <Bug size={16} className="text-slate-300" title="Debug mode active" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {usuariosOnline.map((u, i) => {
            const imgSide = getImagemUrl(u.foto || u.foto_perfil || u.usuario_foto);
            return (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center overflow-hidden font-bold">
                  {imgSide ? <img src={imgSide} className="w-full h-full object-cover" alt="" onError={handleImageError} /> : u.usuario_nome?.charAt(0)}
                </div>
                <span className="text-sm font-bold truncate">{u.usuario_nome}</span>
              </div>
            );
          })}
        </div>
      </aside>

      {/* CHAT PRINCIPAL */}
      <main className="flex-1 flex flex-col bg-white lg:rounded-l-[3rem] shadow-2xl border-l border-slate-100 relative">
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-xl">
          <h1 className="font-bold text-lg">{dadosEvento?.nome || 'Chat Geral'}</h1>
          <button onClick={() => iniciarCall('Todos')} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-[#ff4d4d] transition-all"><Video size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#FCFBFA]/30">
          {mensagens.map((m, i) => {
            if (m.tipo === 'status' || m.texto?.includes("CALL_INVITE|")) return null;
            
            const souEu = m.usuario_nome === dadosUsuario.nome;
            // Tenta pegar a foto de qualquer campo que a API possa retornar
            const rawFoto = m.usuario_foto || m.foto || m.foto_perfil || m.avatar;
            const urlFotoMsg = getImagemUrl(rawFoto);

            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${souEu ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden font-bold shadow-sm ${souEu ? 'bg-[#ff4d4d] text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {urlFotoMsg ? (
                      <img src={urlFotoMsg} className="w-full h-full object-cover" onError={handleImageError} alt="User" />
                    ) : (
                      <span>{m.usuario_nome?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">{m.usuario_nome}</span>
                    <div className={`p-3 rounded-[1.3rem] shadow-sm ${souEu ? 'bg-[#ff4d4d] text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-900 rounded-tl-none'}`}>
                      {m.texto && <p className="text-xs leading-relaxed">{m.texto}</p>}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
          <div ref={scrollRef}></div>
        </div>

        <form onSubmit={enviarMensagem} className="p-6 border-t border-slate-50 bg-white flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Digite sua mensagem..." 
            value={novoTexto} 
            onChange={e => setNovoTexto(e.target.value)} 
            className="flex-1 p-4 rounded-2xl border border-slate-100 text-sm focus:outline-none bg-slate-50" 
          />
          <button type="submit" className="p-4 bg-[#ff4d4d] text-white rounded-full shadow-lg">
            <Send size={20} />
          </button>
        </form>
      </main>
    </div>
  );
}