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
    <div class="padding" v-show="list.length">
      <table class="table table-hover table-condensed" v-for="i in list" table-layout="fixed">
        <thead>
          <th>温度最大值</th>
          <th>温度最小值</th>
          <th>压力最大值</th>
          <th>压力最小值</th>
          <th>升温开始时间</th>
          <th>升温时间</th>
          <th>硫化开始时间</th>
          <th>硫化结束时间</th>
          <th>硫化时间</th>
        </thead>
        <tbody>
          <tr>
            <td>
              <span class="text-danger m-r" v-text="maxBdkzTemp"></span>
            </td>
            <td>
              <span class="text-danger" v-text="minBdkzTemp"></span>
            </td>
            <td>
              <span class="text-danger m-r" v-text="maxBdkzPress"></span>
            </td>
            <td>
              <span class="text-danger" v-text="minBdkzPress"></span>
            </td>
            <td>
              <span class="text-danger" v-text="startTimeData"></span>
            </td>
            <td>
              <span class="text-danger" v-text="swTime+' S'"></span>
            </td>
            <td>
              <span class="text-danger m-r" v-text="startTimeBdkzData"></span>
            </td>
            <td>
              <span class="text-danger" v-text="endTimeBdkzData"></span>
            </td>
            <td>
              <span class="text-danger" v-text="timeBdkzDelta"></span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="">
      <div :class="'lhjmain '+'lhjmain'+no" :id="'lhjmain-wd'+no" style="height:100px;"></div>
    </div>
    <div :style="{zIndex:showChart?100:-1000,position:'relative'}" class="">
      <div :class="'lhjmain '+'lhjmain'+no" :id="'lhjmain-lhyl'+no" style="height:100px;"></div>
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
  uniq,
  head
} from "lodash";
import moment from "moment";
import echarts from "../assets/js/echarts.min";

import notify from "../components/notify";
import { getDataListByKeys, convertXAxis } from "../utils/chartFormat";

let OrglinesTpl = [
  { key: "wd1", name: "硫化温度（℃）" },
  { key: "wd2", name: "硫化温度（℃）" },
  { key: "wd3", name: "硫化温度（℃）" },
  { key: "wd4", name: "硫化温度（℃）" },
  { key: "lhyl", name: "硫化压力（MPa）" }
];

