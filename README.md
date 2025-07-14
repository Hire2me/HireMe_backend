# 🚀 HireMe Backend

Welcome to the **HireMe Backend**!  
A robust Node.js/Express REST API powering the HireMe platform, enabling artisans to register, manage profiles, upload work images, and authenticate securely (including Google OAuth).  
Designed for scalability, security, and seamless integration with frontend/mobile apps.

---

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication & Security](#authentication--security)
- [File Uploads](#file-uploads)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

- **Artisan Registration & Login** (local & Google OAuth)
- **Email Verification** with OTP
- **Password Reset** via email
- **Profile Management** (business info, images, certificates)
- **Work Image Uploads** (Cloudinary integration)
- **JWT Authentication** for secure API access
- **Admin & User Route Placeholders**
- **Robust Error Handling & Security Headers**

---

## 🛠️ Tech Stack

- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose**
- **Passport.js** (Google OAuth)
- **JWT** for authentication
- **Multer** & **Cloudinary** for file uploads
- **Nodemailer** for email
- **dotenv** for environment variables

---

## 🗂️ Project Structure

```
.
├── index.js
├── package.json
├── .env
├── src/
│   ├── config/
│   │   └── passport.setup.js
│   ├── controllers/
│   ├── database/
│   ├── email/
│   ├── image/
│   ├── middleware/
│   ├── models/
│   ├── public/
│   ├── resources/
│   ├── routes/
│   ├── utils/
│   └── views/
```

- **controllers/**: Business logic for routes
- **models/**: Mongoose schemas
- **routes/**: Express route definitions
- **middleware/**: Authentication and other middleware
- **image/**: Cloudinary and Multer config for file uploads
- **email/**: Email sending utilities
- **views/**: HTML templates for login, dashboard, etc.

---

## 🚦 Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/Hire2me/HireMe_backend
cd hireme-backend
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials (see [Environment Variables](#environment-variables)).

### 4. Start the Server

```sh
npm run dev
```

Server runs on [http://localhost:3000](http://localhost:3000) by default.

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following:

```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/redirect
```

---

## 📡 API Endpoints

### 🧑‍🎨 Artisan Authentication

| Method | Endpoint                        | Description                      |
| ------ | ------------------------------- | -------------------------------- |
| POST   | `/api/artisans/signup`          | Register as an artisan           |
| POST   | `/api/artisans/login`           | Login as an artisan              |
| POST   | `/api/artisans/forgot-password` | Request password reset           |
| POST   | `/api/artisans/reset-password`  | Reset password                   |
| POST   | `/api/artisans/verify-email`    | Verify email with OTP (JWT req.) |

### 📝 Artisan Profile

| Method | Endpoint                               | Description                                    |
| ------ | -------------------------------------- | ---------------------------------------------- |
| POST   | `/api/artisan/profile`                 | Create artisan profile (file upload, JWT req.) |
| GET    | `/api/artisan/profile`                 | Get your profile (JWT req.)                    |
| GET    | `/api/artisan/get_artisan_profile/:id` | Public artisan profile                         |
| GET    | `/api/artisan/all_artisan`             | List all artisans                              |
| POST   | `/api/artisan/report_artisan/:id`      | Report an artisan                              |
| GET    | `/api/artisan/reported_artisans`       | get all reported artisans                      |

### 🖼️ Work Images

| Method | Endpoint              | Description                          |
| ------ | --------------------- | ------------------------------------ |
| POST   | `/api/upload/:userId` | Upload work images (min 7, JWT req.) |

### 🔐 Google OAuth

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| GET    | `/auth/google`          | Start Google login    |
| GET    | `/auth/google/redirect` | Google OAuth callback |

---

## 🛡️ Authentication & Security

- **JWT**: Most API endpoints require a JWT in the `Authorization` header:  
  `Authorization: Bearer <your_token>`
- **Google OAuth**: For web login, use `/auth/google` and `/auth/google/redirect`.
- **Session Security**: Sessions are secured with strong secrets and HTTP-only cookies.
- **Validation**: All input is validated and sanitized.
- **Error Handling**: Consistent error responses and logging.

---

## 🗂️ File Uploads

- **Profile Images & Certificates**: Uploaded via `/api/artisan/profile` using `multipart/form-data`.
- **Work Images**: Upload up to 10 images via `/api/upload/:userId` (minimum 7 required).
- **Storage**: All images are stored securely on Cloudinary.

---

## 🤝 Contributing

Contributions are welcome!  
To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> **Made with ❤️ for artisans, by artisans.**
