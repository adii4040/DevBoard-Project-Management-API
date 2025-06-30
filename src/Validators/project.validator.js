import { z } from 'zod';

export const validateProjectDetails = z.object({
  project_Title: z
    .string()
    .trim()
    .min(10, { message: "Project title should be at least 10 characters long." })
    .max(20, { message: "Project title must not exceed 20 characters." }),

  project_Description: z
    .string()
    .trim()
    .min(20, { message: "Project description should be at least 20 characters long." })
    .max(100, { message: "Project description must not exceed 100 characters." }),
  
  memberEmail: z.array(z.string().email()).min(1, "At least one member required")
});


export const validateRole = z.object({
  role: z.string().trim().min(1,{message:"Role is required"})
})


export const addMemberValidation = z.object({
  memberEmail: z.string().email({message: "Invalid Email"}),
   role: z.string().trim().min(1,{message:"Role is required"})
})