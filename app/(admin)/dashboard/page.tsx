'use client';

import { DollarSign, Users, Ticket, LayoutGrid } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">
          Dashboard <span className="text-[#ff0082]">Geral</span>
        </h1>
        <p className="text-slate-500 text-sm">Visão macro do ecossistema Linkah</p>
      </div>

      {/* CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Vendas Totais" value="R$ 12.450" icon={<DollarSign />} trend="+12%" />
        <StatCard title="Ingressos Vendidos" value="342" icon={<Ticket />} trend="+5%" />
        <StatCard title="Membros nas Salas" value="1.205" icon={<Users />} trend="+18%" />
        <StatCard title="Salas Ativas" value="14" icon={<LayoutGrid />} trend="Estável" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4">Últimas Vendas (Stripe/Pix)</h2>
          <div className="space-y-4">
             {/* Simulação de lista */}
             {[1,2,3].map(i => (
               <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                 <span className="font-bold text-sm text-slate-700">João Silva</span>
                 <span className="text-[#ff0082] font-black text-sm">R$ 150,00</span>
                 <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold uppercase">Pago</span>
               </div>
             ))}
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
          <h2 className="font-bold mb-4">Alertas do Sistema</h2>
          <p className="text-slate-400 text-sm italic">O backend no Render está operando normalmente.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: any) {
  return