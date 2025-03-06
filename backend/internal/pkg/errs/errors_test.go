package errs

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestErrNotFound_Error(t *testing.T) {
	t.Parallel()

	tt := []struct {
		name string
		err  NotFoundError
		str  string
	}{
		{
			name: "resource and id",
			err:  NotFoundError{Resource: "foo", ID: 123},
			str:  "foo 123 not found",
		},
		{
			name: "resource only",
			err:  NotFoundError{Resource: "foo"},
			str:  "foo not found",
		},
		{
			name: "id only",
			err:  NotFoundError{ID: 123},
			str:  "123 not found",
		},
		{
			name: "no param",
			err:  NotFoundError{},
			str:  "not found",
		},
	}

	for _, tc := range tt {
		t.Run(tc.name, func(t *testing.T) {
			tc := tc
			t.Parallel()
			require.Equal(t, tc.str, tc.err.Error())
		})
	}
}

func TestErrDuplicate_Error(t *testing.T) {
	t.Parallel()

	tt := []struct {
		name string
		err  DuplicateError
		str  string
	}{
		{
			name: "resource and id",
			err:  DuplicateError{Resource: "foo", ID: 123},
			str:  "foo 123 already exists",
		},
		{
			name: "resource only",
			err:  DuplicateError{Resource: "foo"},
			str:  "foo already exists",
		},
		{
			name: "id only",
			err:  DuplicateError{ID: 123},
			str:  "123 already exists",
		},
		{
			name: "no param",
			err:  DuplicateError{},
			str:  "already exists",
		},
	}

	for _, tc := range tt {
		t.Run(tc.name, func(t *testing.T) {
			tc := tc
			t.Parallel()
			require.Equal(t, tc.str, tc.err.Error())
		})
	}
}

func TestErrCreate_Error(t *testing.T) {
	err := CreateError{}
	require.Equal(t, "creation failed", err.Error())

	err = CreateError{Reason: errors.New("foo")}
	require.Equal(t, "creation: foo", err.Error())
}

func TestErrUpdate_Error(t *testing.T) {
	err := UpdateError{}
	require.Equal(t, "update failed", err.Error())

	err = UpdateError{Reason: errors.New("foo")}
	require.Equal(t, "update: foo", err.Error())
}

func TestErrDelete_Error(t *testing.T) {
	err := DeleteError{}
	require.Equal(t, "deletion failed", err.Error())

	err = DeleteError{Reason: errors.New("foo")}
	require.Equal(t, "deletion: foo", err.Error())
}

func TestErrRequestMissing_Error(t *testing.T) {
	t.Parallel()

	tt := []struct {
		name string
		err  ReqMissingError
		str  string
	}{
		{
			name: "field",
			err:  ReqMissingError{Field: "firstname"},
			str:  "missing request.firstname",
		},
		{
			name: "no param",
			err:  ReqMissingError{},
			str:  "missing request field",
		},
	}

	for _, tc := range tt {
		t.Run(tc.name, func(t *testing.T) {
			tc := tc
			t.Parallel()
			require.Equal(t, tc.str, tc.err.Error())
		})
	}
}

func TestErrRequestInvalid_Error(t *testing.T) {
	t.Parallel()

	tt := []struct {
		name string
		err  ReqInvalidError
		str  string
	}{
		{
			name: "field and reason",
			err:  ReqInvalidError{Field: "firstname", Reason: "invalid charset"},
			str:  "invalid request.firstname (invalid charset)",
		},
		{
			name: "field only",
			err:  ReqInvalidError{Field: "firstname"},
			str:  "invalid request.firstname",
		},
		{
			name: "reason only",
			err:  ReqInvalidError{Reason: "invalid charset"},
			str:  "invalid request (invalid charset)",
		},
		{
			name: "no param",
			err:  ReqInvalidError{},
			str:  "invalid request",
		},
	}

	for _, tc := range tt {
		t.Run(tc.name, func(t *testing.T) {
			tc := tc
			t.Parallel()
			require.Equal(t, tc.str, tc.err.Error())
		})
	}
}

func TestErrUnauthorized_Error(t *testing.T) {
	err := UnauthorizedError{}
	require.Equal(t, "unauthorized", err.Error())

	err = UnauthorizedError{Reason: errors.New("foo")}
	require.Equal(t, "unauthorized: foo", err.Error())
}

func TestErrForbidden_Error(t *testing.T) {
	err := ForbiddenError{}
	require.Equal(t, "forbidden", err.Error())

	err = ForbiddenError{Reason: errors.New("foo")}
	require.Equal(t, "forbidden: foo", err.Error())
}

func TestErrInternal_Error(t *testing.T) {
	err := InternalError{}
	require.Equal(t, "internal error", err.Error())

	err = InternalError{Reason: errors.New("foo")}
	require.Equal(t, "internal: foo", err.Error())
}

func TestErrNotImplemented_Error(t *testing.T) {
	err := NotImplementedError{}
	require.Equal(t, "not implemented", err.Error())
}

func TestErrConstraint_Error(t *testing.T) {
	t.Parallel()

	tt := []struct {
		name string
		err  ConstraintError
		str  string
	}{
		{
			name: "condition",
			err:  ConstraintError{Condition: "already closed"},
			str:  "constrain by already closed",
		},
		{
			name: "no param",
			err:  ConstraintError{},
			str:  "constraint",
		},
	}

	for _, tc := range tt {
		t.Run(tc.name, func(t *testing.T) {
			tc := tc
			t.Parallel()
			require.Equal(t, tc.str, tc.err.Error())
		})
	}
}
