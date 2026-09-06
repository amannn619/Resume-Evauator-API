import { z } from "zod";

export const userSchema = z.strictObject({
    username: z.string()
        .min(3, "Username must be at least 3 characters.")
        .max(50, "Username cannot exceed 50 characters."),
    password: z.string()
        .min(8, "Password must be at least 3 characters")

})