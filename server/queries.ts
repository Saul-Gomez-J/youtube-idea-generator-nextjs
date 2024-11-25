"use server";

import { auth } from "@clerk/nextjs/server";
import {
  Idea,
  Ideas,
  Users,
  Video,
  VideoComments,
  Videos,
  YouTubeChannels,
  YouTubeChannelType,
} from "./db/schema";
import { db } from "./db/drizzle";
import { eq, and, desc } from "drizzle-orm";

export const getVideosForUser = async (): Promise<Video[]> => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return db.select().from(Videos).where(eq(Videos.userId, userId));
};

export const getChannelsForUser = async (): Promise<YouTubeChannelType[]> => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return db
    .select()
    .from(YouTubeChannels)
    .where(eq(YouTubeChannels.userId, userId));
};

export const getVideoWithComments = async (
  videoId: string
): Promise<{
  video: Video;
  comments: (typeof VideoComments.$inferSelect)[];
} | null> => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const videos = await db
    .select()
    .from(Videos)
    .where(and(eq(Videos.id, videoId), eq(Videos.userId, userId)));

  if (videos.length === 0) {
    return null;
  }

  const video = videos[0];

  const comments = await db
    .select()
    .from(VideoComments)
    .where(eq(VideoComments.videoId, videoId))
    .orderBy(VideoComments.publishedAt);

  return { video, comments };
};

export const getIdeasForUser = async (): Promise<Idea[]> => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return db
    .select()
    .from(Ideas)
    .where(eq(Ideas.userId, userId))
    .orderBy(desc(Ideas.createdAt));
};

export const trialUsed = async (): Promise<boolean> => {
  try {
    // Autentica al usuario y obtiene el userId de Clerk
    const { userId } = await auth();

    if (!userId) {
      // Retorna false si el usuario no está autenticado
      return false;
    }

    // Consulta la tabla Users para obtener el registro del usuario actual
    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.clerkUserId, userId))
      .limit(1)
      .then(records => records[0] || null); // Obtiene el primer registro o null

    if (!user) {
      // Retorna false si el registro del usuario no existe
      return false;
    }

    // Retorna el valor de hasExecutedTrial como booleano
    return Boolean(user.hasExecutedTrial);
  } catch (error) {
    console.error("Error en trialUsed:", error);
    // Retorna false en caso de cualquier error durante la ejecución
    return false;
  }
};


