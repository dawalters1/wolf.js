import _ from 'lodash';
import { expect } from 'chai';
import sinon from 'sinon';

let emitStub = null;
let axioxStub = null;
const emitHandlers = new Map();
const axiosHandlers = new Map();

const activeCallCheck = {
  spyOrStub: null,
  numberOfCalls: null,
  timesCalledWithUsed: null,
  callArguments: [],
  callArgumentsChecked: []
};

/**
 * ============================================================
 * Socket Emit Mocking
 * ============================================================
 */

const mockSocket = () => {
  const socket = global.client.websocket.socket;

  if (emitStub) {
    return emitStub;
  }

  const originalEmit = socket.emit;

  emitStub = sinon.stub(socket, 'emit').callsFake((event, payload, callback) => {
    const eventHandlers = emitHandlers.get(event) ?? [];

    for (const { match, response } of eventHandlers) {
      if (_.isMatch(payload, match)) {
        if (typeof callback === 'function') {
          callback(response);
        }
        return; // swallow real network call
      }
    }

    return originalEmit.call(socket, event, payload, callback);
  });

  return emitStub;
};

const mockRest = () => {

};

const restoreSocket = () => {
  emitStub?.restore();
  emitStub = null;
  emitHandlers.clear();
};

const restoreRest = () => {
  axioxStub?.restore();
  axioxStub = null;
  emitHandlers.clear();
};
/**
 * Registers a mocked socket request/response.
 */
export const createMockRestRequest = (config, match, response) => {
  mockRest();
  // TODO:
  return;
  const list = emitHandlers.get(eventName) ?? [];
  list.push({ match, response });
  emitHandlers.set(eventName, list);

  return emitStub;
};
export const createMockSocketRequest = (eventName, match, response) => {
  mockSocket();

  const list = emitHandlers.get(eventName) ?? [];
  list.push({ match, response });
  emitHandlers.set(eventName, list);

  return emitStub;
};

/**
 * ============================================================
 * Spy / Stub Assertions (ACTIVE CHECK MODEL)
 * ============================================================
 */

const callCount = (spyOrStub, numberOfCalls) => {
  expect(spyOrStub).to.not.equal(undefined);
  expect(spyOrStub).to.not.equal(null);

  expect(
    spyOrStub.callCount,
    `Spy/Stub Check - Expected ${numberOfCalls} call(s) but got ${spyOrStub.callCount}\n\nCalls:\n${
      spyOrStub.getCalls().length
        ? spyOrStub.getCalls().map(c => `  ${JSON.stringify(c.args)}`).join('\n')
        : '  None'
    }`
  ).to.equal(numberOfCalls);

  activeCallCheck.spyOrStub = spyOrStub;
  activeCallCheck.numberOfCalls = numberOfCalls;
  activeCallCheck.timesCalledWithUsed = 0;
  activeCallCheck.callArguments = spyOrStub.getCalls().map(c => c.args);
  activeCallCheck.callArgumentsChecked = [];
};

const calledWith = (...expectedArgs) => {
  expect(activeCallCheck.numberOfCalls).to.not.equal(undefined);
  expect(activeCallCheck.numberOfCalls).to.not.equal(null);
  expect(activeCallCheck.timesCalledWithUsed).to.not.equal(undefined);
  expect(activeCallCheck.timesCalledWithUsed).to.not.equal(null);

  const argIndex = activeCallCheck.callArguments.findIndex(args =>
    _.isEqual(args.slice(0, expectedArgs.length), expectedArgs)
  );

  expect(
    argIndex,
    `Expected Spy/Stub to have call with:\n  [ ${expectedArgs.map(a => JSON.stringify(a)).join(', ')} ]\n\nRemaining calls:\n${
      activeCallCheck.callArguments.length
        ? activeCallCheck.callArguments.map(a => `  [ ${a.map(v => JSON.stringify(v)).join(', ')} ]`).join('\n')
        : '  None'
    }`
  ).to.not.equal(-1);

  activeCallCheck.callArgumentsChecked.push(activeCallCheck.callArguments[argIndex]);
  activeCallCheck.callArguments.splice(argIndex, 1);
  activeCallCheck.timesCalledWithUsed++;
};

