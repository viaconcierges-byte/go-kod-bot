"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  Ghost,
  Home,
  BookOpen,
  Landmark,
  ArrowDown,
} from "lucide-react";
import { routeThemes, type RouteTheme } from "@/lib/data";
import { cn } from "@/lib/utils";
import { RouteDisplay } from "@/components/route-display";

const guideBase =
  "Это Михаил из «Кода Петербурга». Рад, что ты заглянул! Я не просто бот, а твой гид по небанальным маршрутам, которые я сам собрал, потому что влюблён в этот город. Готов исследовать? 😉";

interface TelegramUser {
  firstName?: string;
}

interface TelegramWebApp {
  initDataUnsafe?: { user?: TelegramUser };
}

interface TelegramGlobal {
  WebApp?: TelegramWebApp;
}

function getTelegramFirstName(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const telegram = (window as Window & { Telegram?: TelegramGlobal }).Telegram;
  return telegram?.WebApp?.initDataUnsafe?.user?.firstName;
}

function buildGreeting(): string {
  const firstName = getTelegramFirstName();
  const intro = firstName ? `Привет, ${firstName}!` : "Привет!";
  return `${intro} ${guideBase}`;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Ghost,
  Home,
  BookOpen,
  Landmark,
};

export function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState<RouteTheme | null>(null);
  const greeting = buildGreeting();

  if (selectedTheme) {
    return (
      <RouteDisplay
        theme={selectedTheme}
        onBack={() => setSelectedTheme(null)}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-9rem)]">
      <section className="gradient-hero-vibrant pattern-grid relative overflow-hidden px-4 py-20 sm:py-28">
        <div className="relative mx-auto max-w-3xl text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Image
            src="/assets/logo.png"
            alt="Go Kod Bot"
            width={200}
            height={200}
            className="mx-auto"
            priority
          />
          <div className="mx-auto max-w-2xl space-y-2 text-left">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              М
            </span>
            <p className="rounded-2xl rounded-tl-sm bg-card px-5 py-4 text-sm leading-relaxed text-foreground shadow-sm ring-1 ring-foreground/10">
              {greeting}
            </p>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            Куда хотите отправиться?
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Выберите тему прогулки по Петербургу ниже, и мы отправимся вместе
          </p>
          <ArrowDown className="mx-auto h-8 w-8 text-muted-foreground/70 animate-pulse" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 -mt-8 pb-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {routeThemes.map((theme, index) => {
            const Icon = iconMap[theme.icon];
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme)}
                className={cn(
                  "group relative overflow-hidden rounded-xl bg-card p-6 ring-1 ring-foreground/10 card-hover animate-in fade-in slide-in-from-bottom-4 duration-500 text-left w-full"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                    theme.color
                  )}
                />
                <div className="relative space-y-4">
                  <div
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                      theme.color
                    )}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {theme.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {theme.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
