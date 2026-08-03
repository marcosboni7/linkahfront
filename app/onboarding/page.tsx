'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados do formulário de Onboarding
  const [formData, setFormData] = useState({
    cidade: '',
    setor: '',
    generoFilme: '',
    personalidade: '',
    qualidades: [] as string[]
  });

  // Lista de opções pré-definidas para as escolhas
  const setoresOpcoes = ['Tecnologia / Desenvolvimento', 'Design / Criativo', 'Marketing / Vendas', 'Eventos / Produção', 'Outro'];
  const filmesOpcoes = ['Ficção Científica', 'Ação / Aventura', 'Comédia', 'Drama / Suspense', 'Documentários'];
  const personalidadesOpcoes = ['Extrovertido(a)', 'Introvertido(a)', 'Ambivertido(a)', 'Analítico(a)', 'Criativo(a)'];
  const qualidadesOpcoes = ['Empático(a)', 'Focado(a)', 'Comunicativo(a)', 'Resiliente', 'Curioso(a)', 'Organizado(a)'];

  useEffect(() => {
    // Verifica se o usuário está logado pegando o token do localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('@Linkah:Token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleQualidadeToggle = (qualidade: string) => {
    setFormData((prev) => {
      const atual = prev.qualidades;
      if (atual.includes(qualidade)) {
        return { ...prev, qualidades: atual.filter((q) => q !== qualidade) };
      } else {
        if (atual.length >= 3) {
          alert('Você pode selecionar no máximo 3 qualidades.');
          return prev;
        }
        return { ...prev, qualidades: [...atual, qualidade] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('@Linkah:Token');
      const response = await fetch('http://localhost:3001/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar preferências.');
      }

      // Sucesso! Atualiza os dados locais do usuário e vai para a tela de matches
      const localUser = JSON.parse(localStorage.getItem('@Linkah:User') || '{}');
      localUser.hasOnboarding = true;
      localStorage.setItem('@Linkah:User', JSON.stringify(localUser));

      router.push('/matches');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar preferências.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo à Linkah! 🚀</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Responda rápido para encontrarmos pessoas e conexões alinhadas com você na sua cidade.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Em qual cidade você está?</label>
            <input
              type="text"
              required
              placeholder="Ex: São Paulo, Votuporanga..."
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Setor */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Qual seu setor de atuação?</label>
            <select
              required
              value={formData.setor}
              onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">Selecione um setor...</option>
              {setoresOpcoes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Gênero de Filme */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Gênero de filme favorito:</label>
            <select
              required
              value={formData.generoFilme}
              onChange={(e) => setFormData({ ...formData, generoFilme: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">Selecione um gênero...</option>
              {filmesOpcoes.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Personalidade */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Como você descreveria sua personalidade?</label>
            <select
              required
              value={formData.personalidade}
              onChange={(e) => setFormData({ ...formData, personalidade: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">Selecione...</option>
              {personalidadesOpcoes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Qualidades (Até 3) */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Escolha até 3 principais qualidades suas:</label>
            <div className="grid grid-cols-2 gap-2">
              {qualidadesOpcoes.map((q) => {
                const selecionado = formData.qualidades.includes(q);
                return (
                  <button
                    type="button"
                    key={q}
                    onClick={() => handleQualidadeToggle(q)}
                    className={`py-2.5 px-4 rounded-lg text-sm font-medium border transition-all text-left ${
                      selecionado 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {q} {selecionado && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? 'Salvando preferências...' : 'Salvar e ver minhas conexões ➔'}
          </button>
        </form>
      </div>
    </div>
  );
}