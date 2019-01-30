<style lang="less">

</style>

<template>
  <div>
    <h1>工艺互检</h1>
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
          <th>互检数值</th>
          <th>技术员</th>
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
          <td>
            <div v-for="c in i.cValue">
              {{c}}
            </div>
          </td>
          <td>{{getWorkUserName(i.worker)}}</td>
          <td>{{{proceState(i)}}}</td>
          <td>{{{proceProdState(i)}}}</td>
          <td>
            <span v-if="['一段硫化', '二段硫化'].indexOf(i.wp)> -1 ? i.prodState == 4 : i.state === 0 && i.checker" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无工艺互检
    </div>
    <modal title="互检信息" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :backdrop="false"
           :callback="ok">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group" v-for="w in model.wpc">
          <label class="col-sm-3 control-label">{{w.key}}</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.cValue[$index]" class="form-control">
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import {find, extend, cloneDeep, findIndex} from 'lodash';
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
      /**
       * 获取员工名称
       */
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      /**
       * 弹出层
       */
      popEdit(item){
        this.model = cloneDeep(item);

        if(item.wpc.length){
          this.modalEditShow = true;
        }else{
          this.ok();
        }
      },
      valid(){
        if (!this.model.wpc.every(function (item, index) {
                  return !!this.model.cValue[index];
                }.bind(this))) {
          this.error = '请输入互检数值';
          return false;
        }

        this.error = '';
        return true;
      },
      /**
       * 通过
       */
      ok(){
        if(!this.valid()) return;
        let params={};
        if(this.model.prodState){
            params={
                cValue: this.model.cValue,
                prodState: 5,
                state: 1
            }
        }else{
            params={
                cValue: this.model.cValue
            }
        }
        return this.$http.put(`/api/procecheck/${this.model._id}`, params)
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
        this.$http.get('/api/procechecks')
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