"use client";
import { trialUsed } from "@/server/queries";
import{ markTrialAsExecuted } from "@/server/mutations";
import { useState, useEffect, useRef } from "react";
import { Idea } from "@/server/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  MoveUpRight,
  MessageSquare,
  Sparkles,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  getIdeaDetails,
  kickoffIdeaGeneration,
  processPendingJobs,
  checkForUnprocessedJobs,
  getNewIdeas,
} from "@/server/ideas-actions";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import YoutubeLogo from "@/public/youtube-logo.png";

interface Props {
  initialIdeas: Idea[];
}

export interface IdeaDetails {
  videoTitle: string;
  commentText: string;
}

export default function IdeaList({ initialIdeas }: Props) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [isGenerating, setIsGenerating] = useState(false);

  const [ideaDetails, setIdeaDetails] = useState<Record<string, IdeaDetails>>(
    {}
  );
  const { toast } = useToast();

  // Keep track of previous unprocessed jobs state
  const prevHasUnprocessedJobs = useRef<boolean>(false);

  const handleGenerate = async () => {
    setIsGenerating(true); // Inicia el indicador de carga
    try {
      // Verifica si el usuario ya ha utilizado su ejecución de prueba
      const hasUsedTrial = await trialUsed();
  
      if (hasUsedTrial) {
        // Si el usuario ya ha utilizado la prueba, muestra un toast informativo
        toast({
          title: "Prueba ya utilizada",
          description: "Ya has utilizado tu generación de prueba.",
          variant: "default", // Puedes ajustar el estilo según tu biblioteca de toast
        });
      } else {
        // Si el usuario no ha utilizado la prueba, procede a generar ideas
        await kickoffIdeaGeneration();
        
        // Muestra un toast indicando que se están generando ideas
        toast({
          title: "Generando ideas...",
          description:
            "Estamos procesando tus comentarios para generar nuevas ideas. Esto puede tomar unos momentos.",
        });
  
        // Marca la prueba como ejecutada actualizando el estado del usuario
        await markTrialAsExecuted();
      }
    } catch (error) {
      console.error("Error al iniciar la generación de ideas:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la generación de ideas. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false); // Detiene el indicador de carga independientemente del resultado
    }
  };

  // Polling function for job state
  useEffect(() => {
    const pollJobsInterval = setInterval(async () => {
      try {
        await processPendingJobs();

        const hasUnprocessedJobs = await checkForUnprocessedJobs();
        console.log("Has unprocessed jobs:", hasUnprocessedJobs);

        // Show toast only if there were previously unprocessed jobs and now there are none
        if (prevHasUnprocessedJobs.current && !hasUnprocessedJobs) {
          toast({
            title: "Idea generation completed!",
            description: "Your new ideas are ready.",
          });

          // Fetch new ideas and update state
          const newIdeas = await getNewIdeas();
          setIdeas(newIdeas);
        }

        // Update the isGenerating state
        setIsGenerating(hasUnprocessedJobs);

        // Update the previous unprocessed jobs state
        prevHasUnprocessedJobs.current = hasUnprocessedJobs;
      } catch (error) {
        console.error("Error processing pending jobs:", error);
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(pollJobsInterval);
  }, [toast]);

  // Fetch idea details when ideas change
  useEffect(() => {
    const fetchDetailsForIdeas = async () => {
      for (const idea of ideas) {
        if (!ideaDetails[idea.id]) {
          const details = await getIdeaDetails(idea.videoId, idea.commentId);
          setIdeaDetails((prev) => ({
            ...prev,
            [idea.id]: details,
          }));
        }
      }
    };

    fetchDetailsForIdeas();
  }, [ideas]); // Removed 'ideaDetails' from dependencies to prevent infinite loop

  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 space-y-5">
        <div className="bg-red-50 rounded-xl p-3">
          <Sparkles className="h-11 w-11 text-red-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900">Aún no hay ideas</h3>
        <p className="text-gray-500 text-center max-w-md">
          Empieza generando ideas a partir de los comentarios de tu video. Cada idea
          está diseñada en base a tu contenido.
        </p>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-red-500 hover:bg-red-600 transition-all rounded-lg text-md font-semibold px-6 py-5"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>Generar Ideas</>
          )}
        </Button>
      </div>
    );
    
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ideas</h1>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-red-500 hover:bg-red-600 transition-all rounded-lg text-md font-semibold px-6 py-3"
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {ideas.map((idea) => (
          <div key={idea.id} className="group">
            <Dialog>
              <DialogTrigger asChild>
                <div className="rounded-2xl border bg-white shadow-sm p-5 space-y-3 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                  <div className="flex items-start justify-between space-x-2">
                    <h3 className="text-lg font-semibold line-clamp-2">
                      {idea.videoTitle}
                    </h3>

                    <Link
                      href={`/video/${idea.videoId}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger>
                            <MoveUpRight
                              className="h-4 w-4 text-red-500"
                              strokeWidth={2}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-red-100 text-red-500">
                            <p>View source video</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Link>
                  </div>
                  <Badge variant="secondary" className="text-sm text-red-500">
                    Score: {idea.score}
                  </Badge>
                </div>
              </DialogTrigger>

              {/* Dialog Content */}
              <DialogContent className="max-w-[600px] rounded-2xl p-8 space-y-2">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between space-x-6">
                    <span className="text-xl font-bold tracking-tight line-clamp-2 flex-1">
                      {idea.videoTitle}
                    </span>
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-base text-red-500"
                    >
                      Score: {idea.score}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-red-500">Description</h3>
                    <ScrollArea className="h-[100px]">
                      <p className="text-sm whitespace-pre-wrap">
                        {idea.description}
                      </p>
                    </ScrollArea>
                  </div>
                  {/* Research Links */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-red-500">
                      Research Links
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      {idea.research.map((url) => (
                        <Link
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full space-x-2 flex items-center line-clamp-1 border bg-gray-50 hover:bg-gray-100 transition-all duration-300 rounded-lg px-3 py-2"
                        >
                          <ExternalLink className="h-4 w-4 flex-shrink-0" />
                          <p className="flex-1 text-sm truncate">
                            {new URL(url).hostname.replace("www.", "")}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                  {/* Video Title */}
                  <div className="space-y-2 w-full">
                    <h3 className="font-semibold text-red-500">Video Title</h3>
                    <div className="max-w-full">
                      <Link
                        href={`/video/${idea.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 py-2 px-3 border rounded-lg w-fit line-clamp-1 bg-gray-50 hover:bg-gray-100 transition-all duration-300 group"
                      >
                        <Image
                          src={YoutubeLogo}
                          alt="Youtube Logo"
                          width={16}
                          height={16}
                          className="flex-shrink-0 transition-all duration-300"
                        />
                        <p className="text-sm truncate max-w-[400px]">
                          {ideaDetails[idea.id]?.videoTitle || "Loading..."}
                        </p>
                      </Link>
                    </div>
                  </div>
                  {/* Video Comment */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-red-500">
                      Video Comment
                    </h3>
                    <div className="rounded-xl border bg-gray-50 py-6 px-5 flex flex-row space-x-2">
                      <MessageSquare className="h-5 w-5 shrink-0 text-red-500" />
                      <ScrollArea className="h-[60px]">
                        <p className="text-sm whitespace-pre-wrap">
                          {ideaDetails[idea.id]?.commentText || "Loading..."}
                        </p>
                      </ScrollArea>
                    </div>
                  </div>
                  {/* Source Video Link */}
                  <div className="border-t pt-4">
                    <Link
                      href={`/video/${idea.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-red-500 hover:underline transition-all duration-200 flex justify-end items-center space-x-1"
                    >
                      <p>View source video</p>
                      <MoveUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </>
  );
}
