/* eslint-disable no-console, no-unused-vars, spaced-comment */

// create an empty modbus client
var ModbusRTU = require("modbus-serial");
//var ModbusRTU = require("../index");
var gd,fg;
var rd =new Array()
var wd =new Array()
 var doStuff = function(addr) {
    console.log("地址"+addr);
    gd=wd[addr];
   console.log("数据"+gd);
    return gd
};
var vector = {

  getHoldingRegister: doStuff,
//  getHoldingRegister: function(addr, unitID) { return addr + 8000; },

  setRegister: function(addr, value) {
    rd[addr]=value;

    // console.log("set register", addr, value,rd[addr]);
      return; }

};

console.log("ModbusTCP listening on modbus://127.0.0.1:8502  192.168.0.56");
var serverTCP = new ModbusRTU.ServerTCP(vector, { host: "0.0.0.0", port: 8502, debug: true, unitID: 1 });

serverTCP.on("socketError", function(err) {
    console.error(err);
});
exports.getModbusdata=function () {
    return  rd;
}

//设置wd值
//s地址开始位置
exports.setwd=function (s,newarr) {

    console.error("wd--->>>", wd);
    for(var k=0;k<newarr.length;k++){
        if(newarr[k]){
            wd[k+s]=newarr[k];
        }
    }
}
