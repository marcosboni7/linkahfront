'use client';

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState
} from 'react';

import { useRouter } from 'next/navigation';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api-linkah.onrender.com';

const GEOAPIFY_API_KEY =
  process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '';

const CREME = '#F6F1E9';

// ============================================================
// TIPOS
// ============================================================

type StepBase = {
  key: string;
  section: string;
};

type SingleStep = StepBase & {
  type: 'single';
  question: string;
  options: {
    emoji: string;
    label: string;
  }[];
};

type MultiStep = StepBase & {
  type: 'multi';
  question: string;
  subtitle?: string;
  maxSelect: number;
  options: {
    emoji: string;
    label: string;
  }[];
};

type LocationStep = StepBase & {
  type: 'location';
};

type ScienceStep = StepBase & {
  type: 'science';
  title: string;
  body: string;
};

type WelcomeStep = StepBase & {
  type: 'welcome';
  title: string;
  body: string;
};

type NicknameStep = StepBase & {
  type: 'nickname';
};

type AvatarStep = StepBase & {
  type: 'avatar';
};

type Step =
  | SingleStep
  | MultiStep
  | LocationStep
  | ScienceStep
  | WelcomeStep
  | NicknameStep
  | AvatarStep;

type Answers = Record<
  string,
  string | string[]
>;

// ============================================================
// CIDADES
// ============================================================

type CidadeSugestao = {
  id: string;
  cidade: string;
  estado: string;
  pais: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  label: string;
};

type GeoapifyResult = {
  place_id?: string;
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  country_code?: string;
  formatted?: string;
  lat?: number;
  lon?: number;
  result_type?: string;
};

type GeoapifyResponse = {
  results?: GeoapifyResult[];
};

// ============================================================
// PERGUNTAS
// ============================================================

