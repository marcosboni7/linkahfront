import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    { name: "Mariana Silva", role: "Participante", text: "Fui sozinha para um evento em SP e graças à comunidade Linkah conheci pessoas incríveis antes mesmo de embarcar. Me senti segura o tempo todo!" },
    { name: "Ricardo Santos", role: "Organizador de Eventos", text: "Minha taxa de retenção dobrou. Os participantes criam laços reais e voltam em todos os meus eventos agora. A plataforma é fantástica." },
    { name: "Ana Beatriz", role: "Viajante Solo", text: "O matching por afinidade me conectou com pessoas que gostam do mesmo estilo de música que eu. Fiz amigos para a vida toda." },
  ];

  return (
    <section className="py-24 bg-pink-600 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-black tracking-tighter mb-4">O que dizem sobre nós.</h2>
            <p className="text-pink-100 text-lg font-medium">Histórias reais de quem transformou um evento em uma experiência de vida.</p>
          </div>
          <div className="flex gap-1 text-orange-400">
            {[1,2,3,4,5].map(i => <Star key={i} fill="currentColor" size={20}/>)}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] text-slate-900 relative">
              <Quote className="text-pink-100 absolute top-8 right-8" size={40} />
              <p className="text-slate-600 font-medium leading-relaxed mb-8 italic">"{r.text}"</p>
              <div>
                <h4 className="font-black uppercase tracking-tighter">{r.name}</h4>
                <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">{r.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}