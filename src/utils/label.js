import {JL_STATES} from './constants';

export function planState(item) {
  if (item.state === 0) return '<label class="label label-default">' + (item.checker ? '等待校对' : '等待修改') + '</label>';
  if (item.state === 1) return '<label class="label label-default">等待定额</label>';
  if (item.state === 2) return '<label class="label label-default">等待调度</label>';
  if (item.state === 3) return '<label class="label label-default">等待班组</label>';
  if (item.state === 4) return '<label class="label label-default">' + (item.issuer ? '等待发料' : '等待领料') + '</label>';
  if (item.state === 5) return '<label class="label label-default">等待校验</label>';
  if (item.state === 6) return '<label class="label label-default">等待工序</label>';
  if (item.state === 10) return `<label class="label label-success">合格${item.qNum}</label>`;
  if (item.state === 20) return `<label class="label label-danger">${item.cwp}批废</label>`;
  return ``;
}

export function prodState(prod, currState) {
  if (prod.state > currState && prod.state < 10) return '<label class="label label-default">进行中</label>';
  if (prod.state === 10) return '<label class="label label-success">完成</label>';
  if (prod.state === 20) return '<label class="label label-danger">批废</label>';
  return '';
}

export function proceUsage(item) {
  if (item.state === 0) return '<label class="label label-default">待校对</label>';
  if (item.state === 1) return '<label class="label label-default">待定额</label>';
  if (item.state === 2) return '<label class="label label-default">待审核</label>';
  return item.usage ? '<label class="label label-success">使用</label>' : '<label class="label label-danger">作废</label>';
}
  
export function proceState(item) {
  if (item.state === 0) return '<label class="label label-default">' + (item.checker ? '等待互检' : '等待修改') + '</label>';
  if (item.state === 1) return '<label class="label label-default">等待校验</label>';
  if (item.state === 2 && !item.qNum) return '<label class="label label-danger">批废</label>';
  return '<label class="label label-success">完成</label>';
}

export function proceProdState(item) { //工序生产状态
  if (item.prodState === 0) return '<label class="label label-default">未绑定</label>';
  if (item.prodState === 1) return '<label class="label label-default">已绑定</label>';
  if (item.prodState === 2) return '<label class="label label-default">硫化中</label>';
  if (item.prodState === 3) return '<label class="label label-success">硫化完成</label>';
  if (item.prodState === 4) return '<label class="label label-success">自检完成</label>';
  if (item.prodState === 5) return '<label class="label label-success">互检完成</label>';
  if (item.prodState === 6) return '<label class="label label-success">硫化完成</label>';
}

export function jiaoliaoState(state) {
  return JL_STATES[state];
}