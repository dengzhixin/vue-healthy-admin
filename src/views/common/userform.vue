<template>
  <div>
    <p></p>
    <el-form class="form">
      <h1>{{record.name}}的健康信息报告</h1>
      <el-form-item label="学号">{{record.stuNum}}</el-form-item>
      <el-form-item label="班级">{{record.grade}}</el-form-item>
      <el-form-item label="性别">{{sexs[record.sex]}}</el-form-item>
      <el-form-item label="身高">{{record.height}}厘米</el-form-item>
      <el-form-item label="体重">{{record.weight}}公斤</el-form-item>
      <el-form-item label="肺活量">{{record.vitalCapacity}}毫升</el-form-item>
      <el-form-item label="长跑成绩">{{record.longDistanceRun}}分钟</el-form-item>
      <el-form-item label="短跑成绩">{{record.dash}}秒</el-form-item>
      <el-form-item label="跳远">{{record.longJump}}米</el-form-item>
      <el-button type="primary"
                 @click="goback">知道了，退出登录</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      sexs: ['女', '男', '未知'],
      record: {}
    }
  },
  mounted () {
    let id = this.$route.params.id
    let name = this.$route.params.username
    this.$http({
      url: this.$http.adornUrl('/app/login'),
      method: 'post',
      data: this.$http.adornData({
        'name': name,
        'stuNum': id
      })
    }).then(({ data }) => {
      if (data && data.code === 0) {
        this.record = data.record
      }
    })
  },
  methods: {
    goback () {
      this.$router.push({
        name: 'login'
      })
    }
  }
}
</script>
<style>
h1 {
  text-align: center;
}
.form {
  width: 400px;
  margin: 0 auto;
  border: 4px solid #26b3a3;
  padding: 20px;
  border-radius: 20px;
}
</style>
