const express = require("express")
const cors = require("cors")

const workflowRoutes = require("./routes/workflowRoutes")
const executionRoutes = require("./routes/executionRoutes")

const sequelize = require("./config/db")
const { Workflow, Step, Rule, Execution, ExecutionLog } = require("./models")

const app = express()

// ── CORS — allow frontend dev server ────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use(express.json())

// ── Health ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Hally Workflow Automation Engine — Royal Edition", version: "1.0.0" })
})

app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate()
    res.json({ status: "ok", server: "running", database: "connected", timestamp: new Date().toISOString() })
  } catch (error) {
    res.status(500).json({ status: "error", server: "running", database: "disconnected", error: error.message })
  }
})

// ── Frontend error logger ─────────────────────────────────────────────────────
app.post("/api/log-error", (req, res) => {
  console.error(">>> REACT ERROR <<<", req.body?.error, req.body?.stack)
  res.json({ received: true })
})

// ── Test utilities ───────────────────────────────────────────────────────────
app.get("/api/test/database-status", async (req, res) => {
  try {
    const counts = {
      workflows: await Workflow.count(),
      steps: await Step.count(),
      rules: await Rule.count(),
      executions: await Execution.count(),
      execution_logs: await ExecutionLog.count(),
    }
    res.json(counts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/test/create-workflow", async (req, res) => {
  try {
    const wf = await Workflow.create({
      name: "Expense Approval Test",
      version: 1,
      is_active: true,
      input_schema: { amount: { type: "number" }, country: { type: "string" }, priority: { type: "string" } }
    })
    res.status(201).json(wf)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/test/create-steps", async (req, res) => {
  try {
    const { workflow_id } = req.body
    if (!workflow_id) return res.status(400).json({ error: "workflow_id is required" })
    const workflow = await Workflow.findByPk(workflow_id)
    if (!workflow) return res.status(404).json({ error: "Workflow not found" })

    const steps = await Step.bulkCreate([
      { name: "Manager Approval",    step_type: "approval",     order: 1, workflow_id },
      { name: "Finance Notification",step_type: "notification", order: 2, workflow_id },
      { name: "Task Rejection",      step_type: "task",         order: 3, workflow_id },
    ])
    res.status(201).json(steps)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/test/create-rules", async (req, res) => {
  try {
    const { step_id } = req.body
    if (!step_id) return res.status(400).json({ error: "step_id is required" })

    const currentStep = await Step.findByPk(step_id)
    if (!currentStep) return res.status(404).json({ error: "Step not found" })

    const targetSteps = await Step.findAll({
      where: { workflow_id: currentStep.workflow_id, name: ["Finance Notification", "Task Rejection"] }
    })
    const financeStep = targetSteps.find(s => s.name === "Finance Notification")
    const rejectStep  = targetSteps.find(s => s.name === "Task Rejection")

    const rules = await Rule.bulkCreate([
      { step_id, priority: 1, condition: "data.amount > 100 && data.country == 'US' && data.priority == 'High'", next_step_id: financeStep?.id },
      { step_id, priority: 2, condition: "data.amount <= 100", next_step_id: rejectStep?.id },
      { step_id, priority: 3, condition: "DEFAULT", next_step_id: rejectStep?.id },
    ])
    res.status(201).json(rules)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/test/execute-workflow", async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ where: { name: "Expense Approval Test" }, order: [["createdAt", "DESC"]] })
    if (!workflow) return res.status(404).json({ error: "Workflow not found" })
    const startStep = await Step.findByPk(workflow.start_step_id)
    if (!startStep) return res.status(400).json({ error: "Start step not defined" })

    const ExecutionEngineService = require("./services/ExecutionEngineService")
    const execution = await ExecutionEngineService.executeWorkflow(workflow.id, req.body)

    const firstLog = await ExecutionLog.findOne({ where: { execution_id: execution.id }, order: [["createdAt", "ASC"]] })
    let nextStepName = "FINISH"
    if (firstLog?.selected_next_step && firstLog.selected_next_step !== "FINISH") {
      const nextStepObj = await Step.findByPk(firstLog.selected_next_step)
      if (nextStepObj) nextStepName = nextStepObj.name
    }
    res.json({ execution_id: execution.id, current_step: startStep.name, next_step: nextStepName, status: "completed" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/test/fix-start-steps", async (req, res) => {
  try {
    const workflows = await Workflow.findAll()
    const results = []
    for (const wf of workflows) {
      const firstStep = await Step.findOne({ where: { workflow_id: wf.id }, order: [["order", "ASC"]] })
      if (firstStep) {
        await wf.update({ start_step_id: firstStep.id })
        results.push(`Updated ${wf.name} → ${firstStep.name}`)
      }
    }
    res.json({ message: "Fix complete", results })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── Main API routes ───────────────────────────────────────────────────────────
app.use("/api/workflows", workflowRoutes)
app.use("/api/executions", executionRoutes)

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Error]", err.message)
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" })
})

module.exports = app
