<template>
  <div class="mod-home">
    <h3>订单列表统计</h3>
    <ul class="card hover">
      <li class="data"
          v-for="(item) in odlist"
          :key="item.name"
          @click="toOrder(item.name)">
        <a href="#">
          <h2>{{item.num}}</h2>
        </a>
        <p>{{item.name}}</p>
      </li>

    </ul>
    <h3>拼版打印统计</h3>
    <ul class="card hover">
      <li class=""
          v-for="(item) in printrecordList"
          :key="item.name"
          @click="toPrintRecord(item.name)">
        <a href="#">
          <h2>{{item.num}}</h2>
        </a>
        <p>{{item.name}}</p>
      </li>

    </ul>
    <h3>系统状态监测</h3>
    <ul class="card">
      <li v-for="(item) in apistatus"
          :key="item.name"
          class="status">
        <div :class="item.code==0?'dot success':'dot fail'"><i :class="item.code==0?'el-icon-check':'el-icon-close'">
          </i></div>
        <p>{{item.name}}</p>
        <p v-if="item.code!=0">请立即联系管理员,err_code：{{item.code}}-err_msg：{{item.msg}}</p>
      </li>
    </ul>
    <h4><a target="_bank"
         href="https://shimo.im/docs/HtPKPptjqvG6XJQw/">使用手册</a></h4>
  </div>
</template>

<script>
export default {
  data () {
    return {
      odlist: [
      ],
      printrecordList: [],
      apistatus: []
    }
  },
  methods: {
    get () {
      this.$http({
        url: this.$http.adornUrl('/home/count'),
        method: 'get'
      }).then(({ data }) => {
        this.odlist.push({ name: '异常', num: data.err_od })
        this.odlist.push({ name: '待上传', num: data.no_image_od })
        this.odlist.push({ name: '待设计', num: data.no_merge_od })
        this.odlist.push({ name: '待拼版', num: data.no_print_od })
        this.odlist.push({ name: '待制作', num: data.no_make_od })

        this.printrecordList.push({ name: '待饱和', num: data.wait_add_p })
        this.printrecordList.push({ name: '待制作', num: data.wait_download_p })
      })
      this.$http({
        url: this.$http.adornUrl('/home/apistatus'),
        method: 'get'
      }).then(({ data }) => {
        this.apistatus.push({ name: '私定淘宝订单推送', code: data.agiso_siding.code, msg: data.agiso_siding.msg })
        this.apistatus.push({ name: '时光淘宝订单推送', code: data.agiso_shiguang.code, msg: data.agiso_shiguang.msg })
        this.apistatus.push({ name: '淘宝图片获取', code: data.taobaopic === true ? 0 : -1, msg: data.taobaopic === true ? 'success' : '获取不到图片' })
      })
    },
    toPrintRecord (name) {
      this.$router.push({
        name: 'generator-printrecord',
        params: { status: name }
      })
    },
    toOrder (name) {
      this.$router.push({
        name: 'generator-order',
        params: { status: name }
      })
    }
  },
  activated () {
    this.get()
  },
  mounted () {
  }

}
</script>

<style>
h1 {
  text-align: center;
}
.card {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}
.card li {
  width: 120px;
  /* height: 100px; */
  margin: 20px;
  list-style: none;
  text-align: center;
  /* border: 1px solid rgba(0, 0, 0, 0.1); */
  transition: 0.5s;
  cursor: pointer;
  border-radius: 20px;
}
.card .data:nth-child(1) a {
  color: red;
}
.card .status {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.card .status .dot {
  width: 40px;
  height: 40px;
  border-radius: 40px;
  font-size: 20px;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.02);

  display: flex;
  justify-content: center;
  align-items: center;
}
.card .status .success {
  color: #45c2b5;
}
.card .status .fail {
  color: red;
}
.hover li:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>


