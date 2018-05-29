<style lang="less">

</style>

<template>
  <div>
    <h1>胶料入库校对</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
          <!--<button class="btn btn-primary btn-sm" @click="popEdit()">新 增</button>-->
        </div>
        <div class="col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm"  placeholder="请输入名称、材料牌号或者入检批次" v-model="q">
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
          <th>名称</th>
          <th>牌号</th>
          <th>入检批次号</th>
          <th>炉批号</th>
          <th>单价(元/kg)</th>
          <th>技术条件</th>
          <th>生产厂家</th>
          <th>入库日期</th>
          <th>制造日期</th>
          <th>保证贮存期(月)</th>
          <th>检定日期</th>
          <th>定检周期(月)</th>
          <th>下次检定日期</th>
          <th>最长贮存期(月)</th>
          <th>使用截止日期</th>
          <th>存储架号</th>
          <th>库存量(kg)</th>
          <th>状态</th>
          <th>库管员</th>
          <th>备注</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'jlName' 'pId' 'rId'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.jlName}}</td>
          <td>{{i.pId}}</td>
          <td>{{i.rId}}</td>
          <td>{{i.lId}}</td>

          <td>{{i.price}}</td>
          <td>{{i.skill}}</td>
          <td>{{i.produce}}</td>

          <td>{{i.iDate | moment}}</td>
          <td>{{i.mDate | moment}}</td>
          <td>{{i.kTime}}</td>

          <td>{{i.lDate | moment}}</td>
          <td>{{i.dTime}}</td>
          <td>{{i.nDate | moment}}</td>

          <td>{{i.lTime}}</td>
          <td>{{i.jDate | moment}}</td>

          <td>{{i.jId}}</td>
          <td>{{i.total}}</td>
          <td>{{jiaoliaoState(i.state)}}</td>

          <td>{{getWorkUserName(i.jlKeeper)}}</td>
          <td>{{i.comment}}</td>
          <td>
            <button v-if="i.checked === 0" type="button" class="btn btn-primary btn-xs" @click="ok(i)">通过</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  import {findIndex, find} from 'lodash';

  import {jiaoliaoState} from '../utils/label';
  import notify from '../components/notify';

  export default{
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/jiaoliaochecks')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.loading = false;
      }.bind(this));
    },
    methods: {
      jiaoliaoState:jiaoliaoState,
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      /**
       * 通过
       */
      ok(item){
        this.$http.put(`/api/jiaoliaocheck/${item._id}`)
                .then(function (res) {
                  notify.info('校验成功');
                  let index = findIndex(this.list, item);
                  this.list.$set(index, res.data);
                })
                .catch(function () {
                  notify.error('校验失败');
                });
      }
    },
    data(){
      return {
        loading: true,        // 初始化中
        workUsers: [],        // 所有员工
        list: [],              // 所有数据
        q: ''
      }
    }
  }
</script>