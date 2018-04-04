<style lang="less" scoped>
  .prodplan {
    td, th {
      font-size: 12px;
    }
  }
</style>

<template>
  <div class="prodplan">
    <h1>生产计划</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
          <button class="btn btn-primary btn-sm" @click="popEdit()">新 增</button>
        </div>
        <div class="col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入产品名称或任务单号" v-model="q">
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
          <th>任务性质</th>
          <th>开始时间</th>
          <th>交付时间</th>
          <th>技术员</th>
          <th>调度员</th>
          <th>计划进度</th>
          <th>生产数量（个）</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'tId' 'ppName'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.ppName}}</td>
          <td>{{i.tId}}</td>
          <td>{{i.mId}}</td>
          <td>{{i.special}}</td>
          <td>{{i.staTime | moment}}</td>
          <td>{{i.endTime | moment}}</td>
          <td>{{getWorkUserName(i.skiller)}}</td>
          <td>{{getWorkUserName(i.dispatcher)}}</td>
          <td>{{{planState(i)}}}</td>
          <td>{{i.planComment}}</td>
          <td>
            <span class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>
            <span class="glyphicon glyphicon-trash" @click="popDel(i)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <modal :title="model._id ? '修改生产计划': '新增生产计划'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消"
           ok-text="确 定" :callback="submit" :backdrop="false">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">产品名称</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.ppName" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">任务单号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.tId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">产品图号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.mId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">任务性质</label>
          <div class="col-sm-9">
            <select v-model="model.special" class="form-control input-sm">
              <option value="">--请选择--</option>
              <option value="一般">一般</option>
              <option value="指定">指定</option>
              <option value="急件">急件</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">交付时间</label>
          <div class="col-sm-9">
            <date-picker :time.sync="model.endTime | moment"></date-picker>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">技术员</label>
          <div class="col-sm-9">
            <select v-model="model.skiller" class="form-control input-sm">
              <option value="">--请选择--</option>
              <option v-for="wu in workUsers | permission '/prodprod'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">调度员</label>
          <div class="col-sm-9">
            <select v-model="model.dispatcher" class="form-control input-sm">
              <option value="">--请选择--</option>
              <option v-for="wu in workUsers | permission '/proddispatch'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">生产数量（个）</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.planComment" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
      </div>
    </modal>
    <modal title="警告" :show.sync="modalDelShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="certainDel"
           small>
      <div slot="modal-body" class="modal-body">
        确定删除生产计划“{{delModel.ppName}}”？
      </div>
    </modal>
  </div>
</template>

<script>
  import {cloneDeep, find, findIndex} from 'lodash';
  import {modal} from 'vue-strap';

  import {planState} from '../utils/label';
  import notify from '../components/notify';

  export default{
    components: {
      modal
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/prodplans'),
        this.$http.get('/api/procelibrarys', {usage: 1, state: 3})
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.maps = res[2].data;
        this.loading = false;
      }.bind(this));
    },
    methods: {
      planState: planState,
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      /**
       * 校验提交信息
       * @returns {boolean}
       */
      valid(){
        if (!this.model.ppName) {
          this.error = '请输入产品名称';
          return false;
        }

        if (!this.model.tId) {
          this.error = '请输入任务号';
          return false;
        }

        if (!this.model.mId) {
          this.error = '请输入产品图号';
          return false;
        }

        if (!this.model.special) {
          this.error = '请选择任务性质';
          return false;
        }

        if (!this.model.endTime) {
          this.error = '请选择结束时间';
          return false;
        }

        if (!this.model.skiller) {
          this.error = '请选择技术员';
          return false;
        }

        if (!this.model.dispatcher) {
          this.error = '请选择调度员';
          return false;
        }

        var proce = find(this.maps, {mId: this.model.mId});

        if (!proce) {
          this.error = '产品图号输入有误,无法找到对应工序';
          return false;
        }

        this.model.wp = proce.wp;
        this.model.times = proce.times;
        this.model.cId = proce.cId;

        this.model.files = proce.files.map(function (item) {
          return item._id;
        });

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
                  .put(`/api/prodplan/${id}`, this.model)
                  .then(function (res) {
                    this.modalEditShow = false;
                    let index = findIndex(this.list, {_id: id})
                    this.list.$set(index, res.data);
                    notify.info('修改成功！');
                  })
                  .catch(error);
        } else {
          this.$http
                  .post('/api/prodplan', this.model)
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
        this.model = cloneDeep(item) || {skiller: '', dispatcher: '', special: ''};
        this.modalEditShow = true;
      },
      /**
       * 删除确认弹出框
       * @param model
       */
      popDel(model){
        this.modalDelShow = true;
        this.delModel = model;
      },
      /**
       * 删除
       */
      certainDel(){
        this.$http
                .delete(`/api/prodplan/${this.delModel._id}`)
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
        loading: true,        // 初始化中
        workUsers: [],        // 所有员工
        modalEditShow: false, // 弹窗显示
        model: {},　　　　　　　// 当前新增/修改的model
        list: [],             // 所有数据
        maps: [],             // 所有图号
        error: '',            // 错误信息
        modalDelShow: false,  // 删除弹窗显示
        delModel: '',         // 当前删除的model
        q: ''                 // 搜索关键词
      }
    }
  }
</script>