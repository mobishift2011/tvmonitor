<style lang="less">

</style>

<template>
  <div>
    <h1>产品班组</h1>
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
          <th>技术员</th>
          <th>校对员</th>
          <th>调度员</th>
          <th>领料员</th>
          <th>状态</th>
          <th>备注</th>
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
          <td>{{getWorkUserName(i.skiller)}}</td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>{{getWorkUserName(i.dispatcher)}}</td>
          <td>{{getWorkUserName(i.picker)}}</td>
          <td>{{{prodState(i,3)}}}</td>
          <td>{{i.prodComment}}</td>
          <td>
            <span v-if="i.state === 3 || i.state === 4" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无产品班组
    </div>
    <modal title="调度信息" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :backdrop="false"
           :callback="ok">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">操作员</label>
          <div class="col-sm-9">
            <select v-model="model.picker" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/prodpick'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import Vue from 'vue';
  import {find, extend, findIndex, cloneDeep} from 'lodash';
  import {modal} from  'vue-strap';

  import notify from '../components/notify';
  import {prodState} from '../utils/label';

  export default{
    components: {
      modal
    },
    methods: {
      prodState: prodState,
      /**
       * 获取员工名称
       */
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      valid(){
        if (!this.model.picker) {
          this.error = '请选择领料员';
          return false;
        }

        this.error = '';
        return true;
      },
      /**
       * 弹出层
       */
      popEdit(item){
        this.modalEditShow = true;
        this.model = cloneDeep(item);
        Vue.set(this.model, 'picker', this.model.picker || '');
      },
      /**
       * 通过
       */
      ok(){
        if (!this.valid()) return;

        var index = findIndex(this.list, {_id: this.model._id});

        return this.$http.put(`/api/prodgroup/${this.model._id}`, {picker: this.model.picker})
                .then(function (res) {
                  notify.info('操作成功');
                  this.list.$set(index, res.data);
                  this.modalEditShow = false;
                })
                .catch(function () {
                  notify.error('操作失败');
                });
      }
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/prodgroups')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.loading = false;
      }.bind(this));
    },
    data(){
      return {
        loading: true,        // 初始化中
        error: '',
        modalEditShow: false, // 修改弹窗
        model: {},            // 当前数据信息
        workUsers: [],        // 所有员工
        list: []              // 所有数据
      }
    }
  }
</script>