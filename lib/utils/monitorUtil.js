module.exports = {
    /**
     * 将8位字符串转换为ascii数组
     * @param str
     * @returns {Array}
     */
    str2Ascii: function (str) {
        let strArr = [];
        let length = str.toString().length;
        //
        while (length < 16) {
            str =str+ " " ;
            length++;
        }
        if (str) {
            for (let i = 0; i < 16; i=i+2) {
                strArr.push(str.charCodeAt(i) * 256 + str.charCodeAt(i + 1));
            }
        }
        // let length = str.length
        // while (length < 16) {
        //     str = str+ "0" ;
        //     length++;
        // }
        // var strArr = str.replace(/../g,function(val){
        //     return  val.charCodeAt(0)*256+val.charCodeAt(1)
        // })
        return strArr
    },
    /**
     * 将8位字符串转换为ascii数组
     * @param str
     * @returns {Array}
     */
    str2Ascii2: function (str) {
        let strArr = [];
        let length = str.toString().length;
        //
        while (length < 16) {
            str =str+ " " ;
            length++;
        }
        if (str) {
            for (let i = 0; i < 16; i=i+2) {
                strArr.push(str.charCodeAt(i) * 256 + str.charCodeAt(i + 1));
            }
        }
        // let length = str.length
        // while (length < 16) {
        //     str = str+ "0" ;
        //     length++;
        // }
        // var strArr = str.replace(/../g,function(val){
        //     return  val.charCodeAt(0)*256+val.charCodeAt(1)
        // })
        return strArr
    },
    /**
     * 将ascii数组转换为字符串
     * @param codeArray
     * @returns {string}
     */
    ascii2Str: function (codeArray) {
        let str = '';
        if (codeArray && codeArray.length > 0) {
            for (let i = 0; i < codeArray.length; i++) {
                if(codeArray[i]!=0){
                    if(codeArray[i] % 256==0){
                        str += (String.fromCharCode(codeArray[i] / 256));
                    }else{
                        str += (String.fromCharCode(codeArray[i] / 256) + String.fromCharCode(codeArray[i] % 256));
                    }
                }
            }
        }
        return str
    },
    /**
     * 在原数组上填充0让长度达到30
     * @param arr 数组
     * @param len 满足长度
     */
    zeroFill: function (arr, len) {
        let arrLen = arr.length
        if (arrLen < len) {
            for (let i = 0; i < len - arrLen; i++) {
                arr[arrLen + i] = 0;
            }
        }
        return arr;
    },
    /**
     * 处理从烘箱读取回来的数据
     * @param oriArr
     * @param ip
     * @returns {{hxIp: *, ycOrbd: *, sdOrzd: *, ybwd: number, cs1dwd1: *, cs2dwd1: *, cs3dwd1: *, lhwdjhz: *, cxyxd: *, qtbs: *, ybtxzt: *, hxmzt: *, ssyxsj: *, zsj: *, czzgh: *}}
     */

    handleHxData: function (oriArr) {
        return {
            ycOrbd: oriArr[0],
            sdOrzd: oriArr[1],
            wd1: oriArr[2] / 10,
            wd2: oriArr[3] / 10,
            wd3: oriArr[4] / 10,
            wd4: oriArr[5] / 10,
            cxyxd: oriArr[6],
            qtbs: oriArr[7],
            ybtxzt: oriArr[8],
            hxmzt: oriArr[9],
            ssyxsj: oriArr[10],
            zsj: oriArr[11],
            lhjd: oriArr[12],
            startTime:oriArr[13],
            endTime:oriArr[15],
            wuId:oriArr[oriArr.length-1]
        }
    },
    /**
     * 处理从硫化机读取的数据
     * @param oriArr
     * @returns {{pblhjIp: *, lhyl: number, lhsssj: number, swsssj: *, lhbz: *, bdkz: *, swsjcc: *, ylcc: *, wdcc: *, firstUse: *, secondUse: *, thirdUse: *, fourthUse: *, firstTask: {tId: *, mjh: *, cpth: *, yxmqs: *, lhwd: number, mch: *, mczs: *, zcl: *, hgcl: *, bhgcl: *}, secondTask: {tId: *, mjh: *, cpth: *, yxmqs: *, lhwd: number, mch: *, mczs: *, zcl: *, hgcl: *, bhgcl: *}, thirdTask: {tId: *, mjh: *, cpth: *, yxmqs: *, lhwd: number, mch: *, mczs: *, zcl: *, hgcl: *, bhgcl: *}, fourthTask: {tId: *, mjh: *, cpth: *, yxmqs: *, lhwd: number, mch: *, mczs: *, zcl: *, hgcl: *, bhgcl: *}}}
     */
    handleLhjData1: function (oriArr) {
        let _this = this,
        //任务号
            tId1 = [oriArr[0], oriArr[1], oriArr[2], oriArr[3], oriArr[4], oriArr[5], oriArr[6], oriArr[7]],
            tId2 = [oriArr[8], oriArr[9], oriArr[10], oriArr[11], oriArr[12], oriArr[13], oriArr[14], oriArr[15]],
            tId3 = [oriArr[16], oriArr[17], oriArr[18], oriArr[19], oriArr[20], oriArr[21], oriArr[22], oriArr[23]],
            tId4 = [oriArr[24], oriArr[25], oriArr[26], oriArr[27], oriArr[28], oriArr[29], oriArr[30], oriArr[31]],
        //模具号
            mjh1 = [oriArr[32], oriArr[33], oriArr[34], oriArr[35], oriArr[36], oriArr[37], oriArr[38], oriArr[39]],
            mjh2 = [oriArr[40], oriArr[41], oriArr[42], oriArr[43], oriArr[44], oriArr[45], oriArr[46], oriArr[47]],
            mjh3 = [oriArr[48], oriArr[49], oriArr[50], oriArr[51], oriArr[52], oriArr[53], oriArr[54], oriArr[55]],
            mjh4 = [oriArr[56], oriArr[57], oriArr[58], oriArr[59], oriArr[60], oriArr[61], oriArr[62], oriArr[63]],
        //产品图号
            cpth1 = [oriArr[64], oriArr[65], oriArr[66], oriArr[67], oriArr[68], oriArr[69], oriArr[70], oriArr[71]],
            cpth2 = [oriArr[72], oriArr[73], oriArr[74], oriArr[75], oriArr[76], oriArr[77], oriArr[78], oriArr[79]],
            cpth3 = [oriArr[80], oriArr[81], oriArr[82], oriArr[83], oriArr[84], oriArr[85], oriArr[86], oriArr[87]],
            cpth4 = [oriArr[88], oriArr[89], oriArr[90], oriArr[91], oriArr[92], oriArr[93], oriArr[94], oriArr[95]];
        // console.error('cpth3数据--->>', cpth3);
        // console.error('cpth4数据--->>', cpth4);

        return {
            wd1: oriArr[100] / 10,
            wd2: oriArr[101] / 10,
            wd3: oriArr[102] / 10,
            wd4: oriArr[103] / 10,
            firstTask: {
                tId: String(_this.ascii2Str(tId1)).trim(),
                mjh: String(_this.ascii2Str(mjh1)).trim(),
                cpth: String(_this.ascii2Str(cpth1)).trim(),
                yxmqs: oriArr[96],
                mch: oriArr[104],
                mczs: oriArr[108],
                zcl: oriArr[112],
                hgcl: oriArr[116],
                bhgcl: oriArr[120]
            },
            secondTask: {
                tId: String(_this.ascii2Str(tId2)).trim(),
                mjh: String(_this.ascii2Str(mjh2)).trim(), //模具号
                cpth: String(_this.ascii2Str(cpth2)).trim(), //产品图号
                yxmqs: oriArr[97], //有效模腔数
                mch: oriArr[105],
                mczs: oriArr[109],
                zcl: oriArr[113],
                hgcl: oriArr[117],
                bhgcl: oriArr[121]
            },
            thirdTask: {
                tId: String(_this.ascii2Str(tId3)).trim(),
                mjh: String(_this.ascii2Str(mjh3)).trim(),
                cpth: String(_this.ascii2Str(cpth3)).trim(),
                yxmqs: oriArr[98],
                mch: oriArr[106],
                mczs: oriArr[110],
                zcl: oriArr[114],
                hgcl: oriArr[118],
                bhgcl: oriArr[122]
            },
            fourthTask: {
                tId: String(_this.ascii2Str(tId4)).trim(),
                mjh: String(_this.ascii2Str(mjh4)).trim(),
                cpth: String(_this.ascii2Str(cpth4)).trim(),
                yxmqs: oriArr[99],
                mch: oriArr[107],
                mczs: oriArr[111],
                zcl: oriArr[115],
                hgcl: oriArr[119],
                bhgcl: oriArr[123]
            }
        }
    },
    handleLhjData2: function (oriArr) {

        return {
            lhyl: oriArr[0] / 10,
            lhsssj: oriArr[1],
            swsssj: oriArr[2],
            lhbz: oriArr[3],
            bdkz: oriArr[4],
            swsjcc: oriArr[5],
            ylcc: oriArr[6],
            wdcc: oriArr[7],
            firstUse: oriArr[8],
            secondUse: oriArr[9],
            thirdUse: oriArr[10],
            fourthUse: oriArr[11],
            wuId:oriArr[oriArr.length-1]
        }
    },
    /**
     * 处理从温湿度机读取回来的数据
     * @param oriArr
     * @param ip
     * @returns {{wsdIp: *, tjx: *[], jlk: *[], cxj3: *[], cxj4: *[], cxj5: *[], jxj6: *[], jxj7: *[], tjj8: *[], dwx: number, sbbs: *}}
     */
    handleWsdData: function (oriArr, ip) {
        return {
            wsdIp: ip,
            tjxWd: oriArr[0]/10,  //涂胶箱 【温度 湿度】
            tjxSd: oriArr[1]/10,  //涂胶箱 【温度 湿度】
            jlkWd: oriArr[2]/10,  //胶料库
            jlkSd: oriArr[3]/10,  //胶料库
            cxj3Wd: oriArr[4]/10,  //纯橡胶3号
            cxj3Sd: oriArr[5]/10,  //纯橡胶3号
            cxj4Wd: oriArr[6]/10,  //纯橡胶4号
            cxj4Sd: oriArr[7]/10,  //纯橡胶4号
            cxj5Wd: oriArr[8]/10,  //纯橡胶5号
            cxj5Sd: oriArr[9]/10,  //纯橡胶5号
            jxj6Wd: oriArr[10]/10,  //金橡胶6号
            jxj6Sd: oriArr[11]/10,  //金橡胶6号
            jxj7Wd: oriArr[12]/10,  //金橡胶7号
            jxj7Sd: oriArr[13]/10,  //金橡胶7号
            tjj8Wd: oriArr[14]/10,  //涂胶间8号
            tjj8Sd: oriArr[15] / 10,  //涂胶间8号
            dwxWd: oriArr[16] / 10,  //低温箱【只有温度】
            sbbs: oriArr[17]/10,//上班标识
            tj1Wd: oriArr[18]/10,  //涂胶1【温度 湿度】
            tj1Sd: oriArr[19]/10,  //涂胶1 【温度 湿度】
            tj2Wd: oriArr[20]/10,  //涂胶2 【温度 湿度】
            tj2Sd: oriArr[21]/10  //涂胶2 【温度 湿度】
        }
    },
    handleLhjWriteData: function (oriArr) {
        var firstTaskTId = this.str2Ascii(oriArr.firstTask.tId);
        var secondTaskTId = this.str2Ascii(oriArr.secondTask.tId);
        var thirdTaskTId = this.str2Ascii(oriArr.thirdTask.tId);
        var fourthTaskTId = this.str2Ascii(oriArr.fourthTask.tId);

        var firstTaskMjh = this.str2Ascii(oriArr.firstTask.mjh);
        var secondTaskMjh = this.str2Ascii(oriArr.secondTask.mjh);
        var thirdTaskMjh = this.str2Ascii(oriArr.thirdTask.mjh);
        var fourthTaskMjh = this.str2Ascii(oriArr.fourthTask.mjh);

        var firstTaskCpth = this.str2Ascii(oriArr.firstTask.cpth);
        var secondTaskCpth = this.str2Ascii(oriArr.secondTask.cpth);
        var thirdTaskCpth = this.str2Ascii(oriArr.thirdTask.cpth);
        var fourthTaskCpth = this.str2Ascii(oriArr.fourthTask.cpth);
        var newArr = [];
        newArr[0] = oriArr.firstTask.yxmqs;
        newArr[1] = oriArr.secondTask.yxmqs;
        newArr[2] = oriArr.thirdTask.yxmqs;
        newArr[3] = oriArr.fourthTask.yxmqs;
        return firstTaskTId.concat(secondTaskTId,thirdTaskTId,fourthTaskTId,firstTaskMjh,secondTaskMjh,thirdTaskMjh,fourthTaskMjh,firstTaskCpth,secondTaskCpth,thirdTaskCpth,fourthTaskCpth,newArr)
    },
    handleLhjWriteData2: function (oriArr) {
        // 任务号
        var TId = this.str2Ascii2(oriArr.tId);
        // 模具号
        var Mjh = this.str2Ascii2(oriArr.mould.mId);
        // 产品图号
        var Cpth = this.str2Ascii2(oriArr.cId);
        // 有效模腔数
        var yxmqs = [oriArr.mould.ccNum];   
        return  [TId,Mjh,Cpth,yxmqs];
    },
    //深度比较对象

    deepCompare:function (x, y) {
        var i, l, leftChain, rightChain;

        function compare2Objects(x, y) {
            var p;

            // remember that NaN === NaN returns false
            // and isNaN(undefined) returns true
            if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
                return true;
            }

            // Compare primitives and functions.
            // Check if both arguments link to the same object.
            // Especially useful on the step where we compare prototypes
            if (x === y) {
                return true;
            }

            // Works in case when functions are created in constructor.
            // Comparing dates is a common scenario. Another built-ins?
            // We can even handle functions passed across iframes
            if ((typeof x === 'function' && typeof y === 'function') ||
                (x instanceof Date && y instanceof Date) ||
                (x instanceof RegExp && y instanceof RegExp) ||
                (x instanceof String && y instanceof String) ||
                (x instanceof Number && y instanceof Number)) {
                return x.toString() === y.toString();
            }

            // At last checking prototypes as good as we can
            if (!(x instanceof Object && y instanceof Object)) {
                return false;
            }

            if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
                return false;
            }

            if (x.constructor !== y.constructor) {
                return false;
            }

            if (x.prototype !== y.prototype) {
                return false;
            }

            // Check for infinitive linking loops
            if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
                return false;
            }

            // Quick checking of one object being a subset of another.
            // todo: cache the structure of arguments[0] for performance
            for (p in y) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                } else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }
            }

            for (p in x) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                } else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }

                switch (typeof(x[p])) {
                    case 'object':
                    case 'function':

                        leftChain.push(x);
                        rightChain.push(y);

                        if (!compare2Objects(x[p], y[p])) {
                            return false;
                        }

                        leftChain.pop();
                        rightChain.pop();
                        break;

                    default:
                        if (x[p] !== y[p]) {
                            return false;
                        }
                        break;
                }
            }

            return true;
        }

        if (arguments.length < 1) {
            return true; //Die silently? Don't know how to handle such case, please help...
            // throw "Need two or more arguments to compare";
        }

        for (i = 1, l = arguments.length; i < l; i++) {

            leftChain = []; //Todo: this can be cached
            rightChain = [];

            if (!compare2Objects(arguments[0], arguments[i])) {
                return false;
            }
        }

        return true;
    }

}
