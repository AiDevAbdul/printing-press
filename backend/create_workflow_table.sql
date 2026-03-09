-- Production Workflow Stages Table
-- Run this SQL directly if migration fails

-- Create enum type
DO $$ BEGIN
    CREATE TYPE production_workflow_stages_status_enum AS ENUM('pending', 'in_progress', 'paused', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create table
CREATE TABLE IF NOT EXISTS production_workflow_stages (
    id SERIAL PRIMARY KEY,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL,
    status production_workflow_stages_status_enum NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP,
    paused_at TIMESTAMP,
    resumed_at TIMESTAMP,
    completed_at TIMESTAMP,
    active_duration_minutes INTEGER NOT NULL DEFAULT 0,
    pause_duration_minutes INTEGER NOT NULL DEFAULT 0,
    total_duration_minutes INTEGER,
    operator_name VARCHAR(255),
    machine VARCHAR(100),
    waste_quantity NUMERIC(10,2),
    notes TEXT,
    pause_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    job_id UUID,
    operator_id UUID
);

-- Add foreign keys
DO $$ BEGIN
    ALTER TABLE production_workflow_stages
    ADD CONSTRAINT fk_workflow_job
    FOREIGN KEY (job_id)
    REFERENCES production_jobs(id)
    ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE production_workflow_stages
    ADD CONSTRAINT fk_workflow_operator
    FOREIGN KEY (operator_id)
    REFERENCES users(id)
    ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workflow_job ON production_workflow_stages(job_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status ON production_workflow_stages(status);
CREATE INDEX IF NOT EXISTS idx_workflow_stage ON production_workflow_stages(stage_name);

-- Verify table was created
SELECT 'production_workflow_stages table created successfully' AS status;
