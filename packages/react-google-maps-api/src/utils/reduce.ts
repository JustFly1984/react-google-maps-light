// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const reduce = (obj: any, fn: any, acc: any): any => {
  return Object.keys(obj).reduce(function reducer(newAcc, key) {
    return fn(newAcc, obj[key], key)
  }, acc)
}
