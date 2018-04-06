<style scoped>
.m-r-md {
  margin-right: 2em;
}
.m-b-md {
  margin-bottom: 2em;
}
</style>

<template>
    <div class="hx-monitor_print content">
        <loading v-show="loading"></loading>
        <div class="content-wrapper" v-show="!loading">
            <div class="operation-wrapper">
                    <h1>二段硫化历史曲线</h1>
                    <div v-show="showChart">
                        <h5 class="p-x-sm inline m-r-md pull-left" v-text="`任务号: ${tId}`"></h5>
                        <h5 class="inline-block m-r-md pull-left">
                            <strong>操作员：</strong>
                            <strong>{{operator}}</strong>
                        </h5>
                    </div>
                    <div>
                        <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="m-b-md" >
                            <div id="hxmain1" style="height:300px;" ></div>
                        </div>
                        <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="m-b-md" >
                            <div   id="hxmain2" style="height:300px;" ></div>
                        </div>
                        <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="m-b-md" >
                            <div   id="hxmain3" style="height:300px;" ></div>
                        </div>
                        <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="m-b-md" >
                            <div   id="hxmain4" style="height:300px;" ></div>
                        </div>
                    </div>
                    <div  style="display: flex !important;justify-content: center;align-items: center;height: 400px" v-show="!showChart"><h1>二段硫化没开始 </h1></div>
            </div>
        </div>
    </div>
</template>

<script>
import {
  find,
  extend,
  cloneDeep,
  findIndex,
  indexOf,
  last,
  uniq
} from "lodash";
import { modal } from "vue-strap";
import moment from "moment";
import echarts from "../assets/js/echarts.min";

import notify from "../components/notify";
import { getDataListByKeys, convertXAxis } from "../utils/chartFormat";
var lines = [
  { key: "wd1", name: "温度1" },
  { key: "wd2", name: "温度2" },
  { key: "wd3", name: "温度3" },
  { key: "wd4", name: "温度4" }
];

export default {
  props: ["tId"],
  components: {
    modal
  },
  watch: {
    tId: {
      handler: function(val) {
        this.draw();
      },
      deep: true
    }
  },
  methods: {
    draw() {
      if (!this.tId) {
        notify.error("请选择设备");
        return;
      }

      this.ybCode = this.device._id;
      for (let i = 1; i <= 4; i++) {
        let chart = echarts.init(document.getElementById("hxmain" + i));
        chart.showLoading();
        this.charts.push(chart);
      }
      var drawInterval = 60 * 1000;
      var nowDate = new Date().getTime();
      var startDate =
        this.startTime || (this.endTime ? "" : nowDate - 0.5 * 60 * 60 * 1000); //最近1小时
      var endDate = this.endTime || (this.startTime ? "" : nowDate);
      this.drawTimer && clearInterval(this.drawTimer);
      var _this = this;
      this.$http
        .post("/api/hxmonitorbytid", { tId: this.tId })
        .then(function(res) {
          this.charts.forEach(chart => {
            chart.hideLoading();
          });
          var data = res.data;
          if (!data) return;
          if (!data.length) {
            _this.showChart = false;
            _this.hideCharts();
            return;
          } else {
            _this.showChart = true;
          }

          _this.list = [last(data)];
          var preSeriesData = getDataListByKeys(data, lines);
          var optionTpl = {
            tooltip: {
              trigger: "axis"
            },
            legend: {
              textStyle: {
                fontSize: 20,
                fontWeight: "bold"
              },
              controlStyle: {
                itemSize: 30,
                itemGap: 10
              }
            },
            grid: {
              left: "3%",
              right: "4%",
              bottom: "3%",
              containLabel: true
            },
            xAxis: {
              type: "category",
              boundaryGap: false,
              data: convertXAxis(data)
            },
            yAxis: {
              type: "value",
              axisLabel: {
                formatter: "{value}"
              }
            }
          };

          lines.forEach((line, i) => {
            let chart = this.charts[i];
            let option = JSON.parse(JSON.stringify(optionTpl));
            option.legend.data = [line];
            option.series = [preSeriesData[line.key]];
            chart.setOption(option);

            _this.drawTimer = setInterval(() => {
              _this.$http
                .post("/api/hxmonitorRealTimeData", { tId: _this.tId })
                .then(v => {
                  let data = v.data;
                  if (data.length == 0) return;
                  // option.xAxis.data.shift()
                  option.xAxis.data.push(
                    moment(data[0].addDate).format("YYYY-MM-DD HH:mm")
                  );
                  option.series.map(item => {
                    // item.data.shift()
                    item.data.push(data[0][item.key]);
                  });

                  chart.setOption(option);
                });
            }, drawInterval);
          });
        });
    },
    hideCharts() {
      for (let i = 1; i <= 4; i++) {
        let chart = document.getElementById("hxmain" + i);
        chart.style.display = "none";
      }
    }
  },
  ready() {
    this.tId = this.tId || this.$route.params.id;
    this.loading = false;
    this.$http.post("/api/pblhjmonitorfields", { tId: this.tId }).then(res => {
      if (res.data) {
        this.operators = uniq(res.data.wuIds);
        if (this.operators.length > 0) this.operator = this.operators[0];
      } else {
        return;
      }
    });
  },
  beforeDestroy() {
    clearInterval(this.drawTimer);
  },
  data() {
    return {
      device: Object,
      charts: [], // 图表
      ybCode: "", // 仪表编号
      list: [], // 列表
      // devices: [],          // 所有设备
      workUsers: [], // 所有员工
      flags: ["停止", "开始"],
      loading: true, // 初始化中,
      drawTimer: 0,
      showChart: false,
      startTime: "",
      endTime: "",
      operator: "",
    };
  }
};
</script>