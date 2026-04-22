/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {

      // ─── Colors ────────────────────────────────────────────────────────────

      colors: {
        /**
         * Primary — indigo-blue.
         * Used for main CTAs, active nav items, links, focus rings.
         * Derived from the interactive blue-indigo seen on quiz answer
         * borders and highlighted states in the reference images.
         */
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },

        /**
         * Neutral — warm stone scale.
         * Used for text, borders, backgrounds, dividers.
         * Warm undertone matches the cream card backgrounds seen in the
         * course catalog and featured-path reference screens.
         */
        neutral: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },

        /**
         * Concept — evaluation outcome colours.
         * Each concept has three sub-tokens: bg (badge background),
         * text (badge foreground), border (badge outline / cell border).
         *
         * Rules from CLAUDE.md Section 8 — Badge color mapping:
         *   MANA  → Red    (danger)  — Goal Not Yet Achieved
         *   MPA   → Yellow (warning) — Goal Partially Achieved
         *   MA    → Green  (success) — Goal Achieved
         *   empty → Gray   (neutral) — Not yet evaluated
         */
        concept: {
          mana: {
            bg:     '#fef2f2',
            text:   '#dc2626',
            border: '#fca5a5',
          },
          mpa: {
            bg:     '#fffbeb',
            text:   '#92400e',
            border: '#fcd34d',
          },
          ma: {
            bg:     '#f0fdf4',
            text:   '#15803d',
            border: '#86efac',
          },
          empty: {
            bg:     '#f9fafb',
            text:   '#6b7280',
            border: '#d1d5db',
          },
        },

        /**
         * Functional — single-shade semantic colours.
         * Used for inline feedback messages (not for badges — use concept.*
         * for evaluation-specific colours).
         */
        functional: {
          success: '#16a34a',
          warning: '#d97706',
          danger:  '#dc2626',
        },
      },

      // ─── Typography ────────────────────────────────────────────────────────

      fontFamily: {
        /**
         * sans — body text and all UI elements (inputs, tables, labels).
         * Inter: the most legible humanist sans-serif for data-heavy UIs.
         */
        sans: ['Inter', 'system-ui', 'sans-serif'],

        /**
         * display — page titles, card headings, section headers.
         * Plus Jakarta Sans: geometric, bold character width, closely
         * matches the bold heading style seen in the reference course cards.
         */
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem',     { lineHeight: '1.5rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':['1.5rem',   { lineHeight: '2rem' }],
        '3xl':['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':['2.25rem',  { lineHeight: '2.5rem' }],
      },

      fontWeight: {
        normal:   '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
      },

      // ─── Spacing ───────────────────────────────────────────────────────────

      spacing: {
        /** Left navigation sidebar width */
        sidebar: '16rem',
        /** Table row height for the evaluation matrix */
        'row-h':  '3rem',
      },

      // ─── Border radius ─────────────────────────────────────────────────────

      /**
       * Moderate rounding — matches the card and button corners seen in
       * the course catalog and featured-path reference screens.
       * Buttons use md (6 px). Cards use lg (8 px). Badges use full.
       */
      borderRadius: {
        sm:   '4px',
        md:   '6px',
        lg:   '8px',
        xl:   '12px',
        full: '9999px',
      },

      // ─── Shadows ───────────────────────────────────────────────────────────

      boxShadow: {
        /** Subtle two-layer shadow for Card containers */
        card:  '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',

        /** Stronger shadow for Modal overlays */
        modal: '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

        /** Focus ring using primary-500 at 40 % opacity */
        focus: '0 0 0 3px rgb(99 102 241 / 0.4)',
      },

    },
  },

  plugins: [],
}

// ─── CONCEPT COLOR REFERENCE ──────────────────────────────────────────────────
// MANA (Not Achieved)      → concept.mana.*   bg / text / border
// MPA  (Partially Achieved)→ concept.mpa.*    bg / text / border
// MA   (Achieved)          → concept.ma.*     bg / text / border
// Empty (Not Evaluated)    → concept.empty.*  bg / text / border
