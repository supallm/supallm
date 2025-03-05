package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
)

type ListCredentialsQuery struct {
	ProjectID uuid.UUID
}

type ListCredentialsHandler struct {
	projectReader ProjectReader
}

func NewListCredentialsHandler(projectReader ProjectReader) ListCredentialsHandler {
	if projectReader == nil {
		slog.Error("projectReader is nil")
		os.Exit(1)
	}

	return ListCredentialsHandler{
		projectReader: projectReader,
	}
}

func (h ListCredentialsHandler) Handle(ctx context.Context, query ListCredentialsQuery) ([]LLMCredential, error) {
	project, err := h.projectReader.GetProject(ctx, query.ProjectID)
	if err != nil {
		return nil, err
	}

	return project.Credentials, nil
}
