"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useColorTheme } from "@/components/ThemeProvider";

const THEMES = [
  { id: "default", name: "Default" },
  { id: "astro-vista", name: "Astro Vista" },
  { id: "claude", name: "Claude" },
  { id: "light-green", name: "Light Green" },
  { id: "mono", name: "Mono" },
  { id: "neobrutualism", name: "Neo Brutalism" },
  { id: "notebook", name: "Notebook" },
  { id: "supabase", name: "Supabase" },
  { id: "vercel", name: "Vercel" },
  { id: "whatsapp", name: "WhatsApp" },
  { id: "zen", name: "Zen" },
];

export function ThemeSelectorDialog({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-background border border-border rounded-2xl shadow-xl z-50 p-6 flex flex-col gap-6 outline-none animate-in zoom-in-95">
          <div className="flex justify-between items-center">
            <div>
              <Dialog.Title className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Appearance
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-1">
                Customize the look and feel of the app.
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3 text-foreground/80">Mode</h3>
              <div className="grid grid-cols-3 gap-2">
                {["light", "dark", "system"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setTheme(m)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${
                      theme === m
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary/50 text-secondary-foreground border-transparent hover:bg-secondary"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-foreground/80">Color Theme</h3>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setColorTheme(t.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border text-left ${
                      colorTheme === t.id
                        ? "bg-primary/10 text-primary border-primary shadow-sm"
                        : "bg-background text-foreground border-border/50 hover:border-border hover:bg-secondary/20"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border shadow-sm flex-shrink-0 bg-primary"
                      data-theme={t.id}
                    />
                    <span className="truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
