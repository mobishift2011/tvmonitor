## 2017-6-20
1. 温湿度
    两点 1曲线应该自动刷新 2每张图显示上下班曲线，除了最后一个低温箱不显示

# TV MONITOR

tire vulcanization monitoring system

## Dependencies

```bash
npm install
```

## Development

``` bash

npm start

npm run dev

localhost:8080
```

## Production

``` bash
npm start

npm run build

localhost:3300
```
## 问题
### 0724
1. 退库，试模列表内容是啥？
2. 只看到胶料库有弹出窗。1.1是修改哪一个页面？
### 0726
任务号写地址
1. 最大50个任务号 每个任务号分配八个寄存器，分配4百个寄存器网络地址
2. 仪表1号任务号地址1000-1499
仪表2号任务号地址1500-1999
仪表3号任务号地址2000-2499
### 0802
报废是就不能申请所有状态
退库的胶料数量自动添加到库存量中
试片是库存量减去试片数量
试模是库存量减去试片数量
菜单权限可以自己定义，把新增改为入库，胶料库管理员（入库  试片和报废）
无效批次号：1 制造日期+最长贮存期=使用截止日期，超过使用截止日期；2胶料库没有库存
模具库里模具号是唯一不重复
新增模具，去除产品图号不允许重复的限制
### 0810
只有当模具库当前状态为入库时，同一个模具编号单号可以被申请多次
硫化完成后需要自检和互检
申请模具添加模具库官员
### 0811
模具校对改为新增模具校对，模具状态改为模具状态校对 模具申请改为模具入库申请
### 0812
无法区分旧任务号和新任务号
### 0816
绑定任务号，删除已硫化完成的任务号
后续：未完成的任务号不允许删除