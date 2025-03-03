package errs

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestProblem(t *testing.T) {
	tt := []struct {
		name string
		err  error

		slug   slug
		params map[string]any
	}{
		{
			name: "ok",
			err:  nil,
		},
		{
			name:   "not found",
			err:    ErrNotFound{Resource: "foo", ID: 123},
			slug:   SlugNotFound,
			params: map[string]any{"resource": "foo", "id": 123},
		},
		{
			name:   "duplicate",
			err:    ErrDuplicate{Resource: "foo", ID: 123},
			slug:   SlugDuplicate,
			params: map[string]any{"resource": "foo", "id": 123},
		},
		{
			name:   "create",
			err:    ErrCreate{Reason: fmt.Errorf("foo")},
			slug:   SlugCreate,
			params: map[string]any{"reason": "foo"},
		},
		{
			name:   "update",
			err:    ErrUpdate{Reason: fmt.Errorf("foo")},
			slug:   SlugUpdate,
			params: map[string]any{"reason": "foo"},
		},
		{
			name:   "delete",
			err:    ErrDelete{Reason: fmt.Errorf("foo")},
			slug:   SlugDelete,
			params: map[string]any{"reason": "foo"},
		},
		{
			name:   "request missing",
			err:    ErrReqMissing{Field: "foo"},
			slug:   SlugRequestMissing,
			params: map[string]any{"field": "foo"},
		},
		{
			name:   "request invalid",
			err:    ErrReqInvalid{Field: "foo", Reason: "bar"},
			slug:   SlugRequestInvalid,
			params: map[string]any{"field": "foo", "reason": "bar"},
		},
		{
			name: "unauthorized",
			err:  ErrUnauthorized{},
			slug: SlugUnauthorized,
		},
		{
			name:   "forbidden",
			err:    ErrForbidden{Reason: fmt.Errorf("foo")},
			slug:   SlugForbidden,
			params: map[string]any{"reason": "foo"},
		},
		{
			name: "not implemented",
			err:  ErrNotImplemented{},
			slug: SlugNotImplemented,
		},
		{
			name:   "constraint",
			err:    ErrConstraint{Condition: "foo"},
			slug:   SlugConstraint,
			params: map[string]any{"condition": "foo"},
		},
		{
			name:   "internal",
			err:    ErrInternal{Reason: fmt.Errorf("foo")},
			slug:   SlugInternal,
			params: map[string]any{"reason": "foo"},
		},
		{
			name: "unknown",
			err:  fmt.Errorf("custom error"),
			slug: SlugUnknown,
		},
	}

	for _, tc := range tt {
		t.Run(tc.name, func(t *testing.T) {
			tc := tc
			t.Parallel()

			pb := Problem(tc.err)
			if tc.err == nil {
				require.Nil(t, pb)
				return
			}
			require.NotNil(t, pb)
			require.Equal(t, tc.slug, slug(pb.Title))
			require.EqualValues(t, tc.params, pb.Params)
		})
	}
}

func TestHTTP(t *testing.T) {
	tt := []struct {
		name string
		err  error
		code int
	}{
		{
			name: "ok",
			err:  nil,
			code: http.StatusOK,
		},
		{
			name: "not found",
			err:  ErrNotFound{Resource: "foo", ID: 12.3},
			code: http.StatusNotFound,
		},
		{
			name: "duplicate",
			err:  ErrDuplicate{Resource: "foo"},
			code: http.StatusConflict,
		},
		{
			name: "create",
			err:  ErrCreate{},
			code: http.StatusInternalServerError,
		},
		{
			name: "update",
			err:  ErrUpdate{},
			code: http.StatusInternalServerError,
		},
		{
			name: "delete",
			err:  ErrDelete{},
			code: http.StatusInternalServerError,
		},
		{
			name: "request missing",
			err:  ErrReqMissing{},
			code: http.StatusBadRequest,
		},
		{
			name: "request invalid",
			err:  ErrReqInvalid{},
			code: http.StatusBadRequest,
		},
		{
			name: "unauthorized",
			err:  ErrUnauthorized{},
			code: http.StatusUnauthorized,
		},
		{
			name: "forbidden",
			err:  ErrForbidden{},
			code: http.StatusForbidden,
		},
		{
			name: "not implemented",
			err:  ErrNotImplemented{},
			code: http.StatusNotImplemented,
		},
		{
			name: "constraint",
			err:  ErrConstraint{},
			code: http.StatusConflict,
		},
		{
			name: "internal",
			err:  ErrInternal{},
			code: http.StatusInternalServerError,
		},
		{
			name: "unknown",
			err:  fmt.Errorf("custom error"),
			code: http.StatusInternalServerError,
		},
	}

	for _, tc := range tt {
		t.Run(tc.name, func(t *testing.T) {
			tc := tc
			t.Parallel()

			rec := httptest.NewRecorder()
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			HTTP(rec, req, tc.err)
			if tc.err == nil {
				require.Equal(t, 200, rec.Code)
				require.Empty(t, rec.Body)
				return
			}

			pb := Problem(tc.err)

			require.Equal(t, tc.code, pb.HTTPStatus())
			require.Equal(t, tc.code, rec.Code)
			require.Equal(t, "application/problem+json", pb.HTTPHeaders().Get("Content-Type"))
			require.Equal(t, "application/problem+json", rec.Header().Get("Content-Type"))
			require.NotEmpty(t, rec.Body)

			var written ProblemJSON
			require.NoError(t, json.NewDecoder(rec.Body).Decode(&written))

			expect, ok := tc.err.(problem)
			if !ok {
				require.Equal(t, unknownProblem, written)
				return
			}

			require.Equal(t, expect.DocURL(), written.Type)
			require.Equal(t, string(expect.Slug()), written.Title)
			require.Equal(t, expect.Error(), written.Detail)
			require.Equal(t, expect.Params(), written.Params)
			require.Empty(t, "", written.Instance)
		})
	}
}
