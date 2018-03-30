<style lang="less">
    .chart-wrap {
        border-top: solid 1px #ddd;
    }
</style>

<template>
    <div class="chart-wrap">
        <!-- <h1>平板硫化机实时曲线</h1> -->
        <div class="content-wrapper">
            <div class="operation-wrapper row">
                <!-- <div class="col-xs-3">
                    <select @change="draw" class="form-control input-sm" v-model="eqIp">
                        <option value="">--请选择设备--</option>
                        <option value="{{d._id}}" v-for="d in devices">{{d.eqIp}}</option>
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
            <div  id="main" style="height:400px;"></div>
            <div  v-show="showChart">                  
                示值：
                <input   v-model="option.dataZoom[1].start" style="background-color:green;width:10em;margin-right: 1em;"> 
                <input   v-model="option.dataZoom[1].end"
                style="background-color:red;;width:10em;margin-right: 6em;"> 
                记录时间：
                <input   v-model="option.dataZoom[0].start" style="background-color:green;;width:10em;margin-right: 1em;"> 
                <input   v-model="option.dataZoom[0].end" style="background-color:red;;width:10em;"> 
            </div>
            <div   style="display: flex;justify-content: center;align-items: center;height: 400px" v-show="!showChart"><h1>暂无数据</h1></div>
        </div>
    </div>
</template>

