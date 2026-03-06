import { Search, ShoppingBag, MessageSquare, Shield, Smile, Plus, Zap, Users, Gift, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  const stepsPart = [
    { icon: <Search size={20}/>, text: "Escolhe o evento" },
    { icon: <ShoppingBag size={20}/>, text: "Compra o ticket" },
    { icon: <MessageSquare size={20}/>, text: "Conecta via Comunidade" },
    { icon: <Shield size={20}/>, text: "Viaja com segurança" },
    { icon: <Smile size={20}/>, text: "Vive Experiência Inesquecível" },
  ];

  const stepsOrg = [
    { icon: <Plus size={20}/>, text: "Cria o evento" },
    { icon: <Zap size={20}/>, text: "Ativa comunidade" },
    { icon: <Users size={20}/>, text: "Engaja os participantes" },
    { icon: <Gift size={20}/>, text: "Entrega valor" },
    { icon: <TrendingUp size={20}/>, text: "Multiplica resultados" },
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-6xl font-black text-center mb-24 tracking-tighter">Como <span className="text-pink-600 underline decoration-orange-500">funciona</span></h2>
        
        <div className="grid md:grid-cols-2 gap-16">
          {/* PARTICIPANTE */}
          <div className="bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100">
            <h4 className="text-center font-black text-blue-900 mb-10 uppercase tracking-[0.3em] text-xs">Participante</h4>
            <div className="space-y-4">
              {stepsPart.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:scale-[1.02] transition-transform cursor-default">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">{s.icon}</div>
                    <span className="font-black text-slate-800 text-sm uppercase tracking-tighter">{s.text}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 italic uppercase">Passo {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ORGANIZADOR */}
          <div className="bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100">
            <h4 className="text-center font-black text-orange-600 mb-10 uppercase tracking-[0.3em] text-xs">Organizador</h4>
            <div className="space-y-4">
              {stepsOrg.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:scale-[1.02] transition-transform cursor-default">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-pink-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">{s.icon}</div>
                    <span className="font-black text-slate-800 text-sm uppercase tracking-tighter">{s.text}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 italic uppercase">Passo {i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}