let printRecordStatus = {
  '0': {
    text: '未饱和',
    value: '0',
    type: 'info'
  },
  '1': {
    text: '饱和',
    value: 1,
    type: 'info'
  },
  '2': {
    text: '待导出',
    value: 2,
    type: ''
  },
  '3': {
    text: '已导出',
    value: 3,
    type: 'success'
  },
  '4': {
    text: '生成中',
    value: 4,
    type: 'success'
  }
}
export default printRecordStatus
