import { X, Check } from "lucide-react";

export function ComparisonSection() {
  return (
    <section className="py-24 md:py-32 relative bg-background border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center text-foreground mb-16">
          The Difference is Clear.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Without FlowAI */}
          <div className="bg-zinc-950 border border-zinc-800/50 rounded-3xl p-8 md:p-12 flex flex-col items-start opacity-70">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <X className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-400">Tanpa FlowAI</h3>
            </div>
            <p className="text-zinc-500 leading-relaxed text-lg font-medium">
              Catat keuangan manual di Excel yang ribet, jadwal berantakan di kalender biasa, dan seringkali ga tahu uang habis kemana.
            </p>
          </div>

          {/* With FlowAI */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 md:p-12 flex flex-col items-start relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-4 h-4 text-zinc-900" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100">Dengan FlowAI</h3>
            </div>
            <p className="text-zinc-300 leading-relaxed text-lg font-medium relative z-10">
              Tinggal chat, semua beres. Keuangan dan jadwal otomatis terorganisir, tercatat, dan terpantau dalam satu sistem cerdas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
