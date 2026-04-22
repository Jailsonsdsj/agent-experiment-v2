import { v4 as uuidv4 } from 'uuid';
import { readData, writeData, FILES } from './jsonStorageService';
import type { Student, Class, Evaluation, CreateInput } from '../types/index';

// ─── Error taxonomy ───────────────────────────────────────────────────────────

/**
 * Discriminated codes for every business rule violation this service can raise.
 * Controllers use these codes to select the correct HTTP status.
 *
 * NOT_FOUND        → 404
 * CPF_DUPLICATE    → 400
 * STUDENT_ENROLLED → 409
 * CONFLICT         → 409 (generic — reserved for future use)
 */
export type DomainErrorCode =
  | 'NOT_FOUND'
  | 'CPF_DUPLICATE'
  | 'STUDENT_ENROLLED'
  | 'INVALID_REFERENCE'
  | 'VALIDATION_ERROR'
  | 'CONFLICT';

/**
 * Thrown for every business rule violation (domain invariant failure).
 * Infrastructure errors (file I/O) propagate as plain Error and are
 * handled by the global error handler as HTTP 500 — they are never
 * wrapped in DomainError.
 *
 * Use `instanceof DomainError` at the controller layer to distinguish
 * domain failures from infrastructure failures.
 */
export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
    // Maintains correct prototype chain in transpiled ES5 environments.
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Returns all students currently stored in students.json.
 *
 * @returns An array of Student objects, or [] if the file is empty or
 *          missing. Never throws for an empty result.
 * @throws  Error (infrastructure) if the storage layer fails to write.
 */
export const getStudents = async (): Promise<Student[]> => {
  return readData<Student>(FILES.STUDENTS);
};

/**
 * Finds and returns a single student by their UUID.
 *
 * @param id - The UUID v4 of the student to retrieve.
 * @returns The matching Student object.
 * @throws  DomainError('NOT_FOUND') if no student with that id exists.
 */
export const getStudentById = async (id: string): Promise<Student> => {
  const students = await readData<Student>(FILES.STUDENTS);
  const student = students.find((s) => s.id === id);

  if (!student) {
    throw new DomainError('NOT_FOUND', `Student with id "${id}" not found.`);
  }

  return student;
};

/**
 * Creates a new student and persists them to students.json.
 *
 * Enforces CPF uniqueness across all existing students before writing.
 * Generates a new UUID v4 for the id field — the caller must not supply one.
 *
 * @param input - The student payload without id (name, cpf, email).
 * @returns The newly created Student object including its generated id.
 * @throws  DomainError('CPF_DUPLICATE') if any existing student shares the same CPF.
 * @throws  Error (infrastructure) if the write to students.json fails.
 */
export const saveStudent = async (
  input: CreateInput<Student>,
): Promise<Student> => {
  const students = await readData<Student>(FILES.STUDENTS);

  const hasDuplicateCpf = students.some((s) => s.cpf === input.cpf);
  if (hasDuplicateCpf) {
    throw new DomainError(
      'CPF_DUPLICATE',
      'A student with this CPF is already registered.',
    );
  }

  const newStudent: Student = {
    id: uuidv4(),
    name: input.name,
    cpf: input.cpf,
    email: input.email,
  };

  await writeData<Student>(FILES.STUDENTS, [...students, newStudent]);

  return newStudent;
};

/**
 * Updates an existing student's fields and persists the change.
 *
 * Only the fields present in `input` are merged; omitted fields retain
 * their current values. CPF uniqueness is re-validated, excluding the
 * student being updated from the duplicate check so that a self-update
 * that leaves the CPF unchanged is always accepted.
 *
 * @param id    - The UUID of the student to update.
 * @param input - A partial payload of fields to change (any subset of name, cpf, email).
 * @returns The updated Student object.
 * @throws  DomainError('NOT_FOUND')     if no student with that id exists.
 * @throws  DomainError('CPF_DUPLICATE') if another student already holds the new CPF.
 * @throws  Error (infrastructure)       if the write to students.json fails.
 */
export const updateStudent = async (
  id: string,
  input: Partial<CreateInput<Student>>,
): Promise<Student> => {
  const students = await readData<Student>(FILES.STUDENTS);

  const index = students.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new DomainError('NOT_FOUND', `Student with id "${id}" not found.`);
  }

  // CPF uniqueness: exclude the student being updated so a self-update
  // that preserves the same CPF is never rejected as a duplicate.
  if (input.cpf !== undefined) {
    const hasDuplicateCpf = students.some(
      (s) => s.cpf === input.cpf && s.id !== id,
    );
    if (hasDuplicateCpf) {
      throw new DomainError(
        'CPF_DUPLICATE',
        'A student with this CPF is already registered.',
      );
    }
  }

  const updatedStudent: Student = { ...students[index], ...input };

  const updatedStudents = students.map((s) =>
    s.id === id ? updatedStudent : s,
  );

  await writeData<Student>(FILES.STUDENTS, updatedStudents);

  return updatedStudent;
};

/**
 * Deletes a student by id, subject to enrollment safety checks.
 *
 * Reads both students.json and classes.json. Rejects the deletion if
 * the student is currently enrolled in any class (their id appears in
 * any class's studentIds array). This enforces referential integrity
 * without a database foreign-key constraint.
 *
 * Cascades to evaluations.json: all evaluation records belonging to the
 * deleted student are removed regardless of class enrollment history.
 * Write order: students.json first, then evaluations.json. If the
 * evaluations write fails after the students write succeeds, orphaned
 * evaluation rows remain (unreachable but recoverable). The reverse order
 * would silently destroy a still-existing student's evaluation history.
 *
 * @param id - The UUID of the student to delete.
 * @returns void on success.
 * @throws  DomainError('NOT_FOUND')        if no student with that id exists.
 * @throws  DomainError('STUDENT_ENROLLED') if the student is enrolled in any class.
 * @throws  Error (infrastructure)          if any file read/write fails.
 */
export const deleteStudent = async (id: string): Promise<void> => {
  const students = await readData<Student>(FILES.STUDENTS);

  const studentExists = students.some((s) => s.id === id);
  if (!studentExists) {
    throw new DomainError('NOT_FOUND', `Student with id "${id}" not found.`);
  }

  const classes = await readData<Class>(FILES.CLASSES);
  const isEnrolled = classes.some((cls) => cls.studentIds.includes(id));

  if (isEnrolled) {
    throw new DomainError(
      'STUDENT_ENROLLED',
      'Student is enrolled in one or more classes and cannot be deleted.',
    );
  }

  const updatedStudents = students.filter((s) => s.id !== id);
  await writeData<Student>(FILES.STUDENTS, updatedStudents);

  const allEvaluations = await readData<Evaluation>(FILES.EVALUATIONS);
  const remainingEvaluations = allEvaluations.filter(
    (e) => e.studentId !== id,
  );
  await writeData<Evaluation>(FILES.EVALUATIONS, remainingEvaluations);
};
