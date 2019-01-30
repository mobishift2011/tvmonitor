<style lang="less">

</style>

<template>
    <div>
        <h1>温湿度实时曲线</h1>
        <div class="content-wrapper">
            <div class="operation-wrapper row">
                 <div class="col-xs-3">
                      <select @change="switchData" id="devices" class="form-control input-sm" v-model="device">
                          <option value="" selected>--请选择设备--</option>
                          <option :value="d.lines" :data-lines="d.lines" v-for="d in allDevices">{{d.name}}</option>
                      </select>
                  </div>
              </div>
     <!-- <div class="operation-wrapper row">
                <div class="col-xs-5">
                    <p>ip: <span>{{eqIp}}</span></p>
                    <p>通讯状态: <span>{{connectState.dictName}}</span></p>
                </div>
            </div> -->

            <div id="main1" style="height:400px;"></div>
            <!-- <div id="main2" style="height:400px;"></div>
            <div id="main3" style="height:400px;"></div>
            <div id="main4" style="height:400px;"></div>
            <div id="main5" style="height:400px;"></div>
            <div id="main6" style="height:400px;"></div>
            <div id="main7" style="height:400px;"></div>
            <div id="main8" style="height:400px;"></div>
            <div id="main9" style="height:400px;"></div> -->
            <div style="display: flex;justify-content: center;align-items: center;height: 400px" v-show="!showChart">
                <h1>暂无数据</h1>
            </div>
        </div>
    </div>
</template>

