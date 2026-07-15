import type { Data } from '../types/data';
import { deriveData } from './profile/derive';

export type { Data };
export * from '../types/data';

// Legacy entry point — pages and the /ask grounding import getData() from
// here. The content now lives in ./profile/profile.ts (single source of
// truth); this module only derives the historical `Data` shape from it.
export const getData = (locale: string | undefined): Data => deriveData(locale);
