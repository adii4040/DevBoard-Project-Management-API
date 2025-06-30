import { z } from 'zod'

export const validateNote = z.object({
  note: z.string().trim().min(1,{message:"Note is required"})
})