import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { Student, EvaluationUpdate, EvaluationConcept } from '../types/index';

// ─── Startup guard ────────────────────────────────────────────────────────────

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.error(
    '[emailService] GMAIL_USER or GMAIL_APP_PASSWORD is not set. ' +
    'Email sending will fail.',
  );
}

// ─── Transporter ──────────────────────────────────────────────────────────────

const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CONCEPT_LABELS: Record<EvaluationConcept, string> = {
  MANA: 'Not Yet Achieved',
  MPA:  'Partially Achieved',
  MA:   'Achieved',
};

const CONCEPT_COLORS: Record<EvaluationConcept, string> = {
  MANA: '#dc2626',
  MPA:  '#d97706',
  MA:   '#16a34a',
};

// ─── Exported functions ───────────────────────────────────────────────────────

/**
 * Groups a flat list of evaluation updates by className.
 * Preserves insertion order within each group.
 */
export const groupUpdatesByClass = (
  updates: EvaluationUpdate[],
): Map<string, EvaluationUpdate[]> => {
  const grouped = new Map<string, EvaluationUpdate[]>();
  for (const update of updates) {
    const existing = grouped.get(update.className) ?? [];
    grouped.set(update.className, [...existing, update]);
  }
  return grouped;
};

/**
 * Builds a complete HTML email string for a student's evaluation updates.
 * Uses inline styles throughout for email client compatibility.
 */
export const buildEmailHtml = (
  student: Student,
  updates: EvaluationUpdate[],
): string => {
  const grouped = groupUpdatesByClass(updates);

  const classesHtml = [...grouped.entries()]
    .map(([className, classUpdates]) => {
      const rowsHtml = classUpdates
        .map(
          (update) => `
          <tr>
            <td style="padding: 6px 12px; border-bottom: 1px solid #f3f4f6; font-weight: 500;">
              ${update.goal}
            </td>
            <td style="padding: 6px 12px; border-bottom: 1px solid #f3f4f6; color: ${CONCEPT_COLORS[update.concept]};">
              ${CONCEPT_LABELS[update.concept]}
            </td>
          </tr>`,
        )
        .join('');

      return `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
            ${className}
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${rowsHtml}
          </table>
        </div>`;
    })
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #1d4ed8;">Evaluation Update</h2>
      <p>Dear ${student.name},</p>
      <p>The following evaluations have been updated for you today:</p>
      ${classesHtml}
      <p style="margin-top: 24px; color: #666; font-size: 12px;">
        This is an automated notification from the EduEval system.
      </p>
    </div>`;
};

/**
 * Sends a formatted HTML evaluation summary email to a single student.
 * Returns without sending if updates is empty.
 * If sendMail throws, logs the error and rethrows — the scheduler handles counting.
 */
export const sendEvaluationSummary = async (
  student: Student,
  updates: EvaluationUpdate[],
): Promise<void> => {
  if (updates.length === 0) return;

  const subject = `Evaluation Update — ${student.name}`;
  const html = buildEmailHtml(student, updates);

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: student.email,
      subject,
      html,
    });
  } catch (error) {
    console.error(
      `[emailService] Failed to send email to ${student.email}:`,
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
};

/**
 * Returns a Nodemailer JSON transport for use in tests.
 * Captures sent mail as JSON objects — no real emails sent.
 */
export const createTestTransport = (): Transporter =>
  nodemailer.createTransport({ jsonTransport: true });
