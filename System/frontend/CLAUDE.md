CLAUDE.md – Frontend
This file contains persistent instructions for Claude Code when working on the frontend of the Agent Experiment 2 project. Always follow these guidelines in every task.

1. Project Overview
This is the frontend of a web system for managing students, classes, and academic evaluations.
The frontend is a pure presentation and interaction layer. It owns no data and performs no persistence. All application state lives on the backend, persisted as JSON files.
Key responsibilities:

Manage students (CRUD) via backend API
Manage classes (CRUD) with student enrollment via backend API
Display and edit evaluation matrices per class (concepts: MANA, MPA, MA)
Display a global evaluation summary across all students and goals
Communicate all data operations to the backend via Axios — never store data locally


2. Tech Stack
LayerTechnologyFrameworkReact 18 with TypeScriptStylingTailwind CSSRoutingReact Router v6HTTP ClientAxiosBuild ToolViteLintingESLint + Prettier

3. Folder Structure
Always place files in the correct folder. Never create files outside this structure without justification.
src/
├── assets/           # Static files (images, icons)
├── components/       # Reusable UI components (Button, Modal, Table, Badge, etc.)
├── hooks/            # Custom React hooks (useStudents, useClasses, useEvaluations)
├── pages/            # Page-level components mapped to routes
│   ├── students/     # Student management pages
│   ├── classes/      # Class management and detail pages
│   └── evaluations/  # Global evaluation summary page
├── services/
│   └── apiService.ts # All Axios calls to the backend — single source of truth
├── types/            # Shared TypeScript interfaces and enums
│   └── index.ts
└── utils/            # Pure helper functions (formatting, validation, sorting)

4. Data Layer — Backend API Only
The frontend never stores data locally. There is no localStorage, sessionStorage, or in-memory global state for domain data.

All reads and writes go through src/services/apiService.ts.
Never call localStorage or sessionStorage anywhere in the codebase.
Never store domain data (students, classes, evaluations) in React Context or global state.
Component and hook state is only used for UI concerns: loading indicators, error messages, form field values, modal open/close state.
After every successful mutation (create, update, delete), always re-fetch the affected resource from the backend to keep the UI in sync.


5. Domain Model
Understand the domain before writing any code. These are the core concepts:
ts// Evaluation concept — always use this type, never raw strings
export type EvaluationConcept = 'MANA' | 'MPA' | 'MA';
// MANA = Goal Not Yet Achieved
// MPA  = Goal Partially Achieved
// MA   = Goal Achieved

// Goals are fixed columns in the evaluation matrix
export type Goal = 'Requirements' | 'Tests' | 'Implementation' | 'Design' | 'Process';

export interface Student {
  id: string;        // uuid
  name: string;
  cpf: string;       // Brazilian CPF — unique per student
  email: string;
}

export interface Class {
  id: string;        // uuid
  topic: string;     // e.g., "Introduction to Programming"
  year: number;
  semester: 1 | 2;
  studentIds: string[];
}

export interface Evaluation {
  id: string;
  studentId: string;
  classId: string;
  goal: Goal;
  concept: EvaluationConcept;
  updatedAt: string; // ISO 8601 datetime string
}

// Used to render the evaluation matrix on the class detail page
export interface EvaluationMatrix {
  classId: string;
  // key: studentId, value: record of goal → concept
  rows: Record<string, Partial<Record<Goal, EvaluationConcept>>>;
}
All domain types live in src/types/index.ts. Never redefine these types in component or hook files.

6. TypeScript Conventions

strict: true is enabled. Never use implicit any.
All props, state, function parameters, and return types must be explicitly typed.
Use interface for object shapes, type for unions and aliases.
Never use any, object, or {} as a type. If the type is truly unknown, use unknown and then narrow it.
Always use EvaluationConcept and Goal types — never hardcode concept or goal strings directly in components.


7. API Communication
All backend calls live exclusively in src/services/apiService.ts. Never call Axios directly from a component or hook.
Configure a shared Axios instance:
tsimport axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
Expose one typed function per API operation. Examples:
tsexport const getStudents = (): Promise<Student[]> =>
  api.get('/students').then(r => r.data);

export const createStudent = (data: Omit<Student, 'id'>): Promise<Student> =>
  api.post('/students', data).then(r => r.data);

export const patchEvaluation = (
  payload: Pick<Evaluation, 'studentId' | 'classId' | 'goal' | 'concept'>
): Promise<Evaluation> =>
  api.patch('/evaluations', payload).then(r => r.data);
