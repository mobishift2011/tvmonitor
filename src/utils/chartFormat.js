import moment from 'moment';
/**
 *
 * @param data 后台返回的data数据 list
 * @param list 传入的数组
 * @returns Object 包含的echarts 格式数据
 */
function getDataListByKeys(data, list){
    let result = {}
    list.forEach(v => {
        result[v.key] = {
            name: v.name,
            type:'line',
            data:[],
            key: v.key
        }
        data.forEach(item => {
            result[v.key].data.push(item[v.key])
        })
    })
    return result
}
function convertXAxis(data) {
    return data.map(function (item) {
        return moment(item.addDate).format('YYYY-MM-DD HH:mm');
    });
}

module.exports = {
    getDataListByKeys: getDataListByKeys,
    convertXAxis: convertXAxis
}