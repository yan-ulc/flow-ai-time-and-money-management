import { ArrowRight } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export function CTAAndFooterSection() {
  return (
    <>
      <section className="py-32 md:py-48 relative bg-background border-t border-white/5 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-8 max-w-3xl">
          Ready to take control of your life?
        </h2>
        <p className="text-muted-foreground text-xl mb-12 max-w-2xl">
          Get started for free today and experience the future of personal management.
        </p>

        <SignUpButton mode="modal">
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-zinc-950 px-10 py-5 text-base md:text-lg font-bold shadow-[0_20px_60px_-30px_rgba(255,255,255,0.4)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-30px_rgba(255,255,255,0.5)]">
            Start Free
            <ArrowRight className="h-5 w-5" />
          </button>
        </SignUpButton>
      </section>

      <footer className="bg-zinc-950 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-zinc-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} FlowAI. All rights reserved.
          </div>
          
          <div className="flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#" className="hover:text-zinc-100 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-zinc-100 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-zinc-100 transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-5 text-zinc-400 text-sm font-medium">
            <Link href="#" className="hover:text-zinc-100 transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-zinc-100 transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-zinc-100 transition-colors">LinkedIn</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
