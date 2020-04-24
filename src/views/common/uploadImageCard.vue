<template>
  <div class=''>
    <el-upload :drag="type=='drag'?true:false"
               :multiple="multiple"
               :action="url"
               accept="image/gif,image/png,image/jped,image/jpg"
               :before-upload="beforeUploadHandle"
               :on-success="successHandle"
               :show-file-list="false"
               style="text-align: center;">
      <template v-if="type=='drag'">
        <div class="box">
          <img class="preImage"
               v-if="preImage"
               :src="preImage" />
          <i v-else
             class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </div>
        <div class="el-upload__tip"
             slot="tip">只支持jpg、png、gif格式的图片！</div>
      </template>
      <template v-else>
        <i slot="trigger"
           class="iconfont">&#xe638;</i>
        <!-- <el-button >{{buttonText}}</el-button> -->
      </template>
    </el-upload>
  </div>
</template>

<script>
export default {

  components: {
  },
  data () {
    return {
      url: ''
    }
  },
  props: {
    index: Number,
    preImage: String,
    buttonText: {
      type: String,
      default: '上传图片'
    },
    type: {
      type: String,
      default: 'drag'
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  computed: {},
  watch: {},
  methods: {
    beforeUploadHandle (file) {
      if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
        this.$message.error('只支持jpg、png、gif格式的图片！')
        return false
      }
    },
    successHandle (response) {
      if (response && response.code === 0) {
        response.index = this.index
        this.$emit('uploadSuccess', response)
      } else {
        this.$message.error(response.msg)
      }
    }
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created () {

  },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted () {
    this.url = this.$http.adornUrl(`/sys/oss/upload?token=${this.$cookie.get('token')}`)
  },
  // 生命周期 - 创建之前
  beforeCreate () { },
  // 生命周期 - 挂载之前
  beforeMount () { },
  // 生命周期 - 更新之前
  beforeUpdate () { },
  // 生命周期 - 更新之后
  updated () { },
  // 生命周期 - 销毁之前
  beforeDestroy () { },
  // 生命周期 - 销毁完成
  destroyed () { }
}
</script>
<style scoped>
.box {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
}
.preImage {
  width: 100%;
  height: 100px;
  object-fit: contain;
}
</style>
