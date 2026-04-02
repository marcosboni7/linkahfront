'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, Video, Loader2 } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

// --- Função utilitária para pegar URL de avatar/foto ---
const getImagemUrl = (foto?: string | null) => {
  console.log('🔍 getImagemUrl chamado com:', foto);
  if (!foto || foto === 'null' || foto === 'undefined' || foto.trim() === '') return DEFAULT_FOTO;
  if (/^(http|blob|data):/.test(foto)) return foto;
  const cleanBase = API_URL.replace(/\/$/, '');
  const cleanPath = foto.replace(/^\//, '');
  const finalUrl = `${cleanBase}/${cleanPath}`;
  console.log('✅ URL construída:', finalUrl);
  return finalUrl;
};

export default function SalaLinkahSkype() {
  const { t }: any = useLanguage();
  const { id } = useParams();
  const router = useRouter();

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);
  const [chamadaAtiva, setChamadaAtiva] = useState(false);
  const [nomeSalaCall, setNomeSalaCall] = useState('');
  const [conviteRecebido, setConviteRecebido] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Map de avatares dos usuários online ---
  const avatarMap = Object.fromEntries(
    usuariosOnline.map(u => [u.usuario_nome, u.foto_perfil || u.avatar || u.usuario_foto || u.foto])
  );

  const handleImageError = (e: any, local: string) => {
    console.error(`❌ Erro [${local}]:`, e.target.src);
    e.target.src = DEFAULT_FOTO;
  };

  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() && !imagemAnexada) return;

    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: dadosUsuario?.foto_perfil || dadosUsuario?.avatar || null,
      texto: novoTexto,
      imagem: imagemAnexada,
      tipo: 'chat'
    };

    console.log('✉️ Enviando mensagem:', payload);
    setNovoTexto('');
    setImagemAnexada(null);

    try {
      await fetch(`${API_URL}/api/comunidades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) { console.error(err); }
  };

  const iniciarCall = async (destino: string) => {
    if (!dadosUsuario) return;
    const sala = `Call_${id}_${Date.now()}`;
    const fotoCall = dadosUsuario.foto_perfil || dadosUsuario.avatar || null;
    console.log('📞 Iniciando call para:', destino, 'com foto:', fotoCall);

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
    } catch (err) { console.error("Erro ao iniciar call:", err); }
  };

  // --- Carrega usuário logado ---
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      console.log('💾 Usuário logado encontrado:', savedUser);
      setDadosUsuario(JSON.parse(savedUser));
    } else router.push('/site/login');
  }, [router]);

  // --- Atualiza mensagens e presença ---
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const atualizar = async () => {
      try {
        const minhaFoto = dadosUsuario.foto_perfil || dadosUsuario.avatar || '';
        const [resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`)
        ]);

        if (resOn.ok) {
          const on = await resOn.json();
          console.log('👥 Usuários online recebidos:', on);
          if (Array.isArray(on)) setUsuariosOnline(on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
        }

        if (resMsg.ok) {
          const msgs = await resMsg.json();
          console.log('💬 Mensagens recebidas:', msgs);
          setMensagens(msgs);
        }

        setCarregando(false);
      } catch (e) { console.error('Erro ao atualizar dados:', e); }
    };

    atualizar();
    const int = setInterval(atualizar, 4000);
    return () => clearInterval(int);
  }, [id, dadosUsuario]);

  // --- Scroll automático ---
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  if (carregando) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#ff4d4d]" size={48} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FCFBFA] overflow-hidden text-slate-900 font-sans">
      {/* MODAL CONVITE */}
      {conviteRecebido && (
        <div className="fixed inset-0 z-[999] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] text-center max-w-sm w-full shadow-2xl">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden bg-slate-100 flex items-center justify-center">
              <img src={getImagemUrl(conviteRecebido.foto)} className="w-full h-full object-cover" alt="" onError={(e) => handleImageError(e, 'Modal Convite')} />
            </div>
            <h3 className="font-bold text-xl mb-8">{conviteRecebido.de} chamando...</h3>
            <button onClick={() => { setNomeSalaCall(conviteRecebido.sala); setChamadaAtiva(true); setConviteRecebido(null); }} className="w-full bg-slate-950 text-white py-4 rounded-2xl font-bold mb-2">Atender</button>
            <button onClick={() => setConviteRecebido(null)} className="w-full text-slate-400 py-4 font-bold">Recusar</button>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-6"><h2 className="font-bold text-2xl">Membros</h2></div>
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {usuariosOnline.map((u, i) => (
            <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src={getImagemUrl(u.foto_perfil || u.avatar || u.usuario_foto || u.foto)} className="w-full h-full object-cover" onError={(e) => handleImageError(e, 'Sidebar')} alt={u.usuario_nome} />
              </div>
              <span className="text-sm font-bold truncate">{u.usuario_nome}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT */}
      <main className="flex-1 flex flex-col bg-white lg:rounded-l-[3rem] shadow-2xl border-l border-slate-100 relative">
        {chamadaAtiva && (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col lg:rounded-l-[3rem] overflow-hidden">
            <div className="p-4 flex justify-end">
              <button onClick={() => setChamadaAtiva(false)} className="bg-[#ff4d4d] text-white px-6 py-2 rounded-full text-xs font-bold uppercase">Sair da Call</button>
            </div>
            <iframe src={`https://meet.jit.si/${nomeSalaCall}#userInfo.displayName="${dadosUsuario?.nome}"`} className="flex-1 border-none" allow="camera; microphone; display-capture; autoplay" />
          </div>
        )}

        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-xl">
          <h1 className="font-bold text-lg">Chat Geral</h1>
          <button onClick={() => iniciarCall('Todos')} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-[#ff4d4d]"><Video size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {mensagens.map((m, i) => {
            const souEu = m.usuario_nome === dadosUsuario.nome;

            const avatarMsg = m.usuario_foto || m.foto || m.avatar || avatarMap[m.usuario_nome] || (souEu ? dadosUsuario.foto_perfil || dadosUsuario.avatar : null);
            const imgLink = getImagemUrl(avatarMsg);

            console.log(`💬 Mensagem #${i}: usuário=${m.usuario_nome}, avatar da msg=${m.usuario_foto}, avatar do map=${avatarMap[m.usuario_nome]}, imgLink final=${imgLink}`);

            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${souEu ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img src={imgLink} className="w-full h-full object-cover" onError={(e) => handleImageError(e, 'Chat')} alt={m.usuario_nome} />
                  </div>
                  <div className={`p-3 rounded-[1.5rem] ${souEu ? 'bg-[#ff4d4d]/10 text-[#ff4d4d]' : 'bg-slate-50 text-slate-900'}`}>
                    {m.texto && <p className="text-[11px] font-medium">{m.texto}</p>}
                    {m.imagem && <img src={getImagemUrl(m.imagem)} className="w-48 h-48 object-cover rounded-xl mt-2" onError={(e) => handleImageError(e, 'Chat Imagem')} alt="" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef}></div>
        </div>

        <form onSubmit={enviarMensagem} className="p-6 border-t border-slate-50 flex items-center gap-4">
          <input type="text" placeholder="Escreva aqui..." value={novoTexto} onChange={e => setNovoTexto(e.target.value)} className="flex-1 p-3 rounded-2xl border border-slate-100 text-sm focus:outline-none" />
          <button type="submit" className="p-3 bg-[#ff4d4d] text-white rounded-full">
            <Send size={18} />
          </button>
        </form>
      </main>
    </div>
  );
}