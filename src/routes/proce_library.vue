<style lang="less">
  .proce-library {
    .mb5 {
      margin-bottom: 5px;
    }

    .child-wp {
      input {
        width: 50%;
      }
    }
    .child-wp-4{
      input {
        width: 25% !important;
      }
    }
  }

  .file-item {
    display: block;
    font-size: 12px;
  }
</style>

<template>
  <div class="proce-library">
    <h1>工艺库</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
          <button class="btn btn-primary btn-sm" @click="popEdit()">新 增</button>
        </div>
        <div class="col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入产品图号或名称" v-model="q">
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
          <th>产品图号</th>
          <th>产品名称</th>
          <th>材料牌号</th>
          <th>工序</th>
          <th>图纸/文档</th>
          <th>校对员</th>
          <th>定额员</th>
          <th>主管</th>
          <th>添加时间</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'mId' 'ppName'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.mId}}</td>
          <td>{{i.ppName}}</td>
          <td>{{i.cId}}</td>
          <td>
            <div v-for="w in i.wp">
              <strong>{{$index+1}}.{{w.title}}</strong>
              <div v-for="c in w.child">{{c.key}}:{{c.value}}</div>
            </div>
          </td>
          <td>
            <a class="file-item" target="_blank" href="/api/file/{{f._id}}" v-for="f in i.files">{{f.name}}</a>
          </td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>{{getWorkUserName(i.quotaer)}}</td>
          <td>{{getWorkUserName(i.manager)}}</td>
          <td>{{i.addDate | moment}}</td>
          <td>{{{proceUsage(i)}}}</td>
          <td>
            <span v-if="i.state === 0" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>
            <span v-if="i.state === 0" class="glyphicon glyphicon-trash" @click="popDel(i)"></span>
            <span class="glyphicon glyphicon-floppy-saved" @click="popEdit(i, true)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <modal :title="model._id ? '修改工艺': '新增工艺'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消"
           ok-text="确 定" :callback="submit" :backdrop="false">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">产品图号</label>
          <div class="col-sm-9">
            <input type="text" v-model.trim="model.mId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">产品名称</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.ppName" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">材料牌号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.cId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">工序</label>
          <div class="col-sm-9">
            <button class="btn btn-info mb5" @click="onAddWp"><span class="glyphicon glyphicon-plus"></span></button>
            <div class="mb5" v-for="w in model.wp">
              <div class="input-group">
                <input type="text" class="form-control input-sm" v-model="w.title">
                <span class="input-group-btn">
                  <select v-model="w.sType" class="form-control input-sm" style="width:100px;"
                          @change="onSTypeChange(w)">
                    <option value="">无</option>
                    <option value="s1">一段硫化</option>
                    <option value="s2">二段硫化</option>
                  </select>
                </span>
                <span class="input-group-btn">
                  <button class="btn btn-success" @click="onAddWpChild(w)" type="button" v-if="w.sType !== 's1'">
                    <span class="glyphicon glyphicon-plus"></span>
                  </button>
                  <button class="btn btn-danger" @click="onDeleteWp($index)" type="button">
                    <span class="glyphicon glyphicon-remove"></span>
                  </button>
                </span>
              </div>
              <div  class="input-group child-wp" v-for="c in w.child" track-by="$index">
                <span class="input-group-addon">{{$index + 1}}</span>
                  <input type="text" class="form-control input-sm" v-model="c.key" placeholder="名称">
                  <input type="number" class="form-control input-sm" v-model="c.value" placeholder="数值">

                <span class="input-group-btn">
                  <button v-if="w.sType !== 's1'" class="btn btn-danger" @click="onDeleteWpChild(w, $index)"
                          type="button">
                    <span class="glyphicon glyphicon-trash"></span>
                  </button>
                </span>
              </div>


            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">工艺文档/图纸</label>
          <div class="col-sm-9">
            <file-upload name="file" :headers="xhrHeaders" action="/api/procelibrary/upload"></file-upload>
            <ul class="list-group">
              <li class="list-group-item" v-for="f in model.files" track-by="$index">
                <span class="badge" @click="onDeleteFile($index)">X</span>
                {{f.name}}
              </li>
            </ul>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">校对员</label>
          <div class="col-sm-9">
            <select v-model="model.checker" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/procelibrarycheck'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">定额员</label>
          <div class="col-sm-9">
            <select v-model="model.quotaer" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/procelibraryquota'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">主管</label>
          <div class="col-sm-9">
            <select v-model="model.manager" class="form-control input-sm">
              <option value="">--请选择-</option>
              <option v-for="wu in workUsers | permission '/procelibrarymanage'" :value="wu._id">{{wu.wuName}}</option>
            </select>
          </div>
        </div>
      </div>
    </modal>
    <modal title="警告" :show.sync="modalDelShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="certainDel"
           small>
      <div slot="modal-body" class="modal-body">
        确定删除工艺“{{delModel.mId}}”？
      </div>
    </modal>
  </div>