<script>
    import {find, extend, cloneDeep, findIndex, indexOf, last} from 'lodash';
    import {modal} from  'vue-strap';
    import moment from 'moment';
    import echarts  from '../assets/js/echarts.min';
    import notify from '../components/notify';
    import {getDataListByKeys,convertXAxis} from '../utils/chartFormat'
    var lines = [
        {'key':'wd1','name': '1号温度'},
        {'key':'wd2','name':'2号温度'},
        {'key':'wd3','name':'3号温度'}, 
        {'key':'wd4','name':'4号温度'},
        {'key':'lhyl','name':'压力'},
        {'key':'lhsssj','name':'硫化实时时间'},
        {'key':'firstBhgcl','name':'加热板温度1'},
        {'key':'secondBhgcl','name':'加热板温度2'},
        {'key':'thirdBhgcl', 'name':'加热板温度3'}
    ]
    export default{

        props: ['devices'],
        components: {
            modal
        },
        watch: {
            'devices': {
                handler: function (val) { 
                    // console.log('devices',val)
                     if (val.length > 0) {
                        this.eqIp = val[0]._id;
                        this.eqId = val[0].eqId;
                        this.draw();
                    }
                },
                deep: true
            },
            'option.dataZoom[0].start':function(){
                this.draw()
            },
            'option.dataZoom[0].end':function(){
                this.draw()
            },
            'option.dataZoom[1].start':function(){
                this.draw()
            },
            'option.dataZoom[1].start':function(){
                this.draw()
            }
        },
        methods: {
            getWorkUserName(id){
                return (find(this.workUsers, {_id: id}) || {}).wuName;
            },
            draw(){
                if (!this.eqIp) {
                    if (this.chart) {
                        this.chart.dispose();
                    }
                    return;
                }
                
                this.chart = echarts.init(document.getElementById('main'));
                this.chart.showLoading()
                //提交
                var drawInterval = 60 * 1000;
                var nowDate = new Date().getTime();
                var startDate = this.startTime||(this.endTime?'':(nowDate - 1 * 60 * 60 * 1000)) ;
                var endDate =this.endTime||(this.startTime?'':nowDate)
                this.drawTimer&&clearInterval(this.drawTimer)
                var _this=this;
                console.log(_this)
                this.$http.post('/api/pblhjmonitor', {
                    id: this.eqIp,
                    epId:_this.eqId,
                    start: moment(startDate), 
                    end: moment(endDate)
                })
                    .then(function (res) {
                        this.chart.hideLoading()
                        var data = res.data;
                        if (!data.length) {
                            _this.showChart = false;
                            return
                        }else{
                            _this.showChart = true
                        };
                        data.forEach(d => {
                            d.firstTask && (d.firstBhgcl = Number(d.firstTask.bhgcl));
                            d.secondTask && (d.secondBhgcl = Number(d.secondTask.bhgcl));
                            d.thirdTask && (d.thirdBhgcl = Number(d.thirdTask.bhgcl));
                        });
                            _this.list = [last(data)];
                        var preSeriesData = getDataListByKeys(data,lines);
                        // var option = {
                        //     tooltip: {
                        //         trigger: 'axis'
                        //     },
                        //     legend: {
                        //         data: lines,
                        //         textStyle: {
                        //             fontSize: 16,
                        //             fontWeight: 'bold'
                        //         },
                        //         // 默认不显示
                        //         selected: {
                        //             '加热板温度1' : false,
                        //             '加热板温度2' : false,
                        //             '加热板温度3' : false,
                        //         },
                        //         controlStyle: {
                        //             itemSize: 30,
                        //             itemGap: 10,
                        //         },
                        //     },
                        //     grid: {
                        //         left: '3%',
                        //         right: '4%',
                        //         bottom: '3%',
                        //         containLabel: true
                        //     },
                        //     xAxis: {
                        //         type: 'category',
                        //         boundaryGap: false,
                        //         data: convertXAxis(data)
                        //     },
                        //     yAxis: {
                        //         type: 'value',
                        //         axisLabel: {
                        //             formatter: '{value}'
                        //         }
                        //     },
                        //     dataZoom: [
                        //         {
                        //             type: 'slider',
                        //             show: true,
                        //             xAxisIndex: [0],
                        //             start: 1,
                        //             end: 100
                        //         },
                        //         {
                        //             type: 'slider',
                        //             show: true,
                        //             yAxisIndex: [0],
                        //             left: '93%',
                        //             start: 1,
                        //             end: 100
                        //         },
                        //         {
                        //             type: 'inside',
                        //             xAxisIndex: [0],
                        //             start: 1,
                        //             end: 100
                        //         },
                        //         {
                        //             type: 'inside',
                        //             yAxisIndex: [0],
                        //             start: 29,
                        //             end: 100
                        //         }
                        //     ],
                        //     series: Object.keys(preSeriesData).map(v => preSeriesData[v])
                        // };
                        let option = this.option
                        option.xAxis.data=convertXAxis(data)
                        option.series= Object.keys(preSeriesData).map(v => preSeriesData[v])
                        _this.chart.setOption(option);
                        _this.chart.on('dataZoom',function (params) {
                            // console.log(params)
                            if(!params.dataZoomId) return 
                            let id = Number(params.dataZoomId.slice(-1))//id为0时x轴，1为y轴
                            if(Math.abs(params.start - option.dataZoom[id].start)>10) //只有滑动大于10才变化
                                option.dataZoom[id].start=params.start 
                            if(Math.abs(params.end - option.dataZoom[id].end)>10)
                                option.dataZoom[id].end=params.end               
                        })
                        _this.drawTimer = setInterval(() => {
                            _this.$http.post('/api/pblhjmonitorLastData', {eqIp: _this.eqIp}).then(v => {
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

//                function convertLegend(data) {
//                    return data.map(function (item) {
//                        return item[0].tId;
//                    }).concat('压力');
//                }

            }
        },
        ready(){
            Promise.all([
                // this.$http.get('/api/pblhjstates'),
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
                eqIp: '',             // 设备编号
                equip: '',            // 当前设备
                list: [],             // 列表
                // devices: [],          // 所有设备
                workUsers: [],        // 所有员工
                flags: ['没有工作', '升温时间', '硫化时间'],
                loading: true,         // 初始化中
                drawTimer: 0,
                showChart: false,
                startTime:'',
                endTime:'',
                option :{
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: lines,
                        textStyle: {
                            fontSize: 16,
                            fontWeight: 'bold'
                        },
                        // 默认不显示
                        selected: {
                            '加热板温度1' : false,
                            '加热板温度2' : false,
                            '加热板温度3' : false,
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
                        data: 0// 移植，在draw里赋值
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    },
                    dataZoom: [
                        {
                            type: 'slider',
                            show: true,
                            xAxisIndex: [0],
                            start: 1,
                            end: 100
                        },
                        {
                            type: 'slider',
                            show: true,
                            yAxisIndex: [0],
                            left: '93%',
                            start: 60,
                            end: 100
                        },
                        {
                            type: 'inside',
                            xAxisIndex: [0],
                            start: 1,
                            end: 100
                        },
                        {
                            type: 'inside',
                            yAxisIndex: [0],
                            start: 29,
                            end: 100
                        }
                    ],
                    series: 0// 移植，在draw里赋值
                }

            }
        }
    }
</script>