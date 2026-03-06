import { Ticket, Users, Heart, ShieldCheck, Zap } from 'lucide-react';

const steps = [
  { icon: <Ticket size={24}/>, label: "Compra o bilhete" },
  { icon: <Users size={24}/>, label: "Entra na comunidade" },
  { icon: <Heart size={24}/>, label: "Conecta por afinidade" },
  { icon: <ShieldCheck size={24}/>, label: "Organiza com segurança" },
  { icon: <Zap size={24}/>, label: "Vive o evento conectado" },
];

export default function CommunityJourney() {
  return (
    <section className="py-20 bg-white text-center border-t border-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-black mb-2 tracking-tighter text-slate-900">Mais do que um ingresso.</h2>
        <h3 className="text-4xl font-black text-pink-600 mb-16 tracking-tighter">Uma comunidade segura.</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-pink-500/20">
                  {step.icon}
                </div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest max-w-[120px] leading-tight">
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:block w-20 h-[2px] bg-slate-100 mx-4 mt-[-40px]" />
              )}
            </div>
          ))}
        </div>
        
        <p className="mt-20 text-pink-600 font-serif italic text-2xl tracking-tight">A experiência começa antes do evento.</p>
      </div>
    </section>
  );
}