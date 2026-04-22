// ─── Primitive domain types ──────────────────────────────────────────────────

/**
 * The three possible evaluation outcomes for a goal.
 * Used in Evaluation, EvaluationMatrix, Badge rendering, and Select options.
 *
 * MANA = Goal Not Yet Achieved
 * MPA  = Goal Partially Achieved
 * MA   = Goal Achieved
 */
export type EvaluationConcept = 'MANA' | 'MPA' | 'MA';

/**
 * The fixed set of evaluation goals assessed per student per class.
 * Used as column headers in the evaluation matrix and as keys in EvaluationMatrix rows.
 */
export type Goal =
  | 'Requirements'
  | 'Tests'
  | 'Implementation'
  | 'Design'
  | 'Process';

// ─── Entity interfaces ────────────────────────────────────────────────────────

/**
 * A registered student in the system.
 * CPF uniqueness is enforced at the service layer, not the type level.
 */
export interface Student {
  /** UUID v4 assigned on creation */
  id: string;
  name: string;
  /** Brazilian CPF — must be unique across all students */
  cpf: string;
  email: string;
}

/**
 * A class (turma) with its enrolled student IDs.
 * This is the stored shape — studentIds are resolved to Student[] only in ClassDetail.
 */
export interface Class {
  /** UUID v4 assigned on creation */
  id: string;
  topic: string;
  year: number;
  /** Academic semester — only 1 or 2 are valid values */
  semester: 1 | 2;
  /** References to enrolled Student ids */
  studentIds: string[];
}

/**
 * Enriched class shape returned by GET /classes/:id.
 * Replaces studentIds with resolved Student objects and includes all evaluations.
 * Never stored directly — assembled by the service layer on read.
 */
export interface ClassDetail extends Omit<Class, 'studentIds'> {
  /** Resolved Student objects for all enrolled students */
  students: Student[];
  /** All evaluations recorded for this class */
  evaluations: Evaluation[];
}

/**
 * A single evaluation entry linking a student, a class, a goal, and a concept.
 * Created or updated via PATCH /evaluations.
 */
export interface Evaluation {
  /** UUID v4 assigned on creation */
  id: string;
  studentId: string;
  classId: string;
  goal: Goal;
  concept: EvaluationConcept;
  /** ISO 8601 datetime string — set on every create or update; string because JSON does not preserve Date objects */
  updatedAt: string;
}

/**
 * Sparse matrix of evaluations for a class, keyed by studentId then Goal.
 * Used to render the evaluation matrix table on the class detail page.
 * Inner record is Partial because not all goals will have been evaluated yet.
 */
export interface EvaluationMatrix {
  classId: string;
  /** Outer key: studentId. Inner key: Goal (Partial — unevaluated goals are absent). */
  rows: Record<string, Partial<Record<Goal, EvaluationConcept>>>;
}

/**
 * A single line item in a student's daily evaluation summary email.
 * Consumed exclusively by the email service and email scheduler job.
 */
export interface EvaluationUpdate {
  className: string;
  goal: Goal;
  concept: EvaluationConcept;
}

// ─── Utility types ────────────────────────────────────────────────────────────

/**
 * Strips auto-generated fields from any entity type, producing the shape
 * expected for POST request bodies (create operations).
 *
 * @example CreateInput<Student> → { name: string; cpf: string; email: string }
 * @example CreateInput<Evaluation> → { studentId, classId, goal, concept }
 */
export type CreateInput<T> = Omit<T, 'id' | 'updatedAt'>;

/**
 * One row in the GET /evaluations/summary response.
 * Represents a single student's most recent concept per goal across all classes.
 * goals is Partial because not every goal will have been evaluated yet.
 */
export interface EvaluationSummaryRow {
  studentId: string;
  studentName: string;
  goals: Partial<Record<Goal, {
    concept: EvaluationConcept;
    updatedAt: string;
    classId: string;
    className: string;
  }>>;
}
