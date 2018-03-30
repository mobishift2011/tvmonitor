<style lang="less">

</style>

<template>
  <div>
    <div class="content-wrapper">
      <div class="operation-wrapper row">
        <div class="col-xs-3">
          <select class="form-control input-sm" v-model="deviceId">
            <option value="">--请选择设备--</option>
            <option value="{{d.id}}" v-for="d in devices">{{d.id}}</option>
          </select>
        </div>
      </div>
      <table class="table table-hover table-condensed" v-if="device && device.s1">
        <thead>
        <tr>
          <th>设备编号</th>
          <th>硫化时长<span v-if="proce">({{proce.wpc[0].value}})</span></th>
          <th>温度<span v-if="proce">({{proce.wpc[1].value}})</span></th>
          <th>压力<span v-if="proce">({{proce.wpc[3].value}})</span></th>
          <th>状态</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <!--<th>{{$index + 1}}</th>-->
          <!--<td>{{i.addDate | moment 'YYYY-MM-DD HH:mm:ss'}}</td>-->
          <!--<td>{{i.eqId}}</td>-->
          <!--<td>{{i.tId}}</td>-->
          <!--<td>{{i.lhl}}&nbsp;{{{dateState(proce.wpc[0].value, i.lhl)}}}</td>-->
          <!--<td>{{i.smt}}&nbsp;{{{tempState(proce.wpc[1].value, i.smt)}}}</td>-->
          <!--<td>{{i.xmt}}&nbsp;{{{tempState(proce.wpc[2].value, i.xmt)}}}</td>-->
          <!--<td>{{i.yl}}&nbsp;{{{tempState(proce.wpc[3].value, i.yl)}}}</td>-->
          <td>444444</td>
          <td>40</td>
          <td>150</td>
          <td>140</td>
          <td><label class="label label-success">启动</label></td>
        </tr>
        </tbody>
      </table>
      <table class="table table-hover table-condensed" v-if="device && device.s1">
        <thead>
        <tr>
          <th>时间</th>
          <th>模具</th>
          <th>任务单号</th>
          <th>模次</th>
          <th>温度</th>
          <td>操作</td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list">
          <td>{{i.time}}</td>
          <td>{{i.name}}</td>
          <td>{{i.tId}}</td>
          <td>{{i.m}}</td>
          <td>{{i.tmp}}&nbsp;<label class="label label-success">正常</label></td>
          <td>
            <button class="btn btn-primary btn-xs" @click="popT1(i)">添加</button>
          </td>
        </tr>
        </tbody>
      </table>
      <table class="table table-hover table-condensed" v-if="device && device.s2">
        <thead>
        <tr>
          <th>时间</th>
          <th>设备编号</th>
          <th>任务单号</th>
          <th>标准温度<span v-if="proce">({{proce.wpc[0].value}})</span></th>
          <th>标准时间<span v-if="proce">({{proce.wpc[1].value}})</span></th>
          <th>实际温度<span v-if="proce">({{proce.wpc[2].value}})</span></th>
          <th>实际时间</th>
          <th>班长</th>
          <th>操作员</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <!--<td>{{i.addDate | moment 'YYYY-MM-DD HH:mm:ss'}}</td>-->
          <!--<td>{{i.eqId}}</td>-->
          <!--<td>{{i.tId}}</td>-->
          <!--<td>{{i.temp}}&nbsp;{{{tempState(proce.wpc[0].value, i.temp)}}}</td>-->
          <!--<td>{{i.st}}&nbsp;{{{dateState(proce.wpc[1].value, i.st)}}}</td>-->
          <!--<td>{{i.ct}}&nbsp;{{{dateState(proce.wpc[2].value, i.ct)}}}</td>-->

          <td>20</td>
          <td>555555</td>
          <td>
            <div v-for="t in tasks">{{t}}</div>
          </td>
          <td>100</td>
          <td>40</td>
          <td>100&nbsp;<label class="label label-success">正常</label></td>
          <td>40&nbsp;<label class="label label-success">正常</label></td>
          <td>小李</td>
          <td>小王</td>
          <td><label class="label label-success">启动</label></td>
          <td>
            <button class="btn btn-primary btn-sm" @click="popT">添加任务单号</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div id="main" style="height:400px;"></div>
    <modal title="添加任务单号" :show.sync="modalShow" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="addTask">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-group">
          <label class="col-sm-3 control-label">任务单号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.tId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
      </div>
    </modal>
    <modal title="添加任务单号" :show.sync="modalT1Show" effect="fade" cancel-text="取 消" ok-text="确 定" :callback="addT1">
      <div slot="modal-body" class="modal-body form-horizontal">
        <div class="form-group">
          <label class="col-sm-3 control-label">任务单号</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.tId" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-3 control-label">模次</label>
          <div class="col-sm-9">
            <input type="text" v-model="model.m" maxlength="50" class="form-control input-sm"/>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import {find, extend, cloneDeep, findIndex, indexOf, groupBy} from 'lodash';
  import {modal} from  'vue-strap';
  import moment from 'moment';
  import echarts  from '../assets/js/echarts.min';

  import {dateState, tempState} from '../utils/label';
  import notify from '../components/notify';

  export default{
    components: {
      modal
    },
    methods: {
      dateState: dateState,
      tempState: tempState,
      drawS1(deviceId, data){
//        this.proce = find(this.proces, {
//          eqId: deviceId,
//          sType: this.device.s1 ? 's1' : 's2',
//          tId: data.tId
//        });


        var xAxisData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        var seriData = {
          s1: [147, 150, 151, 152, 151, 151, 152, 153, 153, 151],
          s2: [156, 156, 154, 156, 151, 151, 154, 157, 153, 152],

          x1: [150, 153, 153, 155, 151, 151, 152, 153, 153, 150],
          x2: [148, 147, 153, 150, 158, 155, 151, 153, 151, 150],

          yl: [0, 140, 140, 140, 140, 140, 140, 140, 140, 0]
        };
//        xAxisData.push(moment(data.addDate).format('HH:mm:ss'));
//        seriData.smt.push(data.smt);
//        seriData.xmt.push(data.xmt);
//        seriData.yl.push(data.yl);

        this.chart = echarts.init(document.getElementById('main'));

        var option = {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['上1号模具', '上2号模具', '下1号模具', '下2号模具', '压力']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: '{value}'
            }
          },
          series: [
            {
              name: '上1号模具',
              type: 'line'
            },
            {
              name: '上2号模具',
              type: 'line'
            },
            {
              name: '下1号模具',
              type: 'line'
            },
            {
              name: '下2号模具',
              type: 'line'
            },
            {
              name: '压力',
              type: 'line'
            }
          ]
        };

        this.chart.setOption(option);

        this.chart.setOption({
          xAxis: {
            data: xAxisData
          },
          series: [
            {data: seriData.s1},
            {data: seriData.s2},
            {data: seriData.x1},
            {data: seriData.x2},
            {data: seriData.yl}
          ]
        });

//        this.list.$set(0, data);
      },
      drawS2(deviceId, data){
//        this.proce = find(this.proces, {
//          eqId: deviceId,
//          sType: this.device.s1 ? 's1' : 's2',
//          tId: data.tId
//        });


        var xAxisData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 161, 17, 18, 19, 20];
        var seriData = {
          temp: [25, 70, 70, 70, 70, 100, 100, 100, 100, 100, 130, 130, 130, 130, 130, 180, 180, 180, 180, 180]
        };
