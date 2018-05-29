<style lang="less">

</style>

<template>
  <div>
    <h1>模具申请</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
          <button class="btn btn-primary btn-sm" @click="popEdit()">申 请</button>
        </div>
        <div class="col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入模具编号、模具名称或者产品图号" v-model="q">
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
          <th>库管员</th>
          <th>状态</th>
          <th>申请时间</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'mId' 'mName' 'mapId'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.mId.moldId}}</td>
          <td>{{i.mId.mId}}</td>
          <td>{{i.mId.mName}}</td>
          <td>{{i.mId.mapId}}</td>
          <td>{{getWorkUserName(i.mId.adder)}}</td>
          <td>{{getMouldStateName(i.state)}}</td>
          <td>{{i.time | moment}}</td>
          <td>
            <!--<span v-if="i.checked === 1" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>-->
            <span v-if="i.checked === 1" class="glyphicon glyphicon-trash" @click="popDel(i)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <modal :title="model._id ? '修改申请': '新增申请'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="submit">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">任务单号</label>
          <div class="col-sm-9">
            <select v-model="model.ppId" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="p in plans" :value="p._id">{{p.tId}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">产品图号</label>
          <div class="col-sm-9">
            <input type="text" disabled :value="selectedPlan.mId" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">模具编号</label>
          <div class="col-sm-9">
            <select v-model="model.mmId" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="m in selectedPlan.mould" :value="m.mId">{{m.mId}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">模具名称</label>
          <div class="col-sm-9">
            <input type="text" disabled :value="selectedMould.mName" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">状态</label>
          <div class="col-sm-9">
            <input type="text" disabled  class="form-control input-sm" value="入库"/>
            <!--<select v-model="model.state" class="form-control input-sm">-->
              <!--<option value="">&#45;&#45;请选择-</option>-->
              <!--<option v-for="s in states" :value="$index + 1" v-if="$index < 2">{{s}}</option>-->
            <!--</select>-->
          </div>
        </div>
      </div>
    </modal>
    <modal title="警告" :show.sync="modalDelShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="certainDel"
           small>
      <div slot="modal-body" class="modal-body">
        确定删除申请？
      </div>
    </modal>
  </div>
</template>

<script>
  import {cloneDeep, includes, find, pick, groupBy, extend, findIndex, uniqBy} from 'lodash';
  import {modal} from 'vue-strap';
  import Vue from 'vue';

  import {MOULD_STATES} from '../utils/constants';
  import notify from '../components/notify';
  import oauth from '../utils/oauth';

  export default{
    components: {
      modal
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/mouldapplys'),
        this.$http.get('/api/moulds', {checkState: 1}),
        this.$http.get('/api/allplans')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.moulds = res[2].data;
        this.plans = res[3].data;

        var plans = [];
        this.plans.forEach(plan => {
          if (plan.picker === this.userInfo._id) {
            plans.push(plan)
          }
        })
        this.plans = plans;
        this.loading = false;
      }.bind(this));
    },
    methods: {
      /**
       * 获取状态名称
       */
      getMouldStateName(state){
        return this.states[state - 1] || '无';
      },
      /**
       * 获取员工信息
       */
      getWorkUserName(wuId){
        return (find(this.workUsers, {_id: wuId}) || {}).wuName;
      },
      /**
       * 校验提交信息
       */
      valid(){
        if (!this.model.mId) {
          this.error = '请选择模具';
          return false;
        }

        if (!this.model.state) {
          this.error = '请选择状态';
          return false;
        }

        this.error = '';
        return true;
      },
      /**
       * 提交信息
       */
      submit(){
        if (!this.valid()) return;

        var id = this.model._id;
        if (id) {
          this.$http
                  .put(`/api/mouldapply/${id}`, {
                    state: this.model.state,
                    oldState: this.selectedMould.state,
                    mId: this.model.mId
                  })
                  .then(function (res) {
                    this.modalEditShow = false;
                    var index = findIndex(this.list, {_id: this.model._id});
                    this.list.$set(index, res.data);
                    notify.info('修改成功！');
                  })
                  .catch(error);
        } else {

          this.$http
                  .post('/api/mouldapply', {
                    tId: this.model.tId,
                    oldState: this.selectedMould.state,
                    checker: this.selectedMould.adder,
                    mId: this.model.mId,
                    state: this.model.state
                  })
                  .then(function (res) {
                    this.modalEditShow = false;
                    this.list.unshift(res.data);
                    notify.info('新增成功！');
                  })
                  .catch(error);
        }

        function error(res) {
          if (res.status === 409) {
            this.error = '检验员未确认上次申请状态';
          } else {
            this.error = '新增失败';
          }
        }
      },
      /**
       * 新增/修改弹出框
       */
      popEdit(){
        this.error = '';
        this.model = {ppId: '', state: 2};
        this.modalEditShow = true;
      },
      /**
       * 删除确认弹出框
       */
      popDel(item){
        this.modalDelShow = true;
        this.delModel = item;
      },
      /**
       * 删除
       */
      certainDel(){
        this.$http
                .delete(`/api/mouldapply/${this.delModel._id}`)
                .then(function () {
                  this.list.$remove(this.delModel);
                  notify.info('删除成功！');
                })
                .catch(function () {
                  notify.error('删除失败！');
                })
                .finally(function () {
                  this.modalDelShow = false;
                });
      }
    },
    data(){
      return {
        userInfo: oauth.getUserInfo(),
        loading: true,                            // 初始化中
        states: MOULD_STATES,                     // 模具状态
        moulds: [],                               // 所有的模具
        plans: [],                                // 所有计划
        selectedMould: {},                        // 选中的模具
        selectedPlan: {},                         // 选中的计划
        workUsers: [],                            // 所有员工
        modalEditShow: false,                     // 弹窗显示
        model: {mmId:''},                         // 当前新增/修改的model
        list: [],                                 // 所有数据
        error: '',                                // 错误信息
        modalDelShow: false,                      // 删除弹窗显示
        delModel: '',                             // 当前删除的model
        q: ''
      }
    },
    watch: {
      'model': {
        handler: function (val) { 
          this.selectedPlan = find(this.plans, {_id: val.ppId}) || {};
          // this.selectedMould = find(this.moulds, {mapId: this.selectedPlan.mId}) || {};
          this.selectedMould = find(this.moulds, {mId: val.mmId}) || {};
          // this.selectedMould._id && Vue.set(this.selectedMould, 'mould', this.selectedPlan.mould)
          this.model.mId = this.selectedMould._id;
          this.model.tId = this.selectedPlan.tId;

          // console.error(this.model.mId);
        },
        deep: true
      }
    }
  } 
</script>