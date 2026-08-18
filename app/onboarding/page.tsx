'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';
const CREME = '#F6F1E9';

// ============================================================
// TIPOS
// ============================================================
type StepBase = { key: string; section: string };

type SingleStep = StepBase & {
  type: 'single';
  question: string;
  options: { emoji: string; label: string }[];
};
type MultiStep = StepBase & {
  type: 'multi';
  question: string;
  subtitle?: string;
  maxSelect: number;
  options: { emoji: string; label: string }[];
};
type LocationStep = StepBase & { type: 'location' };
type ScienceStep = StepBase & { type: 'science'; title: string; body: string };
type WelcomeStep = StepBase & { type: 'welcome'; title: string; body: string };

type Step = SingleStep | MultiStep | LocationStep | ScienceStep | WelcomeStep;

// ============================================================
// PERGUNTAS
// ============================================================
const steps: Step[] = [
  { key: 'cidade', section: 'Localização', type: 'location' },
  {
    key: 'atividades',
    section: 'Interesses',
    type: 'multi',
    question: 'O que você gosta de fazer no seu tempo livre?',
    subtitle: 'Selecione até 5',
    maxSelect: 5,
    options: [
      { emoji: '🎵', label: 'Música' }, { emoji: '🧳', label: 'Viajando' },
      { emoji: '🍳', label: 'Cozinha e Comida' }, { emoji: '☕', label: 'Chá e Café' },
      { emoji: '📚', label: 'Ler Livros' }, { emoji: '🎨', label: 'Arte e Design' },
      { emoji: '🎬', label: 'Filmes e Séries' }, { emoji: '🏃', label: 'Corrida ou Fitness' },
      { emoji: '🧘', label: 'Yoga e Meditação' }, { emoji: '🌿', label: 'Natureza e Caminhada' },
      { emoji: '🎮', label: 'Jogos' }, { emoji: '🗣️', label: 'Idiomas e Cultura' },
      { emoji: '🐾', label: 'Amante de Pets' }, { emoji: '💡', label: 'Tecnologia e Inovação' },
      { emoji: '📷', label: 'Fotografia' }, { emoji: '🍸', label: 'Mixologia' },
      { emoji: '🍷', label: 'Vinho' }, { emoji: '🍺', label: 'Cervejas' },
      { emoji: '🌱', label: 'Psicologia & Autoconhecimento' },
    ],
  },
  {
    key: 'generoFilme',
    section: 'Interesses',
    type: 'single',
    question: 'Se a sua vida fosse um gênero de filme, seria',
    options: [
      { emoji: '🎭', label: 'Comédia' }, { emoji: '🎭', label: 'Drama' },
      { emoji: '🗺️', label: 'Aventura' }, { emoji: '❤️', label: 'Romântico' },
    ],
  },
  {
    key: 'setor',
    section: 'Trabalho',
    type: 'single',
    question: 'Se você está trabalhando, em que setor você trabalha?',
    options: [
      { emoji: '🙅', label: 'Não estou trabalhando' }, { emoji: '⚕️', label: 'Área da Saúde' },
      { emoji: '💻', label: 'Tecnologia' }, { emoji: '💰', label: 'Serviços financeiros' },
      { emoji: '🔧', label: 'Manual de trabalho' }, { emoji: '🛍️', label: 'Varejo' },
      { emoji: '🥕', label: 'Comida' }, { emoji: '🧑‍💼', label: 'Serviços' },
    ],
  },
  {
    key: 'info_ciencia',
    section: 'O que a ciência diz',
    type: 'science',
    title: 'A diz ciência: a conexão nos faz mais felizes',
    body: 'Pessoas que reúnem mais momentos significativos a cada semana tendem a se sentir mais felizes.\nBaseado em dados de eventos e comunidades reais.',
  },
  {
    key: 'qualidadesDivertidos',
    section: 'Personalidade',
    type: 'multi',
    question: 'E quais qualidades dos seus amigos divertidos em você?',
    subtitle: 'Selecione até 3',
    maxSelect: 3,
    options: [
      { emoji: '👀', label: 'Atencioso' }, { emoji: '✨', label: 'Autêntico' },
      { emoji: '🤩', label: 'Carismático' }, { emoji: '⚡', label: 'Convincente' },
      { emoji: '🌿', label: 'Pé-no-chão' }, { emoji: '😂', label: 'Engraçado' },
      { emoji: '🧠', label: 'Inteligente' }, { emoji: '😎', label: 'Estiloso' },
      { emoji: '🔥', label: 'Quente' }, { emoji: '🌈', label: 'Otimista' },
    ],
  },
  {
    key: 'qualidadesValorizadas',
    section: 'Personalidade',
    type: 'multi',
    question: 'Quais qualidades você mais valoriza em um amigo?',
    subtitle: 'Selecione até 3',
    maxSelect: 3,
    options: [
      { emoji: '✨', label: 'Autêntico' }, { emoji: '👀', label: 'Atencioso' },
      { emoji: '🤩', label: 'Carismático' }, { emoji: '🌿', label: 'Pé-no-chão' },
      { emoji: '⚡', label: 'Convincente' }, { emoji: '😂', label: 'Engraçado' },
      { emoji: '🧠', label: 'Inteligente' }, { emoji: '🔥', label: 'Quente' },
      { emoji: '😎', label: 'Estiloso' }, { emoji: '🌈', label: 'Otimista' },
    ],
  },
  {
    key: 'logicaEmocao',
    section: 'Personalidade',
    type: 'single',
    question: 'Suas opiniões geralmente são guiadas por',
    options: [
      { emoji: '🔍', label: 'Lógica' }, { emoji: '💗', label: 'Emoções e sentimentos' },
      { emoji: '🍃', label: 'Uma mistura, dependendo do humor' },
    ],
  },
  {
    key: 'introvertidoExtrovertido',
    section: 'Personalidade',
    type: 'single',
    question: 'Você é mais',
    options: [
      { emoji: '📚', label: 'Introvertido - recarregar sentado sozinho' },
      { emoji: '🌗', label: 'Ambivertido - um pouco de ambos' },
      { emoji: '⚡', label: 'Extrovertido - energizado por pessoas' },
    ],
  },
  {
    key: 'info_boasvindas',
    section: 'Bem-vindo',
    type: 'welcome',
    title: 'Bem-vindo à comunidade! ✨',
    body: 'Linkah cria espaço para uma conexão real, momentos presenciais seguros que transformam desconhecidos em amigos.',
  },
  {
    key: 'tipoGrupo',
    section: 'Social',
    type: 'single',
    question: 'Qual é o seu tipo de grupo ideal?',
    options: [
      { emoji: '🤏', label: 'Pequeno e seguro' }, { emoji: '💡', label: 'Inteligente e inspirador' },
      { emoji: '🎉', label: 'Divertido e inesperado' },
      { emoji: '🌈', label: 'Não tem muita importância, pois as pessoas fazem o momento' },
    ],
  },
  {
    key: 'temFilhos',
    section: 'Crianças',
    type: 'single',
    question: 'Você tem filhos?',
    options: [
      { emoji: '👶', label: 'Sim' }, { emoji: '🙅', label: 'Não' },
      { emoji: '🤐', label: 'Eu prefiro não dizer' },
    ],
  },
  {
    key: 'statusRelacionamento',
    section: 'Relacionamento',
    type: 'single',
    question: 'Qual é o seu status de relacionamento?',
    options: [
      { emoji: '🙋', label: 'Solteiro(a)' }, { emoji: '💍', label: 'Casado(a)' },
      { emoji: '💞', label: 'Em um relacionamento' }, { emoji: '🤐', label: 'Eu prefiro não dizer' },
    ],
  },
  {
    key: 'noiteIdeal',
    section: 'Noite ideal',
    type: 'single',
    question: 'O que melhor descreve uma noite ideal?',
    options: [
      { emoji: '🍷', label: 'Tendo conversas profundas enquanto toma vinho' },
      { emoji: '🎲', label: 'Rindo e jogando' },
      { emoji: '🎨', label: 'Explorando novos espaços criativos' },
      { emoji: '🌳', label: 'Desfrutando da natureza' },
    ],
  },
  {
    key: 'sentirAposJantar',
    section: 'Personalidade',
    type: 'multi',
    question: 'Depois do jantar quero me sentir...',
    subtitle: 'Selecione até 3',
    maxSelect: 3,
    options: [
      { emoji: '😊', label: 'Energizado' }, { emoji: '💗', label: 'Visto e conectado' },
      { emoji: '😌', label: 'Calmo e pé-no-chão' }, { emoji: '🎉', label: 'Surpreso e revigorado' },
    ],
  },
];

