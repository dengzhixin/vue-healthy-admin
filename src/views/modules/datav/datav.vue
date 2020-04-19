<template>
  <div class='box'>
    <header class="layout-row ">
      <dv-decoration-8 style="width:300px;height:50px;" />
      <div class="layout-col">
        <h1>胶卷制作系统</h1>
        <dv-decoration-5 class="center"
                         style="width:300px;height:40px;" />"
      </div>
      <dv-decoration-8 :reverse="true"
                       style="width:300px;height:50px;" />
    </header>
    <dv-decoration-10 style="width:100%;height:5px;" />
    <dv-border-box-11 class="order"
                      title="订单流">dv-border-box-11</dv-border-box-11>
  </div>
</template>

<script>
export default {

  components: {},
  data () {
    return {
      msg: 'Hello Vue'
    }
  },

  computed: {},
  watch: {},
  methods: {},
  // 生命周期 - 创建完成（可以访问当前this实例）
  created () {

  },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted () { },
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
  width: 100%;
  background-image: url("http://datav.jiaminghi.com/demo/construction-data/img/bg.837e99ea.png");
}
header {
  justify-content: space-between;
}
header h1 {
  text-align: center;
  color: white;
}
header .center {
  position: relative;
  top: -20px;
}

.order {
  width: 40%;
  height: 200px;
  padding-top: 60px;
  padding-left: 40px;
}
</style>
