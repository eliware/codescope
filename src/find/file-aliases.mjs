import { findFiles } from './files.mjs';

export const findMjsFiles = (root, options) => findFiles(root, '.mjs', options);
export const findMdFiles = (root, options) => findFiles(root, '.md', options);
export const findAllFiles = (root, options) => findFiles(root, '', options);
