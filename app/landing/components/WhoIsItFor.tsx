import { Search, Ticket, Users, MapPin, Sparkles, Plus, Radio, Zap, Gift, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  const stepsParticipante = [
    { icon: <Search size={20} />, text: "Escolhe o evento", step: "Passo 1" },
    { icon: <Ticket size={20} />, text: "Compra o ticket", step: "Passo 2" },
    { icon: <Users size={20} />, text: "Conecta via Comunidade", step: "Passo 3" },
    { icon: <MapPin size={20} />, text: "Viaja com segurança", step: "Passo 4" },
    { icon: <Sparkles size={20} />, text: "Vive Experiência Inesquecível", step: "Passo 5" },
  ];

  const stepsOrganizador = [
    { icon: <Plus size={20} />, text: "Cria o evento", step: "Passo 1" },
    { icon: <Radio size={20} />, text: "Ativa comunidade", step: "Passo 2" },
    { icon: <Zap size={20} />, text: "Engaja os participantes", step: "Passo 3" },
    { icon: <Gift size={20} />, text: "Entrega valor", step: "Passo 4" },
    { icon: <TrendingUp size={20} />, text: "Multiplica resultados", step: "Passo 5" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-[42px] font-bold text-center mb-16 text-[#1a1a1a]">
          Como <span className="text-[#ff4d6d]">funciona</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Coluna Participante */}
          <div className="space-y-4">
            <h3 className="text-center font-bold text-[#1a1a1a] mb-8">Participante</h3>
            {stepsParticipante.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#ff4d6d] to-[#ff8c66] text-white rounded-xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="font-bold text-[#1a1a1a] text-sm">{item.text}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-widest">{item.step}</span>
              </div>
            ))}
          </div>

          {/* Coluna Organizador */}
          <div className="space-y-4">
            <h3 className="text-center font-bold text-[#ff4d6d] mb-8">Organizador</h3>
            {stepsOrganizador.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#ff4d6d] to-[#ff8c66] text-white rounded-xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="font-bold text-[#1a1a1a] text-sm">{item.text}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-widest">{item.step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}