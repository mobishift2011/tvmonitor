var ModbusRTU = require("modbus-serial");
var log = require('../utils/log4js').default();

const networkErrors = ["ESOCKETTIMEDOUT", "ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"];
function Modbus(option) {
    this.client = new ModbusRTU();
    this.id = parseInt(option.id) || 1;
    this.ip = option.ip || '127.0.0.1';
    this.port = option.port || 8502;
    this.timeOut = option.timeOut || 10000;
    this.connectType = option.connectType || 'read';
    this.timeOutSwitch={}
}
Modbus.prototype.connect = function(){
    clearTimeout(this.timeOutSwitch)
    if(this.client.isOpen()){
        return false;
    }else{
        var that = this;
        this.client.connectTCP(this.ip, {port: this.port}).then(that.setClient(that))
            .then(function () {
                log.info(that.ip, ':', that.port, '  已经连接');
            })
            .catch(function (e) {
                console.log('连接err：' + e)
                that.checkError(e);
            }.bind(this))
    }

}

Modbus.prototype.read = function(startNum, length){
    return this.client.readHoldingRegisters(startNum, length);
}

Modbus.prototype.write = function (writeStart, data) {
    return this.client.writeRegisters(writeStart, data);
}

Modbus.prototype.setClient = function (that) {
    that.client.setID(that.id);
    that.client.setTimeout(that.timeOut);
}

Modbus.prototype.checkError = function (e) {
    //if (e.errno && networkErrors.includes(e.errno)) {
    log.info("we have to reconnect" + this.ip);
    let timeoutTime = 60 * 1000;
    if(this.client.isOpen()){
        this.client.close();
        this.client = new ModbusRTU();
        this.timeOutSwitch=setTimeout(this.connect(), timeoutTime)
    }

    //}
}

Modbus.prototype.close = function () {
    this.client.close();
}

Modbus.prototype.isOpen = function () {
    return this.client.isOpen()
}


module.exports = Modbus

/* eslint-disable no-console, no-unused-vars, spaced-comment */

// create an empty modbus client
// var ModbusRTU = require("modbus-serial");
// //var ModbusRTU = require("../index");
//
// var vector = {
//     getInputRegister: function(addr) { return addr; },
//     getHoldingRegister: function(addr) { return addr + 8000; },
//     getCoil: function(addr) { return (addr % 2) === 0; },
//     setRegister: function(addr, value) { console.log("set register", addr, value); return; },
//     setCoil: function(addr, value) { console.log("set coil", addr, value); return; }
// };
//
// // set the server to answer for modbus requests
// console.log("ModbusTCP listening on modbus://0.0.0.0:8502");
// var serverTCP = new ModbusRTU.ServerTCP(vector, { host: "192.168.0.56", port: 8502, debug: true, unitID: 1 });
//
// serverTCP.on("socketError", function(err) {
//     console.error(err);
// });