const steps: Step[] = [
  {
    key: 'cidade',
    section: 'Localização',
    type: 'location'
  },

  {
    key: 'atividades',
    section: 'Interesses',
    type: 'multi',

    question:
      'O que você gosta de fazer no seu tempo livre?',

    subtitle: 'Selecione até 5',

    maxSelect: 5,

    options: [
      {
        emoji: '🎵',
        label: 'Música'
      },

      {
        emoji: '🧳',
        label: 'Viajando'
      },

      {
        emoji: '🍳',
        label: 'Cozinha e Comida'
      },

      {
        emoji: '☕',
        label: 'Chá e Café'
      },

      {
        emoji: '📚',
        label: 'Ler Livros'
      },

      {
        emoji: '🎨',
        label: 'Arte e Design'
      },

      {
        emoji: '🎬',
        label: 'Filmes e Séries'
      },

      {
        emoji: '🏃',
        label: 'Corrida ou Fitness'
      },

      {
        emoji: '🧘',
        label: 'Yoga e Meditação'
      },

      {
        emoji: '🌿',
        label: 'Natureza e Caminhada'
      },

      {
        emoji: '🎮',
        label: 'Jogos'
      },

      {
        emoji: '🗣️',
        label: 'Idiomas e Cultura'
      },

      {
        emoji: '🐾',
        label: 'Amante de Pets'
      },

      {
        emoji: '💡',
        label: 'Tecnologia e Inovação'
      },

      {
        emoji: '📷',
        label: 'Fotografia'
      },

      {
        emoji: '🍸',
        label: 'Mixologia'
      },

      {
        emoji: '🍷',
        label: 'Vinho'
      },

      {
        emoji: '🍺',
        label: 'Cervejas'
      },

      {
        emoji: '🌱',
        label:
          'Psicologia & Autoconhecimento'
      },

      {
        emoji: '🤝',
        label: 'Fazer Negócios'
      }
    ]
  },

  {
    key: 'generoFilme',
    section: 'Interesses',
    type: 'single',

    question:
      'Se a sua vida fosse um gênero de filme, seria',

    options: [
      {
        emoji: '🎭',
        label: 'Comédia'
      },

      {
        emoji: '🎭',
        label: 'Drama'
      },

      {
        emoji: '🗺️',
        label: 'Aventura'
      },

      {
        emoji: '❤️',
        label: 'Romântico'
      }
    ]
  },

  {
    key: 'setor',
    section: 'Trabalho',
    type: 'single',

    question:
      'Se você está trabalhando, em que setor você trabalha?',

    options: [
      {
        emoji: '🙅',
        label: 'Não estou trabalhando'
      },

      {
        emoji: '⚕️',
        label: 'Área da Saúde'
      },

      {
        emoji: '💻',
        label: 'Tecnologia'
      },

      {
        emoji: '💰',
        label: 'Serviços financeiros'
      },

      {
        emoji: '🔧',
        label: 'Trabalho manual/operacional'
      },

      {
        emoji: '🚀',
        label: 'Empreendedor/Empresário'
      },

      {
        emoji: '🎟️',
        label: 'Produtor de Eventos'
      },

      {
        emoji: '🛍️',
        label: 'Varejo'
      },

      {
        emoji: '🥕',
        label: 'Comida'
      },

      {
        emoji: '🧑‍💼',
        label: 'Serviços'
      }
    ]
  },

  {
    key: 'info_ciencia',
    section: 'O que a ciência diz',
    type: 'science',

    title:
      'A ciência diz: a conexão nos faz mais felizes',

    body:
      'Pessoas que reúnem mais momentos significativos a cada semana tendem a se sentir mais felizes.\nBaseado em dados de eventos e comunidades reais.'
  },

  {
    key: 'qualidadesDivertidos',
    section: 'Personalidade',
    type: 'multi',

    question:
      'E quais qualidades dos seus amigos divertidos em você?',

    subtitle: 'Selecione até 3',

    maxSelect: 3,

    options: [
      {
        emoji: '👀',
        label: 'Atencioso'
      },

      {
        emoji: '✨',
        label: 'Autêntico'
      },

      {
        emoji: '🤩',
        label: 'Carismático'
      },

      {
        emoji: '⚡',
        label: 'Convincente'
      },

      {
        emoji: '🌿',
        label: 'Pé-no-chão'
      },

      {
        emoji: '😂',
        label: 'Engraçado'
      },

      {
        emoji: '🧠',
        label: 'Inteligente'
      },

      {
        emoji: '😎',
        label: 'Estiloso'
      },

      {
        emoji: '🔥',
        label: 'Quente'
      },

      {
        emoji: '🌈',
        label: 'Otimista'
      }
    ]
  },

  {
    key: 'qualidadesValorizadas',
    section: 'Personalidade',
    type: 'multi',

    question:
      'Quais qualidades você mais valoriza em um amigo?',

    subtitle: 'Selecione até 3',

    maxSelect: 3,

    options: [
      {
        emoji: '✨',
        label: 'Autêntico'
      },

      {
        emoji: '👀',
        label: 'Atencioso'
      },

      {
        emoji: '🤩',
        label: 'Carismático'
      },

      {
        emoji: '🌿',
        label: 'Pé-no-chão'
      },

      {
        emoji: '⚡',
        label: 'Convincente'
      },

      {
        emoji: '😂',
        label: 'Engraçado'
      },

      {
        emoji: '🧠',
        label: 'Inteligente'
      },

      {
        emoji: '🔥',
        label: 'Quente'
      },

      {
        emoji: '😎',
        label: 'Estiloso'
      },

      {
        emoji: '🌈',
        label: 'Otimista'
      }
    ]
  },

  {
    key: 'logicaEmocao',
    section: 'Personalidade',
    type: 'single',

    question:
      'Suas decisões geralmente são guiadas por',

    options: [
      {
        emoji: '🔍',
        label: 'Lógica'
      },

      {
        emoji: '💗',
        label:
          'Emoções e sentimentos'
      },

      {
        emoji: '🍃',
        label:
          'Uma mistura, dependendo do humor'
      }
    ]
  },

  {
    key: 'introvertidoExtrovertido',
    section: 'Personalidade',
    type: 'single',

    question:
      'Você é mais',

    options: [
      {
        emoji: '📚',
        label:
          'Introvertido - recarregar sentado sozinho'
      },

      {
        emoji: '🌗',
        label:
          'Ambivertido - um pouco de ambos'
      },

      {
        emoji: '⚡',
        label:
          'Extrovertido - energizado por pessoas'
      }
    ]
  },

  {
    key: 'info_boasvindas',
    section: 'Bem-vindo',
    type: 'welcome',

    title:
      'Bem-vindo à comunidade! ✨',

    body:
      'Linkah cria espaço para uma conexão real, momentos presenciais seguros que transformam desconhecidos em amigos.'
  },

  {
    key: 'tipoGrupo',
    section: 'Social',
    type: 'single',

    question:
      'Qual é o seu tipo de grupo ideal?',

    options: [
      {
        emoji: '🤏',
        label: 'Pequeno e seguro'
      },

      {
        emoji: '💡',
        label:
          'Inteligente e inspirador'
      },

      {
        emoji: '🎉',
        label:
          'Divertido e inesperado'
      },

      {
        emoji: '🌈',
        label:
          'Não tem muita importância, pois as pessoas fazem o momento'
      }
    ]
  },

  {
    key: 'temFilhos',
    section: 'Crianças',
    type: 'single',

    question:
      'Você tem filhos?',

    options: [
      {
        emoji: '👶',
        label: 'Sim'
      },

      {
        emoji: '🙅',
        label: 'Não'
      },

      {
        emoji: '🤐',
        label:
          'Eu prefiro não dizer'
      }
    ]
  },

  {
    key: 'statusRelacionamento',
    section: 'Relacionamento',
    type: 'single',

    question:
      'Qual é o seu status de relacionamento?',

    options: [
      {
        emoji: '🙋',
        label: 'Solteiro(a)'
      },

      {
        emoji: '💍',
        label: 'Casado(a)'
      },

      {
        emoji: '💞',
        label:
          'Em um relacionamento'
      },

      {
        emoji: '🤐',
        label:
          'Eu prefiro não dizer'
      }
    ]
  },

  {
    key: 'noiteIdeal',
    section: 'Noite ideal',
    type: 'single',

    question:
      'O que melhor descreve uma noite ideal?',

    options: [
      {
        emoji: '🍷',
        label:
          'Tendo conversas profundas enquanto toma vinho'
      },

      {
        emoji: '🎲',
        label: 'Rindo e jogando'
      },

      {
        emoji: '🎨',
        label:
          'Explorando novos espaços criativos'
      },

      {
        emoji: '🌳',
        label:
          'Desfrutando da natureza'
      }
    ]
  },

  {
    key: 'sentirAposJantar',
    section: 'Personalidade',
    type: 'multi',

    question:
      'Depois do jantar quero me sentir...',

    subtitle: 'Selecione até 3',

    maxSelect: 3,

    options: [
      {
        emoji: '😊',
        label: 'Energizado'
      },

      {
        emoji: '💗',
        label:
          'Visto e conectado'
      },

      {
        emoji: '😌',
        label:
          'Calmo e pé-no-chão'
      },

      {
        emoji: '🎉',
        label:
          'Surpreso e revigorado'
      }
    ]
  },

  // ==========================================================
  // NOVO — APELIDO
  // ==========================================================

  {
    key: 'apelido',
    section: 'Seu perfil',
    type: 'nickname'
  },

  // ==========================================================
  // NOVO — FOTO
  // ==========================================================

  {
    key: 'avatar',
    section: 'Seu perfil',
    type: 'avatar'
  }
];

