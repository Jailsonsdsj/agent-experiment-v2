# EduEval Frontend

This is the user interface for the EduEval educational evaluation system. It provides a browser-based dashboard to manage students, classes, and evaluation data.

## Accessing the System

1. Start the backend API first so the frontend can fetch data.
2. From `System/frontend`, install dependencies if needed:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open the app in your browser at:
   ```text
   http://localhost:5173
   ```
5. The app opens on the Students page. Use the top navigation to switch between:
   - `Students`
   - `Classes`
   - `Evaluations`

## Managing Students

- Go to the `Students` page to see all registered students.
- Click `New Student` to add a student with:
  - Name
  - CPF (unique identifier)
  - Email address
- Use the edit action to update a student’s name, CPF, or email.
- Delete a student from the list if they are no longer active.
- Student email addresses are required for email notifications.

## Managing Classes

- Visit the `Classes` page to view all classes.
- Click `New Class` to create a class with:
  - Topic
  - Year
  - Semester
- After creating a class, open its detail page to see:
  - enrolled students
  - evaluation statistics
  - the evaluation matrix for that class
- Use `Edit Class` to:
  - update class details
  - add or remove enrolled students from the class

## Recording and Reviewing Evaluations

- Evaluations are managed from the class detail page.
- The `Evaluation Matrix` shows each enrolled student and the evaluation goals.
- For each student and goal, choose one of:
  - `MANA` — Not Achieved
  - `MPA` — Partially Achieved
  - `MA` — Achieved
- Evaluation changes save immediately when you select a value.
- The `Evaluations` page shows the latest result for each student across all classes.

## Email Notification System

- The email system is automatic and runs from the backend.
- Students with a valid email address receive a daily summary when their evaluations are updated.
- Emails are sent once per day at `23:00 UTC` and include:
  - class name
  - goal name
  - updated evaluation concept
- If you update evaluations late in your local day, note that the scheduler uses UTC date boundaries. Updates after `00:00 UTC` may appear in the next day’s notification.

## User Workflow Summary

1. Register students first on the `Students` page.
2. Create classes on the `Classes` page.
3. Enroll students into classes by editing a class.
4. Record or update evaluations on the class detail page.
5. Review overall results on the `Evaluations` page.
6. Students receive daily email summaries automatically when their evaluations change.

## Notes

- There is no separate login or authentication in this interface.
- The frontend relies on the backend API being available and configured for local development.
