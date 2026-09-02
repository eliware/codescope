#!/usr/bin/env node
// codescope ignore: this pure executable barrel intentionally delegates process wiring to Node and focused main tests.

import { main } from '../src/cli.mjs';

const exitCode = await main(process.argv.slice(2));
process.exitCode = exitCode;
