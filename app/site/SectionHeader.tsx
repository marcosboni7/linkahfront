'use client';

interface SectionHeaderProps {
  title: string;
  highlight?: string; // Adicionamos isso para aceitar o "hoje" ou "chamada"
  count?: number;
}

export function SectionHeader({ title, highlight, count }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
      <div className="flex items-center gap-3">
        <div className="h-5 w-1.5 bg-[#ff0082] rounded-full" />
        <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
          {title} {highlight && <span className="text-[#ff0082] ml-1">{highlight}</span>}
        </h2>
      </div>
      {count !== undefined && (
        <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-md border border-slate-100 uppercase tracking-widest">
          {count} Eventos
        </span>
      )}
    </div>
  );
}