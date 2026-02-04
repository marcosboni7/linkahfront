'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Search, Paperclip, Send, Video, Phone, 
  MoreVertical, Smile, Mic, ChevronLeft, Settings, 
  X, Plus, Image as ImageIcon 
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

  // 1. CARREGAR UTILIZADOR
  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) setDadosUsuario(JSON.parse(savedUser));
    else router.push('/site/login');
  }, [router]);

  // 2. LÓGICA DE PRESENÇA (ENTRADA E SAÍDA INSTANTÂNEA)
  useEffect(() => {
    if (!id || !dadosUsuario?.nome) return;

    // AVISAR ENTRADA
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
            texto: "📢 entrou", 
            tipo: "presenca" 
          })
        });
      } catch (e) { console.error(e); }
    };

    // AVISAR SAÍDA (QUANDO FECHA A ABA OU SAI DA PÁGINA)
    const avisarSaida = () => {
      const url = 'https://linkah-api.onrender.com/api/comunidade/enviar';
      const payload = JSON.stringify({
        evento_id: Number(id),
        usuario_nome: dadosUsuario.nome,
        texto: "❌ saiu",
        tipo: "presenca"
      });
      // sendBeacon é o comando especial para enviar dados mesmo ao fechar a aba
      navigator.sendBeacon(url, payload);
    };

    const atualizarDados = async () => {
      try {
        const resEv = await fetch(`https://linkah-api.onrender.com/api/eventos/${id}`);
        if (resEv.ok) setDadosEvento(await resEv.json());

        const resMsg = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}?t=${Date.now()}`);
        if (resMsg.ok) {
          const lista = await resMsg.json();
          setMensagens(lista);

          // FILTRO DE QUEM ESTÁ REALMENTE ONLINE
          // Regra: Pegamos a ÚLTIMA mensagem de cada utilizador nesta sala. 
          // Se for "entrou" ou uma mensagem comum, está online. Se for "saiu", removemos.
          const ultimosSinais: any = {};
          lista.forEach((m: any) => {
            ultimosSinais[m.usuario_nome] = m.texto;
          });

          const ativos = Object.keys(ultimosSinais)
            .filter(nome => !ultimosSinais[nome].includes("❌ saiu"))
            .map(nome => ({ usuario_nome: nome }));

          setUsuariosOnline(ativos);
        }
        setCarregando(false);
      } catch (err) { console.error(err); }
    };

    avisarEntrada();
    atualizarDados();
    const interval = setInterval(atualizarDados, 3000);

    // Adiciona o evento de fechar janela
    window.addEventListener('beforeunload', avisarSaida);

    return () => {
      avisarSaida(); // Avisa saída se mudar de rota dentro do app
      window.removeEventListener('beforeunload', avisarSaida);
      clearInterval(interval);
    };
  }, [id, dadosUsuario]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens]);

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim() && !imagemAnexada) return;
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

  if (carregando) return <div className="h-screen flex items-center justify-center text-[#d6006d] font-bold">LINKAH...</div>;

  return (
    <div className="flex h-screen bg-white text-slate-700 font-sans overflow-hidden">
      
      {/* SIDEBAR - LISTA DINÂMICA */}
      <aside className="w-80 bg-[#f8f9fa] border-r border-slate-200 flex flex-col hidden lg:flex shrink-0">
        <div className="p-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#d6006d] flex items-center justify-center text-white font-bold border-2 border-white shadow-sm uppercase">
                {dadosUsuario?.nome?.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="font-bold text-sm truncate">{dadosUsuario?.nome}</div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilizadores na Sala ({usuariosOnline.length})</p>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {usuariosOnline.map((user, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm mb-1">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase">
                  {user.usuario_nome.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#f8f9fa] rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-700 truncate">{user.usuario_nome}</h4>
                <p className="text-[10px] text-green-600 font-bold uppercase">No Chat</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT */}
      <main className="flex-1 flex flex-col bg-white">
        <header className="px-6 py-3 border-b border-slate-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="lg:hidden text-slate-400"><ChevronLeft /></button>
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#d6006d] font-black border border-slate-200 uppercase">
                {dadosEvento?.nome?.charAt(0) || 'L'}
             </div>
             <div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">{dadosEvento?.nome}</h3>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Sincronizado</p>
             </div>
          </div>
          <MoreVertical size={20} className="text-slate-300" />
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-50/20">
          {mensagens.map((msg, idx) => {
            const souEu = dadosUsuario?.nome === msg.usuario_nome;
            const ehPresenca = msg.texto?.includes("📢") || msg.texto?.includes("❌");

            if (ehPresenca) return (
              <div key={idx} className="flex justify-center my-2">
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-slate-100">
                  {msg.usuario_nome} {msg.texto}
                </span>
              </div>
            );

            return (
              <div key={idx} className={`flex gap-3 ${souEu ? 'flex-row-reverse' : 'flex-row'} items-start`}>
                <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase border border-white">
                  {msg.usuario_nome.charAt(0)}
                </div>
                <div className={`flex flex-col ${souEu ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <span className="text-[11px] font-bold text-slate-400 mb-1 px-1">{msg.usuario_nome}</span>
                  <div className={`px-4 py-2 rounded-2xl text-[14px] shadow-sm ${
                    souEu ? 'bg-[#d6006d] text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.imagem && <img src={msg.imagem} className="rounded-lg mb-2 max-h-72 w-full object-cover" />}
                    {msg.texto && <p>{msg.texto}</p>}
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
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400"><Paperclip size={20} /></button>
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
                  placeholder="Escreva sua mensagem..." className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-slate-700" 
                />
              </div>
            </div>
            <button type="submit" className="bg-[#d6006d] text-white p-3 rounded-full shadow-lg hover:bg-[#b0005a] transition-all">
              <Send size={20} fill="currentColor" />
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}