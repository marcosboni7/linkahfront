'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, Video, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

/**
 * Função auxiliar para buscar a URL da foto do usuário em diversos campos possíveis.
 * Prioriza 'avatar' que é o campo usado na página de perfil.
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
  const [perfilAberto, setPerfilAberto] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Função para obter dados do localStorage de forma segura
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

  // Efeito para carregar e sincronizar os dados do usuário logado
  useEffect(() => {
    const carregarDadosUsuario = async () => {
      const { emailLogado, token } = getUsuarioLogado();
      if (!emailLogado) {
        router.push('/site/login');
        return;
      }

      try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        // Busca o perfil completo para garantir que temos a foto (avatar)
        const response = await fetch(`${API_URL}/api/auth/perfil?email=${encodeURIComponent(emailLogado)}`, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          const userUpdated = { ...data, email: emailLogado };
          setDadosUsuario(userUpdated);
          // Sincroniza o localStorage para que outros componentes também tenham a foto
          localStorage.setItem('@Linkah:User', JSON.stringify(userUpdated));
        } else {
          // Se falhar a API, tenta usar o que tem no localStorage como fallback
          const { parsedUser } = getUsuarioLogado();
          if (parsedUser) setDadosUsuario(parsedUser);
          else router.push('/site/login');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        const { parsedUser } = getUsuarioLogado();
        if (parsedUser) setDadosUsuario(parsedUser);
      }
    };
    carregarDadosUsuario();
  }, [router, getUsuarioLogado]);

  // Efeito para atualizar mensagens e usuários online
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

        setCarregando(false);
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

  if (carregando) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-red-500" size={48} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FCFBFA] overflow-hidden relative">
      {/* Modal de perfil */}
      {perfilAberto && (
        <div className="absolute inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 relative">
            <button className="absolute top-3 right-3" onClick={() => setPerfilAberto(null)}><X /></button>
            <img 
              src={getImagemUrl(getUserPhotoUrl(perfilAberto))} 
              className="w-20 h-20 rounded-full mx-auto object-cover" 
              onError={handleImageError}
            />
            <h2 className="text-center mt-3 font-bold">{perfilAberto.usuario_nome || perfilAberto.nome}</h2>
            {perfilAberto.bio && <p className="mt-2 text-center">{perfilAberto.bio}</p>}
            {perfilAberto.linkedin && (
              <a href={perfilAberto.linkedin} target="_blank" className="block mt-3 text-center text-blue-600 underline">LinkedIn</a>
            )}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-6"><h2>Membros</h2></div>
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {usuariosOnline.map((u, i) => (
            <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer"
                 onClick={() => setPerfilAberto(u)}>
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

            // Busca o objeto de usuário para pegar a foto mais atualizada
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
                    onClick={() => setPerfilAberto(m)}
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
                    onClick={() => setPerfilAberto(m)}
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
