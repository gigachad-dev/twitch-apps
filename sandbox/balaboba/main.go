package main

import (
	"fmt"

	"github.com/karalef/balaboba"
)

func main() {
	client := balaboba.New(balaboba.Rus)
	res, _ := client.Generate("я открыл текстовый редактор vs code", 0)
	fmt.Println(res.Text)
}
