# Production Workflow - User Guide

## Quick Start

### For Administrators
1. Go to Production page
2. Create a new production job
3. Click "Workflow" button on the job
4. System automatically initializes workflow stages

### For Operators
1. Go to Production page
2. Find your assigned job
3. Click "Workflow" button
4. Start working through stages sequentially

---

## Workflow Stages Overview

### Stage 1-4: Color Printing (Required)
- **Printing - Cyan** - First color layer
- **Printing - Magenta** - Second color layer
- **Printing - Yellow** - Third color layer
- **Printing - Black** - Fourth color layer

### Stage 5: Special Colors (Optional)
- **Printing - Pantone** - Only if job requires special colors

### Stage 6: Coating (Optional)
- **UV/Varnish** - Only if job requires UV or varnish coating

### Stage 7: Surface Treatment (Optional)
- **Lamination** - Only if job requires lamination

### Stage 8: Organization
- **Sorting** - Organize printed sheets

### Stage 9: Embossing (Optional)
- **Emboss** - Only if job requires embossing

### Stage 10-12: Finishing (Required)
- **Dye Cutting** - Cut to final shape
- **Breaking** - Break apart individual pieces
- **Pasting** - Assemble final product (if needed)

---

## Stage Actions

### START Button
**When to use:** Begin working on a stage

**Requirements:**
- Previous stage must be completed
- First stage (Cyan) can start immediately
- Enter operator ID and machine name

**What happens:**
- Stage status changes to "In Progress"
- Timer starts tracking active work time
- Operator and machine are recorded

**Example:**
```
Operator ID: 123
Machine: HB2
Click: START
```

### PAUSE Button
**When to use:** Temporarily stop work on a stage

**Requirements:**
- Stage must be "In Progress"
- Optionally enter reason for pause

**What happens:**
- Stage status changes to "Paused"
- Active work time is saved
- Pause time begins tracking
- Reason is recorded (optional)

**Example:**
```
Reason: Machine maintenance required
Click: PAUSE
```

### RESUME Button
**When to use:** Continue work after a pause

**Requirements:**
- Stage must be "Paused"

**What happens:**
- Stage status changes back to "In Progress"
- Pause duration is calculated and saved
- Work time continues from where it paused

**Example:**
```
Click: RESUME
```

### COMPLETE Button
**When to use:** Finish a stage

**Requirements:**
- Stage must be "In Progress"
- Minimum 1 minute of work time
- Optionally enter waste quantity and notes

**What happens:**
- Stage status changes to "Completed"
- Total duration is calculated
- Next stage becomes available
- Waste and notes are recorded

**Example:**
```
Waste Quantity: 50
Notes: Completed successfully, minimal waste
Click: COMPLETE
```

---

## Stage Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| Pending | Gray | Waiting for previous stage to complete |
| In Progress | Green | Currently being worked on |
| Paused | Orange | Temporarily stopped |
| Completed | Blue | Finished and ready for next stage |

---

## Duration Tracking

### Active Duration
- Time spent actively working on the stage
- Excludes pause time
- Shown as "Duration: 1h 23m"

### Pause Duration
- Time spent paused
- Tracked separately from active time
- Not included in total work time

### Total Duration
- Shown when stage is completed
- Equals active duration (pause time excluded)
- Used for performance analysis

**Example Timeline:**
```
14:15 - Start stage (active time begins)
14:45 - Pause for 30 minutes (pause time: 30m)
15:15 - Resume (active time continues)
16:00 - Complete (total active: 75m, pause: 30m)
```

---

## Common Workflows

### Standard Production Flow
```
1. Start Cyan → Complete Cyan
2. Start Magenta → Complete Magenta
3. Start Yellow → Complete Yellow
4. Start Black → Complete Black
5. Start Sorting → Complete Sorting
6. Start Dye Cutting → Complete Dye Cutting
7. Start Breaking → Complete Breaking
```

### With Special Colors
```
1-4. [Standard color printing]
5. Start Pantone → Complete Pantone
6. Start Sorting → Complete Sorting
7-8. [Finishing stages]
```

### With Coating
```
1-4. [Standard color printing]
5. Start UV/Varnish → Complete UV/Varnish
6. Start Sorting → Complete Sorting
7-8. [Finishing stages]
```

