import { setWorldConstructor, World } from '@cucumber/cucumber';
import type { IWorldOptions } from '@cucumber/cucumber';

export class EduEvalWorld extends World {
  lastResponse?: unknown;
  lastError?: Error | null;

  constructor(options: IWorldOptions) {
    super(options);
    this.lastResponse = undefined;
    this.lastError = null;
  }
}

setWorldConstructor(EduEvalWorld);
