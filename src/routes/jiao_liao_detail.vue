<style lang="less">
  .mould-detail h1 {
    padding-top: 0;
  }
</style>

<template>
  <div class="mould-detail">
    <ol class="breadcrumb">
      <li><a v-link="{path: '/jiaoliao'}">胶料列表</a></li>
      <li class="active">胶料详情</li>
    </ol>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper mould-detail">
        <h1>胶料信息</h1>
        <table class="table table-condensed">
          <tbody>
          <tr>
            <th>名称</th>
            <td>{{jl.jlName}}</td>
            <th>牌号</th>
            <td>{{jl.pId}}</td>
            <th>入检批次号</th>
            <td>{{jl.rId}}</td>
          </tr>
          <tr>
            <th>炉批号</th>
            <td>{{jl.lId}}</td>
            <th>单价(元/kg)</th>
            <td>{{jl.price}}</td>
            <th>技术条件</th>
            <td>{{jl.skill}}</td>
          </tr>
          <tr>
            <th>生产厂家</th>
            <td>{{jl.produce}}</td>
            <th>入库日期</th>
            <td>{{jl.iDate | moment}}</td>
            <th>制造日期</th>
            <td>{{jl.mDate | moment}}</td>
          </tr>
          <tr>
            <th>保证贮存期(月)</th>
            <td>{{jl.kTime}}</td>
            <th>检定日期</th>
            <td>{{jl.lDate | moment}}</td>
            <th>定检周期(月)</th>
            <td>{{jl.dTime}}</td>
          </tr>
          <tr>
            <th>下次检定日期</th>
            <td>{{jl.nDate | moment}}</td>
            <th>最长贮存期(月)</th>
            <td>{{jl.lTime}}</td>
            <th>使用截止日期</th>
            <td>{{jl.jDate | moment}}</td>
          </tr>
          <tr>
            <th>存储架号</th>
            <td>{{jl.jId}}</td>
            <th>库存量(kg)</th>
            <td>{{jl.total}}</td>
            <th>库管员</th>
            <td>{{getWorkUserName(jl.adder)}}</td>
          </tr>


          <tr>
            <th>校对员</th>
            <td>{{getWorkUserName(jl.checker)}}</td>
            <th>备注</th>
            <td>{{jl.comment}}</td>
            <th></th>
            <td></td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper">
        <h1>历史状态</h1>
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
                <option v-for="s in states" :value="$index" v-if="$index > 0">{{s}}</option>
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
          <th>状态</th>
          <th>详情</th>
          <th>时间</th>
          <th>库管员</th>
          <th>校对员</th>
          <th>状态</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list">
          <th scope="row">{{$index + 1}}</th>
          <td>{{getMouldStateName(i.state)}}</td>
          <td>
            <div v-if="i.state === 1">
              <div><strong>库存:</strong>{{i.num}}</div>
            </div>
            <div v-if="i.state === 2">
              <div><strong>任务号:</strong>{{i.tId}}</div>
              <div><strong>图号:</strong>{{i.mId}}</div>
              <div><strong>领料员:</strong>{{getWorkUserName(i.picker)}}</div>
              <div><strong>实发数量:</strong>{{i.num}}</div>
            </div>
            <div v-if="i.state === 3">
              <div><strong>数目:</strong>{{i.num}}</div>
              <div><strong>上次检定日期:</strong>{{i.lDate | moment}}</div>
              <div><strong>变更检定日期:</strong>{{i.cDate | moment}}</div>
            </div>
            <div v-if="i.state === 4">
              <div><strong>图号:</strong>{{i.mId}}</div>
              <div><strong>数目:</strong>{{i.num}}</div>
            </div>
            <div v-if="i.state === 5">
              <div><strong>任务单号:</strong>{{i.tId}}</div>
              <div><strong>材料牌号:</strong>{{i.cId}}</div>
              <div><strong>数目:</strong>{{i.num}}</div>
            </div>
            <div v-if="i.state === 6">
              <div><strong>备注原因:</strong>{{i.reason}}</div>
            </div>
          </td>
          <td>{{i.addDate | moment}}</td>
          <td>{{getWorkUserName(i.adder)}}</td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>{{{getCheckedState(i.checked)}}}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  import {extend, find} from 'lodash';

  import {JL_STATES} from '../utils/constants';

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
        return this.states[state];
      },
      getCheckedState(state){
        if(state === 0) return '<label class="label label-default">待校对</label>';
        if(state === 1) return '<label class="label label-success">已校对</label>';
      },
      /**
       * 搜索
       */
      search(){
        if (this.searching)return;

        var params = {};
        if (this.q.s) params.state = this.q.s;
        if (this.q.st || this.q.et) {
          params.addDate = {};

          if (this.q.st) params.addDate.$gt = this.q.st;
          if (this.q.et) params.addDate.$lt = this.q.et;
        }

        this.fetchData(params);
      },
      fetchData(params){
        var id = this.$route.params.id;

        this.searching = true;
        this.$http.get(`/api/jiaoliaostates`, extend({jlId: id}, params)).then(function (res) {
          this.list = res.data;
          this.searching = false;
        }.bind(this));
      }
    },
    created(){
      var id = this.$route.params.id;

      return Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get(`/api/jiaoliao/${id}`),
        this.$http.get(`/api/jiaoliaostates`, {jlId: id})
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.jl = res[1].data;
        this.list = res[2].data;
        this.loading = false;
      }.bind(this));
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
        states: JL_STATES,    // 胶料状态
        jl: {},               // 模具信息
        workUsers: [],        // 所有员工
        list: []              // 所有数据
      }
    }
  }
</script>