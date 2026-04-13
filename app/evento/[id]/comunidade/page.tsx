'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Send,
  Loader2,
  LogOut,
  Users,
  Crown,
  Zap,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { UserProfileModal } from '@/app/dashboard/UserProfileModal';

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO =
  'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

const EMOJIS_STATUS = ['✨', '🔥', '🚀', '😴', '💡', '🎮', '🍕', '💎'];

const getUserPhotoUrl = (user: any) => {
  if (!user) return DEFAULT_FOTO;

  if (typeof user === 'string') {
    if (user.length > 5 && user !== 'null') return user;
    return DEFAULT_FOTO;
  }

  const campos = [
    'foto',
    'avatar',
    'foto_perfil',
    'usuario_foto',
    'image',
    'profile_photo',
    'url_foto',
    'foto_url',
  ];

  for (const c of campos) {
    if (
      user[c] &&
      typeof user[c] === 'string' &&
      user[c].length > 5 &&
      user[c] !== 'null'
    ) {
      return user[c];
    }
  }

  const subObjetos = ['data', 'user', 'usuario'];
  for (const sub of subObjetos) {
    if (user[sub]) {
      for (const c of campos) {
        if (
          user[sub][c] &&
          typeof user[sub][c] === 'string' &&
          user[sub][c].length > 5 &&
          user[sub][c] !== 'null'
        ) {
          return user[sub][c];
        }
      }
    }
  }

  return DEFAULT_FOTO;
};

const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto.trim() === '' || foto === undefined) {
    return DEFAULT_FOTO;
  }

  if (/^(https?:\/\/|blob:|data:)/.test(foto)) return foto;

  const baseUrl = API_URL.replace(/\/$/, '');
  const cleanPath = foto.replace(/^\//, '');

  return `${baseUrl}/${cleanPath}`;
};

