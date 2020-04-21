<template>
  <transition name="fade">
    <router-view></router-view>
  </transition>
</template>

<script>
export default {

}
</script>
<style>
.icon {
  cursor: pointer;
}
.divider {
  background-color: #dcdfe6;
  display: block;
  height: 1px;
  width: 100%;
  margin: 24px 0;
}
.layout-row {
  display: flex;
  flex-direction: row;
}
.layout-col {
  display: flex;
  flex-direction: column;
}
.jscenter {
  align-items: center;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
