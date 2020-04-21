/* eslint-disable no-unused-expressions */
/* eslint-disable space-before-function-paren */
import JSZip from 'jszip'
import {
  saveAs
} from 'file-saver'

function loadImages(array, callback) {
  var zip = new JSZip() //* ****创建实例，zip是对象实例
  var fileName = 'pic.zip'

  var len = function (arr) {
    let l = 0
    // eslint-disable-next-line no-unused-vars
    for (let key in arr) {
      l++
    }
    return l
  }
  for (let i = 0; i < array.length; i++) {
    // 对每一个图片链接获取base64的数据，并使用回调函数处理
    getBase64Image(array[i].url, function (dataURL) {
      // 对获取的图片base64数据进行处理
      var imgArr = dataURL.split(',')
      zip.file(array[i].name + '.jpg', imgArr[1], {
        base64: true
      }) // 根据base64数据在压缩包中生成jpg数据
      var ziplength = len(zip.files)
      console.log('加载完' + i)
      if (ziplength === array.length) { // 当所有图片都已经生成打包并保存zip
        zip.generateAsync({
          type: 'blob'
        }).then(function (content) {
          // console.log(content);
          saveAs(content, fileName)
          if (callback) {
            callback()
          }
        })
      }
    })
  }
}

function getBase64Image(images, callback) {
  var img = new Image()
  var canvas = document.createElement('canvas')
  img.setAttribute('crossOrigin', 'anonymous')
  img.onload = function () {
    console.log(this)
    console.log(this.width)
    console.log(this.height)
    canvas.width = this.width
    canvas.height = this.height

    canvas.getContext('2d').drawImage(this, 0, 0, canvas.width, canvas.height)
    let dataURL = canvas.toDataURL() // 使用canvas获取图片的base64数据

    callback ? callback(dataURL) : null // 调用回调函数
  }
  img.src = images
}
export default loadImages
