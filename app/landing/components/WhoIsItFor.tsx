import { Check, X, Globe, Users, Star, Shield, Heart, Plane } from 'lucide-react';

export default function WhoIsItFor() {
  const targets = [
    { icon: <Globe />, text: "Expandir networking" },
    { icon: <Heart />, text: "Fazer conexões reais" },
    { icon: <Star />, text: "Viver experiência inesquecível" },
    { icon: <Shield />, text: "Participar de eventos com confiança" },
    { icon: <Users />, text: "Pertencer a uma comunidade" },
    { icon: <Heart />, text: "Encontrar companhia antes do evento" },
    { icon: <Plane />, text: "Viajar com segurança" },
    { icon: <Star />, text: "Criar memórias inesquecíveis" },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-16 tracking-tighter text-slate-950">Para quem quer:</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32">
          {targets.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-4 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-pink-600 shadow-sm border border-slate-100 group-hover:bg-pink-600 group-hover:text-white transition-all">
                {item.icon}
              </div>
              <span className="text-sm font-black text-slate-700 leading-tight uppercase tracking-tighter">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="text-center mb-24">
          <h2 className="text-5xl font-black italic text-pink-600 tracking-tighter">Conexão gera confiança.</h2>
          <h2 className="text-5xl font-black italic text-pink-600 tracking-tighter">Confiança gera liberdade.</h2>
        </div>

        <h3 className="text-4xl font-black text-center mb-12 tracking-tighter">Crie eventos que entregam <span className="text-pink-600 italic">conexão real.</span></h3>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-12 rounded-[3rem] border border-slate-200">
            <h4 className="text-slate-400 font-black uppercase tracking-widest text-sm mb-8">Sem a Linkah</h4>
            <ul className="space-y-5">
              {["Participantes desconectados", "Networking superficial", "Falta de engajamento", "Dificuldade de retenção"].map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                  <X size={18} className="text-red-400" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-12 rounded-[3rem] border-2 border-orange-500 shadow-2xl shadow-orange-500/10 scale-105">
            <h4 className="text-orange-500 font-black uppercase tracking-widest text-sm mb-8">Com a Linkah</h4>
            <ul className="space-y-5">
              {["Comunidade pré-evento", "Matching Inteligente", "Continuidade pós-evento", "Experiência premium"].map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-900 text-sm font-black">
                  <Check size={18} className="text-orange-500" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}