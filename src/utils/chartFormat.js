import moment from 'moment';
/**
 *
 * @param data 后台返回的data数据 list
 * @param list 传入的数组
 * @returns Object 包含的echarts 格式数据
 */

function setDefault(obj, k, v) {
    if (!obj[k]) {
        obj[k] = v
    }
    return obj
}

function getDataListByKeys(data, list, bdkz = true) {
    let result = {}
    list.forEach(v => {
        result[v.key] = {
            name: v.name,
            type: 'line',
            data: [],
            key: v.key
        }

        let bdkzFlag = 0;
        data.forEach((item, index) => {
            let value = item[v.key]
            result[v.key].data.push(value);
            if (bdkz) {
                if (item.bdkz > 0 && bdkzFlag == 0) {
                    bdkzFlag = 1;
                    setDefault(result[v.key], 'markPoint', { data: [] })
                    result[v.key].markPoint.data.push(
                        { name: 'bdkz-on', value: value, xAxis: index, yAxis: value, symbolSize: 42 }
                    );
                }
                if (item.bdkz == 0 && bdkzFlag > 0) {
                    bdkzFlag = 0;
                    setDefault(result[v.key], 'markPoint', { data: [] })
                    result[v.key].markPoint.data.push(
                        { name: 'bdkz-off', value: value, xAxis: index, yAxis: value, symbolSize: 42 }
                    );
                }
            }
        })
    })
    return result
}
function convertXAxis(data) {
    return data.map(function (item) {
        return moment(item.addDate).format('YYYY-MM-DD HH:mm:ss');
    });
}

module.exports = {
    getDataListByKeys: getDataListByKeys,
    convertXAxis: convertXAxis
}