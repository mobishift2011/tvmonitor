<style lang="less">

</style>

<template>
  <div class="proce-library">
    <h1>工艺校对</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <table class="table table-hover table-condensed">
        <thead>
        <tr>
          <th>序号</th>
          <th>产品图号</th>
          <th>产品名称</th>
          <th>材料牌号</th>
          <th>工序</th>
          <th>图纸/文档</th>
          <th>技术员</th>
          <th>定额员</th>
          <th>主管</th>
          <th>添加时间</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'mId' 'ppName'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.mId}}</td>
          <td>{{i.ppName}}</td>
          <td>{{i.cId}}</td>
          <td>
            <div v-for="w in i.wp">
              <strong>{{$index+1}}.{{w.title}}</strong>
              <div v-for="c in w.child">{{c.key}}:{{c.value}}</div>
            </div>
          </td>
          <td>
            <a class="file-item" target="_blank" href="/api/file/{{f._id}}" v-for="f in i.files">{{f.name}}</a>
          </td>
          <td>{{getWorkUserName(i.skiller)}}</td>
          <td>{{getWorkUserName(i.quotaer)}}</td>
          <td>{{getWorkUserName(i.manager)}}</td>
          <td>{{i.addDate | moment}}</td>
          <td>{{{proceUsage(i)}}}</td>
          <td>
            <button v-if="i.state === 0" type="button" class="btn btn-primary btn-xs" @click="ok(i)">通过</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  import {find, findIndex} from 'lodash';

  import notify from '../components/notify';
  import {proceUsage} from '../utils/label';

  export default{
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/procelibrarychecks')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.loading = false;
      }.bind(this));
    },
    methods: {
      proceUsage: proceUsage,
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      ok(item){
        this.$http.put(`/api/procelibrarycheck/${item._id}`)
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
    data(){
      return {
        loading: true,        // 初始化中
        workUsers: [],        // 所有员工
        list: [],             // 所有数据
      }
    }
  }
</script>