<style scoped>
    .lhj-form  .fetch-btn{margin-top: 24px;}
    .padding {
        padding: 2em;
    }
    .p-y {
        padding-top: 1em;
        padding-bottom: 1em;
    }
    .p-x-md {
        padding-left: 2em;
        padding-right: 2em;
    }
    .m-r {
        margin-right: 1em;
    }
</style>

<template>
    <div>
        <div class="operation-wrapper row lhj-form p-x-md">
            <div class="col-xs-3">
                <p><strong>操作员：</strong></p>
                <select @change="switchData" class="form-control input-sm" v-model="operator">
                    <option value="" selected>--请选择操作员--</option>
                    <option :value="o" v-for="o in operators">{{o}}</option>
                </select>
            </div>
            <div class="col-xs-3">
                <p><strong>模具号：</strong></p>
                <select @change="switchData" class="form-control input-sm" v-model="mould">
                    <option value="" selected>--请选择模具号--</option>
                    <option :value="m" v-for="m in moulds" v-if="!!m">{{m}}</option>
                </select>
            </div>
            <div class="col-xs-3">
                <p><strong>模次号：</strong></p>
                <input type="text" v-model="mId" placeholder="请输入模次号">
            </div>
            <div class="col-xs-3 fetch-btn">
                <button type="button" class="btn btn-primary m-r" @click="fetchLHJData">查询</button>
                <a class="btn btn-primary m-r" v-link="{path: '/pblhjmonitormore/'+tId}">更多查询</a>
            </div>
        </div>

        <div class="padding">
            <table class="table table-hover table-condensed">
                <thead>
                <tr>
                <th>温度最大值</th>
                <th>温度最小值</th>
                <th>压力最大值</th>
                <th>压力最小值</th>
                <th>升温时间</th>
                <th>开始时间</th>
                <th>结束时间</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="i in list">
                <td v-text="maxTemp"></td>
                <td v-text="minTemp"></td>
                <td v-text="maxPress"></td>
                <td v-text="minPress"></td>
                <td v-text="swTime"></td>
                <td v-text="startTimeData"></td>
                <td v-text="endTimeData"></td>
                </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 1-4为温度曲线，5为压力曲线 -->
        <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="" >
            <div class="p-y lhjmain" id="lhjmain1" style="height:400px;" ></div>
        </div>
        <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="" >
            <div class="p-y lhjmain" id="lhjmain2" style="height:400px;" ></div>
        </div>
        <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="" >
            <div class="p-y lhjmain" id="lhjmain3" style="height:400px;" ></div>
        </div>
        <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="" >
            <div class="p-y lhjmain" id="lhjmain4" style="height:400px;" ></div>
        </div>
        <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="" >
            <div class="p-y lhjmain" id="lhjmain5" style="height:400px;" ></div>
        </div>

        <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="" >
            <div class="p-y lhjmain" id="lhjmain-mids" style="height:400px;" ></div>
        </div>

        <div  style="display: flex !important;justify-content: center;align-items: center;height: 400px" v-show="!showChart"><h1>二段硫化没开始 </h1></div>
        </div>
    </div>
</template>

