<style lang="less">

</style>

<template>
  <div>
    <h1>胶料试模申请</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
          <!--<button class="btn btn-primary btn-sm" @click="popEdit()">新 增</button>-->
        </div>
        <div class="col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入名称" v-model="q">
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
          <th>名称</th>
          <th>材料牌号</th>
          <th>入检批次号</th>
          <th>炉批号</th>
          <th>单价(元/kg)</th>
          <th>技术条件</th>
          <th>生产厂家</th>
          <th>入库日期</th>
          <th>制造日期</th>
          <th>保证贮存期(月)</th>
          <th>检定日期</th>
          <th>定检周期(月)</th>
          <th>下次检定日期</th>
          <th>最长贮存期(月)</th>
          <th>使用截止日期</th>
          <th>存储架号</th>
          <th>库存量(kg)</th>
          <th>状态</th>
          <th>库管员</th>
          <th>备注</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'jlName'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.jlName}}</td>
          <td>{{i.pId}}</td>
          <td>{{i.rId}}</td>
          <td>{{i.lId}}</td>

          <td>{{i.price}}</td>
          <td>{{i.skill}}</td>
          <td>{{i.produce}}</td>

          <td>{{i.iDate | moment}}</td>
          <td>{{i.mDate | moment}}</td>
          <td>{{i.kTime}}</td>

          <td>
            <label class="label label-danger" v-if="closeTo(i.lDate)">
              {{i.lDate | moment}}
            </label>
            <span v-else>{{i.lDate | moment}}</span>
          </td>
          <td>{{i.dTime}}</td>
          <td>{{i.nDate | moment}}</td>

          <td>{{i.lTime}}</td>
          <td>
            <label class="label label-danger" v-if="closeTo(i.jDate)">
              {{i.jDate | moment}}
            </label>
            <span v-else>{{i.jDate | moment}}</span>
          </td>

          <td>{{i.jId}}</td>
          <td>{{i.total}}</td>
          <td>{{jiaoliaoState(i.state)}}</td>

          <td>{{getWorkUserName(i.jlKeeper)}}</td>
          <td>{{i.comment}}</td>
          <td>
            <!--<span v-if="i.checked === 0" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>-->
            <!--<span class="glyphicon glyphicon-trash" @click="popDel(i)"></span>-->
            <span v-if="i.checked === 1 && i.state !== 6" class="glyphicon glyphicon-plus" @click="popState(i)"></span>
            <!--<a v-if="i.checked === 1" v-link="{path:'/jiaoliao/'+ i._id}"><span-->
                    <!--class="glyphicon glyphicon glyphicon-info-sign"></span></a>-->
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <modal title="试模申请" :show.sync="modalStateShow" effect="fade" cancel-text="取 消" ok-text="确 定"
           :backdrop="false"
           :callback="stateSubmit">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="stateError">
          <span class="glyphicon glyphicon-remove-sign"></span> {{stateError}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">状态</label>
          <div class="col-sm-9">
           <p class="form-control" readonly>试模</p>
          </div>
        </div>
        <div class="form-group" >
          <label class="col-sm-3 control-label">产品图号</label>
          <div class="col-sm-9">
          <input type="text" v-model="model.mId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">数量</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.num" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">胶料库管员</label>
          <div class="col-sm-9">
            <select v-model="model.jlKeeper" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/jiaoliaostatecheck'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import {cloneDeep, find, findIndex} from 'lodash';
  import {modal} from 'vue-strap';
  import moment from 'moment';

  import {jiaoliaoState} from '../utils/label';
  import {JL_STATES} from '../utils/constants';
  import notify from '../components/notify';

  export default{
    components: {
      modal
    },
    created(){
    Promise.all([
      this.$http.get('/api/workusers/field'),
      this.$http.get('/api/jiaoliaos')
    ]).then(function (res) {
      this.workUsers = res[0].data;
      this.list = res[1].data;
      this.loading = false;
    }.bind(this));
  },
  methods: {
    closeTo (date) {
      return moment(date).add(15, 'days').isAfter(moment());
    },
    jiaoliaoState: jiaoliaoState,
            getWorkUserName(id){
      return (find(this.workUsers, {_id: id}) || {}).wuName;
    },
    popState(item){
      this.stateError = '';
      this.model = {jlId: item._id, state: '', jlKeeper: '', lDate: item.lDate};
      this.modalStateShow = true;
    },
    stateValid(){

      if ( !this.model.mId) {
        this.stateError = '请输入产品图号';
        return false;
      }
      if (!this.model.num) {
        this.stateError = '请输入数目';
        return false;
      }

      if (!this.model.jlKeeper) {
        this.stateError = '请选择胶料库管员';
        return false;
      }

      this.stateError = '';
      return true;
    },
    stateSubmit(){
      if (!this.stateValid())return;
      this.model.state=4;
      this.$http
              .post('/api/jiaoliaostate', this.model)
              .then(function () {
                this.modalStateShow = false;
                notify.info('新增成功！');
              })
              .catch(function (res) {
                this.stateError = res.data.error;
              });
    }
  },
  data(){
    return {
      loading: true,        // 初始化中
      workUsers: [],        // 所有员工
      plans: [],            // 所有计划
      modalEditShow: false, // 弹窗显示
      model: {},　　　　　　　// 当前新增/修改的model
      list: [],             // 所有数据
      error: '',            // 错误信息
      modalStateShow: false,
      stateError: '',
      states: JL_STATES,
      q: ''                 // 搜索关键词
    }
  }
  }
</script>