package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
)

type GetCredentialQuery struct {
	ProjectID    uuid.UUID
	CredentialID uuid.UUID
}

type GetCredentialHandler struct {
	projectReader ProjectReader
}

func NewGetCredentialHandler(projectReader ProjectReader) GetCredentialHandler {
	if projectReader == nil {
		slog.Error("projectReader is nil")
		os.Exit(1)
	}

	return GetCredentialHandler{
		projectReader: projectReader,
	}
}

func (h GetCredentialHandler) Handle(ctx context.Context, query GetCredentialQuery) (Credential, error) {
	credential, err := h.projectReader.ReadCredential(ctx, query.ProjectID, query.CredentialID)
	if err != nil {
		return Credential{}, err
	}

	return credential, nil
}
