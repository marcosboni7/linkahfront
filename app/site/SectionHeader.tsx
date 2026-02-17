// components/site/SectionHeader.tsx
interface SectionHeaderProps {
  title: string;
  highlight?: string;
  count?: number;
}

export const SectionHeader = ({ title, highlight, count }: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
      <div className="flex items-center gap-3">
        <div className="h-5 w-1 bg-[#ff0082] rounded-full" />
        <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">
          {title} {highlight && <span className="text-[#ff0082]">{highlight}</span>}
        </h2>
      </div>
      {count !== undefined && (
        <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
          {count} EVENTOS
        </span>
      )}
    </div>
  );
};