'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, Video, Loader2 } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { UserProfileModal } from './UserProfileModal'; // Importa o SEU componente original

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

/**
 * Função auxiliar para buscar a URL da foto do usuário em diversos campos possíveis.
 */
const getUserPhotoUrl = (user: any) => {
  if (!user) return DEFAULT_FOTO;
  
  const camposFoto = [
    'avatar', 'foto_perfil', 'usuario_foto', 'foto', 
    'profile_photo', 'user_photo', 'image', 'img', 'url_foto'
  ];

  for (const campo of camposFoto) {
    if (user[campo] && typeof user[campo] === 'string' && user[campo].trim() !== '' && user[campo] !== 'null' && user[campo] !== 'undefined') {
      return user[campo];
    }
  }

  if (user.usuario && typeof user.usuario === 'object') {
    return getUserPhotoUrl(user.usuario);
  }

  return DEFAULT_FOTO;
};

const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto === 'undefined' || foto.trim() === '' || foto === DEFAULT_FOTO) return DEFAULT_FOTO;
  
  foto = foto.trim();
  if (/^(https?:\/\/|blob:|data:)/.test(foto)) return foto;
  
  return `${API_URL.replace(/\/$/, '')}/${foto.replace(/^\//, '')}`;
};

export default function SalaLinkahSkype() {
  const { t }: any = useLanguage();
  const { id } = useParams();
  const router = useRouter();

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);
  const [chamadaAtiva, setChamadaAtiva] = useState(false);
  
  // Estados para o SEU UserProfileModal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const getUsuarioLogado = useCallback(() => {
    try {
      const userStorage = localStorage.getItem('@Linkah:User');
      const parsedUser = userStorage ? JSON.parse(userStorage) : null;
      const emailLogado = parsedUser?.email || localStorage.getItem('userEmail') || '';
      const token = localStorage.getItem('@Linkah:Token')?.replace(/['"]+/g, '') || '';

      return { userStorage, parsedUser, emailLogado, token };
    } catch (error) {
      return { userStorage: null, parsedUser: null, emailLogado: '', token: '' };
    }
  }, []);

  useEffect(() => {
    const { parsedUser, emailLogado, token } = getUsuarioLogado();
    
    if (!emailLogado) {
      router.push('/site/login');
      return;
    }

    if (parsedUser) {
      setDadosUsuario(parsedUser);
      setCarregando(false);
    }

    const atualizarPerfilEmBackground = async () => {
      try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/api/auth/perfil?email=${encodeURIComponent(emailLogado)}`, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          const userUpdated = { ...data, email: emailLogado };
          
          setDadosUsuario(userUpdated);
          localStorage.setItem('@Linkah:User', JSON.stringify(userUpdated));
          setCarregando(false);
        } else if (!parsedUser) {
          router.push('/site/login');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário em background:', error);
        if (!parsedUser) router.push('/site/login');
      }
    };

    atualizarPerfilEmBackground();
  }, [router, getUsuarioLogado]);

  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const atualizar = async () => {
      try {
        const minhaFoto = getUserPhotoUrl(dadosUsuario);
        const [resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`)
        ]);

        if (resOn.ok) {
          const on = await resOn.json();
          setUsuariosOnline(on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
        }

        if (resMsg.ok) {
          const msgs = await resMsg.json();
          setMensagens(msgs);
        }
      } catch (e) {
        console.error('Erro ao atualizar dados:', e);
      }
    };

    atualizar();
    const interval = setInterval(atualizar, 4000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const handleImageError = (e: any) => {
    if (e.target.src !== DEFAULT_FOTO) {
      e.target.src = DEFAULT_FOTO;
    }
  };

  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() && !imagemAnexada) return;

    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: getUserPhotoUrl(dadosUsuario),
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
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  const iniciarCall = async (destino: string) => {
    if (!dadosUsuario) return;
    const sala = `Call_${id}_${Date.now()}`;
    setChamadaAtiva(true);
    console.log(`Iniciando call para ${destino} na sala ${sala}`);
  };

  // Função para abrir o SEU modal de perfil
  const handleOpenProfile = (userName: string) => {
    setSelectedUserId(userName);
    setIsModalOpen(true);
  };

  if (carregando) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-red-500" size={48} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FCFBFA] overflow-hidden relative">
      {/* SEU UserProfileModal integrado */}
      <UserProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={selectedUserId} 
      />

      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-6"><h2>Membros</h2></div>
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {usuariosOnline.map((u, i) => (
            <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer"
                 onClick={() => handleOpenProfile(u.usuario_nome || u.nome)}>
              <img
                src={getImagemUrl(getUserPhotoUrl(u))}
                className="w-10 h-10 rounded-xl object-cover"
                onError={handleImageError}
                alt={u.usuario_nome || u.nome}
              />
              <span>{u.usuario_nome || u.nome}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <main className="flex-1 flex flex-col bg-white">
        <header className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h1>Chat Geral</h1>
          <button onClick={() => iniciarCall('Todos')}><Video /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {mensagens.map((m, i) => {
            const souEu = m.usuario_nome === dadosUsuario.nome;

            const userObj = usuariosOnline.find(u => u.usuario_nome === m.usuario_nome) || m || (souEu ? dadosUsuario : null);
            const userAvatar = getUserPhotoUrl(userObj);
            const imgLink = getImagemUrl(userAvatar);

            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-3 items-end`}>
                {!souEu && (
                  <img
                    src={imgLink}
                    className="w-10 h-10 rounded-xl object-cover cursor-pointer"
                    onError={handleImageError}
                    alt={m.usuario_nome}
                    onClick={() => handleOpenProfile(m.usuario_nome)}
                  />
                )}
                <div className={`p-3 rounded-xl max-w-xs ${souEu ? 'bg-red-100' : 'bg-gray-100'}`}>
                  {m.texto && <p>{m.texto}</p>}
                  {m.imagem && <img src={getImagemUrl(m.imagem)} className="w-48 h-48 object-cover mt-2" onError={handleImageError} />}
                </div>
                {souEu && (
                  <img
                    src={imgLink}
                    className="w-10 h-10 rounded-xl object-cover cursor-pointer"
                    onError={handleImageError}
                    alt={m.usuario_nome}
                    onClick={() => handleOpenProfile(dadosUsuario.nome)}
                  />
                )}
              </div>
            );
          })}
          <div ref={scrollRef}></div>
        </div>

        <form onSubmit={enviarMensagem} className="p-6 flex items-center gap-4 border-t border-slate-50">
          <input
            type="text"
            value={novoTexto}
            onChange={e => setNovoTexto(e.target.value)}
            placeholder="Escreva aqui..."
            className="flex-1 p-3 border rounded-xl"
          />
          <button type="submit"><Send /></button>
        </form>
      </main>
    </div>
  );
}
