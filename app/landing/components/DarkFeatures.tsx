import { ShieldCheck, Lock, Heart, History } from 'lucide-react';

export default function DarkFeatures() {
  const features = [
    { 
      icon: <ShieldCheck size={20} />, 
      label: "Perfis verificados" 
    },
    { 
      icon: <Lock size={20} />, 
      label: "Comunidades fechadas por evento" 
    },
    { 
      icon: <Heart size={20} />, 
      label: "Matching por afinidade" 
    },
    { 
      icon: <History size={20} />, 
      label: "Histórico de conexões" 
    },
  ];

  return (
    <section className="py-32 bg-[#111827] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        {/* Título com a tipografia e cores exatas */}
        <h2 className="text-[40px] md:text-[48px] font-bold mb-2 tracking-tight leading-tight">
          Networking, Segurança e<br />
          Experiência não são detalhes.
        </h2>
        <h3 className="text-[36px] md:text-[42px] font-bold text-[#ff8c66] mb-20 tracking-tight">
          São Prioridades.
        </h3>

        {/* Grid de cards com o arredondamento e bordas da imagem */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="bg-[#1f2937]/50 border border-white/10 p-10 rounded-[1.5rem] flex flex-col items-center justify-center gap-6 hover:bg-[#1f2937] transition-all group"
            >
              {/* Círculo do ícone em vermelho coral sólido */}
              <div className="w-12 h-12 bg-[#ff4d6d] text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <span className="text-[13px] font-bold leading-tight text-slate-200 tracking-tight max-w-[140px]">
                {f.label}
              </span>
            </div>
          ))}
        </div>

        {/* Rodapé da seção com opacidade e pesos diferentes */}
        <div className="space-y-1">
          <p className="text-slate-400 text-lg font-medium tracking-tight">
            Você sabe com quem está se conectando.
          </p>
          <p className="text-white text-xl font-bold tracking-tight">
            Você escolhe com quem viver a experiência.
          </p>
        </div>
      </div>
      
      {/* Brilho de fundo sutil (Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#ff4d6d]/5 rounded-full blur-[120px] -z-0"></div>
    </section>
  );
}