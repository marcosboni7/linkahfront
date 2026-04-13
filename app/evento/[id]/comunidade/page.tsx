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
  ChevronLeft,
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { UserProfileModal } from '@/app/dashboard/UserProfileModal';

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO =
  'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

const EMOJIS_STATUS = ['✨', '🔥', '🚀', '😴', '💡', '🎮', '🍕', '💎'];

// --- HELPERS BLINDADOS PARA FOTO ---
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

  // 1. Autenticação e Recuperação de Foto
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

  // 2. Sync de Dados
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
      <div className="h-screen flex items-center justify-center bg-[#fafafe]">
        <Loader2 className="animate-spin text-violet-600" size={42} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fafafe] overflow-hidden text-slate-900">
      {isModalOpen && (
        <UserProfileModal
          {...({
            isOpen: isModalOpen,
            onClose: () => setIsModalOpen(false),
            userId: selectedUserId,
          } as any)}
        />
      )}

      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="px-6 py-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-violet-500 mb-1">
                Comunidade
              </p>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users size={18} className="text-violet-600" />
                {t?.members || 'Membros'}
              </h2>
            </div>

            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-all flex items-center justify-center"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 relative">
            <div className="flex items-center gap-4">
              <div
                className="relative cursor-pointer"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <img
                  src={getImagemUrl(getUserPhotoUrl(dadosUsuario))}
                  className="w-14 h-14 rounded-2xl object-cover"
                  alt="Minha Foto"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm shadow-sm">
                  {meuStatus}
                </div>
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {dadosUsuario?.nome}
                </p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-violet-500 font-bold mt-1">
                  Online agora
                </p>
              </div>
            </div>

            {showEmojiPicker && (
              <div className="absolute inset-0 rounded-3xl bg-white/95 backdrop-blur-sm z-20 flex flex-wrap items-center justify-center gap-3 p-4 animate-in fade-in zoom-in duration-200 border border-slate-200">
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

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-2">
            {usuariosOnline.map((u, i) => (
              <button
                key={i}
                onClick={() => handleOpenProfile(u.usuario_nome || u.nome)}
                className="w-full flex items-center gap-4 rounded-2xl px-4 py-3 text-left hover:bg-slate-50 transition-all"
              >
                <div className="relative shrink-0">
                  <img
                    src={getImagemUrl(getUserPhotoUrl(u))}
                    className="w-11 h-11 rounded-2xl object-cover"
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
                    <p className="mt-1 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-amber-600 font-bold">
                      <Crown size={10} />
                      Organizador
                    </p>
                  ) : (
                    <p className="mt-1 text-[10px] text-slate-400 font-medium">
                      Participante
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="px-5 md:px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center">
                <Zap size={20} />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-violet-500 font-bold mb-1">
                  Chat Público
                </p>
                <h1 className="text-lg font-semibold text-slate-900">
                  Sala da comunidade
                </h1>
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-all"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline font-medium">Sair</span>
            </button>
          </div>
        </header>

        {/* MENSAGENS */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-6">
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
                      className={`w-10 h-10 rounded-2xl object-cover ${
                        isHost ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-[#fafafe]' : ''
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
                      <span className="text-[10px] font-medium text-slate-500">
                        {m.usuario_nome}
                      </span>
                    )}

                    {isHost && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-amber-700 font-bold">
                        <Crown size={10} />
                        Host
                      </span>
                    )}
                  </div>

                  <div
                    className={`px-5 py-4 rounded-3xl border shadow-sm ${
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
                      className="w-10 h-10 rounded-2xl object-cover"
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

        {/* INPUT */}
        <form
          onSubmit={enviarMensagem}
          className="border-t border-slate-200 bg-white px-4 md:px-8 py-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-2 focus-within:border-violet-300 focus-within:bg-white transition-all">
              <input
                value={novoTexto}
                onChange={(e) => setNovoTexto(e.target.value)}
                placeholder="Escreva sua mensagem..."
                className="w-full bg-transparent outline-none py-3 text-sm text-slate-800 placeholder:text-slate-400 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-14 h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-sm transition-all active:scale-95"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}