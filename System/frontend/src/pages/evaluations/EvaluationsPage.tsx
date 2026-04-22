import { type JSX } from 'react';
import { useEvaluationSummary } from '../../hooks/useEvaluationSummary';
import { GOALS } from '../../utils/evaluationConstants';
import { Badge, PageHeader, Card, Button } from '../../components/index';
import type { Goal } from '../../types/index';

// ─── Component ────────────────────────────────────────────────────────────────

export const EvaluationsPage = (): JSX.Element => {
  const { summary, isLoading, error, reload } = useEvaluationSummary();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <PageHeader
        title="Evaluations"
        subtitle="Most recent concept per student per goal across all classes"
        action={
          <Button
            label="Refresh"
            variant="secondary"
            size="sm"
            onClick={reload}
            isLoading={isLoading}
          />
        }
      />

      {error && (
        <div
          role="alert"
          className="rounded-md bg-functional-danger/10 border border-functional-danger text-functional-danger text-sm px-4 py-3 mb-4"
        >
          {error}
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-neutral-200">
                <th className="text-left px-4 py-3 text-neutral-600 font-semibold text-xs uppercase tracking-wide w-52 sticky left-0 bg-neutral-100 z-10 border-r border-neutral-200">
                  Student
                </th>
                {GOALS.map((goal: Goal) => (
                  <th
                    key={goal}
                    className="text-center px-4 py-3 text-neutral-600 font-semibold text-xs uppercase tracking-wide min-w-[120px]"
                  >
                    {goal}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 sticky left-0 bg-white border-r border-neutral-200 border-b border-neutral-100">
                      <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
                    </td>
                    {GOALS.map((goal: Goal) => (
                      <td key={goal} className="px-4 py-3 text-center border-b border-neutral-100">
                        <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : summary.length === 0 ? (
                <tr>
                  <td
                    colSpan={GOALS.length + 1}
                    className="text-center py-16 text-neutral-500 text-sm"
                  >
                    No evaluation data found. Start by enrolling students in a class and recording evaluations.
                  </td>
                </tr>
              ) : (
                summary.map((row, idx) => {
                  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50';
                  return (
                    <tr key={row.studentId} className={rowBg}>
                      <td
                        className={`px-4 py-3 font-medium text-neutral-800 border-b border-neutral-100 sticky left-0 z-10 border-r border-neutral-200 ${rowBg}`}
                      >
                        {row.studentName}
                      </td>

                      {GOALS.map((goal: Goal) => {
                        const entry = row.goals[goal];
                        const concept = entry?.concept ?? 'empty';

                        return (
                          <td
                            key={goal}
                            className="px-4 py-3 text-center border-b border-neutral-100 align-middle"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <Badge concept={concept} size="sm" />

                              {entry && (
                                <div className="relative group">
                                  <span className="text-xs text-neutral-400 cursor-default underline decoration-dotted">
                                    {entry.className}
                                  </span>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-neutral-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-20">
                                    Updated: {new Date(entry.updatedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
