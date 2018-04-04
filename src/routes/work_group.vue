<style lang="less">
  .overscroll {
    overflow-y: auto;
    max-height: 300px;
    border: 1px solid #eeeeee;
    padding: 0 0 5px 5px;

    .checkbox {
      float: left;
      width: 33%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
</style>

<template>
  <div>
    <h1>班组管理</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
          <button class="btn btn-primary btn-sm" @click="popEdit(-1)">新 增</button>
        </div>
        <div class="col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入班组编号或名称" v-model="q">
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
          <th>班组编号</th>
          <th>班组名称</th>
          <th>车间名称</th>
          <th>班长</th>
          <th>指定员工</th>
          <th>添加时间</th>
          <th>添加人</th>
          <th>更新时间</th>
          <th>更新人</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'wgId' 'wgName'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.wgId}}</td>
          <td>{{i.wgName}}</td>
          <td>{{getWorkShopName(i.wsId)}}</td>
          <td>{{getWorkUserName(i.grouper)}}</td>
          <td>
            <ul class="list-group">
              <li class="list-group-item" v-for="wu in i.wus">{{getWorkUserName(wu)}}</li>
            </ul>
          </td>
          <td>{{i.addDate | moment 'YYYY-MM-DD'}}</td>
          <td>{{i.adder.wuName}}</td>
          <td>{{i.updateDate | moment 'YYYY-MM-DD'}}</td>
          <td>{{i.updater.wuName}}</td>
          <td>
            <span class="glyphicon glyphicon-edit" @click="popEdit($index)"></span>
            <span class="glyphicon glyphicon-trash" @click="popDel(i)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <modal :title="model._id ? '修改班组': '新增班组'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定"
           :callback="submit">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">班组编号</label>
          <div class="col-sm-9">
            <input type="text" v-model.trim="model.wgId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">班组名称</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.wgName" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">车间</label>
          <div class="col-sm-9">
            <select v-model="model.wsId" class="form-control input-sm">
              <option value="">--请选择--</option>
              <option v-for="ws in workShops" :value="ws._id">{{ws.wsName}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">班长</label>
          <div class="col-sm-9">
            <select v-model="model.grouper" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="col-sm-3 control-label">选择员工</label>
          <div class="col-sm-9">
            <div class="overscroll">
              <div class="checkbox" v-for="wu in workUsers">
                <label>
                  <input type="checkbox" v-model="model.wus" :value="wu._id">{{wu.wuName}}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </modal>
    <modal title="警告" :show.sync="modalDelShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="certainDel"
           small>
      <div slot="modal-body" class="modal-body">
        确定删除班组“{{delModel.wgName}}”？
      </div>
    </modal>
  </div>
</template>

<script>
  import {cloneDeep, includes, find} from 'lodash';
  import {modal} from 'vue-strap';

  import notify from '../components/notify';

  export default{
    components: {
      modal
    },
    created(){
      Promise.all([
        this.$http.get('/api/workshops'),
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/workgroups')
      ]).then(function (res) {
        this.workShops = res[0].data;
        this.workUsers = res[1].data;
        this.list = res[2].data;
        this.loading = false;
      }.bind(this));
    },
    methods: {
      getWorkShopName(wsId){
        return (find(this.workShops, {_id: wsId}) || {}).wsName;
      },
      getWorkUserName(wuId){
        return (find(this.workUsers, {_id: wuId}) || {}).wuName;
      },
      hasSelected(wuId){
        return includes(this.model.wus, wuId);
      },
      /**
       * 选择员工
       * @returns wu
       */
      toggleSelectWu(wuId){
        if (includes(this.model.wus, wuId)) {
          this.model.wus.$remove(wuId);
        } else {
          this.model.wus.push(wuId);
        }
      },
      /**
       * 校验提交信息
       * @returns {boolean}
       */
      valid(){
        if (!this.model.wgId || !this.model.wgId.trim()) {
          this.error = '请输入班组编号';
          return false;
        }

        if (!this.model.wgName || !this.model.wgName.trim()) {
          this.error = '请输入班组名称';
          return false;
        }

        if (!this.model.wsId) {
          this.error = '请选择车间';
          return false;
        }

        if (!this.model.grouper) {
          this.error = '请选择班长';
          return false;
        }

        if (!this.model.wus.length) {
          this.error = '请选择员工';
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
                  .put(`/api/workgroup/${id}`, this.model)
                  .then(function (res) {
                    this.modalEditShow = false;
                    this.list.$set(this.cacheIndex, res.data);
                    notify.info('修改成功！');
                  })
                  .catch(error);
        } else {
          this.$http
                  .post('/api/workgroup', this.model)
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
        this.model = cloneDeep(this.list[index]) || {wsId: '', wus: [], grouper: ''};
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
                .delete(`/api/workgroup/${this.delModel._id}`)
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
        workShops: [],        // 所有车间
        workUsers: [],        // 所有员工
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