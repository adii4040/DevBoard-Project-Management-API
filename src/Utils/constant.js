export const UserRolesEnum = {
    ADMIN: 'admin',
    PROJECT_ADMIN: 'project_admin',
    MEMBER: 'member'
}

export const AvailableUserRoles = Object.values(UserRolesEnum)

export const TaskStatusEnum = {
    TODO: 'todo',
    PROGRESS: 'progress',
    DONE: 'done'
}

export const AvailableTaskStatuses = Object.values(TaskStatusEnum)

export const TaskPriorityEnum = {
    STANDARD: "standard",
    URGENT: "urgent"
}

export const AvailableTaskPriority = Object.values(TaskPriorityEnum)


export const cookieOption = {
        httpOnly: true,
        secure: true
    }