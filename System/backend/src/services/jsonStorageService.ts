import path from 'path';
import fs from 'fs-extra';

// ─── File name constants ──────────────────────────────────────────────────────

/**
 * Canonical filenames for all JSON persistence files.
 * Every domain service must reference these constants — never hardcode filenames.
 */
export const FILES = {
  STUDENTS:    'students.json',
  CLASSES:     'classes.json',
  EVALUATIONS: 'evaluations.json',
} as const;

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Resolves DATA_DIR from env and returns an absolute path.
 * Supports both absolute and relative values for DATA_DIR.
 * Throws immediately if the variable is not set — callers handle the error
 * according to their own contract (read swallows, write rethrows).
 */
const dataDir = (): string => {
  const dir = process.env.DATA_DIR;
  if (!dir) throw new Error('DATA_DIR environment variable is not set');
  return path.resolve(dir);
};

const filePath = (filename: string): string => path.join(dataDir(), filename);

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Reads all records from a JSON file and returns them as a typed array.
 *
 * On any failure (missing file, malformed JSON, missing DATA_DIR) logs the
 * error and returns an empty array — the caller always gets a valid array.
 * Never throws.
 */
export const readData = async <T>(filename: string): Promise<T[]> => {
  try {
    const data = await fs.readJson(filePath(filename));
    return data as T[];
  } catch (error) {
    console.error(`[jsonStorageService] Failed to read "${filename}":`, error);
    return [];
  }
};

/**
 * Overwrites a JSON file with the full provided array (full-file write).
 *
 * On failure rethrows so the calling controller can return HTTP 500.
 * Never silently swallows write errors — a silent failure here would
 * corrupt application state.
 */
export const writeData = async <T>(filename: string, data: T[]): Promise<void> => {
  try {
    await fs.writeJson(filePath(filename), data, { spaces: 2 });
  } catch (error) {
    throw new Error(
      `[jsonStorageService] Failed to write "${filename}": ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Ensures the data directory exists and initialises any missing JSON files
 * with an empty array. Must be called once at server startup before any
 * request handler runs.
 *
 * Throws if DATA_DIR is not set or if the directory cannot be created —
 * the server should not start in either of those conditions.
 */
export const initializeStorage = async (): Promise<void> => {
  const dir = dataDir();
  await fs.ensureDir(dir);

  for (const filename of Object.values(FILES)) {
    const fp = path.join(dir, filename);
    const exists = await fs.pathExists(fp);
    if (!exists) {
      await fs.writeJson(fp, [], { spaces: 2 });
    }
  }
};
