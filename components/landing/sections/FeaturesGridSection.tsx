import { Wallet, CalendarClock, ShieldCheck } from "lucide-react";

export function FeaturesGridSection() {
  const features = [
    {
      title: "AI Financial Tracker",
      description: "Otomatisasi pencatatan, kalkulasi cash flow, dan prediksi sisa dana di akhir bulan.",
      icon: <Wallet className="w-6 h-6 text-zinc-100" />
    },
    {
      title: "Smart Scheduler",
      description: "Pengingat jadwal adaptif yang terintegrasi langsung dengan manajemen tugas harian.",
      icon: <CalendarClock className="w-6 h-6 text-zinc-100" />
    },
    {
      title: "Privacy & Security First",
      description: "Data keuangan Anda aman, di-enkripsi secara end-to-end, dan sepenuhnya privat.",
      icon: <ShieldCheck className="w-6 h-6 text-zinc-100" />
    }
  ];

  return (
    <section className="py-24 md:py-32 relative bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-10 flex flex-col gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
