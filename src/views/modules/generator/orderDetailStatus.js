let orderDetailStatus = {
  '0': {
    text: '',
    value: '',
    type: ''
  },
  '01': {
    text: '待付款',
    value: '-1',
    type: 'warning'
  },
  '1': {
    text: '待上传',
    value: 1,
    type: 'warning'
  },
  '2': {
    text: '待合并',
    value: 2,
    type: 'info'
  },
  '3': {
    text: '待打印',
    value: 3,
    type: 'info'
  },
  '4': {
    text: '完成',
    value: 4,
    type: 'success'
  },
  '5': {
    text: '胶卷过长',
    value: 5,
    type: 'danger'
  },
  '6': {
    text: '图片失效',
    value: 6,
    type: 'danger'
  },
  '7': {
    text: '非胶卷',
    value: 7,
    type: 'info'
  },
  '8': {
    text: '关闭',
    value: 8,
    type: 'info'
  }
}
export default orderDetailStatus
