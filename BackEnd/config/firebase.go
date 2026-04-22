package config

import (
	"context"
	"log"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

func InitFirebase() *auth.Client {
	var opt option.ClientOption

	firebaseCreds := GetEnv("FIREBASE_CREDENTIALS", "")
	if firebaseCreds != "" {
		opt = option.WithCredentialsJSON([]byte(firebaseCreds))
	} else {
		opt = option.WithCredentialsFile("serviceAccountKey.json")
	}

	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatalf("Lỗi khởi tạo Firebase App: %v", err)
	}

	authClient, err := app.Auth(context.Background())
	if err != nil {
		log.Fatalf("Lỗi khởi tạo Firebase Auth Client: %v", err)
	}

	log.Println("Đã kết nối thành công đến Firebase Admin SDK!")
	return authClient
}
