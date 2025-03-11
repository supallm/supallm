package event

import (
	"log/slog"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/google/uuid"
)

type CustomMarshaller struct{}

func (m CustomMarshaller) Marshal(msg *message.Message) (map[string]interface{}, error) {
	return map[string]interface{}{
		"payload":  string(msg.Payload),
		"metadata": msg.Metadata,
	}, nil
}

func (m CustomMarshaller) Unmarshal(values map[string]interface{}) (*message.Message, error) {
	var payload string
	var metadata message.Metadata

	slog.Info("unmarshalling message", "values", values)

	msg := message.NewMessage(
		uuid.New().String(),
		[]byte(payload),
	)
	msg.Metadata = metadata

	return msg, nil
}
