<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'"
             :close-on-click-modal="false"
             :visible.sync="visible">
    <el-form :model="dataForm"
             :rules="dataRule"
             ref="dataForm"
             @keyup.enter.native="dataFormSubmit()"
             label-width="80px">
      <el-form-item label="学号"
                    prop="stuNum">
        <el-input v-model="dataForm.stuNum"
                  placeholder="学号"></el-input>
      </el-form-item>
      <el-form-item label="姓名"
                    prop="name">
        <el-input v-model="dataForm.name"
                  placeholder="姓名"></el-input>
      </el-form-item>
      <el-form-item label="班级"
                    prop="grade">
        <el-input v-model="dataForm.grade"
                  placeholder="班级"></el-input>
      </el-form-item>
      <el-form-item label="性别"
                    prop="sex">

        <el-select v-model="dataForm.sex"
                   placeholder="请选择">
          <el-option v-for="item in options"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="身高"
                    prop="height">
        <el-input v-model="dataForm.height"
                  placeholder="身高">
          <template slot="append">厘米</template>
        </el-input>
      </el-form-item>
      <el-form-item label="体重"
                    prop="weight">
        <el-input v-model="dataForm.weight"
                  placeholder="体重">
          <template slot="append">公斤</template>
        </el-input>
      </el-form-item>

      <el-form-item label="肺活量"
                    prop="vitalCapacity">
        <el-input v-model="dataForm.vitalCapacity"
                  placeholder="肺活量">
          <template slot="append">毫升</template>
        </el-input>
      </el-form-item>
      <el-form-item label="长跑成绩"
                    prop="longDistanceRun">
        <el-input v-model="dataForm.longDistanceRun"
                  placeholder="长跑成绩">
          <template slot="append">分钟</template>
        </el-input>
      </el-form-item>
      <el-form-item label="短跑成绩"
                    prop="dash">
        <el-input v-model="dataForm.dash"
                  placeholder="短跑成绩">
          <template slot="append">秒</template>
        </el-input>
      </el-form-item>
      <el-form-item label="跳远"
                    prop="longJump">
        <el-input v-model="dataForm.longJump"
                  placeholder="跳远">
          <template slot="append">米</template>
        </el-input>
      </el-form-item>
    </el-form>
    <span slot="footer"
          class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary"
                 @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      visible: false,
      options: [{
        value: 0,
        label: '女'
      }, {
        value: 1,
        label: '男'
      }, {
        value: 2,
        label: '保密'
      }],
      dataForm: {
        id: 0,
        stuNum: '',
        name: '',
        grade: '',
        height: '',
        weight: '',
        sex: '',
        vitalCapacity: '',
        longDistanceRun: '',
        dash: '',
        longJump: ''
      },
      dataRule: {
        stuNum: [
          { required: true, message: '学号不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '姓名不能为空', trigger: 'blur' }
        ],
        grade: [
          { required: true, message: '班级不能为空', trigger: 'blur' }
        ],
        height: [
          { required: true, message: '身高不能为空', trigger: 'blur' }
        ],
        weight: [
          { required: true, message: '体重不能为空', trigger: 'blur' }
        ],
        sex: [
          { required: true, message: '性别不能为空', trigger: 'blur' }
        ],
        vitalCapacity: [
          { required: true, message: '肺活量不能为空', trigger: 'blur' }
        ],
        longDistanceRun: [
          { required: true, message: '长跑成绩不能为空', trigger: 'blur' }
        ],
        dash: [
          { required: true, message: '短跑成绩不能为空', trigger: 'blur' }
        ],
        longJump: [
          { required: true, message: '跳远不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init (id) {
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/generator/record/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.stuNum = data.record.stuNum
              this.dataForm.name = data.record.name
              this.dataForm.grade = data.record.grade
              this.dataForm.height = data.record.height
              this.dataForm.weight = data.record.weight
              this.dataForm.sex = data.record.sex
              this.dataForm.vitalCapacity = data.record.vitalCapacity
              this.dataForm.longDistanceRun = data.record.longDistanceRun
              this.dataForm.dash = data.record.dash
              this.dataForm.longJump = data.record.longJump
            }
          })
        }
      })
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/generator/record/${!this.dataForm.id ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData({
              'id': this.dataForm.id || undefined,
              'stuNum': this.dataForm.stuNum,
              'name': this.dataForm.name,
              'grade': this.dataForm.grade,
              'height': this.dataForm.height,
              'weight': this.dataForm.weight,
              'sex': this.dataForm.sex,
              'vitalCapacity': this.dataForm.vitalCapacity,
              'longDistanceRun': this.dataForm.longDistanceRun,
              'dash': this.dataForm.dash,
              'longJump': this.dataForm.longJump
            })
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        }
      })
    }
  }
}
</script>
