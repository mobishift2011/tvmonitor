import moment from 'moment';
import {includes} from 'lodash';

export default {
  moment (value, formatString) {
    formatString = formatString || 'YYYY-MM-DD HH:mm';
    if (!value || !Date.parse(value)) {
      return '';
    }
    return moment(value).format(formatString);
  },
  gender (value) {
    return value === 1 ? '男' : '女';
  },
  sort(array){
    return array.sort();
  },
  permission(list,path){
      return list.filter(l => l.permission && includes(l.permission.paths, path));
  }
}