export default function ComunidadePage() {
  const { t }: any = useLanguage();
  const { id } = useParams();
  const router = useRouter();

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [novoTexto, setNovoTexto] = useState('');

  const [meuStatus, setMeuStatus] = useState('✨');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const userStr = localStorage.getItem('@Linkah:User');
      if (!userStr) return router.push('/site/login');

      try {
        let user = JSON.parse(userStr);

        if (user.email && !user.avatar && !user.foto_perfil) {
          const res = await fetch(
            `${API_URL}/api/auth/perfil?email=${encodeURIComponent(user.email)}`
          );
          if (res.ok) {
            const data = await res.json();
            const foto = data.avatar || data.foto_perfil;
            if (foto) {
              user = { ...user, avatar: foto };
              localStorage.setItem('@Linkah:User', JSON.stringify(user));
            }
          }
        }

        setDadosUsuario(user);
      } catch (e) {
        router.push('/site/login');
      }

      setCarregando(false);
    };

    init();
  }, [router]);

  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const sync = async () => {
      try {
        const minhaFoto = getUserPhotoUrl(dadosUsuario);

        const [resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(
            `${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${encodeURIComponent(
              minhaFoto
            )}&status=${encodeURIComponent(meuStatus)}`
          ),
        ]);

        if (resOn.ok) {
          const onlineData = await resOn.json();
          if (Array.isArray(onlineData)) {
            setUsuariosOnline(
              onlineData.filter(
                (u: any) => (u.usuario_nome || u.nome) !== dadosUsuario.nome
              )
            );
          }
        }

        if (resMsg.ok) {
          const msgs = await resMsg.json();
          if (Array.isArray(msgs)) {
            setMensagens(msgs);
          }
        }
      } catch (e) {
        console.error('Erro no Sync:', e);
      }
    };

    sync();
    const interval = setInterval(sync, 4000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario, meuStatus]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const handleOpenProfile = (userName: string) => {
    setSelectedUserId(userName);
    setIsModalOpen(true);
  };

  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() || !dadosUsuario) return;

    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: getUserPhotoUrl(dadosUsuario),
      texto: novoTexto,
      status: meuStatus,
      tipo: 'chat',
    };

    setNovoTexto('');

    try {
      await fetch(`${API_URL}/api/comunidades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error('Erro ao enviar mensagem:', e);
    }
  };

  if (carregando) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-violet-600" size={44} />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#fafaff] text-slate-900">
      {isModalOpen && (
        <UserProfileModal
          {...({
            isOpen: isModalOpen,
            onClose: () => setIsModalOpen(false),
            userId: selectedUserId,
          } as any)}
        />
      )}

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.06),transparent_30%)]" />

      <div className="relative flex h-full">
        {/* SIDEBAR */}
        <aside className="hidden lg:flex w-[340px] shrink-0 flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-xl">
          <div className="px-6 py-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-violet-500 font-bold mb-1">
                  Community
                </p>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Users size={18} className="text-violet-600" />
                  {t?.members || 'Membros'}
                </h2>
              </div>

              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-violet-700 hover:bg-violet-50 transition-all flex items-center justify-center shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            <div className="relative rounded-[1.8rem] bg-gradient-to-br from-violet-600 to-fuchsia-600 p-[1px] shadow-lg shadow-violet-200">
              <div className="rounded-[1.75rem] bg-slate-950 px-5 py-5">
                <div className="flex items-center gap-4 relative">
                  <div
                    className="relative cursor-pointer"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <img
                      src={getImagemUrl(getUserPhotoUrl(dadosUsuario))}
                      className="w-14 h-14 rounded-[1.2rem] object-cover border border-white/10 shadow-md"
                      alt="Minha Foto"
                    />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-slate-950 flex items-center justify-center text-sm shadow-lg">
                      {meuStatus}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {dadosUsuario?.nome}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-violet-300 font-bold mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </p>
                  </div>

                  <div className="ml-auto">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/10">
                      <Sparkles size={18} />
                    </div>
                  </div>
                </div>

                {showEmojiPicker && (
                  <div className="absolute inset-0 rounded-[1.75rem] bg-slate-950/95 backdrop-blur-md z-20 flex flex-wrap items-center justify-center gap-3 p-5 animate-in fade-in zoom-in duration-200">
                    {EMOJIS_STATUS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setMeuStatus(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-2xl hover:scale-125 transition-all"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-2">
              {usuariosOnline.map((u, i) => (
                <button
                  key={i}
                  onClick={() => handleOpenProfile(u.usuario_nome || u.nome)}
                  className="w-full flex items-center gap-4 rounded-[1.4rem] px-4 py-3 text-left hover:bg-violet-50 transition-all group"
                >
                  <div className="relative shrink-0">
                    <img
                      src={getImagemUrl(getUserPhotoUrl(u))}
                      className="w-11 h-11 rounded-[1rem] object-cover shadow-sm group-hover:scale-105 transition-all"
                      alt="User"
                    />
                    <span className="absolute -top-1 -right-1 text-xs">
                      {u.status || '✨'}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 truncate">
                      {u.usuario_nome || u.nome}
                    </p>

                    {u.is_host ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] text-amber-600 font-bold">
                        <Crown size={10} />
                        Organizador
                      </p>
                    ) : (
                      <p className="mt-1 text-[10px] text-slate-400 font-medium">
                        Participante ativo
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CHAT */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
            <div className="px-6 md:px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shadow-sm">
                  <Zap size={20} />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.26em] text-violet-500 font-bold mb-1">
                    Chat Público
                  </p>
                  <h1 className="text-lg font-semibold text-slate-900">
                    Comunidade do evento
                  </h1>
                </div>
              </div>

              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-all shadow-sm"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline font-medium">Sair</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-6 bg-[#fcfcff]">
            {mensagens.map((m, i) => {
              const souEu = m.usuario_nome === dadosUsuario?.nome;
              const isHost = m.usuario_nome === 'Marcos Boni' || m.is_host;

              return (
                <div
                  key={i}
                  className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-3 items-end animate-in fade-in slide-in-from-bottom-4 duration-300`}
                >
                  {!souEu && (
                    <button
                      onClick={() => handleOpenProfile(m.usuario_nome)}
                      className="relative shrink-0"
                    >
                      <img
                        src={getImagemUrl(getUserPhotoUrl(m.usuario_foto || m))}
                        className={`w-10 h-10 rounded-[1rem] object-cover shadow-sm ${
                          isHost ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-white' : ''
                        }`}
                        alt="Msg User"
                      />
                      <span className="absolute -top-1 -right-1 text-xs">
                        {m.status || '✨'}
                      </span>
                    </button>
                  )}

                  <div
                    className={`max-w-[78%] flex flex-col ${
                      souEu ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      {!souEu && (
                        <span className="text-[10px] font-semibold text-slate-500">
                          {m.usuario_nome}
                        </span>
                      )}

                      {isHost && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-amber-700 font-bold">
                          <Crown size={10} />
                          Host
                        </span>
                      )}
                    </div>

                    <div
                      className={`px-5 py-4 rounded-[1.6rem] shadow-sm border ${
                        souEu
                          ? 'bg-violet-600 text-white border-violet-600 rounded-br-md'
                          : 'bg-white text-slate-700 border-slate-200 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap break-words">
                        {m.texto}
                      </p>
                    </div>
                  </div>

                  {souEu && (
                    <div className="relative shrink-0">
                      <img
                        src={getImagemUrl(getUserPhotoUrl(dadosUsuario))}
                        className="w-10 h-10 rounded-[1rem] object-cover shadow-sm"
                        alt="Me"
                      />
                      <span className="absolute -top-1 -right-1 text-xs">
                        {meuStatus}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={scrollRef} />
          </div>

          <form
            onSubmit={enviarMensagem}
            className="shrink-0 border-t border-slate-200/80 bg-white px-4 md:px-8 py-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-[1.7rem] border border-slate-200 bg-slate-50/80 focus-within:bg-white focus-within:border-violet-300 transition-all px-5 py-2 shadow-sm">
                <input
                  value={novoTexto}
                  onChange={(e) => setNovoTexto(e.target.value)}
                  placeholder="Escreva sua mensagem..."
                  className="w-full bg-transparent outline-none py-3 text-sm text-slate-800 placeholder:text-slate-400 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-14 h-14 rounded-[1.3rem] bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-lg shadow-violet-200 transition-all active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}