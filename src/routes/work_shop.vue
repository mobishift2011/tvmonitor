<template>
  <div>
    <h1>车间管理</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
          <button class="btn btn-primary btn-sm" @click="popEdit(-1)">新 增</button>
        </div>
        <div class="col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入车间编号或名称" v-model="q">
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
          <th>车间编号</th>
          <th>车间名称</th>
          <th>设备编号</th>
          <th>设备名称</th>
          <th>添加时间</th>
          <th>添加人</th>
          <th>更新时间</th>
          <th>更新人</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'wsId' 'wsName'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.wsId}}</td>
          <td>{{i.wsName}}</td>
          <td>{{i.eqId}}</td>
          <td>{{i.eqName}}</td>
          <td>{{i.addDate | moment}}</td>
          <td>{{i.adder.wuName}}</td>
          <td>{{i.updateDate | moment}}</td>
          <td>{{i.updater.wuName}}</td>
          <td>
            <span class="glyphicon glyphicon-edit" @click="popEdit($index)"></span>
            <span class="glyphicon glyphicon-trash" @click="popDel(i)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <modal :title="model._id ? '修改车间工位': '新增车间工位'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="submit">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">车间编号</label>
          <div class="col-sm-9">
            <input type="text" v-model.trim="model.wsId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">车间名称</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.wsName" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">设备编号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.eqId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">设备名称</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.eqName" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
      </div>
    </modal>
    <modal title="警告" :show.sync="modalDelShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="certainDel" small>
      <div slot="modal-body" class="modal-body">
        确定删除车间“{{delModel.wsName}}”？
      </div>
    </modal>
  </div>
</template>

<script>
  import { clone } from 'lodash';
  import { modal } from 'vue-strap';

  import notify from '../components/notify';

  export default{
    components: {
      modal
    },
    created(){
      this.$http.get('/api/workshops', function (data) {
        this.list = data;
        this.loading = false;
      });
    },
    methods: {
      /**
       * 校验提交信息
       * @returns {boolean}
       */
      valid(){
        if (!this.model.wsId || !this.model.wsId.trim()) {
          this.error = '请输入车间编号';
          return false;
        }

        if (!this.model.wsName || !this.model.wsName.trim()) {
          this.error = '请输入车间名称';
          return false;
        }

        if (!this.model.eqId || !this.model.eqId.trim()) {
          this.error = '请输入设备编号';
          return false;
        }

        if (!this.model.eqName || !this.model.eqName.trim()) {
          this.error = '请输入设备名称';
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
                  .put(`/api/workshop/${id}`, this.model)
                  .then(function (res) {
                    this.modalEditShow = false;
                    this.list.$set(this.cacheIndex, res.data);
                    notify.info('修改成功！');
                  })
                  .catch(error);
        } else {
          this.$http
                  .post('/api/workshop', this.model)
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
       * @param index
       */
      popEdit(index){
        this.error = '';
        this.cacheIndex = index;
        this.model = clone(this.list[index]) || {};
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
                .delete(`/api/workshop/${this.delModel._id}`)
                .then(function () {
                  this.list.$remove(this.delModel);
                  notify.info('删除成功！');
                })
                .catch(function (res) {
                  if (res.status === 409) {
                    notify.error(res.data.error);
                  } else {
                    notify.error('删除失败！');
                  }
                })
                .finally(function () {
                  this.modalDelShow = false;
                });
      }
    },
    data(){
      return {
        loading: true,        // 初始化中
        modalEditShow: false, // 弹窗显示
        model: {},　　　　　　　// 当前新增/修改的model
        list: [],             // 所有数据
        error: '',            // 错误信息
        cacheIndex: -1,       // 当前修改的数据下标
        modalDelShow: false,  // 删除弹窗显示
        delModel: '',         // 当前删除的model
        q: ''                 // 搜索关键词
      }
    }
  }
</script>