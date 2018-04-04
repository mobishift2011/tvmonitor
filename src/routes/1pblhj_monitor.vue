<style lang="less">

</style>

<template>
    <div>
        <h1>平板硫化机实时曲线</h1>
        <div class="content-wrapper">
            <div class="operation-wrapper row">
                <div class="col-xs-3">
                    <select @change="draw" class="form-control input-sm" v-model="eqIp">
                        <option value="">--请选择设备--</option>
                        <option value="{{d._id}}" v-for="d in devices">{{d.eqIp}}</option>
                    </select>
                </div>
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
    var lines = [{'key':'wd1','name': '1号温度'},{'key':'wd2','name':'2号温度'},{'key':'wd3','name':'3号温度'},
        {'key':'wd4','name':'4号温度'},{'key':'lhyl','name':'压力'},{'key':'lhsssj','name':'硫化实时时间'}]
    export default{
        components: {
            modal
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
                var startDate = this.startTime||(this.endTime?'':(nowDate - 8 * 60 * 60 * 1000)) ;
                var endDate =this.endTime||(this.startTime?'':nowDate)
                this.drawTimer&&clearInterval(this.drawTimer)
                var _this=this;
                this.$http.post('/api/pblhjmonitor', {id: this.eqIp,start: moment(startDate), end: moment(endDate)})
                    .then(function (res) {
                        this.chart.hideLoading()
                        var data = res.data;
                        if (!data.length) {
                            _this.showChart = false;
                            return
                        }else{
                            _this.showChart = true
                        };
                        _this.list = [last(data)];
                        var preSeriesData = getDataListByKeys(data,lines);
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
                this.$http.get('/api/pblhjstates'),
                this.$http.get('/api/workusers/field')
            ]).then(function (res) {
                this.devices = res[0].data;
                this.workUsers = res[1].data;
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
                devices: [],          // 所有设备
                workUsers: [],        // 所有员工
                flags: ['没有工作', '升温时间', '硫化时间'],
                loading: true,         // 初始化中
                drawTimer: 0,
                showChart: false,
                startTime:'',
                endTime:''

            }
        }
    }
</script>
