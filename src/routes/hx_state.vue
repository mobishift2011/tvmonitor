
<!--todo 若设备未连接，当前状态为未获取-->
<template>
  <div>
    <h1>烘箱设备{{$route.params.id}}状态</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <!--<div class="col-xs-6">-->
          <!--<button class="btn btn-primary btn-sm" @click="popEdit()">新 增</button>-->
        <!--</div>-->
      </div>
      <table class="table table-hover table-condensed">
        <thead>
        <tr>
          <!-- <th>序号</th> -->
          <th>仪表名称</th>
          <!-- <th>任务号</th> -->
          <!-- <th>操作员</th> -->

          <th>设备通讯状态</th>
          <!-- <th>远程/本地</th> -->
          <!-- <th>手动/自动</th> -->
          <th>温度1</th>
          <th>温度2</th>
          <th>温度3</th>
          <th>温度4</th>
          <th>程序运行段</th>
          <th>启停标示</th>
          <!-- <th>仪表通讯状态</th> -->
          <th>烘箱门状态</th>
          <th>实时运行时间</th>
          <th>总时间</th>
          <!-- <th>硫化进度</th> -->

          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <!-- <tr v-for="i in list"> -->
        <tr>
          <!-- <th scope="row">{{$index + 1}}</th> -->
          <td>{{device.ybName}}</td>
          
          <!-- <td>{{getWorkUserName(device.picker)}}</td> -->

          <td>{{device.connectState}}</td>
          <!-- <td>{{device.ycOrbd}}</td> -->
          <!-- <td>{{device.sdOrzd}}</td> -->
          <td>{{device.wd1}}</td>
          <td>{{device.wd2}}</td>
          <td>{{device.wd3}}</td>
          <td>{{device.wd4}}</td>
          <td>{{device.cxyxd}}</td>
          <td>{{device.qtbs}}</td>
          <!-- <td>{{device.ybtxzt}}</td> -->
          <td>{{device.hxmzt}}</td>
          <td>{{device.ssyxsj}}</td>
          <td>{{device.zsj}}</td>
          <!-- <td>{{device.lhjd}}</td> -->
          <td>
            <template v-if="device.qtbs*1==0 && device.connectState*1==1">
              <input type="button" value="添加" class="btn btn-primary btn-sm glyphicon-edit" @click="popEdit(device)">
              <input type="button" value="下载" class="btn btn-primary btn-sm glyphicon-play" @click="popWrite(device)">
            </template>
          </td>
        </tr>
        <tr>
          <td><strong>材料牌号</strong></td>
          <td>{{device.cId}}</td>
          <td><strong>产品性质</strong></td>
          <td>{{device.nature}}</td>
          <td><strong>任务号</strong></td>
          <td colspan="11">
            <span v-for="t in device.tIds" track-by="$index">
              <!-- <strong>{{$index + 1}}.</strong>{{t.prod_proce && (t.prod_proce.tId || '')}} -->
              <strong>{{$index + 1}}.</strong>{{t.tId}}
            </span>
          </td>
        </tr>
        </tbody>
      </table>
      <hx-monitor :device="device"></hx-monitor>
    </div>
    <modal :title="model._id ? '修改设备状态': '新增设备状态'" :show.sync="modalEditShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="submit" :backdrop="false">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-error" v-show="error">
          <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">材料牌号</label>
          <div class="col-sm-9">
            <div class="input-group">
              <select v-model="model.cId" @change="cIdChange($event)" class="form-control">
                <option value="">--请选择--</option>
                <option :value="cidVal" v-for="cidVal in cidList" :key="cidVal">{{cidVal}}</option>
              </select>              
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">产品性质</label>
          <div class="col-sm-9">
            <div class="input-group">
              <select v-model="model.nature" @change="natureChange($event)" class="form-control">
                <option value="">--请选择--</option>
                <option value="金属件">金属件</option>
                <option value="纯橡胶件">纯橡胶件</option>
              </select>
            </div>
          </div>
        </div>
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
              <button class="btn btn-primary" @click="reset" type="button">
                <span>恢复原始任务号</span>
              </button>
            </div>
            <div class="input-group" v-for="tId in model.tIds" track-by="$index">
              <span class="input-group-addon">{{$index + 1}}</span>
              <select v-model="tId.tId" @change="tIdChang($event)" class="form-control">
                <option value="">--请选择--</option>
                <option :value="t.tId" :selected="t.tId === tId.tId" :disabled="t.selected === 1"  v-for="t in tasks" >{{t.tId}}</option>
              </select>
              <span class="input-group-btn">
                <button class="btn btn-danger" @click="onDeleteTId($index, tId.tId)" type="button">
                  <span class="glyphicon glyphicon-trash"></span>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </modal>
    <modal title="警告" :show.sync="modalDelShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="certainDel" small>
      <div slot="modal-body" class="modal-body">
        确定删除设备“{{delModel.ybCode}}”？
      </div>
    </modal>
    <!--写入信息-->
    <modal title="" :show.sync="modalWriteShow" effect="fade" cancel-text="取 消"
           ok-text="写 入" :callback="startWork" :backdrop="false">
      <div slot="modal-header" class="modal-header">
        <button type="button" class="close" @click="modalWriteShow = false"><span>×</span></button>
        <h4 class="modal-title">
          写入信息
        </h4>
        <div class="modal-loading" v-show="writeLoading"><img src="../assets/img/loading.gif"></div>
      </div>
      <div slot="modal-body" class="modal-body form-horizontal">
        <!-- <div class="form-group">
          <label class="col-sm-3 control-label">任务号</label>
          <div class="col-sm-9 padding-top7">
          {{modelWrite.tIds[0].tId}}
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">材料牌号</label>
          <div class="col-sm-9 padding-top7">{{modelWrite.pNum}}</div>
        </div> -->
        <table class="table table-condensed">
          <thead><tr>
            <td><strong>任务号</strong></td>
            <td><strong>材料牌号</strong></td>
          </tr></thead>
          <tbody>
            <tr v-for="task in tasksWrite" v-if="task.tId !== '0'">
              <td>{{task.tId}}</td>
              <td>{{task.cId}}</td>
            </tr>
          </tbody>
        </table>
        <div class="form-group">
          <label class="col-sm-3 control-label">二段硫化参数</label>
          <div class="col-sm-9">
            <div class="half">
              <p v-for="sj in modelWrite.sj" v-if="sj !== '0'" track-by="$index">
                时间{{$index+1}}: <strong>{{sj}}</strong> min
              </p>
            </div>
            <div class="half">
              <p v-for="wd in modelWrite.wd" v-if="wd !== '0'" track-by="$index">
                温度{{$index+1}}: <strong>{{wd}}</strong> ℃
              </p>
            </div>
          </div>
        </div>
      </div>
    </modal>

  </div>
