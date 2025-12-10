import { z } from "zod";

export const deleteRecordsValidationSchema = z.object({
  body: z
    .object({
      ids: z
        .array(
          z
            .uuid({error: "ID should be a valid UUID"})
        )
        .min(1, "At least one ID is required"),
    })
    .strict(),
});
