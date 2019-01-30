var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'tsmonitor',//服务名称
  description: 'The nodejs.org example web server.',//描述
  script: 'c:/ts-s/bin/www'//nodejs项目要启动文件的路径
  //wait: 2,//程序崩溃后重启的时间间隔
  //grow: .5,//重启等待时间成长值，比如第一次1，第二次1.25秒，第三次1.5

 //maxRestarts:10,//60秒内最大重启次数
});

// Listen for the "install" event, which indicates the
// process is available as a service.
//监听安装事件
svc.on('install',function(){
  svc.start();
  console.log('install complete.');
});

//监听卸载事件
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});
//防止程序运行两次
svc.on('alreadyinstalled',function(){
  console.log('This service is already installed.');
});
 // 如果存在就卸载
if (svc.exists) return svc.uninstall();
  // 如果不存在就安装
svc.install();
