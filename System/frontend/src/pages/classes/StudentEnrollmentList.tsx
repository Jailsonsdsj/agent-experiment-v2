import React from 'react';
import type { Student } from '../../types/index';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentEnrollmentListProps {
  students: Student[];
  selectedIds: string[];
  onToggle: (studentId: string) => void;
  isLoading: boolean;
  error: string | null;
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

const SkeletonRows = (): JSX.Element => (
  <div className="flex flex-col gap-2 p-2">
    <div className="h-10 bg-neutral-200 rounded animate-pulse" />
    <div className="h-10 bg-neutral-200 rounded animate-pulse" />
    <div className="h-10 bg-neutral-200 rounded animate-pulse" />
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const StudentEnrollmentList = ({
  students,
  selectedIds,
  onToggle,
  isLoading,
  error,
}: StudentEnrollmentListProps): JSX.Element => {
  if (isLoading) {
    return <SkeletonRows />;
  }

  if (error) {
    return (
      <div className="text-functional-danger text-sm p-3 bg-functional-danger/10 rounded-md border border-functional-danger">
        {error}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <>
        <div className="text-neutral-500 text-sm text-center py-6">
          No students registered yet. You can enroll students after creating
          the class.
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          {selectedIds.length} student(s) selected
        </p>
      </>
    );
  }

  return (
    <>
      <div className="max-h-64 overflow-y-auto rounded-md border border-neutral-200">
        {students.map((student) => {
          const isSelected = selectedIds.includes(student.id);

          return (
            <div
              key={student.id}
              onClick={() => onToggle(student.id)}
              className={[
                'flex items-center gap-3 px-4 py-3 cursor-pointer',
                'border-b border-neutral-100 last:border-b-0',
                'transition-colors duration-100',
                isSelected
                  ? 'bg-primary-50 hover:bg-primary-100'
                  : 'bg-white hover:bg-neutral-50',
              ].join(' ')}
            >
              {/* Checkbox visual */}
              <div
                className={[
                  'w-5 h-5 rounded border-2 flex items-center',
                  'justify-center flex-shrink-0 transition-colors',
                  isSelected
                    ? 'bg-primary-600 border-primary-600'
                    : 'border-neutral-300 bg-white',
                ].join(' ')}
              >
                {isSelected && (
                  <svg
                    viewBox="0 0 12 10"
                    className="w-3 h-3 text-white fill-none stroke-current stroke-2"
                  >
                    <polyline points="1,5 4,8 11,1" />
                  </svg>
                )}
              </div>

              {/* Student info */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-neutral-800 truncate">
                  {student.name}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {student.cpf}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-neutral-500 mt-2">
        {selectedIds.length} student(s) selected
      </p>
    </>
  );
};
