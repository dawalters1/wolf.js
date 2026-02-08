
import { expect } from 'chai';
import sinon from 'sinon';

const activeCallCheck = { spyOrStub: null, numberOfCalls: null, timesCalledWithUsed: null };

export const createMockRequest = (eventName, response) => {
  const originalEmit = global.client.websocket.socket.emit;

  const spy = sinon.stub(global.client.websocket.socket, 'emit')
    .callsFake((event, payload, callback) => {
      if (event === eventName) {
        if (typeof callback === 'function') { callback(response); }
        return; // prevent real network call
      }

      return originalEmit.call(global.client.websocket.socket, event, payload, callback);
    }
    );

  return spy;
};

const callCount = (spyOrStub, numberOfCalls) => {
  // Assess callCount
  expect(spyOrStub).to.not.equal(undefined);
  expect(spyOrStub).to.not.equal(null);
  expect(spyOrStub.callCount).to.equal(
    numberOfCalls,
    `Spy/Stub Check - Expected ${
      JSON.stringify(spyOrStub.callCount)} to equal ${JSON.stringify(numberOfCalls)
    }\n\n          Calls that occurred\n\n${
      (spyOrStub.getCalls().length > 0)
        ? spyOrStub.getCalls().map((spyCall) => `             ${spyCall.args.map((arg) => JSON.stringify(arg)).join(', ')}`).join('\n')
        : '             None'
    }\n\n      `
  );

  // Establish new details for assessing the spy
  activeCallCheck.spyOrStub = spyOrStub;
  activeCallCheck.numberOfCalls = numberOfCalls;
  activeCallCheck.timesCalledWithUsed = 0;
  activeCallCheck.callArguments = spyOrStub.getCalls().map((spyCall) => spyCall.args);
  activeCallCheck.callArgumentsChecked = [];
};

const calledWith = (...expectedArgs) => {
  expect(activeCallCheck.numberOfCalls).to.not.equal(undefined, 'Spy/Stub Check - Unexpected Error');
  expect(activeCallCheck.numberOfCalls).to.not.equal(null, 'Spy/Stub Check - Missing active spy check object, call .callCount() before .calledWith()');
  expect(activeCallCheck.timesCalledWithUsed).to.not.equal(undefined, 'Spy/Stub Check - Unexpected Error');
  expect(activeCallCheck.timesCalledWithUsed).to.not.equal(null, 'Spy/Stub Check - Missing active spy check object, call .callCount() before .calledWith()');

  // Compare only the first N arguments
  const argIndex = activeCallCheck.callArguments.findIndex((args) => {
    const sliceArgs = args.slice(0, expectedArgs.length); // ignore extra callback
    return JSON.stringify(sliceArgs) === JSON.stringify(expectedArgs);
  });

  expect(argIndex).to.not.equal(
    -1,
    `Expected Spy/Stub to still have [ ${expectedArgs.map((arg) => JSON.stringify(arg)).join(', ')} ] to test against\n\n          Calls not yet tested against\n${
      activeCallCheck.callArguments.length > 0
        ? activeCallCheck.callArguments.map((args) => `[ ${args.map((arg) => JSON.stringify(arg)).join(', ')} ]`).join('\n')
        : 'None'
    }`
  );

  activeCallCheck.callArgumentsChecked.push(activeCallCheck.callArguments[argIndex]);
  activeCallCheck.callArguments.splice(argIndex, 1);
  activeCallCheck.timesCalledWithUsed++;
};

const callsChecked = () => {
  // Assess active spy check exists
  expect(activeCallCheck.numberOfCalls).to.not.equal(undefined, 'Spy/Stub Check - Unexpected Error');
  expect(activeCallCheck.numberOfCalls).to.not.equal(null, 'Spy/Stub Check - Missing active spy check object, call .callCount() before .callsChecked()');
  expect(activeCallCheck.timesCalledWithUsed).to.not.equal(undefined, 'Spy/Stub Check - Unexpected Error');
  expect(activeCallCheck.timesCalledWithUsed).to.not.equal(null, 'Spy/Stub Check - Missing active spy check object, call .callCount() before .callsChecked()');

  // Assess whether spy was checked correctly
  expect(activeCallCheck.timesCalledWithUsed).to.equal(activeCallCheck.numberOfCalls, `Expected .calledWith() to be called ${activeCallCheck.numberOfCalls} time${(activeCallCheck.numberOfCalls === 1)
    ? ''
    : 's'} but it was called ${activeCallCheck.timesCalledWithUsed} time${(activeCallCheck.timesCalledWithUsed === 1)
    ? ''
    : 's'} instead\n          Calls that occurred\n${activeCallCheck.spyOrStub.getCalls().map((spyCall) => `             ${spyCall.args.map((arg) => JSON.stringify(arg)).join(', ')}`).join('\n')}\n`);

  // End active check data
  activeCallCheck.numberOfCalls = null;
  activeCallCheck.timesCalledWithUsed = null;
};

const length = (objectArray, requiredLength) => {
  expect(objectArray).to.not.equal(undefined);
  expect(objectArray).to.not.equal(null);
  expect(objectArray.length).to.equal(requiredLength);
};

const isTrue = (object) => {
  expect(object).to.not.equal(undefined);
  expect(object).to.not.equal(null);
  expect(object).to.equal(true);
};

const isFalse = (object) => {
  expect(object).to.not.equal(undefined);
  expect(object).to.not.equal(null);
  expect(object).to.equal(false);
};

const isNull = (object) => {
  expect(object).to.not.equal(undefined);
  expect(object).to.equal(null);
};

const isNotNullOrUndefined = (object) => {
  expect(object).to.not.equal(undefined);
  expect(object).to.not.equal(null);
};

const isMatch = (obj, shape) => {
  for (const key in shape) {
    const expected = shape[key];
    const actual = obj[key];

    const checkTypeOrValue = (exp, val) => {
      if (exp === Number) {
        if (typeof val !== 'number') {
          throw new Error(`Property "${key}" expected type Number but got ${typeof val}: ${JSON.stringify(val)}`);
        }
        return;
      }
      if (exp === String) {
        if (typeof val !== 'string') {
          throw new Error(`Property "${key}" expected type String but got ${typeof val}: ${JSON.stringify(val)}`);
        }
        return;
      }
      if (exp === Boolean) {
        if (typeof val !== 'boolean') {
          throw new Error(`Property "${key}" expected type Boolean but got ${typeof val}: ${JSON.stringify(val)}`);
        }
        return;
      }
      if (exp === null) {
        if (val !== null) {
          throw new Error(`Property "${key}" expected null but got ${JSON.stringify(val)}`);
        }
        return;
      }
      if (val !== exp) {
        throw new Error(`Property "${key}" expected value ${JSON.stringify(exp)} but got ${JSON.stringify(val)}`);
      }
    };

    if (Array.isArray(expected)) {
      const pass = expected.some(exp => {
        try {
          checkTypeOrValue(exp, actual);
          return true;
        } catch {
          return false;
        }
      });
      if (!pass) {
        const expectedTypes = expected.map(e => e?.name || JSON.stringify(e)).join(' | ');
        throw new Error(`Property "${key}" did not match any allowed type/value: ${expectedTypes}, actual value: ${JSON.stringify(actual)}`);
      }
    } else {
      checkTypeOrValue(expected, actual);
    }
  }
};

export default {
  createMockRequest,
  length,
  isTrue,
  isFalse,
  isNull,
  calledWith,
  callCount,
  callsChecked,
  isMatch,
  isNotNullOrUndefined
};
