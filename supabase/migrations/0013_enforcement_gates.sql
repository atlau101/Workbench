-- Synthesis minimum word count per assignment (default 100)
ALTER TABLE assignments ADD COLUMN min_synthesis_words INTEGER NOT NULL DEFAULT 100;

-- AI skip tracking on attempts
ALTER TABLE assignment_attempts ADD COLUMN ai_skipped BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE assignment_attempts ADD COLUMN ai_user_msg_count INTEGER NOT NULL DEFAULT 0;

-- Reflection quality check cache per response
ALTER TABLE reflection_responses ADD COLUMN quality_pass BOOLEAN;
ALTER TABLE reflection_responses ADD COLUMN quality_feedback TEXT;
ALTER TABLE reflection_responses ADD COLUMN quality_hash TEXT;
