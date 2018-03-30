<style lang="less">

</style>

<template>
  <div>
    <h1>胶料状态申请</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading && list.length">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
          <button class="btn btn-primary btn-sm" @click="popEdit()">申 请</button>
        </div>
      </div>
      <table class="table table-hover table-condensed">
        <thead>
        <tr>
          <th>序号</th>
          <th>入检批次号</th>
          <th>状态</th>
          <th>详情</th>
          <th>时间</th>
          <th>库管员/发料员</th>
          <th>校对员</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.jlId.rId}}</td>
          <td>{{getMouldStateName(i.state)}}</td>
          <td>
            <div v-if="i.state === 2">
              <div><strong>任务号:</strong>{{i.tId}}</div>
              <div><strong>图号:</strong>{{i.mId}}</div>
              <div><strong>领料员:</strong>{{getWorkUserName(i.picker)}}</div>
            </div>
            <div v-if="i.state === 3">
              <div><strong>数目:</strong>{{i.num}}</div>
              <div><strong>上次检定日期:</strong>{{i.lDate | moment}}</div>
              <div><strong>变更检定日期:</strong>{{i.cDate | moment}}</div>
            </div>
            <div v-if="i.state === 4 || i.state === 5">
              <div><strong>数目:</strong>{{i.num}}</div>
            </div>
            <div v-if="i.state === 6">
              <div><strong>备注原因:</strong>{{i.reason}}</div>
            </div>
          </td>
          <td>{{i.addDate | moment}}</td>
          <td>{{getWorkUserName(i.adder)}}</td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>
            <div class="btn-group btn-group-xs">
              <span v-if="i.checked === 0" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>
              <span v-if="i.checked === 0" class="glyphicon glyphicon-trash" @click="popDel(i)"></span>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无状态申请
    </div>
    <modal :title="model._id ? '修改状态':'新增状态'" :show.sync="modalStateShow" effect="fade" cancel-text="取 消" ok-text="确 定"
           :backdrop="false"
           :callback="submit">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">入检批次号</label>
          <div class="col-sm-9">
            <select v-model="model.jlId" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="jl in jls" :value="jl._id">{{jl.rId}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">状态</label>
          <div class="col-sm-9">
            <select v-model="model.state" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="s in states" :value="$index" v-if="$index > 2">{{s}}</option>
            </select>
          </div>
        </div>
        <div class="form-group" v-if="model.state == 3 || model.state == 4 || model.state == 5">
          <label class="col-sm-3 control-label">数量</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.num" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group" v-if="model.state == 6">
          <label class="col-sm-3 control-label">备注原因</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.reason" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">校对员</label>
          <div class="col-sm-9">
            <select v-model="model.checker" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/jiaoliaostatecheck'" :value="wu._id">{{wu.wuName}}</option>
            </select>
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
  import {extend, find, findIndex, cloneDeep} from 'lodash';
  import {modal} from 'vue-strap';

  import {JL_STATES} from '../utils/constants';
  import notify from '../components/notify';

  export default{
    components: {
      modal
    },
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
      popEdit(item){
        this.error = '';
        this.model = cloneDeep(item) || {jlId: '', state: '', checker: ''};

        if (this.model.jlId) {
          this.model.jlId = this.model.jlId._id;
        }

        this.modalStateShow = true;
      },
      valid(){
        if (!this.model.jlId) {
          this.error = '请选择入检批次号';
          return false;
        }

        if (!this.model.state) {
          this.error = '请选择状态';
          return false;
        }

        if ((this.model.state == 3 || this.model.state == 4 || this.model.state == 5) && !this.model.num) {
          this.error = '请输入数目';
          return false;
        }

        if (this.model.state == 6 && !this.model.reason) {
          this.error = '请输入备注原因';
          return false;
        }

        if (!this.model.checker) {
          this.error = '请选择校对员';
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

        if (this.model.state == 3) {
          this.model.lDate = this.jl.lDate;
        }

        if (id) {
          this.$http
                  .put(`/api/jiaoliaostate/${id}`, this.model)
                  .then(function (res) {
                    this.modalStateShow = false;
                    var index = findIndex(this.list, {_id: id});
                    this.list.$set(index, res.data);
                    notify.info('修改成功！');
                  })
                  .catch(error);
        } else {
          this.$http
                  .post('/api/jiaoliaostate', this.model)
                  .then(function (res) {
                    this.modalStateShow = false;
                    this.list.unshift(res.data);
                    notify.info('新增成功！');
                  })
                  .catch(error);
        }

        function error(res) {
          this.error = res.data.error;
        }
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
                .delete(`/api/jiaoliaostate/${this.delModel._id}`)
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
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/jiaoliaostates'),
        this.$http.get('/api/jiaoliaos', {checked: 1})
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.jls = res[2].data;
        this.loading = false;
      }.bind(this));
    },
    watch: {
      'model.jlId'(rId){
        this.jl = find(this.jls, {_id: rId}) || {};
      }
    },
    data(){
      return {
        loading: true,        // 初始化中
        states: JL_STATES,    // 状态
        workUsers: [],        // 所有员工
        model: {},
        jls: [],
        jl: {},
        error: '',
        modalStateShow: false,
        modalDelShow: false,
        delModel: '',
        list: []              // 所有数据
      }
    }
  }
</script>