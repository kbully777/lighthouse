/**
 * @license Copyright 2021 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import {jest} from '@jest/globals';

import {makePromiseInspectable, flushAllTimersAndMicrotasks} from '../../test-utils.js';
import {createMockContext} from '../../fraggle-rock/gather/mock-driver.js';
import TraceGatherer from '../../../gather/gatherers/trace.js';
import TraceProcessor from '../../../lib/tracehouse/trace-processor.js';

jest.useFakeTimers();

describe('TraceGatherer', () => {
  let gatherer = new TraceGatherer();
  let context = createMockContext();

  beforeEach(() => {
    gatherer = new TraceGatherer();
    context = createMockContext();
  });

  describe('startSensitiveInstrumentation', () => {
    beforeEach(() => {
      context.driver.defaultSession.sendCommand
        .mockResponse('Page.enable')
        .mockResponse('Tracing.start');
    });

    it('should start tracing', async () => {
      await gatherer.startSensitiveInstrumentation(context.asContext());
      expect(context.driver.defaultSession.sendCommand).toHaveBeenCalledWith(
        'Tracing.start',
        expect.anything()
      );
    });

    it('should use custom categories', async () => {
      context.settings.additionalTraceCategories = 'madeup-category,othercategory';
      await gatherer.startSensitiveInstrumentation(context.asContext());

      const session = context.driver.defaultSession;
      const traceStartInvocation = session.sendCommand.findInvocation('Tracing.start');
      if (!traceStartInvocation) throw new Error('Did not call Tracing.start');

      const categories = traceStartInvocation.categories.split(',');
      expect(categories).toContain('devtools.timeline'); // original category
      expect(categories).toContain('madeup-category'); // additional
      expect(categories).toContain('othercategory'); // additional
    });

    it('should add a performance measure in timespan mode', async () => {
      context.gatherMode = 'timespan';

      await gatherer.startSensitiveInstrumentation(context.asContext());
      expect(context.driver.executionContext.evaluate).toHaveBeenCalledWith(
        expect.any(Function), {args: [TraceProcessor.TIMESPAN_MARKER_ID]}
      );
    });
  });

  describe('stopSensitiveInstrumentation', () => {
    it('should collect events on Trace.dataCollected', async () => {
      const session = context.driver.defaultSession;
      session.sendCommand.mockResponse('Tracing.end');

      const stopPromise = makePromiseInspectable(
        gatherer.stopSensitiveInstrumentation(context.asContext())
      );

      const dataListener = session.on.findListener('Tracing.dataCollected');
      const completeListener = session.once.findListener('Tracing.tracingComplete');

      dataListener({value: [1, 2, 3]});
      await flushAllTimersAndMicrotasks();
      expect(stopPromise).not.toBeDone();

      dataListener({value: [4, 5, 6]});
      await flushAllTimersAndMicrotasks();
      expect(stopPromise).not.toBeDone();

      completeListener();
      await flushAllTimersAndMicrotasks();
      expect(stopPromise).toBeDone();
      expect(session.off).toHaveBeenCalled();

      await stopPromise;
      expect(await gatherer.getArtifact()).toEqual({traceEvents: [1, 2, 3, 4, 5, 6]});
    });
  });
});
