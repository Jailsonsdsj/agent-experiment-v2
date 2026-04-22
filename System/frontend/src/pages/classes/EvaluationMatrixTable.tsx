import { useState, useCallback, type JSX } from 'react';
import { patchEvaluation } from '../../services/apiService';
import { Badge } from '../../components/index';
import type { Student, Evaluation, EvaluationConcept, Goal } from '../../types/index';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CellState {
  concept: EvaluationConcept | 'empty';
  isSaving: boolean;
  error: string | null;
}

type MatrixState = Record<string, Partial<Record<Goal, CellState>>>;

interface EvaluationMatrixTableProps {
  classId: string;
  students: Student[];
  evaluations: Evaluation[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOALS: Goal[] = [
  'Requirements',
  'Tests',
  'Implementation',
  'Design',
  'Process',
];

const CONCEPT_OPTIONS: Array<{ value: EvaluationConcept | 'empty'; label: string }> = [
  { value: 'empty', label: '— Not evaluated' },
  { value: 'MANA',  label: 'MANA – Not Achieved' },
  { value: 'MPA',   label: 'MPA – Partially Achieved' },
  { value: 'MA',    label: 'MA – Achieved' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMatrixState(
  students: Student[],
  evaluations: Evaluation[],
): MatrixState {
  const evalMap = new Map<string, EvaluationConcept>();
  for (const ev of evaluations) {
    evalMap.set(`${ev.studentId}:${ev.goal}`, ev.concept);
  }

  const matrix: MatrixState = {};
  for (const student of students) {
    matrix[student.id] = {};
    for (const goal of GOALS) {
      const concept = evalMap.get(`${student.id}:${goal}`) ?? 'empty';
      (matrix[student.id] as Record<Goal, CellState>)[goal] = {
        concept,
        isSaving: false,
        error: null,
      };
    }
  }
  return matrix;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const EvaluationMatrixTable = ({
  classId,
  students,
  evaluations,
}: EvaluationMatrixTableProps): JSX.Element => {
  const [matrixState, setMatrixState] = useState<MatrixState>(() =>
    buildMatrixState(students, evaluations),
  );

  const handleCellChange = useCallback(
    async (
      studentId: string,
      goal: Goal,
      newConcept: EvaluationConcept | 'empty',
    ): Promise<void> => {
      const previousConcept =
        matrixState[studentId]?.[goal]?.concept ?? 'empty';

      // Selecting 'empty' is a local-only operation — the backend has no
      // delete endpoint for evaluations, and 'empty' is not a valid concept.
      if (newConcept === 'empty') {
        setMatrixState((prev) => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [goal]: { concept: 'empty', isSaving: false, error: null },
          },
        }));
        return;
      }

      setMatrixState((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [goal]: { concept: newConcept, isSaving: true, error: null },
        },
      }));

      try {
        await patchEvaluation({ studentId, classId, goal, concept: newConcept });

        setMatrixState((prev) => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [goal]: { concept: newConcept, isSaving: false, error: null },
          },
        }));
      } catch {
        setMatrixState((prev) => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [goal]: {
              concept: previousConcept,
              isSaving: false,
              error: 'Failed to save',
            },
          },
        }));
      }
    },
    [classId, matrixState],
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-neutral-100">
            <th className="text-left px-4 py-3 text-neutral-600 font-semibold text-xs uppercase tracking-wide w-48 border-b border-neutral-200">
              Student
            </th>
            {GOALS.map((goal) => (
              <th
                key={goal}
                className="text-center px-3 py-3 text-neutral-600 font-semibold text-xs uppercase tracking-wide border-b border-neutral-200"
              >
                {goal}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {students.length === 0 ? (
            <tr>
              <td
                colSpan={GOALS.length + 1}
                className="text-center py-12 text-neutral-500 text-sm"
              >
                No students enrolled in this class.
              </td>
            </tr>
          ) : (
            students.map((student, idx) => (
              <tr
                key={student.id}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}
              >
                <td className="px-4 py-3 font-medium text-neutral-800 border-b border-neutral-100">
                  <div>{student.name}</div>
                  <div className="text-xs text-neutral-400 font-mono">
                    {student.cpf}
                  </div>
                </td>

                {GOALS.map((goal) => {
                  const cell = matrixState[student.id]?.[goal];
                  const concept = cell?.concept ?? 'empty';
                  const isSaving = cell?.isSaving ?? false;
                  const cellError = cell?.error ?? null;

                  return (
                    <td
                      key={goal}
                      className="px-3 py-2 text-center border-b border-neutral-100 align-middle"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <select
                          value={concept}
                          disabled={isSaving}
                          onChange={(e) =>
                            handleCellChange(
                              student.id,
                              goal,
                              e.target.value as EvaluationConcept | 'empty',
                            )
                          }
                          className={[
                            'text-xs rounded border px-1 py-0.5 w-full max-w-[140px]',
                            'bg-white cursor-pointer focus:outline-none',
                            'focus:ring-2 focus:ring-primary-500',
                            isSaving
                              ? 'opacity-50 cursor-wait'
                              : 'border-neutral-300',
                          ].join(' ')}
                        >
                          {CONCEPT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        <Badge concept={concept} size="sm" />

                        {cellError && (
                          <span className="text-xs text-functional-danger mt-0.5">
                            {cellError}
                          </span>
                        )}

                        {isSaving && (
                          <span className="text-xs text-neutral-400 animate-pulse">
                            saving…
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
