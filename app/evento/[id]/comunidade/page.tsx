'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Paperclip, Send, Video, Phone, 
  X, Loader2, Sparkles, ChevronLeft,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import Link from 'next/link';

const API_URL = 'https://api-linkah.onrender.com';

export default function SalaLinkahSkype() {

  const { t }: any = useLanguage();
  const { id } = useParams();
  const router = useRouter();
  
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  const [chamadaAtiva, setChamadaAtiva] = useState(false);
  const [nomeSalaCall, setNomeSalaCall] = useState('');
  const [conviteRecebido, setConviteRecebido] = useState<any>(null);

  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);

  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =============================
  // FUNÇÃO PARA PEGAR AVATAR
  // =============================
  const pegarAvatar = (user: any) => {
    return user?.avatar || user?.foto || user?.usuario_foto || null;
  };

  // =============================
  // AUTENTICAÇÃO
  // =============================
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      setDadosUsuario(JSON.parse(savedUser));
    } else {
      router.push('/site/login');
    }
  }, [router]);

  // =============================
  // SYNC LOOP
  // =============================
  useEffect(() => {

    if (!id || !dadosUsuario?.nome) return;

    const atualizar = async () => {

      try {

        const minhaFoto = pegarAvatar(dadosUsuario) || '';

        const [resEv, resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/eventos/${id}`),
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`)
        ]);

        if (resEv.ok) setDadosEvento(await resEv.json());

        if (resOn.ok) {

          const on = await resOn.json();

          setUsuariosOnline(
            on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome)
          );
        }

        if (resMsg.ok) {

          const msgs = await resMsg.json();
          setMensagens(msgs);

          const AGORA = Date.now();
          const MEU_NOME_LIMPO = dadosUsuario.nome.trim().toLowerCase();

          msgs.slice(-5).forEach((msg: any) => {

            if (msg.texto?.includes("CALL_INVITE|")) {

              const partes = msg.texto.split("|");
              const destino = partes[1]?.trim().toLowerCase();
              const salaSugerida = partes[2];

              const dataMsg = new Date(msg.criado_em).getTime();
              const segundosPassados = (AGORA - dataMsg) / 1000;

              if (
                destino === MEU_NOME_LIMPO &&
                segundosPassados < 25 &&
                msg.usuario_nome.trim().toLowerCase() !== MEU_NOME_LIMPO &&
                !chamadaAtiva &&
                conviteRecebido?.sala !== salaSugerida
              ) {

                setConviteRecebido({
                  de: msg.usuario_nome,
                  sala: salaSugerida,
                  foto: msg.usuario_foto
                });

              }

            }

          });

        }

        setCarregando(false);

      } catch (e) {

        console.error("Erro sync:", e);

      }

    };

    atualizar();

    const int = setInterval(atualizar, 4000);

    return () => clearInterval(int);

  }, [id, dadosUsuario, chamadaAtiva, conviteRecebido]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // =============================
  // ABRIR PERFIL
  // =============================
  const abrirPerfil = async (nome: string) => {

    setCarregandoPerfil(true);

    try {

      const res = await fetch(`${API_URL}/api/auth/perfil-publico?nome=${encodeURIComponent(nome)}`);

      if (res.ok) {

        const data = await res.json();
        setUsuarioSelecionado(data);

      } else {

        setUsuarioSelecionado({ nome });

      }

    } catch {

      setUsuarioSelecionado({ nome });

    } finally {

      setCarregandoPerfil(false);

    }

  };

  // =============================
  // ENVIAR MENSAGEM
  // =============================
  const enviarMensagem = async (e: any) => {

    e.preventDefault();

    if (!novoTexto.trim() && !imagemAnexada) return;

    const payload = {

      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: pegarAvatar(dadosUsuario),
      texto: novoTexto,
      imagem: imagemAnexada,
      tipo: 'chat'

    };

    setNovoTexto('');
    setImagemAnexada(null);

    try {

      await fetch(`${API_URL}/api/comunidades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

    } catch (err) {

      console.error(err);

    }

  };

  // =============================
  // INICIAR CALL
  // =============================
  const iniciarCall = async (destino: string) => {

    if (!dadosUsuario) return;

    const sala = `Call_${id}_${Date.now()}`;

    await fetch(`${API_URL}/api/comunidades/enviar`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({

        evento_id: Number(id),
        usuario_nome: dadosUsuario.nome,
        usuario_foto: pegarAvatar(dadosUsuario),
        texto: `CALL_INVITE|${destino}|${sala}`,
        tipo: 'status'

      })

    });

    setNomeSalaCall(sala);
    setChamadaAtiva(true);

  };

  if (carregando) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FCFBFA]">
      <Loader2 className="animate-spin text-[#ff4d4d]" size={48} />
      <p className="mt-6 font-bold text-slate-400 text-xs uppercase tracking-[0.3em]">
        Sincronizando Linkah...
      </p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FCFBFA] overflow-hidden text-slate-900 font-sans">

      {/* CHAT */}

      <main className="flex-1 flex flex-col">

        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {mensagens.map((m, i) => {

            if (m.tipo === 'status' || m.texto?.includes("CALL_INVITE|")) return null;

            const souEu = m.usuario_nome === dadosUsuario.nome;

            return (

              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>

                <div className="flex gap-3 max-w-[80%]">

                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200">

                    {(m.usuario_foto) ? (
                      <img src={m.usuario_foto} className="w-full h-full object-cover" />
                    ) : m.usuario_nome.charAt(0)}

                  </div>

                  <div>

                    <span className="text-xs font-bold">
                      {souEu ? 'Você' : m.usuario_nome}
                    </span>

                    <div className="bg-white border p-3 rounded-xl">

                      {m.imagem && (
                        <img src={m.imagem} className="mb-2 rounded-lg max-h-60" />
                      )}

                      <p>{m.texto}</p>

                    </div>

                  </div>

                </div>

              </div>

            )

          })}

          <div ref={scrollRef} />

        </div>

        {/* INPUT */}

        <footer className="p-6 border-t">

          <form onSubmit={enviarMensagem} className="flex gap-2">

            <button type="button" onClick={() => fileInputRef.current?.click()}>
              <Paperclip size={20} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={(e) => {

                const f = e.target.files?.[0];

                if (f) {

                  const r = new FileReader();

                  r.onloadend = () => setImagemAnexada(r.result as string);

                  r.readAsDataURL(f);

                }

              }}
            />

            <input
              value={novoTexto}
              onChange={e => setNovoTexto(e.target.value)}
              className="flex-1 border rounded-xl px-4 py-2"
              placeholder="Enviar mensagem..."
            />

            <button type="submit" className="bg-black text-white p-3 rounded-xl">
              <Send size={18} />
            </button>

          </form>

        </footer>

      </main>

    </div>
  );
}