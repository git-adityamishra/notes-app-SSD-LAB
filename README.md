# SSD Lab Activity 4: Student Notes CRUD Micro-App

## 1. Candidate Information
- **Name:** Aditya Mishra
- **Roll No.:** 2026201014
- **GitHub Repository:** https://github.com/git-adityamishra/notes-app-SSD-LAB

## 2. Setup & Execution Commands
```bash
# Backend setup
cd server
npm install
npm start

# Frontend setup (in another terminal)
cd client
npm install
npm run dev
```

## 3. Endpoints Implemented
- `POST /api/notes` - 201 Created
- `GET /api/notes` - 200 OK (sorted chronologically descending)
- `DELETE /api/notes/:id` - 200 OK / 404 Not Found