/**
 * @license Copyright 2016 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import {strict as assert} from 'assert';

import FMPAudit from '../../../audits/metrics/first-meaningful-paint.js';
import Audit from '../../../audits/audit.js';
import constants from '../../../config/constants.js';
import trace from '../../fixtures/traces/progressive-app-m60.json';
import devtoolsLogs from '../../fixtures/traces/progressive-app-m60.devtools.log.json';
import {getURLArtifactFromDevtoolsLog} from '../../test-utils.js';

/**
 * @param {{
 * {LH.SharedFlagsSettings['formFactor']} formFactor
 * {LH.SharedFlagsSettings['throttlingMethod']} throttlingMethod
 * }} param0
 */
const getFakeContext = ({formFactor, throttlingMethod}) => ({
  options: FMPAudit.defaultOptions,
  computedCache: new Map(),
  settings: {
    formFactor: formFactor,
    throttlingMethod,
    screenEmulation: constants.screenEmulationMetrics[formFactor],
  },
});
describe('Performance: first-meaningful-paint audit', () => {
  it('computes FMP correctly for valid trace', async () => {
    const artifacts = {
      GatherContext: {gatherMode: 'navigation'},
      traces: {[Audit.DEFAULT_PASS]: trace},
      devtoolsLogs: {[Audit.DEFAULT_PASS]: devtoolsLogs},
      URL: getURLArtifactFromDevtoolsLog(devtoolsLogs),
    };
    const context = getFakeContext({formFactor: 'mobile', throttlingMethod: 'provided'});
    const fmpResult = await FMPAudit.audit(artifacts, context);

    assert.equal(fmpResult.score, 1);
    assert.equal(fmpResult.numericValue, 783.328);
    expect(fmpResult.displayValue).toBeDisplayString('0.8\xa0s');
  });

  it('computes FMP correctly for simulated', async () => {
    const artifacts = {
      GatherContext: {gatherMode: 'navigation'},
      traces: {[Audit.DEFAULT_PASS]: trace},
      devtoolsLogs: {[Audit.DEFAULT_PASS]: devtoolsLogs},
      URL: getURLArtifactFromDevtoolsLog(devtoolsLogs),
    };
    const context = getFakeContext({formFactor: 'mobile', throttlingMethod: 'simulate'});
    const fmpResult = await FMPAudit.audit(artifacts, context);

    expect({
      score: fmpResult.score,
      numericValue: fmpResult.numericValue,
    }).toMatchSnapshot();
  });
});