### With Lamination
```
1-4. [Standard color printing]
5. Start Lamination → Complete Lamination
6. Start Sorting → Complete Sorting
7-8. [Finishing stages]
```

---

## Troubleshooting

### "Cannot start stage" error
**Problem:** Start button is disabled
**Solution:**
- Check if previous stage is completed
- For first stage (Cyan), it should always be available
- Refresh the page if stuck

### "Stage must run for at least 1 minute"
**Problem:** Cannot complete stage immediately after starting
**Solution:**
- Wait at least 1 minute before completing
- This prevents accidental clicks

### Duration not updating
**Problem:** Duration shows old value
**Solution:**
- Page auto-refreshes every 5 seconds
- Manually refresh if needed (F5)
- Check if stage is actually "In Progress"

### Operator/Machine not saved
**Problem:** Fields are empty after starting
**Solution:**
- Enter values before clicking START
- Both fields are required
- Check for validation errors

---

## Best Practices

### 1. Always Record Operator & Machine
- Helps track productivity
- Enables machine maintenance scheduling
- Supports performance analysis

### 2. Use Pause Reason
- Helps identify bottlenecks
- Supports process improvement
- Enables root cause analysis

### 3. Record Waste Quantity
- Tracks material efficiency
- Identifies quality issues
- Supports cost analysis

### 4. Add Notes on Completion
- Documents any issues encountered
- Helps with quality control
- Supports continuous improvement

### 5. Don't Skip Stages
- Sequential order is enforced
- Ensures quality control
- Prevents process errors

---

## Performance Tips

### For Faster Workflow
1. Have operator ID and machine ready before starting
2. Minimize pause time
3. Complete stages promptly
4. Use notes for quick reference

### For Better Tracking
1. Always record waste quantity
2. Add pause reasons
3. Include completion notes
4. Update operator assignments

---

## Data Recorded Per Stage

| Field | Purpose | Example |
|-------|---------|---------|
| Stage Name | Identifies stage | "Printing - Cyan" |
| Status | Current state | "in_progress" |
| Started At | When work began | "2026-03-09 14:15:00" |
| Paused At | When paused | "2026-03-09 14:45:00" |
| Resumed At | When resumed | "2026-03-09 15:15:00" |
| Completed At | When finished | "2026-03-09 16:00:00" |
| Active Duration | Work time | 75 minutes |
| Pause Duration | Pause time | 30 minutes |
| Total Duration | Total time | 105 minutes |
| Operator | Who worked | "Muhammad Ali" |
| Machine | Equipment used | "HB2" |
| Waste Quantity | Material lost | 50 units |
| Notes | Additional info | "Completed successfully" |
| Pause Reason | Why paused | "Machine maintenance" |

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Refresh workflow | F5 |
| Open workflow modal | Click "Workflow" button |
| Close modal | Click X or Escape |
| Submit form | Enter or Click button |

---

## FAQ

**Q: Can I skip a stage?**
A: No, stages must be completed in order. This ensures quality control.

**Q: Can I go back to a previous stage?**
A: No, once completed, a stage cannot be restarted. Contact admin if needed.

**Q: What if I pause for a long time?**
A: Pause time is tracked separately. You can resume whenever ready.

**Q: How is duration calculated?**
A: Active duration = total time - pause time. Pause time is excluded from work time.

**Q: Can multiple operators work on one stage?**
A: Only one operator can be assigned per stage. Start a new stage for different operator.

**Q: What if I complete a stage by mistake?**
A: Contact administrator to reset the stage. Be careful with the Complete button.

**Q: How often does the display update?**
A: Automatically every 5 seconds. Manually refresh (F5) for immediate update.

**Q: Can I edit a completed stage?**
A: No, completed stages are locked. Only notes can be viewed.

**Q: What happens if I close the browser?**
A: Your work is saved. Reopen the workflow to continue.

**Q: Can I work on multiple jobs at once?**
A: Yes, but only one stage per job can be "In Progress" at a time.

---

## Support

For issues or questions:
1. Check this guide first
2. Contact your supervisor
3. Reach out to IT support
4. Check system logs for errors

---

## Version History

- **v1.0** (2026-03-09) - Initial release
  - 12 production stages
  - Start/Pause/Resume/Complete actions
  - Duration tracking
  - Waste and notes recording
  - Real-time UI updates