Backend endpoints:
MethodPathDescriptionGET/healthHealth checkGET/studentsList all studentsPOST/studentsCreate a studentGET/students/:idGet a student by idPUT/students/:idUpdate a studentDELETE/students/:idDelete a studentGET/classesList all classesPOST/classesCreate a classGET/classes/:idGet a class with its evaluation matrixPUT/classes/:idUpdate a classDELETE/classes/:idDelete a classPATCH/evaluationsCreate or update a single evaluation entryGET/evaluations/summaryGet global evaluation summary (all students/goals)

8. Component Conventions

One component per file. File name matches the component name in PascalCase.
Use functional components only. No class components.
Keep components small and focused. If a component exceeds ~150 lines, split it.
All reusable UI primitives live in src/components/.
Page components live in src/pages/ and handle layout and data orchestration only — no business logic or direct API calls.
Business logic and API calls belong in custom hooks.

Required base components
ComponentPurposeButtonPrimary, secondary, ghost, danger variantsInputText input with label and error stateSelectDropdown with label and error stateModalCentered overlay with portal renderingTableGeneric typed table with loading and empty statesCardContainer with shadow, padding, optional title and footerBadgeConcept badge: distinct color per MANA / MPA / MA / emptyFormLayoutConsistent vertical form wrapperPageHeaderPage title, optional subtitle, optional right-side action slotConfirmModalReusable delete confirmation dialog
Badge color mapping (must follow this exactly)
ConceptBackgroundTextMeaningMANARed (danger)WhiteGoal Not Yet AchievedMPAYellow (warning)DarkGoal Partially AchievedMAGreen (success)WhiteGoal Achieved—Gray (neutral)GrayNot yet evaluated

9. Custom Hooks
Extract all API calls and derived state into custom hooks. Never call apiService directly from a page component.
Required hooks:
HookResponsibilityuseStudentsFetch student list, expose CRUD handlersuseClassesFetch class list, expose CRUD handlersuseClassDetailFetch single class + evaluation matrix by iduseEvaluationsFetch global evaluation summary, expose patch handler
All hooks live in src/hooks/ and follow the pattern:
tsconst useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => { ... }, []);
  useEffect(() => { load(); }, [load]);

  return { students, isLoading, error, reload: load, ... };
};
Hooks must not contain JSX. Hooks must use useCallback for stable handler references.

10. Evaluation Matrix Page Rules
The class detail page (/classes/:id) is the most complex page in the system. Follow these rules:

Rows = enrolled students (fetched from the class's studentIds)
Columns = fixed list of goals: Requirements, Tests, Implementation, Design, Process
Each cell renders a Select component (or styled dropdown) with options: — (empty), MANA, MPA, MA
Changing a cell value immediately calls PATCH /evaluations — no save button needed
While the PATCH is in-flight, disable that cell to prevent double submissions
If the PATCH fails, restore the previous value and show an inline error
Each cell also renders a Badge component below or inside it showing the current concept
The header row must display goal names. The first column must display student names.


11. Styling Conventions

Use Tailwind CSS utility classes exclusively. No custom CSS unless absolutely necessary.
Never use inline style={{}} props.
Design tokens (colors, typography, spacing) are defined in tailwind.config.js under theme.extend. Always use those tokens — never hardcode hex values in JSX.
Responsive design is required. Use Tailwind's responsive prefixes (sm:, md:, lg:).
The Badge component color variants must use the exact token mapping defined in Section 8.


12. Code Quality Rules

No commented-out code in committed files.
No console.log in committed files.
No magic strings — concept values ('MANA', 'MPA', 'MA') and goal names must always come from the EvaluationConcept and Goal types, never be hardcoded in JSX or logic.
Every function must do one thing. Split functions that exceed ~40 lines.
Prefer const over let. Never use var.
Use async/await over .then() chains (except in apiService.ts where .then(r => r.data) is acceptable for concise response unwrapping).
Always handle errors explicitly — never silently swallow exceptions.
Display all API errors to the user with an inline message in danger color. Never use alert().


13. Git Conventions

Branch naming: feature/P{phase}-{code}-{short-slug} (e.g., feature/P4-03-student-list)
Commit message format (Conventional Commits):

feat: add student creation form
fix: restore evaluation cell value on patch failure
refactor: extract useClassDetail hook
test: add Gherkin scenarios for evaluation matrix
docs: update README with API base URL config


Commit small and often — one logical change per commit.
Never commit directly to main. Always use a feature branch and merge via PR.


14. What to Avoid

Do not use localStorage, sessionStorage, or any browser storage API — ever.
Do not call axios directly in components or hooks — always use apiService.ts.
Do not store domain data in React Context or global state managers.
Do not use any type — ever.
Do not hardcode concept strings ('MANA', 'MPA', 'MA') or goal names outside of src/types/index.ts.
Do not add a "Save" button to the evaluation matrix — changes must be auto-saved on cell change.
Do not create new folders outside the defined structure without justification.
Do not install new dependencies without confirming with the user first.