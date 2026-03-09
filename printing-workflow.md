Here's a structured prompt for adding the complete production workflow:

---

# PRODUCTION WORKFLOW - STRUCTURED IMPLEMENTATION PROMPT

## Overview
Add a complete step-by-step production workflow tracking system to the Production module. Each production stage must have Start, Pause, and Complete buttons with automatic timestamp recording.

---

## Sequential Production Steps

### The workflow consists of 12 sequential stages:

```
1. Printing - Cyan
2. Printing - Magenta
3. Printing - Yellow
4. Printing - Black
5. Printing - Pantone (Special Colors)
6. UV/Varnish
7. Lamination
8. Sorting
9. Emboss
10. Dye Cutting
11. Breaking
12. Pasting
```

---

## Stage Control Requirements

### Each stage must have 3 action buttons:

**1. START Button**
- Action: Begins the stage
- Records: Start timestamp, operator name, machine assigned
- Enables: Pause and Complete buttons
- Disables: Start button
- Updates: Job status to "In Production - [Stage Name]"

**2. PAUSE Button**
- Action: Temporarily halts the stage
- Records: Pause timestamp, reason (optional)
- Enables: Resume (Start) button
- Keeps: Complete button enabled
- Updates: Job status to "Paused - [Stage Name]"

**3. COMPLETE Button**
- Action: Marks stage as finished
- Records: Completion timestamp, duration, waste quantity (optional)
- Requires: Confirmation dialog
- Enables: Next stage's Start button
- Disables: Current stage buttons
- Updates: Job status to next stage

---

## Database Schema

### Create table for stage tracking:

```sql
CREATE TABLE production_workflow_stages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  stage_name VARCHAR(100) NOT NULL,
  stage_order INT NOT NULL,
  status ENUM('pending', 'in_progress', 'paused', 'completed') DEFAULT 'pending',
  
  -- Timestamps
  started_at DATETIME,
  paused_at DATETIME,
  resumed_at DATETIME,
  completed_at DATETIME,
  
  -- Duration tracking
  active_duration_minutes INT DEFAULT 0,
  pause_duration_minutes INT DEFAULT 0,
  total_duration_minutes INT,
  
  -- Assignment
  operator_id INT,
  operator_name VARCHAR(255),
  machine VARCHAR(100),
  
  -- Additional data
  waste_quantity DECIMAL(10,2),
  notes TEXT,
  pause_reason VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (job_id) REFERENCES production_jobs(id),
  FOREIGN KEY (operator_id) REFERENCES users(id)
);

CREATE INDEX idx_workflow_job ON production_workflow_stages(job_id);
CREATE INDEX idx_workflow_status ON production_workflow_stages(status);
CREATE INDEX idx_workflow_stage ON production_workflow_stages(stage_name);
```

---

## Business Logic Rules

### 1. **Sequential Stage Enforcement:**
```
- Stage N cannot start until Stage N-1 is completed
- Exception: Stage 1 (Cyan) can start immediately
- Stages cannot be skipped
- Stages cannot be reordered
```

### 2. **Stage Dependencies:**
```
IF job specifications include:
  - No Pantone colors → Skip Pantone stage
  - No UV/Varnish → Skip UV/Varnish stage
  - No Lamination → Skip Lamination stage
  - No Emboss → Skip Emboss stage
  
Only required stages appear in workflow
```

### 3. **Pause/Resume Logic:**
```javascript
When PAUSE clicked:
  - Record pause_at timestamp
  - Calculate active_duration so far
  - Change status to 'paused'
  - Disable Complete button (until resumed)

When RESUME (Start after pause) clicked:
  - Record resumed_at timestamp
  - Continue active_duration tracking
  - Change status back to 'in_progress'
  - Re-enable Complete button
```

### 4. **Completion Validation:**
```javascript
Before allowing COMPLETE:
  - Minimum stage duration check (prevent accidental clicks)
  - Optional: Waste quantity entry
  - Optional: Quality check notes
  - Confirmation dialog: "Mark [Stage] as complete?"
```

