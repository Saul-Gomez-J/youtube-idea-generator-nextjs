"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Video } from "@/server/db/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCount } from "@/lib/utils";
import { Loader2, TvMinimal, X } from "lucide-react";

// Importamos las acciones del servidor como funciones
import { scrapeVideos, removeVideoForUser } from "@/server/youtube-actions";

export default function VideoList({
  initialVideos,
}: {
  initialVideos: Video[];
}) {
  const [isPending, startTransition] = useTransition();
  const [videos, setVideos] = useState(initialVideos);
  const { toast } = useToast();

  const handleScrape = () => {
    startTransition(async () => {
      try {
        const newVideos = await scrapeVideos();
        setVideos((prevVideos) => [...newVideos, ...prevVideos]);
        toast({
          title: "Scrape Successful",
          description: `Scraped ${newVideos.length} new videos`,
        });
      } catch (error) {
        console.error("Error scraping videos:", error);
        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
          if (error.message.includes("No channels found for the user")) {
            errorMessage =
              "Please add YouTube channels first by clicking settings in the top right.";
          } else {
            errorMessage = error.message;
          }
        }

        toast({
          title: "Scrape Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await removeVideoForUser(id);
        setVideos((prevVideos) => prevVideos.filter(video => video.id !== id));
        toast({
          title: "Video eliminado",
          description: "El video ha sido eliminado exitosamente",
        });
      } catch (error) {
        console.error("Error al eliminar el video:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el video",
          variant: "destructive",
        });
      }
    });
  };

  useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 space-y-5">
        <div className="bg-red-50 rounded-xl p-3">
          <TvMinimal className="h-11 w-11 text-red-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900">Aún no hay videos</h3>
        <p className="text-gray-500 text-center max-w-md">
          Por favor, añade canales de YouTube y luego realiza un scraping para obtener videos. 
          Los comentarios de los videos serán analizados para generar ideas de contenido.
        </p>
        <Button
          onClick={handleScrape}
          disabled={isPending}
          className="bg-red-500 hover:bg-red-600 transition-all rounded-lg text-md font-semibold px-6 py-5"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Realizando scraping...
            </>
          ) : (
            <>Realizar scraping de videos</>
          )}
        </Button>
      </div>
    );    
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Videos</h1>
        <Button
          onClick={handleScrape}
          disabled={isPending}
          className="bg-red-500 hover:bg-red-600 transition-all rounded-lg text-md font-semibold px-6 py-3"
        >
          {isPending ? "Scraping..." : "Scrape"}
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {videos.map((video) => (
          <Link
            key={video.id}
            href={`/video/${video.id}`}
            className="group block relative"
          >
            <div className="rounded-2xl overflow-hidden border bg-white shadow-sm p-4 space-y-3 hover:scale-[1.05] transition-all duration-300">
              <div className="flex justify-end mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-gray-100 hover:bg-gray-200 rounded-full h-6 w-6 p-0"
                  onClick={(e) => handleDelete(video.id, e)}
                >
                  <X className="h-3 w-3 text-gray-700" />
                </Button>
              </div>
              <div className="aspect-video relative">
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No thumbnail</span>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <h2 className="font-semibold line-clamp-2 group-hover:text-primary">
                  {video.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {video.channelTitle}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>
                    {video.viewCount ? formatCount(video.viewCount) : "0"} views
                  </span>
                  <span className="mx-1">•</span>
                  <span>
                    {formatDistanceToNow(new Date(video.publishedAt))} ago
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}