"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db/drizzle";
import { eq, and } from "drizzle-orm";
import {
  YouTubeChannels,
  Videos,
  VideoComments,
  Video,
  VideoComment,
} from "@/server/db/schema";
import { google, youtube_v3 } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
  timeout: 60000, // 60 segundos
});

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle!);
    throw error;
  }
};

async function getChannelId(channelName: string): Promise<string | null> {
  try {
    const response = await youtube.search.list({
      part: ["snippet"],
      type: ["channel"],
      q: channelName,
      maxResults: 1,
    });

    return response.data.items?.[0]?.id?.channelId || null;
  } catch (error) {
    console.error("Error fetching channel ID:", error);
    return null;
  }
}


export const removeVideoForUser = async (id: string): Promise<void> => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Usuario no autenticado");
  }

  await db
    .delete(Videos)
    .where(and(eq(Videos.id, id), eq(Videos.userId, userId)));
};


async function fetchLatestVideosForChannel(channelId: string): Promise<string[]> {
  try {
    const response = await youtube.search.list({
      part: ["id"],
      channelId: channelId,
      type: ["video"],
      order: "date",
      maxResults: 10,
    });

    const data: youtube_v3.Schema$SearchListResponse = response.data;
    const videoIds =
      (data.items
        ?.map((item) => item.id?.videoId)
        .filter(Boolean) as string[]) || [];
    return videoIds;
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return [];
  }
}

async function fetchVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
  const batches = chunkArray(videoIds, 50);
  let allVideos: YouTubeVideo[] = [];

  for (const batch of batches) {
    try {
      const params: youtube_v3.Params$Resource$Videos$List = {
        part: ["snippet", "statistics"],
        id: batch,
      };
      const response = await youtube.videos.list(params);

      const videos = (
        response.data.items?.map((item) => ({
          id: { videoId: item.id! },
          snippet: item.snippet!,
          statistics: item.statistics!,
        })) || []
      );

      allVideos = allVideos.concat(videos);
    } catch (error) {
      console.error("Error fetching video details:", error);
    }
  }

  return allVideos;
}

async function fetchVideoComments(videoId: string): Promise<YouTubeComment[]> {
  let allComments: YouTubeComment[] = [];
  let nextPageToken: string | undefined = undefined;

  do {
    try {
      const response = await youtube.commentThreads.list({
        part: ["snippet"],
        videoId: videoId,
        maxResults: 100,
        pageToken: nextPageToken,
      });

      const data: youtube_v3.Schema$CommentThreadListResponse = response.data;
      const comments =
        data.items?.map((item) => ({
          id: item.id!,
          snippet: item.snippet!.topLevelComment!.snippet!,
        })) || [];
      allComments = allComments.concat(comments);

      if (allComments.length >= 100) {
        allComments = allComments.slice(0, 100);
        break;
      }

      nextPageToken =
        data.nextPageToken !== null ? data.nextPageToken : undefined;
    } catch (error) {
      console.error(`Error fetching comments for video ${videoId}:`, error);
      break;
    }
  } while (nextPageToken);

  return allComments;
}

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: youtube_v3.Schema$VideoSnippet;
  statistics: youtube_v3.Schema$VideoStatistics;
}

interface YouTubeComment {
  id: string;
  snippet: youtube_v3.Schema$CommentSnippet;
}