const callsChecked = () => {
  expect(activeCallCheck.numberOfCalls).to.not.equal(undefined);
  expect(activeCallCheck.numberOfCalls).to.not.equal(null);
  expect(activeCallCheck.timesCalledWithUsed).to.not.equal(undefined);
  expect(activeCallCheck.timesCalledWithUsed).to.not.equal(null);

  expect(
    activeCallCheck.timesCalledWithUsed,
    `Expected .calledWith() to be called ${activeCallCheck.numberOfCalls} time${
      activeCallCheck.numberOfCalls === 1
        ? ''
        : 's'
    } but it was called ${activeCallCheck.timesCalledWithUsed} time${
      activeCallCheck.timesCalledWithUsed === 1
        ? ''
        : 's'
    }\n\nCalls:\n${
      activeCallCheck.spyOrStub.getCalls().map(c => `  ${JSON.stringify(c.args)}`).join('\n')
    }`
  ).to.equal(activeCallCheck.numberOfCalls);

  // Reset active state
  activeCallCheck.spyOrStub = null;
  activeCallCheck.numberOfCalls = null;
  activeCallCheck.timesCalledWithUsed = null;
  activeCallCheck.callArguments = [];
  activeCallCheck.callArgumentsChecked = [];
};

/**
 * ============================================================
 * Value / Shape Assertions
 * ============================================================
 */

const length = (objectArray, requiredLength) => {
  expect(objectArray).to.not.equal(undefined);
  expect(objectArray).to.not.equal(null);
  expect(objectArray.length).to.equal(requiredLength);
};

const isTrue = (value) => {
  expect(value).to.not.equal(undefined);
  expect(value).to.not.equal(null);
  expect(value).to.equal(true);
};

const isFalse = (value) => {
  expect(value).to.not.equal(undefined);
  expect(value).to.not.equal(null);
  expect(value).to.equal(false);
};

const isNull = (value) => {
  expect(value).to.not.equal(undefined);
  expect(value).to.equal(null);
};

const isNotNullOrUndefined = (value) => {
  expect(value).to.not.equal(undefined);
  expect(value).to.not.equal(null);
};

/**
 * ============================================================
 * Deep Match with Type Support
 * ============================================================
 */

const isMatch = (obj, shape) => {
  for (const [key, expected] of Object.entries(shape)) {
    const actual = obj[key];

    const assertMatch = (exp) => {
      if (exp === Number && typeof actual !== 'number') {
        throw new Error(`Property "${key}" expected Number, got ${typeof actual}`);
      }
      if (exp === String && typeof actual !== 'string') {
        throw new Error(`Property "${key}" expected String, got ${typeof actual}`);
      }
      if (exp === Boolean && typeof actual !== 'boolean') {
        throw new Error(`Property "${key}" expected Boolean, got ${typeof actual}`);
      }
      if (exp === null && actual !== null) {
        throw new Error(`Property "${key}" expected null, got ${JSON.stringify(actual)}`);
      }
      if (![Number, String, Boolean, null].includes(exp) && !_.isEqual(actual, exp)) {
        throw new Error(`Property "${key}" expected ${JSON.stringify(exp)}, got ${JSON.stringify(actual)}`);
      }
    };

    if (Array.isArray(expected)) {
      const matched = expected.some(e => {
        try {
          assertMatch(e);
          return true;
        } catch {
          return false;
        }
      });

      if (!matched) {
        throw new Error(
          `Property "${key}" did not match any allowed values/types: ${
            expected.map(e => e?.name ?? JSON.stringify(e)).join(' | ')
          }`
        );
      }
    } else {
      assertMatch(expected);
    }
  }
};

export default {
  // socket mocking
  createMockSocketRequest,
  restoreSocket,

  // spy assertions
  callCount,
  calledWith,
  callsChecked,

  // value assertions
  length,
  isTrue,
  isFalse,
  isNull,
  isNotNullOrUndefined,

  // matching
  isMatch
};