<script>
    import {find, extend, cloneDeep, findIndex, indexOf, last, uniq, head} from 'lodash';
    import {modal} from  'vue-strap';
    import moment from 'moment';
    import echarts  from '../assets/js/echarts.min';

    import notify from '../components/notify';
    import {getDataListByKeys,convertXAxis} from '../utils/chartFormat'
    // var lines = [
    //     {'key':'lhsssj','name':'硫化实时时间'}, 
    //     {'key':'firstBhgcl','name':'加热板温度1'},
    //     {'key':'secondBhgcl','name':'加热板温度2'},
    //     {'key':'thirdBhgcl', 'name':'加热板温度3'},
    // ];
    var linesTpl = [
        {'key':'wd1','name':'硫化温度（℃）'},
        {'key':'wd2','name':'硫化温度（℃）'},
        {'key':'wd3','name':'硫化温度（℃）'}, 
        {'key':'wd4','name':'硫化温度（℃）'}, 
        {'key':'lhyl','name':'硫化压力（MPa）'},
    ];
    
    export default{
        props: ['tId'],
        components: {
            modal
        },
        watch: {
            'tId': {
                handler: function (val) { 
                    this.draw();
                },
                deep: true
            }
        },
        methods: {
            switchData() {},
            fetchLHJData() {
                // if (!this.operator || !this.mould || !this.mId) {
                //     notify.error("请选择操作员、模具号、输入模次号");
                //     return;
                // }
                if (!this.mId) {
                    notify.error("请选择操作员、模具号、输入模次号");
                    return;
                }
                var _this = this;

                this.charts.forEach(item=>{
                    item.showLoading();
                });
                this.$http.post('/api/pblhjmonitorfilter', {   
                    wuId: this.operator,
                    tId: this.tId, 
                    mould: this.mould, 
                    mId: this.mId
                })  
                .then(function (res) {
                        this.charts.forEach(item=>{
                            item.hideLoading();
                        });
                        
                        if (!res) return;

                        console.error(res.data);
                        var data = res.data;
                        if (!data.length) {
                            _this.showChart = false;
                            this.hideCharts();
                            return
                        }else{
                            _this.showChart = true
                        };

                        let _lines = [linesTpl[4]];
                        let chartNames = ['lhjmain5'];
                        let firstFlag = false;
                        let secondFlag = false;
                        let thirdFlag = false;
                        let fourthFlag = false;

                        data.forEach(d => {
                            d.firstTask && (d.firstBhgcl = Number(d.firstTask.bhgcl));
                            d.secondTask && (d.secondBhgcl = Number(d.secondTask.bhgcl));
                            d.thirdTask && (d.thirdBhgcl = Number(d.thirdTask.bhgcl));
                            
                            firstFlag = firstFlag || (d.firstTask && d.firstTask.mjh == this.mould);
                            secondFlag = secondFlag || (d.secondTask && d.secondTask.mjh == this.mould);
                            thirdFlag = thirdFlag || (d.thirdTask && d.thirdTask.mjh == this.mould);
                            fourthFlag = fourthFlag || (d.fourthTask && d.fourthTask.mjh == this.mould);
                        });
                        
                        if(fourthFlag){
                            _lines.unshift(linesTpl[3]);
                            chartNames.unshift('lhjmain4');
                        }
                        if(thirdFlag){
                            _lines.unshift(linesTpl[2]);
                            chartNames.unshift('lhjmain3');
                        }
                        if(secondFlag){
                            _lines.unshift(linesTpl[1]);
                            chartNames.unshift('lhjmain2');
                        }
                        if(firstFlag){
                            _lines.unshift(linesTpl[0]);
                            chartNames.unshift('lhjmain1');
                        }

                        this.initChart(chartNames);

                        let last_data = last(data)
                        _this.swTime = last_data.swsssj;
                        _this.list = [last_data];

                        let timeData = convertXAxis(data);
                        _this.startTimeData = head(timeData);
                        _this.endTimeData = last(timeData);

                        _this.maxPress = null;
                        _this.minPress = null;
                        _this.maxTemp = null;
                        _this.minTemp = null;

                        _lines.forEach((line, index)=>{
                            let lines = [line];
                            let preSeriesData = getDataListByKeys(data, lines);
                            let series = Object.keys(preSeriesData).map(v => preSeriesData[v]);
                            series.forEach(items=>{
                                if(line.key=='lhyl'){
                                    _this.maxPress = Math.max(Math.max(...items.data), _this.maxPress || head(items.data));
                                    _this.minPress = Math.min(Math.min(...items.data), _this.minPress || head(items.data));
                                }else{
                                    _this.maxTemp = Math.max(Math.max(...items.data), _this.maxTemp || head(items.data));
                                    _this.minTemp = Math.min(Math.min(...items.data), _this.minTemp || head(items.data));
                                }
                            });

                            var option = {
                                tooltip: {
                                    trigger: 'axis'
                                },
                                legend: {
                                    data: lines,
                                    textStyle: {
                                        fontSize: 16,
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
                                series: series
                            };

                            _this.charts[index].setOption(option);
                        });

                        // _this.drawTimer = setInterval(() => {
                        //     _this.$http.post('/api/hxmonitorRealTimeData', {tId: _this.tId}).then(v => {
                        //         let data  = v.data
                        //         // option.xAxis.data.shift()
                        //         option.xAxis.data.push(moment(data[0].addDate).format('YYYY-MM-DD HH:mm'))
                        //         option.series.map(item => {
                        //             // item.data.shift()
                        //             item.data.push(data[0][item.key])
                        //         })

                        //         _this.chart.setOption(option)
                        //     })
                        // },drawInterval)
                    });
            },
            getWorkUserName(id){
                return (find(this.workUsers, {_id: id}) || {}).wuName;
            },
            hideCharts(){
                let nodes = document.getElementsByClassName('lhjmain');
                for(let i=0; i<nodes.length; i++){
                    nodes[i].style.display = 'none';
                };
            },
            initChart(names){
                this.charts = [];
                this.hideCharts();

                names.forEach(item=>{
                    let node = document.getElementById(item);
                    node.style.display = 'block';
                    let chart = echarts.init(node);
                    this.charts.push(chart);
                });

                var drawInterval=60*1000;
                var nowDate = new Date().getTime();
                var startDate = this.startTime||(this.endTime?'':(nowDate - 0.5 * 60 * 60 * 1000)) ; //最近1小时
                var endDate =this.endTime||(this.startTime?'':nowDate)
                this.drawTimer&&clearInterval(this.drawTimer)

                // this.charts.forEach(item=>{
                //     item.showLoading();
                // });
            },
            draw(){
                if (!this.tId) {
                    notify.error('请选择设备');
                    return;
                }
                var _this=this;
                
                this.ybCode = this.device._id;
                this.$http.post('/api/pblhjmonitorfields', {tId: this.tId})
                .then(function (res) {
                    this.charts.forEach(item=>{
                        item.hideLoading();
                    });
                    
                    if (res.data) {
                        this.operators = uniq(res.data.wuIds);
                        this.moulds = uniq(res.data.moulds);
                        // console.error(res.data);

                        if (this.operators.length > 0) this.operator = this.operators[0];
                        if (this.moulds.length > 0) this.mould = this.moulds[0];

                        return this.$http.post('/api/pblhjmonitorfilter', 
                            {   
                                wuId: this.operator || '',
                                tId: this.tId || '', 
                                mould: this.mould || '', 
                                mId: this.mId || ''
                            })  
                    } else {
                        return;
                    }
                }.bind(this))
                // this.$http.post('/api/hxmonitorbytid', {tId: this.tId})
                    .then(function (res) {
                        if (!res) return;

                        var data = res.data;
                        if (!data.length) {
                            _this.showChart = false;
                            this.hideCharts();
                            return
                        }else{
                            _this.showChart = true
                        };
                        
                        let _lines = [linesTpl[4]];
                        let chartNames = ['lhjmain5'];
                        let firstFlag = false;
                        let secondFlag = false;
                        let thirdFlag = false;
                        let fourthFlag = false;

                        data.forEach(d => {
                            d.firstTask && (d.firstBhgcl = Number(d.firstTask.bhgcl));
                            d.secondTask && (d.secondBhgcl = Number(d.secondTask.bhgcl));
                            d.thirdTask && (d.thirdBhgcl = Number(d.thirdTask.bhgcl));
                            
                            firstFlag = firstFlag || (d.firstTask && d.firstTask.mjh == this.mould);
                            secondFlag = secondFlag || (d.secondTask && d.secondTask.mjh == this.mould);
                            thirdFlag = thirdFlag || (d.thirdTask && d.thirdTask.mjh == this.mould);
                            fourthFlag = fourthFlag || (d.fourthTask && d.fourthTask.mjh == this.mould);
                        });
                        
                        if(fourthFlag){
                            _lines.unshift(linesTpl[3]);
                            chartNames.unshift('lhjmain4');
                        }
                        if(thirdFlag){
                            _lines.unshift(linesTpl[2]);
                            chartNames.unshift('lhjmain3');
                        }
                        if(secondFlag){
                            _lines.unshift(linesTpl[1]);
                            chartNames.unshift('lhjmain2');
                        }
                        if(firstFlag){
                            _lines.unshift(linesTpl[0]);
                            chartNames.unshift('lhjmain1');
                        }

                        this.initChart(chartNames);
                        
                        let last_data = last(data)
                        _this.swTime = last_data.swsssj;
                        _this.list = [last_data];

                        let timeData = convertXAxis(data);
                        _this.startTimeData = head(timeData);
                        _this.endTimeData = last(timeData);

                        _lines.forEach((line, index)=>{
                            let lines = [line];
                            let preSeriesData = getDataListByKeys(data, lines);
                            let series = Object.keys(preSeriesData).map(v => preSeriesData[v]);
                            series.forEach(items=>{
                                if(line.key=='lhyl'){
                                    _this.maxPress = Math.max(Math.max(...items.data), _this.maxPress || head(items.data));
                                    _this.minPress = Math.min(Math.min(...items.data), _this.minPress || head(items.data));
                                }else{
                                    _this.maxTemp = Math.max(Math.max(...items.data), _this.maxTemp || head(items.data));
                                    _this.minTemp = Math.min(Math.min(...items.data), _this.minTemp || head(items.data));
                                }
                            });

                            let option = {
                                tooltip: {
                                    trigger: 'axis'
                                },
                                legend: {
                                    data: lines,
                                    textStyle: {
                                        fontSize: 20,
                                        fontWeight: 'bold'
                                    },
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
                                    data: timeData
                                },
                                yAxis: {
                                    type: 'value',
                                    axisLabel: {
                                        formatter: '{value}'
                                    }
                                },
                                // dataZoom: [
                                //     {
                                //         type: 'slider',
                                //         show: true,
                                //         xAxisIndex: [0],
                                //         start: 1,
                                //         end: 100
                                //     },
                                //     {
                                //         type: 'slider',
                                //         show: true,
                                //         yAxisIndex: [0],
                                //         left: '93%',
                                //         start: 1,
                                //         end: 100
                                //     },
                                //     {
                                //         type: 'inside',
                                //         xAxisIndex: [0],
                                //         start: 1,
                                //         end: 100
                                //     },
                                //     {
                                //         type: 'inside',
                                //         yAxisIndex: [0],
                                //         start: 1,
                                //         end: 100
                                //     }
                                // ],
                                series: series
                            };
                            
                            _this.charts[index].setOption(option);
                        });

                        /*_this.drawTimer = setInterval(() => {
                            _this.$http.post('/api/hxmonitorRealTimeData', {tId: _this.tId}).then(v => {
                                let data  = v.data
                                // option.xAxis.data.shift()
                                option.xAxis.data.push(moment(data[0].addDate).format('YYYY-MM-DD HH:mm'))
                                option.series.map(item => {
                                    // item.data.shift()
                                    item.data.push(data[0][item.key])
                                })

                                _this.chart.setOption(option)
                            })
                        },drawInterval)*/
                    });
             },
             drawMids(list){

             },    
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
                device: Object,
                charts: [],
                chart: '',            // 图表
                operators: [],        //操作员列表
                moulds: [],            // 模具号列表
                mId: '',               //模次号
                operator: '',          // 操作员 
                mould:'',              // 模具号
                ybCode: '',             // 仪表编号
                list: [],             // 列表
                // devices: [],          // 所有设备
                workUsers: [],        // 所有员工
                flags: ['停止', '开始'],
                loading: true,      // 初始化中,
                drawTimer: 0,
                showChart: false,
                startTime:'',
                endTime:'',

                maxTemp: null,
                minTemp: null,
                maxPress: null,
                minPress: null,
                swTime: null,
                startTimeData: null,
                endTimeData: null,
            }
        }
    }
</script>