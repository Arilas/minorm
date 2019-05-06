/** @flow strict */

// $FlowFixMe
const createComposer = (): $Compose => (...funcs) => {
  return arg => funcs.reduceRight((composed, f) => f(composed), arg)
}

export const compose: $Compose = createComposer()
