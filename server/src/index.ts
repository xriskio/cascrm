import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

// Routes
import clientsRouter from './routes/clients.js'
import renewalsRouter from './routes/renewals.js'
import renewalWorkflowsRouter from './routes/renewal-workflows.js'
import leadsRouter from './routes/leads.js'
import quotesRouter from './routes/quotes.js'
import policiesRouter from './routes/policies.js'
import dashboardRouter from './routes/dashboard.js'
import searchRouter from './routes/search.js'
import activityRouter from './routes/activity.js'
import emailRouter from './routes/email.js'
import marketSubmissionsRouter from './routes/market-submissions.js'
import qqcatalystRouter from './routes/qqcatalyst.js'
import authRouter from './routes/auth.js'
import workflowItemsRouter from './routes/workflow-items.js'
import adminRouter from './routes/admin.js'
import tasksRouter from './routes/tasks.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// API routes
app.use('/api/clients', clientsRouter)
app.use('/api/renewals', renewalsRouter)
app.use('/api/renewal-workflows', renewalWorkflowsRouter)
app.use('/api/leads', leadsRouter)
app.use('/api/quotes', quotesRouter)
app.use('/api/policies', policiesRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/search', searchRouter)
app.use('/api/activity', activityRouter)
app.use('/api/email', emailRouter)
app.use('/api/market-submissions', marketSubmissionsRouter)
app.use('/api/qqcatalyst', qqcatalystRouter)
app.use('/api/auth', authRouter)
app.use('/api/workflow-items', workflowItemsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/tasks', tasksRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static Vite build in production
const publicDir = path.join(__dirname, '../public')
app.use(express.static(publicDir))
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
