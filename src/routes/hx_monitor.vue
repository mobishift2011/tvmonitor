<style lang="less">
    .chart-wrap {
        border-top: solid 1px #ddd;
    }
</style>
<template>
        <div class="chart-wrap">
        <!-- <h1>烘箱实时曲线</h1> -->
        <!-- <div class="content-wrapper"> -->
            <div class="operation-wrapper row">
                <!-- <div class="col-xs-3">
                    <select @change="draw" class="form-control input-sm" v-model="ybCode">
                        <option value="">--请选择仪表--</option>
                        <option value="{{d._id}}" v-for="d in devices">{{d.ybName}}</option>
                    </select>
                </div> -->
                <!--<div class="col-xs-2">-->
                    <!--<date-picker :time.sync="startTime | moment" placeholder="开始时间"></date-picker>-->
                <!--</div>-->
                <!--<div class="col-xs-2">-->
                    <!--<date-picker :time.sync="endTime | moment" placeholder="结束时间"></date-picker>-->
                <!--</div>-->
                <!--<div class="col-xs-3">-->
                    <!--<button class="btn btn-primary btn-sm" @click="draw()">查 询</button>-->
                <!--</div>-->

            </div>
            <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="" >
                <div   id="main" style="height:400px;" ></div>
            </div>

            <div  style="display: flex !important;justify-content: center;align-items: center;height: 400px" v-show="!showChart"><h1>二段硫化没开始 </h1></div>
        </div>
</template>

<script>
    import {find, extend, cloneDeep, findIndex, indexOf, last} from 'lodash';
    import {modal} from  'vue-strap';
    import moment from 'moment';
    import echarts  from '../assets/js/echarts.min';

    import notify from '../components/notify';
    import {getDataListByKeys,convertXAxis} from '../utils/chartFormat'
    var lines = [{'key':'wd1','name': '温度1'},{'key':'wd2','name':'温度2'},{'key':'wd3','name':'温度3'},{'key':'wd4','name':'温度4'}]
    
    export default{
        props: ['device'],
        components: {
            modal
        },
        watch: {
            'device': {
                handler: function (val) { 
                    this.draw();
                },
                deep: true
            }
        },
        methods: {
            getWorkUserName(id){
                return (find(this.workUsers, {_id: id}) || {}).wuName;
            },
            draw(){
                if (!this.device && this.device._id) {
                    notify.error('请选择设备');
                    return;
                }
                this.ybCode = this.device._id;
                this.chart = echarts.init(document.getElementById('main'));
                var drawInterval=60*1000;
                var nowDate = new Date().getTime();
                var startDate = this.startTime||(this.endTime?'':(nowDate - 0.5 * 60 * 60 * 1000)) ; //最近1小时
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
                        // console.log('startDate--->>', moment(startDate).format('YYYY-MM-DD HH:mm'));
                        _this.list = [last(data)];
                        var preSeriesData = getDataListByKeys(data, lines)
                        var option = {
                            tooltip: {
                                trigger: 'axis'
                            },
                            legend: {
                                data: lines,
                                textStyle: {
                                    fontSize: 20,
                                    fontWeight: 'bold'
                                },
                                controlStyle: {
                                    itemSize: 30,
                                    itemGap: 10,
                                },                       
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

                this.$http.post('/api/hxmonitorRealTimeData', {id: this.ybCode, start: moment(startDate), end: moment(endDate)})
                .then(function (res) {
                    
                })  
            }
        },
        ready(){
            Promise.all([
                // this.$http.get('/api/hxstates'),
                this.$http.get('/api/workusers/field')
            ]).then(function (res) {
                // this.devices = res[0].data;
                this.workUsers = res[0].data;
            }.bind(this));

        },
        beforeDestroy(){
            clearInterval(this.drawTimer);
        },
        data(){
            return {
                chart: '',            // 图表
                ybCode: '',             // 仪表编号
                list: [],             // 列表
                // devices: [],          // 所有设备
                workUsers: [],        // 所有员工
                flags: ['停止', '开始'],
                loading: true,      // 初始化中,
                drawTimer: 0,
                showChart: false,
                startTime:'',
                endTime:''
            }
        }
    }
</script>