export default {
  props: ["no", "bdkz"],
  methods: {
    fetchBdkzData(_lines, data) {
      let result = {};

      let _this = this;
      _this.maxBdkzTemp = null;
      _this.minBdkzTemp = null;
      _this.maxBdkzPress = null;
      _this.minBdkzPress = null;
      _this.startTimeBdkzData = null;
      _this.endTimeBdkzData = null;

      let flag = false;
      let bdkzData = data.filter(item => {
        if (!flag && item.bdkz) {
          flag = true;
        } else if (flag && !item.bdkz) {
          flag = false;
        }

        return flag;
      });

      let timeData = convertXAxis(bdkzData);
      _this.startTimeBdkzData = head(timeData);
      _this.endTimeBdkzData = last(timeData);
      if (_this.startTimeBdkzData && _this.endTimeBdkzData) {
        let _timeDelta =
          moment(_this.endTimeBdkzData) - moment(_this.startTimeBdkzData);
        let _minDelta = parseInt(_timeDelta / 1000 / 60);
        let _secDelta = parseInt((_timeDelta / 1000) % 60);
        if (_secDelta >= 30) {
          _minDelta += 1;
        }
        _this.timeBdkzDelta = `${_minDelta}分钟`;
      }

      function getDataListByKeys(data, list) {
        let result = {};
        list.forEach(v => {
          result[v.key] = {
            data: [],
            key: v.key
          };
          data.forEach(item => {
            let value = item[v.key];
            result[v.key].data.push(value);
          });
        });
        return result;
      }

      _lines.forEach((line, index) => {
        let lines = [line];
        let preSeriesData = getDataListByKeys(bdkzData, lines);
        let series = Object.keys(preSeriesData).map(v => preSeriesData[v]);
        series.forEach(items => {
          if (line.key == "lhyl") {
            if ((items.data || []).length) {
              _this.maxBdkzPress = Math.max(
                Math.max(...items.data),
                _this.maxBdkzPress || head(items.data)
              );
              _this.minBdkzPress = Math.min(
                Math.min(...items.data),
                _this.minBdkzPress || head(items.data)
              );
            }
          } else {
            _this.maxBdkzTemp = Math.max(
              Math.max(...items.data),
              _this.maxBdkzTemp || head(items.data)
            );
            _this.minBdkzTemp = Math.min(
              Math.min(...items.data),
              _this.minBdkzTemp || head(items.data)
            );
          }
        });
      });
    },
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
      let _this = this;
      this.mId = params.mId;
      this.mould = params.mould;

      if (this.mId == null) {
        notify.error("请输入模次号");
        return;
      }

      this.list = [];
      this.maxTemp = null;
      this.minTemp = null;
      this.maxPress = null;
      this.minPress = null;
      this.swTime = null;
      this.startTimeData = null;
      this.endTimeData = null;
      this.timeDelta = null;

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

        if (this.bdkz) {
          data = data.filter(item => {
            return item.bdkz && item.bdkz > 0;
          });
        }

        let linesTpl = JSON.parse(JSON.stringify(OrglinesTpl));
        let _lines = [linesTpl[4]];
        let chartNames = ["lhjmain-lhyl" + this.no];
        let firstFlag = false;
        let secondFlag = false;
        let thirdFlag = false;
        let fourthFlag = false;

        data.forEach(d => {
          d.firstTask && (d.firstBhgcl = Number(d.firstTask.bhgcl));
          d.secondTask && (d.secondBhgcl = Number(d.secondTask.bhgcl));
          d.thirdTask && (d.thirdBhgcl = Number(d.thirdTask.bhgcl));

          firstFlag =
            firstFlag || (d.firstTask && d.firstTask.mjh == this.mould);
          secondFlag =
            secondFlag || (d.secondTask && d.secondTask.mjh == this.mould);
          thirdFlag =
            thirdFlag || (d.thirdTask && d.thirdTask.mjh == this.mould);
          fourthFlag =
            fourthFlag || (d.fourthTask && d.fourthTask.mjh == this.mould);
        });

        if (fourthFlag) {
          _lines.unshift(linesTpl[3]);
          chartNames.unshift("lhjmain-wd" + this.no);
        } else if (thirdFlag) {
          _lines.unshift(linesTpl[2]);
          chartNames.unshift("lhjmain-wd" + this.no);
        } else if (secondFlag) {
          _lines.unshift(linesTpl[1]);
          chartNames.unshift("lhjmain-wd" + this.no);
        } else if (firstFlag) {
          _lines.unshift(linesTpl[0]);
          chartNames.unshift("lhjmain-wd" + this.no);
        }

        if (!this.bdkz) {
          this.initChart(chartNames);
        }

        let timeData = convertXAxis(data);
        let last_data = last(data);
        _this.list = [last_data];

        _this.swTime =last_data.swsssj; //last_data && last_data.swsssj;
        _this.startTimeData = head(timeData);
        _this.endTimeData = last(timeData);

        let _timeDelta =
          moment(_this.endTimeData) - moment(_this.startTimeData);
        let _minDelta = parseInt(_timeDelta / 1000 / 60);
        let _secDelta = parseInt((_timeDelta / 1000) % 60);
        if (_secDelta >= 30) {
          _minDelta += 1;
        }
        _this.timeDelta = `${_minDelta}分钟`;

        _lines.forEach((line, index) => {
          line.name = `模次号:${this.mId}-${line.name}`;
          let lines = [line];
          let preSeriesData = getDataListByKeys(data, lines);
          let series = Object.keys(preSeriesData).map(v => preSeriesData[v]);
          series.forEach(items => {
            if (line.key == "lhyl") {
              if ((items.data || []).length) {
                _this.maxPress = Math.max(
                  Math.max(...items.data),
                  _this.maxPress || head(items.data)
                );
                _this.minPress = Math.min(
                  Math.min(...items.data),
                  _this.minPress || head(items.data)
                );
              }
            } else {
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
            }
          });

          this.fetchBdkzData(_lines, data);

          let gridLeft = "3%";
          let yAxis = {
            type: "value",
            axisLabel: {
              formatter: "{value}"
            }
          };

          if (line.key !== "lhyl") {
            gridLeft = "2.5%";
            yAxis.max = _this.maxTemp + 2;
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
      endTime: "",

      maxTemp: null,
      minTemp: null,
      maxPress: null,
      minPress: null,
      swTime: null,
      startTimeData: null,
      endTimeData: null,

      maxBdkzTemp: null,
      minBdkzTemp: null,
      maxBdkzPress: null,
      minBdkzPress: null,
      startTimeBdkzData: null,
      endTimeBdkzData: null,
      timeBdkzDelta: null
    };
  }
};
</script>