// ============================================================
// COMPONENTE
// ============================================================

export default function OnboardingPage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    stepIndex,
    setStepIndex
  ] = useState(0);

  const [
    answers,
    setAnswers
  ] = useState<Answers>({});

  // ==========================================================
  // CIDADE
  // ==========================================================

  const [
    cidadeInput,
    setCidadeInput
  ] = useState('');

  const [
    cidadeSelecionada,
    setCidadeSelecionada
  ] =
    useState<CidadeSugestao | null>(
      null
    );

  const [
    sugestoesCidade,
    setSugestoesCidade
  ] =
    useState<CidadeSugestao[]>([]);

  const [
    buscandoCidade,
    setBuscandoCidade
  ] = useState(false);

  const [
    erroCidade,
    setErroCidade
  ] = useState('');

  const [
    editandoCidade,
    setEditandoCidade
  ] = useState(true);

  // ==========================================================
  // PERFIL
  // ==========================================================

  const [
    apelido,
    setApelido
  ] = useState('');

  const [
    avatarFile,
    setAvatarFile
  ] =
    useState<File | null>(null);

  const [
    avatarPreview,
    setAvatarPreview
  ] = useState('');

  const [
    erroAvatar,
    setErroAvatar
  ] = useState('');

  // ==========================================================
  // GERAL
  // ==========================================================

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

  const step =
    steps[stepIndex];

  const isLast =
    stepIndex ===
    steps.length - 1;

  // ==========================================================
  // AUTH
  // ==========================================================

  useEffect(() => {
    const token =
      localStorage.getItem(
        '@Linkah:Token'
      ) ||
      localStorage.getItem(
        'token'
      );

    if (!token) {
      router.replace(
        '/onboarding/auth'
      );
    }
  }, [router]);

  // ==========================================================
  // CIDADE API
  // ==========================================================

  useEffect(() => {
    const texto =
      cidadeInput.trim();

    if (
      cidadeSelecionada &&
      texto ===
        cidadeSelecionada.label
    ) {
      setSugestoesCidade([]);
      return;
    }

    if (
      texto.length < 2
    ) {
      setSugestoesCidade([]);
      setBuscandoCidade(false);
      setErroCidade('');

      return;
    }

    if (
      !GEOAPIFY_API_KEY
    ) {
      setErroCidade(
        'Chave da API de cidades não configurada.'
      );

      return;
    }

    const controller =
      new AbortController();

    const timer =
      setTimeout(
        async () => {
          try {
            setBuscandoCidade(
              true
            );

            setErroCidade('');

            const params =
              new URLSearchParams(
                {
                  text: texto,
                  type: 'city',
                  format: 'json',
                  limit: '8',
                  lang: 'pt',
                  apiKey:
                    GEOAPIFY_API_KEY
                }
              );

            const response =
              await fetch(
                `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`,
                {
                  signal:
                    controller.signal
                }
              );

            if (
              !response.ok
            ) {
              throw new Error(
                `Erro Geoapify: ${response.status}`
              );
            }

            const data =
              (await response.json()) as GeoapifyResponse;

            const resultados =
              data.results || [];

            const cidades =
              resultados
                .map(
                  (
                    item,
                    index
                  ) => {
                    const cidade =
                      item.city ||
                      item.name ||
                      '';

                    const estado =
                      item.state ||
                      '';

                    const pais =
                      item.country ||
                      '';

                    const label =
                      [
                        cidade,
                        estado,
                        pais
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          ', '
                        );

                    return {
                      id:
                        item.place_id ||
                        `${cidade}-${estado}-${pais}-${index}`,

                      cidade,
                      estado,
                      pais,

                      countryCode:
                        item.country_code ||
                        '',

                      latitude:
                        Number(
                          item.lat
                        ) || 0,

                      longitude:
                        Number(
                          item.lon
                        ) || 0,

                      label
                    };
                  }
                )
                .filter(
                  (cidade) =>
                    cidade.cidade &&
                    cidade.pais
                );

            const unicas =
              cidades.filter(
                (
                  cidade,
                  index,
                  lista
                ) =>
                  index ===
                  lista.findIndex(
                    (item) =>
                      item.label ===
                      cidade.label
                  )
              );

            setSugestoesCidade(
              unicas
            );
          } catch (err) {
            if (
              err instanceof
                Error &&
              err.name ===
                'AbortError'
            ) {
              return;
            }

            console.error(
              'Erro cidades:',
              err
            );

            setErroCidade(
              'Não foi possível buscar cidades.'
            );
          } finally {
            setBuscandoCidade(
              false
            );
          }
        },
        400
      );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    cidadeInput,
    cidadeSelecionada
  ]);

  // ==========================================================
  // NAVEGAÇÃO
  // ==========================================================

  function goNext() {
    if (isLast) {
      handleSubmit();
      return;
    }

    setStepIndex(
      (index) =>
        index + 1
    );
  }

  function goBack() {
    if (
      stepIndex === 0 ||
      loading
    ) {
      return;
    }

    setStepIndex(
      (index) =>
        index - 1
    );
  }

  // ==========================================================
  // SINGLE
  // ==========================================================

  function selectSingle(
    label: string
  ) {
    setAnswers(
      (prev) => ({
        ...prev,
        [step.key]: label
      })
    );

    setTimeout(
      () => goNext(),
      150
    );
  }

  // ==========================================================
  // MULTI
  // ==========================================================

  function toggleMulti(
    label: string,
    maxSelect: number
  ) {
    setAnswers(
      (prev) => {
        const atual =
          (prev[
            step.key
          ] as string[]) ||
          [];

        if (
          atual.includes(
            label
          )
        ) {
          return {
            ...prev,

            [step.key]:
              atual.filter(
                (item) =>
                  item !==
                  label
              )
          };
        }

        if (
          atual.length >=
          maxSelect
        ) {
          return prev;
        }

        return {
          ...prev,

          [step.key]: [
            ...atual,
            label
          ]
        };
      }
    );
  }

  // ==========================================================
  // CIDADE
  // ==========================================================

  function selecionarCidade(
    cidade: CidadeSugestao
  ) {
    setCidadeSelecionada(
      cidade
    );

    setCidadeInput(
      cidade.label
    );

    setSugestoesCidade([]);

    setAnswers(
      (prev) => ({
        ...prev,
        cidade:
          cidade.label
      })
    );

    setEditandoCidade(
      false
    );
  }

  function editarCidade() {
    setCidadeSelecionada(
      null
    );

    setCidadeInput('');

    setSugestoesCidade([]);

    setAnswers(
      (prev) => ({
        ...prev,
        cidade: ''
      })
    );

    setEditandoCidade(
      true
    );
  }

  // ==========================================================
  // APELIDO
  // ==========================================================

  function confirmarApelido() {
    const valor =
      apelido.trim();

    if (
      valor.length < 2
    ) {
      return;
    }

    setAnswers(
      (prev) => ({
        ...prev,
        apelido: valor
      })
    );

    goNext();
  }

  // ==========================================================
  // FOTO
  // ==========================================================

  function selecionarAvatar(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setErroAvatar('');

    if (
      !file.type.startsWith(
        'image/'
      )
    ) {
      setErroAvatar(
        'Selecione uma imagem válida.'
      );

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setErroAvatar(
        'A imagem pode ter no máximo 10MB.'
      );

      return;
    }

    setAvatarFile(file);

    const preview =
      URL.createObjectURL(
        file
      );

    setAvatarPreview(
      preview
    );
  }

  function removerAvatar() {
    if (
      avatarPreview
    ) {
      URL.revokeObjectURL(
        avatarPreview
      );
    }

    setAvatarFile(null);
    setAvatarPreview('');

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        '';
    }
  }

  // ==========================================================
  // SALVAR ONBOARDING
  // ==========================================================

  async function handleSubmit() {
    if (!avatarFile) {
      setErroAvatar(
        'Adicione uma foto de perfil.'
      );

      return;
    }

    if (
      !apelido.trim()
    ) {
      setError(
        'Apelido não informado.'
      );

      return;
    }

    setLoading(true);
    setError('');

    const token =
      localStorage.getItem(
        '@Linkah:Token'
      ) ||
      localStorage.getItem(
        'token'
      );

    if (!token) {
      router.replace(
        '/onboarding/auth'
      );

      return;
    }

    try {
      // ======================================================
      // FORM DATA
      // ======================================================

      const formData =
        new FormData();

      formData.append(
        'cidade',
        (answers[
          'cidade'
        ] as string) ||
          ''
      );

      formData.append(
        'setor',
        (answers[
          'setor'
        ] as string) ||
          ''
      );

      formData.append(
        'generoFilme',
        (answers[
          'generoFilme'
        ] as string) ||
          ''
      );

      formData.append(
        'personalidade',
        [
          answers[
            'logicaEmocao'
          ],

          answers[
            'introvertidoExtrovertido'
          ]
        ]
          .filter(Boolean)
          .join(' / ')
      );

      formData.append(
        'apelido',
        apelido.trim()
      );

      // Nome do campo:
      // avatar
      formData.append(
        'avatar',
        avatarFile
      );

      const qualidades = {
        atividades:
          answers[
            'atividades'
          ] || [],

        qualidadesDivertidos:
          answers[
            'qualidadesDivertidos'
          ] || [],

        qualidadesValorizadas:
          answers[
            'qualidadesValorizadas'
          ] || [],

        logicaEmocao:
          answers[
            'logicaEmocao'
          ] || '',

        introvertidoExtrovertido:
          answers[
            'introvertidoExtrovertido'
          ] || '',

        tipoGrupo:
          answers[
            'tipoGrupo'
          ] || '',

        temFilhos:
          answers[
            'temFilhos'
          ] || '',

        statusRelacionamento:
          answers[
            'statusRelacionamento'
          ] || '',

        noiteIdeal:
          answers[
            'noiteIdeal'
          ] || '',

        sentirAposJantar:
          answers[
            'sentirAposJantar'
          ] || []
      };

      formData.append(
        'qualidades',
        JSON.stringify(
          qualidades
        )
      );

      // ======================================================
      // REQUEST
      // ======================================================

      const response =
        await fetch(
          `${API_URL}/api/onboarding`,
          {
            method: 'POST',

            headers: {
              Authorization:
                `Bearer ${token}`
            },

            body:
              formData
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.message ||
          data.error ||
          'Erro ao salvar onboarding.'
        );
      }

      // ======================================================
      // ATUALIZA LOCAL USER
      // ======================================================

      const localUser =
        JSON.parse(
          localStorage.getItem(
            '@Linkah:User'
          ) || '{}'
        );

      localUser.hasOnboarding =
        true;

      localUser.apelido =
        apelido.trim();

      if (
        data.avatar
      ) {
        localUser.avatar =
          data.avatar;
      }

      if (
        data.user?.avatar
      ) {
        localUser.avatar =
          data.user.avatar;
      }

      localStorage.setItem(
        '@Linkah:User',
        JSON.stringify(
          localUser
        )
      );

      router.replace(
        '/matches'
      );
    } catch (err) {
      console.error(
        'Erro onboarding:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao salvar onboarding.'
      );

      setLoading(false);
    }
  }

  // ==========================================================
  // AUXILIARES
  // ==========================================================

  const canAdvanceMulti =
    step.type ===
      'multi' &&
    (
      (answers[
        step.key
      ] as string[]) || []
    ).length > 0;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      style={{
        background:
          CREME
      }}
      className="
        min-h-screen
        flex
        flex-col
        font-sans
      "
    >

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div
        className="
          flex
          items-center
          px-5
          py-4
          relative
        "
      >

        <button
          type="button"
          onClick={goBack}
          disabled={
            stepIndex ===
              0 ||
            loading
          }
          className="
            text-zinc-900
            disabled:opacity-0
          "
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <span
          className="
            absolute
            left-1/2
            -translate-x-1/2
            font-bold
            text-[13px]
            uppercase
            tracking-[0.14em]
            text-orange-600
          "
        >
          {step.section}
        </span>

      </div>

      {/* ==================================================== */}
      {/* CONTEÚDO */}
      {/* ==================================================== */}

      <div
        className="
          flex-1
          flex
          flex-col
          px-5
          pb-8
          max-w-md
          w-full
          mx-auto
        "
      >

        {/* ================================================== */}
        {/* CIDADE */}
        {/* ================================================== */}

        {step.type ===
          'location' && (
          <div
            className="
              flex
              flex-col
              flex-1
            "
          >

            {editandoCidade ? (
              <div
                className="
                  flex-1
                  flex
                  flex-col
                  justify-center
                "
              >

                <h1
                  className="
                    text-2xl
                    font-extrabold
                    text-zinc-900
                    mb-2
                  "
                >
                  Em qual cidade você quer se conectar?
                </h1>

                <p
                  className="
                    text-sm
                    text-zinc-500
                    mb-6
                  "
                >
                  Digite o nome e escolha sua cidade.
                </p>

                <div
                  className="
                    relative
                  "
                >

                  <input
                    autoFocus
                    value={
                      cidadeInput
                    }
                    onChange={(
                      e
                    ) => {
                      setCidadeInput(
                        e.target.value
                      );

                      setCidadeSelecionada(
                        null
                      );
                    }}
                    placeholder="Ex: São Paulo, Lisboa..."
                    autoComplete="off"
                    className="
                      w-full
                      bg-white
                      border
                      border-zinc-200
                      rounded-full
                      px-6
                      py-4
                      outline-none
                      focus:border-orange-400
                    "
                  />

                  {buscandoCidade && (
                    <div
                      className="
                        absolute
                        right-5
                        top-1/2
                        -translate-y-1/2
                      "
                    >
                      <div
                        className="
                          h-5
                          w-5
                          border-2
                          border-zinc-200
                          border-t-orange-500
                          rounded-full
                          animate-spin
                        "
                      />
                    </div>
                  )}

                  {sugestoesCidade.length >
                    0 && (
                    <div
                      className="
                        absolute
                        top-full
                        left-0
                        right-0
                        mt-2
                        bg-white
                        border
                        border-zinc-200
                        rounded-3xl
                        shadow-xl
                        overflow-hidden
                        z-50
                      "
                    >

                      {sugestoesCidade.map(
                        (
                          cidade
                        ) => (
                          <button
                            type="button"
                            key={
                              cidade.id
                            }
                            onClick={() =>
                              selecionarCidade(
                                cidade
                              )
                            }
                            className="
                              w-full
                              flex
                              items-center
                              gap-3
                              px-5
                              py-4
                              text-left
                              border-b
                              border-zinc-100
                              hover:bg-orange-50
                            "
                          >

                            <div
                              className="
                                w-10
                                h-10
                                rounded-full
                                bg-orange-50
                                flex
                                items-center
                                justify-center
                              "
                            >
                              📍
                            </div>

                            <div>
                              <p
                                className="
                                  text-sm
                                  font-bold
                                  text-zinc-900
                                "
                              >
                                {
                                  cidade.cidade
                                }
                              </p>

                              <p
                                className="
                                  text-xs
                                  text-zinc-500
                                "
                              >
                                {[
                                  cidade.estado,
                                  cidade.pais
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    ', '
                                  )}
                              </p>
                            </div>

                          </button>
                        )
                      )}

                    </div>
                  )}

                </div>

                {erroCidade && (
                  <p
                    className="
                      text-red-600
                      text-sm
                      mt-3
                    "
                  >
                    {erroCidade}
                  </p>
                )}

              </div>
            ) : (
              <div
                className="
                  flex-1
                  flex
                  flex-col
                "
              >

                <div
                  className="
                    rounded-[2rem]
                    overflow-hidden
                    mb-8
                  "
                >
                  <img
                    src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1000&auto=format&fit=crop"
                    className="
                      w-full
                      h-64
                      object-cover
                    "
                    alt=""
                  />
                </div>

                <h1
                  className="
                    text-3xl
                    font-extrabold
                    text-zinc-900
                    mb-3
                  "
                >
                  Comece a se conectar em{' '}
                  <span
                    className="
                      text-orange-600
                    "
                  >
                    {
                      cidadeSelecionada?.cidade
                    }
                  </span>
                </h1>

                <p
                  className="
                    text-zinc-500
                    mb-8
                  "
                >
                  {[
                    cidadeSelecionada?.estado,
                    cidadeSelecionada?.pais
                  ]
                    .filter(
                      Boolean
                    )
                    .join(', ')}
                </p>

                <div
                  className="
                    mt-auto
                    space-y-3
                  "
                >

                  <button
                    type="button"
                    onClick={
                      goNext
                    }
                    className="
                      w-full
                      bg-zinc-900
                      text-white
                      py-4
                      rounded-full
                      font-bold
                    "
                  >
                    Continuar
                  </button>

                  <button
                    type="button"
                    onClick={
                      editarCidade
                    }
                    className="
                      w-full
                      bg-white
                      border
                      border-zinc-200
                      py-4
                      rounded-full
                      font-bold
                    "
                  >
                    Mudar minha cidade
                  </button>

                </div>

              </div>
            )}

          </div>
        )}

        {/* ================================================== */}
        {/* SCIENCE */}
        {/* ================================================== */}

        {step.type ===
          'science' && (
          <div
            className="
              flex-1
              flex
              flex-col
              justify-center
            "
          >

            <h1
              className="
                text-2xl
                font-extrabold
                mb-6
              "
            >
              {step.title}
            </h1>

            <div
              className="
                bg-white
                rounded-3xl
                p-6
                mb-6
              "
            >

              <div
                className="
                  h-32
                  flex
                  items-end
                  gap-2
                "
              >
                {[
                  20,
                  30,
                  38,
                  48,
                  60,
                  69,
                  78,
                  89
                ].map(
                  (
                    height,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      style={{
                        height:
                          `${height}%`
                      }}
                      className="
                        flex-1
                        bg-orange-400
                        rounded-t-lg
                      "
                    />
                  )
                )}
              </div>

            </div>

            {step.body
              .split('\n')
              .map(
                (
                  line,
                  index
                ) => (
                  <p
                    key={
                      index
                    }
                    className="
                      text-zinc-500
                      text-sm
                      mb-2
                    "
                  >
                    {line}
                  </p>
                )
              )}

            <button
              type="button"
              onClick={
                goNext
              }
              className="
                w-full
                bg-zinc-900
                text-white
                py-4
                rounded-full
                font-bold
                mt-6
              "
            >
              Continuar
            </button>

          </div>
        )}

        {/* ================================================== */}
        {/* WELCOME */}
        {/* ================================================== */}

        {step.type ===
          'welcome' && (
          <div
            className="
              flex-1
              flex
              flex-col
              justify-center
              text-center
            "
          >

            <div
              className="
                text-6xl
                mb-8
              "
            >
              ✨
            </div>

            <h1
              className="
                text-3xl
                font-extrabold
                mb-4
              "
            >
              {step.title}
            </h1>

            <p
              className="
                text-zinc-500
                leading-relaxed
              "
            >
              {step.body}
            </p>

            <button
              type="button"
              onClick={
                goNext
              }
              className="
                mt-10
                w-full
                bg-zinc-900
                text-white
                py-4
                rounded-full
                font-bold
              "
            >
              Continuar
            </button>

          </div>
        )}

        {/* ================================================== */}
        {/* SINGLE */}
        {/* ================================================== */}

        {step.type ===
          'single' && (
          <div
            className="
              flex-1
              flex
              flex-col
              justify-center
            "
          >

            <h1
              className="
                text-2xl
                font-extrabold
                mb-8
              "
            >
              {step.question}
            </h1>

            <div
              className="
                space-y-3
              "
            >

              {step.options.map(
                (
                  option
                ) => {
                  const selected =
                    answers[
                      step.key
                    ] ===
                    option.label;

                  return (
                    <button
                      key={
                        option.label
                      }
                      type="button"
                      onClick={() =>
                        selectSingle(
                          option.label
                        )
                      }
                      className={`
                        w-full
                        flex
                        items-center
                        gap-3
                        text-left
                        px-6
                        py-4
                        rounded-full
                        border
                        font-bold

                        ${
                          selected
                            ? 'bg-zinc-900 border-zinc-900 text-white'
                            : 'bg-white border-zinc-200 text-zinc-900'
                        }
                      `}
                    >
                      <span>
                        {
                          option.emoji
                        }
                      </span>

                      {
                        option.label
                      }
                    </button>
                  );
                }
              )}

            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* MULTI */}
        {/* ================================================== */}

        {step.type ===
          'multi' && (
          <div
            className="
              flex-1
              flex
              flex-col
              justify-center
            "
          >

            <h1
              className="
                text-2xl
                font-extrabold
                mb-2
              "
            >
              {step.question}
            </h1>

            <p
              className="
                text-zinc-400
                text-sm
                mb-6
              "
            >
              {step.subtitle}
            </p>

            <div
              className="
                flex
                flex-wrap
                gap-2
                mb-8
              "
            >

              {step.options.map(
                (
                  option
                ) => {
                  const atual =
                    (answers[
                      step.key
                    ] as string[]) ||
                    [];

                  const selected =
                    atual.includes(
                      option.label
                    );

                  const disabled =
                    !selected &&
                    atual.length >=
                      step.maxSelect;

                  return (
                    <button
                      key={
                        option.label
                      }
                      type="button"
                      disabled={
                        disabled
                      }
                      onClick={() =>
                        toggleMulti(
                          option.label,
                          step.maxSelect
                        )
                      }
                      className={`
                        px-4
                        py-3
                        rounded-full
                        border
                        text-sm
                        font-bold

                        ${
                          selected
                            ? 'bg-zinc-900 border-zinc-900 text-white'
                            : 'bg-white border-zinc-200'
                        }

                        ${
                          disabled
                            ? 'opacity-30'
                            : ''
                        }
                      `}
                    >
                      {
                        option.emoji
                      }{' '}
                      {
                        option.label
                      }
                    </button>
                  );
                }
              )}

            </div>

            <button
              type="button"
              disabled={
                !canAdvanceMulti
              }
              onClick={
                goNext
              }
              className="
                w-full
                bg-zinc-900
                text-white
                py-4
                rounded-full
                font-bold
                disabled:opacity-30
              "
            >
              Continuar
            </button>

          </div>
        )}

        {/* ================================================== */}
        {/* NOVO — APELIDO */}
        {/* ================================================== */}

        {step.type ===
          'nickname' && (
          <div
            className="
              flex-1
              flex
              flex-col
              justify-center
            "
          >

            <div
              className="
                w-16
                h-16
                rounded-full
                bg-orange-100
                flex
                items-center
                justify-center
                text-3xl
                mb-8
              "
            >
              👋
            </div>

            <h1
              className="
                text-3xl
                font-extrabold
                text-zinc-900
                mb-3
              "
            >
              Como você quer ser chamado?
            </h1>

            <p
              className="
                text-zinc-500
                text-sm
                leading-relaxed
                mb-8
              "
            >
              Esse será o nome que outras pessoas verão no Linkah.
            </p>

            <input
              autoFocus
              type="text"
              value={
                apelido
              }
              maxLength={30}
              onChange={(
                e
              ) =>
                setApelido(
                  e.target.value
                )
              }
              placeholder="Ex: Marcos, Marquinhos..."
              className="
                w-full
                bg-white
                border
                border-zinc-200
                rounded-full
                px-6
                py-4
                text-zinc-900
                outline-none
                focus:border-orange-400
              "
            />

            <div
              className="
                flex
                justify-end
                mt-2
                px-3
              "
            >
              <span
                className="
                  text-xs
                  text-zinc-400
                "
              >
                {
                  apelido.length
                }
                /30
              </span>
            </div>

            <button
              type="button"
              onClick={
                confirmarApelido
              }
              disabled={
                apelido.trim()
                  .length < 2
              }
              className="
                w-full
                bg-zinc-900
                text-white
                py-4
                rounded-full
                font-bold
                mt-6
                disabled:opacity-30
              "
            >
              Continuar
            </button>

          </div>
        )}

        {/* ================================================== */}
        {/* NOVO — FOTO */}
        {/* ================================================== */}

        {step.type ===
          'avatar' && (
          <div
            className="
              flex-1
              flex
              flex-col
              justify-center
              items-center
              text-center
            "
          >

            <h1
              className="
                text-3xl
                font-extrabold
                text-zinc-900
                mb-3
              "
            >
              Adicione uma foto sua
            </h1>

            <p
              className="
                text-zinc-500
                text-sm
                leading-relaxed
                mb-10
                max-w-xs
              "
            >
              Uma foto ajuda as pessoas a reconhecerem você e deixa seu perfil mais completo.
            </p>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                selecionarAvatar
              }
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                relative
                w-44
                h-44
                rounded-full
                border-4
                border-white
                shadow-xl
                bg-zinc-100
                overflow-hidden
                flex
                items-center
                justify-center
              "
            >

              {avatarPreview ? (
                <img
                  src={
                    avatarPreview
                  }
                  alt="Foto selecionada"
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    gap-2
                    text-zinc-400
                  "
                >
                  <span
                    className="
                      text-4xl
                    "
                  >
                    📷
                  </span>

                  <span
                    className="
                      text-xs
                      font-bold
                    "
                  >
                    Adicionar foto
                  </span>
                </div>
              )}

              <div
                className="
                  absolute
                  bottom-2
                  right-2
                  w-10
                  h-10
                  rounded-full
                  bg-orange-500
                  text-white
                  flex
                  items-center
                  justify-center
                  shadow
                "
              >
                +
              </div>

            </button>

            {avatarFile && (
              <div
                className="
                  mt-5
                "
              >

                <p
                  className="
                    text-sm
                    font-bold
                    text-zinc-800
                  "
                >
                  {
                    avatarFile.name
                  }
                </p>

                <button
                  type="button"
                  onClick={
                    removerAvatar
                  }
                  className="
                    text-red-500
                    text-xs
                    font-bold
                    mt-2
                  "
                >
                  Remover foto
                </button>

              </div>
            )}

            {erroAvatar && (
              <div
                className="
                  mt-5
                  bg-red-50
                  border
                  border-red-100
                  text-red-600
                  text-sm
                  font-semibold
                  px-4
                  py-3
                  rounded-2xl
                "
              >
                {erroAvatar}
              </div>
            )}

            <div
              className="
                w-full
                mt-10
              "
            >

              <button
                type="button"
                disabled={
                  !avatarFile ||
                  loading
                }
                onClick={
                  handleSubmit
                }
                className="
                  w-full
                  bg-zinc-900
                  text-white
                  py-4
                  rounded-full
                  font-bold
                  disabled:opacity-30
                "
              >
                {loading
                  ? 'Criando seu perfil...'
                  : 'Finalizar'}
              </button>

            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* ERRO GERAL */}
        {/* ================================================== */}

        {error && (
          <div
            className="
              mt-6
              bg-red-50
              border
              border-red-100
              text-red-600
              p-4
              rounded-2xl
              text-sm
              font-semibold
            "
          >
            {error}
          </div>
        )}

      </div>

    </div>
  );
}
