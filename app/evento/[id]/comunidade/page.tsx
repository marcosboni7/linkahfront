'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, Video, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto === 'undefined' || foto.trim() === '') {
    return DEFAULT_FOTO;
  }

  foto = foto.trim();
  if (/^(https?:\/\/|blob:|data:)/.test(foto)) return foto;

  const cleanBase = API_URL.replace(/\/$/, '');
  const cleanPath = foto.replace(/^\//, '');
  return `${cleanBase}/${cleanPath}`;
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
  const [perfilAberto, setPerfilAberto] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      console.log('💾 Usuário logado:', user);
      setDadosUsuario(user);
    } else router.push('/site/login');
  }, [router]);

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
          console.log('👥 Usuários online:', on);
          setUsuariosOnline(on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
        }

        if (resMsg.ok) {
          const msgs = await resMsg.json();
          console.log('💬 Mensagens:', msgs);
          setMensagens(msgs);
        }

        setCarregando(false);
      } catch (e) {
        console.error('❌ Erro ao atualizar dados:', e);
      }
    };

    atualizar();
    const interval = setInterval(atualizar, 4000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const handleImageError = (e: any) => e.target.src = DEFAULT_FOTO;

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
    } catch (err) { console.error('❌ Erro ao enviar mensagem:', err); }
  };

  const iniciarCall = async (destino: string) => {
    if (!dadosUsuario) return;
    const sala = `Call_${id}_${Date.now()}`;
    setNomeSalaCall(sala);
    setChamadaAtiva(true);
    console.log(`📞 Iniciando call para ${destino} na sala ${sala}`);
  };

  if (carregando) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-red-500" size={48} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FCFBFA] overflow-hidden relative">
      {/* Modal de perfil */}
      {perfilAberto && (
        <div className="absolute inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 relative">
            <button className="absolute top-3 right-3" onClick={() => setPerfilAberto(null)}><X /></button>
            <img src={getImagemUrl(perfilAberto.foto_perfil || perfilAberto.avatar)} className="w-20 h-20 rounded-full object-cover mx-auto" />
            <h2 className="text-center mt-3 font-bold">{perfilAberto.usuario_nome}</h2>
            {perfilAberto.bio && <p className="mt-2 text-center">{perfilAberto.bio}</p>}
            {perfilAberto.linkedin && (
              <a href={perfilAberto.linkedin} target="_blank" className="block mt-3 text-center text-blue-600 underline">LinkedIn</a>
            )}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-6"><h2>Membros</h2></div>
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {usuariosOnline.map((u, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer"
              onClick={() => setPerfilAberto(u)}
            >
              <img
                src={getImagemUrl(u.foto_perfil || u.avatar || u.usuario_foto || u.foto)}
                className="w-10 h-10 rounded-xl object-cover"
                onError={handleImageError}
                alt={u.usuario_nome}
              />
              <span>{u.usuario_nome}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <main className="flex-1 flex flex-col bg-white">
        <header className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h1>Chat Geral</h1>
          <button onClick={() => iniciarCall('Todos')}><Video /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {mensagens.map((m, i) => {
            const souEu = m.usuario_nome === dadosUsuario.nome;

            const imgLink = souEu
              ? getImagemUrl(dadosUsuario.foto_perfil || dadosUsuario.avatar)
              : getImagemUrl(
                  usuariosOnline.find(u => u.usuario_nome === m.usuario_nome)?.foto_perfil ||
                  usuariosOnline.find(u => u.usuario_nome === m.usuario_nome)?.avatar ||
                  m.usuario_foto ||
                  m.foto
                );

            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-3 items-end`}>
                {!souEu && (
                  <img
                    src={imgLink}
                    className="w-10 h-10 rounded-xl object-cover cursor-pointer"
                    onError={handleImageError}
                    alt={m.usuario_nome}
                    onClick={() => setPerfilAberto(m)}
                  />
                )}
                <div className={`p-3 rounded-xl max-w-xs ${souEu ? 'bg-red-100' : 'bg-gray-100'}`}>
                  {m.texto && <p>{m.texto}</p>}
                  {m.imagem && <img src={getImagemUrl(m.imagem)} className="w-48 h-48 object-cover mt-2" onError={handleImageError} />}
                </div>
                {souEu && (
                  <img
                    src={imgLink}
                    className="w-10 h-10 rounded-xl object-cover cursor-pointer"
                    onError={handleImageError}
                    alt={m.usuario_nome}
                    onClick={() => setPerfilAberto(m)}
                  />
                )}
              </div>
            );
          })}
          <div ref={scrollRef}></div>
        </div>

        <form onSubmit={enviarMensagem} className="p-6 flex items-center gap-4 border-t border-slate-50">
          <input
            type="text"
            value={novoTexto}
            onChange={e => setNovoTexto(e.target.value)}
            placeholder="Escreva aqui..."
            className="flex-1 p-3 border rounded-xl"
          />
          <button type="submit"><Send /></button>
        </form>
      </main>
    </div>
  );
}