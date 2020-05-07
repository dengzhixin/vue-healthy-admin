/* eslint-disable space-before-function-paren */
function url(u) {
  return function (u) {
    if (u.startsWith('/')) {
      return '/filmaker/img' + u
    } else {
      return u
    }
  }
}
export default url
