import express from 'express'
import cookieParser from 'cookie-parser'


const app = express()

// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true
// }))

 //for local dev
 
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static('public'))
app.use(cookieParser())


//Import all the routes
import healthCheckRoute from './routes/healthCheck.routes.js'
import apiKeyRoutes from './routes/apikey.routes.js'
import userRoutes from './routes/auth.routes.js'
import projectRoutes from './routes/project.routes.js'
import notesRoutes from './routes/notes.routes.js'
import taskNotes from './routes/task.routes.js'

app.use('/api/v1/healthcheck', healthCheckRoute)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/user', apiKeyRoutes)
app.use('/api/v1/project', projectRoutes)
app.use('/api/v1/project', notesRoutes)
app.use('/api/v1/project', taskNotes)

// Global error handler (must come after all routes)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    data: null,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

export {app}

