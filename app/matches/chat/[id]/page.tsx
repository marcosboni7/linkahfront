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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api-linkah.onrender.com';

const DEFAULT_FOTO =
  'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

const EMOJIS_STATUS = [
  '✨',
  '🔥',
  '🚀',
  '😴',
  '💡',
  '🎮',
  '🍕',
  '💎'
];

// ============================================================
// HELPERS FOTO
// ============================================================

const getUserPhotoUrl = (user: any) => {
  if (!user) return DEFAULT_FOTO;

  if (typeof user === 'string') {
    if (
      user.length > 5 &&
      user !== 'null' &&
      user !== 'undefined'
    ) {
      return user;
    }

    return DEFAULT_FOTO;
  }

  const campos = [
    'avatar',
    'foto',
    'foto_perfil',
    'usuario_foto',
    'image',
    'profile_photo',
    'url_foto',
    'foto_url'
  ];

  for (const campo of campos) {
    if (
      user[campo] &&
      typeof user[campo] === 'string' &&
      user[campo].length > 5 &&
      user[campo] !== 'null' &&
      user[campo] !== 'undefined'
    ) {
      return user[campo];
    }
  }

  const subObjetos = [
    'data',
    'user',
    'usuario'
  ];

  for (const sub of subObjetos) {
    if (!user[sub]) continue;

    for (const campo of campos) {
      if (
        user[sub][campo] &&
        typeof user[sub][campo] === 'string' &&
        user[sub][campo].length > 5 &&
        user[sub][campo] !== 'null' &&
        user[sub][campo] !== 'undefined'
      ) {
        return user[sub][campo];
      }
    }
  }

  return DEFAULT_FOTO;
};

