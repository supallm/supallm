package query

import (
	"context"
	"errors"
	"log/slog"
	"os"

	"github.com/google/uuid"
	reader "github.com/supallm/core/internal/adapters/errors"
	"github.com/supallm/core/internal/pkg/errs"
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
		if errors.Is(err, reader.ErrNotFound) {
			return Credential{}, errs.NotFoundError{Resource: "credential", ID: query.CredentialID, Err: err}
		}
		return Credential{}, errs.InternalError{Err: err}
	}

	return credential, nil
}
