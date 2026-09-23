import { combineFiles } from './files.mjs';

export const combineMjsFiles = (root, options) => combineFiles(root, '.mjs', options);
export const combineMdFiles = (root, options) => combineFiles(root, '.md', options);
export const combineCodeFiles = (root, options) => combineFiles(root, ['.js', '.mjs', '.cjs', '.ts'], options);
