CLAUDE.md – Backend
This file contains persistent instructions for Claude Code when working on the backend of the Agent Experiment 2 project. Always follow these guidelines in every task.

1. Project Overview
This is the backend of a web system for managing students, classes, and academic evaluations.
The backend is the single source of truth for all application data. It owns persistence via JSON files on the server filesystem and is responsible for all business logic, including evaluation management and daily email notifications.
Key responsibilities:

Full CRUD for students, classes, and evaluations via a REST API
Persist all data as JSON files in the data/ folder
Enforce domain rules (CPF uniqueness, referential integrity between students/classes/evaluations)
Send one consolidated email per student per day when their evaluations are updated, using Nodemailer + Gmail SMTP
Schedule the daily email batch job using node-cron


2. Tech Stack
LayerTechnologyRuntimeNode.js (LTS)FrameworkExpressLanguageTypeScript (strict mode)JSON Persistencefs-extraEmailNodemailer + Gmail SMTPEmail Schedulingnode-cronID GenerationuuidEnvironment VarsdotenvCORScorsDev Serverts-node + nodemonLintingESLint + Prettier

3. Folder Structure
Always place files in the correct folder. Never create files outside this structure without justification.
src/
├── controllers/        # Thin route handlers — validate input, call service, send response
│   ├── studentController.ts
│   ├── classController.ts
│   └── evaluationController.ts
├── routes/             # Express router definitions
│   ├── studentRoutes.ts
│   ├── classRoutes.ts
│   └── evaluationRoutes.ts
├── services/           # Business logic — no Express req/res objects here
│   ├── studentService.ts
│   ├── classService.ts
│   ├── evaluationService.ts
│   ├── jsonStorageService.ts   # All JSON file read/write operations
│   └── emailService.ts         # Nodemailer configuration and send logic
├── jobs/               # Scheduled background tasks
│   └── emailScheduler.ts       # node-cron daily email batch job
├── middlewares/        # Express middlewares
│   └── errorHandler.ts         # Global error handler — registered last in index.ts
├── types/              # Shared TypeScript interfaces and enums
│   └── index.ts
├── utils/              # Pure helper functions
│   └── dateUtils.ts            # Date formatting and comparison helpers
└── index.ts            # App entry point — server bootstrap only
data/                   # JSON persistence files — created automatically on first run
├── students.json
├── classes.json
└── evaluations.json

4. JSON Persistence Rules
All data is stored in JSON files inside the data/ folder. This is the persistence layer — treat it with the same care as a database.
File schemas
students.json
json[
  {
    "id": "uuid-v4",
    "name": "João Silva",
    "cpf": "123.456.789-00",
    "email": "joao@example.com"
  }
]
classes.json
json[
  {
    "id": "uuid-v4",
    "topic": "Introduction to Programming",
    "year": 2024,
    "semester": 1,
    "studentIds": ["uuid-v4", "uuid-v4"]
  }
]
evaluations.json
json[
  {
    "id": "uuid-v4",
    "studentId": "uuid-v4",
    "classId": "uuid-v4",
    "goal": "Requirements",
    "concept": "MA",
    "updatedAt": "2024-06-15T23:00:00.000Z"
  }
]
Storage rules

All JSON file operations go through src/services/jsonStorageService.ts exclusively. Never call fs or fs-extra directly from controllers or other services.
On server startup, initialize any missing JSON files with an empty array [].
Always read the full file, mutate the in-memory array, then write the full file back. Never perform partial writes.
Wrap all file operations in try/catch. If a read fails, return an empty array and log the error. If a write fails, throw so the controller can return a 500.
The data/ folder path comes from the DATA_DIR environment variable. Never hardcode the path.
The data/ folder must be in .gitignore — never commit JSON data files.

jsonStorageService API
Expose these generic typed functions — do not create separate functions per entity:
tsreadData<T>(filename: string): Promise<T[]>
writeData<T>(filename: string, data: T[]): Promise<void>
All domain services call these two functions with the appropriate filename constant:
tsconst FILES = {
  STUDENTS:    'students.json',
  CLASSES:     'classes.json',
  EVALUATIONS: 'evaluations.json',
} as const;

