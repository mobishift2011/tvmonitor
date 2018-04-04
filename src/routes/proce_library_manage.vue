<style lang="less">

</style>

<template>
  <div class="proce-library">
    <h1>工艺主管</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <table class="table table-hover table-condensed">
        <thead>
        <tr>
          <th>序号</th>
          <th>产品图号</th>
          <th>产品名称</th>
          <th>材料牌号</th>
          <th>工序</th>
          <th>图纸/文档</th>
          <th>工时</th>
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
          <td>
            <div v-for="t in i.times">
              <strong>{{$index+1}}.{{t}}</strong>
            </div>
          </td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>{{getWorkUserName(i.quotaer)}}</td>
          <td>{{getWorkUserName(i.manager)}}</td>
          <td>{{i.addDate | moment}}</td>
          <td>{{{proceUsage(i)}}}</td>
          <td>
            <button v-if="i.state === 2" type="button" class="btn btn-primary btn-xs" @click="ok(i)">通过</button>
            <span v-if="i.state === 3" class="glyphicon glyphicon-edit" @click="popEdit(i)"></span>
            <span class="glyphicon glyphicon-trash" @click="popDel(i)"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <modal :title="'修改工艺'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消"
           ok-text="确 定" :callback="submit" :backdrop="false">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-group">
          <label class="col-sm-3 control-label">是否使用</label>
          <div class="col-sm-9">
            <select v-model="model.usage" class="form-control input-sm">
              <option value="1">使用</option>
              <option value="0">作废</option>
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

  import {proceUsage} from '../utils/label';
  import notify from '../components/notify';

  export default{
    components: {
      modal
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/procelibrarymanages')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.loading = false;
      }.bind(this));
    },
    methods: {
      proceUsage: proceUsage,
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },

      /**
       * 提交信息
       */
      submit(){
        let id = this.model._id;

        this.$http
                .put(`/api/procelibrarymanage/${id}`, {usage: this.model.usage})
                .then(function (res) {
                  this.modalEditShow = false;
                  var index = findIndex(this.list, {_id: id});
                  this.list.$set(index, res.data);
                  notify.info('修改成功！');
                })
                .catch(function () {
                  notify.error('修改失败！');
                });
      },
      /**
       * 新增/修改弹出框
       * @param index
       */
      popEdit(item){
        this.model = {_id: item._id, usage: item.usage};
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
                .delete(`/api/procelibrarymanage/${this.delModel._id}`)
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
      /**
       * 通过
       */
      ok(item){
        this.$http
                .put(`/api/procelibrarymanage/${item._id}`, {state: 3})
                .then(function (res) {
                  var index = findIndex(this.list, {_id: item._id});
                  this.list.$set(index, res.data);
                  notify.info('操作成功！');
                })
                .catch(function () {
                  notify.error('操作失败！');
                });
      }
    },
    data(){
      return {
        loading: true,        // 初始化中
        workUsers: [],        // 所有员工
        modalEditShow: false, // 弹窗显示
        model: {},            // 修改的model
        modalDelShow: false,  // 删除弹窗显示
        delModel: {},
        list: []              // 所有数据
      }
    }
  }
</script>