import { p0P1Policy } from './p0-p1.mjs';
import { p2P3Policy } from './p2-p3.mjs';

export const priorityPolicy = [p0P1Policy, p2P3Policy].join('\n\n');
