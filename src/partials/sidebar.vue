<style lang="less">
  .sidebar {
    position: fixed;
    width: 200px;
    height: 100%;
    background-color: #2f4050;
    top: 0;
    overflow-y: auto;

    header {
      height: 40px;
      line-height: 40px;
      text-align: center;
      color: white;
      font-size: 18px;
      background-color: #1cc09f;
    }

    .route-list {
      list-style: none;
      padding: 0;
      margin: 0;

      > li {
        min-height: 40px;
        line-height: 40px;

        &:hover {
          background-color: #293846;
        }

        > a {
          border-bottom: 1px solid darken(#2f4050, 2%);
        }

        a {
          padding-left: 15px;
          position: relative;
          display: block;
          color: #a7b1c2;
          font-size: 14px;
          text-decoration: none;

          .arrow-icon {
            position: absolute;
            top: 13px;
            right: 20px;
          }
        }

        .route-sublist {
          list-style: none;
          padding: 0;

          li a {
            padding-left: 40px;
            display: block;
            height: 36px;
            line-height: 36px;

            &:hover, &.v-link-active {
              background-color: #293846;
              color: white;
              border-left: 4px solid #19aa8d;
              padding-left: 36px;
            }
          }
        }
      }
    }
  }
</style>

<template>
  <div class="sidebar">
    <header>橡胶生产监控</header>
    <ul class="route-list">
      <li v-for="r in routes" :key="r" v-if="r.show">
        <a href="" @click.prevent="toggle(r)">
          <span class="glyphicon" :class="r.icon"></span>
          <span>{{r.title}}</span>
          <span class="glyphicon arrow-icon" :class="{'glyphicon-menu-right': r.collapsed, 'glyphicon-menu-down': !r.collapsed}"></span>
        </a>
        <ul class="route-sublist" v-show="!r.collapsed">
          <li v-for="cr in r.children" v-if="cr.show"><a v-link="{path: cr.path}">{{cr.title}}</a></li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
  import { find, includes } from 'lodash';

  import routes from './menus.json';
  var admin = require('../../global.json').admin;
  export default{
    props: ['userInfo'],
    watch: {
      userInfo(){
        this.render();
      }
    },
    methods: {
      toggle(route){
        route.collapsed = !route.collapsed;
      },
      render(){
        var permission = this.userInfo.permission || {};

        this.routes.forEach(function (r) {
          if (find(r.children, {path: this.$route.path})) {
            r.collapsed = false;
          }

          r.children.forEach(function (c) {
            c.show = this.userInfo.wuId === admin.wuId || includes(permission.paths, c.path);
          }.bind(this));

          r.show = r.children.some(function (c) {
            return c.show;
          }.bind(this));

        }.bind(this));
      }
    },
    data(){
      return {
        routes: routes
      }
    }
  }
</script>