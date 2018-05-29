<style lang="less">

</style>

<template>
  <div>
    <h1>产品发料</h1>
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
          <th>班长</th>
          <th>备注</th>
          <th>领料员</th>
          <th>入检批次号</th>
          <th>实发数量</th>
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
          <td>{{getWorkUserName(i.grouper)}}</td>
          <td>{{i.prodComment}}</td>
          <td>{{getWorkUserName(i.picker)}}</td>
          <td>{{i.rId}}</td>
          <td>{{i.sNum}}</td>
          <td>{{{prodState(i,4)}}}</td>
          <td>
            <span v-if="i.state === 4 || i.state === 5" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无产品发料
    </div>
    <modal title="发料信息" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :backdrop="false"
           :callback="ok">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">材料牌号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.cId" disabled class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">入检批次号</label>
          <div class="col-sm-9">
            <!--<input type="text" v-model="model.rId" maxlength="50" class="form-control input-sm"/>-->
            <select v-model="model.rId" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="p in pcpList" :value="p.rId" track-by="$index">{{p.rId}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">库存量(kg)</label>
          <div class="col-sm-9">
            <input type="text" v-model="jl.total" disabled class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">计算材料数量</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.cNum" disabled class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">实发数量</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.sNum" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import {find, extend, findIndex, cloneDeep ,filter} from 'lodash';
  import {modal} from  'vue-strap';
  import moment from 'moment';

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
      popEdit(item){
        this.modalEditShow = true;
        this.model = {'rId':'',_id:item._id,cId:item.cId,cNum:item.cNum,sNum:''};
        this.pcpList = filter(this.jls,function (val) {
            return (moment(val.jDate)>new Date())&&(val.pId==item.cId);
        })
      },
      valid(){

        if (!this.model.rId) {
          this.error = '请输入入检批次号';
          return false;
        }

        if (!this.model.sNum) {
          this.error = '请输入实发数量';
          return false;
        }

        if(!this.jl.total || this.jl.total < this.model.sNum){
          this.error = '';
          return false;
        }

        this.error = '';
        return true;
      },
      /**
       * 通过
       */
      ok(){
        if (!this.valid()) return;

        return this.$http.put(`/api/prodissue/${this.model._id}`, {
          rId: this.model.rId,
          lId: this.model.lId,
          sNum: this.model.sNum
        })
                .then(function (res) {
                  notify.info('操作成功');
                  let index = findIndex(this.list, {_id: this.model._id});
                  this.list.$set(index, res.data);
                })
                .catch(function () {
                  notify.error('操作失败');
                })
                .finally(function () {
                  this.modalEditShow = false;
                });
      }
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/prodissues'),
        this.$http.get('/api/jiaoliaos', {checked: 1,total:{ '$ne':0}})
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.jls = res[2].data;
        this.loading = false;
      }.bind(this));
    },
    watch: {
      'model.rId'(rId){
        this.jl = find(this.jls,{rId:rId}) || {};
      }
    },
    data(){
      return {
        loading: true,        // 初始化中
        workUsers: [],        // 所有员工
        modalEditShow: false,
        model: {},
        jls: {},
        jl: {},
        error: '',
        q:'',
        list: [] ,             // 所有数据
          pcpList:[]   //入检批次号列表
      }
    }
  }
</script>