5. Domain Model
tsexport type EvaluationConcept = 'MANA' | 'MPA' | 'MA';
// MANA = Goal Not Yet Achieved
// MPA  = Goal Partially Achieved
// MA   = Goal Achieved

export type Goal =
  | 'Requirements'
  | 'Tests'
  | 'Implementation'
  | 'Design'
  | 'Process';

export interface Student {
  id: string;       // uuid v4
  name: string;
  cpf: string;      // unique — enforce on create and update
  email: string;
}

export interface Class {
  id: string;       // uuid v4
  topic: string;
  year: number;
  semester: 1 | 2;
  studentIds: string[];
}

export interface Evaluation {
  id: string;       // uuid v4
  studentId: string;
  classId: string;
  goal: Goal;
  concept: EvaluationConcept;
  updatedAt: string; // ISO 8601 — set on every create or update
}
All types live in src/types/index.ts. Never redefine them elsewhere.

6. API Design Conventions
Routes
MethodPathDescriptionGET/healthHealth check → { status: 'ok' }GET/studentsList all studentsPOST/studentsCreate a studentGET/students/:idGet a student by idPUT/students/:idUpdate a studentDELETE/students/:idDelete a studentGET/classesList all classesPOST/classesCreate a classGET/classes/:idGet a class with its full evaluation matrixPUT/classes/:idUpdate a classDELETE/classes/:idDelete a classPATCH/evaluationsCreate or update a single evaluation entryGET/evaluations/summaryGlobal summary — all students × all goals
Request / Response rules

Use JSON for all request and response bodies.
Always return appropriate HTTP status codes:

200 — successful read or update
201 — successful creation
400 — bad request (missing fields, duplicate CPF, invalid concept/goal value)
404 — resource not found
409 — conflict (e.g., deleting a student enrolled in a class)
500 — internal server error


Never expose stack traces or file paths in error responses.
All error responses follow this shape:

ts{ "error": "Human-readable description of what went wrong" }
GET /classes/:id response shape
This endpoint must return the class object enriched with its full evaluation matrix:
ts{
  id: string;
  topic: string;
  year: number;
  semester: number;
  students: Student[];   // resolved from studentIds — not just IDs
  evaluations: Evaluation[];
}
PATCH /evaluations behavior

If an evaluation already exists for the given (studentId, classId, goal) triple, update its concept and set updatedAt to now.
If it does not exist, create a new one with a new uuid and updatedAt set to now.
Always return the full updated or created Evaluation object.


7. Domain Rules (enforce in service layer)

CPF uniqueness: before creating or updating a student, verify no other student has the same CPF. Return 400 if violated.
Student deletion: before deleting a student, check if they are enrolled in any class (studentIds array). If yes, return 409 with message "Student is enrolled in one or more classes and cannot be deleted."
Class deletion: when a class is deleted, also delete all evaluations in evaluations.json where classId matches. This is a cascading delete — do it atomically (delete from both files in the same operation before returning).
Evaluation concept validation: reject any concept value that is not 'MANA', 'MPA', or 'MA'. Return 400.
Goal validation: reject any goal value not in the defined Goal type. Return 400.
Student enrollment: when creating or updating a class, validate that all studentIds exist in students.json. Return 400 if any id is not found.


8. Email Service — Nodemailer + Gmail SMTP
All email logic lives in src/services/emailService.ts.
Configuration
tsimport nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password — not the account password
  },
});
sendEvaluationSummary function
tsinterface EvaluationUpdate {
  className: string;
  goal: Goal;
  concept: EvaluationConcept;
}

sendEvaluationSummary(student: Student, updates: EvaluationUpdate[]): Promise<void>

