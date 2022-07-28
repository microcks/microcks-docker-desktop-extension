package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

func health(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(200)
}

func collect(w http.ResponseWriter, request *http.Request) {
	// Retrieve Google Analytics secrets from environment.
	measurementID := os.Getenv("MEASUREMENT_ID")
	secretKey := os.Getenv("API_SECRET")

	// Read body from incoming request.
	body, err := ioutil.ReadAll(request.Body)
	if err != nil {
	}

	// Prepare request to Google Analytics with incoming body.
	requestUrl := fmt.Sprintf("https://www.google-analytics.com/mp/collect?measurement_id=%s&api_secret=%s", measurementID, secretKey)
	req, err := http.NewRequest(http.MethodPost, requestUrl, strings.NewReader(string(body)))
	if err != nil {
		log.Default().Fatal(err)
	}

	// Execute post to Analytics backend.
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Default().Fatal(err)
	}

	if resp.StatusCode != http.StatusNoContent {
		log.Default().Printf("Status code for %s is %d", request.Body, resp.StatusCode)
	}

	w.WriteHeader(201)
}

func main() {
	server := http.Server{
		Addr: "0.0.0.0:6666",
	}
	http.HandleFunc("/health", health)
	http.HandleFunc("/collect", collect)

	log.Default().Println("Starting Metrics collect server on port 6666...")
	server.ListenAndServe()
}
