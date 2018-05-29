<style lang="less">

</style>

<template>
  <div>
    <h1>工艺审核</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading && list.length">
      <div class="operation-wrapper row">
        <div class="col-xs-offset-6 col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入产品名称、任务单号或产品图号" v-model="q">
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
          <th>产品名称</th>
          <th>任务单号</th>
          <th>产品图号</th>
          <th>工序</th>
          <th>图纸/文档</th>
          <th>任务性质</th>
          <th>计算材料数量</th>
          <th>计划员</th>
          <th>技术员</th>
          <th>调度员</th>
          <th>状态</th>
          <th>备注</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'tId' 'ppName' 'mId'">
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
          <td>
            <a class="file-item" target="_blank" href="/api/file/{{f._id}}" v-for="f in i.files">{{f.name}}</a>
          </td>
          <td>{{i.special}}</td>
          <td>{{i.cNum}}</td>
          <td>{{getWorkUserName(i.planer)}}</td>
          <td>{{getWorkUserName(i.skiller)}}</td>
          <td>{{getWorkUserName(i.dispatcher)}}</td>
          <td>{{{prodState(i,0)}}}</td>
          <td>{{i.prodComment}}</td>
          <td>
            <button v-if="i.state === 0" type="button" class="btn btn-primary btn-xs" @click="ok(i)">通过</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无产品校对
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
        return this.$http.put(`/api/prodcheck/${item._id}`)
                .then(function (res) {
                  notify.info('校对成功');
                  let index = findIndex(this.list, item);
                  this.list.$set(index, res.data);
                })
                .catch(function () {
                  notify.error('校对失败');
                });
      }
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/prodchecks')
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
        list: [],              // 所有数据
        q:""
      }
    }
  }
</script>