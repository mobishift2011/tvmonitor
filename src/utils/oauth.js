/**
 * 权限控制模块
 */
export default {
  /**
   * 保存jwt到本地
   * @param data
   */
  setLocal(data){
    localStorage.setItem('authorization', data.token);
    localStorage.setItem('profile', JSON.stringify(data.profile));
  },
  /**
   * 获取本地jwt
   * @returns {string}
   */
  getToken(){
    return localStorage.getItem('authorization') || '';
  },
  /**
   * 获取用户信息
   * @returns {string}
   */
  getUserInfo(){
    return JSON.parse(localStorage.getItem('profile') || '""');
  },
  /**
   * 注销
   */
  logout(){
    localStorage.clear();
  }
}