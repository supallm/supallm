package slug

import (
	"crypto/rand"
	"fmt"
	"math/big"

	"github.com/gosimple/slug"
)

type Slug string

func (s Slug) String() string {
	return string(s)
}

func Make(s string) Slug {
	return Slug(slug.Make(s))
}

func MakeWithHash(s string, size int) Slug {
	return Slug(fmt.Sprintf("%s-%s", Make(s), randSeq(size)))
}

func MakeWithPrefix(s string, prefix string, size int) Slug {
	if prefix == "" {
		prefix = "gen-"
	}

	if s == "" {
		return MakeWithHash(prefix, size)
	}

	return MakeWithHash(fmt.Sprintf("%s-%s", prefix, s), size)
}

func randSeq(n int) string {
	letters := []rune("abcdefghijklmnopqrstuvwxyz0123456789")
	b := make([]rune, n)

	for i := range b {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			b[i] = letters[0]
			continue
		}
		b[i] = letters[num.Int64()]
	}

	return string(b)
}
