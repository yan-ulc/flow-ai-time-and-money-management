"use client";

export function QuickStat({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-primary/5 backdrop-blur-md border border-primary/20 rounded-2xl p-5 flex flex-col justify-center transition-all duration-300 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 h-full min-h-[100px]">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </span>
      <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight line-clamp-1">
        {value}
      </span>
    </div>
  );
}
