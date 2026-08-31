'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api-linkah.onrender.com';

const CREME = '#F6F1E9';

export default function OnboardingAuthPage() {
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister
        ? '/api/auth/register'
        : '/api/auth/login';

      const bodyData = isRegister
        ? {
            nome,
            email,
            senha
          }
        : {
            email,
            senha
          };

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyData)
        }
      );

      const data = await response.json();

      console.log('📦 Resposta da API:', data);

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          'Erro na autenticação.'
        );
      }

      const token =
        data.token ||
        data.accessToken;

      if (
        !token ||
        typeof token !== 'string' ||
        token === 'undefined' ||
        token === 'null'
      ) {
        throw new Error(
          'A API não retornou um token de autenticação.'
        );
      }

      // Limpa dados antigos
      localStorage.removeItem('token');
      localStorage.removeItem('@Linkah:Token');
      localStorage.removeItem('@Linkah:User');

      // Salva dados novos
      localStorage.setItem(
        'token',
        token
      );

      localStorage.setItem(
        '@Linkah:Token',
        token
      );

      localStorage.setItem(
        '@Linkah:User',
        JSON.stringify(
          data.user || {}
        )
      );

      // ======================================================
      // REDIRECIONAMENTO
      // ======================================================

      // Cadastro novo sempre começa onboarding
      if (isRegister) {
        router.replace('/onboarding');
        return;
      }

      // Login de usuário existente
      if (data.user?.hasOnboarding === true) {
        console.log(
          '✅ Onboarding já concluído → indo para matches'
        );

        router.replace('/matches');
        return;
      }

      console.log(
        '📝 Onboarding ainda não concluído'
      );

      router.replace('/onboarding');

    } catch (err: unknown) {
      console.error(
        '❌ Erro de autenticação:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro.'
      );

      setLoading(false);
    }
  }

  function alternarModo() {
    setIsRegister((prev) => !prev);

    setError('');
    setNome('');
    setEmail('');
    setSenha('');
  }

  return (
    <div
      style={{
        background: CREME
      }}
      className="
        min-h-screen
        flex
        flex-col
        justify-center
        px-5
        py-12
        font-sans
      "
    >
      <div
        className="
          max-w-md
          w-full
          mx-auto
          bg-white
          p-8
          rounded-[2rem]
          shadow-sm
          border
          border-zinc-200
        "
      >
        <div className="text-center mb-8">

          <span
            className="
              font-bold
              text-[13px]
              uppercase
              tracking-[0.14em]
              text-orange-600
              block
              mb-2
            "
          >
            Linkah • Onboarding
          </span>

          <h1
            className="
              text-2xl
              font-extrabold
              text-zinc-900
            "
          >
            {isRegister
              ? 'Crie sua conta para começar'
              : 'Entre para continuar'}
          </h1>

          <p
            className="
              text-zinc-500
              text-sm
              mt-1
            "
          >
            {isRegister
              ? 'Cadastre-se para configurar seu perfil e achar conexões.'
              : 'Faça login para continuar.'}
          </p>

        </div>

        {error && (
          <div
            className="
              mb-6
              bg-red-50
              text-red-600
              p-4
              rounded-2xl
              text-sm
              font-semibold
              border
              border-red-100
            "
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {isRegister && (
            <div>

              <label
                className="
                  block
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-zinc-500
                  mb-1.5
                "
              >
                Nome
              </label>

              <input
                type="text"
                required
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
                placeholder="Seu nome completo"
                className="
                  w-full
                  bg-zinc-50
                  border
                  border-zinc-200
                  rounded-full
                  px-5
                  py-3.5
                  text-sm
                  font-medium
                  text-zinc-900
                  outline-none
                  focus:border-orange-400
                  transition-colors
                "
              />

            </div>
          )}

          <div>

            <label
              className="
                block
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-zinc-500
                mb-1.5
              "
            >
              E-mail
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="seu@email.com"
              autoComplete="email"
              className="
                w-full
                bg-zinc-50
                border
                border-zinc-200
                rounded-full
                px-5
                py-3.5
                text-sm
                font-medium
                text-zinc-900
                outline-none
                focus:border-orange-400
                transition-colors
              "
            />

          </div>

          <div>

            <label
              className="
                block
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-zinc-500
                mb-1.5
              "
            >
              Senha
            </label>

            <input
              type="password"
              required
              value={senha}
              onChange={(e) =>
                setSenha(e.target.value)
              }
              placeholder="••••••••"
              autoComplete={
                isRegister
                  ? 'new-password'
                  : 'current-password'
              }
              className="
                w-full
                bg-zinc-50
                border
                border-zinc-200
                rounded-full
                px-5
                py-3.5
                text-sm
                font-medium
                text-zinc-900
                outline-none
                focus:border-orange-400
                transition-colors
              "
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-zinc-900
              text-white
              py-4
              rounded-full
              font-bold
              text-[15px]
              disabled:opacity-50
              transition-opacity
              mt-2
            "
          >
            {loading
              ? 'Aguarde...'
              : isRegister
                ? 'Cadastrar'
                : 'Entrar'}
          </button>

        </form>

        <div className="text-center mt-6">

          <button
            type="button"
            onClick={alternarModo}
            disabled={loading}
            className="
              text-sm
              font-semibold
              text-zinc-600
              hover:text-orange-600
              transition-colors
              disabled:opacity-50
            "
          >
            {isRegister
              ? 'Já tem uma conta? Faça login'
              : 'Não tem conta? Cadastre-se'}
          </button>

        </div>
      </div>
    </div>
  );
}