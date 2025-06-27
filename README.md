# Dell-InnovateDash-Project
Empower+ helps users assess cancer risk through a lifestyle quiz, delivers personalized risk scores, recommends relevant screenings with booking links, and offers educational quizzes, a support chatbot, and a dashboard to track results—all in one platform.


### 📁 Project Structure: SCS Web App (MERN Stack)
```
project_root/
│
├── backend/                    # 🔙 Backend (server-side code)
│   ├── config/                 # 📡 Setup files (e.g. connect to MongoDB or Google login)
│   ├── controllers/            # 🧠 Functions that handle what each route should do ((e.g. save user in registerUser())
│   ├── middleware/             # 🛡 Code that runs before certain routes (e.g. checking login token)
│   ├── models/                 # 🗃 MongoDB database structure (e.g. user data shape)
│   ├── routes/                 # 🚏 Define Backend URLs (e.g. POST /api/register → registerUser)
│   ├── server.js               # 🚀 Main backend file — starts the server and connects everything
│   ├── .env                    # 🔐 Secrets (DB password, API keys, etc)
│   └── package.json            # 📦 Lists what packages are used (express, mongoose, etc)
│
├── frontend/                   # 🎨 Frontend (the UI people see)
│   ├── public/                 # 🗂 The base HTML file and static files like images
│   ├── src/                    # 📁 All main code for the website
│   │   ├── components/         # 🧩 Reusable parts like buttons, forms, headers, etc.
│   │   ├── pages/              # 📄 Different pages (e.g. Home, Signup, Dashboard)
│   │   ├── api/                # 🔌 Functions to talk to the backend (e.g. register user)
│   │   ├── contexts/           # 🧠 Shares important data across pages (e.g. user info, app settings)
│   │   └── App.js              # 🧠 Connects all pages and routes together
│   │
│   ├── .env                    # 🌐 Stores backend URL for API calls
│   ├── package.json            # 📦 Lists packages used in frontend (like React, Axios)
│
└── README.md                   # 📘 Overview of the whole project (this file)

```

## How to Run the SCS Web App (MERN Stack)
This guide will help you run the application locally on your machine. <br>
### ✅ Prerequisites

Make sure you have the following installed:

- **Node.js (version 16 or higher)** 
- **npm (comes with Node.js)**
- **Git**

### Clone the Repository
```bash
git clone https://github.com/AungKT99/Dell_InnovateDash_CodeFusion.git
cd Dell_InnovateDash_CodeFusion
```


### Backend Setup
#### 2.1: Navigate to Backend Folder
```bash
cd backend
```

#### 2.2: Install Dependencies
```bash
npm install
```

#### 2.3: Create Environment File
Create a ```.env``` file in the ```backend/``` folder and copy-paste the **environment variables from the group chat**:
It should include:

- ```MONGODB_URI``` - Database connection string
- ```JWT_SECRET``` - Secret key for authentication
- ```PORT``` - Server port 

#### 2.4: Start the Backend Server
```bash
npm run dev
```
**✅ Backend should now be running at: ```http://localhost:8000```**


### Fontend Setup
#### 3.1: Navigate to Frontend Folder
Open a new **terminal window/tab** and run:
```bash
cd fontend
```

#### 3.2: Install Dependecies
```bash
npm install
```
#### 3.3: Create Environment File
Also Create a ```.env``` file in the ```fronend/``` folder and copy-paste the **environment variables for frontend**:

#### 3.4: Start the Frontend Server
```bash
npm run dev
```

**✅ Frontend should now be running at: ```http://localhost:3000```**
