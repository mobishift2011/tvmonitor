<style lang="less">
  .error {
    width: 600px;
    margin: 200px auto;
    text-align: center;
  }
</style>

<template>
  <div class="error">
    <div class="alert alert-danger">
      对不起，您没有操作权限！请联系管理员。<a v-link="{path: '/login'}">重新登陆</a>
    </div>
  </div>
</template>

<script>
  export default{}
</script>