---

## UI Implementation

### Stage Card Component:

```
┌──────────────────────────────────────────────────────────┐
│ 1. PRINTING - CYAN                           [In Progress]│
├──────────────────────────────────────────────────────────┤
│                                                            │
│ Machine: HB2                  Operator: Muhammad Ali      │
│ Started: 2:15 PM             Duration: 1h 23m             │
│                                                            │
│ [⏸ Pause]  [✓ Complete]                                  │
│                                                            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 2. PRINTING - MAGENTA                            [Pending]│
├──────────────────────────────────────────────────────────┤
│                                                            │
│ Waiting for Cyan to complete...                           │
│                                                            │
│ [▶ Start] (Disabled)                                      │
│                                                            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 3. PRINTING - YELLOW                             [Pending]│
└──────────────────────────────────────────────────────────┘
```

### Status States & Colors:

```javascript
const stageStatusColors = {
  'pending': '#9E9E9E',      // Grey - Not started
  'in_progress': '#4CAF50',  // Green - Currently active
  'paused': '#FF9800',       // Orange - Temporarily stopped
  'completed': '#2196F3'     // Blue - Finished
};
```

---

## API Endpoints Required

### 1. GET /api/production/:jobId/workflow
**Purpose:** Get all workflow stages for a job

**Response:**
```json
{
  "job_id": 836,
  "current_stage": "Printing - Cyan",
  "stages": [
    {
      "id": 1,
      "stage_name": "Printing - Cyan",
      "stage_order": 1,
      "status": "in_progress",
      "started_at": "2026-02-25T14:15:00Z",
      "active_duration_minutes": 83,
      "operator_name": "Muhammad Ali",
      "machine": "HB2",
      "can_start": false,
      "can_pause": true,
      "can_complete": true
    },
    {
      "id": 2,
      "stage_name": "Printing - Magenta",
      "stage_order": 2,
      "status": "pending",
      "can_start": false,
      "can_pause": false,
      "can_complete": false
    }
  ]
}
```

### 2. POST /api/production/:jobId/workflow/:stageId/start
**Purpose:** Start a production stage

**Request:**
```json
{
  "operator_id": 123,
  "machine": "HB2",
  "notes": "Starting Cyan printing"
}
```

**Response:**
```json
{
  "success": true,
  "stage_id": 1,
  "started_at": "2026-02-25T14:15:00Z",
  "status": "in_progress"
}
```

### 3. POST /api/production/:jobId/workflow/:stageId/pause
**Purpose:** Pause a production stage

**Request:**
```json
{
  "reason": "Machine maintenance required"
}
```

**Response:**
```json
{
  "success": true,
  "paused_at": "2026-02-25T15:30:00Z",
  "active_duration_minutes": 75,
  "status": "paused"
}
```

### 4. POST /api/production/:jobId/workflow/:stageId/resume
**Purpose:** Resume a paused stage

**Response:**
```json
{
  "success": true,
  "resumed_at": "2026-02-25T15:45:00Z",
  "status": "in_progress"
}
```

### 5. POST /api/production/:jobId/workflow/:stageId/complete
**Purpose:** Mark stage as complete

**Request:**
```json
{
  "waste_quantity": 50,
  "notes": "Completed successfully, minimal waste",
  "quality_approved": true
}
```

**Response:**
```json
{
  "success": true,
  "completed_at": "2026-02-25T16:00:00Z",
  "total_duration_minutes": 105,
  "next_stage": "Printing - Magenta",
  "status": "completed"
}
```

---

## Frontend Component Structure

### React Component Example:

