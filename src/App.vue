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
.pointer {
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

.iconfont {
  font-family: "iconfont";
  font-style: normal;
  cursor: pointer;
  font-size: 20pt;
}
@font-face {
  font-family: "iconfont"; /* project id 1777954 */
  src: url("//at.alicdn.com/t/font_1777954_7u5c7czosvg.eot");
  src: url("//at.alicdn.com/t/font_1777954_7u5c7czosvg.eot?#iefix")
      format("embedded-opentype"),
    url("//at.alicdn.com/t/font_1777954_7u5c7czosvg.woff2") format("woff2"),
    url("//at.alicdn.com/t/font_1777954_7u5c7czosvg.woff") format("woff"),
    url("//at.alicdn.com/t/font_1777954_7u5c7czosvg.ttf") format("truetype"),
    url("//at.alicdn.com/t/font_1777954_7u5c7czosvg.svg#iconfont") format("svg");
}
</style>
