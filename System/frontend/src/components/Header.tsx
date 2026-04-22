import React from 'react';
import { NavLink } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeaderProps {
  appName?: string;
}

// ─── Nav link class constants ─────────────────────────────────────────────────

const defaultClass =
  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-primary-100 hover:bg-primary-600 hover:text-white transition-colors duration-150';

const activeClass =
  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-primary-600 border-b-2 border-white';

const navClass = ({ isActive }: { isActive: boolean }): string =>
  isActive ? activeClass : defaultClass;

// ─── Icons ────────────────────────────────────────────────────────────────────

const StudentsIcon = (): JSX.Element => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 9a7 7 0 1 1 14 0H3Z" />
  </svg>
);

const ClassesIcon = (): JSX.Element => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M9 4.804A7.968 7.968 0 0 0 5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0 1 5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0 1 15 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 15 4a7.968 7.968 0 0 0-4 1.08V4.804A9.955 9.955 0 0 1 15 4c1.17 0 2.294.202 3.337.57A.75.75 0 0 1 19 5.25v10.5a.75.75 0 0 1-.963.721A8.464 8.464 0 0 0 15 16a8.464 8.464 0 0 0-4.5 1.3A8.464 8.464 0 0 0 6 16a8.464 8.464 0 0 0-3.037.471A.75.75 0 0 1 2 15.75V5.25a.75.75 0 0 1 .663-.742A9.956 9.956 0 0 1 5 4c1.17 0 2.294.202 3.337.57V4.804H9Z" />
  </svg>
);

const EvaluationsIcon = (): JSX.Element => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M6 2a1 1 0 0 0-1 1v1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a1 1 0 1 0-2 0v1H7V3a1 1 0 0 0-1-1Zm0 5a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2H6Z"
      clipRule="evenodd"
    />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const Header = ({ appName = 'EduEval' }: HeaderProps): JSX.Element => (
  <header className="w-full bg-primary-700 shadow-card">
    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

      {/* App name / home link */}
      <NavLink
        to="/"
        className="font-display font-bold text-xl text-white"
      >
        {appName}
      </NavLink>

      {/* Section navigation */}
      <nav aria-label="Main navigation">
        <ul className="flex items-center gap-1">
          <li>
            <NavLink to="/students" className={navClass}>
              <StudentsIcon />
              <span className="hidden md:inline">Students</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/classes" className={navClass}>
              <ClassesIcon />
              <span className="hidden md:inline">Classes</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/evaluations" className={navClass}>
              <EvaluationsIcon />
              <span className="hidden md:inline">Evaluations</span>
            </NavLink>
          </li>
        </ul>
      </nav>

    </div>
  </header>
);
