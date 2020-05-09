/* eslint-disable space-before-function-paren */
function imgUrl(url, size) {
  return function (url) {
    if (!size) {
      size = 500
    }
    return url.indexOf('img.alicdn.com') > 0 ? url + '_' + size + 'x' + size : url
  }
}
export default imgUrl
