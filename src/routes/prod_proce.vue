<style lang="less">

</style>

<template>
  <div>
    <h1>工序步骤</h1>
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
          <th>工时</th>
          <th>自检数值</th>
          <th>互检员</th>
          <th>检验员</th>
          <th>状态</th>
          <th>硫化状态</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'tId' 'ppName' 'mId'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.ppId.ppName}}</td>
          <td>{{i.ppId.tId}}</td>
          <td>{{i.ppId.mId}}</td>
          <td>
            <strong>{{i.wp}}</strong>
            <div v-for="w in i.wpc">{{w.key}}:{{w.value}}</div>
          </td>
          <td>{{i.time}}</td>
          <td>
            <div v-for="s in i.sValue">
              {{s}}
            </div>
          </td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>{{getWorkUserName(i.tester)}}</td>
          <td>{{{proceState(i)}}}</td>
          <td>{{{proceProdState(i)}}}</td>
          <td>
            <span v-if="showEdit(i)" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无工艺列表
    </div>
    <modal title="自检信息" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :backdrop="false"
           :callback="ok">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group" v-for="w in model.wpc">
          <label class="col-sm-3 control-label">{{w.key}}</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.sValue[$index]" class="form-control">
          </div>
        </div>

        <div class="form-group" v-if="model.wpc && model.wpc.length">
          <label class="col-sm-3 control-label">互检员</label>
          <div class="col-sm-9">
            <select v-model="model.checker" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/procecheck'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">检验员</label>
          <div class="col-sm-9">
            <select v-model="model.tester" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/procetest'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import Vue from 'vue';
  import {find, extend, cloneDeep, findIndex, indexOf, groupBy} from 'lodash';
  import {modal} from  'vue-strap';

  import {proceState,proceProdState} from '../utils/label';
  import notify from '../components/notify';

  export default{
    components: {
      modal
    },
    methods: {
      proceState: proceState,
      proceProdState:proceProdState,
      showEdit(item){
        //硫化结束后的自检
        if (item.prodState === 3 && item.checked === 0) return true;
        if (item.state !== 0 || item.ppId.state !== 6)return false;

        var list = this.list.filter(function (i) {
          return i.ppId.ppId === item.ppId.ppId;
        });

        var prevWp = find(list, {index: item.index - 1});
        if (!prevWp) return true;
        if (prevWp.state === 2) return true;

        return false;
      },
      /**
       * 获取员工名称
       */
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      valid(){
        if (!this.model.wpc.every(function (item, index) {
                  return !!this.model.sValue[index];
                }.bind(this))) {
          this.error = '请输入自检数值';
          return false;
        }

        if (this.model.wpc && this.model.wpc.length && !this.model.checker) {
          this.error = '请选择互检员';
          return false;
        }

        if (!this.model.tester) {
          this.error = '请选择检验员';
          return false;
        }

        this.error = '';
        return true;
      },
      /**
       * 弹出层
       */
      popEdit(item){
        this.error = '';
        this.modalEditShow = true;
        this.model = cloneDeep(item);

        if (!this.model.checker) {
          Vue.set(this.model, 'checker', '');
        }

        if (!this.model.tester) {
          Vue.set(this.model, 'tester', '');
        }

      },
      /**
       * 通过
       */
      ok(){
        if (!this.valid())return;
        let params={};
        if(this.model.prodState){
            params={
                sValue: this.model.sValue,
                checker: this.model.checker,
                tester: this.model.tester,
                prodState: 4,
            }
        }else{
            params={
                sValue: this.model.sValue,
                checker: this.model.checker,
                tester: this.model.tester,
                state: (this.model.wpc && this.model.wpc.length) ? 0 : 1
            }
        }
        return this.$http.put(`/api/prodproce/${this.model._id}`, params)
                .then(function (res) {
                  notify.info('操作成功');
                  var index = findIndex(this.list, {_id: this.model._id});
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
        this.$http.get('/api/prodproces')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.loading = false;
      }.bind(this));
    },
    data(){
      return {
        loading: true,        // 初始化中
        modalEditShow: false, // 修改弹层
        error: '',
        model: {},            // 当前修改的model
        workUsers: [],        // 所有员工
        list: [],              // 所有数据
        q:''
      }
    }
  }
</script>