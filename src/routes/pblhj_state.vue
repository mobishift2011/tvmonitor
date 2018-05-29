<style>

  select option[selected],
  select option[disabled] {
    background-color: #eee;
    cursor: not-allowed;
    display: none;
    color: #ccc;
  }
</style>
<template>
  <div>
    <h1>平板硫化机设备{{$route.params.id}}状态</h1>

    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <!-- <div class="operation-wrapper row">
         <div class="col-xs-3">
              <select @change="switchData" class="form-control input-sm" v-model="eqIp">
                  <option value="">--请选择设备--</option>
                  <option :value="d._id" v-for="d in list">{{d.eqIp}}</option>
              </select>
          </div>
      </div> -->
      <table class="table table-hover table-condensed">
        <thead>
        <tr>
          <!-- <th>序号</th> -->
          <th>设备IP</th>
          <!-- <th>操作员</th> -->
          <th>操作员工号</th>
          <th>设备通讯状态</th>

          <th>硫化压力</th>
          <th>硫化实时时间</th>
          <th>升温实时时间</th>
          <th>硫化标志</th>
          <!-- <th>本地控制</th> -->
          <!-- <th>升温时间超差</th> -->
          <!-- <th>压力超差</th> -->
          <!-- <th>温度超差</th> -->

          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list" track-by="$index">
          <!-- <th scope="row">{{$index + 1}}</th> -->
          <td>{{i.eqIp}}</td>
          <!-- <td>{{getWorkUserName(i.adder)}}</td> -->
          <td>{{i.wuId}}</td>
          <td>{{i.connectState}}</td>

          <td>{{i.lhyl}}</td>
          <td>{{i.lhsssj}}</td>
          <td>{{i.swsssj}}</td>
          <td>{{i.lhbz}}</td>
          <!-- <td>{{i.bdkz}}</td> -->
          <!-- <td>{{i.swsjcc}}</td> -->
          <!-- <td>{{i.ylcc}}</td> -->
          <!-- <td>{{i.wdcc}}</td> -->

          <td>
            <template v-if="i.lhbz*1==0 && i.connectState*1==1">
            <input type="button" value="添加" class="btn btn-primary btn-sm glyphicon-edit" @click="popEdit(i)">
            <input type="button" value="模具号选择" class="btn btn-primary btn-sm glyphicon-play" @click="popWrite(i)">
          </template>
          <!--当 硫化标志=0，本地控制=0，1号启停=2，2号启停=2，3号启停=2，4号启停=2，和通讯状态为1时，才能显示写入按钮 -->
          <input  v-if="i.lhbz*1==0 && i.bdkz*1==0 && i.firstUse*1==2 && i.secondUse*1==2 && i.thirdUse*1==2 && i.fourthUse*1==2  && i.connectState*1==1" type="button" value="写入" class="btn btn-primary btn-sm glyphicon-edit" @click="write(i)">
            <!--<span  class="glyphicon glyphicon-edit" v-if="i.connectState==1" @click="popEdit(i)"></span>-->
            <!--<span  class="glyphicon glyphicon-play" v-if="i.state==0&&i.connectState==1" @click="popWrite(i)"></span>-->
          </td>
        </tr>

        <tr>
          <!-- <td><strong>序号</strong></td> -->
          <td><strong>任务号</strong></td>
          <td><strong>模具号</strong></td>
          <td><strong>材料牌号</strong></td>
          <td><strong>有效模腔数</strong></td>
          <td><strong>硫化温度</strong></td>
          <td><strong>模次号</strong></td>
          <!--
          <td><strong>加热板的温度</strong></td>
          -->
          <td><strong>启停标识</strong></td>
          <td></td>
        </tr>

        <template v-for="i in list" track-by="$index">
          <tr>
            <template v-if="i.firstUse*1==1">
              <!-- <td>2.</td> -->
              <td>{{i.firstTask.tId}}</td>
              <td>{{i.firstTask.mjh}}</td>
              <td>{{i.firstTask.cpth}}</td>
              <td>{{i.firstTask.yxmqs}}</td>
              <td>{{i.wd1}}</td>
              <td>{{i.firstTask.mch}}</td>
              <!--
              <td>{{i.firstTask.bhgcl}}</td>
              -->              
              <td>{{i.firstUse}}</td>
              <td></td>
            </template>
        </tr>
        <tr>
            <template v-if="i.secondUse*1==1">
              <!-- <td>2.</td> -->
              <td>{{i.secondTask.tId}}</td>
              <td>{{i.secondTask.mjh}}</td>
              <td>{{i.secondTask.cpth}}</td>
              <td>{{i.secondTask.yxmqs}}</td>
              <td>{{i.wd2}}</td>
              <td>{{i.secondTask.mch}}</td>
              <!--
              <td>{{i.secondTask.bhgcl}}</td>
              -->
              <td>{{i.secondUse}}</td>
              <td></td>
            </template>
        </tr>
        <tr>
            <template v-if="i.thirdUse*1==1">
              <!-- <td>3.</td> -->
              <td>{{i.thirdTask.tId}}</td>
              <td>{{i.thirdTask.mjh}}</td>
              <td>{{i.thirdTask.cpth}}</td>
              <td>{{i.thirdTask.yxmqs}}</td>
              <td>{{i.wd3}}</td>
              <td>{{i.thirdTask.mch}}</td>
              <!--
              <td>{{i.thirdTask.bhgcl}}</td>
              -->
              <td>{{i.thirdUse}}</td>
              <td></td>
            </template>
        </tr>
        <tr>
            <template v-if="i.fourthUse*1==1">
              <!-- <td>4.</td> -->
              <td>{{i.fourthTask.tId}}</td>
              <td>{{i.fourthTask.mjh}}</td>
              <td>{{i.fourthTask.cpth}}</td>
              <td>{{i.fourthTask.yxmqs}}</td>
              <td>{{i.wd4}}</td>
              <td>{{i.fourthTask.mch}}</td>
              <!--
              <td>{{i.fourthTask.bhgcl}}</td>
              -->
              <td>{{i.fourthUse}}</td>
              <td></td>
            </template>
          </tr>
        </template>

        </tbody>
      </table>
      <pblhj-monitor :devices="devices"></pblhj-monitor>
    </div>
    <modal :title="model._id ? '修改设备状态': '新增设备状态'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="submit" :backdrop="false">
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
          <label class="col-sm-2 control-label">任务号</label>
          <div class="col-sm-10">
             <div class="btn-group">
              <button class="btn btn-danger mb5" style="margin-bottom: 5px;" @click="clear">
                <span>清空所有任务号</span></button>
              <button class="btn btn-info" @click="reset" title="撤销" type="button">
                <span>恢复之前的状态</span>
              </button>
            </div>
            <!--<div class="input-group" v-for="tId in model.tIds" track-by="$index">
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

            <div class="input-group">
              <span class="input-group-addon">1</span>
              <select id="tId1" @change="seletTask($event,'tId1')" data-prev="" :disabled="firstUse === 1" class="form-control">
                <option value="">--请选择--</option>
                <option v-for="t in tasks" :value="stringify(t)" :disabled="tId1.index === t.index || t.disabled" :selected="tId1.tId === t.tId" track-by="$index">{{t.tId}}</option>
              </select>
            </div>-->
            <div class="input-group">
              <span class="input-group-addon">1</span>
              <select id="tId1" @change="seletTask($event,'tId1')" data-prev="" :disabled="firstUse === 1" class="form-control" >
                <option value="">--请选择--</option>
                <option v-for="t in tasks" :value="stringify(t)" 
                :selected="tId1.tId === t.tId" 
                track-by="$index">{{t.tId}}</option>
              </select>
            </div>
            <div class="input-group">
              <span class="input-group-addon">2</span>
              <select id="tId2" @change="seletTask($event,'tId2')" data-prev="" :disabled="secondUse === 1" class="form-control" >
                <option value="">--请选择--</option>
                <option v-for="t in tasks" :value="stringify(t)" 
                :selected="tId2.tId === t.tId" 
                track-by="$index">{{t.tId}}</option>
              </select>
            </div>
            <div class="input-group">
              <span class="input-group-addon">3</span>
              <select id="tId3" @change="seletTask($event,'tId3')" data-prev="" :disabled="thirdUse === 1" class="form-control" >
                <option value="">--请选择--</option>
                <option v-for="t in tasks" :value="stringify(t)" 
                :selected="tId3.tId === t.tId" 
                track-by="$index">{{t.tId}}</option>
              </select>
            </div>
            <div class="input-group">
              <span class="input-group-addon">4</span>
              <select id="tId4" @change="seletTask($event,'tId4')" data-prev="" :disabled="fourthUse === 1" class="form-control">
                <option value="">--请选择--</option>
                <option v-for="t in tasks" :value="stringify(t)" 
                :selected="tId4.tId === t.tId" 
                track-by="$index">{{t.tId}}</option>
              </select>
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
           ok-text="确 定" :callback="startWork" :backdrop="false">
      <div slot="modal-header" class="modal-header">
        <button type="button" class="close" @click="modalWriteShow=false"><span>×</span></button>
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
          <!--<label class="col-sm-3 control-label">材料牌号</label>-->
          <!--<div class="col-sm-9 padding-top7">{{modelWrite.pNum}}</div>-->
        <!--</div>-->
        <table class="table table-condensed">
          <thead><tr>
            <td>任务号</td>
            <td>材料牌号</td>
            <td>模具号</td>
            <!-- <td>有效模腔数</td> -->
          </tr></thead>
          <tbody>
            <tr v-for="task in tasksWrite" track-by="$index">
              <td>{{task.tId}}</td>
              <td>{{task.cId}}</td>
              <td>
                <!-- {{task.mould.mId}} -->
                <!-- <select id="mId" @change="selectMId($event, $index)" class="form-control" v-model="task.mould.mId"> -->
                <select id="mId" @change="selectMId($event, $index)"  class="form-control">
                  <option value="">--请选择--</option>
                  <option v-for="mould in modules[$index]" :value="stringify(mould)" track-by="$index">{{mould.mId}}</option>
                </select>
              </td>
              <!-- <td>{{task.mould.ccNum}}</td> -->
            </tr>
          </tbody>
        </table>
        <div class="form-group">
          <label class="col-sm-3 control-label">一段硫化参数</label>
          <div class="col-sm-9">
            <div class="half">
              <!-- <template v-for="w in modelWrite.wpc">
                <p>  {{w.key}}: <strong>{{w.value}}</strong>         </p>
              </template> -->
            <p>  排气压力: <strong>{{modelWrite.pqyl}}</strong>         </p>
             <p>  排气次数: <strong>{{modelWrite.pqcs}}</strong>           </p>
             <p>  升温时间: <strong>{{modelWrite.swsj}}</strong>           </p>
             <p>  升温补偿时间: <strong>{{modelWrite.swbcz}}</strong>           </p>
             <p>  升温极限时间: <strong>{{modelWrite.swjxz}}</strong>           </p>
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
  import {cloneDeep, find, findIndex, uniqBy} from 'lodash';
  import {modal} from 'vue-strap';
  import Vue from 'vue';

  import {planState} from '../utils/label';
  import notify from '../components/notify';
  import oauth from '../utils/oauth';
  import PblhjMonitor from './pblhj_monitor.vue';

  export default{
    components: {
      modal,
      PblhjMonitor
    },
    created(){
      this.switchData(this.$route.params.id);
      this.getLiji();

    },

    watch: {
      '$route.params': {
        handler: function (val) { 
          this.switchData(val.id);
        },
        deep: true
      }
    },
    watch: {
      '$route.params': {
        handler: function (val) { 
          this.switchData(val.id);
        },
        deep: true
      }
    },

    methods: {
      selectMId(e, index) {
        var elm = e.target;
        var val = elm.value;
        if (val && Object.prototype.toString.call(val) === "[object String]") {
          val = JSON.parse(val);
        }
        if (this.tasksWrite[index]) {
          // delete this.tasksWrite[index].mould;
          // var mould = {
          //   mId: val.mId,
          //   ccNum: val.ccNum
          // }
          // this.tasksWrite[index].ccNum = val.ccNum;
          // this.tasksWrite[index].ccNum = val.ccNum;
          this.WriteTemps[index] = val;
          // this.tasksWrite[index].mould = val;
        }
        
        // console.error(this.tasksWrite);
      },
      stringify(param) {
        return JSON.stringify(param);
      },
      seletTask(e, task) {
        var elm = e.target;
        var val = elm.value;
        var prevVal = elm.dataset.prev;
        if (!task) return;
        if (val && Object.prototype.toString.call(val) === "[object String]") {
          val = JSON.parse(val);
        }
        if (prevVal)
          prevVal = JSON.parse(prevVal);
        switchOptionDisabled(prevVal, val, this.tasks);
        var ts = [], tsAll = [];
        switch(task) {
          case "tId1": 
            this.error = '';
            this.tId1.tId = val.tId;
            this.tId1.index = val.index;
            this.firstTask = find(this.plans, {tId:this.tId1.tId ||''});

            this.plans.forEach((t, i) => {
              var obj = {};
              Vue.set(obj, 'tId', t.tId);
              Vue.set(obj, 'index', i);
              Vue.set(obj, 'disabled', false);
              // if (val.tId === t.tId) Vue.set(obj, 'disabled', true);
              if (this.firstTask && t.cId === this.firstTask.cId) {
                ts.push(obj)
                // console.error(ts);
              }
              tsAll.push(obj);  
            });

            if (ts.length < 1) ts = tsAll
              this.tasks = ts
            break;
          case "tId2": 
            this.tId2.tId = val.tId;
            this.tId2.index = val.index;
            break;
          case "tId3": 
            this.tId3.tId = val.tId;
            this.tId3.index = val.index;
            break;
          case "tId4": 
            this.tId4.tId = val.tId;
            this.tId4.index = val.index;
            break;
          default: 
            break;
        }

        elm.dataset.prev = JSON.stringify(val);
        if ("tId1" !== task) {
          // 第一个任务号未选择，而选择了其他
          if (!this.firstTask.tId){
            this.error = '请先选择任务号1';
            this.tasks = cloneDeep(this.plans)
            var tasks = [];
            this.tasks.forEach((t, i) => {
              var obj = {};
              Vue.set(obj, 'tId', t.tId);
              Vue.set(obj, 'index', i);
              Vue.set(obj, 'disabled', false);
              tasks.push(obj);
            });
            this.tasks = tasks;
            return;
          }
          // this.tasks.forEach((t, i) => {
          //   if (val.tId === t.tId) t.disabled = true;
          // });
        } 

       //[this.tId1.tId].concat(ts);

        function switchOptionDisabled(prev, current, tasks) {

          tasks.forEach(t=>{
            if (t.tId === prev.tId && prev.index === t.index) {
              t.disabled = false;
            }
          });
          tasks.forEach(t=>{
            if (t.tId === current.tId && current.index === t.index) {
              t.disabled = true;
            }
          });
        };

      },
      filterEqualFirstTaskId(firstMId) {
        if (!firstMId) return;
        var sameTasks = [], sameTIds =[], optional = [];

        // 获取图号跟第一个任务号相同的所有任务
        sameTasks = this.plans.filter(item => item.mId === firstMId);
         

      },
      switchData(id) {
          Promise.all([
            this.$http.get('/api/workusers/field'),
            // this.$http.get('/api/pblhjstates'),
            this.$http.get(`/api/pblhjstate/${id}`),
            // this.$http.get(`/api/allplan/${id}`),
            this.$http.get('/api/prodprods'),
            this.$http.get('/api/prodproces'),
            this.$http.get('/api/allplans')
          ]).then(function (res) {
            this.workUsers = res[0].data;
            this.list = res[1].data;
          // console.error(this.list);

            if (this.list.length > 0) {
              this.eqIp = this.list[0]._id;
              this.devices = this.list;
              this.tIds = this.list[0].tIds;
            }

            
            this.prodList= res[2].data; 
            this.prodproces = res[3].data;
            // console.error(this.prodproces); 

            this.loading = false;

            this.plans = res[4].data;

            if (this.list[0] && this.list[0].tIds.length > 0)
              this.firstTask = find(this.plans,{tId:this.tIds[0] ||''});
            this.plans = find(this.plans, { picker: this.userInfo._id, tId: this.tIds[0]});

          }.bind(this));
      },
      getLiji(){
        let time=30 * 1000,_this=this;
        this.lhjListInterval=setInterval(function(){
          _this.refresh();
        },time)
      },
      refresh(){
        let id = this.$route.params.id
        let timeStamp=new Date().getTime();
        this.$http.get(`/api/pblhjstate/${id}`,{time:timeStamp})
        .then(function(data){
          this.list = data.data;

          if (this.list.length > 0) {
            this.eqIp = this.list[0]._id;
            this.devices = this.list;
          }
          notify.info('刷新数据成功！');
        }.bind(this))
      },
      getWorkUserName(id){
        // 除了超级管理员以外的用户。
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      getWorkUserWuId(id){
        // 除了超级管理员以外的用户。
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
      // 清空任务号
      clear() {
        this.firstTask = '';
        var tsAll = [];
        this.plans.forEach((t, i) => {
              var obj = {};
              Vue.set(obj, 'tId', t.tId);
              Vue.set(obj, 'index', i);
              Vue.set(obj, 'disabled', false);
              tsAll.push(obj);  
            });
            this.tasks = tsAll
            this.tId1.tId ='';
            this.tId2.tId ='';
            this.tId3.tId ='';
            this.tId4.tId ='';

      },
      // 重设任务号
      reset(){
        // this.popEdit(this.list[this.$route.params.id-1]);         
        let params={}, plans =[], item = this.list[0];
          if(item.tIds.length>0&&item.state==1){
              params={
                  tId:item.tIds[0]
              }
          }
            var tIds = [], tasks = [];
            this.list[0] && (tIds = this.list[0].tIds)

            tIds.forEach((t, i) => {
              var obj = {};
              Vue.set(obj, 'tId', t);
              Vue.set(obj, 'index', i);
              Vue.set(obj, 'disabled', false);
              tasks.push(obj);
            });

            this.tId1 = tasks[0];
            this.tId2 = tasks[1];
            this.tId3 = tasks[2];
            this.tId4 = tasks[3];
            this.tasks = tasks;
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
        this.model.tIds[0] = this.tId1.tId;
        this.model.tIds[1] = this.tId2.tId;
        this.model.tIds[2] = this.tId3.tId;
        this.model.tIds[3] = this.tId4.tId;

        console.error(this.model.tIds);
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
          let params={}, plans =[];
          let currentUserId = this.userInfo._id;
          if(item.tIds.length>0&&item.state==1){
                  params.tId = item.tIds[0];
                  // user: currentUserId
          }

        params.user = currentUserId;

        this.firstUse = item.firstUse; 
        this.secondUse = item.secondUse; 
        this.thirdUse = item.thirdUse; 
        this.fourthUse = item.fourthUse; 


        Promise.all([
          this.$http.get('/api/pblhjstates/tasks', params), // 经过筛选之后可选的所有的任务号
          this.$http.get('/api/allplanByPicker/' + currentUserId), // 包含cId、mId的详细信息的所有任务计划
          this.$http.get('/api/pblhjstate/' + this.$route.params.id)
          // this.$http.get('/api/pblhjstateBytId/' + this.tIds[0])
        ]).then(function (res) {
          this.tasks = res[0].data; 
          this.plans = res[1].data;
          this.list = res[2].data;
          // var  pblhjstates = res[2].data;
          // console.error(this.list);

          // this.plans = find(this.plans, { picker: this.userInfo._id});

          // 只显示对应当前技术员的所有计划
          // this.plans = this.plans.filter(function(index) {
          //   return index.picker === currentUserId;
          // });

          // if(item.tIds.length>0){
            // plans = cloneDeep(this.plans);
            // var plans = [].concat(this.plans.plan);
              // console.error(plans);

            // var ts = [], tsAll = [], firstTId = item.tIds[0] || '';
            // if (!Array.isArray(plans)) {
            //   ts = [plans.tId];
            // } else {
            //   plans.forEach(t => { 
            //     if (firstTId && t.tId === firstTId) {
            //       ts.push(t.tId);
            //     }
            //     tsAll.push(t.tId);
            //   });
            // }
            // if (ts.length < 1) ts = tsAll

            // this.tasks = item.tIds.concat(ts);

            this.tasks = item.tIds.concat(this.tasks);
            this.tasks = this.tasks.filter(t => t !== '0');
            this.tasks = _.uniq(this.tasks);

          var plans = [];
          // 从prod_proce表中（产品工序）获取跟this.tasks中任务号一直的完整工序数据
          this.tasks.forEach(t => {
            plans = plans.concat( this.plans.filter((p) => p.tId === t) || []);
          });

          this.plans = uniqBy(plans, 'tId');
          // console.error(this.tasks);
          // console.error(this.plans);
          // console.error(this.list);

            var tasks = [];
            this.tasks.forEach((t, i) => {
              var obj = {};
              Vue.set(obj, 'tId', t);
              Vue.set(obj, 'index', i);
              Vue.set(obj, 'disabled', false);
              tasks.push(obj);
            });
            this.tasks = tasks;

            // this.tasks = _.uniq(this.tasks);
            !!item.tIds[0] ? (this.tId1.tId = item.tIds[0]) : this.tId1.tId = 0;
            !!item.tIds[1] ? (this.tId2.tId = item.tIds[1]) : this.tId2.tId = 0;
            !!item.tIds[2] ? (this.tId3.tId = item.tIds[2]) : this.tId3.tId = 0;
            !!item.tIds[3] ? (this.tId4.tId = item.tIds[3]) : this.tId4.tId = 0;

            /**
             * 获取当前value暂存到data属性
             */
            var 
                  tId1 = document.getElementById("tId1")
                , tId2 = document.getElementById("tId2")
                , tId3 = document.getElementById("tId3")
                , tId4 = document.getElementById("tId4");

            this.tasks.forEach((t, i)=> {
              if (i<4 && this.tId1.tId === t.tId && t.index === 0) {
                t.disabled = true;
                tId1.dataset.prev = JSON.stringify(t);
              }
            });
            this.tasks.forEach((t, i)=> {
              if (i<4 && this.tId2.tId === t.tId && t.index === 1) {
                t.disabled = true;
                tId2.dataset.prev = JSON.stringify(t);
              }
            });
            this.tasks.forEach((t, i)=> {
              if (i<4 && this.tId3.tId === t.tId && t.index === 2) {
                t.disabled = true;
                tId3.dataset.prev = JSON.stringify(t);
              }
            });
            this.tasks.forEach((t, i)=> {
              if (i<4 && this.tId4.tId === t.tId && t.index === 3) {
                t.disabled = true;
                tId4.dataset.prev = JSON.stringify(t);
              }
            });

            
            // this.firstTask && this.filterEqualFirstTaskId(this.firstTask.mId);

          // }
        }.bind(this));


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
      findByKey(prodprod,name){
        var obj = find(prodprod.wpc , {key: name}) ;
        //console.log(obj);
        if(obj){
          return obj.value;
        }

        return null;
        
      },
      popWrite(item){

        this.modelWrite = cloneDeep(item);
        // this.modelWrite = cloneDeep(res.data);
        if (item.tIds.length === 0) {
            notify.error('当前设备没有任务号,不能下载请先添加任务号再进行此操作！');
            return;
        }
        this.tasksWrite=[];
        if (this.prodList.length > 0) {
          var fCId = (find(this.prodList, {tId:this.tIds[0] || ''}) || {}).cId || '';

          console.log(item.tIds[0]);

          var prodprod = find(this.prodproces, {tId:item.tIds[0]||'' , sType: 's1'});

          console.log(prodprod);

          // console.error(this.prodproces);
          // console.error(prodprod);
          if (!prodprod) {
            notify.error('未能从工序列表中找到与第一个任务号相关的工序数据，或当前用户无相关工序数据。');
            return;
          }
          for(let i=0;i<item.tIds.length;i++){
              var prod = find(this.prodList, {tId:item.tIds[i]||'' });
                // console.error(prod);
              if (prod) {
                prod.wp.forEach( w => { 
                  //console.log(w.sType);
                  if (w.sType === 's1') {
                    var nametokey = {
                      "排气压力MPa": "pqyl",
                      "排气次数": "pqcs",
                      "升温时间%": "swsj",
                      "升温补偿时间%": "swbcz",
                      "升温极限时间%": "swjxz",
                      "硫化时间S": "lhsj",
                      "硫化压力MPa": "lhyl",
                      "硫化压力差值MPa": "lhylcz",
                      "硫化温度℃": "lhwd",
                      "硫化温度最大值℃": "lhwdzdz",
                      "硫化温度最小值℃": "lhwdzxz"
                    };

                    w.child.forEach( c => { 
                      this.modelWrite[nametokey[c.key]] = c.value = this.findByKey(prodprod,c.key);    
                      //console.log(c.key,this.findByKey(prodprod,c.key));            
                    });


                  }
                })
                if (Array.isArray(prod.mould)) {
                  // prod.mould.forEach((m) => {
                    this.modules.push(prod.mould);
                  // });
                }

                this.tasksWrite.push(prod);
                // Vue.set(this.tasksWrite[i], 'mmId', '');
                // Vue.set(this.tasksWrite[i], 'ccNum', '');
              } 
          }

              // var modelWrite = find(this.tasksWrite, {sType: 's1' });

              // modelWrite.wpc.forEach( m => {
              //   if (m.key == "排气压力")  this.modelWrite.pqyl = m.value ;
              //   if (m.key == "排气次数")  this.modelWrite.pqcs = m.value;
              //   if (m.key == "升温时间")  this.modelWrite.swsj = m.value;
              //   if (m.key == "硫化时间")  this.modelWrite.lhsj = m.value;
              //   if (m.key == "硫化压力")  this.modelWrite.lhyl = m.value;
              //   if (m.key == "硫化压力差值")    this.modelWrite.lhylcz  = m.value;
              //   if (m.key == "硫化温度")        this.modelWrite.lhwd = m.value;
              //   if (m.key == "硫化温度最大值")  this.modelWrite.lhwdzdz = m.value;
              //   if (m.key == "硫化温度最小值")  this.modelWrite.lhwdzxz = m.value;
              // })
        // this.modelWrite = cloneDeep(this.tasksWrite[0]);

          // this.modules = uniqBy(this.modules, 'mId');
          // var tasks = this.tasksWrite.filter(task => fCId === task.cId);
          // this.tasksWrite = uniqBy(tasks, 'tId');
          // this.modelWrite.tasks = find(this.prodList,{tId:item.tIds[0]||''}).cId;

          this.modalWriteShow = true;
        }
      },
      startWork(){

        if (this.WriteTemps.length === 0) {
          notify.error('未选择任务号！');
          return;
        }

        let _this=this;
        this.writeLoading=true;
        var writeInfoList = [];
        /*this.tasksWrite.forEach((item, i) => {
          if (item) {
            var writeInfo = {mould:{}};
            writeInfo.tId = item.tId;
            writeInfo.cId = item.cId;
            // writeInfo.mould = item.mould;
            writeInfo.mould.mId = this.WriteTemps[i].mId;
            writeInfo.mould.ccNum = this.WriteTemps[i].ccNum;
            writeInfoList.push(writeInfo);
          } else {
            writeInfoList.push(0);
          }
        });*/

        // 填充使其达到20个
        for (var i = 0; i < 4; i++) {
          if (this.tasksWrite[i]) {
            var writeInfo = {mould:{}};
            writeInfo.tId = this.tasksWrite[i].tId;
            writeInfo.cId = this.tasksWrite[i].cId;
            // writeInfo.mould = this.tasksWrite[i].mould;
            // writeInfo.mould = this.WriteTemps[i];
            writeInfo.mould.mId = this.WriteTemps[i].mId;
            writeInfo.mould.ccNum = this.WriteTemps[i].ccNum;
            writeInfoList[i] = writeInfo;
          } else {
            writeInfoList[i] = 0;
          }
        }


        this.modelWrite.writeInfoList = writeInfoList;

        var modelWrite = cloneDeep(this.modelWrite);
        modelWrite.lhylcz = modelWrite.lhylcz * 10;
        // modelWrite.lhyl = modelWrite.lhyl * 10;
        // console.error(writeInfoList);

        this.$http
                .put('/api/pblhjstates/write', modelWrite)
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

      },
      write(item){
        this.$http
                .post('/api/pblhjstates/write/client',item)
                .then(function (v) {
                  notify.info('写入数据成功！');
                  console.log('write',v)
                })
                .catch(function (err) {
                  notify.error('写入数据失败！');
                  console.log('write err',err)
                });
      }
    },
      beforeDestroy(){
          clearInterval(this.lhjListInterval);
      },
    data(){
      return {
        devices: Object,
        loading: true,        // 初始化中
        eqIp: '',             // 设备编号
        workUsers: [],        // 所有员工
        tasks: [],
        tasks1: [],
        tasks2: [],
        tasks3: [],
        tasks4: [],
        plans: [],
        prodproces: [],
        firstUse: [],         //第一个任务启停标识
        secondUse: [],        //第二个任务启停标识
        thirdUse: [],         //第三个任务启停标识
        fourthUse: [],        //第四个任务启停标识
        tIds: [],
        tId1: {
          tId: '',
          index: 0
        },
        tId2: {
          tId: '',
          index: 1
        },
        tId3: {
          tId: '',
          index: 2
        },
        tId4: {
          tId: '',
          index: 3
        },
        userInfo: oauth.getUserInfo(),
        firstTask: '',          // 第一个任务号材料牌号
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
        tasksWrite:[],
        WriteTemps:[],
        modules:[],
      }
    }
  }
</script>