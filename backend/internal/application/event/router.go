package event

import (
	"context"
	"log/slog"
	"os"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-redisstream/pkg/redisstream"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/ThreeDotsLabs/watermill/message/router/plugin"
	"github.com/ThreeDotsLabs/watermill/pubsub/gochannel"
	"github.com/redis/go-redis/v9"
)

type EventRouter struct {
	router     *message.Router
	Subscriber message.Subscriber
	Publisher  message.Publisher
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

	pubsub := gochannel.NewGoChannel(
		gochannel.Config{},
		config.Logger,
	)

	subscriber, err := redisstream.NewSubscriber(
		redisstream.SubscriberConfig{
			Client:        config.WorkflowsRedis,
			ConsumerGroup: "core",
			Unmarshaller:  CustomMarshaller{},
		},
		config.Logger,
	)
	if err != nil {
		slog.Error("error creating redis stream subscriber", "error", err)
		os.Exit(1)
	}

	router.AddNoPublisherHandler(
		"workflow-event-router",
		TopicWorkflowEventsIn,
		subscriber,
		func(msg *message.Message) error {
			defer func() {
				if err != nil {
					config.Logger.Error("error while logging workflow event message", err, nil)
				}
			}()

			return nil
		},
	)

	go func() {
		err = router.Run(context.Background())
		if err != nil {
			config.Logger.Error("error running message router", err, nil)
		}
	}()

	<-router.Running()

	return &EventRouter{
		router:     router,
		Subscriber: pubsub,
		Publisher:  pubsub,
	}
}

func (r *EventRouter) Close() error {
	return r.router.Close()
}
