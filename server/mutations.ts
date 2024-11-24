"use server";

import { auth } from "@clerk/nextjs/server";
import { YouTubeChannels, YouTubeChannelType, Videos } from "./db/schema";
import { db } from "./db/drizzle";
import { and, eq } from "drizzle-orm";

export const addChannelForUser = async (
  name: string
): Promise<YouTubeChannelType> => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const [newChannel] = await db
    .insert(YouTubeChannels)
    .values({
      name,
      userId,
    })
    .returning();

  return newChannel;
};

export const removeChannelForUser = async (id: string): Promise<void> => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  await db
    .delete(YouTubeChannels)
    .where(and(eq(YouTubeChannels.id, id), eq(YouTubeChannels.userId, userId)));
};

// ... existing code ...

export const removeVideoForUser = async (id: string): Promise<void> => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Usuario no autenticado");
  }

  await db
    .delete(Videos)
    .where(and(eq(Videos.id, id), eq(Videos.userId, userId)));
};

// ... existing code ...