<style scoped>
.p-y {
  padding-top: 0.3em;
  padding-bottom: 0.3em;
}
.p-r {
  padding-right: 0.75em;
}
.p-l {
  padding-left: 0.75em;
}
.m-r {
  margin-right: 1em;
}
</style>

<template>
  <div class="p-y">
    <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="">
      <div :class="'lhjmain '+'lhjmain'+no" :id="'lhjmain-bhgcl'+no" style="height:300px;"></div>
    </div>
    <!-- <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="">
      <div :class="'lhjmain '+'lhjmain'+no" :id="'lhjmain-lhyl'+no" style="height:115px;"></div>
    </div> -->
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
  uniq,
  head
} from "lodash";
import moment from "moment";
import echarts from "../assets/js/echarts.min";

import notify from "../components/notify";
import { getDataListByKeys, convertXAxis } from "../utils/chartFormat";

let OrglinesTpl = [
  { key: "bhgcl1", name: "上加热板温度曲线（℃）" },
  { key: "bhgcl2", name: "中加热板温度曲线（℃）" },
  { key: "bhgcl3", name: "下加热板温度曲线（℃）" }
  //   { key: "lhyl", name: "硫化压力（MPa）" }
];

export default {
  props: ["no"],
  methods: {
    hideCharts() {
      let nodes = document.getElementsByClassName("lhjmain" + this.no);
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].style.display = "none";
      }
    },
    initChart(names) {
      this.charts = [];

      names.forEach(item => {
        let node = document.getElementById(item);
        node.style.display = "block";
        let chart = echarts.init(node);
        this.charts.push(chart);
      });

      var drawInterval = 60 * 1000;
      var nowDate = new Date().getTime();
      var startDate =
        this.startTime || (this.endTime ? "" : nowDate - 0.5 * 60 * 60 * 1000); //最近1小时
      var endDate = this.endTime || (this.startTime ? "" : nowDate);
      this.drawTimer && clearInterval(this.drawTimer);

      this.charts.forEach(item => {
        item.showLoading();
      });
    },
    init(params, allFlag) {
      console.log(params);
      let _this = this;
      this.mId = params.mId;
      this.mould = params.mould;

      if (this.mId == null) {
        notify.error("请输入模次号");
        return;
      }

      this.list = [];
      this.$http.post("/api/pblhjmonitorfilter/mid", params).then(res => {
        if (!res) return;

        var data = res.data;
        if (!data.length) {
          if (!allFlag) {
            notify.error(`没有查询到模次号为${this.mId}的结果`);
          }
          _this.showChart = false;
          this.hideCharts();
          return;
        } else {
          _this.showChart = true;
        }

        let linesTpl = JSON.parse(JSON.stringify(OrglinesTpl));
        let _lines = [linesTpl[this.no - 1]];
        let chartNames = ["lhjmain-bhgcl" + this.no];

        data.forEach(d => {
          d.firstTask && (d.firstBhgcl = Number(d.firstTask.bhgcl));
          d.secondTask && (d.secondBhgcl = Number(d.secondTask.bhgcl));
          d.thirdTask && (d.thirdBhgcl = Number(d.thirdTask.bhgcl));

          d.bhgcl1 = d.firstBhgcl;
          d.bhgcl2 = d.secondBhgcl;
          d.bhgcl3 = d.thirdBhgcl;
        });

        this.initChart(chartNames);

        let timeData = convertXAxis(data);
        let last_data = last(data);
        _this.list = [last_data];

        _this.maxTemp = null;
        _this.minTemp = null;

        _lines.forEach((line, index) => {
          let lines = [line];
          let preSeriesData = getDataListByKeys(data, lines, false);
          let series = Object.keys(preSeriesData).map(v => preSeriesData[v]);

          series.forEach(items => {
            let _maxTemp = Math.max(...items.data);
            let _minTemp = Math.min(...items.data);
            _this.maxTemp = Math.max(
              _maxTemp,
              _this.maxTemp || head(items.data)
            );
            _this.minTemp = Math.min(
              _minTemp,
              _this.minTemp || head(items.data)
            );
          });

          let gridLeft = "3%";
          let yAxis = {
            type: "value",
            axisLabel: {
              formatter: "{value}"
            }
          };

          if (_this.maxTemp) {
            yAxis.max = _this.maxTemp + 2;
          }
          if (_this.minTemp) {
            yAxis.min = _this.minTemp - 5;
          }

          let option = {
            tooltip: {
              trigger: "axis"
            },
            title: {
              text: lines.map(item => item.name),
              x: "center",
              y: "top",
              textStyle: {
                fontSize: 14,
                fontWeight: "bold"
              }
            },
            grid: {
              left: gridLeft,
              right: "3%",
              top: "28%",
              bottom: "1%",
              containLabel: true
            },
            xAxis: {
              type: "category",
              boundaryGap: false,
              data: timeData.map(item => {
                return moment(item).format("HH:mm");
              })
            },
            yAxis: yAxis,
            series: series
          };

          _this.charts[index].setOption(option);
        });

        this.charts.forEach(item => {
          item.hideLoading();
        });
      });
    }
  },
  ready() {
    this.hideCharts();
  },
  beforeDestroy() {
    clearInterval(this.drawTimer);
  },
  data() {
    return {
      charts: [], // 图表
      mId: "", //模次号
      operator: "", // 操作员
      mould: "", // 模具号
      ybCode: "", // 仪表编号
      list: [], // 列表
      // devices: [],          // 所有设备
      loading: true, // 初始化中,
      drawTimer: 0,
      showChart: false,
      startTime: "",
      endTime: ""
    };
  }
};
</script>

clearL