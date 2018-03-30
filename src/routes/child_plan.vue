<style lang="less" scoped>
.p-y {
  padding-top: 1em;
  padding-bottom: 1em;
}
.p-y-sm {
  padding-top: 0.5em;
}
.p-x {
  padding-right: 1em;
  padding-left: 1em;
}
</style>

<template>
  <div class="childplan">
    <h1>子任务计划</h1>
    <loading v-show="loading"></loading>
    <div class="content-wrapper" v-show="!loading">
      <div class="operation-wrapper row">
        <div class="col-xs-6">
            <div class="form form-horizontal p-y">
                <div class="form-error" v-show="error">
                <span class="glyphicon glyphicon-remove-sign"></span> {{error}}
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">子任务单号</label>
                    <div class="col-sm-9">
                        <input type="text" v-model="model.tId" maxlength="50" class="form-control input-sm"/>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">父任务单号</label>
                    <div class="col-sm-9">
                        <select v-model="parentProd"
                            class="form-control input-sm"
                            placeholder="请选择父任务单号">
                            <option :value="item" v-for="item in list" v-text="item.tId+' - '+item.ppName"></option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">生产数量（个）</label>
                    <div class="col-sm-9">
                        <input type="text" v-model="model.planComment" maxlength="50" class="form-control input-sm"/>
                    </div>
                </div>
            </div>
          <button class="btn btn-primary btn-sm pull-right" @click="add()">新 增</button>
        </div>
        <div class="col-xs-6" v-show="!!(parentProd._id)">
            <h5 class="text-center">所选父任务基本信息</h5>
            <div class="form form-horizontal">
                <div class="form-group">
                    <label class="col-sm-3 control-label">产品名称</label>
                    <div class="col-sm-9">
                        <div class="p-y-sm" v-text="parentProd.ppName"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">任务单号</label>
                    <div class="col-sm-9">
                        <div class="p-y-sm" v-text="parentProd.tId"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">产品图号</label>
                    <div class="col-sm-9">
                        <div class="p-y-sm" v-text="parentProd.mId"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">任务性质</label>
                    <div class="col-sm-9">
                        <div class="p-y-sm" v-text="parentProd.special"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">开始时间</label>
                    <div class="col-sm-9">
                        <div class="p-y-sm" v-text="parentProd.staTime | moment"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">交付时间</label>
                    <div class="col-sm-9">
                        <div class="p-y-sm" v-text="parentProd.endTime | moment"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">计划员</label>
                    <div class="col-sm-9">
                        <div class="p-y-sm" v-text="getWorkUserName(parentProd.planer)"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">技术员</label>
                    <div class="col-sm-9">
                        <div class="p-y-sm" v-text="getWorkUserName(parentProd.skiller)"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">调度员</label>
                    <div class="col-sm-9">
                        <div class="p-y-sm" v-text="getWorkUserName(parentProd.dispatcher)"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">计划进度</label>
                    <div class="col-sm-9">
                        <div class="p-y-sm" v-html="planState(parentProd)"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">生产数量</label>
                    <div class="col-sm-9">
                        <div class="p-y-sm" v-text="parentProd.planComment"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
  </div>
</template>

<script>
import { find } from "lodash";
import { planState } from "../utils/label";
import notify from "../components/notify";

export default {
  data() {
    return {
      loading: true, // 初始化中
      workUsers: [], // 所有员工
      model: {}, // 当前待新增的子任务
      list: [], // 所有数据
      error: "", // 错误信息
      parentProd: {},
      wps: []
    };
  },
  watch: {
    parentProd(val) {
      if (val._id) {
        this.model.ptId = val.tId;
        Promise.all([
          this.$http.get(`/api/allplan/${val._id}`)
          // this.$http.get("/api/hxstates")
        ]).then(res => {
          let wps = res[0].data.wps;
          wps.forEach(item => {
            delete item._id;
            delete item.ppId;
            delete item.tId;
          });
          this.model.wps = wps;
          // var device = res[2].data;
        });
      }
    }
  },
  created() {
    Promise.all([
      this.$http.get("/api/workusers/field"),
      this.$http.get("/api/allplans")
    ]).then(res => {
      if (res.length > 0) {
        this.workUsers = res[0].data;
        this.list = res[1].data;
        this.loading = false;
      }
    });
  },
  methods: {
    planState: planState,
    getWorkUserName(id) {
      return (find(this.workUsers, { _id: id }) || {}).wuName;
    },
    valid() {
      let plan = this.model;
      if (!plan.tId) {
        this.error = "请输入子任务号";
        return false;
      }

      if (!plan.ptId) {
        this.error = "请选择父任务";
        return false;
      }

      if (!plan.planComment) {
        this.error = "请输入生产数量";
        return false;
      }

      this.error = "";
      return true;
    },
    resetForm() {
      this.model = {};
      this.error = "";
      this.parentProd = {};
    },
    _add(plan) {
      this.$http
        .post("/api/childplan", plan)
        .then(res => {
          this.list.unshift(res.data);
          notify.info("新增成功！");
          this.resetForm();
        })
        .catch(error);

      function error(res) {
        if (res.status === 400) {
          this.error = res.data.error;
        }
      }
    },
    add() {
      if (!this.valid()) return;
      let child = Object.assign({}, this.parentProd, this.model);
      delete child._id;
      this._add(child);
      console.log(child);
    }
  }
};
</script>


