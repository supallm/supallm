package logger

import (
	"fmt"
	"os"
	"os/exec"
	"time"
)

func Banner() {
	b := `
███████╗██╗   ██╗██████╗  █████╗ ██╗     ██╗     ███╗   ███╗
██╔════╝██║   ██║██╔══██╗██╔══██╗██║     ██║     ████╗ ████║
███████╗██║   ██║██████╔╝███████║██║     ██║     ██╔████╔██║
╚════██║██║   ██║██╔═══╝ ██╔══██║██║     ██║     ██║╚██╔╝██║
███████║╚██████╔╝██║     ██║  ██║███████╗███████╗██║ ╚═╝ ██║
╚══════╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝
Don't waste your time and use https://supallm.com - %v ©
				
`
	t := time.Now()
	y := t.Year()
	c := exec.Command("clear")
	c.Stdout = os.Stdout
	_ = c.Run()
	//nolint:forbidigo
	fmt.Printf(b, y)
}
