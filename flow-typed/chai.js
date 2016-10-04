/** @flow */
/* eslint-disable no-unused-vars */

declare module chai {
  declare class Assert {
    assert(expression: any, message: ?string): void;
    fail(actual: any, expected: any, message: ?string, operator: ?string): void;
    ok(actual: any, expected: any, message: ?string, operator: ?string): void;
    notOk(actual: any, expected: any, message: ?string, operator: ?string): void;
    equal(actual: any, expected: any, message: ?string): void;
    notEqual(actual: any, expected: any, message: ?string): void;
    strictEqual(actual: any, expected: any, message: ?string): void;
    notStrictEqual(actual: any, expected: any, message: ?string): void;
    deepEqual(actual: any, expected: any, message: ?string): void;
    notDeepEqual(actual: any, expected: any, message: ?string): void;
    isTrue(actual: any, message: ?string): void;
    isAbove(actual: any, expected: any, message: ?string): void;
    isBelow(actual: any, expected: any, message: ?string): void;
    isFalse(actual: any, message: ?string): void;
    isNull(actual: any, message: ?string): void;
    isNotNull(actual: any, message: ?string): void;
    isUndefined(actual: any, message: ?string): void;
    isDefined(actual: any, message: ?string): void;
    isFunction(actual: any, message: ?string): void;
    isNotFunction(actual: any, message: ?string): void;
    isObject(actual: any, message: ?string): void;
    isNotObject(actual: any, message: ?string): void;
    isArray(actual: any, message: ?string): void;
    isNotArray(actual: any, message: ?string): void;
    isString(actual: any, message: ?string): void;
    isNotString(actual: any, message: ?string): void;
    isNumber(actual: any, message: ?string): void;
    isNotNumber(actual: any, message: ?string): void;
    isBoolean(actual: any, message: ?string): void;
    isNotBoolean(actual: any, message: ?string): void;
    typeOf(actual: any, expected: string, message: ?string): void;
    notTypeOf(actual: any, expected: string, message: ?string): void;
    instanceOf(actual: any, expected: Function, message: ?string): void;
    notInstanceOf(actual: any, expected: Function, message: ?string): void;
    include(actual: Array<any> | string, expected: any, message: ?string): void;
    notInclude(actual: Array<any> | string, expected: any, message: ?string): void;
    match(actual: any, expected: RegExp, message: ?string): void;
    notMatch(actual: any, expected: RegExp, message: ?string): void;
    property(object: Object, property: string, message: ?string): void;
    notProperty(object: Object, property: string, message: ?string): void;
    deepProperty(object: Object, property: string, message?: string): void;
    notDeepProperty(object: Object, property: string, message?: string): void;
    propertyVal(object: Object, property: string, value: any, message?: string): void;
    propertyNotVal(object: Object, property: string, value: any, message?: string): void;
    deepPropertyVal(object: Object, property: string, value: any, message?: string): void;
    deepPropertyNotVal(object: Object, property: string, value: any, message?: string): void;
    lengthOf(actual: any, expected: number, message: ?string): void;
    throws(constructor: Function, expected: Function | RegExp | string, value: string | RegExp, message: ?string): void;
    doesNotThrows(constructor: Function, expected: Function | RegExp | string, value: string | RegExp, message: ?string): void;
    closeTo(actual: number, expected: number, delta: number, message: ?string): void;
    sameMembers(actual: Array<any>, expected: Array<any>, message: ?string): void;
    sameDeepMembers(actual: Array<Object>, expected: Array<Object>, message: ?string): void;
    includeMembers(actual: Array<any>, expected: Array<any>, message: ?string): void;
    changes(cb: Function, object: Object, property: string, message: ?string): void;
    doesNotChange(cb: Function, object: Object, property: string, message: ?string): void;
    increase(cb: Function, object: Object, property: string, message: ?string): void;
    doesNotIncrease(cb: Function, object: Object, property: string, message: ?string): void;
    decreases(cb: Function, object: Object, property: string, message: ?string): void;
    doesNotDecrease(cb: Function, object: Object, property: string, message: ?string): void;
  }

  declare var assert: Assert

  declare var exports: {
    assert: Assert
  }
}