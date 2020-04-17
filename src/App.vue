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
</style>
