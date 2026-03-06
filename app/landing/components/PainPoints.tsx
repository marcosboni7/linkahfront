import { Lock, MapPin, Users, Heart } from 'lucide-react';

const pains = [
  { icon: <Lock />, title: "Medo de ir sozinho", desc: "Sem saber como chegar, onde ficar ou com quem contar." },
  { icon: <MapPin />, title: "Insegurança na logística", desc: "Dúvida sobre hospedagem ou transporte com desconhecidos." },
  { icon: <Users />, title: "Dificuldade de conexão", desc: "Encontrar pessoas com interesses em comum parece impossível." },
  { icon: <Heart />, title: "Eventos sem networking real", desc: "Conexões vazias e superficiais sem nenhum vínculo real." },
];

export default function PainPoints() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight text-slate-900">
          Queres ir ao evento... <span className="text-pink-600">mas algo ainda te trava?</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {pains.map((item, idx) => (
            <div key={idx} className="p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-pink-500/10 transition-all group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm text-pink-600 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-3 leading-tight">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-10 py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full font-bold shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform">Comprar Ingresso</button>
          <button className="px-10 py-4 border border-pink-200 text-pink-600 rounded-full font-bold hover:bg-pink-50 transition-colors">Criar Evento</button>
        </div>
      </div>
    </section>
  );
}