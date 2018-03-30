<template>
  <div>
    <h1>员工管理</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
          <button class="btn btn-primary btn-sm" @click="popEdit(-1)">新 增</button>
        </div>
        <div class="col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入员工工号或名称" v-model="q">
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
          <th>工号</th>
          <th>密码</th>
          <th>名称</th>
          <th>岗位</th>
          <th>性别</th>
          <th>状态</th>
          <th>添加时间</th>
          <th>添加人</th>
          <th>更新时间</th>
          <th>更新人</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'wuId' 'wuName'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.wuId}}</td>
          <td>
            <span title="显示密码" class="glyphicon glyphicon-eye-open" @click="i.showPassword = !i.showPassword"></span>
            <span v-if="i.showPassword">{{i.password}}</span>
            <span v-else>*************</span>
          </td>
          <td>{{i.wuName}}</td>
          <td>{{getPermissionName(i.permission)}}</td>
          <td>{{i.gender | gender}}</td>
          <td>{{{getUserStateName(i.flag)}}}</td>
          <td>{{i.addDate | moment 'YYYY-MM-DD'}}</td>
          <td>{{i.adder.wuName}}</td>
          <td>{{i.updateDate | moment 'YYYY-MM-DD'}}</td>
          <td>{{i.updater.wuName}}</td>
          <td>
            <span class="glyphicon glyphicon-edit" @click="popEdit($index)"></span>
            <span v-if="userInfo.wuId === 'root'" class="glyphicon glyphicon-trash" @click="popDel(i)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <modal :title="model._id ? '修改员工': '新增员工'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定"
           :callback="submit">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">员工工号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.wuId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">登陆密码</label>
          <div class="col-sm-9">
            <input type="password" v-model="model.password" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">员工名称</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.wuName" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">员工岗位</label>
          <div class="col-sm-9">
            <select v-model="model.permission" class="form-control input-sm">
              <option value="">--请选择--</option>
              <option v-for="p in permissions" :value="p._id">{{p.name}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">员工状态</label>
          <div class="col-sm-9">
            <select v-model="model.flag" class="form-control input-sm">
              <option value="1">在职</option>
              <option value="0">离职</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">性别</label>
          <div class="col-sm-9">
            <div class="radio">
              <label>
                <input type="radio" style="opacity: 1;z-index: 100" v-model="model.gender" value="1"> 男
              </label>
              <label>
                <input type="radio" style="opacity: 1;z-index: 100"  v-model="model.gender" value="0"> 女
              </label>
            </div>
          </div>
        </div>
      </div>
    </modal>
    <modal title="警告" :show.sync="modalDelShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="certainDel"
           small>
      <div slot="modal-body" class="modal-body">
        确定删除员工“{{delModel.wuName}}”？
      </div>
    </modal>
  </div>
</template>

<script>
    import {clone, find, extend} from 'lodash';
    import {modal} from 'vue-strap';

    import oauth from '../utils/oauth';
    import notify from '../components/notify';

    export default{
        components: {
            modal
        },
        created(){
            Promise.all([
                this.$http.get('/api/permissions'),
                this.$http.get('/api/workusers')
            ]).then(function (res) {
                this.permissions = res[0].data;
                this.list = res[1].data.map(function (d) {
                    d.showPassword = false;
                    return d;
                });
                this.loading = false;
            }.bind(this));
        },
        methods: {
            getPermissionName(id){
                var permission = find(this.permissions, {_id: id});

                return permission ? permission.name : '无';
            },
            getUserStateName(state){
                if (state === 1) {
                    return '<span class="label label-success">在职</span>';
                } else {
                    return '<span class="label label-danger">离职</span>';
                }
            },
            /**
             * 校验提交信息
             * @returns {boolean}
             */
            valid(){
                if (!this.model.wuId || !this.model.wuId.trim()) {
                    this.error = '请输入员工工号';
                    return false;
                }

                if (!/^[0-9a-zA-Z]{1,15}$/.exec(this.model.wuId)) {
                    this.error = '员工工号格式错误，请输入数字和字母组合';
                    return false;
                }

                if (!this.model.password || !this.model.password.trim()) {
                    this.error = '请输入密码';
                    return false;
                }

                if (!/^[0-9a-zA-Z]{1,15}$/.exec(this.model.password)) {
                    this.error = '密码格式错误，请输入数字和字母组合';
                    return false;
                }

                if (!this.model.wuName || !this.model.wuName.trim()) {
                    this.error = '请输入员工名称';
                    return false;
                }

//                if (!this.model.duty || !this.model.duty.trim()) {
//                    this.error = '请输入员工岗位';
//                    return false;
//                }

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
                        .put(`/api/workuser/${id}`, this.model)
                        .then(function (res) {
                            this.modalEditShow = false;
                            res.data.showPassword = false;
                            this.list.$set(this.cacheIndex, res.data);
                            notify.info('修改成功！');
                        })
                        .catch(error);
                } else {
                    this.$http
                        .post('/api/workuser', this.model)
                        .then(function (res) {
                            this.modalEditShow = false;
                            res.data.showPassword = false;
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
                this.model = clone(this.list[index]) || {gender: 1, flag: 1};
                if (!this.model.permission) this.model.permission = '';
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
                    .delete(`/api/workuser/${this.delModel._id}`)
                    .then(function () {
                        this.list.$remove(this.delModel);
                        notify.info('删除成功！');
                    }.bind(this))
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
                modalEditShow: false, // 弹窗显示
                model: {},　　　　　　　// 当前新增/修改的model
                permissions: [],      // 权限数据
                list: [],             // 所有数据
                error: '',            // 错误信息
                cacheIndex: -1,       // 当前修改的数据下标
                modalDelShow: false,  // 删除弹窗显示
                delModel: '',         // 当前删除的model
                userInfo: oauth.getUserInfo(),
                q: ''                 // 搜索关键词
            }
        }
    }
</script>