# HOW TO USE THE REPLIT AGENT PROMPT

**TL;DR:** Copy the prompt from `REPLIT_AGENT_PROMPT.md`, paste it into your Replit project's agent chat, walk away, and come back in 30 minutes. Done.

---

## STEP-BY-STEP INSTRUCTIONS

### 1. Open Your Replit Project

Go to: https://replit.com/@[your-username]/[your-project-name]

Make sure you're in the Casurance/InsureLimos project where your CRM code is.

### 2. Open the Agent Chat

Look for the **Agent** tab or button in Replit (usually top right or left side).

If you don't see it:
- Click the three-dot menu (⋮)
- Look for "Copilot" or "Agent"
- Enable it if not visible

### 3. Copy the Prompt

1. Open the file: **`REPLIT_AGENT_PROMPT.md`** in the outputs folder
2. Find the section between `===== START PROMPT =====` and `===== END PROMPT =====`
3. **Select all text** between those markers (Ctrl+A or Command+A)
4. **Copy it** (Ctrl+C or Command+C)

### 4. Paste Into Agent Chat

1. Click in the Replit **Agent** chat input box
2. **Paste** the entire prompt (Ctrl+V or Command+V)
3. Press **Enter** or click **Send**

### 5. Let It Run

The agent will now execute all 8 phases:

**Phase 1** (5 min): Verify environment  
**Phase 2** (10 min): Create API endpoint  
**Phase 3** (15 min): Create components  
**Phase 4** (5 min): Replace dashboard  
**Phase 5** (10 min): Build & test  
**Phase 6** (5 min): Git commits  
**Phase 7** (5 min): Final verification  
**Phase 8** (5 min): Push & deploy  