//        xAxisData.push(moment(data.addDate).format('HH:mm:ss'));
//        seriData.smt.push(data.smt);
//        seriData.xmt.push(data.xmt);
//        seriData.yl.push(data.yl);

        this.chart = echarts.init(document.getElementById('main'));

        var option = {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['温度']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: '{value}'
            }
          },
          series: [
            {
              name: '温度',
              type: 'line'
            }
          ]
        };

        this.chart.setOption(option);

        this.chart.setOption({
          xAxis: {
            data: xAxisData
          },
          series: [
            {data: seriData.temp}
          ]
        });

//        this.list.$set(0, data);
      },
      popT(){
        this.model = {};
        this.modalShow = true;
      },
      addTask(){
        this.tasks.push(this.model.tId);
        this.modalShow = false;
      },
      popT1(item){
        this.model = cloneDeep(item);
        this.modalT1Show = true;
      },
      addT1(){
        this.list.$set(this.model.index, this.model);
        this.modalT1Show = false;
      }
    },
    ready(){
      Promise.all([
        this.$http.get('/api/monitorproce/devices'),
        this.$http.get('/api/monitorproce/proces', {state: 0})
      ]).then(function (res) {
        this.devices = res[0].data;
        this.proces = res[1].data;
      }.bind(this));
    },
    watch: {
      deviceId(deviceId){
        if (this.chart) {
          this.chart.dispose();
        }

        if (!deviceId) {
          this.device = '';
          this.proce = '';
          return;
        }

        this.device = find(this.devices, {id: deviceId});

        if (this.device.s1) {
          //this.$http.get(`/api/monitorproce/data/s1`, {eqId: deviceId})
          //.then(function (res) {
          this.drawS1(deviceId);
          //});
        } else {
          this.drawS2(deviceId);
        }


      }
    },
    data(){
      return {
        chart: '',            // 图表
        deviceId: '',         // 设备编号
        device: '',           // 当前设备
        devices: [],          // 所有设备
        proces: [],           // 所有工艺
        proce: '',            // 工艺信息
        xAxisData: [],
        seriData: {
          lhl: [],
          smt: [],
          xmt: [],
          yl: []
        },
        interval: null,
        loading: true,        // 初始化中
        modalShow: false,
        modalT1Show: false,
        tasks: ['tttttt'],
        model:{},
        list: [
          {
            index: 0,
            time: 10,
            name: '上1号模具	',
            tId: '',
            m: '',
            tem: 150
          },
          {
            index: 1,
            time: 10,
            name: '上2号模具	',
            tId: '',
            m: '',
            tem: 150
          },
          {
            index: 2,
            time: 10,
            name: '下1号模具	',
            tId: '',
            m: '',
            tem: 150
          },
          {
            index: 3,
            time: 10,
            name: '下2号模具	',
            tId: '',
            m: '',
            tem: 150
          }
        ]
      }
    }
  }
</script>