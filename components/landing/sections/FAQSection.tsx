export function FAQSection() {
  const faqs = [
    {
      q: "Apakah data keuangan saya aman dan tidak disebar?",
      a: "Aman. Semua data dienkripsi dengan standar tinggi dan privasi pengguna adalah prioritas utama kami."
    },
    {
      q: "Gimana cara FlowAI membaca jadwal saya?",
      a: "FlowAI mengatur tugas dan jadwal secara cerdas berdasarkan input chat natural yang Anda masukkan langsung ke sistem."
    },
    {
      q: "Apakah aplikasi ini ada versi mobile-nya?",
      a: "Saat ini FlowAI dioptimalkan untuk akses web responsif, dan versi mobile app sedang dalam tahap perencanaan."
    }
  ];

  return (
    <section className="py-24 md:py-32 relative bg-background border-t border-white/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center text-foreground mb-16">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8"
            >
              <h3 className="text-lg md:text-xl font-bold text-zinc-100 mb-3">
                {faq.q}
              </h3>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
