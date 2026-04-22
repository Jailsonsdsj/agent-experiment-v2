import { v4 as uuidv4 } from 'uuid';
import { readData, writeData, FILES } from './jsonStorageService';
import { DomainError } from './studentService';
import type { Class, ClassDetail, Student, Evaluation, CreateInput } from '../types/index';

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Validates that every id in candidateIds exists in the provided students array.
 * Collects ALL invalid ids before throwing so the caller receives a complete list.
 *
 * @throws DomainError('INVALID_REFERENCE') if any id is not found.
 */
const assertStudentsExist = (
  candidateIds: string[],
  students: Student[],
): void => {
  const studentIdSet = new Set(students.map((s) => s.id));
  const invalidIds = candidateIds.filter((id) => !studentIdSet.has(id));

  if (invalidIds.length > 0) {
    throw new DomainError(
      'INVALID_REFERENCE',
      `The following student ids were not found: ${invalidIds.join(', ')}`,
    );
  }
};

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Returns all classes currently stored in classes.json.
 *
 * @returns An array of Class objects, or [] if the file is empty or missing.
 *          Never throws for an empty result.
 */
export const getClasses = async (): Promise<Class[]> => {
  return readData<Class>(FILES.CLASSES);
};

/**
 * Finds a class by id and returns it enriched with resolved students and
 * its associated evaluations.
 *
 * Reads classes.json, students.json, and evaluations.json in parallel.
 * studentIds are resolved to full Student objects; only evaluations where
 * classId matches are included.
 *
 * @param id - UUID of the class to retrieve.
 * @returns A ClassDetail object.
 * @throws DomainError('NOT_FOUND') if no class with that id exists.
 */
export const getClassById = async (id: string): Promise<ClassDetail> => {
  const [classes, students, evaluations] = await Promise.all([
    readData<Class>(FILES.CLASSES),
    readData<Student>(FILES.STUDENTS),
    readData<Evaluation>(FILES.EVALUATIONS),
  ]);

  const foundClass = classes.find((c) => c.id === id);
  if (!foundClass) {
    throw new DomainError('NOT_FOUND', `Class with id "${id}" was not found.`);
  }

  const enrolledStudentIds = new Set(foundClass.studentIds);
  const resolvedStudents = students.filter((s) => enrolledStudentIds.has(s.id));
  const classEvaluations = evaluations.filter((e) => e.classId === id);

  return {
    ...foundClass,
    students: resolvedStudents,
    evaluations: classEvaluations,
  };
};

/**
 * Creates a new class and persists it to classes.json.
 *
 * Validates that all ids in input.studentIds reference existing students.
 * Silently deduplicates studentIds before saving.
 * Generates a new UUID v4 for the id field.
 *
 * @param input - Class payload without id (topic, year, semester, studentIds).
 * @returns The newly created Class object including its generated id.
 * @throws DomainError('INVALID_REFERENCE') if any studentId does not exist.
 * @throws Error (infrastructure) if the write to classes.json fails.
 */
export const saveClass = async (input: CreateInput<Class>): Promise<Class> => {
  const [classes, students] = await Promise.all([
    readData<Class>(FILES.CLASSES),
    readData<Student>(FILES.STUDENTS),
  ]);

  const deduped = [...new Set(input.studentIds)];
  assertStudentsExist(deduped, students);

  const newClass: Class = {
    id: uuidv4(),
    topic: input.topic,
    year: input.year,
    semester: input.semester,
    studentIds: deduped,
  };

  await writeData<Class>(FILES.CLASSES, [...classes, newClass]);

  return newClass;
};

/**
 * Updates an existing class and persists the change to classes.json.
 *
 * Only fields present in input are merged; omitted fields retain their
 * current values. If studentIds is provided, all ids are validated against
 * students.json and then deduplicated before saving.
 *
 * @param id    - UUID of the class to update.
 * @param input - Partial payload of fields to change.
 * @returns The updated Class object.
 * @throws DomainError('NOT_FOUND')          if no class with that id exists.
 * @throws DomainError('INVALID_REFERENCE')  if any provided studentId does not exist.
 * @throws Error (infrastructure)            if the write to classes.json fails.
 */
export const updateClass = async (
  id: string,
  input: Partial<CreateInput<Class>>,
): Promise<Class> => {
  const [classes, students] = await Promise.all([
    readData<Class>(FILES.CLASSES),
    readData<Student>(FILES.STUDENTS),
  ]);

  const index = classes.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new DomainError('NOT_FOUND', `Class with id "${id}" was not found.`);
  }

  const existing = classes[index];

  let resolvedStudentIds: string[] = existing.studentIds;
  if (input.studentIds !== undefined) {
    const deduped = [...new Set(input.studentIds)];
    assertStudentsExist(deduped, students);
    resolvedStudentIds = deduped;
  }

  const updated: Class = {
    ...existing,
    ...input,
    studentIds: resolvedStudentIds,
  };

  const updatedClasses = classes.map((c) => (c.id === id ? updated : c));
  await writeData<Class>(FILES.CLASSES, updatedClasses);

  return updated;
};

/**
 * Deletes a class by id and cascades the deletion to all associated
 * evaluations in evaluations.json.
 *
 * Write order: classes.json is written first. If the evaluations write
 * subsequently fails, orphaned evaluation rows remain but the class is
 * gone — the safer failure mode versus losing evaluation history for a
 * class that still exists.
 *
 * @param id - UUID of the class to delete.
 * @returns void on success.
 * @throws DomainError('NOT_FOUND') if no class with that id exists.
 * @throws Error (infrastructure)   if any file read/write fails.
 */
export const deleteClass = async (id: string): Promise<void> => {
  const [classes, evaluations] = await Promise.all([
    readData<Class>(FILES.CLASSES),
    readData<Evaluation>(FILES.EVALUATIONS),
  ]);

  const classExists = classes.some((c) => c.id === id);
  if (!classExists) {
    throw new DomainError('NOT_FOUND', `Class with id "${id}" was not found.`);
  }

  const remainingClasses = classes.filter((c) => c.id !== id);
  await writeData<Class>(FILES.CLASSES, remainingClasses);

  const remainingEvaluations = evaluations.filter((e) => e.classId !== id);
  await writeData<Evaluation>(FILES.EVALUATIONS, remainingEvaluations);
};

/**
 * Returns all classes in which the given studentId appears in studentIds.
 *
 * Used by studentService.deleteStudent to check enrollment before allowing
 * deletion — exported so studentService can delegate this read rather than
 * accessing classes.json directly.
 *
 * @param studentId - UUID of the student to look up.
 * @returns Array of Class objects the student is enrolled in, or [].
 */
export const getClassesByStudentId = async (
  studentId: string,
): Promise<Class[]> => {
  const classes = await readData<Class>(FILES.CLASSES);
  return classes.filter((c) => c.studentIds.includes(studentId));
};
