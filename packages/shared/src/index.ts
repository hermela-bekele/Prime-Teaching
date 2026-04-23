import { z } from "zod";

export const roleSchema = z.enum(["teacher", "dept_head", "leader"]);
export type Role = z.infer<typeof roleSchema>;

export const generationJobSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["queued", "processing", "succeeded", "failed"]),
  requestedBy: z.string(),
  createdAt: z.string().datetime()
});

export type GenerationJob = z.infer<typeof generationJobSchema>;
