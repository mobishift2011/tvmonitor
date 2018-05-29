<style lang="less">

</style>

<template>
  <div>
    <h1>产品领料</h1>
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
          <th>任务性质</th>
          <th>计算材料数量</th>
          <th>调度员</th>
          <th>班长</th>
          <th>备注</th>
          <th>发料员</th>
          <th>检验员</th>
          <th>状态</th>
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
          <td>{{i.special}}</td>
          <td>{{i.cNum}}</td>
          <td>{{getWorkUserName(i.dispatcher)}}</td>
          <td>{{getWorkUserName(i.grouper)}}</td>
          <td>{{i.prodComment}}</td>
          <td>{{getWorkUserName(i.issuer)}}</td>
          <td>{{getWorkUserName(i.tester)}}</td>
          <td>{{{prodState(i,4)}}}</td>
          <td>
            <span v-if="i.state === 4" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无产品领料
    </div>
    <modal title="领料申请" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :backdrop="false"
           :callback="ok">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-12 control-label" style="text-align: center">胶料</label>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">计算材料数量</label>
          <div class="col-sm-9">
            <input type="number" :value="model.cNum" disabled class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">发料员</label>
          <div class="col-sm-9">
            <select v-model="model.issuer" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/prodissue'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">检验员</label>
          <div class="col-sm-9">
            <select v-model="model.tester" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/prodtest'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
        <!--模具-->
        <div class="form-group">
          <label class="col-sm-12 control-label" style="text-align: center">模具</label>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">任务单号</label>
          <div class="col-sm-9">
            <input type="text" disabled v-model="modelMould.tId" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">产品图号</label>
          <div class="col-sm-9">
            <input type="text" disabled v-model="modelMould.mId" class="form-control input-sm"/>
          </div>
        </div>

        <div class="form-group">
          <label class="col-sm-3 control-label">模具编号</label>
          <div class="col-sm-9">
            <div class="btn-group">
              <button class="btn btn-info mb5" style="margin-bottom: 5px;" @click="onAddTId">增加</button>
              <button class="btn btn-danger" @click="onDeleteAll" type="button">清空</button>
            </div>

            <div class="input-group" v-for="mId in modelMould.mIds" track-by="$index">
              <span class="input-group-addon">{{$index + 1}}</span>

              <!-- <select v-model="tId.tId" @change="tIdChang($event)" class="form-control">
                <option value="">--请选择--</option>
                <option :value="t.tId" :selected="t.tId === tId.tId" :disabled="t.selected === 1"  v-for="t in tasks" >{{t.tId}}</option>
              </select>-->

              <select v-model="mId" class="form-control input-sm">
                <option value="">--请选择-</option>
                <option v-for="p in moulds" :value="p._id">{{p.mId}}</option>
              </select>

              <span class="input-group-btn">
                <button class="btn btn-danger" @click="onDeleteTId($index)" type="button">
                  <span class="glyphicon glyphicon-trash"></span>
                </button>
              </span>
            </div>

            <!--<input type="text" disabled :value="modelMould.mId" class="form-control input-sm"/>-->
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">模具名称</label>
          <div class="col-sm-9">
            <input type="text" disabled v-model="modelMould.mName" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">状态</label>
          <div class="col-sm-9">
            <input type="text" disabled  class="form-control input-sm" value="出库"/>
            <!--<select v-model="modelMould.state" class="form-control input-sm">-->
              <!--<option value="">&#45;&#45;请选择-</option>-->
              <!--<option v-for="s in states" :value="$index + 1" v-if="$index < 2">{{s}}</option>-->
            <!--</select>-->
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">模具库管员</label>
          <div class="col-sm-9">
            <select v-model="modelMould.checker" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/mouldstate'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
      </div>
    </modal>

    <!--模具-->
    <modal title="申请模具" :show.sync="modalMouldShow" effect="fade" cancel-text="取 消" ok-text="确 定" :backdrop="false"
           :callback="okMould">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
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
  import {MOULD_STATES} from '../utils/constants';

  export default{
    components: {
      modal
    },
    watch:{
      'modelMould.mId':function(val){
        this.modelMould.mName = (find(this.moulds, {_id: val}) || {}).mName;
      }
    },
    methods: {
      onDeleteAll() {
        this.modelMould.mIds = [];
        this.error = '';
      },
      onDeleteTId(index) {
        this.modelMould.mIds.splice(index, 1);
        this.error = '';
        // 删除所有之后回复所有可选的任务号
        // if (this.modelMould.mIds.length === 0) {
        //   this.tasks = cloneDeep(this.optionalTsks)
        //   this.firstTask = {};
        // }
      },
      onAddTId() {
        if(this.modelMould.mIds.length < 4 ){
          this.modelMould.mIds.push('');
        }else{
            this.error = '最多添加4个模具编号';
        }
      },
      prodState: prodState,
      /**
       * 获取员工名称
       */
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      valid(){

        if (!this.model.issuer) {
          this.error = '请选择发料员';
          return false;
        }

        if (!this.model.tester) {
          this.error = '请选择校验员';
          return false;
        }
        if (this.modelMould.mIds === 0) {
            this.error = '请选择模具';
            return false;
        }

        if (!this.modelMould.state) {
            this.error = '请选择状态';
            return false;
        }
          if (!this.modelMould.checker) {
              this.error = '请选择库管员';
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
        Vue.set(this.model, 'issuer', this.model.issuer || '');
        Vue.set(this.model, 'tester', this.model.tester || '');

        var mIds = [];
        item.mould.forEach(m => {
          mIds.push(m.mId);
        });

        //模具
        this.modelMould = {mIds:mIds, mId: item.mId, tId:item.tId, cId:item.mId, mName: item.ppName,state:1, checker:''}

        this.$http.get('/api/moulds', {checkState: 1, mapId:item.mId, state: 2})
            .then(function(data){
                this.moulds=data.data;
            }.bind(this))
      },
      /**
       * 通过
       */
      ok(){
        if (!this.valid()) return;
        var index = findIndex(this.list, {_id: this.model._id});
        
        this.$http.put(`/api/prodpick/${this.model._id}`, {
            prod: {
                aNum: this.model.aNum,
                issuer: this.model.issuer,
                tester: this.model.tester,
                mould : this.modelMould.mIds
            },  
            mould:{
                tId: this.modelMould.tId,
                oldState: this.model.state,
                mIds: this.modelMould.mIds,
                state: this.modelMould.state,
                checker:this.modelMould.checker
            }
        })
            .then(function (res) {
              notify.info('操作成功');
              this.list.$set(index, res.data);
              this.modalEditShow = false;
            })
            .catch(function () {
              notify.error('操作失败');
            });
      },
      /**
       * 弹出层
       */
      popEditMould(item){
        this.modalMouldShow = true;

        var mIds = [];
        item.mould.forEach(m => {
          mIds.push(m.mId);
        });
        this.modelMould = {mIds: mIds, mId: item.mId ,tId:item.tId,cId:item.mId,mName:'',state:''}
        this.$http.get('/api/moulds', {checkState: 1,mapId:item.mId})
                .then(function(data){
                  this.moulds=data.data;
                }.bind(this))
      },
    /**
     * 校验提交信息
     */
    validMould(){
      if (this.modelMould.mIds.length === 0) {
        this.error = '请选择模具';
        return false;
      }

      if (!this.modelMould.state) {
        this.error = '请选择状态';
        return false;
      }

      this.errorMould = '';
      return true;
    },
    okMould(){
      if (!this.validMould()) return;
      let _this =this;
      this.$http.post('/api/mouldapply', {
                  tId: _this.modelMould.tId,
                  oldState: _this.model.state,
                  checker: _this.modelMould.adder,
                  mIds: _this.modelMould.mIds,
                  state: _this.modelMould.state
                })
                .then(function (res) {
                    _this.modalMouldShow = false;
                    notify.info('申请成功！');
                })
                .catch(error);
      function error(res) {
        if (res.status === 409) {
            _this.error = '检验员未确认上次申请状态';
        } else {
            _this.error = '申请失败';
        }
      }
    }
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/prodpicks'),
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
        errorMould: '',
        moulds: [],                               // 所有的模具
        plans: [],                                // 所有计划
        modalEditShow: false, // 修改弹窗
        model: {},            // 当前数据信息
        modelMould: {},            // 当前模具数据信息
        workUsers: [],        // 所有员工
        list: [],              // 所有数据
        states: MOULD_STATES,
        modalMouldShow:false,
        q:""
      }
    }
  }
</script>