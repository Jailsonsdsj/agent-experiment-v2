import { v4 as uuidv4 } from 'uuid';
import { readData, writeData, FILES } from './jsonStorageService';
import { DomainError } from './studentService';
import type { Evaluation, EvaluationConcept, Goal, Class, Student } from '../types/index';

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
 * Creates or updates a single evaluation entry for a (studentId, classId, goal) triple.
 *
 * If an evaluation already exists for that triple, updates its concept and
 * sets updatedAt to now. Otherwise creates a new record with a new UUID.
 *
 * @throws DomainError('INVALID_REFERENCE') if studentId or classId are not found.
 * @throws DomainError('INVALID_REFERENCE') if the student is not enrolled in the class.
 * @throws Error with a descriptive message if concept or goal are invalid.
 */
export const patchEvaluation = async (payload: {
  studentId: string;
  classId: string;
  goal: Goal;
  concept: EvaluationConcept;
}): Promise<Evaluation> => {
  const { studentId, classId, goal, concept } = payload;

  if (!VALID_CONCEPTS.has(concept)) {
    throw new Error(
      `Invalid concept "${concept}". Must be one of: ${[...VALID_CONCEPTS].join(', ')}.`,
    );
  }

  if (!VALID_GOALS.has(goal)) {
    throw new Error(
      `Invalid goal "${goal}". Must be one of: ${[...VALID_GOALS].join(', ')}.`,
    );
  }

  const [students, classes, evaluations] = await Promise.all([
    readData<Student>(FILES.STUDENTS),
    readData<Class>(FILES.CLASSES),
    readData<Evaluation>(FILES.EVALUATIONS),
  ]);

  const studentExists = students.some((s) => s.id === studentId);
  if (!studentExists) {
    throw new DomainError('INVALID_REFERENCE', `Student with id "${studentId}" was not found.`);
  }

  const foundClass = classes.find((c) => c.id === classId);
  if (!foundClass) {
    throw new DomainError('INVALID_REFERENCE', `Class with id "${classId}" was not found.`);
  }

  if (!foundClass.studentIds.includes(studentId)) {
    throw new DomainError(
      'INVALID_REFERENCE',
      `Student "${studentId}" is not enrolled in class "${classId}".`,
    );
  }

  const now = new Date().toISOString();
  const existingIndex = evaluations.findIndex(
    (e) => e.studentId === studentId && e.classId === classId && e.goal === goal,
  );

  let result: Evaluation;

  if (existingIndex !== -1) {
    result = { ...evaluations[existingIndex], concept, updatedAt: now };
    const updated = evaluations.map((e, i) => (i === existingIndex ? result : e));
    await writeData<Evaluation>(FILES.EVALUATIONS, updated);
  } else {
    result = { id: uuidv4(), studentId, classId, goal, concept, updatedAt: now };
    await writeData<Evaluation>(FILES.EVALUATIONS, [...evaluations, result]);
  }

  return result;
};
