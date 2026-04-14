package contact

type ContactForm struct {
	Ho      string `json:"ho" binding:"required"`
	Ten     string `json:"ten" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	NoiDung string `json:"noiDung" binding:"required"`
}
