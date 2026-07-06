.PHONY: run build tidy vet fmt

run:
	go run ./cmd/server

build:
	go build -o bin/server ./cmd/server

tidy:
	go mod tidy

vet:
	go vet ./...

fmt:
	gofmt -w .
