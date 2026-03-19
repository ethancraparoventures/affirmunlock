import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  affirmation: router({
    /**
     * Upload a base64-encoded audio recording and transcribe it with Whisper.
     * Returns the transcription text.
     */
    transcribe: publicProcedure
      .input(
        z.object({
          audioBase64: z.string(), // base64-encoded audio file
          mimeType: z.string().default("audio/m4a"), // audio/m4a, audio/wav, audio/mp4
        })
      )
      .mutation(async ({ input }) => {
        // Decode base64 → Buffer
        const buffer = Buffer.from(input.audioBase64, "base64");

        // Determine file extension from mime type
        const extMap: Record<string, string> = {
          "audio/m4a": "m4a",
          "audio/mp4": "m4a",
          "audio/wav": "wav",
          "audio/webm": "webm",
          "audio/mpeg": "mp3",
          "audio/mp3": "mp3",
        };
        const ext = extMap[input.mimeType] ?? "m4a";
        const fileKey = `affirmations/recording-${Date.now()}.${ext}`;

        // Upload to S3 so Whisper can access it via URL
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Transcribe with Whisper
        const result = await transcribeAudio({
          audioUrl: url,
          language: "en",
          prompt: "Daily affirmation spoken by user",
        });

        // Handle both success and error response shapes
        const transcript = "text" in result ? (result.text?.trim() ?? "") : "";
        return { transcript };
      }),
  }),
});

export type AppRouter = typeof appRouter;
