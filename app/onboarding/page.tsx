'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Corrigido: estava fixo em http://localhost:3001, o que quebra em produção.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

// ============================================================
// TIPOS
// ============================================================
type StepBase = { key: string; section: string };

type SingleStep = StepBase & { type: 'single'; question: string; options: string[] };
type MultiStep = StepBase & {
  type: 'multi';
  question: string;
  subtitle?: string;
  maxSelect: number;
  options: string[];
};
type TextStep = StepBase & { type: 'text'; question: string; placeholder: string };
type InfoStep = StepBase & { type: 'info'; title: string; body: string };

type Step = SingleStep | MultiStep | TextStep | InfoStep;

// ============================================================
// PERGUNTAS (adaptadas dos prints de referência para o contexto Linkah)
// ============================================================
const steps: Step[] = [
  {
    key: 'cidade',
    section: 'Localização',
    type: 'text',
    question: 'Em qual cidade você quer se conectar?',
    placeholder: 'Ex: São Paulo, Votuporanga...',
  },
  {
    key: 'atividades',
    section: 'Interesses',
    type: 'multi',
    question: 'O que você gosta de fazer no seu tempo livre?',
    subtitle: 'Selecione até 5',
    maxSelect: 5,
    options: [
      'Música', 'Viajando', 'Cozinha e Comida', 'Chá e Café', 'Ler Livros',
      'Arte e Design', 'Filmes e Séries', 'Corrida ou Fitness', 'Yoga e Meditação',
      'Natureza e Caminhada', 'Jogos', 'Idiomas e Cultura', 'Amante de Pets',
      'Tecnologia e Inovação', 'Fotografia', 'Mixologia', 'Vinho', 'Cervejas',
      'Psicologia & Autoconhecimento',
    ],
  },
  {
    key: 'generoFilme',
    section: 'Interesses',
    type: 'single',
    question: 'Se a sua vida fosse um gênero de filme, seria',
    options: ['Ficção Científica', 'Ação / Aventura', 'Comédia', 'Drama / Suspense', 'Documentários'],
  },
  {
    key: 'setor',
    section: 'Trabalho',
    type: 'single',
    question: 'Qual seu setor de atuação?',
    options: [
      'Não estou trabalhando', 'Tecnologia / Desenvolvimento', 'Design / Criativo',
      'Marketing / Vendas', 'Eventos / Produção', 'Área da Saúde',
      'Serviços financeiros', 'Manual de trabalho', 'Varejo', 'Outro',
    ],
  },
  {
    key: 'info_ciencia',
    section: 'O que a ciência diz',
    type: 'info',
    title: 'A ciência confirma: conexão nos faz mais felizes',
    body: 'Pessoas que participam de mais eventos e conversas significativas por semana tendem a se sentir mais felizes e realizadas.',
  },
  {
    key: 'personalidade',
    section: 'Personalidade',
    type: 'single',
    question: 'Como você descreveria sua personalidade?',
    options: ['Extrovertido(a)', 'Introvertido(a)', 'Ambivertido(a)', 'Analítico(a)', 'Criativo(a)'],
  },
  {
    key: 'logicaEmocao',
    section: 'Personalidade',
    type: 'single',
    question: 'Suas opiniões geralmente são guiadas por',
    options: ['Lógica', 'Emoções e sentimentos', 'Uma mistura, dependendo do humor'],
  },
  {
    key: 'qualidades',
    section: 'Personalidade',
    type: 'multi',
    question: 'Escolha até 3 principais qualidades suas',
    subtitle: 'Selecione até 3',
    maxSelect: 3,
    options: ['Empático(a)', 'Focado(a)', 'Comunicativo(a)', 'Resiliente', 'Curioso(a)', 'Organizado(a)'],
  },
  {
    key: 'info_boasvindas',
    section: 'Bem-vindo',
    type: 'info',
    title: 'Bem-vindo à comunidade! ✨',
    body: 'A Linkah cria espaço para conexões reais em eventos presenciais que transformam desconhecidos em pessoas que você quer rever.',
  },
  {
    key: 'tipoGrupo',
    section: 'Social',
    type: 'single',
    question: 'Qual é o seu tipo de grupo ideal?',
    options: [
      'Pequeno e seguro', 'Inteligente e inspirador', 'Divertido e inesperado',
      'Não tem muita importância, pois as pessoas fazem o momento',
    ],
  },
  {
    key: 'temFilhos',
    section: 'Crianças',
    type: 'single',
    question: 'Você tem filhos?',
    options: ['Sim', 'Não', 'Eu prefiro não dizer'],
  },
  {
    key: 'statusRelacionamento',
    section: 'Relacionamento',
    type: 'single',
    question: 'Qual é o seu status de relacionamento?',
    options: ['Solteiro(a)', 'Casado(a)', 'Em um relacionamento', 'Eu prefiro não dizer'],
  },
  {
    key: 'noiteIdeal',
    section: 'Noite ideal',
    type: 'single',
    question: 'O que melhor descreve uma noite ideal?',
    options: [
      'Tendo conversas profundas enquanto toma vinho', 'Rindo e jogando',
      'Explorando novos espaços criativos', 'Desfrutando da natureza',
    ],
  },
  {
    key: 'sentirAposJantar',
    section: 'Personalidade',
    type: 'multi',
    question: 'Depois do jantar quero me sentir...',
    subtitle: 'Selecione até 3',
    maxSelect: 3,
    options: ['Energizado', 'Visto e conectado', 'Calmo e pé-no-chão', 'Surpreso e revigorado'],
  },
];

