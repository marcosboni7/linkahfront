'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Search, Paperclip, Send, Video, Phone, 
  MoreVertical, Smile, Mic, ChevronLeft, Settings, 
  Users, X, Plus, Image as ImageIcon 
} from 'lucide-react';

export default function SalaLinkahSkype() {
  const { id } = useParams();
  const router = useRouter();
  
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [dadosEvento, setDadosEvento] = useState<any>(null);
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  const [novoTexto, setNovoTexto] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jaEnviouEntrada = useRef(false);
  const listaAnteriorOnline = useRef<string[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) setDadosUsuario(JSON.parse(savedUser));
    else router.push('/site/login');
  }, [router]);

  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    // AVISO DE ENTRADA
    const avisarEntrada = async () => {
      if (jaEnviouEntrada.current) return;
      jaEnviouEntrada.current = true;
      try {
        await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            evento_id: Number(id), 
            usuario_nome: dadosUsuario.nome, 
            texto: "📢 entrou na sala",
            tipo: "sistema" 
          })
        });
      } catch (e) { console.error(e); }
    };

    const atualizarDados = async () => {
      try {
        const resEv = await fetch(`https://linkah-api.onrender.com/api/eventos/${id}`);
        if (resEv.ok) setDadosEvento(await resEv.json());

        const resMsg = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`);
        if (resMsg.ok) {
          const lista = await resMsg.json();
          setMensagens(lista);

          // LÓGICA DE ONLINE E DETECTOR DE SAÍDA
          const AGORA = Date.now();
          const TEMPO_LIMITE = 3 * 60 * 1000; // 3 minutos de inatividade = saiu

          const atuaisOnline = lista.reduce((acc: any[], curr: any) => {
            const horario = new Date(curr.criado_em).getTime();
            if ((AGORA - horario) < TEMPO_LIMITE && !acc.find(u => u.usuario_nome === curr.usuario_nome)) {
              acc.push({ usuario_nome: curr.usuario_nome });
            }
            return acc;
          }, []);

          // Verificar quem saiu (estava na lista anterior mas não está na atual)
          const nomesAtuais = atuaisOnline.map((u: any) => u.usuario_nome);
          listaAnteriorOnline.current.forEach(nomeAntigo => {
            if (!nomesAtuais.includes(nomeAntigo) && nomeAntigo !== dadosUsuario.nome) {
               // Adiciona aviso visual temporário de saída nas mensagens locais
               console.log(`${nomeAntigo} saiu da sala`);
            }
          });
          
          listaAnteriorOnline.current = nomesAtuais;
          setUsuariosOnline(atuaisOnline);
        }
        setCarregando(false);
      } catch (err) { console.error(err); }
    };

    avisarEntrada();
    atualizarDados();
    const interval = setInterval(atualizarDados, 5000);
    return () => clearInterval(interval);
  }, [id, dadosUsuario]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens]);

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!novoTexto.trim() && !imagemAnexada)) return;
    const bt = novoTexto; const bi = imagemAnexada;
    setNovoTexto(''); setImagemAnexada(null);
    try {
      await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: Number(id), usuario_nome: dadosUsuario.nome, texto: bt, imagem: bi })
      });
    } catch (err) { setNovoTexto(bt); setImagemAnexada(bi); }
  };

  if (carregando) return <div className="h-screen flex items-center justify-center text-[#d6006d] font-bold">CARREGANDO...</div>;

  return (
    <div className="flex h-screen bg-white text-slate-700 font-sans overflow-hidden">
      
      {/* BARRA LATERAL SKYPE */}
      <aside className="w-80 bg-[#f8f9fa] border-r border-slate-200 flex flex-col hidden lg:flex shrink-0">
        <div className="p-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#d6006d] flex items-center justify-center text-white font-bold border-2 border-white uppercase shadow-sm">
                {dadosUsuario?.nome?.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="font-bold text-sm truncate">{dadosUsuario?.nome}</div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Buscar contatos..." className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-pink-100" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativos agora ({usuariosOnline.length})</p>
          <div className="px-2 space-y-0.5">
            {usuariosOnline.map((user, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 hover:bg-white rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-100">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase shadow-sm">
                    {user.usuario_nome.charAt(0)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#f8f9fa] rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-700 truncate">{user.usuario_nome}</h4>
                  <p className="text-[10px] text-green-600 font-bold uppercase">Disponível</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ÁREA CENTRAL DO CHAT */}
      <main className="flex-1 flex flex-col bg-white">
        <header className="px-6 py-3 border-b border-slate-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#d6006d] font-black border border-slate-200 uppercase">
                {dadosEvento?.nome?.charAt(0) || 'L'}
             </div>
             <div>
                <h3 className="font-bold text-slate-800 text-sm">{dadosEvento?.nome || 'Comunidade'}</h3>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Conversa em tempo real</p>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-4 text-sky-500">
             <Video size={20} className="cursor-pointer hover:bg-slate-50 rounded-full p-0.5" />
             <Phone size={18} className="cursor-pointer hover:bg-slate-50 rounded-full p-0.5" />
             <MoreVertical size={20} className="text-slate-300" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-50/20">
          {mensagens.map((msg, idx) => {
            const souEu = dadosUsuario?.nome === msg.usuario_nome;
            const ehSistema = msg.texto?.includes("📢");

            if (ehSistema) return (
              <div key={idx} className="flex justify-center my-4 animate-in fade-in zoom-in duration-300">
                <span className="bg-white/80 backdrop-blur shadow-sm text-slate-400 text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest border border-slate-100">
                  {msg.usuario_nome} {msg.texto}
                </span>
              </div>
            );

            return (
              <div key={idx} className={`flex gap-3 ${souEu ? 'flex-row-reverse' : 'flex-row'} items-start`}>
                <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase border border-white shadow-sm">
                  {msg.usuario_nome.charAt(0)}
                </div>
                <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <span className="text-[11px] font-bold text-slate-400 mb-1 px-1">{msg.usuario_nome}</span>
                  <div className={`px-4 py-2 rounded-2xl text-[14px] shadow-sm transition-all ${
                    souEu ? 'bg-[#d6006d] text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.imagem && <img src={msg.imagem} className="rounded-lg mb-2 max-h-72 w-full object-cover" />}
                    {msg.texto && <p className="leading-relaxed">{msg.texto}</p>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        <footer className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={enviarMensagem} className="max-w-4xl mx-auto flex items-end gap-2">
            <div className="flex-1 bg-[#F3F4F6] rounded-2xl p-2 flex flex-col focus-within:bg-white transition-all border border-transparent focus-within:border-slate-200">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-[#d6006d]"><Paperclip size={20} /></button>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setImagemAnexada(reader.result as string);
                        reader.readAsDataURL(file);
                    }
                }} />
                <input 
                  type="text" value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)}
                  placeholder="Envie uma mensagem..." className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-slate-700 placeholder:text-slate-400" 
                />
                <Smile size={20} className="text-slate-400 cursor-pointer p-0.5" />
              </div>
            </div>
            <button type="submit" className="bg-[#d6006d] text-white p-3 rounded-full shadow-lg shadow-pink-100 hover:bg-[#b0005a] active:scale-90 transition-all">
              <Send size={20} fill="currentColor" />
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}