<style lang="less">
  .topbar {
    position: fixed;
    top: 0;
    right: 0;
    left: 200px;
    height: 41px;
    z-index: 1;
    background-color: white;
    box-shadow: inset 0 0 0 0 #54abd9;
    border-bottom: 1px solid #e0e0e0;

    .topbar-list {
      list-style: none;
      margin: 0;
      padding: 0;
      float: right;

      li {
        float: left;
        height: 40px;
        line-height: 40px;
        min-width: 40px;
        border-left: 1px solid #eeeeee;

        a {
          padding: 0 10px;
          text-align: center;
          display: block;
          font-size: 14px;
          color: #71787d;
          text-decoration: none;
        }

        &:hover {
          background-color: #eeeeee;
        }
      }
    }
  }
</style>

<template>
  <div class="topbar">
    <ul class="topbar-list">
      <li><a><strong>{{userInfo.wuName}}</strong></a></li>
      <li>
        <a href="" @click.prevent="logout">退出 <span class="glyphicon glyphicon-log-out"></span></a>
      </li>
    </ul>
  </div>
</template>

<script>
  import oauth from '../utils/oauth';

  export default{
    props: ['userInfo'],
    methods: {
      logout(){
        oauth.logout();
        this.$router.go({path: '/login'});
      }
    }
  }
</script>
