'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '../site/Navbar';
import { Footer } from '../site/Footer';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Ticket,
} from 'lucide-react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api-linkah.onrender.com';

function normalizeCurrency(input?: any) {
  const raw = String(input || 'BRL')
    .trim()
    .toUpperCase();

  if (['R$', 'REAL', 'REAIS', 'BRL'].includes(raw))
    return 'BRL';

  if (['€', 'EURO', 'EUROS', 'EUR'].includes(raw))
    return 'EUR';

  if (
    ['$', 'DOLAR', 'DÓLAR', 'DOLARES', 'DÓLARES', 'USD'].includes(raw)
  )
    return 'USD';

  return 'BRL';
}

function safeNumber(value: any, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function money(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: normalizeCurrency(currency),
    }).format(safeNumber(value));
  } catch {
    return `R$ ${safeNumber(value)
      .toFixed(2)
      .replace('.', ',')}`;
  }
}

function getErrorMessage(err: any) {
  if (!err) return 'Erro desconhecido';

  if (typeof err === 'string') return err;

  if (typeof err?.message === 'string')
    return err.message;

  return 'Erro desconhecido';
}

// >>> LOG: MESMA função usada na página de detalhes.
// Se essa lógica divergir entre as duas páginas, os IDs não batem
// e o payload nunca encontra o ingresso certo.
function gerarIdIngresso(ing: any, index: number) {
  const idGerado = String(ing?.id ?? ing?._id ?? `ingresso-${index}`);
  console.log(
    `🆔 [CHECKOUT] Gerando ID para ingresso index=${index} | ing.id=${ing?.id} | ing._id=${ing?._id} | ID FINAL="${idGerado}"`
  );
  return idGerado;
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  full = false,
}: any) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-[#6b7280]">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-[58px] w-full rounded-2xl border border-[#e5e7eb] bg-[#fafafa] px-5 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#fdba74] focus:bg-white"
      />
    </div>
  );
}

