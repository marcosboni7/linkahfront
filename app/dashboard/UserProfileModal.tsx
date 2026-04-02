'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, Video, Loader2, Bug, X } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
// Importe o componente do Modal (ajuste o caminho se necessário)
import { UserProfileModal } from '@/app/components/UserProfileModal'; 

const API_URL = 'https://api-linkah.onrender.com';
const DEFAULT_FOTO = 'https://i.pinimg.com/originals/ec/a5/a7/eca5a7c991e8fa52554e953593faba2d.gif';

const getImagemUrl = (foto?: string | null) => {
  if (!foto || foto === 'null' || foto === 'undefined' || foto.trim() === '') return DEFAULT_FOTO;
  if (/^(http|https|blob|data):/.test(foto)) return foto; 
  const cleanBase = API_URL.replace(/\/$/, '');
  const cleanPath = foto.replace(/^\//, '');
  return `${cleanBase}/${cleanPath}`;
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
  
  // ESTADOS DO MODAL DE PERFIL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const avatarMap = Object.fromEntries(
    usuariosOnline.map(u => [u.usuario_nome, getImagemUrl(u.foto_perfil || u.avatar || u.usuario_foto || u.foto)])
  );

  const handleOpenProfile = (nome: string) => {
    setSelectedUser(nome);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      setDadosUsuario(JSON.parse(savedUser));
    } else router.push('/site/login');
  }, [router]);

  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    const atualizar = async () => {
      try {
        const minhaFoto = dadosUsuario.foto_perfil || dadosUsuario.avatar || '';
        const [resMsg, resOn] = await Promise.all([
          fetch(`${API_URL}/api/comunidades/${id}?t=${Date.now()}`),
          fetch(`${API_URL}/api/comunidades/presenca/${id}?usuario_nome=${dadosUsuario.nome}&foto=${minhaFoto}`)
        ]);

        if (resOn.ok) {
          const on = await resOn.json();
          setUsuariosOnline(on.filter((u: any) => u.usuario_nome !== dadosUsuario.nome));
        }
        if (resMsg.ok) setMensagens(await resMsg.json());
        setCarregando(false);
      } catch (e) { console.error(e); }
    };

    atualizar();
    const interval = setInterval(atualizar, 4000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens]);

  const enviarMensagem = async (e: any) => {
    e.preventDefault();
    if (!novoTexto.trim() && !imagemAnexada) return;

    const payload = {
      evento_id: Number(id),
      usuario_nome: dadosUsuario.nome,
      usuario_foto: dadosUsuario?.foto_perfil || dadosUsuario?.foto || null,
      texto: novoTexto,
      imagem: imagemAnexada,
      tipo: 'chat'
    };

    setNovoTexto('');
    try {
      await fetch(`${API_URL}/api/comunidades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) { console.error(err); }
  };

  if (carregando) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-red-500" size={48} /></div>;

  return (
    <div className="flex h-screen bg-[#FCFBFA] overflow-hidden">
      
      {/* MODAL DE PERFIL PÚBLICO */}
      <UserProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={selectedUser} 
      />

      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col bg-white">
        <div className="p-6"><h2 className="font-bold text-xl">Membros</h2></div>
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {usuariosOnline.map((u, i) => (
            <div 
              key={i} 
              onClick={() => handleOpenProfile(u.usuario_nome)}
              className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all"
            >
              <img
                src={getImagemUrl(u.foto_perfil || u.avatar || u.usuario_foto || u.foto)}
                className="w-10 h-10 rounded-xl object-cover shadow-sm"
                alt=""
              />
              <span className="font-medium text-sm">{u.usuario_nome}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <main className="flex-1 flex flex-col bg-white relative">
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <h1 className="font-bold">Chat Geral</h1>
          <button className="p-2 hover:bg-slate-50 rounded-full transition-colors"><Video size={20} className="text-slate-400" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {mensagens.map((m, i) => {
            const souEu = m.usuario_nome === dadosUsuario.nome;
            const avatarMsg = souEu
              ? getImagemUrl(dadosUsuario.foto_perfil || dadosUsuario.foto)
              : avatarMap[m.usuario_nome] || DEFAULT_FOTO;

            return (
              <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'} gap-3 items-end`}>
                {!souEu && (
                  <img 
                    src={avatarMsg} 
                    onClick={() => handleOpenProfile(m.usuario_nome)}
                    className="w-10 h-10 rounded-xl object-cover cursor-pointer hover:scale-105 transition-transform" 
                    alt="" 
                  />
                )}
                
                <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
                   {!souEu && <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1">{m.usuario_nome}</span>}
                   <div className={`p-4 rounded-2xl max-w-sm shadow-sm ${souEu ? 'bg-red-500 text-white rounded-br-none' : 'bg-slate-50 text-slate-800 rounded-bl-none border border-slate-100'}`}>
                    {m.texto && <p className="text-sm">{m.texto}</p>}
                    {m.imagem && <img src={getImagemUrl(m.imagem)} className="w-full rounded-lg mt-2" alt="" />}
                  </div>
                </div>

                {souEu && (
                  <img 
                    src={avatarMsg} 
                    onClick={() => handleOpenProfile(m.usuario_nome)}
                    className="w-10 h-10 rounded-xl object-cover cursor-pointer hover:scale-105 transition-transform" 
                    alt="" 
                  />
                )}
              </div>
            );
          })}
          <div ref={scrollRef}></div>
        </div>

        <form onSubmit={enviarMensagem} className="p-6 flex items-center gap-4 border-t border-slate-50 bg-white">
          <input
            type="text"
            value={novoTexto}
            onChange={e => setNovoTexto(e.target.value)}
            placeholder="Escreva aqui..."
            className="flex-1 p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
          />
          <button type="submit" className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
            <Send size={20} />
          </button>
        </form>
      </main>
    </div>
  );
}