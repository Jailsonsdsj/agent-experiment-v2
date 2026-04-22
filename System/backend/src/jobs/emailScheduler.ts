/**
 * Daily email batch job — runs at 23:00 UTC every day.
 *
 * Date filtering is UTC-based: an evaluation's updatedAt date is extracted
 * as a YYYY-MM-DD UTC string and compared to today's UTC date. Evaluations
 * saved after 00:00 UTC are attributed to the next calendar day and will
 * appear in the following night's batch. This affects users in negative UTC
 * offset timezones who update evaluations late at night local time.
 */

import * as cron from 'node-cron';
import { readData, FILES } from '../services/jsonStorageService';
import { sendEvaluationSummary } from '../services/emailService';
import type { Evaluation, Student, Class, EvaluationUpdate } from '../types/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDatePart = (iso: string): string => iso.split('T')[0];

// ─── Core job ─────────────────────────────────────────────────────────────────

/**
 * Runs the email batch job immediately.
 * Exported so it can be triggered in tests and manual runs
 * without waiting for the 23:00 cron tick.
 */
export const runEmailJobNow = async (): Promise<void> => {
  console.log(`[emailScheduler] Job started at ${new Date().toISOString()}`);

  // Step 1: Read all three files in parallel
  const [allEvaluations, allStudents, allClasses] = await Promise.all([
    readData<Evaluation>(FILES.EVALUATIONS),
    readData<Student>(FILES.STUDENTS),
    readData<Class>(FILES.CLASSES),
  ]);

  // Step 2: Filter evaluations updated today (UTC date comparison)
  const todayStr = getDatePart(new Date().toISOString());
  const todaysEvaluations = allEvaluations.filter(
    (e) => getDatePart(e.updatedAt) === todayStr,
  );

  console.log(
    `[emailScheduler] Found ${todaysEvaluations.length} evaluation(s) updated today (${todayStr})`,
  );

  if (todaysEvaluations.length === 0) {
    console.log('[emailScheduler] No updates today. Job complete.');
    return;
  }

  // Step 3: Group evaluations by studentId
  const byStudent = new Map<string, Evaluation[]>();
  for (const ev of todaysEvaluations) {
    const existing = byStudent.get(ev.studentId) ?? [];
    byStudent.set(ev.studentId, [...existing, ev]);
  }

  // Step 4: Build class lookup map for O(1) topic resolution
  const classMap = new Map(allClasses.map((c) => [c.id, c]));

  // Step 5: Send one email per student — sequential to respect Gmail rate limits
  let sent = 0;
  let failed = 0;

  for (const [studentId, evaluations] of byStudent) {
    const student = allStudents.find((s) => s.id === studentId);

    if (!student) {
      console.error(
        `[emailScheduler] Student ${studentId} not found — skipping`,
      );
      failed++;
      continue;
    }

    const updates: EvaluationUpdate[] = evaluations.map((ev) => {
      const cls = classMap.get(ev.classId);
      return {
        className: cls?.topic ?? `Class ${ev.classId}`,
        goal: ev.goal,
        concept: ev.concept,
      };
    });

    try {
      await sendEvaluationSummary(student, updates);
      sent++;
      console.log(
        `[emailScheduler] Email sent to ${student.email} (${student.name})`,
      );
    } catch (error) {
      failed++;
      console.error(
        `[emailScheduler] Failed to send to ${student.email}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  // Step 6: Final summary
  console.log(`[emailScheduler] Job complete. Sent: ${sent}, Failed: ${failed}`);
};

// ─── Scheduler registration ───────────────────────────────────────────────────

/**
 * Registers the daily cron job. Must be called after app.listen so the
 * startup sequence is consistent and the server is confirmed running first.
 */
export const startEmailScheduler = (): void => {
  cron.schedule('0 23 * * *', () => {
    runEmailJobNow().catch((error) => {
      console.error(
        '[emailScheduler] Unhandled job error:',
        error instanceof Error ? error.message : error,
      );
    });
  });
  console.log('[emailScheduler] Scheduled — will run daily at 23:00 UTC');
};
