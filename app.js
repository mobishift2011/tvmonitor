var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var log4js = require('./lib/utils/log4js');

//创建modbus服务
require('./lib/routes/server');
require('./lib/routes/backend_v2');
require('./socket_server.js');
var oauthRoute = require('./lib/routes/oauth');
var loginRoute = require('./lib/routes/login');

var workShopRoutes = require('./lib/routes/work_shop');
var workGroupRoutes = require('./lib/routes/work_group');
var workUserRoutes = require('./lib/routes/work_user');
var permissionRoutes = require('./lib/routes/permission');
var allPlanRoutes = require('./lib/routes/all_plan');
var childPlanRoutes = require('./lib/routes/child_plan');
var prodPlanRoutes = require('./lib/routes/prod_plan');
var prodProdRoutes = require('./lib/routes/prod_prod');
var prodCheckRoutes = require('./lib/routes/prod_check');
var prodQuotaRoutes = require('./lib/routes/prod_quota');
var prodGroupRoutes = require('./lib/routes/prod_dispatch');
var prodDispatchRoutes = require('./lib/routes/prod_group');
var prodPickRoutes = require('./lib/routes/prod_pick');
var prodTestRoutes = require('./lib/routes/prod_test');
var prodIssueRoutes = require('./lib/routes/prod_issue');
var prodProceRoutes = require('./lib/routes/prod_proce');
var proceCheckRoutes = require('./lib/routes/proce_check');
var proceTestRoutes = require('./lib/routes/proce_test');
var proceLibraryRoutes = require('./lib/routes/proce_library');
var proceLibraryCheckRoutes = require('./lib/routes/proce_library_check');
var proceLibraryQuotaRoutes = require('./lib/routes/proce_library_quota');
var proceLibraryManageRoutes = require('./lib/routes/proce_library_manage');

var monitorProceRoutes = require('./lib/routes/monitor_proce');

var mouldRoutes = require('./lib/routes/mould');
var mouldCheckRoutes = require('./lib/routes/mould_check');
var mouldStateRoutes = require('./lib/routes/mould_state');
var mouldApplyRoutes = require('./lib/routes/mould_apply');

var jiaoLiaoRoutes = require('./lib/routes/jiao_liao');
var jiaoLiaoCheckRoutes = require('./lib/routes/jiao_liao_check');
var jiaoLiaoStateRoutes = require('./lib/routes/jiao_liao_state');
var jiaoLiaoStateCheckRoutes = require('./lib/routes/jiao_liao_state_check');

var pblhjStateRoutes = require('./lib/routes/pblhj_state');
var hxStateRoutes = require('./lib/routes/hx_state');
var pblhjMointorRoutes = require('./lib/routes/pblhj_monitor');
var hxMointorRoutes = require('./lib/routes/hx_monitor');
var wsdMonitor = require('./lib/routes/wsd_monitor');

var fileRoutes = require('./lib/routes/file');

var app = express();

// setup the logger
app.use(log4js.access());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/', loginRoute);	
app.use('/', oauthRoute);
app.use('/api', workShopRoutes);
app.use('/api', workGroupRoutes);
app.use('/api', workUserRoutes);
app.use('/api', permissionRoutes);
app.use('/api', allPlanRoutes);
app.use('/api', childPlanRoutes);
app.use('/api', prodPlanRoutes);
app.use('/api', prodProdRoutes);
app.use('/api', prodCheckRoutes);
app.use('/api', prodQuotaRoutes);
app.use('/api', prodDispatchRoutes);
app.use('/api', prodGroupRoutes);
app.use('/api', prodPickRoutes);
app.use('/api', prodTestRoutes);
app.use('/api', prodIssueRoutes);
app.use('/api', prodProceRoutes);
app.use('/api', proceCheckRoutes);
app.use('/api', proceTestRoutes);
app.use('/api', proceLibraryRoutes);
app.use('/api', mouldRoutes);
app.use('/api', mouldCheckRoutes);
app.use('/api', mouldStateRoutes);
app.use('/api', mouldApplyRoutes);
app.use('/api', proceLibraryCheckRoutes);
app.use('/api', proceLibraryQuotaRoutes);
app.use('/api', proceLibraryManageRoutes);
app.use('/api', monitorProceRoutes);
app.use('/api', jiaoLiaoRoutes);
app.use('/api', jiaoLiaoCheckRoutes);
app.use('/api', jiaoLiaoStateRoutes);
app.use('/api', jiaoLiaoStateCheckRoutes);
app.use('/api', pblhjStateRoutes);
app.use('/api', pblhjMointorRoutes);
app.use('/api', hxStateRoutes);
app.use('/api', hxMointorRoutes);
app.use('/api', wsdMonitor);
app.use('/api', fileRoutes);

app.use(function (req, res) {
  res.status(404).end();
});

module.exports = app;
