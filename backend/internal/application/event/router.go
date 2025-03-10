package event

import (
	"context"
	"encoding/json"
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

	publisher := gochannel.NewGoChannel(
		gochannel.Config{},
		config.Logger,
	)

	subscriber, err := redisstream.NewSubscriber(
		redisstream.SubscriberConfig{
			Client:        config.WorkflowsRedis,
			ConsumerGroup: "core",
		},
		config.Logger,
	)
	if err != nil {
		slog.Error("error creating redis stream subscriber", "error", err)
		os.Exit(1)
	}

	router.AddHandler(
		"workflow-event-router",
		TopicWorkflowEventsIn,
		subscriber,
		TopicWorkflowEventsOut,
		publisher,
		func(msg *message.Message) (messages []*message.Message, err error) {
			defer func() {
				if err != nil {
					config.Logger.Error("Error while logging workflow event message", err, nil)
				}
			}()

			var event WorkflowEventMessage
			err = json.Unmarshal(msg.Payload, &event)
			if err != nil {
				config.Logger.Error("Error while unmarshalling workflow event message", err, nil)
				return nil, nil
			}

			return []*message.Message{msg}, nil
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
		Subscriber: subscriber,
		Publisher:  publisher,
	}
}

func (r *EventRouter) Close() error {
	return r.router.Close()
}
