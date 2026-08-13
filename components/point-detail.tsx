"use client";

import Image from "next/image";
import { Fragment } from "react";
import {
  ArrowLeft,
  History,
  BadgeCheck,
  DoorOpen,
  MapPin,
  ImageIcon,
} from "lucide-react";
import type { RoutePoint } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function renderWithLinks(text: string) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 break-all"
      >
        {part}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

interface RoutePointDetailProps {
  point: RoutePoint;
  index: number;
  onBack: () => void;
}

export function RoutePointDetail({
  point,
  index,
  onBack,
}: RoutePointDetailProps) {
  return (
    <div className="min-h-[calc(100vh-9rem)]">
      <section className="gradient-hero-vibrant pattern-grid relative overflow-hidden px-4 py-16 sm:py-20">
        <div className="relative mx-auto max-w-3xl text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            {point.name}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="text-sm">
              Точка {index + 1}
            </Badge>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 -mt-6 pb-12 space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 shadow-sm">
            <div className="relative aspect-video sm:aspect-[16/9] overflow-hidden">
              <Image
                src={point.photo}
                alt={point.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>{point.address}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="text-lg font-semibold tracking-tight">
                    История места
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.history}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="text-lg font-semibold tracking-tight">
                    Статус
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {renderWithLinks(point.status)}
                </p>
              </div>

              {point.access ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DoorOpen className="h-5 w-5 text-primary shrink-0" />
                    <h2 className="text-lg font-semibold tracking-tight">
                      Доступ
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {renderWithLinks(point.access)}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="text-center pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к маршруту
          </Button>
        </div>
      </section>
    </div>
  );
}
