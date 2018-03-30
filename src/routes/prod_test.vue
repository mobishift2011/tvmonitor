<style lang="less">

</style>

<template>
  <div>
    <h1>材料检验</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading && list.length">
      <table class="table table-hover table-condensed">
        <thead>
        <tr>
          <th>序号</th>
          <th>产品名称</th>
          <th>任务单号</th>
          <th>产品图号</th>
          <th>工序</th>
          <th>任务性质</th>
          <th>计算材料数量</th>
          <th>班长</th>
          <th>备注</th>
          <th>领料员</th>
          <th>发料员</th>
          <th>入检批次号</th>
          <th>实发数量</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.ppName}}</td>
          <td>{{i.tId}}</td>
          <td>{{i.mId}}</td>
          <td>
            <div v-for="w in i.wp">
              <strong>{{$index + 1}}.{{w.title}}</strong>
              <div v-for="c in w.child">{{c.key}}:{{c.value}}</div>
            </div>
          </td>
          <td>{{i.special}}</td>
          <td>{{i.cNum}}</td>
          <td>{{getWorkUserName(i.grouper)}}</td>
          <td>{{i.prodComment}}</td>
          <td>{{getWorkUserName(i.picker)}}</td>
          <td>{{getWorkUserName(i.issuer)}}</td>
          <td>{{i.rId}}</td>
          <td>{{i.sNum}}</td>
          <td>{{{prodState(i,5)}}}</td>
          <td>
            <button v-if="i.state === 5" type="button" class="btn btn-primary btn-xs" @click="ok(i)">通过</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无产品校验
    </div>
  </div>
</template>

<script>
  import {find, extend, findIndex} from 'lodash';
  import {modal} from  'vue-strap';

  import notify from '../components/notify';
  import {prodState} from '../utils/label';

  export default{
    components: {
      modal
    },
    methods: {
      prodState:prodState,
      /**
       * 获取员工名称
       */
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      /**
       * 通过
       */
      ok(item){
        return this.$http.put(`/api/prodtest/${item._id}`)
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
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/prodtests')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.loading = false;
      }.bind(this));
    },
    data(){
      return {
        loading: true,        // 初始化中
        workUsers: [],        // 所有员工
        list: []              // 所有数据
      }
    }
  }
</script>