type Answers = Record<string, string | string[]>;

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [textValue, setTextValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('@Linkah:Token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  function goNext() {
    if (isLast) {
      handleSubmit();
    } else {
      setStepIndex((i) => i + 1);
      setTextValue('');
    }
  }

  function goBack() {
    if (stepIndex === 0) return;
    setStepIndex((i) => i - 1);
  }

  function selectSingle(value: string) {
    setAnswers((prev) => ({ ...prev, [step.key]: value }));
    setTimeout(() => goNext(), 150);
  }

  function toggleMulti(value: string, maxSelect: number) {
    setAnswers((prev) => {
      const atual = (prev[step.key] as string[]) || [];
      if (atual.includes(value)) {
        return { ...prev, [step.key]: atual.filter((q) => q !== value) };
      }
      if (atual.length >= maxSelect) {
        alert(`Você pode selecionar no máximo ${maxSelect}.`);
        return prev;
      }
      return { ...prev, [step.key]: [...atual, value] };
    });
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');

    const formData = {
      cidade: (answers['cidade'] as string) || '',
      setor: (answers['setor'] as string) || '',
      generoFilme: (answers['generoFilme'] as string) || '',
      personalidade: (answers['personalidade'] as string) || '',
      qualidades: {
        atividades: answers['atividades'] || [],
        qualidadesPessoais: answers['qualidades'] || [],
        logicaEmocao: answers['logicaEmocao'] || '',
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar preferências.');
      }

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
  const canAdvanceText = step.type === 'text' && textValue.trim().length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        {/* Cabeçalho: voltar + progresso */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={goBack}
            disabled={stepIndex === 0}
            className="text-zinc-500 hover:text-white disabled:opacity-0 transition-colors text-xl leading-none"
            aria-label="Voltar"
          >
            ←
          </button>
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 shrink-0">
            {step.section}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {step.type === 'info' && (
          <div className="text-center py-4">
            <h1 className="text-2xl font-bold tracking-tight mb-3">{step.title}</h1>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">{step.body}</p>
            <button
              onClick={goNext}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/30"
            >
              Continuar
            </button>
          </div>
        )}

        {step.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">{step.question}</label>
            <input
              autoFocus
              type="text"
              placeholder={step.placeholder}
              value={textValue}
              onChange={(e) => {
                setTextValue(e.target.value);
                setAnswers((prev) => ({ ...prev, [step.key]: e.target.value }));
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors mb-6"
            />
            <button
              onClick={goNext}
              disabled={!canAdvanceText}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        )}

        {step.type === 'single' && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">{step.question}</label>
            <div className="space-y-2">
              {step.options.map((opt) => {
                const selecionado = answers[step.key] === opt;
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => selectSingle(opt)}
                    className={`w-full text-left py-3 px-4 rounded-lg text-sm font-medium border transition-all ${
                      selecionado
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {opt} {selecionado && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step.type === 'multi' && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">{step.question}</label>
            {step.subtitle && <p className="text-zinc-500 text-xs mb-3">{step.subtitle}</p>}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {step.options.map((opt) => {
                const atual = (answers[step.key] as string[]) || [];
                const selecionado = atual.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggleMulti(opt, step.maxSelect)}
                    className={`py-2.5 px-4 rounded-lg text-sm font-medium border transition-all text-left ${
                      selecionado
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {opt} {selecionado && '✓'}
                  </button>
                );
              })}
            </div>
            <button
              onClick={goNext}
              disabled={!canAdvanceMulti || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {isLast && loading ? 'Salvando preferências...' : 'Continuar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}