Subject: "Evaluation Update — [student name]"
Body: an HTML email listing each update grouped by class name, showing goal and new concept for each entry.
If transporter.sendMail throws, log the error and rethrow so the scheduler can handle it.
Never call sendEvaluationSummary directly from a controller or route. It is only called by the email scheduler job.


9. Daily Email Batch Job
All scheduling logic lives in src/jobs/emailScheduler.ts.
Behavior

Runs once per day at 23:00 server time using node-cron ('0 23 * * *').
On each run:

Read all evaluations from evaluations.json.
Filter evaluations where updatedAt date (ignoring time) equals today's date.
For each unique studentId in the filtered list, group their updated evaluations.
For each student, resolve the student record and each class name from classes.json.
Call sendEvaluationSummary(student, updates) once per student.


If sending fails for one student, log the error and continue processing the remaining students — never abort the whole batch.
Log a summary at the end: how many students were emailed, how many failed.

Registration
Register the scheduler in src/index.ts after the Express app starts:
tsimport { startEmailScheduler } from './jobs/emailScheduler';
startEmailScheduler();
Testing the scheduler manually
Expose an internal trigger for testing without waiting for 23:00:
tsexport const runEmailJobNow = async (): Promise<void> => { ... }
This function is called directly in tests — it must contain the exact same logic as the cron callback.

10. Middleware Conventions

Error handler (src/middlewares/errorHandler.ts): a single Express error-handling middleware (err, req, res, next) registered last in index.ts. All service errors must be forwarded via next(error) — never handle errors inline in controllers.
CORS (index.ts): configure cors to allow requests only from the FRONTEND_URL environment variable. Do not use cors() with no options — always specify the origin explicitly.


11. Environment Variables
All variables defined in .env, accessed via process.env. Never hardcode values.
VariableDescriptionPORTExpress server port (default: 3333)FRONTEND_URLAllowed CORS origin (e.g., http://localhost:5173)GMAIL_USERGmail address used to send emailsGMAIL_APP_PASSWORDGmail App Password (not the account password)DATA_DIRAbsolute or relative path to the JSON storage folder
Validate all required variables at startup. If any are missing, log a descriptive error and call process.exit(1).

12. Code Quality Rules

Controllers are thin: validate input shape, call one service function, send the response. No business logic in controllers.
Services own all logic: domain rules, JSON reads/writes, and transformations. No req/res/next objects inside services.
jsonStorageService is the only file that touches the filesystem: no other file may import fs or fs-extra.
emailService is the only file that uses Nodemailer: no other file may import nodemailer.
No commented-out code in committed files.
No console.log in committed files — use a simple logger utility or console.error for errors only.
No magic strings: concept and goal values always come from the EvaluationConcept and Goal types.
Every function must do one thing. Split functions that exceed ~40 lines.
Prefer const over let. Never use var.
Use async/await over .then() chains.
Always handle errors explicitly — never silently swallow exceptions.
Always await all async calls — never fire and forget.


13. Git Conventions

Branch naming: feature/P{phase}-{code}-{short-slug} (e.g., feature/P4-14-email-scheduler)
Commit message format (Conventional Commits):

feat: implement daily email batch job
fix: cascade delete evaluations on class removal
refactor: extract jsonStorageService generic read/write
test: add Gherkin scenarios for evaluation PATCH
docs: document Gmail App Password setup


Commit small and often — one logical change per commit.
Never commit directly to main. Always use a feature branch and merge via PR.


14. What to Avoid

Do not use any database driver, ORM, or cache layer — JSON files are the only persistence mechanism.
Do not import fs or fs-extra outside of jsonStorageService.ts.
Do not import nodemailer outside of emailService.ts.
Do not call sendEvaluationSummary from controllers or routes — only from the scheduler job.
Do not put business logic or domain rules in controllers or route files.
Do not put Express-specific code (req, res, next) inside service files.
Do not hardcode the data/ folder path — always use DATA_DIR from environment variables.
Do not commit the data/ folder or any .json data files — they are in .gitignore.
Do not use any type — ever.
Do not install new dependencies without confirming with the user first.