CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    auth_provider JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT projects_name_user_unique UNIQUE (name, user_id)
);

CREATE TABLE IF NOT EXISTS credentials (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50) NOT NULL,
    api_key_encrypted VARCHAR(255) NOT NULL,
    api_key_obfuscated VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS models (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    provider_model VARCHAR(100) NOT NULL,
    system_prompt TEXT NOT NULL,
    parameters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT models_slug_project_unique UNIQUE (slug, project_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    config JSONB,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    token_usage JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS stream_chunks (
    id UUID PRIMARY KEY,
    response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    index INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_last BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_credentials_project_id ON credentials(project_id);
CREATE INDEX idx_models_project_id ON models(project_id);
CREATE INDEX idx_models_credential_id ON models(credential_id);
CREATE INDEX idx_sessions_project_id ON sessions(project_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_requests_session_id ON requests(session_id);
CREATE INDEX idx_requests_model_id ON requests(model_id);
CREATE INDEX idx_responses_request_id ON responses(request_id);
CREATE INDEX idx_responses_session_id ON responses(session_id);
CREATE INDEX idx_stream_chunks_response_id ON stream_chunks(response_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_credentials_timestamp
BEFORE UPDATE ON credentials
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_models_timestamp
BEFORE UPDATE ON models
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Update last_activity_at when a new request is added to a session
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
   UPDATE sessions SET last_activity_at = NOW() WHERE id = NEW.session_id;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_activity_on_request
AFTER INSERT ON requests
FOR EACH ROW EXECUTE FUNCTION update_session_activity();
