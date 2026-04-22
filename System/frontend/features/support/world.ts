import { setWorldConstructor, World } from '@cucumber/cucumber';
import type { IWorldOptions } from '@cucumber/cucumber';

export class EduEvalFrontendWorld extends World {
  lastApiResponse?: unknown;
  lastApiError?: Error | null;

  constructor(options: IWorldOptions) {
    super(options);
    this.lastApiResponse = undefined;
    this.lastApiError = null;
  }
}

setWorldConstructor(EduEvalFrontendWorld);
