'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Send,
  Loader2,
  Users,
  ChevronLeft,
  MessageCircle,
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

export default function MatchChatPage() {
  const { t }: any = useLanguage();
  const { id } = useParams() as any; // ID do usuário com quem está conversando (o match)
  const router = useRouter();

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [dadosMatch, setDadosMatch] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [novoTexto, setNovoTexto] = useState('');

  const [meuStatus, setMeuStatus] = useState('✨');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Autenticação e Recuperação de Dados do User Logado
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('@Linkah:Token');
      const userStr = localStorage.getItem('@Linkah:User');
      
      if (!token || !userStr) {
        router.push('/login');
        return;
      }

      try {
        let user = JSON.parse(userStr);
        setDadosUsuario(user);

        // Busca informações do perfil com quem você deu match (baseado no ID da URL)
        const resMatch = await fetch(`${API_URL}/api/usuarios/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resMatch.ok) {
          const matchData = await resMatch.json();
          setDadosMatch(matchData);
        }
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      }

      setCarregando(false);
    };

    init();
  }, [id, router]);

  // 2. Sync de Mensagens do Chat Direto
  useEffect(() => {
    if (!id || !dadosUsuario) return;
    const token = localStorage.getItem('token') || localStorage.getItem('@Linkah:Token');

    const syncMensagens = async () => {
      try {
        const res = await fetch(`${API_URL}/api/chat/${id}?t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const msgs = await res.json();
          if (Array.isArray(msgs)) {
            setMensagens(msgs);
          }
        }
      } catch (e) {
        console.error('Erro ao sincronizar mensagens:', e);
      }
    };

    syncMensagens();
    const interval = setInterval(syncMensagens, 3000); // Atualiza a cada 3 segundos
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

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

    const token = localStorage.getItem('token') || localStorage.getItem('@Linkah:Token');

    const payload = {
      destinatario_id: Number(id),
      texto: novoTexto,
      status: meuStatus,
    };

    setNovoTexto('');

    try {
      const res = await fetch(`${API_URL}/api/chat/enviar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Atualiza a lista instantaneamente após enviar
        const novaMsg = await res.json();
        setMensagens((prev) => [...prev, novaMsg.mensagem || novaMsg]);
      }
    } catch (e) {
      console.error('Erro ao enviar mensagem:', e);
    }
  };

  if (carregando) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="animate-spin text-indigo-500" size={42} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-white">
      {isModalOpen && (
        <UserProfileModal
          {...({
            isOpen: isModalOpen,
            onClose: () => setIsModalOpen(false),
            userId: selectedUserId,
          } as any)}
        />
      )}

      {/* SIDEBAR DO USUÁRIO LOGADO */}
      <aside className="hidden lg:flex w-80 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="px-6 py-6 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-indigo-400 mb-1">
                Conexão
              </p>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users size={18} className="text-indigo-500" />
                Seu Perfil
              </h2>
            </div>

            <button
              onClick={() => router.push('/matches')}
              className="w-10 h-10 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all flex items-center justify-center"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 relative">
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
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-sm shadow-sm">
                  {meuStatus}
                </div>
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-white truncate">
                  {dadosUsuario?.nome}
                </p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-indigo-400 font-bold mt-1">
                  Online
                </p>
              </div>
            </div>

            {showEmojiPicker && (
              <div className="absolute inset-0 rounded-3xl bg-zinc-900/95 backdrop-blur-sm z-20 flex flex-wrap items-center justify-center gap-3 p-4 animate-in fade-in zoom-in duration-200 border border-zinc-700">
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

        <div className="flex-1 overflow-y-auto px-6 py-6 text-zinc-400 text-sm">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Dica de Conversa</p>
          <p className="leading-relaxed text-zinc-400">
            Vocês deram match por estarem na mesma região com interesses parecidos. Que tal puxar assunto sobre o que vocês gostam?
          </p>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DO CHAT */}
      <main className="flex-1 min-w-0 flex flex-col bg-zinc-950">
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
          <div className="px-5 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={getImagemUrl(getUserPhotoUrl(dadosMatch))}
                className="w-12 h-12 rounded-2xl object-cover border border-zinc-700"
                alt="Match"
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-indigo-400 font-bold mb-0.5">
                  Match na Região
                </p>
                <h1 className="text-base font-semibold text-white">
                  {dadosMatch?.nome || 'Conversa'}
                </h1>
              </div>
            </div>

            <button
              onClick={() => router.push('/matches')}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 transition-all text-sm"
            >
              <ChevronLeft size={16} />
              <span>Voltar aos Matches</span>
            </button>
          </div>
        </header>

        {/* MENSAGENS */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-6">
          {mensagens.length === 0 && (
            <div className="text-center py-20 text-zinc-500">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-40" />
              <p>Nenhuma mensagem ainda. Diga olá para {dadosMatch?.nome || 'esta pessoa'}!</p>
            </div>
          )}

          {mensagens.map((m, i) => {
            // Identifica se a mensagem foi enviada por você
            const souEu = m.remetente_id === dadosUsuario?.id || m.usuario_nome === dadosUsuario?.nome;

            return (
              <div
                key={i}
                className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-3 items-end animate-in fade-in slide-in-from-bottom-4 duration-300`}
              >
                {!souEu && (
                  <div className="relative shrink-0">
                    <img
                      src={getImagemUrl(getUserPhotoUrl(dadosMatch))}
                      className="w-9 h-9 rounded-2xl object-cover border border-zinc-800"
                      alt="Match Msg"
                    />
                  </div>
                )}

                <div className={`max-w-[78%] flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-5 py-3.5 rounded-3xl border shadow-sm ${
                      souEu
                        ? 'bg-indigo-600 text-white border-indigo-600 rounded-br-md'
                        : 'bg-zinc-900 text-zinc-200 border-zinc-800 rounded-bl-md'
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
                      className="w-9 h-9 rounded-2xl object-cover border border-zinc-800"
                      alt="Me"
                    />
                  </div>
                )}
              </div>
            );
          })}

          <div ref={scrollRef} />
        </div>

        {/* INPUT DE ENVIO */}
        <form
          onSubmit={enviarMensagem}
          className="border-t border-zinc-800 bg-zinc-900 px-4 md:px-8 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-2 focus-within:border-indigo-500 transition-all">
              <input
                value={novoTexto}
                onChange={(e) => setNovoTexto(e.target.value)}
                placeholder="Escreva sua mensagem..."
                className="w-full bg-transparent outline-none py-2 text-sm text-white placeholder:text-zinc-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}