# Employee Directory — React + TypeScript + PHP + MySQL

A small full-stack employee directory built for a timed coding assignment.

## Stack
- Frontend: React, TypeScript, Vite, Axios, plain CSS
- Backend: PHP 8+ REST API using PDO
- Database: MySQL / MariaDB

## Features
- Add, view, edit, and delete employees
- Search by employee name, email, or role
- Client-side pagination
- Responsive UI with loading, empty, and error states
- Prepared SQL statements and basic server-side validation
- CORS support

## Requirements
- PHP 8+ with PDO MySQL enabled
- MySQL or MariaDB (XAMPP is fine)
- Node.js 18+ and npm

## 1. Set up the database
1. Start Apache and MySQL in XAMPP.
2. Open phpMyAdmin at `http://localhost/phpmyadmin`.
3. Import `backend/database.sql` (or run its SQL in a new database tab).

The script creates a database named `employee_directory` and the `employees` table.

## 2. Configure and start the PHP API
The API is configured in `backend/config.php`.

Default local configuration:
- Host: `127.0.0.1`
- Database: `neel_employee_directory`
- Username: `root`
- Password: empty (default XAMPP setup)

Update these values according to your local MySQL configuration.

Copy the `backend` folder into your web root, for example:
`C:\xampp\htdocs\employee-directory-test\backend`

Then start Apache and open:
`http://localhost/employee-directory-test/backend/employees`

The URL above should return JSON. The `backend/.htaccess` file maps the required REST-style routes to the PHP entry point (Apache `mod_rewrite` must be enabled, which is normally enabled in XAMPP):
- `GET    /backend/employees`
- `POST   /backend/employees`
- `PUT    /backend/employees/1`
- `DELETE /backend/employees/1`

For convenience, the PHP endpoint also accepts `?id=1` for PUT/DELETE if rewrite rules are unavailable.

## 3. Start the frontend
From this project folder, open a terminal in `frontend` and run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

The frontend defaults to:
`http://localhost/employee-directory-test/backend/employees`

If your backend is installed at a different URL, update `VITE_API_URL` in `frontend/.env` or edit `frontend/src/api.ts`.

## API examples

### Get all employees
```http
GET http://localhost/employee-directory-test/backend/employees
```

### Add employee
```http
POST http://localhost/employee-directory-test/backend/employees
Content-Type: application/json

{
  "name": "Aarav Mehta",
  "email": "aarav@example.com",
  "role": "Software Engineer"
}
```

### Update employee
```http
PUT http://localhost/employee-directory-test/backend/employees?id=1
Content-Type: application/json

{
  "name": "Aarav Mehta",
  "email": "aarav@example.com",
  "role": "Senior Software Engineer"
}
```

### Delete employee
```http
DELETE http://localhost/employee-directory-test/backend/employees?id=1
```

## Postman notes
- For POST and PUT, choose **Body → raw → JSON**.
- The API returns JSON responses and appropriate HTTP status codes.
- Delete permanently removes the selected row from the local database.

## GitHub submission
Create a public repository, then from the project root:

```bash
git init
git add .
git commit -m "Build employee directory"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Replace the remote URL with your repository URL. Do not commit real production credentials.