type Answers = Record<string, string | string[]>;

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [cidadeInput, setCidadeInput] = useState('');
  const [editandoCidade, setEditandoCidade] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('@Linkah:Token');
    if (!token) router.push('/login');
  }, [router]);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  function goNext() {
    if (isLast) handleSubmit();
    else setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (stepIndex === 0) return;
    setStepIndex((i) => i - 1);
  }

  function selectSingle(label: string) {
    setAnswers((prev) => ({ ...prev, [step.key]: label }));
    setTimeout(() => goNext(), 150);
  }

  function toggleMulti(label: string, maxSelect: number) {
    setAnswers((prev) => {
      const atual = (prev[step.key] as string[]) || [];
      if (atual.includes(label)) return { ...prev, [step.key]: atual.filter((l) => l !== label) };
      if (atual.length >= maxSelect) return prev;
      return { ...prev, [step.key]: [...atual, label] };
    });
  }

  function confirmarCidade() {
    setAnswers((prev) => ({ ...prev, cidade: cidadeInput }));
    setEditandoCidade(false);
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');

    const formData = {
      cidade: (answers['cidade'] as string) || '',
      setor: (answers['setor'] as string) || '',
      generoFilme: (answers['generoFilme'] as string) || '',
      personalidade: [answers['logicaEmocao'], answers['introvertidoExtrovertido']].filter(Boolean).join(' / '),
      qualidades: {
        atividades: answers['atividades'] || [],
        qualidadesDivertidos: answers['qualidadesDivertidos'] || [],
        qualidadesValorizadas: answers['qualidadesValorizadas'] || [],
        logicaEmocao: answers['logicaEmocao'] || '',
        introvertidoExtrovertido: answers['introvertidoExtrovertido'] || '',
        tipoGrupo: answers['tipoGrupo'] || '',
        temFilhos: answers['temFilhos'] || '',
        statusRelacionamento: answers['statusRelacionamento'] || '',
        noiteIdeal: answers['noiteIdeal'] || '',
        sentirAposJantar: answers['sentirAposJantar'] || [],
      },
    };

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('@Linkah:Token');
      const response = await fetch(`${API_URL}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao salvar preferências.');

      const localUser = JSON.parse(localStorage.getItem('@Linkah:User') || '{}');
      localUser.hasOnboarding = true;
      localStorage.setItem('@Linkah:User', JSON.stringify(localUser));
      router.push('/matches');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar preferências.');
      setLoading(false);
    }
  }

  const canAdvanceMulti = step.type === 'multi' && ((answers[step.key] as string[]) || []).length > 0;

  return (
    <div style={{ background: CREME }} className="min-h-screen flex flex-col font-sans">
      {/* Nav */}
      <div className="flex items-center px-5 py-4 relative">
        <button
          onClick={goBack}
          disabled={stepIndex === 0}
          className="text-zinc-900 disabled:opacity-0 transition-opacity"
          aria-label="Voltar"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-[13px] uppercase tracking-[0.14em] text-orange-600">
          {step.section}
        </span>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-8 max-w-md w-full mx-auto">
        {/* -------- LOCALIZAÇÃO -------- */}
        {step.type === 'location' && (
          <div className="flex flex-col flex-1">
            {editandoCidade ? (
              <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-2xl font-extrabold text-zinc-900 mb-6">
                  Em qual cidade você quer se conectar?
                </h1>
                <input
                  autoFocus
                  value={cidadeInput}
                  onChange={(e) => setCidadeInput(e.target.value)}
                  placeholder="Ex: Campinas, Lisboa..."
                  className="w-full bg-white border border-zinc-200 rounded-full px-6 py-4 text-sm font-medium text-zinc-900 outline-none focus:border-orange-400 transition-colors mb-6"
                />
                <button
                  onClick={confirmarCidade}
                  disabled={!cidadeInput.trim()}
                  className="w-full bg-zinc-900 text-white py-4 rounded-full font-bold text-[15px] disabled:opacity-30 transition-opacity"
                >
                  Continuar
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="rounded-[2rem] overflow-hidden mb-8 mt-2">
                  <img
                    src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1000&auto=format&fit=crop"
                    alt=""
                    className="w-full h-64 object-cover"
                  />
                </div>
                <h1 className="text-3xl font-extrabold text-zinc-900 mb-3 leading-tight">
                  Comece a se conectar em <span className="text-orange-600">{cidadeInput}</span>
                </h1>
                <p className="text-zinc-500 text-[15px] leading-relaxed mb-8">
                  Junte-se a milhares de pessoas se conectando em eventos reais perto de você.
                </p>
                <div className="mt-auto space-y-3">
                  <button
                    onClick={goNext}
                    className="w-full bg-zinc-900 text-white py-4 rounded-full font-bold text-[15px]"
                  >
                    Continuar
                  </button>
                  <button
                    onClick={() => setEditandoCidade(true)}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 py-4 rounded-full font-bold text-[15px]"
                  >
                    Mudar minha cidade
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------- CIÊNCIA -------- */}
        {step.type === 'science' && (
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-2xl font-extrabold text-zinc-900 mb-6 leading-snug">{step.title}</h1>
            <div className="bg-white rounded-3xl p-5 mb-6">
              <p className="text-[11px] font-semibold text-zinc-400 mb-3">Nível médio de conexão</p>
              <svg viewBox="0 0 300 110" className="w-full h-28">
                <defs>
                  <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  points="10,95 45,85 80,72 115,58 150,46 185,36 220,26 255,18 290,13 290,110 10,110"
                  fill="url(#fillGrad)"
                />
                <polyline
                  points="10,95 45,85 80,72 115,58 150,46 185,36 220,26 255,18 290,13"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {[10, 45, 80, 115, 150, 185, 220, 255, 290].map((x, i) => (
                  <circle key={i} cx={x} cy={[95, 85, 72, 58, 46, 36, 26, 18, 13][i]} r="3.5" fill="#f97316" />
                ))}
              </svg>
              <p className="text-[11px] font-semibold text-zinc-400 mt-2">
                Momentos sociais significativos por semana
              </p>
            </div>
            {step.body.split('\n').map((line, i) => (
              <p key={i} className="text-zinc-500 text-sm leading-relaxed mb-1">
                {line}
              </p>
            ))}
            <button
              onClick={goNext}
              className="w-full bg-zinc-900 text-white py-4 rounded-full font-bold text-[15px] mt-6"
            >
              Continuar
            </button>
          </div>
        )}

        {/* -------- BOAS-VINDAS -------- */}
        {step.type === 'welcome' && (
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div className="relative w-full h-56 mb-10">
              {[
                { src: 'photo-1529333166437-7750a6dd5a70', rot: '-rotate-6', pos: 'left-4 top-4' },
                { src: 'photo-1517841905240-472988babdf9', rot: 'rotate-3', pos: 'left-1/2 -translate-x-1/2 top-0' },
                { src: 'photo-1543007630-9710e4a00a20', rot: 'rotate-12', pos: 'right-4 top-6' },
              ].map((p, i) => (
                <img
                  key={i}
                  src={`https://images.unsplash.com/${p.src}?q=80&w=400&auto=format&fit=crop`}
                  alt=""
                  className={`absolute w-32 h-40 object-cover rounded-2xl shadow-lg border-4 border-white ${p.rot} ${p.pos}`}
                />
              ))}
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-900 mb-3">{step.title}</h1>
            <p className="text-zinc-500 text-[15px] leading-relaxed mb-10 px-2">{step.body}</p>
            <button
              onClick={goNext}
              className="w-full bg-zinc-900 text-white py-4 rounded-full font-bold text-[15px] mt-auto"
            >
              Continuar
            </button>
          </div>
        )}

        {/* -------- SINGLE -------- */}
        {step.type === 'single' && (
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-2xl font-extrabold text-zinc-900 mb-8 leading-snug">{step.question}</h1>
            <div className="space-y-3">
              {step.options.map((opt) => {
                const selecionado = answers[step.key] === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => selectSingle(opt.label)}
                    className={`w-full flex items-center gap-3 text-left py-4 px-6 rounded-full border font-bold text-[15px] transition-all ${
                      selecionado
                        ? 'bg-zinc-900 border-zinc-900 text-white'
                        : 'bg-white border-zinc-200 text-zinc-900 hover:border-orange-300'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* -------- MULTI -------- */}
        {step.type === 'multi' && (
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-2xl font-extrabold text-zinc-900 mb-1 leading-snug">{step.question}</h1>
            {step.subtitle && <p className="text-zinc-400 font-medium text-sm mb-6">{step.subtitle}</p>}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {step.options.map((opt) => {
                const atual = (answers[step.key] as string[]) || [];
                const selecionado = atual.includes(opt.label);
                const disabled = !selecionado && atual.length >= step.maxSelect;
                return (
                  <button
                    key={opt.label}
                    onClick={() => toggleMulti(opt.label, step.maxSelect)}
                    disabled={disabled}
                    className={`flex items-center gap-2 py-2.5 px-4 rounded-full border font-bold text-[13px] transition-all ${
                      selecionado
                        ? 'bg-zinc-900 border-zinc-900 text-white'
                        : disabled
                        ? 'bg-white border-zinc-100 text-zinc-300'
                        : 'bg-white border-zinc-200 text-zinc-900 hover:border-orange-300'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={goNext}
              disabled={!canAdvanceMulti || loading}
              className="w-full bg-zinc-900 text-white py-4 rounded-full font-bold text-[15px] disabled:opacity-30 mt-auto"
            >
              {isLast && loading ? 'Salvando...' : 'Continuar'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}