```jsx
function ProductionWorkflow({ jobId }) {
  const [stages, setStages] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  
  useEffect(() => {
    fetchWorkflowStages(jobId);
  }, [jobId]);
  
  const handleStart = async (stageId) => {
    const result = await api.post(`/production/${jobId}/workflow/${stageId}/start`, {
      operator_id: currentUser.id,
      machine: selectedMachine
    });
    
    if (result.success) {
      refreshStages();
      showNotification('Stage started successfully');
    }
  };
  
  const handlePause = async (stageId) => {
    const reason = prompt('Reason for pause (optional):');
    const result = await api.post(`/production/${jobId}/workflow/${stageId}/pause`, {
      reason
    });
    
    if (result.success) {
      refreshStages();
    }
  };
  
  const handleComplete = async (stageId) => {
    const confirmed = confirm('Mark this stage as complete?');
    if (!confirmed) return;
    
    const wasteQty = prompt('Enter waste quantity (optional):');
    const result = await api.post(`/production/${jobId}/workflow/${stageId}/complete`, {
      waste_quantity: wasteQty ? parseFloat(wasteQty) : 0
    });
    
    if (result.success) {
      refreshStages();
      showNotification('Stage completed! Next stage is now available.');
    }
  };
  
  return (
    <div className="workflow-container">
      <h2>Production Workflow - Job #{jobId}</h2>
      
      {stages.map(stage => (
        <StageCard
          key={stage.id}
          stage={stage}
          onStart={() => handleStart(stage.id)}
          onPause={() => handlePause(stage.id)}
          onComplete={() => handleComplete(stage.id)}
        />
      ))}
    </div>
  );
}

function StageCard({ stage, onStart, onPause, onComplete }) {
  return (
    <div className={`stage-card status-${stage.status}`}>
      <div className="stage-header">
        <h3>{stage.stage_name}</h3>
        <span className="status-badge">{stage.status}</span>
      </div>
      
      {stage.status === 'in_progress' && (
        <div className="stage-info">
          <p>Machine: {stage.machine}</p>
          <p>Operator: {stage.operator_name}</p>
          <p>Duration: {formatDuration(stage.active_duration_minutes)}</p>
        </div>
      )}
      
      <div className="stage-actions">
        {stage.can_start && (
          <button onClick={onStart} className="btn-start">
            ▶ Start
          </button>
        )}
        
        {stage.can_pause && (
          <button onClick={onPause} className="btn-pause">
            ⏸ Pause
          </button>
        )}
        
        {stage.can_complete && (
          <button onClick={onComplete} className="btn-complete">
            ✓ Complete
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Business Logic Functions

### 1. Initialize Workflow:
```javascript
async function initializeWorkflow(jobId) {
  const jobSpecs = await getJobSpecifications(jobId);
  
  const allStages = [
    { name: 'Printing - Cyan', order: 1, required: true },
    { name: 'Printing - Magenta', order: 2, required: true },
    { name: 'Printing - Yellow', order: 3, required: true },
    { name: 'Printing - Black', order: 4, required: true },
    { name: 'Printing - Pantone', order: 5, required: jobSpecs.has_pantone },
    { name: 'UV/Varnish', order: 6, required: jobSpecs.has_uv_varnish },
    { name: 'Lamination', order: 7, required: jobSpecs.has_lamination },
    { name: 'Sorting', order: 8, required: true },
    { name: 'Emboss', order: 9, required: jobSpecs.has_emboss },
    { name: 'Dye Cutting', order: 10, required: true },
    { name: 'Breaking', order: 11, required: true },
    { name: 'Pasting', order: 12, required: jobSpecs.needs_pasting }
  ];
  
  // Filter only required stages
  const requiredStages = allStages.filter(s => s.required);
  
  // Create workflow records
  for (const stage of requiredStages) {
    await createWorkflowStage(jobId, stage.name, stage.order);
  }
}
```

### 2. Determine Button States:
```javascript
function determineButtonStates(stage, allStages) {
  const previousStage = allStages.find(s => s.stage_order === stage.stage_order - 1);
  
  return {
    can_start: stage.status === 'pending' && 
               (stage.stage_order === 1 || previousStage?.status === 'completed'),
    
    can_pause: stage.status === 'in_progress',
    
    can_complete: stage.status === 'in_progress' && 
                  stage.active_duration_minutes >= 1 // Minimum 1 minute
  };
}
```

### 3. Calculate Duration:
```javascript
function calculateDuration(stage) {
  if (stage.status === 'completed') {
    return stage.total_duration_minutes;
  }
  
  if (stage.status === 'in_progress') {
    const now = new Date();
    const started = new Date(stage.started_at);
    const elapsed = Math.floor((now - started) / 60000); // minutes
    return stage.active_duration_minutes + elapsed;
  }
  
  return 0;
}
```

---

## Validation Rules

### Before Starting Stage:
```javascript
async function validateStageStart(jobId, stageId) {
  const stage = await getStage(stageId);
  const allStages = await getWorkflowStages(jobId);
  
  // Check if previous stage is complete
  if (stage.stage_order > 1) {
    const prevStage = allStages.find(s => s.stage_order === stage.stage_order - 1);
    if (prevStage.status !== 'completed') {
      throw new Error(`Cannot start ${stage.stage_name} until ${prevStage.stage_name} is completed`);
    }
  }
  
  // Check if machine is available
  if (stage.machine) {
    const isAvailable = await checkMachineAvailability(stage.machine);
    if (!isAvailable) {
      throw new Error(`Machine ${stage.machine} is currently in use`);
    }
  }
  
  return true;
}
```

### Before Completing Stage:
```javascript
async function validateStageCompletion(stageId) {
  const stage = await getStage(stageId);
  
  // Minimum duration check (prevent accidental completion)
  if (stage.active_duration_minutes < 1) {
    throw new Error('Stage must run for at least 1 minute before completion');
  }
  
  // Check if stage is actually in progress
  if (stage.status !== 'in_progress') {
    throw new Error('Can only complete stages that are in progress');
  }
  
  return true;
}
```

---

## Real-Time Updates

### WebSocket Implementation:
```javascript
// Server-side: Broadcast stage updates
io.on('connection', (socket) => {
  socket.on('stage_updated', (data) => {
    io.to(`job_${data.job_id}`).emit('workflow_updated', {
      job_id: data.job_id,
      stage_id: data.stage_id,
      status: data.status,
      duration: data.duration
    });
  });
});

