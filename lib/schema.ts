import { z } from "zod";
import { THROW_TYPES } from "./throw-types";

export const LineupSchema = z.object({
  map: z.string().min(1, "Map is required"),
  side: z.enum(["T", "CT", "ANY"]),
  utility: z.enum(["SMOKE", "FLASH", "MOLLY", "HE", "DECOY"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  tags: z.string(),
  startSpot: z.string().min(1, "Start spot is required"),
  throwType: z.enum(THROW_TYPES),
  tickrate: z.enum(["TR64", "TR128", "ANY"]),
});

export type LineupInput = z.infer<typeof LineupSchema>;
