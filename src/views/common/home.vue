<template>
  <div class="mod-home">
    <h3>欢迎使用大学生健康信息管理系统</h3>
  </div>
</template>

<script>
export default {

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


