import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/app"); // Kalau udah login, langsung bawa ke dashboard app
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans items-center justify-center">
      <main className="flex flex-col items-center justify-center px-4 md:px-16 text-center max-w-3xl space-y-8">
        <div className="flex items-center gap-3 font-bold text-4xl md:text-5xl tracking-tight mb-4">
          <Zap className="h-10 w-10 md:h-12 md:w-12 text-primary fill-primary" />
          <span>FlowAi</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Track Your Money and Time via Chat
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Cerita ke FlowAi kayak cerita ke teman — yang langsung nyimpen, ngitung, dan ingetin lo tanpa lo perlu ngisi form apapun.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-8 w-full sm:w-auto">
          <Link
            href="/sign-in"
            className="flex items-center justify-center gap-2 h-14 rounded-full bg-primary text-primary-foreground font-semibold px-8 hover:bg-primary/90 transition-colors shadow-lg"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
