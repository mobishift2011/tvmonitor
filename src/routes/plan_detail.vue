<style lang="less">
  .plan-detail h1 {
    padding-top: 0;
  }
</style>

<template>
  <div class="plan-detail content">
    <ol class="breadcrumb">
      <li><a v-link="{path: '/allplan'}">所有计划</a></li>
      <li class="active">计划详情</li>
    </ol>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper mould-detail">
        <h1>计划信息</h1>
        <table class="table table-condensed">
          <tbody>
          <tr>
            <th>计划名称</th>
            <td>{{plan.ppName}}</td>
            <th>任务单号</th>
            <td>{{plan.tId}}</td>
            <th>材料牌号</th>
            <td>{{plan.cId}}</td>
          </tr>
          <tr>
            <th>产品图号</th>
            <td>{{plan.mId}}</td>
            <th>任务性质</th>
            <td>{{plan.special}}</td>
            <th>计算材料数量</th>
            <td>{{plan.cNum}}</td>
          </tr>
          <tr>
            <!-- <th>模具名称</th> -->
            <!-- <template v-if="plan.mould.length>0">   -->
            <!-- <td>{{plan.mould[0].mName}}</td> -->
            <th>模具编号</th>
            <td colspan="5">
              <template v-for="m in plan.mould">
                <strong>{{$index+1}}.&nbsp;</strong>
                <span style="color:#888;">{{m.mId}}&nbsp;&nbsp;&nbsp;&nbsp;</span></template>  
            </td>
            <!-- <th>有效模腔数 </th> -->
            <!-- <td>{{plan.mould[0].ccNum}}</td> -->
            <!-- </template> -->
          </tr>
          <tr>
            <th>开始时间</th>
            <td>{{plan.staTime | moment}}</td>
            <th>交付时间</th>
            <td>{{plan.endTime | moment}}</td>
            <th>计划进度</th>
            <td>{{{planState(plan)}}}</td>
          </tr>
          <tr>
            <th>入检批次号</th>
            <td>{{plan.rId}}</td>
            <th>计划员</th>
            <td>{{getWorkUserName(plan.planer)}}</td>
            <th>技术员</th>
            <td>{{getWorkUserName(plan.skiller)}}</td>

          </tr>
          <tr>
            <th>校对员</th>
            <td>{{getWorkUserName(plan.checker)}}</td>
            <th>调度员</th>
            <td>{{getWorkUserName(plan.dispatcher)}}</td>
            <th>班长</th>
            <td>{{getWorkUserName(plan.grouper)}}</td>
          </tr>
          <tr>
            <th>操作员</th>
            <td>{{getWorkUserName(plan.picker)}}</td>
            <th>发料员</th>
            <td>{{getWorkUserName(plan.issuer)}}</td>
            <th>校验员</th>
            <td>{{getWorkUserName(plan.tester)}}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="content-wrapper" v-show="!loading && plan.state >= 6">
      <div class="operation-wrapper">
        <h1>工艺列表</h1>
      </div>
      <table class="table table-hover table-condensed">
        <thead>
        <tr>
          <th>序号</th>
          <th>产品名称</th>
          <th>任务单号</th>
          <th>材料牌号</th>
          <th>工序</th>
          <th>工时</th>
          <th>技术员</th>
          <th>互检员</th>
          <th>检验员</th>
          <th>自检数值</th>
          <th>互检数值</th>
          <th>专检数值</th>
          <th>合格</th>
          <th>不合格</th>
          <th>检验备注</th>
          <th>交检日期</th>
          <th>状态</th>
          <th>硫化状态</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="i in list">
          <th scope="row">{{$index + 1}}</th>
          <td>{{i.ppId.ppName}}</td>
          <td>{{i.ppId.tId}}</td>
          <td>{{i.ppId.cId}}</td>
          <td>
            <strong>{{i.index + 1}}.{{i.wp}}</strong>
            <div v-for="w in i.wpc">{{w.key}}:{{w.value}}</div>
          </td>
          <td>{{i.time}}</td>
          <td>{{getWorkUserName(i.worker)}}</td>
          <td>{{getWorkUserName(i.checker)}}</td>
          <td>{{getWorkUserName(i.tester)}}</td>
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
          <td>{{i.qNum}}</td>
          <td>{{i.cNum}}</td>
          <td>{{i.comment}}</td>
          <td>{{i.date | moment}}</td>
          <td>{{{proceState(i)}}}</td>
          <td>{{{proceProdState(i)}}}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="content-wrapper no-print" v-show="!loading && plan.state >= 6">
      <div class="operation-wrapper">
        <h1>硫化机历史数据</h1>
        <Pblhj-filter :t-id="plan.tId"></Pblhj-filter>
      </div>
    </div>
    <div class="content-wrapper no-print">
      <div class="operation-wrapper">
        <div>
          <button type="button" class="btn btn-primary pull-right" v-link="{path: '/hxmonitorprint/'+plan.tId}">打印</button>
          <h1>二段硫化历史曲线</h1>
        </div>
        <hx-monitor :t-id="plan.tId"></hx-monitor>
      </div>
    </div>
    </div>  
  </div>
