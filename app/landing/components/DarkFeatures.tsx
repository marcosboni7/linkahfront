import { UserCheck, Shield, Sparkles, History } from 'lucide-react';

export default function DarkFeatures() {
  const features = [
    { icon: <UserCheck />, label: "Perfil verificado" },
    { icon: <Shield />, label: "Comunidades fechadas" },
    { icon: <Sparkles />, label: "Matching por afinidade" },
    { icon: <History />, label: "Histórico de conexões" },
  ];

  return (
    <section className="py-32 bg-[#030712] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none">
          Networking, Segurança e Experiência <br/> não são detalhes.
        </h2>
        <h3 className="text-4xl md:text-5xl font-black text-orange-500 mb-20 tracking-tighter">São Prioridades.</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {features.map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-sm hover:bg-white/10 transition-all group flex flex-col items-center gap-6">
              <div className="w-14 h-14 bg-pink-600/20 text-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">{f.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
            <p className="text-slate-500 text-lg font-medium tracking-tight">Você sabe com quem está se conectando.</p>
            <p className="text-white text-xl font-black italic tracking-tighter">Você escolhe com quem viver a experiência.</p>
        </div>
      </div>
      
      {/* Luz Decorativa de Fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] -z-0"></div>
    </section>
  );
}