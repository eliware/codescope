#!/usr/bin/env node

import { main } from '../src/cli/main.mjs';

const exitCode = await main(process.argv.slice(2));
process.exitCode = exitCode;
