<style>

</style>

<template>
  <div>
    <h1>平板硫化机设备状态</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">

      </div>
      <table class="table table-hover table-condensed">
        <thead>
        <tr>
          <th>序号</th>
          <th>设备IP</th>
          <th>操作员</th>
          <th>设备通讯状态</th>
          <th>任务号</th>

          <th>硫化压力</th>
          <th>硫化实时时间</th>
          <th>升温实时时间</th>
          <th>硫化标志</th>
          <th>本地控制</th>
          <th>升温时间超差</th>
          <th>压力超差</th>
          <th>温度超差</th>

          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list" track-by="$index">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.eqIp}}</td>
          <td>{{getWorkUserName(i.adder)}}</td>
          <td>{{i.connectState}}</td>
          <td>
            <div v-if="i.firstUse">
                <strong>1.</strong>
                <p>任务号：{{i.firstTask.tId}}</p>
                <p>模具号：{{i.firstTask.mjh}}</p>
                <p>产品图号：{{i.firstTask.cpth}}</p>
                <p>有效模腔数：{{i.firstTask.yxmqs}}</p>
                <p>硫化温度：{{i.wd1}}</p>
                <p>膜次号：{{i.firstTask.mch}}</p>
                <p>膜次总数：{{i.firstTask.mczs}}</p>
                <p>总产量：{{i.firstTask.zcl}}</p>
                <p>合格产量：{{i.firstTask.hgcl}}</p>
                <p>不合格产量：{{i.firstTask.bhgcl}}</p>
                <p>启停标识：{{i.firstUse}}</p>
            </div>
            <div v-if="i.secondUse">
              <strong>2.</strong>
              <p>任务号：{{i.secondTask.tId}}</p>
              <p>模具号：{{i.secondTask.mjh}}</p>
              <p>产品图号：{{i.secondTask.cpth}}</p>
              <p>有效模腔数：{{i.secondTask.yxmqs}}</p>
              <p>硫化温度：{{i.wd2}}</p>
              <p>膜次号：{{i.secondTask.mch}}</p>
              <p>膜次总数：{{i.secondTask.mczs}}</p>
              <p>总产量：{{i.secondTask.zcl}}</p>
              <p>合格产量：{{i.secondTask.hgcl}}</p>
              <p>不合格产量：{{i.secondTask.bhgcl}}</p>
              <p>启停标识：{{i.secondUse}}</p>
            </div>
            <div v-if="i.thirdUse">
              <strong>3.</strong>
              <p>任务号：{{i.thirdTask.tId}}</p>
              <p>模具号：{{i.thirdTask.mjh}}</p>
              <p>产品图号：{{i.thirdTask.cpth}}</p>
              <p>有效模腔数：{{i.thirdTask.yxmqs}}</p>
              <p>硫化温度：{{i.wd3}}</p>
              <p>膜次号：{{i.thirdTask.mch}}</p>
              <p>膜次总数：{{i.thirdTask.mczs}}</p>
              <p>总产量：{{i.thirdTask.zcl}}</p>
              <p>合格产量：{{i.thirdTask.hgcl}}</p>
              <p>不合格产量：{{i.thirdTask.bhgcl}}</p>
              <p>启停标识：{{i.thirdUse}}</p>
            </div>
            <div v-if="i.fourthUse">
              <strong>4.</strong>
              <p>任务号：{{i.fourthTask.tId}}</p>
              <p>模具号：{{i.fourthTask.mjh}}</p>
              <p>产品图号：{{i.fourthTask.cpth}}</p>
              <p>有效模腔数：{{i.fourthTask.yxmqs}}</p>
              <p>硫化温度：{{i.wd4}}</p>
              <p>膜次号：{{i.fourthTask.mch}}</p>
              <p>膜次总数：{{i.fourthTask.mczs}}</p>
              <p>总产量：{{i.fourthTask.zcl}}</p>
              <p>合格产量：{{i.fourthTask.hgcl}}</p>
              <p>不合格产量：{{i.fourthTask.bhgcl}}</p>
              <p>启停标识：{{i.fourthUse}}</p>
            </div>

          </td>

          <td>{{i.lhyl}}</td>
          <td>{{i.lhsssj}}</td>
          <td>{{i.swsssj}}</td>
          <td>{{i.lhbz}}</td>
          <td>{{i.bdkz}}</td>
          <td>{{i.swsjcc}}</td>
          <td>{{i.ylcc}}</td>
          <td>{{i.wdcc}}</td>

          <td>
            <input type="button" value="添加" class="btn btn-primary btn-sm glyphicon-edit"   v-if="i.connectState==1" @click="popEdit(i)">
            <input type="button" value="下载" class="btn btn-primary btn-sm glyphicon-play"   v-if="i.state==0&&i.connectState==1" @click="popWrite(i)">
            <!--<span  class="glyphicon glyphicon-edit" v-if="i.connectState==1" @click="popEdit(i)"></span>-->
            <!--<span  class="glyphicon glyphicon-play" v-if="i.state==0&&i.connectState==1" @click="popWrite(i)"></span>-->
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <modal :title="model._id ? '修改设备状态': '新增设备状态'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消"
           ok-text="确 定" :callback="submit" :backdrop="false">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <!--<div class="form-group">-->
          <!--<label class="col-sm-3 control-label">设备IP</label>-->
          <!--<div class="col-sm-9">-->
            <!--<input type="text" v-model="model.eqId" maxlength="50" class="form-control input-sm"/>-->
          <!--</div>-->
        <!--</div>-->
        <div class="form-group">
          <label class="col-sm-3 control-label">任务号</label>
          <div class="col-sm-9">
            <div class="btn-group">
              <button class="btn btn-info mb5" style="margin-bottom: 5px;" @click="onAddTId"><span
                      class="glyphicon glyphicon-plus"></span></button>
              <button class="btn btn-danger" @click="onDeleteAll()"
                      type="button">
                <span class="glyphicon glyphicon-remove"></span>
              </button>
            </div>
            <div class="input-group" v-for="tId in model.tIds" track-by="$index">
              <span class="input-group-addon">{{$index + 1}}</span>
              <select v-model="tId" class="form-control">
                <option value="">--请选择--</option>
                <option v-for="t in tasks" :value="t">{{t}}</option>
              </select>
              <span class="input-group-btn" >
                <button class="btn btn-danger" @click="onDeleteTId($index)"
                        type="button">
                  <span class="glyphicon glyphicon-trash"></span>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </modal>
    <modal title="警告" :show.sync="modalDelShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="certainDel"
           small>
      <div slot="modal-body" class="modal-body">
        确定删除设备“{{delModel.eqId}}”？
      </div>
    </modal>
    <!--写入信息-->
    <modal title="" :show.sync="modalWriteShow" effect="fade" cancel-text="取 消"
           ok-text="写 入" :callback="startWork" :backdrop="false">
      <div slot="modal-header" class="modal-header">
        <button type="button" class="close"><span>×</span></button>
        <h4 class="modal-title">
          写入信息
        </h4>
        <div class="modal-loading" v-show="writeLoading"><img src="../assets/img/loading.gif"></div>
      </div>
      <div slot="modal-body" class="modal-body form-horizontal">
        <!--<div class="form-group">-->
          <!--<label class="col-sm-3 control-label">任务号</label>-->
          <!--<div class="col-sm-9 padding-top7">{{modelWrite.tIds}}</div>-->
        <!--</div>-->
        <!--<div class="form-group">-->
          <!--<label class="col-sm-3 control-label">产品图号</label>-->
          <!--<div class="col-sm-9 padding-top7">{{modelWrite.pNum}}</div>-->
        <!--</div>-->
        <table class="table table-condensed">
          <thead><tr>
            <td>任务号</td>
            <td>产品图号</td>
            <td>模具号</td>
            <td>有效模腔数</td>
          </tr></thead>
          <tbody>
            <tr v-for="task in tasksWrite">
              <td>{{task.tId}}</td>
              <td>{{task.mId}}</td>
              <td>{{task.mould.mId}}</td>
              <td>{{task.mould.ccNum}}</td>
            </tr>
          </tbody>
        </table>
        <div class="form-group">
          <label class="col-sm-3 control-label">一段硫化参数</label>
          <div class="col-sm-9">
            <div class="half">
            <p>  排气压力: <strong>{{modelWrite.pqyl}}</strong>         </p>
             <p>  排气次数: <strong>{{modelWrite.pqcs}}</strong>           </p>
             <p>  升温时间: <strong>{{modelWrite.swsj}}</strong>           </p>
             <p>  硫化时间: <strong>{{modelWrite.lhsj}}</strong>           </p>
             <p>  硫化压力: <strong>{{modelWrite.lhyl}}</strong>           </p>
             <p>  硫化压力差值: <strong>{{modelWrite.lhylcz}}</strong>       </p>
             <p>  硫化温度: <strong>{{modelWrite.lhwd}}</strong>           </p>
             <p>  硫化温度最大值: <strong>{{modelWrite.lhwdzdz}}</strong>     </p>
             <p>  硫化温度最小值: <strong>{{modelWrite.lhwdzxz}}</strong>     </p>
              <!--<p v-for="sj in modelWrite.sj" track-by="$index">-->
                <!--时间{{$index+1}}: <strong>{{sj}}</strong> min-->
              <!--</p>-->

            </div>
            <!--<div class="half">-->
              <!--<p v-for="wd in modelWrite.wd" track-by="$index">-->
                <!--温度{{$index+1}}: <strong>{{wd}}</strong> ℃-->
              <!--</p>-->
            <!--</div>-->
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import {cloneDeep, find, findIndex} from 'lodash';
  import {modal} from 'vue-strap';

  import {planState} from '../utils/label';
  import notify from '../components/notify';
  import oauth from '../utils/oauth';

  export default{
    components: {
      modal
    },
    created(){
      Promise.all([
        this.$http.get('/api/workusers/field'),
        this.$http.get('/api/pblhjstates'),
        this.$http.get('/api/prodprods'),
      ]).then(function (res) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.prodList=res[2].data;
        this.loading = false;
      }.bind(this));
      this.getLiji();
    },
    methods: {
      getLiji(){
        let time=30 * 1000,_this=this;
        this.lhjListInterval=setInterval(function(){
          _this.refresh();
        },time)
      },
      refresh(){
          let timeStamp=new Date().getTime();
        this.$http.get('/api/pblhjstates',{time:timeStamp}).then(function(data){
          this.list = data.data;
          notify.info('刷新数据成功！');
        }.bind(this))
      },
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      canEdit(item){
        return this.userInfo._id === item.adder || item.state === 1;
      },
      onAddTId(){
          if(this.model.tIds.length < 4 ){
              this.model.tIds.push('');
          }else{
              this.error = '最多添加4个任务号';
          }

      },
      onDeleteTId(index){
        this.model.tIds.splice(index, 1);
      },
      onDeleteAll(){
        this.model.tIds = [];
      },
      /**
       * 校验提交信息
       * @returns {boolean}
       */
      valid(){
        if (!this.model.eqId) {
          this.error = '请输入设备ID';
          return false;
        }

        if (!this.model._id && !this.model.tIds.some(function (item) {
                  return !!item;
                })) {
          this.error = '请输入任务号';
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
                  .put(`/api/pblhjstate/${id}`, this.model)
                  .then(function (res) {
                    this.modalEditShow = false;
//                    let index = findIndex(this.list, {_id: id});
//                    this.list.$set(index, res.data);
                    this.refresh();
                    notify.info('修改成功！');
                  })
                  .catch(error);
        } else {
          this.$http
                  .post('/api/pblhjstate', this.model)
                  .then(function (res) {
                    this.modalEditShow = false;
                    this.list.unshift(res.data);
                    notify.info('新增成功！');
                  })
                  .catch(error);
        }

        function error(res) {
          if (res.status === 409) {
            this.error = '设备ID已存在';
          }
        }
      },
      /**
       * 新增/修改弹出框
       */
      popEdit(item){
          let params={};
          if(item.tIds.length>0&&item.state==1){
              params={
                  tId:item.tIds[0]
              }
          }
        this.$http.get('/api/pblhjstates/tasks',params).then(function(data){
          this.tasks = data.data;
          if(item.tIds.length>0){
            this.tasks=this.tasks.concat(item.tIds);
          }
        }.bind(this))
        this.error = '';
        this.model = cloneDeep(item) || {tIds: ['', '', '', '']};
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
                .delete(`/api/pblhjstate/${this.delModel._id}`)
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
      popWrite(item){
          console.log(item)
          this.modelWrite = cloneDeep(item);

          this.tasksWrite=[];
          console.log(this.modelWrite)
          for(let i=0;i<item.tIds.length;i++){


              this.tasksWrite.push(find(this.prodList,{tId:item.tIds[i]||''}))
              console.log(find(this.prodList,{tId:item.tIds[i]||''}))

          }
//         this.modelWrite.tasks = find(this.prodList,{tId:item.tIds[0]||''}).mId;
          this.modalWriteShow = true;
      },
      startWork(){
        let _this=this;
        this.writeLoading=true;
        this.$http
                .put('/api/pblhjstates/write',this.modelWrite)
                .then(function () {
                  _this.refresh()
                    _this.writeLoading=false;
                  notify.info('写入数据成功！');
                    this.modalWriteShow = false;
                })
                .catch(function () {
                  notify.error('写入数据失败！');
                    _this.writeLoading=false;
                });

      }
    },
      beforeDestroy(){
          clearInterval(this.lhjListInterval);
      },
    data(){
      return {
        loading: true,        // 初始化中
        workUsers: [],        // 所有员工
        tasks: [],
        userInfo: oauth.getUserInfo(),
        modalEditShow: false, // 弹窗显示
        model: {},　　　　　　　// 当前新增/修改的model
        list: [],             // 所有数据
        modalDelShow: false,  // 删除弹窗显示
        delModel: '',         // 当前删除的model
        error: '',             // 错误信息
        lhjListInterval:'',
        modelWrite:{},
        modalWriteShow:false,
        prodList:[],   //生产计划
        writeLoading:false,
        tasksWrite:[]
      }
    }
  }
</script>
