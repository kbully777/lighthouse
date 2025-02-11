#!/usr/bin/env node
/**
 * @license Copyright 2018 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint-disable no-console */


import fs from 'fs';
import path from 'path';

import {minifyTrace} from '../../lib/minify-trace.js';

if (process.argv.length !== 4) {
  console.error('Usage $0: <input file> <output file>');
  process.exit(1);
}

const inputTracePath = path.resolve(process.cwd(), process.argv[2]);
const outputTracePath = path.resolve(process.cwd(), process.argv[3]);
const inputTraceRaw = fs.readFileSync(inputTracePath, 'utf8');
/** @type {LH.Trace} */
let inputTrace = JSON.parse(inputTraceRaw);
if (Array.isArray(inputTrace)) inputTrace = {traceEvents: inputTrace};

const outputTrace = minifyTrace(inputTrace);
const output = `{
  "traceEvents": [
${outputTrace.traceEvents.map(e => '    ' + JSON.stringify(e)).join(',\n')}
  ]
}`;

/** @param {string} s */
const size = s => Math.round(s.length / 1024) + 'kb';
const eventDelta = inputTrace.traceEvents.length - outputTrace.traceEvents.length;
console.log(`Reduced trace from ${size(inputTraceRaw)} to ${size(output)}`);
console.log(`Filtered out ${eventDelta} trace events`);
fs.writeFileSync(outputTracePath, output);