</template>

<script>
  import {cloneDeep, find, findIndex, uniqBy, uniq} from 'lodash';
  import {modal} from 'vue-strap';
  import HxMonitor from './hx_monitor.vue';

  import {planState} from '../utils/label';
  import notify from '../components/notify';
  import oauth from '../utils/oauth';
  import Vue from 'vue';
  export default{
    components: {
      modal,
      HxMonitor
    },
    ready(){
      this.switchData(this.$route.params.id);
      this.getCids();
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
    methods: {
      reset() {
        if (this.device.tIds.length > 0) 
          this.firstTask = find(this.prodList,{tId:this.device.tIds[0].tId ||''});

          this.tasks = cloneDeep(this.optionalTsks)
          this.tasks = this.tasks.concat(this.device.tIds);
            // this.tasks=uniqBy(this.tasks, 'tId');
          this.error = '';
          this.model = cloneDeep(this.device) || {tIds: []};
          this.firstTask && this.filterEqualFirstTaskId(this.firstTask.cId);
      },
      tIdChang(event) {
        var val = event.target.value;
        var opt = this.tasks.find(t => t.tId === val);
        opt && (opt.selected = 1);

        if (!this.firstTask.tId) 
          this.firstTask = find(this.prodList,{tId:this.model.tIds[0].tId ||''});
        this.firstTask.cId && this.filterEqualFirstTaskId(this.firstTask.cId);

      },
      filterTIds() {
        this.model.tIds = [];
        let planDict = {};
        let model = this.model;
        this.allPlans.forEach(item=>{
          if(model.nature && item.nature != model.nature) {
            return
          }
          if(model.cId && item.cId != model.cId) {
            return
          }
          planDict[item.tId] = true;
        });

        let filterTsks = this.optionalTsks.filter(item=>{
          let result = planDict[item.tId] == true;
          if (result) {
            item.selected = 0;
          }
          return result
        });
        this.tasks = cloneDeep(filterTsks);
      },
      cIdChange(event) {
        var val = event.target.value;
        this.model.cId = val;
        this.filterTIds();
      },
      natureChange(event) {
        var val = event.target.value;
        this.model.nature = val;
        this.filterTIds();
      },
      filterEqualFirstTaskId(firstCId) {
        if (!firstCId) return;
        var sameTasks = [], sameTIds =[], optional = [];

        // 获取图号跟第一个任务号相同的所有任务
        sameTasks = this.prodList.filter(item => item.cId === firstCId);
        // 过滤掉不可再次添加的任务
        this.tasks.forEach(i => {
          sameTasks.forEach(ic => {
            if (i.tId === ic.tId) {
              optional.push(i);
            }
          });
        });
        this.tasks = optional;
      },
      stringify(param) {
        return JSON.stringify(param);
      },
      /**
       * 数据切换
       */
      switchData(num) {
        Promise.all([
          this.$http.get('/api/workusers/field'),
          this.$http.get('/api/hxstates'),
          this.$http.get('/api/prodprods4lh'),
          this.$http.get('/api/prodproces')
        ]).then(function (res) {
          this.workUsers = res[0].data;
          this.list = res[1].data;
          if (this.list.length > 0) {
            this.device = this.list[num-1];
            this.device.cId = this.device.cId || "";
            this.device.nature = this.device.nature || "";
          }
          this.prodList=res[2].data;
          this.prodproces=res[3].data;
          this.loading = false;
        }.bind(this));
      },
      getCids() {
        this.$http.get('/api/jiaoliaos/pids').then(res=>{
          this.cidList = res.data;
        });
      },
      getLiji(){
        let time=30 * 1000,_this=this;
        this.hxListInterval=setInterval(function(){
          _this.refresh();
        },time)
      },
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      canEdit(item){
        return this.userInfo._id === item.adder;
      },
      onAddTId(){
        if(this.model.tIds.length < 30 ){
          this.model.tIds.push({tId: '', selected: 0});
        }else{
            this.error = '最多添加30个任务号';
        }
      },
      onDeleteTId(index, tId){
        // var tId = tId.selected = 0;
        // var task = [index];
        this.tasks.forEach(function (item) {
          if (item.tId == tId) {
            item.selected = 0;
          }
        }.bind(this));
        this.model.tIds.splice(index, 1);
        // 删除所有之后回复所有可选的任务号
        if (this.model.tIds.length === 0) {
          this.tasks = cloneDeep(this.optionalTsks)
          this.firstTask = {};
        }
      },
      onDeleteAll(){
        this.model.tIds = [];
        // 删除所有之后回复所有可选的任务号
        if (this.model.tIds.length === 0) {
          this.tasks = cloneDeep(this.optionalTsks)
          this.firstTask = {};
        }
      },
      refresh(){
          let timeStamp=new Date().getTime();
          this.$http.get('/api/hxstates',{time:timeStamp}).then(function(data){
            notify.info('刷新数据成功！');
            this.list = data.data;
            if (this.list.length > 0)
              this.device = this.list[this.$route.params.id-1];

          }.bind(this))
      },
      /**
       * 校验提交信息
       * @returns {boolean}
       */
      valid(){
        if (!this.model.ybCode) {
          this.error = '请输入设备ID';
          return false;
        }

        var tIds = this.model.tIds;

        if (!this.model._id && (!tIds.length || !tIds.every(function (item) {
                  return !!item;
                }))) {
          this.error = '请输入任务号';
          return false;
        }

        if (uniq(tIds).length !== tIds.length) {
          this.error = '任务号不允许重复';
          return false;
        }

        var flag = false;
        this.model.tIds.forEach(t => {
          if (this.firstTask && t.tId !== this.firstTask.tId) {
            var task = find(this.prodList,{tId:t.tId ||''});
            if (task.cId !== this.firstTask.cId) {
              this.error = '添加的任务号必须是其材料牌号和第一个任务材料牌号相同才能添加！';
              flag = true;
            }
          }
        });
        if (flag) return false;

        this.error = '';
        return true;
      },
      /**
       * 提交信息
       */
      submit(){
        if (!this.valid()) return;
        var id = this.model._id;
        var hasTId = this.device.tIds.length > 0;
        var tIds = uniqBy(this.model.tIds, 'tId');
        tIds.map(t => t.selected = 1);
        if (hasTId) {
          this.$http
                  .put(`/api/hxstate/${id}`, this.model)
                  .then(function (res) {
                    if (res.data.code === 1000) {
                      this.error = res.data.msg;
                    } else {
                      this.modalEditShow = false;
                      this.refresh();
                      notify.info('修改成功！');
                      this.switchData(this.$route.params.id);
                    }
                  })
                  .catch(error);

        } else {
          this.model.tIds = tIds;
          this.$http
                  .post('/api/hxstate', this.model)
                  .then(function (res) {
                    this.modalEditShow = false;
                    this.list.unshift(res.data);
                    notify.info('新增成功！');
                    this.switchData(this.$route.params.id);
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
      popEdit(item) {
        if (item.tIds.length > 0) 
          this.firstTask = find(this.prodList,{tId:item.tIds[0].tId ||''});

        let planUrl = '/api/allplans';
        let params = {};
        if(this.model.cId) {
          params.cId = this.model.cId;
        }
        if(this.model.nature) {
          params.nature = this.model.nature;
        }
        if(params){
          planUrl += '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
        }
        Promise.all([
          this.$http.get(planUrl),
          this.$http.get('/api/hxstates/tasks')
        ]).then(
          function(res) {
            let planDict = {};
            let model = this.model;
            this.allPlans = res[0].data;
            this.allPlans.forEach(item=>{
              if(model.nature && item.nature != model.nature) {
                return
              }
              if(model.cId && item.cId != model.cId) {
                return
              }
              planDict[item.tId] = true;
            });

            let data = res[1];
            this.optionalTsks = data.data;
            this.optionalTsks = this.optionalTsks.concat(item.tIds);

            let filterTsks = this.optionalTsks.filter(item=>{
              return planDict[item.tId] == true;
            });
            this.tasks = cloneDeep(filterTsks)
            this.tasks = this.tasks.concat(item.tIds);
              // this.tasks=uniqBy(this.tasks, 'tId');
            this.error = '';
            this.model = cloneDeep(item) || {tIds: []};

            this.firstTask && this.filterEqualFirstTaskId(this.firstTask.cId);
            this.modalEditShow = true;
          }.bind(this)
        );
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
              .delete(`/api/hxstate/${this.delModel._id}`)
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
          this.modelWrite = cloneDeep(item);
          var hXDevicId = this.modelWrite._id;
          // this.model.tIds && (item.tIds = this.model.tIds);
          // this.modelWrite.pNum = 
          if (item.tIds.length === 0) {
              notify.error('当前烘箱设备没有任务号,不能下载请先添加任务号再进行此操作！');
              return;
          }

          var _tasks = [], times = [], temp = [];
          if (this.prodList.length > 0) {
            var fCId = (find(this.prodList, {tId:item.tIds[0].tId || ''}) || {} ).cId || '';
            var prodprod = find(this.prodproces, {tId:item.tIds[0].tId ||'' , sType: 's2'});
            // for(let i=0;i<item.tIds.length;i++){
            this.tasksWrite = [];
            for(let i=0;i<30;i++) {
              if (item.tIds[i]) {
                var p = find(this.prodList, {tId:item.tIds[i].tId||''});
                this.tasksWrite.push(p);
                _tasks.push({selected: "1", tId: p.tId});
              } else {
                _tasks.push({selected: "0", tId: "0"});  
              }
              
            }
            var wd = [], sj =[];
            prodprod.wpc.forEach( w => {
              if(/温度/.test(w.key)) {
                wd.push(w.value);
              }
              if(/时间/.test(w.key)) {
                sj.push(w.value);
              }
            });

            this.modelWrite.sj = sj;
            this.modelWrite.wd = wd;

            /*
            for(let _i=0;_i<60;_i++) {
              if (item.sj[_i]) {
                times.push(item.sj[_i]);
              } else {
                times.push("0");
              }
              if (item.wd[_i]) {
                temp.push(item.wd[_i]);
              } else {
                temp.push("0");
              }
            }
*/
            if (!fCId) {
               notify.error('当前任务号没有材料牌号。');
              return;
            }
            this.modelWrite.tIds = _tasks;
            // this.modelWrite.sj = times;
            // this.modelWrite.wd = temp;
            
            /*var tasks = this.prodList.filter(task => {
              task = Object.assign(this.modelWrite, task);
              return fCId === task.cId;
            });
            this.modelWrite._id = hXDevicId;
            this.tasksWrite = uniqBy(tasks, 'tId');*/

            // this.modelWrite.tasks = find(this.prodList,{tId:item.tIds[0]||''}).mId;
            this.modalWriteShow = true;
          }
      },
        /**
         * 写入
         * @param item
         */
      startWork(){
        let _this=this;
        this.writeLoading=true;

        this.$http
            .put('/api/hxstates/write',this.modelWrite)
            .then(function () {
                _this.writeLoading=false;
                _this.refresh();
                _this.modalWriteShow = false;
              notify.info('写入数据成功！');
            })
            .catch(function () {
                this.writeLoading=false;
              notify.error('写入数据失败！');
            });

      }
    },
    beforeDestroy(){
      clearInterval(this.hxListInterval);
    },
    data(){
      return {
        device: Object,
        loading: true,        // 初始化中
        workUsers: [],        // 所有员工
        userInfo: oauth.getUserInfo(),
        modalEditShow: false, // 弹窗显示
        tasks: [],
        optionalTsks: [],
        firstTask: '',          // 第一个任务号材料牌号
        model: {},　　　　　　　// 当前新增/修改的model
        list: [],             // 所有数据
        modalDelShow: false,  // 删除弹窗显示
        delModel: '',         // 当前删除的model
        error: '' ,            // 错误信息
        hxListInterval:'',
        tasksWrite: [],
        modelWrite:{},
        modalWriteShow:false,
        prodList:[],   //生产计划
        writeLoading:false,
        prodproces: [],

        allPlans: [],
        cidList: [] // 材料牌号列表
      }
    }
  }
</script>