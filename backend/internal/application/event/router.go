package event

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-redisstream/pkg/redisstream"
	"github.com/ThreeDotsLabs/watermill/components/fanin"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/ThreeDotsLabs/watermill/message/router/plugin"
	"github.com/ThreeDotsLabs/watermill/pubsub/gochannel"
	"github.com/redis/go-redis/v9"
)

const (
	// Downstream topics (API → runner)
	DownstreamWorkflowRunTopic = "workflows:downstream:run" // queue of workflows to run by runners

	// Upstream topics (runner → API)
	UpstreamWorkflowEventStoreTopic    = "workflows:upstream:events:store"    // store workflow events
	UpstreamWorkflowEventDispatchTopic = "workflows:upstream:events:dispatch" // dispatch workflow events
	UpstreamNodeResultTopic            = "workflows:upstream:nodes:results"   // nodes results

	// Internal topics
	InternalEventsTopic = "workflows:internal:events" // merged workflow events for clients stream

	ConsumerGroup = "store-workflows-events-consumer-group"
	CloseTimeout  = 10 * time.Second
	MaxQueueLen   = 400
)

type EventRouter struct {
	router             *message.Router
	fi                 *fanin.FanIn
	InternalSubscriber message.Subscriber
	RunnerPublisher    message.Publisher

	Logger watermill.LoggerAdapter
}

type Config struct {
	WorkflowsRedis *redis.Client
	Logger         watermill.LoggerAdapter
}

func CreateRouter(config Config) *EventRouter {
	router, err := message.NewRouter(message.RouterConfig{}, config.Logger)
	if err != nil {
		slog.Error("error creating cqrs router", "error", err)
		os.Exit(1)
	}

	router.AddPlugin(plugin.SignalsHandler)
	useMiddlewares(router, config.Logger)

	internalPubSub := gochannel.NewGoChannel(
		gochannel.Config{},
		config.Logger,
	)

	consumerGroupSubscriber, err := createSubscriber(config, ConsumerGroup)
	if err != nil {
		slog.Error("error creating redis stream consumer group subscriber", "error", err)
		os.Exit(1)
	}

	subscriber, err := createSubscriber(config, "")
	if err != nil {
		slog.Error("error creating redis stream subscriber", "error", err)
		os.Exit(1)
	}

	runnerPublisher, err := createPublisher(config, MaxQueueLen)
	if err != nil {
		slog.Error("error creating redis stream runner publisher", "error", err)
		os.Exit(1)
	}

	router.AddNoPublisherHandler(
		"workflows-store-events-router",
		UpstreamWorkflowEventStoreTopic,
		consumerGroupSubscriber,
		func(msg *message.Message) error {
			// call handler to store events here
			// slog.Info("received workflow event", "event", msg.Payload)
			return nil
		},
	)

	// FanIn is used to merge events from different sources into a single topic
	// in our case we merge events from workflows and nodes to our internal subscriber
	fi, err := fanin.NewFanIn(
		subscriber,
		internalPubSub,
		fanin.Config{
			SourceTopics: []string{UpstreamWorkflowEventDispatchTopic, UpstreamNodeResultTopic},
			TargetTopic:  InternalEventsTopic,
			CloseTimeout: CloseTimeout,
		},
		config.Logger,
	)
	if err != nil {
		slog.Error("error creating fanin", "error", err)
		os.Exit(1)
	}

	return &EventRouter{
		router:             router,
		fi:                 fi,
		InternalSubscriber: internalPubSub,
		RunnerPublisher:    runnerPublisher,
		Logger:             config.Logger,
	}
}

func (r *EventRouter) Run() {
	go func() {
		err := r.fi.Run(context.Background())
		if err != nil {
			r.Logger.Error("error running fanin", err, nil)
			os.Exit(1)
		}
	}()

	go func() {
		err := r.router.Run(context.Background())
		if err != nil {
			r.Logger.Error("error running message router", err, nil)
			os.Exit(1)
		}
	}()

	<-r.router.Running()
	<-r.fi.Running()
}

func (r *EventRouter) Close() error {
	return r.router.Close()
}

func createSubscriber(config Config, consumerGroup string) (message.Subscriber, error) {
	subscriber, err := redisstream.NewSubscriber(
		redisstream.SubscriberConfig{
			Client:        config.WorkflowsRedis,
			Unmarshaller:  redisstream.DefaultMarshallerUnmarshaller{},
			ConsumerGroup: consumerGroup,
		},
		config.Logger,
	)
	if err != nil {
		return nil, err
	}
	return subscriber, nil
}

func createPublisher(config Config, defaultMaxlen int64) (message.Publisher, error) {
	publisher, err := redisstream.NewPublisher(
		redisstream.PublisherConfig{
			Client:        config.WorkflowsRedis,
			Marshaller:    redisstream.DefaultMarshallerUnmarshaller{},
			DefaultMaxlen: defaultMaxlen,
		},
		config.Logger,
	)
	if err != nil {
		return nil, err
	}
	return publisher, nil
}
