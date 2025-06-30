import { z } from 'zod'
import { AvailableTaskStatuses, AvailableTaskPriority } from '../Utils/constant.js'

export const validateTaskDetail = z.object({
    title: z
        .string()
        .trim()
        .min(10, { message: "Project title should be at least 10 characters long." })
        .max(20, { message: "Project title must not exceed 20 characters." }),

    description: z
        .string()
        .trim()
        .min(20, { message: "Project description should be at least 20 characters long." })
        .max(300, { message: "Project description must not exceed 100 characters." }),

    taskPriority: z
        .enum(AvailableTaskPriority)
        .optional(),

    dueDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
            message: "Date must be in YYYY-MM-DD format",  //This ensure that given date should be in ISO format only
        })
        .refine(val => !isNaN(Date.parse(val)), {
            message: "Invalid date format. Use ISO or YYYY-MM-DD format."
        }) //Date.parse() convert the date string into timestamp in order to see if it is actual date or not... further isNAN checks if the given date is a numer i.e timestamp or not
        .refine(val => new Date(val) >= new Date(), {
            message: "Due date should be in future!!"
        })
    ,

    assignedTo: z.string().trim().email({ message: "Invalid email" })
})

export const validateNewTask = z.object({
    newTitle: z
        .string()
        .trim()
        .min(10, { message: "Project title should be at least 10 characters long." })
        .max(30, { message: "Project title must not exceed 30 characters." })
        .optional()
        .or(z.literal("")),

    newDesc: z
        .string()
        .trim()
        .min(20, { message: "Project description should be at least 20 characters long." })
        .max(300, { message: "Project description must not exceed 100 characters." })
        .optional()
        .or(z.literal("")),
    newAssignedTo: z.string().trim().email({ message: "Invalid email" }).transform(val => (val === "" ? undefined : val))
        .optional()
        .or(z.literal("")),
    newStatus: z.enum(AvailableTaskStatuses).optional().or(z.literal(""))
})