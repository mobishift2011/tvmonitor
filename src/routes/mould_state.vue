<style lang="less">

</style>

<template>
  <div>
    <h1>模具状态</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading && list.length">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
        </div>
        <div class="col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入模具编号或申请人" v-model="q">
            <span class="input-group-btn">
              <button class="btn btn-info btn-sm" type="button">搜索</button>
            </span>
          </div>
        </div>
      </div>
      <table class="table table-hover table-condensed">
        <thead>
        <tr>
          <th>序号</th>
          <th>原状态</th>
          <th>新状态</th>
          <th>库管员</th>
          <th>模具号</th>
          <th>申请人</th>
          <th>时间</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in '_mId' '_apUser'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{getMouldStateName(i.oldState)}}</td>
          <td>{{getMouldStateName(i.state)}}</td>
          <td>{{getWorkUserName(i.mId.adder)}}</td>
          <td>{{i._mId}}</td>
          <td>{{i._apUser}}</td>
          <td>{{i.time | moment}}</td>
          <td>
            <div class="btn-group btn-group-xs">
              <button v-if="i.checked === 1" type="button" class="btn btn-primary" @click="ok(i)">通过</button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无模具状态
    </div>
  </div>
</template>

<script>
  import {extend, find} from 'lodash';

  import {MOULD_STATES} from '../utils/constants';
  import notify from '../components/notify';

  export default{
    methods: {
      /**
       * 获取员工信息
       */
      getWorkUserName(wuId){
        return (find(this.workUsers, {_id: wuId}) || {}).wuName;
      },
      /**
       * 获取状态名称
       */
      getMouldStateName(state){
        return this.states[state - 1] || '无';
      },
      /**
       * 审核通过
       */
      ok(item){
        return this.$http.put(`/api/mouldstate/${item._id}`, {mId: item.mId._id, state: item.state})
                .then(function () {
                  notify.info('检验成功');
                  item.checked = 2;
                })
                .catch(function () {
                  notify.error('检验失败');
                });
      }
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/mouldstates')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.list.forEach((item) => {
          item._mId = item.mId.mId;
          //{{getWorkUserName(i.applyer)}}
          item._apUser =(find(this.workUsers, {_id: item.applyer}) || {}).wuName;
        });

        this.loading = false;
      }.bind(this));
    },
    filters:{
      test1:function(value,index){
        console.log(value,index);
        if(index % 2){
          return true;
        }
        return false;
      }
    },
    data(){
      return {
        loading: true,        // 初始化中
        states: MOULD_STATES, // 模具状态
        workUsers: [],        // 所有员工
        list: [],              // 所有数据
        q:''
      }
    }
  }
</script>