<style lang="less">

</style>

<template>
  <div>
    <h1>产品定额</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading && list.length">
      <table class="table table-hover table-condensed">
        <thead>
        <tr>
          <th>序号</th>
          <th>产品名称</th>
          <th>任务单号</th>
          <th>产品图号</th>
          <th>工序</th>
          <th>材料牌号</th>
          <th>入检批次号</th>
          <th>炉批号</th>
          <th>计划数量</th>
          <th>计划员</th>
          <th>技术员</th>
          <th>校对员</th>
          <th>状态</th>
          <th>备注</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list">
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
          <td>{{i.cId}}</td>
          <td>{{i.rId}}</td>
          <td>{{i.lId}}</td>
          <td>{{i.pNum}}</td>
          <td>{{getWorkUserName(i.planer)}}</td>
          <td>{{getWorkUserName(i.skiller)}}</td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>{{{prodState(i,1)}}}</td>
          <td>{{i.prodComment}}</td>
          <td>
            <button v-if="i.state === 1" type="button" class="btn btn-primary btn-xs" @click="popEdit(i)">通过</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无产品定额
    </div>
    <modal title="产品工时" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :backdrop="false"
           :callback="ok">
      <div slot="modal-body" class="modal-body">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group" v-for="m in model.wp">
          <label class="control-label">{{m.title}}</label>
          <input type="number" class="form-control" v-model="model.times[$index]">
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import {find, extend, cloneDeep, findIndex} from 'lodash';
  import {modal} from  'vue-strap';

  import notify from '../components/notify';
  import {prodState} from '../utils/label';

  export default{
    components: {
      modal
    },
    methods: {
      prodState:prodState,
      /**
       * 获取员工名称
       */
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      /**
       * 校验
       */
      valid(){
        var times = this.model.times;
        if (!times.length || !this.model.wp.every(function (item,index) {
                  return !!times[index];
                })) {
          this.error = '请填写工时';
          return false;
        }

        this.error = '';
        return true;

      },
      /**
       * 弹出修改层
       */
      popEdit(item){
        this.modalEditShow = true;
        this.model = cloneDeep(item);
        this.model.times = [];
      },
      /**
       * 校对通过
       */
      ok(){
        if (!this.valid())return;
        return this.$http.put(`/api/prodquota/${this.model._id}`, {times: this.model.times})
                .then(function (res) {
                  notify.info('定额成功');
                  var index = findIndex(this.list, {_id: this.model._id});
                  this.list.$set(index, res.data);
                  this.modalEditShow = false;
                })
                .catch(function () {
                  notify.error('定额失败');
                });
      }
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/prodquotas')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.loading = false;
      }.bind(this));
    },
    data(){
      return {
        loading: true,        // 初始化中
        error: '',
        modalEditShow: false, // 修改弹窗
        model: {},            // 当前修改的数据
        workUsers: [],        // 所有员工
        list: []              // 所有数据
      }
    }
  }
</script>