</template>

<script>
  import {find} from 'lodash';
  import {modal} from 'vue-strap';
  import echarts  from '../assets/js/echarts.min';
  import moment from 'moment';
  import HxMonitor from './hx_monitor_taskid';
  import PblhjFilter from './pblhj_monitor_filter';

  import {proceState, planState, proceProdState} from '../utils/label';

  export default{
    components: {
      modal,
      HxMonitor,
      PblhjFilter
    },
    methods: {
      proceState: proceState,
      planState: planState,
      proceProdState:proceProdState,
      getWorkUserName(id){
        return (find(this.workUsers, {_id: id}) || {}).wuName;
      },
      draw(){
        if (!this.device && this.device._id) {
            notify.error('请选择设备');
            return;
        }
        this.ybCode = this.device._id;
        this.hxChart = echarts.init(document.getElementById('hx'));
        var drawInterval=60*1000;
        var nowDate = new Date().getTime();
        var startDate = this.startTime||(this.endTime?'':(nowDate - 8 * 60 * 60 * 1000));
        var endDate =this.endTime||(this.startTime?'':nowDate)
        this.drawTimer&&clearInterval(this.drawTimer)
        var _this=this;
        this.$http.post('/api/hxmonitor', {id: this.ybCode, start: moment(startDate), end: moment(endDate)})
        .then(function (res) {
            var data = res.data;
            if (!data.length) {
                _this.showChart = false;
                return
            }else{
                _this.showChart = true
            };
            _this.list = [last(data)];
            var preSeriesData = getDataListByKeys(data, lines)
            var option = {
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: lines
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
                    data: convertXAxis(data)
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter: '{value}'
                    }
                },
                series: Object.keys(preSeriesData).map(v => preSeriesData[v])
            };
            _this.chart.setOption(option);

            _this.drawTimer = setInterval(() => {
                _this.$http.post('/api/hxmonitorLastData', {ybCode: _this.ybCode}).then(v => {
                    let data  = v.data
                    option.xAxis.data.shift()
                    option.xAxis.data.push(moment(data[0].addDate).format('YYYY-MM-DD HH:mm'))
                    option.series.map(item => {
                        item.data.shift()
                        item.data.push(data[0][item.key])
                    })

                    _this.chart.setOption(option)
                })
            },drawInterval)
        });

    }
    },
    created(){
      var id = this.$route.params.id;
      Promise.all([
        this.$http.get(`/api/workusers/field`),
        this.$http.get(`/api/allplan/${id}`)  ,
        this.$http.get('/api/hxstates'),
      ])
      .then(function (res) {
        this.workUsers = res[0].data;
        this.plan = res[1].data.plan;

        // console.error(this.plan);
        this.list = res[1].data.wps;
        var device = res[2].data;
        this.loading = false;

        // console.error(this.plan);
        return this.plan.tId;
      }.bind(this))
      .then(function (tId) {
        // return this.$http.post('/api/hxmonitorbytid', {tId: tId})
      }.bind(this))
      .then(function (hx) {
        // console.error(hx);
        // this.hxData = hx.data;
      }.bind(this));
    },
    data(){
      return {
        device: Object,
        hxData: [],
        loading: true,        // 初始化中
        plan: {},             // 数据
        list: [],             // 工艺列表
        workUsers: [] ,        // 所有员工
        showChart: false,
        hxChart: Object,
        pblhjChart: Object,
        mould:[]//模具
      }
    }
  }
</script>