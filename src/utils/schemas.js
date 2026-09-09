import { z } from "zod";

export const userSchema = z.strictObject({
    username: z.string()
        .min(3, "Username must be at least 3 characters.")
        .max(50, "Username cannot exceed 50 characters."),
    password: z.string()
        .min(8, "Password must be at least 3 characters")

})

export const evaluateResumeSchema = z.strictObject({
    description: z.string({ required_error: "Job description is required" })
      .min(50, "Job description must be at least 50, characters long")
  });