const getImagemUrl = (
  foto?: string | null
) => {
  if (
    !foto ||
    foto === 'null' ||
    foto === 'undefined' ||
    foto.trim() === ''
  ) {
    return DEFAULT_FOTO;
  }

  if (
    /^(https?:\/\/|blob:|data:)/.test(
      foto
    )
  ) {
    return foto;
  }

  const baseUrl =
    API_URL.replace(/\/$/, '');

  const cleanPath =
    foto.replace(/^\//, '');

  return `${baseUrl}/${cleanPath}`;
};

const normalizarRespostaUsuario = (
  data: any
) => {
  return (
    data?.user ||
    data?.usuario ||
    data?.data ||
    data
  );
};

// ============================================================
// COMPONENTE
// ============================================================

export default function MatchChatPage() {
  const { t }: any =
    useLanguage();

  const { id } =
    useParams() as any;

  const router =
    useRouter();

  const [
    mensagens,
    setMensagens
  ] = useState<any[]>([]);

  const [
    dadosUsuario,
    setDadosUsuario
  ] = useState<any>(null);

  const [
    dadosMatch,
    setDadosMatch
  ] = useState<any>(null);

  const [
    carregando,
    setCarregando
  ] = useState(true);

  const [
    novoTexto,
    setNovoTexto
  ] = useState('');

  const [
    meuStatus,
    setMeuStatus
  ] = useState('✨');

  const [
    showEmojiPicker,
    setShowEmojiPicker
  ] = useState(false);

  const [
    isModalOpen,
    setIsModalOpen
  ] = useState(false);

  const [
    selectedUserId,
    setSelectedUserId
  ] = useState<string | null>(
    null
  );

  const scrollRef =
    useRef<HTMLDivElement>(
      null
    );

  // ============================================================
  // CARREGA PERFIS
  // ============================================================

  useEffect(() => {
    const init = async () => {
      const token =
        localStorage.getItem(
          'token'
        ) ||
        localStorage.getItem(
          '@Linkah:Token'
        );

      const userStr =
        localStorage.getItem(
          '@Linkah:User'
        );

      if (
        !token ||
        !userStr
      ) {
        router.push(
          '/login'
        );

        return;
      }

      try {
        const localUser =
          JSON.parse(
            userStr
          );

        console.log(
          '👤 Usuário local:',
          localUser
        );

        // ======================================================
        // USUÁRIO LOGADO
        // ======================================================

        let usuarioAtualizado =
          localUser;

        if (
          localUser?.id
        ) {
          try {
            const resUsuario =
              await fetch(
                `${API_URL}/api/usuarios/${localUser.id}`,
                {
                  headers: {
                    Authorization:
                      `Bearer ${token}`
                  },

                  cache:
                    'no-store'
                }
              );

            if (
              resUsuario.ok
            ) {
              const responseData =
                await resUsuario.json();

              usuarioAtualizado =
                normalizarRespostaUsuario(
                  responseData
                );

              console.log(
                '✅ Perfil logado atualizado:',
                usuarioAtualizado
              );

              setDadosUsuario(
                usuarioAtualizado
              );

              localStorage.setItem(
                '@Linkah:User',
                JSON.stringify(
                  usuarioAtualizado
                )
              );
            } else {
              console.warn(
                '⚠️ API não atualizou meu perfil:',
                resUsuario.status
              );

              setDadosUsuario(
                localUser
              );
            }
          } catch (
            error
          ) {
            console.error(
              '❌ Erro buscando perfil logado:',
              error
            );

            setDadosUsuario(
              localUser
            );
          }
        } else {
          setDadosUsuario(
            localUser
          );
        }

        // ======================================================
        // MATCH
        // ======================================================

        try {
          const resMatch =
            await fetch(
              `${API_URL}/api/usuarios/${id}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`
                },

                cache:
                  'no-store'
              }
            );

          if (
            resMatch.ok
          ) {
            const responseData =
              await resMatch.json();

            const matchData =
              normalizarRespostaUsuario(
                responseData
              );

            console.log(
              '💘 Perfil match:',
              matchData
            );

            setDadosMatch(
              matchData
            );
          } else {
            console.error(
              '❌ Erro buscando match:',
              resMatch.status
            );
          }
        } catch (
          error
        ) {
          console.error(
            '❌ Erro perfil match:',
            error
          );
        }
      } catch (
        error
      ) {
        console.error(
          '❌ Erro inicializando chat:',
          error
        );
      } finally {
        setCarregando(
          false
        );
      }
    };

    init();
  }, [
    id,
    router
  ]);

  // ============================================================
  // MENSAGENS
  // ============================================================

  useEffect(() => {
    if (
      !id ||
      !dadosUsuario
    ) {
      return;
    }

    const token =
      localStorage.getItem(
        'token'
      ) ||
      localStorage.getItem(
        '@Linkah:Token'
      );

    const syncMensagens =
      async () => {
        try {
          const res =
            await fetch(
              `${API_URL}/api/chat/${id}?t=${Date.now()}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`
                },

                cache:
                  'no-store'
              }
            );

          if (
            res.ok
          ) {
            const msgs =
              await res.json();

            if (
              Array.isArray(
                msgs
              )
            ) {
              setMensagens(
                msgs
              );
            }
          }
        } catch (
          error
        ) {
          console.error(
            'Erro sincronizando mensagens:',
            error
          );
        }
      };

    syncMensagens();

    const interval =
      setInterval(
        syncMensagens,
        3000
      );

    return () =>
      clearInterval(
        interval
      );
  }, [
    id,
    dadosUsuario
  ]);

  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {
    scrollRef.current?.scrollIntoView(
      {
        behavior:
          'smooth'
      }
    );
  }, [
    mensagens
  ]);

  // ============================================================
  // PERFIL MODAL
  // ============================================================

  const handleOpenProfile = (
    userName: string
  ) => {
    setSelectedUserId(
      userName
    );

    setIsModalOpen(
      true
    );
  };

  // ============================================================
  // ENVIAR MENSAGEM
  // ============================================================

  const enviarMensagem =
    async (
      e: any
    ) => {
      e.preventDefault();

      if (
        !novoTexto.trim() ||
        !dadosUsuario
      ) {
        return;
      }

      const token =
        localStorage.getItem(
          'token'
        ) ||
        localStorage.getItem(
          '@Linkah:Token'
        );

      const payload = {
        destinatario_id:
          Number(id),

        texto:
          novoTexto,

        status:
          meuStatus
      };

      setNovoTexto('');

      try {
        const res =
          await fetch(
            `${API_URL}/api/chat/enviar`,
            {
              method:
                'POST',

              headers: {
                'Content-Type':
                  'application/json',

                Authorization:
                  `Bearer ${token}`
              },

              body:
                JSON.stringify(
                  payload
                )
            }
          );

        if (
          res.ok
        ) {
          const novaMsg =
            await res.json();

          setMensagens(
            (prev) => [
              ...prev,

              novaMsg.mensagem ||
                novaMsg
            ]
          );
        }
      } catch (
        error
      ) {
        console.error(
          'Erro enviando mensagem:',
          error
        );
      }
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (
    carregando
  ) {
    return (
      <div
        className="
          h-screen
          flex
          items-center
          justify-center
          bg-white
        "
      >
        <Loader2
          className="
            animate-spin
            text-orange-600
          "
          size={42}
        />
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        flex
        h-screen
        bg-[#fafafe]
        overflow-hidden
        text-slate-900
      "
    >

      {isModalOpen && (
        <UserProfileModal
          {...({
            isOpen:
              isModalOpen,

            onClose:
              () =>
                setIsModalOpen(
                  false
                ),

            userId:
              selectedUserId
          } as any)}
        />
      )}

      {/* ====================================================== */}
      {/* SIDEBAR */}
      {/* ====================================================== */}

      <aside
        className="
          hidden
          lg:flex
          w-80
          shrink-0
          flex-col
          border-r
          border-slate-200
          bg-white
        "
      >

        <div
          className="
            px-6
            py-6
            border-b
            border-slate-100
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-5
            "
          >

            <div>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.24em]
                  font-bold
                  text-orange-500
                  mb-1
                "
              >
                Conexão
              </p>

              <h2
                className="
                  text-lg
                  font-semibold
                  flex
                  items-center
                  gap-2
                "
              >
                <Users
                  size={18}
                  className="
                    text-orange-600
                  "
                />

                Seu Perfil
              </h2>

            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  '/matches'
                )
              }
              className="
                w-10
                h-10
                rounded-full
                border
                border-slate-200
                bg-white
                hover:bg-slate-50
                text-slate-500
                flex
                items-center
                justify-center
              "
            >
              <ChevronLeft
                size={18}
              />
            </button>

          </div>

          {/* PERFIL LOGADO */}

          <div
            className="
              rounded-3xl
              border
              border-slate-200
              bg-slate-50
              p-4
              relative
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
              "
            >

              <div
                className="
                  relative
                  cursor-pointer
                "
                onClick={() =>
                  setShowEmojiPicker(
                    !showEmojiPicker
                  )
                }
              >

                <img
                  src={getImagemUrl(
                    getUserPhotoUrl(
                      dadosUsuario
                    )
                  )}
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    object-cover
                  "
                  alt={
                    dadosUsuario?.apelido ||
                    dadosUsuario?.nome ||
                    'Minha foto'
                  }
                  onError={(
                    e
                  ) => {
                    e.currentTarget.src =
                      DEFAULT_FOTO;
                  }}
                />

                <div
                  className="
                    absolute
                    -bottom-1
                    -right-1
                    w-7
                    h-7
                    rounded-full
                    bg-white
                    border
                    border-slate-200
                    flex
                    items-center
                    justify-center
                    text-sm
                    shadow-sm
                  "
                >
                  {meuStatus}
                </div>

              </div>

              <div
                className="
                  min-w-0
                "
              >

                <p
                  className="
                    font-semibold
                    text-slate-900
                    truncate
                  "
                >
                  {dadosUsuario?.apelido ||
                    dadosUsuario?.nome ||
                    'Usuário'}
                </p>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.16em]
                    text-orange-500
                    font-bold
                    mt-1
                  "
                >
                  Online
                </p>

              </div>

            </div>

            {showEmojiPicker && (
              <div
                className="
                  absolute
                  inset-0
                  rounded-3xl
                  bg-white/95
                  backdrop-blur-sm
                  z-20
                  flex
                  flex-wrap
                  items-center
                  justify-center
                  gap-3
                  p-4
                  border
                  border-slate-200
                "
              >

                {EMOJIS_STATUS.map(
                  (
                    emoji
                  ) => (
                    <button
                      type="button"
                      key={
                        emoji
                      }
                      onClick={() => {
                        setMeuStatus(
                          emoji
                        );

                        setShowEmojiPicker(
                          false
                        );
                      }}
                      className="
                        text-2xl
                        hover:scale-125
                        transition-all
                      "
                    >
                      {emoji}
                    </button>
                  )
                )}

              </div>
            )}

          </div>

        </div>

        <div
          className="
            flex-1
            overflow-y-auto
            px-6
            py-6
            text-sm
          "
        >
          <p
            className="
              text-xs
              text-slate-400
              uppercase
              tracking-wider
              mb-2
              font-semibold
            "
          >
            Dica de Conversa
          </p>

          <p
            className="
              leading-relaxed
              text-slate-500
            "
          >
            Vocês deram match por estarem na mesma região com interesses parecidos. Que tal puxar assunto sobre o que vocês gostam?
          </p>
        </div>

      </aside>

      {/* ====================================================== */}
      {/* CHAT */}
      {/* ====================================================== */}

      <main
        className="
          flex-1
          min-w-0
          flex
          flex-col
          bg-[#fafafe]
        "
      >

        {/* HEADER MATCH */}

        <header
          className="
            border-b
            border-slate-200
            bg-white
          "
        >

          <div
            className="
              px-5
              md:px-8
              py-4
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
              "
            >

              <img
                src={getImagemUrl(
                  getUserPhotoUrl(
                    dadosMatch
                  )
                )}
                className="
                  w-12
                  h-12
                  rounded-2xl
                  object-cover
                  border
                  border-slate-200
                "
                alt={
                  dadosMatch?.apelido ||
                  dadosMatch?.nome ||
                  'Match'
                }
                onError={(
                  e
                ) => {
                  e.currentTarget.src =
                    DEFAULT_FOTO;
                }}
              />

              <div>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.22em]
                    text-orange-500
                    font-bold
                    mb-0.5
                  "
                >
                  Match na Região
                </p>

                <h1
                  className="
                    text-base
                    font-semibold
                    text-slate-900
                  "
                >
                  {dadosMatch?.apelido ||
                    dadosMatch?.nome ||
                    'Conversa'}
                </h1>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  '/matches'
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-slate-600
                hover:bg-slate-50
                text-sm
              "
            >
              <ChevronLeft
                size={16}
              />

              <span>
                Voltar aos Matches
              </span>
            </button>

          </div>

        </header>

        {/* ================================================== */}
        {/* MENSAGENS */}
        {/* ================================================== */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-4
            md:px-8
            py-8
            space-y-6
          "
        >

          {mensagens.length ===
            0 && (
            <div
              className="
                text-center
                py-20
                text-slate-400
              "
            >

              <MessageCircle
                size={40}
                className="
                  mx-auto
                  mb-3
                  opacity-40
                "
              />

              <p>
                Nenhuma mensagem ainda. Diga olá para{' '}
                {dadosMatch?.apelido ||
                  dadosMatch?.nome ||
                  'esta pessoa'}
                !
              </p>

            </div>
          )}

          {mensagens.map(
            (
              m,
              i
            ) => {
              const souEu =
                Number(
                  m.remetente_id
                ) ===
                  Number(
                    dadosUsuario?.id
                  ) ||
                m.usuario_nome ===
                  dadosUsuario?.nome ||
                m.usuario_nome ===
                  dadosUsuario?.apelido;

              return (
                <div
                  key={
                    m.id ||
                    `${m.remetente_id}-${i}`
                  }
                  className={`
                    flex
                    ${
                      souEu
                        ? 'justify-end'
                        : 'justify-start'
                    }
                    gap-3
                    items-end
                  `}
                >

                  {/* FOTO MATCH */}

                  {!souEu && (
                    <div
                      className="
                        relative
                        shrink-0
                      "
                    >
                      <img
                        src={getImagemUrl(
                          getUserPhotoUrl(
                            dadosMatch
                          )
                        )}
                        className="
                          w-9
                          h-9
                          rounded-2xl
                          object-cover
                          border
                          border-slate-200
                        "
                        alt={
                          dadosMatch?.apelido ||
                          dadosMatch?.nome ||
                          'Match'
                        }
                        onError={(
                          e
                        ) => {
                          e.currentTarget.src =
                            DEFAULT_FOTO;
                        }}
                      />
                    </div>
                  )}

                  {/* BALÃO */}

                  <div
                    className={`
                      max-w-[78%]
                      flex
                      flex-col

                      ${
                        souEu
                          ? 'items-end'
                          : 'items-start'
                      }
                    `}
                  >

                    <div
                      className={`
                        px-5
                        py-3.5
                        rounded-3xl
                        border
                        shadow-sm

                        ${
                          souEu
                            ? 'bg-orange-600 text-white border-orange-600 rounded-br-md'
                            : 'bg-white text-slate-700 border-slate-200 rounded-bl-md'
                        }
                      `}
                    >
                      <p
                        className="
                          text-sm
                          leading-relaxed
                          font-medium
                          whitespace-pre-wrap
                          break-words
                        "
                      >
                        {m.texto}
                      </p>
                    </div>

                  </div>

                  {/* MINHA FOTO */}

                  {souEu && (
                    <div
                      className="
                        relative
                        shrink-0
                      "
                    >
                      <img
                        src={getImagemUrl(
                          getUserPhotoUrl(
                            dadosUsuario
                          )
                        )}
                        className="
                          w-9
                          h-9
                          rounded-2xl
                          object-cover
                          border
                          border-slate-200
                        "
                        alt={
                          dadosUsuario?.apelido ||
                          dadosUsuario?.nome ||
                          'Eu'
                        }
                        onError={(
                          e
                        ) => {
                          e.currentTarget.src =
                            DEFAULT_FOTO;
                        }}
                      />
                    </div>
                  )}

                </div>
              );
            }
          )}

          <div
            ref={
              scrollRef
            }
          />

        </div>

        {/* ================================================== */}
        {/* INPUT */}
        {/* ================================================== */}

        <form
          onSubmit={
            enviarMensagem
          }
          className="
            border-t
            border-slate-200
            bg-white
            px-4
            md:px-8
            py-4
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex-1
                rounded-full
                border
                border-slate-200
                bg-slate-50
                px-5
                py-2
                focus-within:border-orange-300
                focus-within:bg-white
              "
            >
              <input
                value={
                  novoTexto
                }
                onChange={(
                  e
                ) =>
                  setNovoTexto(
                    e.target.value
                  )
                }
                placeholder="Escreva sua mensagem..."
                className="
                  w-full
                  bg-transparent
                  outline-none
                  py-2
                  text-sm
                  text-slate-800
                  placeholder:text-slate-400
                  font-medium
                "
              />
            </div>

            <button
              type="submit"
              disabled={
                !novoTexto.trim()
              }
              className="
                w-12
                h-12
                rounded-full
                bg-orange-600
                hover:bg-orange-700
                text-white
                flex
                items-center
                justify-center
                shadow-sm
                transition-all
                active:scale-95
                shrink-0
                disabled:opacity-40
              "
            >
              <Send
                size={18}
              />
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}