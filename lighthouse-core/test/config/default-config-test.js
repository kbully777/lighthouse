/**
 * @license Copyright 2018 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import {strict as assert} from 'assert';

import defaultConfig from '../../config/default-config.js';

describe('Default Config', () => {
  it('relevantAudits map to existing perf audit', () => {
    const metricsWithRelevantAudits = defaultConfig.categories.performance.auditRefs.filter(a =>
        a.relevantAudits);
    const allPerfAuditIds = defaultConfig.categories.performance.auditRefs.map(a => a.id);

    for (const metric of metricsWithRelevantAudits) {
      assert.ok(Array.isArray(metric.relevantAudits) && metric.relevantAudits.length);

      for (const auditid of metric.relevantAudits) {
        const errMsg = `(${auditid}) is relevant audit for (${metric.id}), but no audit found.`;
        assert.ok(allPerfAuditIds.includes(auditid), errMsg);
      }
    }
  });
});
