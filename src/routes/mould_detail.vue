<style lang="less">
  .mould-detail h1 {
    padding-top: 0;
  }
</style>

<template>
  <div class="mould-detail">
    <ol class="breadcrumb">
      <li><a v-link="{path: '/mould'}">模具列表</a></li>
      <li class="active">模具详情</li>
    </ol>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper mould-detail">
        <h1>模具信息</h1>
        <table class="table table-condensed">
          <tbody>
          <tr>
            <th>模架号</th>
            <td>{{mould.moldId}}</td>
            <th>模具号</th>
            <td>{{mould.mId}}</td>
            <th>模具名</th>
            <td>{{mould.mName}}</td>
          </tr>
          <tr>
            <th>产品图号</th>
            <td>{{mould.mapId}}</td>
            <th>产品尺寸</th>
            <td>{{mould.size}}</td>
            <th>使用胶料</th>
            <td>{{mould.rubber}}</td>
          </tr>
          <tr>
            <th>模具数量</th>
            <td>{{mould.mNum}}</td>
            <th>模腔数量</th>
            <td>{{mould.cNum}}</td>
            <th>模具状态</th>
            <td>{{getMouldStateName(mould.state)}}</td>
          </tr>
          <tr>
            <th>管理员</th>
            <td>{{getWorkUserName(mould.adder)}}</td>
            <th>校对员</th>
            <td>{{getWorkUserName(mould.checker)}}</td>
            <th></th>
            <td></td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper">
        <h1>模具状态</h1>
        <div class="row">
          <div class="col-sm-offset-3 col-sm-3">
            <date-picker :time.sync="q.st | moment" placeholder="开始时间"></date-picker>
          </div>
          <div class="col-sm-3">
            <date-picker :time.sync="q.et | moment" placeholder="结束时间"></date-picker>
          </div>
          <div class="col-sm-3">
            <div class="input-group">
              <select v-model="q.s" class="form-control input-sm">
                <option value="">全部</option>
                <option v-for="s in states" :value="$index + 1">{{s}}</option>
              </select>
              <span class="input-group-btn">
                <button class="btn btn-info btn-sm" type="button" @click="search">{{searching ? '搜索中...':'搜索'}}</button>
              </span>
            </div>
          </div>
        </div>
      </div>
      <table class="table table-hover table-condensed">
        <thead>
        <tr>
          <th>序号</th>
          <th>原状态</th>
          <th>新状态</th>
          <th>时间</th>
          <th>申请人</th>
          <th>检验员</th>
          <th>状态</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list">
          <th scope="row">{{$index + 1}}</th>
          <td>{{getMouldStateName(i.oldState)}}</td>
          <td>{{getMouldStateName(i.state)}}</td>
          <td>{{i.time | moment}}</td>
          <td>{{getWorkUserName(i.applyer)}}</td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>{{{getCheckedName(i.checked)}}}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  import {extend, find} from 'lodash';

  import {MOULD_STATES} from '../utils/constants';

  export default{
    methods: {
      /**
       * 获取员工信息
       */
      getWorkUserName(wuId){
        return (find(this.workUsers, {_id: wuId}) || {}).wuName;
      },
      getCheckedName(checked){
        if (checked === 2) {
          return '<span class="label label-success">已确认</span>';
        } else {
          return '<span class="label label-default">等待确认</span>';
        }
      },
      /**
       * 获取状态名称
       */
      getMouldStateName(state){
        return this.states[state - 1] || '无';
      },
      /**
       * 搜索
       */
      search(){
        if (this.searching)return;
        this.searching = true;

        var params = {};
        if (this.q.s) params.state = this.q.s;
        if (this.q.st || this.q.et) {
          params.time = {};

          if (this.q.st) params.time.$gt = this.q.st;
          if (this.q.et) params.time.$lt = this.q.et;
        }

        this.fetchData(params);
      },
      fetchData(params){
        var mId = this.$route.params.mId;
        return Promise.all([
          this.$http.get('/api/workusers/field'),
          this.$http.get(`/api/mould/state/${mId}`, params)
        ]).then(function (res) {
          this.workUsers = res[0].data;
          this.mould = res[1].data.mould;
          this.list = res[1].data.states;
          this.loading = false;
          this.searching = false;
        }.bind(this));
      }
    },
    created(){
      this.fetchData();
    },
    data(){
      return {
        q: {
          s: '',              // 状态
          st: '',             // 开始时间
          et: ''              // 结束时间
        },
        loading: true,        // 初始化中
        searching: false,     // 搜索中
        states: MOULD_STATES, // 模具状态
        mould: {},            // 模具信息
        workUsers: [],        // 所有员工
        list: []              // 所有数据
      }
    }
  }
</script>