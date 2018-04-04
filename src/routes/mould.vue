<style lang="less">
  .state-list {
    list-style: none;
    padding: 0;
    text-align: center;
    overflow: auto;
    max-height: 500px;

    li {
      padding: 5px;
    }
  }

  .state-empty {
    text-align: center;
    padding: 20px;
  }
</style>

<template>
  <div>
    <h1>模具列表</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
          <button class="btn btn-primary btn-sm" @click="popEdit()">新 增</button>
        </div>
        <div class="col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入模具编号或名称" v-model="q">
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
          <th>形状</th>
          <th>标准尺寸</th>
          <th>产品尺寸</th>
          <th>使用胶料</th>
          <th>模具数量</th>
          <th>模腔数量</th>
          <th>可用模腔数量</th>
          <th>累计产量</th>
          <th>状态</th>
          <th>库管员</th>
          <th>校对员</th>
          <th>添加时间</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'mId' 'mName'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.moldId}}</td>
          <td>{{i.mId}}</td>
          <td>{{i.mName}}</td>
          <td>{{i.mapId}}</td>
          <td>{{i.shape}}</td>
          <td>{{i.sSize}}</td>
          <td>{{i.size}}</td>
          <td>{{i.rubber}}</td>
          <td>{{i.mNum}}</td>
          <td>{{i.cNum}}</td>
          <td>{{i.ccNum}}</td>
          <td>{{i.total}}</td>
          <td>{{getMouldStateName(i.state)}}</td>
          <td>{{getWorkUserName(i.adder)}}</td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>{{i.addDate | moment}}</td>
          <td>
            <span v-if="i.checkState === 0" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>
            <span class="glyphicon glyphicon-trash" @click="popDel(i)"></span>
            <span v-if="i.checkState === 1" class="glyphicon glyphicon-plus" @click="popState(i)"></span>
            <a v-if="i.checkState === 1" v-link="{path:'/mould/state/'+ i._id}">
              <span class="glyphicon glyphicon-info-sign"></span>
            </a>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <modal :title="model._id ? '修改模具': '新增模具'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定"
           :callback="submit">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">模架编号</label>
          <div class="col-sm-9">
            <input type="text" v-model.trim="model.moldId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">模具编号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.mId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">模具名称</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.mName" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">产品图号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.mapId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">形状</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.shape" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">标准尺寸</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.sSize" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">产品尺寸</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.size" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">使用胶料</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.rubber" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">模具数量</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.mNum" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">模腔数量</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.cNum" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">可用模腔数量</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.ccNum" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">校对员</label>
          <div class="col-sm-9">
            <select v-model="model.checker" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/mouldcheck'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
      </div>
    </modal>
    <modal title="警告" :show.sync="modalDelShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="certainDel"
           small>
      <div slot="modal-body" class="modal-body">
        确定删除模具“{{delModel.mName}}”？
      </div>
    </modal>
    <modal title="修改状态" :show.sync="modalStateShow" effect="fade" cancel-text="取 消" ok-text="确 定" :backdrop="false"
           :callback="certainState">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">状态</label>
          <div class="col-sm-9">
            <select v-model="model.state" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="s in states" :value="$index + 1" v-if="$index > 1">{{s}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">检验员</label>
          <div class="col-sm-9">
            <select v-model="model.checker" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/mouldstate'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import {cloneDeep, includes, find, pick, groupBy, extend, findIndex} from 'lodash';
  import {modal} from 'vue-strap';

  import {MOULD_STATES} from '../utils/constants';
  import notify from '../components/notify';

  export default{
    components: {
      modal
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/moulds')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
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
       * 校验提交状态信息
       */
      validState(){
        if (!this.model.state) {
          this.error = '请选择状态';
          return false;
        }

        if (!this.model.checker) {
          this.error = '请选择检验员';
          return false;
        }

        this.error = '';
        return true;
      },
      /**
       * 修改状态弹出层
       */
      popState(item){
        this.error = '';
        this.modalStateShow = true;
        this.model = {
          checker: '',
          oldState: item.state,
          state: item.state,
          mId: item._id
        };
      },
      /**
       * 修改状态
       */
      certainState(){
        if (!this.validState()) return;

        this.$http.post('/api/mould/state', this.model)
                .then(function () {
                  notify.info('新增成功');
                  this.modalStateShow = false;
                })
                .catch(function (res) {
                  if (res.status === 409) {
                    this.error = '检验员还没有确认上次修改的状态';
                  } else {
                    this.error = '新增失败';
                  }
                });
      },
      /**
       * 校验提交信息
       * @returns {boolean}
       */
      valid(){
        if (!this.model.moldId) {
          this.error = '请输入模架编号';
          return false;
        }

        if (!this.model.mId) {
          this.error = '请输入模具编号';
          return false;
        }

        if (!this.model.mName) {
          this.error = '请输入模具名称';
          return false;
        }

        if (!this.model.mapId) {
          this.error = '请输入产品图号';
          return false;
        }

        if (!this.model.shape) {
          this.error = '请输入形状';
          return false;
        }

        if (!this.model.sSize) {
          this.error = '请输入标准尺寸';
          return false;
        }

        if (!this.model.size) {
          this.error = '请输入产品尺寸';
          return false;
        }

        if (!this.model.rubber) {
          this.error = '请输入使用胶料';
          return false;
        }

        var mNum = parseFloat(this.model.mNum);
        if (isNaN(mNum) || typeof(mNum) !== 'number') {
          this.error = '请输入模具数量';
          return false;
        }

        var cNum = parseFloat(this.model.cNum);
        if (isNaN(cNum) || typeof(parseFloat(cNum)) !== 'number') {
          this.error = '请输入模腔数量';
          return false;
        }

        if (!this.model.ccNum) {
          this.error = '请输入可用模腔数量';
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
        if (id) {
          this.$http
                  .put(`/api/mould/${id}`, this.model)
                  .then(function (res) {
                    this.modalEditShow = false;
                    var index = findIndex(this.list, {_id: this.model._di});
                    this.list.$set(index, res.data);
                    notify.info('修改成功！');
                  })
                  .catch(error);
        } else {
          this.$http
                  .post('/api/mould', this.model)
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
        if (item) {
          this.model = cloneDeep(item);
        } else {
          this.model = {checker: ''};
        }

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
                .delete(`/api/mould/${this.delModel._id}`)
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
        loading: true,                            // 初始化中
        states: MOULD_STATES,                     // 模具状态
        stateList: [],                            // 模具状态历史记录
        workUsers: [],                            // 所有员工
        selectedProd: {},                         // 选中的产品
        modalEditShow: false,                     // 弹窗显示
        modalStateShow: false,                    // 状态弹窗
        model: {},                                // 当前新增/修改的model
        list: [],                                 // 所有数据
        error: '',                                // 错误信息
        modalDelShow: false,                      // 删除弹窗显示
        delModel: '',                             // 当前删除的model
        q: ''                                     // 搜索关键词
      }
    }
  }
</script>