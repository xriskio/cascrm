import { Router } from 'express'
import { Resend } from 'resend'

const router = Router()
const resend = new Resend(process.env.RESEND_API_KEY)

router.post('/send', async (req, res) => {
  try {
    const { to, subject, html, from = 'noreply@casurance.net' } = req.body
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'to, subject, and html are required' })
    }
    const { data, error } = await resend.emails.send({ from, to, subject, html })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ success: true, id: data?.id })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
