package event

import (
	"log/slog"

	"github.com/ThreeDotsLabs/watermill-redisstream/pkg/redisstream"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/pkg/errors"
	"github.com/vmihailenco/msgpack"
)

type WorkflowEventMarshaller struct{}

func (m WorkflowEventMarshaller) Marshal(id string, msg *message.Message) (map[string]any, error) {
	if value := msg.Metadata.Get(redisstream.UUIDHeaderKey); value != "" {
		return nil, errors.Errorf("metadata %s is reserved by watermill for message UUID", redisstream.UUIDHeaderKey)
	}

	var (
		md  []byte
		err error
	)
	if len(msg.Metadata) > 0 {
		if md, err = msgpack.Marshal(msg.Metadata); err != nil {
			return nil, errors.Wrapf(err, "marshal metadata fail")
		}
	}

	return map[string]interface{}{
		redisstream.UUIDHeaderKey: msg.UUID,
		"metadata":                md,
		"payload":                 []byte(msg.Payload),
	}, nil
}

func (m WorkflowEventMarshaller) Unmarshal(values map[string]any) (*message.Message, error) {
	slog.Info("-----------------unmarshalling message", "values", values)
	//nolint:all
	msg := message.NewMessage(values[redisstream.UUIDHeaderKey].(string), []byte(values["payload"].(string)))

	md := values["metadata"]
	if md != nil {
		//nolint:all
		s := md.(string)
		if s != "" {
			metadata := make(message.Metadata)
			if err := msgpack.Unmarshal([]byte(s), &metadata); err != nil {
				return nil, errors.Wrapf(err, "unmarshal metadata fail")
			}
			msg.Metadata = metadata
		}
	}

	return msg, nil
}
