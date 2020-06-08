// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function forEach(obj: any, fn: any): any {
  Object.keys(obj).forEach(function callbackfn(key) {
    return fn(obj[key], key)
  })
}
