/* eslint-disable space-before-function-paren */
function url(u) {
  return function (u) {
    if (u.startsWith('/')) {
      return 'http://127.0.0.1:8080/filmaker/img' + u
    } else {
      return u
    }
  }
}
export default url
