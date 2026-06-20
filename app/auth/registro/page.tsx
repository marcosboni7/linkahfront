'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import {
  User,
  Mail,
  Fingerprint,
  Lock,
  Loader2,
  Sparkles,
  ChevronLeft,
  MapPin,
  Phone,
  Calendar,
  Hash,
  ChevronDown,
} from 'lucide-react';

const API_URL_BASE = 'https://api-linkah.onrender.com';

const PAISES = [
  { code: 'BR', label: 'Brasil', ddi: '+55', flag: '🇧🇷' },
  { code: 'US', label: 'EUA', ddi: '+1', flag: '🇺🇸' },
  { code: 'PT', label: 'Portugal', ddi: '+351', flag: '🇵🇹' },
  { code: 'AR', label: 'Argentina', ddi: '+54', flag: '🇦🇷' },
  { code: 'MX', label: 'México', ddi: '+52', flag: '🇲🇽' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PF');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paisTelefone, setPaisTelefone] = useState(PAISES[0]);
  const [telefone, setTelefone] = useState('');

  const formatTelefone = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 11);

    if (paisTelefone.code === 'BR') {
      if (nums.length <= 2) return nums;
      if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
      return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
    }

    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return `${nums.slice(0, 3)} ${nums.slice(3)}`;
    return `${nums.slice(0, 3)} ${nums.slice(3, 6)} ${nums.slice(6)}`;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatTelefone(e.target.value));
    setErrors((prev) => ({ ...prev, telefone: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (value.trim() !== '') {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'email') {
      if (value && !/\S+@\S+\.\S+/.test(value)) {
        setErrors((prev) => ({ ...prev, email: 'E-mail inválido' }));
      } else {
        setErrors((prev) => ({ ...prev, email: '' }));
      }
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const raw = Object.fromEntries(formData.entries());
    const newErrors: Record<string, string> = {};

    const telefoneCompleto = `${paisTelefone.ddi} ${telefone}`.trim();
    const telefoneNumeros = telefone.replace(/\D/g, '');

    const camposObrigatorios = [
      'nome',
      'email',
      'cpf_cnpj',
      'senha',
      'data_nascimento',
      'cep',
      'rua',
      'estado',
    ];

    camposObrigatorios.forEach((key) => {
      if (!raw[key] || String(raw[key]).trim() === '') {
        newErrors[key] = 'Obrigatório';
      }
    });

    if (!telefoneNumeros) {
      newErrors.telefone = 'Obrigatório';
    } else if (telefoneNumeros.length < 8) {
      newErrors.telefone = 'Telefone inválido';
    }

    const email = String(raw.email || '').trim().toLowerCase();
    const senha = String(raw.senha || '');

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (senha && senha.length < 6) {
      newErrors.senha = 'Mínimo 6 caracteres';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const nomeLimpo = String(raw.nome || '').trim();

    const payload = {
      nome: nomeLimpo,
      email,
      senha,
      cpf_cnpj: String(raw.cpf_cnpj || '').trim(),
      telefone: telefoneCompleto,
      data_nascimento: raw.data_nascimento ? String(raw.data_nascimento) : null,
      cep: String(raw.cep || '').trim(),
      rua: String(raw.rua || '').trim(),
      estado: String(raw.estado || '').trim().toUpperCase(),
      numero: raw.numero ? String(raw.numero).trim() : null,
      bairro: raw.bairro ? String(raw.bairro).trim() : null,
      cidade: raw.cidade ? String(raw.cidade).trim() : null,
      complemento: raw.complemento ? String(raw.complemento).trim() : null,
      razao_social: tipoPessoa === 'PJ' ? nomeLimpo : null,
      tipo: tipoPessoa,
      perfil: 'produtor',
    };

    try {
      const response = await fetch(`${API_URL_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let result: any = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (response.ok) {
        await Swal.fire({
          title:
            '<span style="font-family: sans-serif; font-weight: 900; font-style: italic;">CONTA CRIADA!</span>',
          text: 'Sua conta de produtor foi provisionada com sucesso.',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          confirmButtonColor: '#000',
          customClass: {
            popup: 'rounded-[3rem] border-none shadow-2xl',
            title: 'tracking-tighter',
          },
        });

        router.push('/auth/login');
      } else {
        Swal.fire({
          title: 'Atenção',
          text:
            result?.message ||
            result?.error ||
            `Erro interno no servidor (${response.status})`,
          icon: 'warning',
          confirmButtonColor: '#000',
          customClass: { popup: 'rounded-[3rem]' },
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Erro Crítico',
        text: error?.message || 'Falha de comunicação com o servidor.',
        icon: 'error',
        confirmButtonColor: '#000',
        customClass: { popup: 'rounded-[2rem]' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-[#1D1D1F]">
      <div className="hidden lg:flex w-[40%] relative overflow-hidden bg-black sticky top-0 h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 grayscale-[0.5]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1514525253361-bee1455670f2?q=80&w=1964&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div className="text-3xl font-black tracking-tighter text-white italic">
            LINKAH<span className="text-[#FF4D4D]">.</span>
          </div>

          <div className="max-w-xs">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8">
              <span className="w-2 h-2 bg-[#FF4D4D] rounded-full shadow-[0_0_10px_#FF4D4D]" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                Identity Provisioning
              </span>
            </div>

            <h1 className="text-7xl font-black text-white leading-none tracking-tighter mb-8 italic uppercase">
              Crie o <br />
              <span className="text-[#FF4D4D]">Futuro.</span>
            </h1>

            <p className="text-gray-400 text-lg font-medium leading-relaxed">
              Sua infraestrutura para eventos começa com uma conta de produtor oficial.
            </p>
          </div>

          <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
            Protocol Linkah-256 © 2026
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center bg-white px-6 py-16 lg:px-24">
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Link
            href="/auth/login"
            className="group flex items-center gap-2 text-gray-400 hover:text-black transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-12"
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Voltar ao Acesso
          </Link>

          <header className="mb-14">
            <h2 className="text-5xl font-black text-black italic uppercase tracking-tighter mb-3">
              Cadastro
            </h2>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-tight">
              Preencha os dados do responsável
            </p>
          </header>

          <form onSubmit={handleRegister} className="space-y-10">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                Natureza Jurídica
              </span>

              <div className="flex p-1.5 bg-gray-50 rounded-[2rem] w-full border border-gray-100 shadow-inner">
                <button
                  type="button"
                  onClick={() => setTipoPessoa('PF')}
                  className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                    tipoPessoa === 'PF'
                      ? 'bg-white text-black shadow-md border border-gray-100'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Pessoa Física
                </button>

                <button
                  type="button"
                  onClick={() => setTipoPessoa('PJ')}
                  className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                    tipoPessoa === 'PJ'
                      ? 'bg-white text-black shadow-md border border-gray-100'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Pessoa Jurídica
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <FieldLabel label="Nome ou Razão" error={errors.nome} />
              <div className="relative group md:-mt-[2px]">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                <input
                  name="nome"
                  onChange={handleInputChange}
                  placeholder="Nome Completo"
                  className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black focus:ring-8 focus:ring-gray-50 outline-none transition-all font-bold text-black"
                />
              </div>

              <FieldLabel label={tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'} error={errors.cpf_cnpj} />
              <div className="relative group md:-mt-[2px]">
                <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                <input
                  name="cpf_cnpj"
                  onChange={handleInputChange}
                  placeholder={tipoPessoa === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                  className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black focus:ring-8 focus:ring-gray-50 outline-none transition-all font-bold text-black"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <FieldLabel label="E-mail Corporativo" error={errors.email} />
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                  <input
                    name="email"
                    type="email"
                    onChange={handleInputChange}
                    placeholder="exemplo@linkah.com"
                    className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black focus:ring-8 focus:ring-gray-50 outline-none transition-all font-bold text-black"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <FieldLabel label="Chave de Acesso" error={errors.senha} />
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                  <input
                    name="senha"
                    type="password"
                    onChange={handleInputChange}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black focus:ring-8 focus:ring-gray-50 outline-none transition-all font-bold text-black"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <FieldLabel label="Nascimento" error={errors.data_nascimento} />
                <div className="relative group">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                  <input
                    name="data_nascimento"
                    type="date"
                    onChange={handleInputChange}
                    className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white outline-none font-bold text-gray-500 focus:text-black transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <FieldLabel label="Telefone / WhatsApp" error={errors.telefone} />

                <div className="relative flex h-[66px] overflow-hidden rounded-[1.5rem] border border-gray-100 bg-gray-50/50 transition-all focus-within:border-black focus-within:bg-white focus-within:ring-8 focus-within:ring-gray-50">
                  <div className="relative flex items-center border-r border-gray-100 bg-white/70">
                    <select
                      value={paisTelefone.code}
                      onChange={(e) => {
                        const pais = PAISES.find((item) => item.code === e.target.value) || PAISES[0];
                        setPaisTelefone(pais);
                        setTelefone('');
                      }}
                      className="h-full w-[118px] appearance-none bg-transparent pl-4 pr-8 text-sm font-black text-black outline-none"
                    >
                      {PAISES.map((pais) => (
                        <option key={pais.code} value={pais.code}>
                          {pais.flag} {pais.ddi}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>

                  <div className="relative flex-1">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors" size={18} />
                    <input
                      name="telefone"
                      type="tel"
                      inputMode="numeric"
                      value={telefone}
                      onChange={handleTelefoneChange}
                      placeholder={paisTelefone.code === 'BR' ? '(11) 99999-9999' : '555 000 000'}
                      className="h-full w-full bg-transparent pl-14 pr-5 font-bold text-black outline-none placeholder:text-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-3">
                  <FieldLabel label="Logradouro Principal" error={errors.rua} />
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                    <input
                      name="rua"
                      onChange={handleInputChange}
                      placeholder="Rua, Av ou Alameda"
                      className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-bold text-black"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <FieldLabel label="UF" error={errors.estado} center />
                  <input
                    name="estado"
                    onChange={handleInputChange}
                    placeholder="SP"
                    maxLength={2}
                    className="w-full py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black outline-none font-black text-center uppercase transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <FieldLabel label="Código Postal (CEP)" error={errors.cep} />
                <div className="relative group">
                  <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                  <input
                    name="cep"
                    onChange={handleInputChange}
                    placeholder="00000-000"
                    className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black outline-none font-bold transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-[#030712] text-white py-7 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-gray-200 hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-[#FF4D4D]" />
              ) : (
                <>
                  Provisionar Conta de Produtor{' '}
                  <Sparkles size={20} className="text-[#FF4D4D]" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-16 mb-20 pt-8 border-t border-gray-50 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
              Já faz parte da rede?{' '}
              <Link
                href="/auth/login"
                className="text-black hover:text-[#FF4D4D] transition-colors ml-2 underline decoration-gray-200 underline-offset-4"
              >
                Acessar Painel
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({
  label,
  error,
  center = false,
}: {
  label: string;
  error?: string;
  center?: boolean;
}) {
  return (
    <div className="flex justify-between items-center px-1">
      <label
        className={`text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ${
          center ? 'text-center block w-full' : ''
        }`}
      >
        {label}
      </label>

      {error && (
        <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter italic animate-bounce whitespace-nowrap">
          ! {error}
        </span>
      )}
    </div>
  );
}