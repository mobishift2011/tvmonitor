<style lang="less">
  .wp-list {
    margin: 0;
    [type=checkbox] {
      bottom: 5px;
    }
  }

  dl {
    margin-bottom: 15px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .modal-body {
    word-break: break-all;
  }

  .prodprod {
    .form-group {
      margin-bottom: 5px;
    }

    .popover {
      min-width: 200px;
    }

    .popover-content {
      word-break: break-all;
    }
  }
</style>

<template>
  <div class="prodprod">
    <h1>产品工艺</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper clearfix" v-show="!loading && list.length">
      <div class="operation-wrapper row">
        <div class="col-xs-offset-6 col-xs-6">
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
          <th>工序</th>
          <th>图纸/文档</th>
          <th>任务性质</th>
          <th>计算材料数量</th>
          <th>计划员</th>
          <th>校对员</th>
          <th>调度员</th>
          <th>状态</th>
          <th>备注</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'tId' 'ppName'">
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
          <td>
            <a class="file-item" target="_blank" href="/api/file/{{f._id}}" v-for="f in i.files">{{f.name}}</a>
          </td>
          <td>{{i.special}}</td>
          <td>{{i.cNum}}</td>
          <td>{{getWorkUserName(i.planer)}}</td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>{{getWorkUserName(i.dispatcher)}}</td>
          <th>{{{prodState(i,0)}}}</th>
          <td>{{i.prodComment}}</td>
          <td>
            <span v-if="i.state === 0" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无产品工艺
    </div>
    <modal title="产品工艺" :show.sync="modalEditShow" effect="fade" cancel-text="取 消"
           ok-text="确 定" :callback="submit" :backdrop="false">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">计算材料数量</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.cNum" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">校对员</label>
          <div class="col-sm-9">
            <select v-model="model.checker" class="form-control input-sm">
              <option value="">--请选择--</option>
              <option v-for="wu in workUsers | permission '/prodcheck'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">备注</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.prodComment" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
      </div>
    </modal>
    <modal title="警告" :show.sync="modalDelShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="certainDel"
           small>
      <div slot="modal-body" class="modal-body">
        确定删除生产产品“{{delModel.ppName}}”？
      </div>
    </modal>
  </div>
</template>

<script>
  import Vue from 'vue';
  import {cloneDeep, find, includes, findIndex} from 'lodash';
  import {modal} from  'vue-strap';

  import notify from '../components/notify';
  import {prodState} from '../utils/label';

  export default{
    components: {
      modal
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/prodprods')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.loading = false;
      }.bind(this));
    },
    methods: {
      prodState: prodState,
      /**
       * 获取员工名称
       */
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName || '';
      },
      /**
       * 校验提交信息
       * @returns {boolean}
       */
      valid(){

        if (!this.model.cNum) {
          this.error = '请输入计算材料数量';
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
                  .put(`/api/prodprod/${id}`, this.model)
                  .then(function (res) {
                    this.modalEditShow = false;
                    var index = findIndex(this.list, {_id: id});
                    this.list.$set(index, res.data);
                    notify.info('修改成功！');
                  })
                  .catch(error);
        } else {
          this.$http
                  .post('/api/prodprod', this.model)
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

        this.model = cloneDeep(item);
        if (!this.model.checker) {
          Vue.set(this.model, 'checker', '');
        }

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
                .delete(`/api/prodprod/${this.delModel._id}`)
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
        loading: true,                     // 初始化中
        workUsers: [],                     // 所有员工
        modalEditShow: false,              // 弹窗显示
        model: {},                         // 当前新增/修改的model
        list: [],                          // 所有数据
        error: '',                         // 错误信息
        modalDelShow: false,               // 删除弹窗显示
        delModel: '',                      // 当前删除的model
        q: ''                              // 搜索关键词
      }
    }
  }
</script>