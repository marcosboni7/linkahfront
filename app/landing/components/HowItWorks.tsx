import { CalendarDays, Ticket, Users, Plane, PartyPopper, PlusCircle, Megaphone, Zap, Gift, RefreshCw } from 'lucide-react';

export default function HowItWorks() {
  const stepsPart = [
    { icon: <CalendarDays size={20}/>, text: "Escolhe o evento" },
    { icon: <Ticket size={20}/>, text: "Compra o ticket" },
    { icon: <Users size={20}/>, text: "Conecta via Comunidade" },
    { icon: <Plane size={20}/>, text: "Viaja com segurança" },
    { icon: <PartyPopper size={20}/>, text: "Vive Experiência Inesquecível" },
  ];

  const stepsOrg = [
    { icon: <PlusCircle size={20}/>, text: "Cria o evento" },
    { icon: <Megaphone size={20}/>, text: "Ativa comunidade" },
    { icon: <Zap size={20}/>, text: "Engaja os participantes" },
    { icon: <Gift size={20}/>, text: "Entrega valor" },
    { icon: <RefreshCw size={20}/>, text: "Multiplica resultados" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        {/* Título com degradê sutil no 'funciona' */}
        <h2 className="text-[44px] font-bold text-center mb-20 tracking-tight text-[#1a1a1a]">
          Como <span className="text-[#ff4d6d]">funciona</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
          {/* COLUNA PARTICIPANTE */}
          <div className="flex flex-col gap-4">
            <h4 className="text-center font-bold text-[#1a1a1a] mb-6 text-xl">Participante</h4>
            <div className="space-y-3">
              {stepsPart.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    {/* Ícone com o degradê coral padrão */}
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ff4d6d] to-[#ff8c66] text-white rounded-xl flex items-center justify-center">
                      {s.icon}
                    </div>
                    <span className="font-bold text-[#1a1a1a] text-sm">{s.text}</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Passo {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COLUNA ORGANIZADOR */}
          <div className="flex flex-col gap-4">
            <h4 className="text-center font-bold text-[#ff4d6d] mb-6 text-xl">Organizador</h4>
            <div className="space-y-3">
              {stepsOrg.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ff4d6d] to-[#ff8c66] text-white rounded-xl flex items-center justify-center">
                      {s.icon}
                    </div>
                    <span className="font-bold text-[#1a1a1a] text-sm">{s.text}</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Passo {i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}