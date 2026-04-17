package utils

import (
	"context"
	"fmt"
	"mime/multipart"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

func UploadAvatarToCloudinary(file multipart.File, filename string) (string, error) {
	cld, err := cloudinary.New()
	if err != nil {
		return "", err
	}
	// Tạo context với timeout 10 giây
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Upload
	uploadParams := uploader.UploadParams{
		Folder:         "smart_travel_avatars",
		PublicID:       filename,
		Transformation: "c_fill,g_face,w_500,h_500",
		Format:         "jpg",
	}
	//Thực hiện upload
	resp, err := cld.Upload.Upload(ctx, file, uploadParams)
	if err != nil {
		return "", err
	}
	fmt.Printf("CHI TIẾT RESP TỪ CLOUDINARY: %+v\n", resp)
	//Trả về đường bảo mật
	return resp.SecureURL, nil
}
