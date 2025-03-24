package redis

import (
	"context"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/supallm/core/internal/pkg/config"
)

// Note: Using Redis logical databases instead of separate instances
// as a trade-off between operational complexity and perfect isolation.
// This can be split into separate instances if needed in the future.
const (
	DBWorkflows  = 0
	DBExecutions = 1

	maxRetries   = 3
	poolSize     = 100
	minIdleConns = 20
	dialTimeout  = 5 * time.Second
	readTimeout  = 30 * time.Second
	writeTimeout = 5 * time.Second
	poolTimeout  = 6 * time.Second
)

var (
	//nolint:gochecknoglobals
	clients = make(map[int]*redis.Client)
	//nolint:gochecknoglobals
	mu sync.RWMutex
)

func NewClient(conf config.Redis, db int) (*redis.Client, error) {
	mu.RLock()
	if client, exists := clients[db]; exists {
		mu.RUnlock()
		return client, nil
	}
	mu.RUnlock()

	mu.Lock()
	defer mu.Unlock()

	// Double-check after acquiring write lock
	if client, exists := clients[db]; exists {
		return client, nil
	}

	opts := &redis.Options{
		Addr:     conf.Host,
		Password: conf.Password,
		DB:       db,

		PoolSize:     poolSize,
		MinIdleConns: minIdleConns,
		MaxRetries:   maxRetries,

		DialTimeout:  dialTimeout,
		ReadTimeout:  readTimeout,
		WriteTimeout: writeTimeout,
		PoolTimeout:  poolTimeout,
	}

	client := redis.NewClient(opts)

	_, err := client.Ping(context.Background()).Result()
	if err != nil {
		return nil, err
	}

	clients[db] = client
	return client, nil
}

func CloseAll() {
	mu.Lock()
	defer mu.Unlock()

	for _, client := range clients {
		if client != nil {
			client.Close()
		}
	}
	clients = make(map[int]*redis.Client)
}