function getBestThumbnail(
  thumbnails: youtube_v3.Schema$ThumbnailDetails
): string {
  if (thumbnails.maxres) return thumbnails.maxres.url!;
  if (thumbnails.standard) return thumbnails.standard.url!;
  if (thumbnails.high) return thumbnails.high.url!;
  if (thumbnails.medium) return thumbnails.medium.url!;
  return thumbnails.default!.url!;
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function scrapeVideos(): Promise<Video[]> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const channels = await db
      .select()
      .from(YouTubeChannels)
      .where(eq(YouTubeChannels.userId, userId));

    if (!channels || channels.length === 0) {
      throw new Error("No se encontraron canales para el usuario");
    }

    const newVideos: Video[] = [];
    const newComments: VideoComment[] = [];

    for (const channel of channels) {
      if (!channel.channelId) {
        const channelId = await withTimeout(
          getChannelId(channel.name),
          30000
        );

        if (!channelId) {
          console.error(`No se pudo encontrar el ID del canal ${channel.name}`);
          continue;
        }

        await db
          .update(YouTubeChannels)
          .set({ 
            channelId, 
            updatedAt: new Date() 
          })
          .where(
            and(
              eq(YouTubeChannels.id, channel.id),
              eq(YouTubeChannels.userId, userId)
            )
          );

        channel.channelId = channelId;
      }

      const videoIds = await withTimeout(
        fetchLatestVideosForChannel(channel.channelId),
        30000
      );

      if (videoIds.length === 0) {
        continue;
      }

      const videoDetails = await withTimeout(
        fetchVideoDetails(videoIds),
        30000
      );

      await Promise.all(
        videoDetails.map(async (video) => {
          try {
            const existingVideo = await db
              .select()
              .from(Videos)
              .where(
                and(
                  eq(Videos.videoId, video.id.videoId),
                  eq(Videos.userId, userId)
                )
              )
              .limit(1);

            let videoId: string;

            if (existingVideo.length === 0) {
              const newVideo = {
                videoId: video.id.videoId,
                title: video.snippet.title ?? '',
                description: video.snippet.description ?? '',
                publishedAt: new Date(video.snippet.publishedAt ?? new Date()),
                thumbnailUrl: getBestThumbnail(video.snippet.thumbnails ?? {}),
                channelId: channel.channelId!,
                channelTitle: video.snippet.channelTitle ?? '',
                userId,
                viewCount: parseInt(video.statistics.viewCount ?? '0', 10),
                likeCount: parseInt(video.statistics.likeCount ?? '0', 10),
                dislikeCount: parseInt(video.statistics.dislikeCount ?? '0', 10),
                commentCount: parseInt(video.statistics.commentCount ?? '0', 10),
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              const [insertedVideo] = await db
                .insert(Videos)
                .values(newVideo)
                .returning();

              newVideos.push(insertedVideo);
              videoId = insertedVideo.id;
            } else {
              videoId = existingVideo[0].id;
            }

            // Obtener y procesar comentarios solo para videos nuevos
            if (!existingVideo.length) {
              const comments = await withTimeout(
                fetchVideoComments(video.id.videoId),
                30000
              );

              await Promise.all(
                comments.map(async (comment) => {
                  try {
                    const newComment = {
                      videoId,
                      userId,
                      commentText: comment.snippet.textDisplay ?? '',
                      likeCount: parseInt(`${comment.snippet.likeCount ?? 0}`, 10),
                      dislikeCount: 0,
                      publishedAt: new Date(comment.snippet.publishedAt ?? new Date()),
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };

                    const [insertedComment] = await db
                      .insert(VideoComments)
                      .values(newComment)
                      .returning();

                    newComments.push(insertedComment);
                  } catch (error) {
                    console.error(
                      `Error al insertar comentario para el video ${videoId}:`,
                      error
                    );
                  }
                })
              );
            }
          } catch (error) {
            console.error(
              `Error al procesar el video ${video.id.videoId}:`,
              error
            );
          }
        })
      );
    }

    return newVideos;
  } catch (error) {
    console.error("Error en scrapeVideos:", error);
    throw error;
  }
}

export async function updateVideoStatistics() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const videos = await db
    .select()
    .from(Videos)
    .where(eq(Videos.userId, userId));

  for (const video of videos) {
    const [updatedVideo] = await fetchVideoDetails([video.videoId]);
    if (updatedVideo) {
      await db
        .update(Videos)
        .set({
          viewCount: parseInt(updatedVideo.statistics.viewCount || "0", 10),
          likeCount: parseInt(updatedVideo.statistics.likeCount || "0", 10),
          dislikeCount: parseInt(
            updatedVideo.statistics.dislikeCount || "0",
            10
          ),
          commentCount: parseInt(
            updatedVideo.statistics.commentCount || "0",
            10
          ),
          updatedAt: new Date(),
        })
        .where(eq(Videos.videoId, video.videoId));
    }
  }
}
