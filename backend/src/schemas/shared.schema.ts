import {z} from "zod";

export const paginationQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int("Page must be an integer")
      .min(1, "Page must be at least 1")
      .optional()
      .default(1),
    limit: z.coerce
      .number()
      .int("Limit must be an integer")
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .optional()
      .default(10),
    skip: z.coerce
      .number()
      .int("Skip must be an integer")
      .min(0, "Skip cannot be negative")
      .optional(),
  })
  .transform((data) => ({
    page: data.page,
    limit: data.limit,
    skip: data.skip !== undefined ? data.skip : (data.page - 1) * data.limit,
  }));

  export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;