const serverID = 'server' // socketio配置
// const mongoURL = 'mongodb://localhost/tvmonitor4'// mongo地址
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const moment = require('moment')
// const mongoose = require('mongoose')
const _ = require('lodash')
const logger = require('./lib/utils/log4js').socketio()

let firstUseFlag = -1 // 启停标志
let secondUseFlag = -1
let thirdUseFlag = -1
let fourthUseFlag = -1

// let PblhjStateDataModel = require('./model/pblhj_state_data.js')
// let PblhjStateModel = require('./model/pblhj_state.js')
// let workUserModel = require('./model/work_user.js')

let PblhjStateDataModel = require('./lib/models/pblhj_state_data.js')
let PblhjStateLastDataModel = require('./lib/models/pblhj_state_lastdata.js')
let PblhjStateModel = require('./lib/models/pblhj_state.js')
let workUserModel = require('./lib/models/work_user.js')
let ProdProceService = require('./lib/services/prod_proce')

init()

/**
 * 给客户端发送数据
 *
 * @param {String} eqId
 * @param {Array} dataArray
 */
function sendData2Client(eqId, string) {
  logger.info('sendData2Client', eqId, string)
  io.emit(eqId, string)
}

/**
 * 初始化
 *
 */
function init() {
  // 初始化mongodb
  // mongoose.connect(mongoURL)
  // .then(function () {
  //   console.log('mongoDB连接成功')
  // })
  // .catch(function (err) {
  //   console.log('mongoDB连接失败', err)
  // })

  // 初始化socketio
  io.on('connection', function (socket) {
    logger.info('socketio client connection')
    // 接收客户端数据 进行处理
    socket.on(serverID, function (eqId, json) {
      logger.info('recieveData4Client', eqId, json)
      if (json) {
        recieveHandle(eqId, json)
      } else {
        // 不带json认为是首次连接
        socket.$eqId = eqId
        logger.info(socket.$eqId, '- 上线 - ', moment().format('h:mm:ss a'))
        // 不再使用与客户端的连接状态
        // PblhjStateModel.update({eqId: socket.$eqId}, {connectState: 1}).exec()
        // .then(function () {
        //   logger.info('更新连接状态')
        // })
        // .catch(function (err) {
        //   logger.info('更新连接状态失败', err)
        // })
      }
    })

    socket.on('disconnect', function () {
      logger.info(socket.$eqId, '- 离线 - ', moment().format('h:mm:ss a'))
      // 不再使用与客户端的连接状态，离线就设置为2
      PblhjStateModel.update({ eqId: socket.$eqId }, { connectState: 2 }).exec()
        .then(function () {
          logger.info('更新连接状态');
          io.emit('stateChanged');
        })
        .catch(function (err) {
          logger.info('更新连接状态失败', err)
        })
    })
  })

  // 初始化http
  http.listen(3000, function () {
    logger.info('app.js listening on 127.0.0.1:3000')
  })

  // 读取所有客户端的配置 并发送给从机
  PblhjStateModel.find().exec()
    .then(function (doc) {
      logger.info('客户端配置共：', doc.length, '个')
      doc.forEach(function (v) {
        setTimeout(function () {
          sendConfig2Client(v)
        }, 10 * 1000)
      })
    })
    .catch(function (err) {
      logger.info('读取客户端配置失败', err)
    })
}

/**
 * 发送配置表给客户端
 * @param {Document} mongodb保存数据的文档
 */
function sendConfig2Client(document) {
  // logger.info('sendConfig2Client',document)
  let o = _.merge({}, document.toObject({ minimize: false, versionKey: false }))
  _.set(o, 'lhjState', _.get(o, '_id')) // 将客户端的_id变为lhjState
  _.unset(o, '_id')
  // console.log(o)
  // 查询并添加工号ID
  workUserModel.findById(o.adder).exec()
    .then(function (doc) {
      _.set(o, 'wuId', doc.wuId)
      // 发送到对应的客户端
      sendData2Client(o.eqId, JSON.stringify(o))
    })
    .catch(function (err) {
      logger.info('查询工号失败', err)
    })
}

/**
 * 服务器端接收数据处理
 *
 * @param {String} eqId
 * @param {String} json
 */
function recieveHandle(eqId, json) {
  console.log(eqId, ':', json)
  let o = JSON.parse(json)
  // 临时添加modbusConnectState的解释
  if (o.modbusConnectState != undefined) {
    console.log('o.modbusConnectState:', o.modbusConnectState)
    PblhjStateModel.update({ eqId: eqId }, { connectState: o.modbusConnectState }).exec()
      .then(function () {
        logger.info('更新连接状态');
        io.emit('stateChanged');
      })
      .catch(function (err) {
        logger.info('更新连接状态失败', err)
      })
    return
  }

  logger.info('硫化标志与启停标志：', o.lhbz, o.firstUse, o.secondUse, o.thirdUse, o.fourthUse)

  // 更新实时数据
  PblhjStateLastDataModel.update({ lhjState: o.lhjState }, o, { upsert: true }).exec()
    .then(function () {
      logger.info('更新最新数据', moment().format('h:mm:ss a'));
      io.emit('stateChanged');
    })
    .catch(function (err) {
      logger.info('更新最新数据失败', moment().format('h:mm:ss a'))
      console.error(err)
    })

  if (o.lhbz === 1) { // 硫化标志为1时才保存历史数据
    PblhjStateDataModel(o).save()
      .then(function () {
        logger.info('保存历史数据成功', moment().format('h:mm:ss a'));
        io.emit('stateChanged');
      })
      .catch(function (err) {
        logger.info('保存历史数据失败', moment().format('h:mm:ss a'))
        console.error(err)
      })
  }
  // 启停标志出现变化时，工序号更新为启停+1
  if ((o.firstUse === 1 || o.firstUse === 2) && firstUseFlag !== o.firstUse) {
    firstUseFlag = o.firstUse
    updateLHJStateNProce(o.firstTask.tId, firstUseFlag + 1)
  }
  if ((o.secondUse === 1 || o.secondUse === 2) && secondUseFlag !== o.secondUse) {
    secondUseFlag = o.secondUse
    updateLHJStateNProce(o.secondTask.tId, secondUseFlag + 1)
  }
  if ((o.thirdUse === 1 || o.thirdUse === 2) && thirdUseFlag !== o.thirdUse) {
    thirdUseFlag = o.thirdUse
    updateLHJStateNProce(o.thirdTask.tId, thirdUseFlag + 1)
  }
  if ((o.fourthUse === 1 || o.fourthUse === 2) && fourthUseFlag !== o.fourthUse) {
    fourthUseFlag = o.fourthUse
    updateLHJStateNProce(o.fourthTask.tId, fourthUseFlag + 1)
  }
}

/**
 * 更新工序
 *
 * @param {String} tId
 * @param {Number} prodState
 */
function updateLHJStateNProce(tId, prodState) {
  ProdProceService.updateByCondition({
    'tId': tId,
    'sType': 's1'
  }, {
      '$set': {
        'prodState': prodState
      }
    }) // 更新工序状态
    .then(function (res) {
      logger.info('任务号：', tId, ' 更新工序状态 ', prodState);
      io.emit('stateChanged');
    })
    .catch(function (err) {
      logger.info('更新工序失败', err)
    })
}
module.exports = {
  sendConfig2Client: sendConfig2Client
}
