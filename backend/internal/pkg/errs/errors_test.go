package errs_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/supallm/core/internal/pkg/errs"
)

func TestErrNotFound_Error(t *testing.T) {
	tt := []struct {
		name string
		err  errs.ErrNotFound
		str  string
	}{
		{
			name: "resource and id",
			err:  errs.ErrNotFound{Resource: "foo", ID: 123},
			str:  "foo 123 not found",
		},
		{
			name: "resource only",
			err:  errs.ErrNotFound{Resource: "foo"},
			str:  "foo not found",
		},
		{
			name: "id only",
			err:  errs.ErrNotFound{ID: 123},
			str:  "123 not found",
		},
		{
			name: "no param",
			err:  errs.ErrNotFound{},
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
	tt := []struct {
		name string
		err  errs.ErrDuplicate
		str  string
	}{
		{
			name: "resource and id",
			err:  errs.ErrDuplicate{Resource: "foo", ID: 123},
			str:  "foo 123 already exists",
		},
		{
			name: "resource only",
			err:  errs.ErrDuplicate{Resource: "foo"},
			str:  "foo already exists",
		},
		{
			name: "id only",
			err:  errs.ErrDuplicate{ID: 123},
			str:  "123 already exists",
		},
		{
			name: "no param",
			err:  errs.ErrDuplicate{},
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
	err := errs.ErrCreate{}
	require.Equal(t, "creation failed", err.Error())

	err = errs.ErrCreate{Reason: fmt.Errorf("foo")}
	require.Equal(t, "creation: foo", err.Error())
}

func TestErrUpdate_Error(t *testing.T) {
	err := errs.ErrUpdate{}
	require.Equal(t, "update failed", err.Error())

	err = errs.ErrUpdate{Reason: fmt.Errorf("foo")}
	require.Equal(t, "update: foo", err.Error())
}

func TestErrDelete_Error(t *testing.T) {
	err := errs.ErrDelete{}
	require.Equal(t, "deletion failed", err.Error())

	err = errs.ErrDelete{Reason: fmt.Errorf("foo")}
	require.Equal(t, "deletion: foo", err.Error())
}

func TestErrRequestMissing_Error(t *testing.T) {
	tt := []struct {
		name string
		err  errs.ErrReqMissing
		str  string
	}{
		{
			name: "field",
			err:  errs.ErrReqMissing{Field: "firstname"},
			str:  "missing request.firstname",
		},
		{
			name: "no param",
			err:  errs.ErrReqMissing{},
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
	tt := []struct {
		name string
		err  errs.ErrReqInvalid
		str  string
	}{
		{
			name: "field and reason",
			err:  errs.ErrReqInvalid{Field: "firstname", Reason: "invalid charset"},
			str:  "invalid request.firstname (invalid charset)",
		},
		{
			name: "field only",
			err:  errs.ErrReqInvalid{Field: "firstname"},
			str:  "invalid request.firstname",
		},
		{
			name: "reason only",
			err:  errs.ErrReqInvalid{Reason: "invalid charset"},
			str:  "invalid request (invalid charset)",
		},
		{
			name: "no param",
			err:  errs.ErrReqInvalid{},
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
	err := errs.ErrUnauthorized{}
	require.Equal(t, "unauthorized", err.Error())

	err = errs.ErrUnauthorized{Reason: fmt.Errorf("foo")}
	require.Equal(t, "unauthorized: foo", err.Error())
}

func TestErrForbidden_Error(t *testing.T) {
	err := errs.ErrForbidden{}
	require.Equal(t, "forbidden", err.Error())

	err = errs.ErrForbidden{Reason: fmt.Errorf("foo")}
	require.Equal(t, "forbidden: foo", err.Error())
}

func TestErrInternal_Error(t *testing.T) {
	err := errs.ErrInternal{}
	require.Equal(t, "internal error", err.Error())

	err = errs.ErrInternal{Reason: fmt.Errorf("foo")}
	require.Equal(t, "internal: foo", err.Error())
}

func TestErrNotImplemented_Error(t *testing.T) {
	err := errs.ErrNotImplemented{}
	require.Equal(t, "not implemented", err.Error())
}

func TestErrConstraint_Error(t *testing.T) {
	tt := []struct {
		name string
		err  errs.ErrConstraint
		str  string
	}{
		{
			name: "condition",
			err:  errs.ErrConstraint{Condition: "already closed"},
			str:  "constrain by already closed",
		},
		{
			name: "no param",
			err:  errs.ErrConstraint{},
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
