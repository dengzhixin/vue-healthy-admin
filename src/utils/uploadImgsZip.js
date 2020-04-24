/* eslint-disable space-before-function-paren */
import JsZip from 'jszip'
var rex = /(?<=\/).*(?=\.)/
var rex2 = /.*(?=\.)/

function uploadImgsZip(zip, ctx) {
  let loading = ctx.$loading({
    lock: true,
    text: '上传中',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  return new Promise((resolve) => {
    var zipUtil = new JsZip()
    let imgFiles = []
    zipUtil.loadAsync(zip)
      .then(function (zfile) {
        let fileNum = Object.keys(zipUtil.files).length
        console.log(zipUtil.files)
        let obj = {}
        Object.keys(zipUtil.files).forEach((key) => {
          let file = zfile.files[key]
          if (file.dir === false) {
            let name = file.name
            let ff = zipUtil.file(name)
            ff.async('base64').then((base64) => {
              base64 = 'data:image/png;base64,' + base64
              // console.log(base64)
              let f = dataURLtoFile(base64, name)
              imgFiles.push(f)
              let filename

              if (name.indexOf('/') >= 0) {
                filename = rex.exec(name)[0]
              } else {
                filename = rex2.exec(name)[0]
              }

              obj[filename] = f
              fileNum -= 1
              if (fileNum === 0) {
                let newfiles = []
                let nanfiles = []
                Object.keys(obj).forEach((nf) => {
                  let i = parseInt(nf)
                  if (!isNaN(i)) {
                    newfiles[i - 1] = obj[nf]
                  } else {
                    nanfiles.push(obj[nf])
                  }
                })
                Object.keys(obj).forEach((nf, index) => {
                  if (newfiles[index] == null) {
                    newfiles[index] = nanfiles.shift()
                  }
                })

                requestUploadFiles(newfiles, ctx).then((data) => {
                  loading.close()
                  resolve(data)
                })
              }
            })
          } else {
            fileNum -= 1
          }

          //   // var base64 = this.arrayBufferToBase64(buffer)
          //   // console.log(base64)
        })
      })
  })
}

function requestUploadFiles(files, ctx) {
  return new Promise((resolve) => {
    let param = new FormData() // 创建form对象
    files.forEach((f) => {
      param.append('files', f) // 通过append向form对象添加数据
    })
    let config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    } // 添加请求头
    ctx.$http.post(ctx.$http.adornUrl(`/sys/oss/uploads`), param, config)
      .then(({
        data
      }) => {
        // orderDetailList
        let imgs = data.urls.map((u) => {
          return {
            number: 1,
            url: u,
            angle: 0
          }
        })
        resolve(imgs)
      })
  })
}

function dataURLtoFile(dataurl, filename) {
  let arr = dataurl.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, {
    type: mime
  })
}

export default uploadImgsZip
