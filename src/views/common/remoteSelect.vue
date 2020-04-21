<template>
  <div class=''>
    <el-select v-model="model[fild]"
               :multiple="multiple"
               :clearable="clearable"
               filterable
               remote
               placeholder="选择或输入关键字"
               :remote-method="remoteMethod"
               @change="onchange"
               :loading="loading">
      <el-option v-for="item in options"
                 :key="item[value]"
                 :label="item[label]"
                 :value="item[value]">
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  props: {
    model: Object,
    fild: String,
    type: String,
    label: String,
    value: String,
    index: Number,
    multiple: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      selectValue: '',
      options: [],
      loading: false
    }
  },
  methods: {
    onchange (value) {
      this.$emit('change', value, this.index)
    },
    remoteMethod (query) {
      this.loading = true
      this.$http({
        url: this.$http.adornUrl(`/generator/${this.type}/list`),
        method: 'get',
        params: this.$http.adornParams({
          'key': query
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.options = data.page.list
        } else {
          this.options = []
        }
        this.loading = false
      })
    }
  },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted () {
    this.remoteMethod('')
  }
}
</script>
<style>
</style>
