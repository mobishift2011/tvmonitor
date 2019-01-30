<style lang="less">

</style>

<template>
  <div>
    <h1>工艺检验</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading && list.length">
      <div class="operation-wrapper row">
        <div class="col-xs-offset-6 col-xs-6">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="请输入产品名称、任务单号或产品图号" v-model="q">
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
          <th>工时</th>
          <th>自检数值</th>
          <th>互检数值</th>
          <th>专检数值</th>
          <th>技术员</th>
          <th>互检员</th>
          <th>合格</th>
          <th>不合格</th>
          <th>检验备注</th>
          <th>交检日期</th>
          <th>状态</th>
          <th>硫化状态</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list | filterBy q in 'tId' 'ppName' 'mId'">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.ppId.ppName}}</td>
          <td>{{i.ppId.tId}}</td>
          <td>{{i.ppId.mId}}</td>
          <td>
            <strong>{{i.wp}}</strong>
            <div v-for="w in i.wpc">{{w.key}}:{{w.value}}</div>
          </td>
          <td>{{i.time}}</td>
          <td>
            <div v-for="s in i.sValue">
              {{s}}
            </div>
          </td>
          <td>
            <div v-for="c in i.cValue">
              {{c}}
            </div>
          </td>
          <td>
            <div v-for="t in i.tValue">
              {{t}}
            </div>
          </td>
          <td>{{getWorkUserName(i.worker)}}</td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>{{i.qNum}}</td>
          <td>{{i.cNum}}</td>
          <td>{{i.comment}}</td>
          <td>{{i.date | moment}}<span v-if="i.cycle" class="text-info">({{Math.ceil(i.cycle/1000/60)}}分钟)</span></td>
          <td>{{{proceState(i)}}}</td>
          <td>{{{proceProdState(i)}}}</td>
          <td>
            <button v-if="['一段硫化', '二段硫化'].indexOf(i.wp)> -1 ? i.prodState == 5 : i.state === 1" type="button" class="btn btn-primary btn-xs" @click="popEdit(i)">通过</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="alert alert-info text-center" v-if="!loading && !list.length">
      <span class="glyphicon glyphicon-info-sign"></span>暂无工艺检验
    </div>
    <modal title="转验信息" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :backdrop="false"
           :callback="ok">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group" v-for="w in model.wpc">
          <label class="col-sm-3 control-label">{{w.key}}</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.tValue[$index]" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">合格件数</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.qNum" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">不合格件数</label>
          <div class="col-sm-9">
            <input type="number" v-model="model.cNum" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">检验备注</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.comment" class="form-control">
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import {find, extend, cloneDeep, findIndex, isEmpty} from 'lodash';
  import {modal} from  'vue-strap';

  import {proceState,proceProdState} from '../utils/label';
  import notify from '../components/notify';

  export default{
    components: {
      modal
    },
    methods: {
      proceState: proceState,
      proceProdState:proceProdState,
      /**
       * 获取员工名称
       */
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      /**
       * 弹出层
       */
      popEdit(item){
        this.modalEditShow = true;
        this.model = cloneDeep(item);
      },
      valid(){
        if (!this.model.wpc.every(function (item, index) {
                  return !!this.model.tValue[index];
                }.bind(this))) {
          this.error = '请输入专检数值';
          return false;
        }

        var numRegexp = /^[0-9]+$/;
        if (!numRegexp.test(this.model.qNum)) {
          this.error = '请输入合格件数';
          return false;
        }

        if (!numRegexp.test(this.model.cNum)) {
          this.error = '请输入不合格件数';
          return false;
        }

        this.error = '';
        return true;
      },
      /**
       * 通过
       */
      ok(){

        if (!this.valid()) return;
        let params={};
        if(this.model.prodState){
            params={
                wp: this.model.wp,
                wId: this.model.wId,
                ppId: this.model.ppId._id,
                qNum: this.model.qNum,
                cNum: this.model.cNum,
                comment: this.model.comment,
                tValue: this.model.tValue,
                index: this.model.index,
                prodState: 6,
                state: 2
            }
        }else{
            params={
                wp: this.model.wp,
                wId: this.model.wId,
                ppId: this.model.ppId._id,
                qNum: this.model.qNum,
                cNum: this.model.cNum,
                comment: this.model.comment,
                tValue: this.model.tValue,
                index: this.model.index
            }
        }
        return this.$http.put(`/api/procetest/${this.model._id}`, params)
                .then(function (res) {
                  notify.info('操作成功');
                  var index = findIndex(this.list, {_id: this.model._id});
                  this.list.$set(index, res.data);
                  this.modalEditShow = false;
                })
                .catch(function () {
                  notify.error('操作失败');
                });
      }
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/procetests')
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.loading = false;
      }.bind(this));
    },
    data(){
      return {
        loading: true,        // 初始化中
        modalEditShow: false, // 修改弹层
        error: '',
        model: {},            // 当前修改的model
        workUsers: [],        // 所有员工
        list: [],              // 所有数据
        q:''
      }
    }
  }
</script>