<style lang="less">

</style>

<template>
  <div>
    <h1>模具校对</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading && list.length">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
        </div>
        <div class="col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入模具编号、名称或者产品图号" v-model="q">
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
          <th>模架号</th>
          <th>模具号</th>
          <th>模具名称</th>
          <th>产品图号</th>
          <th>形状</th>
          <th>标准尺寸</th>
          <th>产品尺寸</th>
          <th>使用胶料</th>
          <th>模具数量</th>
          <th>模腔数量</th>
          <th>可用模腔数量</th>
          <th>库管员</th>
          <th>添加时间</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'mId' 'mName' 'mapId'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.moldId}}</td>
          <td>{{i.mId}}</td>
          <td>{{i.mName}}</td>
          <td>{{i.mapId}}</td>
          <td>{{i.shape}}</td>
          <td>{{i.sSize}}</td>
          <td>{{i.size}}</td>
          <td>{{i.rubber}}</td>
          <td>{{i.mNum}}</td>
          <td>{{i.cNum}}</td>
          <td>{{i.ccNum}}</td>
          <td>{{getWorkUserName(i.adder)}}</td>
          <td>{{i.addDate | moment}}</td>
          <td>
            <button v-if="i.checkState === 0" type="button" class="btn btn-primary btn-xs" @click="ok(i)">通过</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无模具校对
    </div>
  </div>
</template>

<script>
  import {cloneDeep, includes, find, pick, groupBy, extend} from 'lodash';
  import {modal} from 'vue-strap';

  import {MOULD_STATES} from '../utils/constants';
  import notify from '../components/notify';

  export default{
    components: {
      modal
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/mouldchecks')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.loading = false;
      }.bind(this));
    },
    methods: {
      /**
       * 获取员工信息
       */
      getWorkUserName(wuId){
        return (find(this.workUsers, {_id: wuId}) || {}).wuName;
      },
      /**
       * 通过
       */
      ok(item){
        this.$http.put(`/api/mouldcheck/${item._id}`)
                .then(function () {
                  item.checkState = 1;
                  notify.info('校对成功');
                })
                .catch(function () {
                  notify.error('校对失败');
                });
      }
    },
    data(){
      return {
        loading: true,                            // 初始化中
        states: MOULD_STATES,                     // 模具状态
        workUsers: [],                            // 所有员工
        list: [],                                 // 所有数据
        q:''
      }
    }
  }
</script>