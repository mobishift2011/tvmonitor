<style lang="less">

</style>

<template>
  <div class="proce-library">
    <h1>工艺校对</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-offset-6 col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入产品名称、材料牌号或产品图号" v-model="q">
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
          <th>产品图号</th>
          <th>产品名称</th>
          <th>材料牌号</th>
          <th>工序</th>
          <th>图纸/文档</th>
          <th>工时</th>
          <th>技术员</th>
          <th>定额员</th>
          <th>主管</th>
          <th>添加时间</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'mId' 'ppName' 'cId'">
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
          <td>
            <div v-for="t in i.times">
              <strong>{{$index+1}}.{{t}}</strong>
            </div>
          </td>
          <td>{{getWorkUserName(i.skiller)}}</td>
          <td>{{getWorkUserName(i.quotaer)}}</td>
          <td>{{getWorkUserName(i.manager)}}</td>
          <td>{{i.addDate | moment}}</td>
          <td>{{{proceUsage(i)}}}</td>
          <td>
            <button v-if="i.state === 1" type="button" class="btn btn-primary btn-xs" @click="popEdit(i)">通过</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <modal title="工时" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :backdrop="false"
           :callback="ok">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group" v-for="m in model.wp">
          <label class="col-sm-3 control-label">{{m.title}}</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.times[$index]" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import {find, findIndex, cloneDeep} from 'lodash';
  import {modal} from  'vue-strap';

  import notify from '../components/notify';
  import {proceUsage} from '../utils/label';

  export default{
    components: {
      modal
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/procelibraryquotas')
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
      popEdit(item){
        this.modalEditShow = true;
        this.model = cloneDeep(item);
        this.model.times = [];
      },
      valid(){
        var times = this.model.times;
        if (!times.length || !this.model.wp.every(function (item, index) {
                  return !!times[index];
                })) {
          this.error = '请填写工时';
          return false;
        }

        this.error = '';
        return true;

      },
      ok(){
        if (!this.valid())return;

        this.$http.put(`/api/procelibraryquota/${this.model._id}`, {times: this.model.times})
                .then(function (res) {
                  notify.info('定额成功');
                  let index = findIndex(this.list, {_id: this.model._id});
                  this.list.$set(index, res.data);
                })
                .catch(function () {
                  notify.error('定额失败');
                })
                .finally(function () {
                  this.modalEditShow = false;
                });
      }
    },
    data(){
      return {
        loading: true,        // 初始化中
        workUsers: [],        // 所有员工
        model: {},
        error: '',
        modalEditShow: false,
        list: [],             // 所有数据
        q: ''
      }
    }
  }
</script>