// Client-side: Listen for updates
socket.on('workflow_updated', (data) => {
  updateStageInUI(data.stage_id, data);
});
```

---

## Reporting & Analytics

### Stage Duration Report:
```javascript
async function getStagePerformanceReport(jobId) {
  const stages = await getCompletedStages(jobId);
  
  return stages.map(stage => ({
    stage_name: stage.stage_name,
    duration_minutes: stage.total_duration_minutes,
    operator: stage.operator_name,
    waste_quantity: stage.waste_quantity,
    efficiency: calculateEfficiency(stage)
  }));
}
```

---

## Error Handling

```javascript
try {
  await startStage(jobId, stageId);
} catch (error) {
  if (error.code === 'STAGE_BLOCKED') {
    showError('Previous stage must be completed first');
  } else if (error.code === 'MACHINE_BUSY') {
    showError('Selected machine is currently in use');
  } else if (error.code === 'NO_OPERATOR') {
    showError('Please assign an operator before starting');
  } else {
    showError('Failed to start stage. Please try again.');
  }
}
```

---

## Testing Checklist

- [ ] Can start first stage (Cyan) immediately
- [ ] Cannot start stage 2 until stage 1 is completed
- [ ] Pause button works and records timestamp
- [ ] Resume continues from paused state
- [ ] Complete button requires confirmation
- [ ] Duration calculates correctly including pause time
- [ ] Stages skip correctly based on job specs (no Pantone, etc.)
- [ ] Real-time updates work across multiple users
- [ ] Waste quantity entry works
- [ ] Machine assignment validates availability
- [ ] Mobile view is usable
- [ ] Buttons disable/enable appropriately