function Badge({ icon, text }: any) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#ebeef5] bg-[#f8fafc] px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-[#6b7280]">
      {icon}
      {text}
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();

  const eventoId =
    searchParams?.get('eventoId') || '';

  const payloadRaw =
    searchParams?.get('payload') || '';

  const afiliadoId =
    searchParams?.get('afiliado_id') ||
    searchParams?.get('id_afiliado') ||
    '';

  const comissaoPercentual =
    searchParams?.get('pct') || '10';

  console.log('🌐 [CHECKOUT] ===== PÁGINA CARREGADA =====');
  console.log('🌐 [CHECKOUT] eventoId (query param):', eventoId);
  console.log('🌐 [CHECKOUT] payloadRaw BRUTO (query param):', payloadRaw);
  console.log('🌐 [CHECKOUT] afiliadoId (query param):', afiliadoId);

  const [loading, setLoading] = useState(false);

  const [evento, setEvento] = useState<any>(null);

  const [quantidades, setQuantidades] =
    useState<Record<string, number>>({});

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    nomeCracha: '',
    instagramUser: '',
    alergias: '',
    comoConheceu: '',
  });

  // --- DECODIFICAÇÃO DO PAYLOAD ---
  useEffect(() => {
    console.log('🔓 [CHECKOUT] useEffect de decodificação disparado. payloadRaw:', payloadRaw);

    if (!payloadRaw) {
      console.warn('⚠️ [CHECKOUT] payloadRaw está VAZIO — nenhuma quantidade será definida. Verifique se a URL de origem realmente incluiu ?payload=...');
      return;
    }

    try {
      const decodedString = decodeURIComponent(payloadRaw);
      console.log('🔓 [CHECKOUT] String após decodeURIComponent:', decodedString);

      const decoded = JSON.parse(decodedString);
      console.log('🔓 [CHECKOUT] Objeto após JSON.parse:', decoded);

      const result: Record<string, number> = {};

      if (
        decoded &&
        typeof decoded === 'object' &&
        !Array.isArray(decoded)
      ) {
        Object.entries(decoded).forEach(
          ([key, value]) => {
            result[String(key)] =
              safeNumber(value);
          }
        );
      } else {
        console.warn('⚠️ [CHECKOUT] Payload decodificado NÃO é um objeto válido (ou é array):', decoded);
      }

      console.log('🔓 [CHECKOUT] Quantidades FINAIS setadas no estado:', result);
      setQuantidades(result);
    } catch (err) {
      console.error('❌ [CHECKOUT] ERRO ao decodificar/parsear payload:', err);
      console.error('❌ [CHECKOUT] payloadRaw que causou o erro:', payloadRaw);
      setQuantidades({});
    }
  }, [payloadRaw]);

  // --- CARREGAMENTO DO EVENTO ---
  useEffect(() => {
    async function carregarEvento() {
      if (!eventoId) {
        console.warn('⚠️ [CHECKOUT] eventoId está vazio — não é possível buscar o evento.');
        return;
      }

      try {
        const urlFetch = `${API_URL}/api/eventos/${eventoId}`;
        console.log('📡 [CHECKOUT] Buscando evento em:', urlFetch);

        const res = await fetch(urlFetch, {
          cache: 'no-store',
        });

        console.log('📡 [CHECKOUT] Status da resposta:', res.status, res.ok);

        if (!res.ok) {
          throw new Error(
            'Não foi possível carregar o evento.'
          );
        }

        const data = await res.json();
        console.log('📦 [CHECKOUT] Evento cru recebido da API:', JSON.stringify(data, null, 2));

        const moeda = normalizeCurrency(
          data?.moeda ??
            data?.currency ??
            data?.moeda_evento
        );

        console.log('🎟️ [CHECKOUT] Array bruto de ingressos:', data?.ingressos);

        const ingressos = Array.isArray(
          data?.ingressos
        )
          ? data.ingressos.map(
              (ing: any, index: number) => {
                const idFinal = gerarIdIngresso(ing, index);
                const tratado = {
                  ...ing,
                  id: idFinal,
                  nome:
                    ing?.nome ?? 'Ingresso',
                  preco: safeNumber(
                    ing?.preco
                  ),
                  moeda,
                };
                console.log(`🎟️ [CHECKOUT] Ingresso #${index} tratado:`, tratado);
                return tratado;
              }
            )
          : [];

        console.log('🎟️ [CHECKOUT] Lista FINAL de ingressos tratados:', ingressos);
        console.log('🔑 [CHECKOUT] IDs finais dos ingressos:', ingressos.map((i: any) => i.id));

        setEvento({
          ...data,
          moeda,
          ingressos,
        });
      } catch (err) {
        console.error('❌ [CHECKOUT] Erro ao carregar evento:', err);
        setEvento(null);
      }
    }

    carregarEvento();
  }, [eventoId]);

  // --- LOG DE CRUZAMENTO: roda sempre que evento OU quantidades mudam ---
  useEffect(() => {
    if (!evento?.ingressos) return;

    console.log('🔍 [CHECKOUT] ===== VERIFICAÇÃO DE CRUZAMENTO DE IDs =====');
    console.log('🔍 [CHECKOUT] IDs dos ingressos carregados do evento:', evento.ingressos.map((i: any) => i.id));
    console.log('🔍 [CHECKOUT] Chaves recebidas no payload (quantidades):', Object.keys(quantidades));

    evento.ingressos.forEach((ing: any) => {
      const key = String(ing.id);
      const encontrado = Object.prototype.hasOwnProperty.call(quantidades, key);
      console.log(
        `🔍 [CHECKOUT] Ingresso id="${key}" (${ing.nome}) → existe no payload? ${encontrado} → valor: ${quantidades[key]}`
      );
      if (!encontrado) {
        console.warn(`⚠️ [CHECKOUT] MISMATCH! O ID "${key}" do evento NÃO existe nas chaves do payload recebido. Isso é a causa provável do "Nenhum ingresso selecionado".`);
      }
    });
  }, [evento, quantidades]);

  const moedaEvento = normalizeCurrency(
    evento?.moeda
  );

  const totalGeral = useMemo(() => {
    if (!Array.isArray(evento?.ingressos))
      return 0;

    const total = evento.ingressos.reduce(
      (acc: number, ing: any) => {
        const qtd = safeNumber(
          quantidades[String(ing?.id)]
        );

        return (
          acc +
          safeNumber(ing?.preco) * qtd
        );
      },
      0
    );

    console.log('💰 [CHECKOUT] totalGeral recalculado:', total);
    return total;
  }, [evento, quantidades]);

  const totalItens = useMemo(() => {
    const total = Object.values(quantidades).reduce(
      (acc, value) =>
        acc + safeNumber(value),
      0
    );
    console.log('🔢 [CHECKOUT] totalItens recalculado:', total, '| quantidades:', quantidades);
    return total;
  }, [quantidades]);

  const imageUrl = useMemo(() => {
    const img = evento?.imagem_capa;

    if (!img) return '';

    const src = String(img);

    if (src.startsWith('http'))
      return src;

    return `https://res.cloudinary.com/dj32txsol/image/upload/${src}`;
  }, [evento]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFinalizarCompra =
    async () => {
      console.log('🚀 [CHECKOUT] ===== CLIQUE EM "FINALIZAR PAGAMENTO" =====');
      console.log('🚀 [CHECKOUT] eventoId:', eventoId);
      console.log('🚀 [CHECKOUT] formData:', formData);
      console.log('🚀 [CHECKOUT] quantidades no momento do clique:', quantidades);
      console.log('🚀 [CHECKOUT] totalItens no momento do clique:', totalItens);
      console.log('🚀 [CHECKOUT] totalGeral no momento do clique:', totalGeral);

      if (!eventoId) {
        console.warn('⚠️ [CHECKOUT] Bloqueado: eventoId vazio.');
        alert('Evento inválido.');
        return;
      }

      if (
        !formData.nome ||
        !formData.email
      ) {
        console.warn('⚠️ [CHECKOUT] Bloqueado: nome ou email vazio.');
        alert(
          'Preencha nome e e-mail.'
        );
        return;
      }

      if (totalItens <= 0) {
        console.warn('⚠️ [CHECKOUT] Bloqueado: totalItens <= 0 (nenhum ingresso selecionado).');
        alert(
          'Nenhum ingresso selecionado.'
        );
        return;
      }

      // Nota: não validamos mais totalGeral <= 0 aqui, pois um evento
      // com ingressos gratuitos (preco = 0) é um caso válido — totalGeral
      // será 0 mesmo com ingressos corretamente selecionados.

      setLoading(true);

      try {
        const bodyEnviado = {
          evento: {
            id: eventoId,
            titulo:
              evento?.nome ??
              'Evento',
            preco:
              totalItens > 0
                ? totalGeral /
                  totalItens
                : totalGeral,
            moeda: moedaEvento,
          },
          usuarioEmail:
            formData.email,
          usuarioNome:
            formData.nome,
          quantidade: totalItens,
          quantidades,
          afiliadoId,
          comissaoPercentual,
          nomeCracha:
            formData.nomeCracha,
          instagramUser:
            formData.instagramUser,
          alergias:
            formData.alergias,
          comoConheceu:
            formData.comoConheceu,
        };

        console.log('📤 [CHECKOUT] Body enviado para /api/pagamento/checkout:', bodyEnviado);

        const response = await fetch(
          `${API_URL}/api/pagamento/checkout`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify(bodyEnviado),
          }
        );

        console.log('📥 [CHECKOUT] Status da resposta do pagamento:', response.status, response.ok);

        const text =
          await response.text();

        console.log('📥 [CHECKOUT] Texto bruto da resposta:', text);

        const data = text
          ? JSON.parse(text)
          : {};

        console.log('📥 [CHECKOUT] Dados parseados da resposta:', data);

        if (!response.ok) {
          throw new Error(
            data?.error ||
              'Erro ao gerar pagamento.'
          );
        }

        if (data?.url) {
          console.log('✅ [CHECKOUT] Redirecionando para URL de pagamento:', data.url);
          window.location.href =
            data.url;
        } else {
          console.warn('⚠️ [CHECKOUT] Resposta OK mas sem "url" no corpo. Nada a fazer.');
        }
      } catch (err) {
        console.error('❌ [CHECKOUT] Erro ao finalizar compra:', err);
        alert(
          `Erro: ${getErrorMessage(
            err
          )}`
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="relative min-h-[88vh] overflow-hidden bg-[#f6f7fb] px-4 py-8 text-[#111827] sm:px-6 lg:px-8">
      <div className="absolute left-[-160px] top-[-180px] h-[420px] w-[420px] rounded-full bg-[#dbeafe] blur-[120px]" />

      <div className="absolute right-[-120px] top-[180px] h-[420px] w-[420px] rounded-full bg-[#ffedd5] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href={
              eventoId
                ? `/evento/${eventoId}`
                : '/'
            }
            className="inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280] transition hover:text-[#111827]"
          >
            <ArrowLeft size={14} />
            Voltar
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_430px]">
          <section className="rounded-[34px] border border-[#e5e7eb] bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
            <div className="border-b border-[#eef0f4] p-6 sm:p-8 lg:p-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ebeef5] bg-[#fff7ed] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#ea580c]">
                <Sparkles size={14} />
                Checkout seguro
              </div>

              <h1 className="text-4xl font-semibold tracking-[-0.06em] text-[#111827] sm:text-6xl">
                Finalizar pedido
              </h1>

              <p className="mt-5 max-w-2xl text-base font-light leading-7 text-[#6b7280]">
                Preencha seus dados para
                concluir sua inscrição.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 sm:p-8 lg:p-10 md:grid-cols-2">
              <Input
                label="Nome completo"
                name="nome"
                value={formData.nome}
                onChange={
                  handleInputChange
                }
                placeholder="Ex: Marcos Boni"
                full
              />

              <Input
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={
                  handleInputChange
                }
                placeholder="seu@email.com"
                full
              />

              <Input
                label="Nome no crachá"
                name="nomeCracha"
                value={
                  formData.nomeCracha
                }
                onChange={
                  handleInputChange
                }
                placeholder="Como quer ser chamado"
              />

              <Input
                label="Instagram"
                name="instagramUser"
                value={
                  formData.instagramUser
                }
                onChange={
                  handleInputChange
                }
                placeholder="@usuario"
              />

              <Input
                label="Restrições / alergias"
                name="alergias"
                value={formData.alergias}
                onChange={
                  handleInputChange
                }
                placeholder="Nenhuma..."
                full
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-[#6b7280]">
                  Por onde conheceu?
                </label>

                <select
                  name="comoConheceu"
                  value={
                    formData.comoConheceu
                  }
                  onChange={
                    handleInputChange
                  }
                  className="h-[58px] w-full rounded-2xl border border-[#e5e7eb] bg-[#fafafa] px-5 text-sm text-[#111827] outline-none transition focus:border-[#fdba74] focus:bg-white"
                >
                  <option value="">
                    Selecione uma opção
                  </option>

                  <option value="Instagram">
                    Instagram / Redes
                    Sociais
                  </option>

                  <option value="Amigos">
                    Indicação de
                    amigo/colega
                  </option>

                  <option value="Afiliado">
                    Link de
                    vendedor/afiliado
                  </option>

                  <option value="Email">
                    E-mail ou Google
                  </option>

                  <option value="Outros">
                    Outros
                  </option>
                </select>
              </div>

              <div className="md:col-span-2 mt-5 flex flex-wrap gap-3">
                <Badge
                  icon={
                    <CreditCard
                      size={15}
                    />
                  }
                  text="Stripe Gateway"
                />

                <Badge
                  icon={
                    <ShieldCheck
                      size={15}
                    />
                  }
                  text="Pagamento seguro"
                />
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-[34px] border border-[#e5e7eb] bg-white/95 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
              <div className="relative h-[260px] overflow-hidden bg-[#f3f4f6]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={
                      evento?.nome ||
                      'Evento'
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Ticket
                      className="text-[#d1d5db]"
                      size={54}
                    />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5">
                  <p className="mb-3 inline-flex rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#6b7280] backdrop-blur-md">
                    Seu pedido
                  </p>

                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111827]">
                    {evento?.nome ||
                      'Carregando evento...'}
                  </h2>
                </div>
              </div>

              <div className="space-y-6 p-6">
                <div className="space-y-3">
                  {Array.isArray(
                    evento?.ingressos
                  ) &&
                    evento.ingressos.map(
                      (ing: any) => {
                        const key = String(
                          ing?.id ?? ''
                        );

                        const qtd =
                          safeNumber(
                            quantidades[
                              key
                            ]
                          );

                        if (qtd <= 0)
                          return null;

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between rounded-2xl border border-[#edf0f4] bg-[#fafafa] p-4"
                          >
                            <div>
                              <p className="text-sm font-semibold text-[#111827]">
                                {qtd}x{' '}
                                {ing?.nome}
                              </p>

                              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#9ca3af]">
                                Ingresso
                              </p>
                            </div>

                            <strong className="text-sm text-[#ea580c]">
                              {money(
                                safeNumber(
                                  ing?.preco
                                ) * qtd,
                                moedaEvento
                              )}
                            </strong>
                          </div>
                        );
                      }
                    )}

                  {totalItens === 0 && (
                    <div className="rounded-2xl border border-[#edf0f4] bg-[#fafafa] p-5 text-sm text-[#9ca3af]">
                      Nenhum ingresso
                      selecionado.
                    </div>
                  )}
                </div>

                <div className="border-t border-[#eef0f4] pt-6">
                  <div className="mb-5 flex items-end justify-between gap-5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9ca3af]">
                      Total
                    </span>

                    <span className="text-4xl font-semibold tracking-[-0.07em] text-[#ea580c]">
                      {money(
                        totalGeral,
                        moedaEvento
                      )}
                    </span>
                  </div>

                 <button
                    onClick={
                      handleFinalizarCompra
                    }
                    disabled={
                      loading ||
                      !formData.nome ||
                      !formData.email ||
                      totalItens === 0
                    }
                    className={`flex h-[62px] w-full items-center justify-center gap-3 rounded-full text-[11px] font-black uppercase tracking-[0.22em] transition ${
                      loading ||
                      !formData.nome ||
                      !formData.email ||
                      totalItens === 0
                        ? 'cursor-not-allowed bg-[#eef1f5] text-[#9ca3af]'
                        : 'bg-[#ea580c] text-white hover:bg-[#c2410c]'
                    }`}
                  >
                    {loading ? (
                      <Loader2
                        className="animate-spin"
                        size={18}
                      />
                    ) : (
                      <>
                        <Lock size={14} />
                        Finalizar
                        pagamento
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
                    <CheckCircle2
                      size={13}
                      className="text-emerald-500"
                    />
                    Compra segura
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Navbar />

      <Suspense
        fallback={
          <div className="flex h-[70vh] flex-col items-center justify-center gap-4 bg-[#f6f7fb] text-[#111827]">
            <Loader2
              className="animate-spin text-[#9ca3af]"
              size={42}
            />

            <span className="text-[10px] uppercase tracking-[0.4em] text-[#9ca3af]">
              Preparando checkout
            </span>
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>

      <Footer />
    </div>
  );
}