</template>

<script>
  import {cloneDeep, find, findIndex} from 'lodash';
  import {modal} from 'vue-strap';
  import fileUpload from '../components/file_upload';
  import oauth from '../utils/oauth';

  import {proceUsage} from '../utils/label';
  import notify from '../components/notify';

  export default{
    components: {
      modal,
      fileUpload
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/procelibrarys')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.loading = false;
      }.bind(this));
    },
    methods: {
      proceUsage: proceUsage,
      onSTypeChange(w){
        if (!w.sType) {
          w.title = '';
          w.child = [];
        }

        if (w.sType === 's1') {
          w.title = '一段硫化';
          w.child = [
            {key: '排气压力'},
            {key: '排气次数'},
            {key: '升温时间'},
            {key: '硫化时间'},
            {key: '硫化压力'},
            {key: '硫化压力差值'},
            {key: '硫化温度'},
            {key: '硫化温度最大值'},
            {key: '硫化温度最小值'}
          ];
        }

        if (w.sType === 's2') {

          w.title = '二段硫化';
          w.child = [
            {key: '温度(℃)'},
            {key: '时间(Min)'}
          ];
        }

      },
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      onAddWp(){
        this.model.wp.push({
          sType: '',
          title: '',
          child: []
        });
      },
      onDeleteWp(index){
        this.model.wp.splice(index, 1);
      },
      onAddWpChild(w){
        if (w.sType === 's2') {
            if(w.child.length === 30){
                return
            }
           w.child.push({key: '温度(℃)'});
           w.child.push({key: '时间(Min)'});
        } else {
          w.child.push({key: '', value: ''});
        }

      },
      onDeleteWpChild(w, index){
        w.child.splice(index, 1);
      },
      onDeleteFile(index){
        this.model.files.splice(index, 1);
      },
      /**
       * 校验提交信息
       * @returns {boolean}
       */
      valid(){
        if (!this.model.mId) {
          this.error = '请输入产品图号';
          return false;
        }

        if (!this.model.ppName) {
          this.error = '请输入产品名称';
          return false;
        }

        if (!this.model.cId) {
          this.error = '请输入材料牌号';
          return false;
        }

        if (!this.model.wp.length) {
          this.error = '请添加工序';
          return false;
        }

        var flag = this.model.wp.every(function (w) {
          return !!w.title && w.child.every(function (c) {
                    return !!c.key && !!c.value;
                  });
        });

        if (!flag) {
          this.error = '请输入工序';
          return false;
        }

        if (!this.model.checker) {
          this.error = '请选择校对员';
          return false;
        }

        if (!this.model.quotaer) {
          this.error = '请选择定额员';
          return false;
        }

        if (!this.model.manager) {
          this.error = '请选择主管';
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

        var files = this.model.files.map(function (item) {
          return item._id;
        });

        if (id) {
          this.$http
                  .put(`/api/procelibrary/${id}`, _.extend({}, this.model, {files: files}))
                  .then(function (res) {
                    this.modalEditShow = false;
                    var index = findIndex(this.list, {_id: id});
                    this.list.$set(index, res.data);
                    notify.info('修改成功！');
                  })
                  .catch(error);
        } else {
          this.$http
                  .post('/api/procelibrary', _.extend({}, this.model, {files: files}))
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
      popEdit(item, flag){
        this.error = '';
        this.model = cloneDeep(item) || {wp: [], files: [], checker: '', quotaer: '', manager: ''};
        this.modalEditShow = true;

        if (flag) {
          delete this.model._id;
          delete this.model.state;
          delete this.model.addDate;
        }
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
                .delete(`/api/procelibrary/${this.delModel._id}`)
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
    events: {
      onFileUpload(file, res){
        this.model.files.push(res);
      }
    },
    data(){
      return {
        xhrHeaders: {
          authorization: oauth.getToken()
        },
        loading: true,        // 初始化中
        workUsers: [],        // 所有员工
        modalEditShow: false, // 弹窗显示
        model: {},　　　　　　　// 当前新增/修改的model
        list: [],             // 所有数据
        error: '',            // 错误信息
        modalDelShow: false,  // 删除弹窗显示
        delModel: '',         // 当前删除的model
        q: ''                 // 搜索关键词
      }
    }
  }
</script>