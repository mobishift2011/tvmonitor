<template>
  <div>
    <h1>权限管理</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
          <button class="btn btn-primary btn-sm" @click="popEdit(-1)">新 增</button>
        </div>
        <div class="col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入权限名称" v-model="q">
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
          <th>权限菜单</th>
          <th>添加时间</th>
          <th>添加人</th>
          <th>更新时间</th>
          <th>更新人</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'name'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.name}}</td>
          <td>
            <ul class="list-group">
              <li v-for="p in i.paths" class="list-group-item">{{getMenuTitle(p)}}</li>
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
    <modal :title="model._id ? '修改权限': '新增权限'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="submit">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">权限名称</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.name" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">权限菜单</label>
          <div class="col-sm-9">
            <template v-for="m in menus">
              <div class="checkbox" v-for="c in m.children">
                <label>
                  <input type="checkbox" v-model="model.paths" :value="c.path">{{c.title}}
                </label>
              </div>
            </template>
          </div>
        </div>
      </div>
    </modal>
    <modal title="警告" :show.sync="modalDelShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="certainDel" small>
      <div slot="modal-body" class="modal-body">
        确定删除权限“{{delModel.name}}”？
      </div>
    </modal>
  </div>
</template>

<script>
  import { cloneDeep, includes } from 'lodash';
  import { modal } from 'vue-strap';

  import notify from '../components/notify';
  import menus from '../partials/menus.json';

  export default{
    components: {
      modal
    },
    created(){
      this.$http.get('/api/permissions', function (data) {
        this.list = data;
        this.loading = false;
      });
    },
    methods: {
      /**
       * 获取菜单名称
       */
      getMenuTitle(p){
        var child = {};

        this.menus.some(function (m) {
          return m.children.some(function (c) {
            if (c.path === p) {
              child = c;
              return true;
            }
          });
        });

        return child.title;
      },
      /**
       * 菜单是否选中
       */
      hasSelected(p){
        return includes(this.model.paths, p);
      },
      selectPath(p){
        if (includes(this.model.paths, p)) {
          this.model.paths.$remove(p);
        } else {
          this.model.paths.push(p);
        }
      },
      /**
       * 校验提交信息
       * @returns {boolean}
       */
      valid(){
        if (!this.model.name || !this.model.name.trim()) {
          this.error = '请输入权限名称';
          return false;
        }

        if (!this.model.paths || !this.model.paths.length) {
          this.error = '请选择权限菜单';
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
                  .put(`/api/permission/${id}`, this.model)
                  .then(function (res) {
                    this.modalEditShow = false;
                    this.list.$set(this.cacheIndex, res.data);
                    notify.info('修改成功！');
                  })
                  .catch(error);
        } else {
          this.$http
                  .post('/api/permission', this.model)
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
        this.model = cloneDeep(this.list[index]) || {paths: []};
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
                .delete(`/api/permission/${this.delModel._id}`)
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
        menus: menus,         // 菜单
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