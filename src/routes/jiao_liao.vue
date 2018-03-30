<style lang="less">

</style>

<template>
  <div>
    <h1>胶料库</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
          <button class="btn btn-primary btn-sm" @click="popEdit()">入 库</button>
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
          <th>校对员</th>
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

          <td>{{getWorkUserName(i.checker)}}</td>
          <td>{{i.comment}}</td>
          <td>
            <span v-if="i.checked === 0" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>
            <span class="glyphicon glyphicon-trash" @click="popDel(i)"></span>
            <span v-if="i.checked === 1 && i.state !== 6" class="glyphicon glyphicon-plus" @click="popState(i)"></span>
            <a v-if="i.checked === 1" v-link="{path:'/jiaoliao/'+ i._id}"><span
                    class="glyphicon glyphicon glyphicon-info-sign"></span></a>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <modal :title="model._id ? '修改胶料': '新增胶料'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消"
           ok-text="确 定" :callback="submit" :backdrop="false">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">名称</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.jlName" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">材料牌号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.pId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">入检批次号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.rId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">炉批号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.lId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">单价(元/kg)</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.price" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">技术条件</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.skill" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">生产厂家</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.produce" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">入库日期</label>
          <div class="col-sm-9">
            <date-picker :time.sync="model.iDate | moment"></date-picker>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">制造日期</label>
          <div class="col-sm-9">
            <date-picker :time.sync="model.mDate | moment"></date-picker>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">保证贮存期(月)</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.kTime" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">定检周期(月)</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.dTime" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">最长贮存期(月)</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.lTime" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">存储架号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.jId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">入库数量</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.total" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">校对员</label>
          <div class="col-sm-9">
            <select v-model="model.checker" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/jiaoliaocheck'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">备注</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.comment" class="form-control input-sm"/>
          </div>
        </div>
      </div>
    </modal>
    <modal title="警告" :show.sync="modalDelShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="certainDel"
           small>
      <div slot="modal-body" class="modal-body">
        确定删除胶料“{{delModel.jlName}}”？
      </div>
    </modal>
    <modal title="状态申请" :show.sync="modalStateShow" effect="fade" cancel-text="取 消" ok-text="确 定"
           :backdrop="false"
           :callback="stateSubmit">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="stateError">
          <span class="glyphicon glyphicon-remove-sign"></span> {{stateError}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">状态</label>
          <div class="col-sm-9">
            <select v-model="model.state" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="s in states" :value="$index" v-if="$index==3||$index==6">{{s}}</option>
            </select>
          </div>
        </div>
        <!--<div class="form-group" v-if="model.state == 4">-->
          <!--<label class="col-sm-3 control-label">图号</label>-->
          <!--<div class="col-sm-9">-->
            <!--<input type="text" v-model="model.mId" maxlength="50" class="form-control input-sm"/>-->
          <!--</div>-->
        <!--</div>-->
        <!--<div class="form-group" v-if="model.state == 5">-->
          <!--<label class="col-sm-3 control-label">任务单号</label>-->
          <!--<div class="col-sm-9">-->
            <!--<input type="text" v-model="model.tId" maxlength="50" class="form-control input-sm"/>-->
          <!--</div>-->
        <!--</div>-->
        <div class="form-group" v-if="model.state == 3">
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
      /**
       * 校验提交信息
       * @returns {boolean}
       */
      valid(){
        if (!this.model.jlName) {
          this.error = '请输入名称';
          return false;
        }

        if (!this.model.pId) {
          this.error = '请输入牌号';
          return false;
        }

        if (!this.model.rId) {
          this.error = '请输入入检批次号';
          return false;
        }

        if (!this.model.lId) {
          this.error = '请输入炉批号';
          return false;
        }

        if (!this.model.price) {
          this.error = '请输入单价';
          return false;
        }

        if (!this.model.skill) {
          this.error = '请输入技术条件';
          return false;
        }

        if (!this.model.produce) {
          this.error = '请输入生产厂家';
          return false;
        }

        if (!this.model.iDate) {
          this.error = '请输入入库日期';
          return false;
        }

        if (!this.model.mDate) {
          this.error = '请输入制造日期';
          return false;
        }

        if (!this.model.kTime) {
          this.error = '请输入保证贮存期';
          return false;
        }

        if (!this.model.dTime) {
          this.error = '请输入定检周期';
          return false;
        }

        if (!this.model.lTime) {
          this.error = '请输入最长贮存期';
          return false;
        }

        if (!this.model.jId) {
          this.error = '请输入存储架号';
          return false;
        }

        if (!this.model.total) {
          this.error = '请输入库存量';
          return false;
        }

        if (!this.model.checker) {
          this.error = '请选择校对员';
          return false;
        }

        this.model.lDate = moment(this.model.iDate).add(this.model.kTime, 'month').valueOf();
        this.model.nDate = moment(this.model.lDate).add(this.model.dTime, 'month').valueOf();
        this.model.jDate = moment(this.model.mDate).add(this.model.lTime, 'month').valueOf();

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
                  .put(`/api/jiaoliao/${id}`, this.model)
                  .then(function (res) {
                    this.modalEditShow = false;
                    var index = findIndex(this.list, {_id: id});
                    this.list.$set(index, res.data);
                    notify.info('修改成功！');
                  })
                  .catch(error);
        } else {
          this.$http
                  .post('/api/jiaoliao', this.model)
                  .then(function (res) {
                    this.modalEditShow = false;
                    this.list.unshift(res.data);
                    notify.info('新增成功！');
                  })
                  .catch(error);
        }

        function error(res) {
          if (res.status === 400) {
            this.error = res.data.error;
          }
        }
      },
      /**
       * 新增/修改弹出框
       */
      popEdit(item){
        this.error = '';
        this.model = cloneDeep(item) || {checker: ''};
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
                .delete(`/api/jiaoliao/${this.delModel._id}`)
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
      },
      popState(item){
        this.stateError = '';
        this.model = {jlId: item._id, state: '', checker: '', lDate: item.lDate};
        this.modalStateShow = true;
      },
      stateValid(){
        if (!this.model.state) {
          this.stateError = '请选择状态';
          return false;
        }

        if (this.model.state == 4 && !this.model.mId) {
          this.stateError = '请输入图号';
          return false;
        }

        if (this.model.state == 5 && !this.model.tId) {
          this.stateError = '请输入任务单号';
          return false;
        }

        if ((this.model.state == 3 || this.model.state == 4 || this.model.state == 5) && !this.model.num) {
          this.stateError = '请输入数目';
          return false;
        }

        if (this.model.state == 6 && !this.model.reason) {
          this.stateError = '请输入备注原因';
          return false;
        }

        if (!this.model.checker) {
          this.stateError = '请选择校对员';
          return false;
        }

        this.stateError = '';
        return true;
      },
      stateSubmit(){
        if (!this.stateValid())return;

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
        modalDelShow: false,  // 删除弹窗显示
        delModel: '',         // 当前删除的model
        states: JL_STATES,
        q: ''                 // 搜索关键词
      }
    }
  }
</script>