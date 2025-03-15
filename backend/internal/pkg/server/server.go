package server

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/config"
	"github.com/supallm/core/internal/pkg/errs"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

const (
	readHeaderTimeout = 10 * time.Second
)

type Server struct {
	Router *chi.Mux
	conf   config.Config
}

func New(conf config.Config) *Server {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)

	s := &Server{
		Router: r,
		conf:   conf,
	}
	s.applyCommonMiddleware()

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	return s
}

func (s *Server) Start() error {
	slog.Info("starting HTTP server", slog.String("address", s.Addr()))
	h2s := &http2.Server{}
	server := &http.Server{
		Addr:              s.Addr(),
		Handler:           h2c.NewHandler(s.Router, h2s),
		ReadHeaderTimeout: readHeaderTimeout,
	}
	return server.ListenAndServe()
}

func (s *Server) ParseBody(r *http.Request, v any) error {
	if r.ContentLength == 0 {
		return nil
	}

	if err := json.NewDecoder(r.Body).Decode(v); err != nil {
		return fmt.Errorf("%w: %w", errs.InvalidError{
			Field:  "body",
			Reason: "error decoding request",
			Err:    err,
		}, err)
	}

	return nil
}

func (s *Server) Respond(w http.ResponseWriter, _ *http.Request, status int, data any) {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(status)

	if data == nil {
		return
	}

	err := json.NewEncoder(w).Encode(data)
	if err != nil {
		slog.Error("error encoding response", "error", err)
	}
}

func (s *Server) RespondErr(w http.ResponseWriter, r *http.Request, err error) {
	if err == nil {
		s.Respond(w, r, http.StatusOK, nil)
		return
	}

	pb := errs.Problem(err)

	slog.Error(err.Error(),
		slog.String("status", strconv.Itoa(pb.Status)),
		slog.String("uri", r.RequestURI),
	)

	errs.HTTP(w, r, err)
}

func (s *Server) RespondWithContentLocation(
	w http.ResponseWriter,
	r *http.Request,
	status int,
	uri string,
	params ...any,
) {
	w.Header().Add("content-location", fmt.Sprintf(uri, params...))
	s.Respond(w, r, status, nil)
}

func (s *Server) Redirect(w http.ResponseWriter, r *http.Request, redirectURL string) {
	http.Redirect(w, r, redirectURL, http.StatusSeeOther)
}

func (s *Server) GetQueryParam(r *http.Request, key string) string {
	return r.URL.Query().Get(key)
}

func (s *Server) GetParam(r *http.Request, key string) string {
	return chi.URLParam(r, key)
}

func (s *Server) ParseUUID(r *http.Request, key string) (uuid.UUID, error) {
	id, err := uuid.Parse(chi.URLParam(r, key))
	if err != nil {
		return uuid.UUID{}, errs.InvalidError{
			Field:  key,
			Reason: "invalid uuid",
			Err:    err,
		}
	}
	return id, nil
}

// Add a Stop method to gracefully shutdown the server
func (s *Server) Stop(_ context.Context) error {
	slog.Info("stopping HTTP server")
	return nil
}

func (s *Server) Addr() string {
	return fmt.Sprintf(":%s", s.conf.Server.Port)
}
