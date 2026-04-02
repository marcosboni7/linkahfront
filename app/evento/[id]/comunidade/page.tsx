'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, Video, Loader2, Phone, X } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

// Função que trata a URL da imagem de forma segura
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

  const handleImageError = (e: any) => { e.target.src = DEFAULT_FOTO; };

  // 1. Carregar usuário do LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      setDadosUsuario(JSON.parse(savedUser));
    } else {
      router.push('/site/login');
    }
  }, [router]);

  // 2. Loop de atualização (Sync)
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const atualizar = async () => {
      try {
        const minhaFoto = dadosUsuario.foto_perfil || dadosUsuario.usuario_foto || dadosUsuario.foto || '';
        
        const [resEv, resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/eventos/${id}`),
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`)
        ]);

        if (resEv.ok) setDadosEvento(await resEv.json());
        
        if (resOn.ok) {
          const on = await resOn.json();
          if (Array.isArray(on)) {
            setUsuariosOnline(on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
          }
        }

        if (resMsg.ok) {
          const msgs = await resMsg.json();
          setMensagens(msgs);

          // Lógica de Convite de Call
          const AGORA = Date.now();
          msgs.slice(-5).forEach((msg: any) => {
            if (msg.texto?.includes("CALL_INVITE|")) {
              const partes = msg.texto.split("|");
              const destino = partes[1]?.trim().toLowerCase();
              if (destino === dadosUsuario.nome.toLowerCase() && (AGORA - new Date(msg.criado_em).getTime()) / 1000 < 25 && !chamadaAtiva) {
                setConviteRecebido({ 
                  de: msg.usuario_nome, 
                  sala: partes[2], 
                  foto: msg.usuario_foto || msg.foto || msg.avatar 
                });
              }
            }
          });
        }
        setCarregando(false);
      } catch (e) { console.error("Erro na sincronização:", e); }
    };

    atualizar();
    const int = setInterval(atualizar, 4000);
    return () => clearInterval(int);
  }, [id, dadosUsuario, chamadaAtiva]);

  // 3. Enviar Mensagem
  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() && !imagemAnexada) return;

    const fotoAtual = dadosUsuario.foto_perfil || dadosUsuario.usuario_foto || dadosUsuario.foto || null;

    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: fotoAtual,
      texto: novoTexto,
      imagem: imagemAnexada,
      tipo: 'chat'
    };

    setNovoTexto('');
    setImagemAnexada(null);

    try {
      await fetch(`${API_URL}/api/comunidades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) { console.error("Erro ao enviar:", err); }
  };

  // 4. Iniciar Call
  const iniciarCall = async (destino: string) => {
    if (!dadosUsuario) return;
    const sala = `Call_${id}_${Date.now()}`;
    const fotoCall = dadosUsuario.foto_perfil || dadosUsuario.usuario_foto || null;

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
      
      {/* MODAL DE CONVITE */}
      {conviteRecebido && (
        <div className="fixed inset-0 z-[999] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] text-center max-w-sm w-full shadow-2xl">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden bg-slate-100 flex items-center justify-center">
              {getImagemUrl(conviteRecebido.foto) ? (
                <img src={getImagemUrl(conviteRecebido.foto)!} className="w-full h-full object-cover" alt="" onError={handleImageError} />
              ) : <Phone className="text-[#ff4d4d]" size={40} />}
            </div>
            <h3 className="font-bold text-xl mb-8">{conviteRecebido.de} chamando...</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setNomeSalaCall(conviteRecebido.sala); setChamadaAtiva(true); setConviteRecebido(null); }} className="w-full bg-slate-950 text-white py-4 rounded-2xl font-bold">Atender</button>
              <button onClick={() => setConviteRecebido(null)} className="w-full text-slate-400 py-4 font-bold">Recusar</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-6"><h2 className="font-bold text-2xl">Membros</h2></div>
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {usuariosOnline.map((u, i) => {
            const imgSide = getImagemUrl(u.foto_perfil || u.usuario_foto || u.foto || u.avatar);
            return (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all">
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
        
        {/* TELA DE CALL (IFRAME) */}
        {chamadaAtiva && (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col lg:rounded-l-[3rem] overflow-hidden">
            <div className="p-4 flex justify-end bg-slate-900">
              <button onClick={() => setChamadaAtiva(false)} className="bg-[#ff4d4d] text-white px-6 py-2 rounded-full text-xs font-bold uppercase flex items-center gap-2"><X size={14}/> Sair da Call</button>
            </div>
            <iframe src={`https://meet.jit.si/${nomeSalaCall}#userInfo.displayName="${dadosUsuario?.nome}"`} className="flex-1 border-none" allow="camera; microphone; display-capture; autoplay" />
          </div>
        )}

        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <h1 className="font-bold text-lg">{dadosEvento?.nome || 'Chat Geral'}</h1>
          <button onClick={() => iniciarCall('Todos')} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-[#ff4d4d] transition-all"><Video size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#FCFBFA]/30">
          {mensagens.map((m, i) => {
            if (m.tipo === 'status' || m.texto?.includes("CALL_INVITE|")) return null;
            
            const souEu = m.usuario_nome === dadosUsuario.nome;
            // Busca a foto em todos os campos possíveis que a API pode retornar
            const imgChat = getImagemUrl(m.usuario_foto || m.foto || m.foto_perfil || m.avatar);

            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${souEu ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* AVATAR COM LETRA DE BACKUP */}
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden font-bold shadow-sm ${souEu ? 'bg-[#ff4d4d] text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {imgChat ? (
                      <img src={imgChat} className="w-full h-full object-cover" onError={handleImageError} alt="" />
                    ) : (
                      <span>{m.usuario_nome?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">{m.usuario_nome}</span>
                    <div className={`p-3 rounded-[1.3rem] shadow-sm ${souEu ? 'bg-[#ff4d4d] text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-900 rounded-tl-none'}`}>
                      {m.texto && <p className="text-xs leading-relaxed">{m.texto}</p>}
                      {m.imagem && (
                        <img 
                          src={getImagemUrl(m.imagem) || DEFAULT_FOTO} 
                          className="w-56 h-auto max-h-64 object-cover rounded-xl mt-2 border border-black/5" 
                          onError={handleImageError} 
                          alt="" 
                        />
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
          <div ref={scrollRef}></div>
        </div>

        {/* INPUT DE MENSAGEM */}
        <form onSubmit={enviarMensagem} className="p-6 border-t border-slate-50 bg-white flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Digite sua mensagem..." 
            value={novoTexto} 
            onChange={e => setNovoTexto(e.target.value)} 
            className="flex-1 p-4 rounded-2xl border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/20 transition-all bg-slate-50" 
          />
          <button type="submit" className="p-4 bg-[#ff4d4d] text-white rounded-full shadow-lg shadow-[#ff4d4d]/30 hover:brightness-110 active:scale-95 transition-all">
            <Send size={20} />
          </button>
        </form>
      </main>
    </div>
  );
}