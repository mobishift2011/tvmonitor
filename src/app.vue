<style lang="less">
  @import "assets/css/bootstrap.min.css";

  body {
    background-color: #f0f3f5;
    margin-top: 40px;
  }

  h1 {
    border: 0 none;
    font-size: 22px;
    font-weight: 600;
    margin: 0;
    padding: 10px 0 20px;
  }

  .btn, input, .alert, .modal-content, select, .list-group-item, .input-group-addon {
    border-radius: 1px !important;
  }

  .modal-content {
    .modal-header, .modal-body, .modal-footer {
      padding: 10px;
    }

    .btn {
      padding: 5px 10px;
      font-size: 12px;
      line-height: 1.5;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }
  }

  .alert {
    padding: 6px;
  }

  .alert-danger {
    background-color: #f76549;
    border-color: darken(#f76549, 5%);
    color: white;
  }

  .form-error {
    .alert-danger();
    margin-bottom: 10px;
    padding: 5px;
    font-size: 12px;

    .glyphicon {
      margin-right: 5px;
    }
  }

  .content-wrapper {
    background-color: white;
    padding: 10px;
    margin-bottom: 10px;

    .operation-wrapper {
      margin-bottom: 10px;
    }

    table {
      margin-bottom: 0;

      .glyphicon {
        cursor: pointer;
      }

      th, td {
        font-size: 12px;
        vertical-align: middle !important;
      }
    }
  }

  .list-group {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 0;
    font-size: 13px;
    background-color: #f5f5f5;
  }

  .list-group-item {
    padding: 4px;
    cursor: pointer;
    border: none;
    margin-bottom: 1px;
  }

  .breadcrumb {
    background-color: white;
    margin-bottom: 10px;
  }

  .alert {
    .glyphicon {
      top: 2px;
    }
  }
  .padding-top7{padding-top: 7px;}
  .half{width:50%;float: left;}
  .modal-title,.modal-loading{float: left}
  .modal-loading{width: 20px;height: 20px;margin-left: 10px;}
  .modal-loading img{width:100%;height:100%;}
</style>

<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {}
</script>