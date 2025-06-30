import { z } from 'zod'
import { AvailableUserRoles } from '../Utils/constant.js'


export const emailValidation = z.object({
    email: z
        .string()
        .trim()
        .email({
            message: "Invalid Email"
        }),
})

export const validateUserLogin = emailValidation.extend({
    password: z
        .string()
        .trim()
        .min(6, { message: "Password must be atleast 6 characters long." })
        .max(10, { message: "Password must not be more than 10 characters." })
})

export const validateUserRegisteration = validateUserLogin.extend({
    fullname: z
        .string()
        .trim(),

    username: z
        .string()
        .trim()
        .min(6, { message: "username must be atleast 6 characters long." })
        .max(10, { message: "username must not be more than 10 characters." })
        .regex(/^[a-z0-9_.-]+$/, {
            message: "Username can only contain lowercase letters, numbers, underscores (_), hyphens (-), and dots (.)",
        }),
    role: z.enum(AvailableUserRoles).optional()


})

export const validateConfirmPassword = z.object({
    newPassword: z
        .string()
        .trim()
        .min(6, { message: "Password must be atleast 6 characters long." })
        .max(10, { message: "Password must not be more than 10 characters." }),
    confirmPassword: z.string()

}).refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"], // this sets the error on confirmPassword field
    message: "Password does not match"
})

export const validateUpdateForm = z.object({
  fullname: z
    .string()
    .trim()
    .min(1, "Fullname can't be empty")
    .optional()
    .or(z.literal("")),

  username: z
    .string()
    .trim()
    .min(6, "Username must contain at least 6 characters")
    .max(10, "Username must not exceed 10 characters")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),

  role: z
    .enum(AvailableUserRoles)
    .optional()
    .or(z.literal("")), 
})
