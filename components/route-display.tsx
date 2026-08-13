"use client";

import Image from "next/image";
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  Map,
  Info,
  Share2,
  Bookmark,
  X,
  Footprints,
  Calendar,
} from "lucide-react";
import { routeData, type RouteTheme, type RoutePoint } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { RoutePointDetail } from "@/components/point-detail";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface RouteDisplayProps {
  theme: RouteTheme;
  onBack: () => void;
}

export function RouteDisplay({ theme, onBack }: RouteDisplayProps) {
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);
  const [showCompact, setShowCompact] = useState(false);
  const route = routeData[theme.id];

  const handleShare = async () => {
    const text = [
      `Маршрут: ${route.name ?? theme.title}`,
      "",
      ...route.points.map(
        (point, i) =>
          `${i + 1}. ${point.name}\n   ${point.address}\n   ${point.description}`
      ),
      "",
      "Хотите увидеть это с гидом? Забронируйте экскурсию на сайте spbkod.ru",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Маршрут скопирован в буфер обмена");
    } catch {
      toast.error("Не удалось скопировать маршрут");
    }
  };
  if (!route) {
    return (
      <div className="min-h-[calc(100vh-9rem)] flex items-center justify-center">
        <p className="text-muted-foreground">Маршрут не найден</p>
      </div>
    );
  }

  if (selectedPoint) {
    return (
      <RoutePointDetail
        point={selectedPoint}
        index={route.points.findIndex((p) => p.id === selectedPoint.id)}
        onBack={() => setSelectedPoint(null)}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-9rem)]">
      <section className="gradient-hero-vibrant pattern-grid relative overflow-hidden px-4 py-16 sm:py-20">
        <div className="relative mx-auto max-w-3xl text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
            <Map className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            {route.name ?? theme.title}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            {route.description ??
              `Ваш маршрут готов! ${route.points.length} точки, которые стоит увидеть.`}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 -mt-6 pb-12 space-y-6">
        {route.points.map((point, index) => (
          <div
            key={point.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 120}ms` }}
          >
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
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md">
                    {index + 1}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-semibold tracking-tight">
                  {point.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
                {point.style && point.year && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                      <Calendar className="h-3.5 w-3.5" />
                      {point.year}
                    </span>
                    <Badge variant="secondary">{point.style}</Badge>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <span>{point.address}</span>
                </div>
                {point.logistics && (
                  <div className="flex items-start gap-2 space-y-0 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                    <Footprints className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    <span>{point.logistics}</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPoint(point)}
                  className="w-full sm:w-auto gap-2 text-primary hover:text-primary/80"
                >
                  <Info className="h-4 w-4" />
                  Подробнее
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleShare}
            className="w-full sm:w-auto gap-2"
          >
            <Share2 className="h-4 w-4" />
            Поделиться
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowCompact(!showCompact)}
            className="w-full sm:w-auto gap-2"
          >
            {showCompact ? (
              <X className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {showCompact ? "Скрыть памятку" : "Сохранить"}
          </Button>
        </div>

        {showCompact && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card size="sm">
              <CardHeader>
                <CardTitle>{theme.title}</CardTitle>
                <CardDescription>
                  {route.points.length} точки маршрута
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {route.points.map((point, i) => (
                  <div key={point.id}>
                    {i > 0 && <Separator className="mb-3" />}
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {point.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {point.address}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto">
            Хотите увидеть это с гидом?{" "}
            <a
              href="https://spbkod.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Забронируйте экскурсию на сайте spbkod.ru
            </a>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={onBack}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к выбору темы
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Пройти маршрут заново
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
