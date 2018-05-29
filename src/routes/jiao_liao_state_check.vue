<style lang="less">

</style>

<template>
  <div>
    <h1>胶料状态校对</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading && list.length">
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
          <th>入检批次号</th>
          <th>状态</th>
          <th>详情</th>
          <th>时间</th>
          <th>库管员</th>
          <th>校对员</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'jlName' 'pId' 'rId'">
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
          <td>{{getWorkUserName(i.jlKeeper)}}</td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>
            <div class="btn-group btn-group-xs">
              <button v-if="i.checked === 0" type="button" class="btn btn-primary btn-xs" @click="popEdit(i)">通过
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无状态校对
    </div>
    <modal title="状态信息" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :backdrop="false"
           :callback="certain">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">检定日期</label>
          <div class="col-sm-9">
            <date-picker :time.sync="model.cDate | moment"></date-picker>
          </div>
        </div>
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
        if (item.state == 3) {
          this.model = {id: item._id};
          this.modalEditShow = true;
        } else {
          this.ok(item._id);
        }
      },
      valid(){
        if (!this.model.cDate) {
          this.error = '请输入检定日期';
          return false;
        }

        this.error = '';
        return true;
      },
      certain(){
        if (!this.valid()) return;

        this.ok(this.model.id, {cDate: this.model.cDate});
      },
      ok(id, data){
        this.$http.put(`/api/jiaoliaostatecheck/${id}`, data || {})
                .then(function (res) {
                  notify.info('校对成功');
                  let index = findIndex(this.list, {_id: id});
                  this.list.$set(index, res.data);
                })
                .catch(function () {
                  notify.error('校对失败');
                })
                .finally(function () {
                  this.modalEditShow = false;
                });
      }
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/jiaoliaostatechecks')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data.filter(function (item) {
          return item.state > 2;
        });
        this.loading = false;
      }.bind(this));
    },
    data(){
      return {
        loading: true,        // 初始化中
        states: JL_STATES,    // 状态
        workUsers: [],        // 所有员工
        model: {},
        modalEditShow: false,
        error: '',
        list: [],              // 所有数据
        q: ''
      }
    }
  }
</script>