**Total: ~60 minutes** (but you don't need to watch it)

### 6. Monitor (Optional)

While the agent runs, you can:
- ✅ Watch the progress in the agent chat (it will show step-by-step output)
- ✅ Check Replit's shell/terminal for any errors
- ✅ Let it run in background (no need to stay in Replit)

### 7. Verify When Done

After ~1 hour, check:

**In Replit:**
- [ ] No red error messages in agent output
- [ ] All 8 phases completed
- [ ] Files created: `app/api/workflow-items/route.ts`, `components/dashboard/WorkflowKanban.tsx`, etc.

**In Railway (your production):**
- [ ] Go to https://railway.app
- [ ] Click your Casurance/XRisk project
- [ ] Check "Deployments" tab
- [ ] Look for green **"Live"** status (not building, not failed)

**In your browser:**
- [ ] Open https://your-domain/dashboard
- [ ] Verify you see:
  - Kanban board with 4 columns
  - MetricBar at top
  - Cards with client names
  - No console errors (F12 → Console)

---

## WHAT THE AGENT WILL DO

The agent executes these commands (you don't need to type them):

```bash
# 1. Verify setup
node --version && npm --version
ls -la app/ components/ lib/
test -f .env.local

# 2. Create API endpoint
mkdir -p app/api/workflow-items
cat > app/api/workflow-items/route.ts << 'EOF'
[API code here]
EOF

# 3. Create components
cat > components/dashboard/WorkflowKanban.tsx << 'EOF'
[Kanban code]
EOF

cat > components/dashboard/MetricBar.tsx << 'EOF'
[MetricBar code]
EOF

# 4. Replace dashboard
cp components/dashboard/DashboardPage.tsx components/dashboard/DashboardPage.tsx.backup
cat > components/dashboard/DashboardPage.tsx << 'EOF'
[Dashboard code]
EOF

# 5. Build & test
npm run build
npm run dev &
curl http://localhost:3000/api/workflow-items?limit=5

# 6. Git commits (3 separate commits)
git add app/api/workflow-items/route.ts
git commit -m "feat: add unified workflow-items API endpoint"

git add components/dashboard/WorkflowKanban.tsx components/dashboard/MetricBar.tsx
git commit -m "feat: add unified kanban and metrics components"

git add components/dashboard/DashboardPage.tsx
git commit -m "feat: refactor dashboard with unified workflow kanban"

# 7. Final verification
git status
curl http://localhost:3000/api/workflow-items?limit=5

# 8. Push & deploy
git push origin dashboard-refactor-unified-kanban
git checkout main
git merge dashboard-refactor-unified-kanban
git push origin main
```

That's it. The agent handles all of this automatically.

---

## IF SOMETHING GOES WRONG

### Agent says "ERROR" or shows red text

**Stop and read the error message carefully.**

Common issues:

**1. "Cannot find module @/lib/supabase/admin"**
- Your supabase import path is different
- Tell the agent: "The supabase admin import should be: `import { supabaseClient } from '@/lib/supabase'` (adjust path)"
- Or manually edit `app/api/workflow-items/route.ts` line 3

**2. "npm run build failed"**
- Usually import errors
- Check browser console (F12) for clues
- Ask agent: "Show me the build error details"

**3. "git push failed"**
- Usually authentication issue
- Verify you're logged into GitHub in Replit
- Check Replit Settings → GitHub integration

**4. "Cannot create directory app/api/workflow-items"**
- The directory already exists (OK, just continue)
- Agent will overwrite the file

### Agent says "STOP" and stops

- This is intentional - agent hit an error and wants clarification
- Read the error carefully
- Respond with the fix (e.g., "The correct import path is...")
- Let agent continue

### You want to stop the agent

Click the **Stop** button in the Replit agent chat (or press Escape).

Then you can:
- Fix the issue manually
- Tell the agent to continue from a specific phase
- Restart with a corrected prompt

---

## MANUAL OVERRIDE (If Agent Gets Stuck)

If the agent gets stuck or hangs:

1. **Stop the agent** (click Stop button)
2. **Open Replit Shell** (bottom of screen)
3. **Run manually:**
   ```bash
   # Check git status
   git status
   
   # Check if files exist
   ls -la app/api/workflow-items/route.ts
   ls -la components/dashboard/WorkflowKanban.tsx
   
   # Try building
   npm run build
   
   # Commit manually if files exist
   git add app/api/workflow-items/route.ts
   git commit -m "feat: add workflow-items API"
   ```
4. **Continue where it left off**

---

## AFTER DEPLOYMENT (What's Next?)

Once the agent finishes and Railway is "Live":

### Test the Dashboard

1. Open your dashboard: `https://your-domain/dashboard`
2. Verify:
   - [ ] Kanban board visible (4 columns)
   - [ ] MetricBar shows correct numbers
   - [ ] Clicking a card opens detail panel
   - [ ] No red errors in browser console (F12)

### Test the API

1. Open in browser: `https://your-domain/api/workflow-items?limit=10`
2. Should return JSON with `items`, `metrics`, `pagination`

### Optional: Verify Code

1. Go to GitHub repo
2. Check `main` branch
3. Verify 3 new commits were pushed
4. Verify files exist in correct paths

### Done! 🎉

Your dashboard refactor is complete. The agent did everything.

---

## IF YOU WANT TO CUSTOMIZE AFTER DEPLOYMENT

You can now easily add:

- **Drag-drop kanban** (install react-beautiful-dnd, wire up handlers)
- **Status update API** (create PATCH /api/workflow-items/{id})
- **Table toggle** (add button, create WorkflowTable component)
- **Bulk actions** (select multiple cards, archive/assign/email)
- **Search/filter** (add filter buttons to Topbar)

All scaffolding is in place. Just wire up handlers.

---

## QUESTIONS?

- **"Why is the agent slow?"** → It's running real code (building, testing, pushing). This takes time.
- **"Can I interrupt it?"** → Yes, click Stop. But it's better to let it finish.
- **"What if it fails partway?"** → It will STOP and tell you. Fix the issue and restart from that phase.
- **"Will it break my project?"** → No. It creates a backup first (`DashboardPage.tsx.backup.pre-refactor`) and commits to a feature branch.
- **"Can I undo if something breaks?"** → Yes. `git checkout main && git reset --hard HEAD~3`

---

## TL;DR COMMAND

```
1. Copy prompt from REPLIT_AGENT_PROMPT.md (between =====)
2. Paste into Replit Agent chat
3. Press Enter
4. Wait 60 minutes
5. Check Railway dashboard for "Live" status
6. Done!
```

---

**Total time you need to spend: ~5 minutes (copy/paste). Agent does the rest.**

Good luck! 🚀
