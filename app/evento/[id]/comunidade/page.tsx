'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Search, Paperclip, Send, Video, Phone,
  X, Loader2, Sparkles, ChevronLeft,
  Instagram, Linkedin, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import Link from 'next/link';

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto === 'undefined' || foto.trim() === '') return DEFAULT_FOTO;
  if (/^(http|blob|data):/.test(foto)) return foto;
  const cleanBase = API_URL.replace(/\/$/, '');
  const cleanPath = foto.replace(/^\//, '');
  return `${cleanBase}/${cleanPath}`;
};

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

  // --- FUNÇÕES DE AÇÃO ---
  const handleImageError = (e: any, local: string) => {
    e.target.src = DEFAULT_FOTO;
  };

  const iniciarCall = async (destino: string) => {
    if (!dadosUsuario) return;
    const sala = `Call_${id}_${Date.now()}`;
    const fotoCall = dadosUsuario.foto || dadosUsuario.usuario_foto || null;
    try {
      await fetch(`${API_URL}/api/comunidades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: Number(id),
          usuario_nome: dadosUsuario.nome,
          usuario_foto: fotoCall,
          texto: `CALL_INVITE|${destino}|${sala}`,
          tipo: 'status'
        })
      });
      setNomeSalaCall(sala);
      setChamadaAtiva(true);
    } catch (err) { console.error(err); }
  };

  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() && !imagemAnexada) return;

    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: dadosUsuario?.foto || dadosUsuario?.usuario_foto || null,
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
    } catch (err) { console.error(err); }
  };

  const abrirPerfil = async (nome: string) => {
    setCarregandoPerfil(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/perfil-publico?nome=${encodeURIComponent(nome)}`);
      if (res.ok) setUsuarioSelecionado(await res.json());
      else setUsuarioSelecionado({ nome, bio: null });
    } catch (err) {
      setUsuarioSelecionado({ nome, bio: null });
    } finally {
      setCarregandoPerfil(false);
    }
  };

  // --- EFFECTS ---
  // 1️⃣ Carrega usuário do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) setDadosUsuario(JSON.parse(savedUser));
    else router.push('/site/login');
  }, [router]);

  // 2️⃣ Atualiza a imagem anexada automaticamente
  useEffect(() => {
    if (dadosUsuario) {
      const foto = dadosUsuario.foto || dadosUsuario.usuario_foto || null;
      setImagemAnexada(getImagemUrl(foto));
    }
  }, [dadosUsuario]);

  // 3️⃣ Atualiza dados do chat e presença
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;
    const atualizar = async () => {
      try {
        const minhaFoto = dadosUsuario.foto || dadosUsuario.usuario_foto || '';
        const [resEv, resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/eventos/${id}`),
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`)
        ]);

        if (resEv.ok) setDadosEvento(await resEv.json());
        if (resOn.ok) {
          const on = await resOn.json();
          if (Array.isArray(on)) setUsuariosOnline(on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
        }

        if (resMsg.ok) {
          const msgs = await resMsg.json();
          setMensagens(msgs);
          const AGORA = Date.now();
          msgs.slice(-5).forEach((msg: any) => {
            if (msg.texto?.includes("CALL_INVITE|")) {
              const partes = msg.texto.split("|");
              const destino = partes[1]?.trim().toLowerCase();
              if (destino === dadosUsuario.nome.toLowerCase() && (AGORA - new Date(msg.criado_em).getTime()) / 1000 < 25 && !chamadaAtiva) {
                setConviteRecebido({ de: msg.usuario_nome, sala: partes[2], foto: msg.usuario_foto || msg.foto });
              }
            }
          });
        }

        setCarregando(false);
      } catch (e) { console.error(e); }
    };

    atualizar();
    const int = setInterval(atualizar, 4000);
    return () => clearInterval(int);
  }, [id, dadosUsuario, chamadaAtiva]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  if (carregando) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#ff4d4d]" size={48} /></div>;

  // --- JSX ---
  return (
    <div className="flex h-screen bg-[#FCFBFA] overflow-hidden text-slate-900 font-sans">
      {/* ... Resto do JSX igual ao que você já tinha ... */}
      {/* Lembre-se de usar getImagemUrl sempre que exibir uma imagem */}
    </div>
  );
}