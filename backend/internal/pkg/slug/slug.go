package slug

import (
	"fmt"
	"math/rand"
	"time"

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
	rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
