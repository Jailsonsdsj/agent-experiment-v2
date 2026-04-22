import { v4 as uuidv4 } from 'uuid';
import { readData, writeData, FILES } from './jsonStorageService';
import { DomainError } from './studentService';
import type {
  Evaluation,
  EvaluationConcept,
  EvaluationSummaryRow,
  Goal,
  Class,
  Student,
  UpsertEvaluationInput,
} from '../types/index';

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_CONCEPTS = new Set<EvaluationConcept>(['MANA', 'MPA', 'MA']);

const VALID_GOALS = new Set<Goal>([
  'Requirements',
  'Tests',
  'Implementation',
  'Design',
  'Process',
]);

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Creates or updates a single evaluation for a (studentId, classId, goal) composite key.
 *
 * Validates concept, goal, and id presence before any I/O.
 * On UPDATE: replaces concept and sets updatedAt to now; id is preserved.
 * On CREATE: generates a new UUID and sets updatedAt to now.
 *
 * @param input - The four caller-supplied fields (id and updatedAt are generated here).
 * @returns The created or updated Evaluation record.
 * @throws DomainError('VALIDATION_ERROR') if concept, goal, studentId, or classId are invalid.
 * @throws Error (infrastructure) if the write to evaluations.json fails.
 */
export const upsertEvaluation = async (
  input: UpsertEvaluationInput,
): Promise<Evaluation> => {
  if (!input.studentId || !input.studentId.trim()) {
    throw new DomainError('VALIDATION_ERROR', 'Field "studentId" must be a non-empty string.');
  }
  if (!input.classId || !input.classId.trim()) {
    throw new DomainError('VALIDATION_ERROR', 'Field "classId" must be a non-empty string.');
  }
  if (!VALID_CONCEPTS.has(input.concept)) {
    throw new DomainError(
      'VALIDATION_ERROR',
      `Invalid concept "${input.concept}". Must be MANA, MPA, or MA.`,
    );
  }
  if (!VALID_GOALS.has(input.goal)) {
    throw new DomainError(
      'VALIDATION_ERROR',
      `Invalid goal "${input.goal}". Must be one of: ${[...VALID_GOALS].join(', ')}.`,
    );
  }

  const evaluations = await readData<Evaluation>(FILES.EVALUATIONS);

  const existingIndex = evaluations.findIndex(
    (e) =>
      e.studentId === input.studentId &&
      e.classId   === input.classId   &&
      e.goal      === input.goal,
  );

  const now = new Date().toISOString();
  let result: Evaluation;

  if (existingIndex !== -1) {
    result = {
      ...evaluations[existingIndex],
      concept: input.concept,
      updatedAt: now,
    };
    const updated = evaluations.map((e, i) => (i === existingIndex ? result : e));
    await writeData<Evaluation>(FILES.EVALUATIONS, updated);
  } else {
    result = {
      id: uuidv4(),
      studentId: input.studentId,
      classId: input.classId,
      goal: input.goal,
      concept: input.concept,
      updatedAt: now,
    };
    await writeData<Evaluation>(FILES.EVALUATIONS, [...evaluations, result]);
  }

  return result;
};

/**
 * Returns all evaluations for a given classId.
 *
 * Used by classService.getClassById to populate the ClassDetail response
 * without coupling classService to evaluations.json directly.
 *
 * @param classId - UUID of the class whose evaluations to retrieve.
 * @returns Matching Evaluation records, or [] if none exist.
 * @throws Error (infrastructure) if the read from evaluations.json fails.
 */
export const getEvaluationsByClassId = async (
  classId: string,
): Promise<Evaluation[]> => {
  const evaluations = await readData<Evaluation>(FILES.EVALUATIONS);
  return evaluations.filter((e) => e.classId === classId);
};

/**
 * Produces a global summary: for each student, their most recent evaluation
 * concept per goal across all classes.
 *
 * When a student has been evaluated for the same goal in multiple classes,
 * the evaluation with the highest updatedAt string wins — ISO 8601 strings
 * sort lexicographically in the same order as their UTC timestamps.
 *
 * @returns Array of EvaluationSummaryRow sorted alphabetically by student name.
 *          Returns [] if no students exist.
 * @throws Error (infrastructure) if any file read fails.
 */
export const getEvaluationSummary = async (): Promise<EvaluationSummaryRow[]> => {
  const [students, classes, evaluations] = await Promise.all([
    readData<Student>(FILES.STUDENTS),
    readData<Class>(FILES.CLASSES),
    readData<Evaluation>(FILES.EVALUATIONS),
  ]);

  const classMap = new Map(classes.map((c) => [c.id, c]));

  const rows: EvaluationSummaryRow[] = students.map((student) => {
    const studentEvals = evaluations.filter((e) => e.studentId === student.id);

    const goals: EvaluationSummaryRow['goals'] = {};

    for (const ev of studentEvals) {
      const existing = goals[ev.goal];
      if (!existing || ev.updatedAt > existing.updatedAt) {
        const cls = classMap.get(ev.classId);
        goals[ev.goal] = {
          concept: ev.concept,
          updatedAt: ev.updatedAt,
          classId: ev.classId,
          className: cls?.topic ?? ev.classId,
        };
      }
    }

    return {
      studentId: student.id,
      studentName: student.name,
      goals,
    };
  });

  return rows.sort((a, b) => a.studentName.localeCompare(b.studentName));
};
