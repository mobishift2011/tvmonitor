import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';

import oauth from './utils/oauth';
import filters from './filters';
import Loading from './components/loading';
import Datepicker from './components/datepicker';

import App from './app';
import Home from './routes/home';
import Login from './routes/login';
import Error from './routes/error';

import Mould from './routes/mould';
import MouldCheck from './routes/mould_check';
import MouldDetail from './routes/mould_detail';
import MouldApply from './routes/mould_apply';
import MouldState from './routes/mould_state';

import AllPlan from './routes/all_plan';
import ChildPlan from './routes/child_plan';
import PlanDetail from './routes/plan_detail';
import ProdPlan from './routes/prod_plan';
import ProdProd from './routes/prod_prod';
import ProdCheck from './routes/prod_check';
import ProdDispatch from './routes/prod_dispatch';
import ProdGroup from './routes/prod_group';
import ProdPick from './routes/prod_pick';
import ProdTest from './routes/prod_test';
import ProdIssue from './routes/prod_issue';
import ProdProce from './routes/prod_proce';
import ProceCheck from './routes/proce_check';
import ProceTest from './routes/proce_test';

import ProceLibrary from './routes/proce_library';
import ProceLibraryCheck from './routes/proce_library_check';
import ProceLibraryQuota from './routes/proce_library_quota';
import ProceLibraryManage from './routes/proce_library_manage';

import Permission from './routes/permission';

import WorkShop from './routes/work_shop';
import WorkGroup from './routes/work_group';
import WorkUser from './routes/work_user';

import JiaoLiao from './routes/jiao_liao.vue';
import jiaoLiaoCancel from './routes/jiao_liao_cancel';
import jiaoLiaoTest from './routes/jiao_liao_test';
import JiaoLiaoCheck from './routes/jiao_liao_check';
import JiaoLiaoDetail from './routes/jiao_liao_detail';
import JiaoLiaoStateCheck from './routes/jiao_liao_state_check';

import PblhjState from './routes/pblhj_state';
import HxState from './routes/hx_state';

import PblhjMonitor from './routes/pblhj_monitor';
import HxMonitor from './routes/hx_monitor';
import HxMonitorPrint from './routes/hx_monitor_print'
import WsdMonitor from './routes/wsd_monitor';
import WsdHistoryMonitor from './routes/wsd_history_monitor';
import pblhjMonitorMore from './routes/pblhj_monitor_more';
import pblhjMonitorAll from './routes/pblhj_monitor_all';
import pblhjJrb from './routes/pblhj_jrb';

// import ElementUI from 'element';
// import 'element-ui/lib/theme-default/index.css'


// Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.use(VueResource);
Vue.http.options.timeout = 600000;
Vue.component('loading', Loading);
Vue.component('date-picker', Datepicker);

Object.keys(filters).forEach(function (key) {
  Vue.filter(key, filters[key]);
});

var router = new VueRouter();

/**
 * 路由配置
 */
router.map({
  '/': {
    component: Home,
    subRoutes: {
      '/allplan': {
        component: AllPlan
      },
      '/childplan': {
        component: ChildPlan
      },
      '/allplan/:id': {
        component: PlanDetail
      },
      '/prodplan': {
        component: ProdPlan
      },
      '/prodprod': {
        component: ProdProd
      },
      '/prodcheck': {
        component: ProdCheck
      },
      '/proddispatch': {
        component: ProdDispatch
      },
      '/prodgroup': {
        component: ProdGroup
      },
      '/prodpick': {
        component: ProdPick
      },
      '/prodissue': {
        component: ProdIssue
      },
      '/prodtest': {
        component: ProdTest
      },
      '/prodproce': {
        component: ProdProce
      },
      '/procecheck': {
        component: ProceCheck
      },
      '/procetest': {
        component: ProceTest
      },
      '/procelibrary': {
        component: ProceLibrary
      },
      '/procelibrarycheck': {
        component: ProceLibraryCheck
      },
      '/procelibraryquota': {
        component: ProceLibraryQuota
      },
      '/procelibrarymanage': {
        component: ProceLibraryManage
      },
      '/workshop': {
        component: WorkShop
      },
      '/workgroup': {
        component: WorkGroup
      },
      '/workuser': {
        component: WorkUser
      },
      '/mould': {
        component: Mould
      },
      '/mouldcheck': {
        component: MouldCheck
      },
      '/mouldapply': {
        component: MouldApply
      },
      '/mould/state/:mId': {
        component: MouldDetail
      },
      '/mouldstate': {
        component: MouldState
      },
      '/permission': {
        component: Permission
      },
      '/jiaoliao': {
        component: JiaoLiao
      },
      '/jiaoliaocheck': {
        component: JiaoLiaoCheck
      },
      '/jiaoliaocancel': {
        component: jiaoLiaoCancel
      },
      '/jiaoliaotest': {
        component: jiaoLiaoTest
      },
      '/jiaoliao/:id': {
        component: JiaoLiaoDetail
      },
      '/jiaoliaostatecheck': {
        component: JiaoLiaoStateCheck
      },
      '/pblhjstate/:id': {
        component: PblhjState
      },
      '/pblhjmonitor': {
        component: PblhjMonitor
      },
      '/hxstate/:id': {
        component: HxState
      },
      /*  '/hxmonitor': {
         component: HxMonitor
       }, */
      '/hxmonitorprint/:id': {
        component: HxMonitorPrint
      },
      '/wsdmonitor': {
        component: WsdMonitor
      },
      '/wsdhistorymonitor': {
        component: WsdHistoryMonitor
      },
      '/pblhjmonitormore/:id': {
        component: pblhjMonitorMore
      },
      '/pblhjmonitorall/:id': {
        component: pblhjMonitorAll
      },
      'pblhjjrb/:id': {
        component: pblhjJrb
      }
    }
  },
  '/login': {
    component: Login
  },
  '/error': {
    component: Error
  }
});

/**
 * 路由跳转
 */
router.redirect({
  '*': '/'
});

/**
 * Http Interceptors
 */
Vue.http.interceptors.push((request, next) => {
  request.headers['authorization'] = oauth.getToken();

  next((response) => {
    if (response.status === 401) {
      router.go({ path: '/login' });
    }

    if (response.status === 403) {
      router.go({ path: '/error' });
    }
  });
});

router.start(App, '#app');