"use server";

import { auth } from "@clerk/nextjs/server";
import { YouTubeChannels, YouTubeChannelType, Users } from "./db/schema";
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

export const markTrialAsExecuted = async (): Promise<void> => {
  // Autenticar al usuario y obtener el userId
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Usuario no autenticado");
  }

  try {
    // Actualizar el campo hasExecutedTrial a true para el usuario correspondiente
    const updateResult = await db
      .update(Users)
      .set({ hasExecutedTrial: true, updatedAt: new Date() })
      .where(eq(Users.clerkUserId, userId))
      .execute();

    // Opcional: Verificar si la actualización afectó a alguna fila
    if (updateResult.rowCount === 0) {
      throw new Error("No se encontró el usuario en la base de datos");
    }

    console.log(`Usuario ${userId} marcado como con prueba ejecutada.`);
  } catch (error) {
    console.error("Error al actualizar hasExecutedTrial:", error);
    throw new Error("No se pudo actualizar el estado de la prueba.");
  }
};

