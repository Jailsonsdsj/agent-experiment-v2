# EduEval Backend

A Node.js REST API for managing educational evaluations, including students, classes, and performance tracking with automated email notifications.

## Project Overview

The EduEval backend provides a JSON-based data storage system for educational institutions to manage student records, class enrollments, and evaluation data. It includes RESTful endpoints for CRUD operations, automated daily email summaries for evaluation updates, and comprehensive BDD tests using Cucumber.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Data Storage**: JSON files (fs-extra)
- **Email**: Nodemailer with Gmail SMTP
- **Scheduling**: node-cron
- **Testing**: Cucumber.js (BDD)
- **Other**: UUID for ID generation, CORS for cross-origin requests

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- Gmail account for email notifications

### Installation

1. Navigate to the backend directory:
   ```bash
   cd System/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the `System/backend` directory with the following variables:

```env
# Server configuration
PORT=3000
DATA_DIR=./data
FRONTEND_URL=http://localhost:5173

# Email configuration (required for notifications)
GMAIL_USER=your-gmail@example.com
GMAIL_APP_PASSWORD=your-app-password
```

## Running the Project

### Development Mode

Start the server with hot-reload:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### Production Mode

Build and run the compiled JavaScript:
```bash
npm run build
npm start
```

## API Documentation

The API provides RESTful endpoints for managing students, classes, and evaluations. All endpoints return JSON responses.

### Students

- **GET /students**
  - Description: Retrieve all students
  - Response: Array of student objects
  - Example Response:
    ```json
    [
      {
        "id": "uuid",
        "name": "John Doe",
        "cpf": "12345678901",
        "email": "john@example.com"
      }
    ]
    ```

- **GET /students/:id**
  - Description: Retrieve a specific student by ID
  - Response: Single student object

- **POST /students**
  - Description: Create a new student
  - Request Body:
    ```json
    {
      "name": "Jane Smith",
      "cpf": "98765432100",
      "email": "jane@example.com"
    }
    ```
  - Response: Created student object

- **PUT /students/:id**
  - Description: Update an existing student
  - Request Body: Same as POST
  - Response: Updated student object

- **DELETE /students/:id**
  - Description: Delete a student
  - Response: Empty (204 No Content)

### Classes

- **GET /classes**
  - Description: Retrieve all classes
  - Response: Array of class objects
  - Example Response:
    ```json
    [
      {
        "id": "uuid",
        "topic": "Introduction to Programming",
        "year": 2024,
        "semester": 1,
        "studentIds": ["student-uuid-1", "student-uuid-2"]
      }
    ]
    ```

- **POST /classes**
  - Description: Create a new class
  - Request Body:
    ```json
    {
      "topic": "Advanced Mathematics",
      "year": 2024,
      "semester": 2,
      "studentIds": []
    }
    ```
  - Response: Created class object

- **GET /classes/:id**
  - Description: Retrieve a specific class with enrolled students and evaluations
  - Response: Enriched class object with students and evaluations arrays

- **PUT /classes/:id**
  - Description: Update an existing class
  - Request Body: Same as POST
  - Response: Updated class object

- **DELETE /classes/:id**
  - Description: Delete a class
  - Response: Empty (204 No Content)

### Evaluations

- **PATCH /evaluations**
  - Description: Update or create an evaluation for a student in a class
  - Request Body:
    ```json
    {
      "studentId": "student-uuid",
      "classId": "class-uuid",
      "goal": "Communication",
      "concept": "MA"
    }
    ```
  - Response: Updated evaluation object

- **GET /evaluations/summary**
  - Description: Get the latest evaluation concept for each student per goal across all classes
  - Response: Array of evaluation summary rows
  - Example Response:
    ```json
    [
      {
        "studentId": "student-uuid",
        "studentName": "John Doe",
        "goal": "Communication",
        "concept": "MA",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ]
    ```

## JSON Data Structure

Data is stored in JSON files within the `data/` directory. The system uses file-based persistence without a traditional database.

### File Organization

- `students.json`: Contains an array of student records
- `classes.json`: Contains an array of class records
- `evaluations.json`: Contains an array of evaluation records

### Schema Definitions

#### Student
```json
{
  "id": "string (UUID)",
  "name": "string",
  "cpf": "string (unique identifier)",
  "email": "string"
}
```

#### Class
```json
{
  "id": "string (UUID)",
  "topic": "string",
  "year": "number",
  "semester": "number (1 or 2)",
  "studentIds": "string[] (array of student UUIDs)"
}
```

#### Evaluation
```json
{
  "id": "string (UUID)",
  "studentId": "string (references student.id)",
  "classId": "string (references class.id)",
  "goal": "string (e.g., 'Communication', 'Problem Solving')",
  "concept": "string ('MANA' | 'MPA' | 'MA')",
  "updatedAt": "string (ISO 8601 timestamp)"
}
```

## Email Configuration

The system sends automated daily email summaries to students when their evaluations are updated.

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use this 16-character password (ignoring spaces) as `GMAIL_APP_PASSWORD`

### Required Environment Variables

- `GMAIL_USER`: Your Gmail address
- `GMAIL_APP_PASSWORD`: The generated app password

## Scheduler / Background Jobs

The email scheduler runs automatically when the server starts.

### Daily Email Job

- **Trigger**: Cron schedule `0 23 * * *` (daily at 23:00 UTC)
- **Behavior**: 
  - Scans evaluations updated on the current UTC date
  - Groups updates by student
  - Sends one HTML email per student with their evaluation changes
  - Includes class name, goal, and new concept for each update
- **Timing**: Uses UTC date boundaries; updates after 00:00 UTC appear in the next day's batch

## Running Tests

Tests are written using Cucumber.js for BDD-style testing.

### Commands

- Run all tests:
  ```bash
  npm test
  ```

- Dry run (validate syntax without executing):
  ```bash
  npm run test:dry
  ```

- Run tests with specific tags:
  ```bash
  npm run test:tags -- @tag-name
  ```

### Expected Behavior

Tests cover API endpoints, data persistence, email sending, and scheduling. They use step definitions in `features/step-definitions/` and feature files in `features/`.

## Folder Structure

```
System/backend/
├── data/                    # JSON data files
├── features/               # Cucumber test features
│   ├── step-definitions/   # Test step implementations
│   └── support/           # Test configuration
├── src/
│   ├── controllers/       # HTTP request handlers
│   ├── jobs/             # Background jobs (email scheduler)
│   ├── middlewares/      # Express middlewares
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic and data access
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── package.json
├── tsconfig.json
└── README.md
```

## Notes / Troubleshooting

- **Data Persistence**: All data is stored in JSON files. Back up the `data/` directory regularly.
- **Email Issues**: Ensure Gmail App Password is correct and 2FA is enabled. Check spam folder for test emails.
- **CORS**: The API is configured to accept requests from the frontend URL specified in `FRONTEND_URL`.
- **Time Zones**: The scheduler uses UTC; adjust expectations based on your local time zone.
- **Performance**: For production use, consider migrating to a proper database for better scalability.
- **Security**: This setup is for development; implement proper authentication and authorization for production.
