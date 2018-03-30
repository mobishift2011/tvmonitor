<style lang="less">
  .login-container {
    width: 350px;
    margin: 200px auto;
    background-color: white;
    padding: 10px;
    border-radius: 2px;

    header {
      font-size: 20px;
      text-align: center;
      margin-bottom: 20px;
    }
  }
</style>

<template>
  <form class="login-container" @submit.prevent="submit">
    <header>用户登陆</header>
    <div class="form-group">
      <input type="text" v-model="model.wuId" placeholder="工号" class="form-control"/>
    </div>
    <div class="form-group">
      <input type="password" v-model="model.password" placeholder="密码" class="form-control"/>
    </div>
    <div class="alert alert-danger" v-if="errmsg">{{errmsg}}</div>
    <button type="submit" class="btn btn-primary btn-block" :disabled="async">{{async ? '登陆中...': '登 陆'}}</button>
  </form>
</template>

<script>
  import oauth from '../utils/oauth';

  export default{
    ready(){

    },
    data(){
      return {
        model: {
          wuId: '',
          password: ''
        },
        errmsg: '',         // 错误信息
        async: false　　　　 // 提交中
      }
    },
    methods: {
      submit () {
        let wuId = this.model.wuId;
        let password = this.model.password;

        if (!wuId || !password) {
          this.errmsg = '请输入用户名或密码';
          return;
        }
        this.errmsg = '';
        this.async = true;

        this.$http.post('/login', this.model)
                .then(function (res) {
                  oauth.setLocal(res.data);
                  this.$router.go({path: '/'});
                })
                .catch(function (res) {
                  if (res.status === 400) {
                    this.errmsg = '用户名或密码错误';
                  }
                  this.async = false;
                });
      }
    }
  }
</script>