<style scoped>
.content-wrapper .operation-wrapper {
  margin-bottom: 0;
}
.form-control {
  display: inline-block;
  width: 75%;
}
.lhj-form .fetch-btn {
  margin-top: 24px;
}
.p-a {
  padding: 1em;
}
.p-a-sm {
  padding: 0.5em;
}
.p-y {
  padding-top: 1em;
  padding-bottom: 1em;
}
.p-x {
  padding-left: 1em;
  padding-right: 1em;
}
.p-x-sm {
  padding-left: 0.5em;
  padding-right: 0.5em;
}
.p-t-sm {
  padding-top: 0.5em;
}
.p-t-xs {
  padding-top: 0.3em;
}
.m-t-xs {
  margin-top: 0.3em;
}
.m-r-lg {
  margin-right: 3em;
}
.inline {
  display: inline-block;
}
.sign {
  position: absolute;
  bottom: 2em;
  right: 1em;
}
.to-print {
  display: none;
}
@media print {
  .to-print {
    display: initial;
  }
  .content,
  .content-wrapper .operation-wrapper {
    padding-top: 0;
  }
}
</style>

<template>
    <div class="pblji-monitor-more content">
        <loading v-show="loading"></loading>
        <div class="content-wrapper" v-show="!loading">
            <div class="operation-wrapper mould-detail lhj-form">
                <div class="row">
                    <div class="col-xs-12">
                        <div class="to-print">
                            <strong class="p-x-sm inline m-r-lg" v-text="`任务号: ${tId}`"></strong>
                            <span class="inline-block m-r-lg">
                                <strong>操作员：</strong>
                                <strong>{{operator}}</strong>
                            </span>
                            <span class="inline-block m-r-lg">
                                <strong>模具号：</strong>
                                <strong>{{mould}}</strong>
                            </span>
                            <span class="inline-block">
                                <strong>产品图号：</strong>
                                <strong>{{outerMId}}</strong>
                            </span>
                        </div>
                        <div class="row no-print">
                            <div class="col-xs-3">
                                <h5 class="p-x-sm" v-text="`任务号: ${tId}`"></h5>
                            </div>
                            <div class="col-xs-9">
                                <div class="row p-t-xs">
                                    <div class="col-xs-4">
                                        <span>
                                            <strong>操作员：</strong>
                                        </span>
                                        <select @change="switchData" class="form-control input-sm" v-model="operator">
                                            <option value="" selected>--请选择操作员--</option>
                                            <option :value="o" v-for="o in operators">{{o}}</option>
                                        </select>
                                    </div>
                                    <div class="col-xs-4">
                                        <span>
                                            <strong>模具号：</strong>
                                        </span>
                                        <select @change="switchData" class="form-control input-sm" v-model="mould">
                                            <option value="" selected>--请选择模具号--</option>
                                            <option :value="m" v-for="m in moulds">{{m}}</option>
                                        </select>
                                    </div>
                                    <div class="col-xs-4 p-t-xs">
                                        <strong>产品图号：</strong>
                                        <strong>{{outerMId}}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row p-a m-t-xs no-print">
                            <div class="col-xs-3 p-t-sm">
                                <span>
                                    <strong>模次号：</strong>
                                </span>
                                <input type="text" v-model="mId" placeholder="请输入模次号">
                            </div>
                            <div class="col-xs-2">
                                <button type="button" class="btn btn-primary m-r m-t-xs" @click="fetchJrbData">查询</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 1 -->
        <div class="content-wrapper" v-show="!loading">
            <div class="operation-wrapper lhj-form p-x">
                <div class="row no-print">
                    <div class="col-xs-3 p-t-sm">
                        <span>
                            <strong>上加热板温度：</strong>
                        </span>
                    </div>
                </div>
                <pblhj-jrb-detail :no="'1'" v-ref:chart1></pblhj-jrb-detail>
            </div>
        </div>
        <!-- 2 -->
        <div class="content-wrapper" v-show="!loading">
            <div class="operation-wrapper lhj-form p-x">
                <div class="row no-print">
                    <div class="col-xs-3 p-t-sm">
                        <span>
                            <strong>中加热板温度：</strong>
                        </span>
                    </div>
                </div>
                <pblhj-jrb-detail :no="'2'" v-ref:chart2></pblhj-jrb-detail>
            </div>
        </div>
        <!-- 3 -->
        <div class="content-wrapper" v-show="!loading">
            <div class="operation-wrapper lhj-form p-x">
                <div class="row no-print">
                    <div class="col-xs-3 p-t-sm">
                        <span>
                            <strong>下加热板温度：</strong>
                        </span>
                    </div>
                </div>
                <pblhj-jrb-detail :no="'3'" v-ref:chart3></pblhj-jrb-detail>
            </div>
        </div>
    </div>
</template>

<script>
import { uniq } from "lodash";
import pblhjJrbDetail from "./pblhj_jrb_detail";

export default {
  props: ["id"],
  components: {
    pblhjJrbDetail
  },
  watch: {
    tId: {
      handler: function(val) {
        if (val) {
          this.draw();
        }
      },
      deep: true
    }
  },
  created() {
    this.tId = this.$route.params.id;
  },
  methods: {
    switchData() {},
    fetchJrbData() {
      this.fetchLHJData(1);
      this.fetchLHJData(2);
      this.fetchLHJData(3);
    },
    _fetchLHJData(no) {
      this.$refs["chart" + no].init({
        wuId: this.operator || "",
        tId: this.tId || "",
        mould: this.mould || "",
        mId: this["mId"] || ""
      });
    },
    fetchLHJData(no) {
      this[`bdkz${no}`] = false;
      this._fetchLHJData(no);
    },
    draw() {
      if (!this.tId) {
        notify.error("请选择设备");
        return;
      }
      var _this = this;

      this.ybCode = this.device._id;
      this.$http
        .post("/api/pblhjmonitorfields", { tId: this.tId })
        .then(res => {
          if (res.data) {
            this.operators = uniq(res.data.wuIds);
            this.moulds = uniq(res.data.moulds).filter(m => !!m);

            if (this.operators.length > 0) this.operator = this.operators[0];
            if (this.moulds.length > 0) this.mould = this.moulds[0];
            return this.fetchLHJData(1);
          } else {
            return;
          }
        });
    }
  },
  ready() {
    this.outerMId = sessionStorage.getItem(`outerMId-${this.tId}`);
    Promise.all([this.$http.get("/api/workusers/field")]).then(
      function(res) {
        this.workUsers = res[0].data;
      }.bind(this)
    );
  },
  data() {
    return {
      tId: null,
      device: Object,
      operators: [], //操作员列表
      moulds: [], // 模具号列表
      operator: "", // 操作员
      mould: "", // 模具号
      ybCode: "", // 仪表编号
      list: [], // 列表
      // devices: [],          // 所有设备
      workUsers: [], // 所有员工,
      outerMId: null, //产品图号,

      bdkz1: false,
      bdkz2: false,
      bdkz3: false,
      bdkz4: false,
      bdkz5: false
    };
  }
};
</script>