<script>
import { find, extend, cloneDeep, findIndex, indexOf, last } from 'lodash';
import { modal } from 'vue-strap';
import moment from 'moment';
import echarts from '../assets/js/echarts.min';
import { getDataListByKeys, convertXAxis } from '../utils/chartFormat'
import notify from '../components/notify';
var lines_one = [{ 'key': 'tjxSd', 'name': '涂胶间湿度' }, { 'key': 'tjxWd', 'name': '涂胶间温度' },{ 'key': 'sbbs', 'name': '上班标识' }] //涂胶箱
var lines_two = [{ 'key': 'jlkSd', 'name': '胶料库湿度' }, { 'key': 'jlkWd', 'name': '胶料库温度' },{ 'key': 'sbbs', 'name': '上班标识' }] //胶料库
var lines_three = [{ 'key': 'cxj3Sd', 'name': '纯橡胶3号湿度' }, { 'key': 'cxj3Wd', 'name': '纯橡胶3号温度' },{ 'key': 'sbbs', 'name': '上班标识' }]  //纯橡胶3号
var lines_four = [{ 'key': 'cxj4Sd', 'name': '纯橡胶4号湿度' }, { 'key': 'cxj4Wd', 'name': '纯橡胶4号温度' },{ 'key': 'sbbs', 'name': '上班标识' }] //纯橡胶4号
var lines_five = [{ 'key': 'cxj5Sd', 'name': '纯橡胶5号湿度' }, { 'key': 'cxj5Wd', 'name': '纯橡胶5号温度' },{ 'key': 'sbbs', 'name': '上班标识' }] //纯橡胶5号
var lines_six = [{ 'key': 'jxj6Sd', 'name': '金橡胶6号湿度' }, { 'key': 'jxj6Wd', 'name': '金橡胶6号温度' },{ 'key': 'sbbs', 'name': '上班标识' }] //金橡胶6号
var lines_seven = [{ 'key': 'jxj7Sd', 'name': '金橡胶7号湿度' }, { 'key': 'jxj7Wd', 'name': '金橡胶7号温度' },{ 'key': 'sbbs', 'name': '上班标识' }] //金橡胶7号
var lines_eight = [{ 'key': 'tjj8Sd', 'name': '练胶间湿度' }, { 'key': 'tjj8Wd', 'name': '练胶间温度' },{ 'key': 'sbbs', 'name': '上班标识' }] //练胶间
var lines_nine = [{ 'key': 'dwxWd', 'name': '低温箱温度' }] //低温箱
var lines_eleven = [{ 'key': 'tj1Sd', 'name': '涂胶柜1号湿度' }, { 'key': 'tj1Wd', 'name': '涂胶柜1号温度' },{ 'key': 'sbbs', 'name': '上班标识' }] //涂胶箱1号
var lines_twelve = [{ 'key': 'tj2Sd', 'name': '涂胶柜2号湿度' }, { 'key': 'tj2Wd', 'name': '涂胶柜2号温度' },{ 'key': 'sbbs', 'name': '上班标识' }] //涂胶箱2号
var allDevices = [
    { name: '涂胶间', lines: lines_one },
    { name: '胶料库', lines: lines_two },
    { name: '纯橡胶3号', lines: lines_three },
    { name: '纯橡胶4号', lines: lines_four },
    { name: '纯橡胶5号', lines: lines_five },
    { name: '金橡胶6号', lines: lines_six },
    { name: '金橡胶7号', lines: lines_seven },
    { name: '练胶间', lines: lines_eight },
    { name: '低温箱', lines: lines_nine},
    { name: '涂胶柜1号', lines: lines_eleven},
    { name: '涂胶柜2号', lines: lines_twelve}
];
var wsds = require('../../global.json').wsd;
export default {
    components: {
        modal
    },
    methods: {
        switchData() {
            var myselect=document.getElementById("devices");
            var index=myselect.selectedIndex ; 
            var option=myselect.options[index];
            var lines = option.dataset.lines;
            this.draw(this.device);
        },
        convertOption(allData,legendDate){
            let seriesData=getDataListByKeys(allData,legendDate)
            return {
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: legendDate,
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
                    data: convertXAxis(allData)
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter: '{value}'
                    }
                },
                series: Object.keys(seriesData).map(v => seriesData[v])
            }
        },
        getWorkUserName(id) {
            return (find(this.workUsers, { _id: id }) || {}).wuName;
        },
        __draw(lines) {
            if (!this.eqIp) {
                notify.error('请选择');
                return;
            }

            this.chart1 = echarts.init(document.getElementById('main1'));
            this.chart2 = echarts.init(document.getElementById('main2'));
            this.chart3 = echarts.init(document.getElementById('main3'));
            this.chart4 = echarts.init(document.getElementById('main4'));
            this.chart5 = echarts.init(document.getElementById('main5'));
            this.chart6 = echarts.init(document.getElementById('main6'));
            this.chart7 = echarts.init(document.getElementById('main7'));
            this.chart8 = echarts.init(document.getElementById('main8'));
            this.chart9 = echarts.init(document.getElementById('main9'));

            var nowDate = new Date().getTime();
            var intervalTime = 60 * 1000;
            var startDate = this.startTime || (nowDate -  60 * 60 * 1000);
            var endDate = this.endTime || nowDate
            this.drawTimer && clearInterval(this.drawTimer)
            var _this=this;
            this.$http.post('/api/wsdmonitor', { eqIp: this.eqIp, start: moment(startDate), end: moment(endDate) })
                .then(function (res) {
                    var data = res.data;
                    if (!data.length) {
                        _this.showChart = false;
                        return
                    } else {
                        _this.showChart = true
                    }
                    _this.listLength = res.data.length;
                    var option1 = _this.convertOption(data,lines)
                    var option2 = _this.convertOption(data,lines_two)
                    var option3 = _this.convertOption(data,lines_three)
                    var option4 = _this.convertOption(data,lines_four)
                    var option5 = _this.convertOption(data,lines_five)
                    var option6 = _this.convertOption(data,lines_six)
                    var option7 = _this.convertOption(data,lines_seven)
                    var option8 = _this.convertOption(data,lines_eight)
                    var option9 = _this.convertOption(data,lines_nine)


                    _this.chart1.setOption(option1);
                    _this.chart2.setOption(option2);
                    _this.chart3.setOption(option3);
                    _this.chart4.setOption(option4);
                    _this.chart5.setOption(option5);
                    _this.chart6.setOption(option6);
                    _this.chart7.setOption(option7);
                    _this.chart8.setOption(option8);
                    _this.chart9.setOption(option9);
                    _this.drawTimer = setInterval(() => {
                        _this.$http.post('/api/wsdmonitorLastData', { eqIp: this.eqIp }).then(v => {
                            let maxLength=60;
                            let data = v.data;
                            if(_this.listLength>=maxLength){
                                option1.xAxis.data.shift()
                                option2.xAxis.data.shift()
                                option3.xAxis.data.shift()
                                option4.xAxis.data.shift()
                                option5.xAxis.data.shift()
                                option6.xAxis.data.shift()
                                option7.xAxis.data.shift()
                                option8.xAxis.data.shift()
                                option9.xAxis.data.shift()
                                
                            }


                            let addDate=moment(data[0].addDate).format('YYYY-MM-DD HH:mm')
                            option1.xAxis.data.push(addDate)
                            option2.xAxis.data.push(addDate)
                            option3.xAxis.data.push(addDate)
                            option4.xAxis.data.push(addDate)
                            option5.xAxis.data.push(addDate)
                            option6.xAxis.data.push(addDate)
                            option7.xAxis.data.push(addDate)
                            option8.xAxis.data.push(addDate)
                            option9.xAxis.data.push(addDate)

                            let handleData=function(item,data){
                                if(_this.listLength>=maxLength) item.data.shift()
                                item.data.push(data[0][item.key])
                            }
                                option1.series.map(item => {
                                handleData(item,data);
                            })

                                option2.series.map(item => {
                                    handleData(item,data);
                            })

                                option3.series.map(item => {
                                    handleData(item,data);
                            })
                                option4.series.map(item => {
                                    handleData(item,data);
                            })
                                option5.series.map(item => {
                                    handleData(item,data);
                            })
                                option6.series.map(item => {
                                    handleData(item,data);
                            })
                                option7.series.map(item => {
                                    handleData(item,data);
                            })
                                option8.series.map(item => {
                                    handleData(item,data);
                            })
                                option9.series.map(item => {
                                    handleData(item,data);
                            })

                            _this.chart1.setOption(option1);
                            _this.chart2.setOption(option2);
                            _this.chart3.setOption(option3);
                            _this.chart4.setOption(option4);
                            _this.chart5.setOption(option5);
                            _this.chart6.setOption(option6);
                            _this.chart7.setOption(option7);
                            _this.chart8.setOption(option8);
                            _this.chart9.setOption(option9);

                        })
                    }, intervalTime)
                });


        },
        draw(lines) {
            if (!this.eqIp) {
                notify.error('请选择');
                return;
            }

            this.chart = echarts.init(document.getElementById('main1'));
            
            var nowDate = new Date().getTime();
            var intervalTime = 60 * 1000;
            var startDate = this.startTime || (nowDate -  60 * 60 * 1000);
            var endDate = this.endTime || nowDate
            this.drawTimer && clearInterval(this.drawTimer)
            var _this=this;
            this.$http.post('/api/wsdmonitor', { eqIp: this.eqIp, start: moment(startDate), end: moment(endDate) })
                .then(function (res) {
                    var data = res.data;
                    if (!data.length) {
                        _this.showChart = false;
                        return
                    } else {
                        _this.showChart = true
                    }
                    _this.listLength = res.data.length;
                    var option = _this.convertOption(data,lines)

                    _this.chart.setOption(option);
                    
                    _this.drawTimer = setInterval(() => {
                        _this.$http.post('/api/wsdmonitorLastData', { eqIp: this.eqIp }).then(v => {
                            let maxLength=60;
                            let data = v.data;

                            if(_this.listLength>=maxLength) option.xAxis.data.shift();

                            let addDate=moment(data[0].addDate).format('YYYY-MM-DD HH:mm')

                            option.xAxis.data.push(addDate)

                            let handleData=function(item,data){
                                if(_this.listLength>=maxLength) item.data.shift()
                                item.data.push(data[0][item.key])
                            }

                            option.series.map(item => handleData(item,data));

                            _this.chart.setOption(option);
                           
                        })
                    }, intervalTime)
                });
        }
    },
    ready() {
        Promise.all([
            this.$http.get('/api/workusers/field'),
            this.$http.post('/api/wsdmonitor/connectState')
        ]).then(function (res) {
            this.devices = wsds;
            this.workUsers = res[0].data;
            this.eqIp=wsds[0].eqIp;
            this.connectState=res[1].data
            // this.draw()
        }.bind(this));
    },
    beforeDestroy() {
        clearInterval(this.drawTimer);
    },
    data() {
        return {
            chart: '',            // 图表
            chart1: '',            // 图表1
            chart2: '',            // 图表2
            chart3: '',            // 图表3
            chart4: '',            // 图表4
            chart5: '',            // 图表5
            chart6: '',            // 图表6
            chart7: '',            // 图表7
            chart8: '',            // 图表8
            chart9: '',            // 图表9
            eqIp: '',             // 设备编号
            list: [],             // 列表
            listLength: 0,             // 列表长度
            devices: [],          // 所有设备
            workUsers: [],        // 所有员工
            device:'',
            interval: 0,
            flags: ['停止', '开始'],
            loading: true,         // 初始化中
            drawTimer: 0,
            showChart: false,
            startTime: '',
            endTime: '',
            connectState:'通讯状态',
            allDevices: allDevices
        }
    }
}
</script>