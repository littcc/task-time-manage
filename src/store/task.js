import { observable, computed, action } from 'mobx';

// tools
import ls from "localforage";
import utils from '../tools/utils.js';

class TaskStore {

    constructor() {
        ls.config({
            driver: ls.INDEXEDDB,
            name: 'task-time-manage',
            version: 1.0,
            storeName: 'taskDB', 
            description: '任务时间管理'
        });

        ls.getItem('taskDB')
            .then((data) => {

                if (data) {

                    this.items.push(...data)

                }

                setTimeout(() => {
                    this.loading = false;
                }, 1500);

            });
    }

    @observable items = [];

    @observable add(task) {
        let id, createTime;

        createTime = new Date().getTime();
        id = createTime.toString(36) + Math.random().toString(36).slice(2);
        task.id = id;
        task.createTime = task.lastUpdateTime = createTime;

        this.items.unshift(task);

        ls.setItem('taskDB', this.items.$mobx.values)
            .then((data) => {
                this.panel = false;
                setTimeout(() => {
                    this.resetState();
                }, 1500);

            }, () => {
                console.info('添加任务失败,请重新添加.');
            });

    }

    @observable update(task) {
        let index = _.findIndex(this.items, { id: task.id });
        task.lastUpdateTime = new Date().getTime();

        this.items.unshift(_.assign(this.items.splice(index, 1)[0], task));

        ls.setItem('taskDB', this.items.$mobx.values)
            .then((data) => {
                this.panel = false;
                setTimeout(() => {
                    this.resetState();
                    console.info('任务更新成功');
                }, 1500);
            }, () => {
                console.info('更新失败,请重新更新.');
            });

    }

    @observable delete(task) {
        let index = _.findIndex(this.items, { id: task.id });

        // this.items.unshift(_.assign([0], task));
        this.items.splice(index, 1);

        ls.setItem('taskDB', this.items.$mobx.values)
            .then((data) => {
                this.panel = false;
                setTimeout(() => {
                    this.resetState();
                    console.info('删除成功');
                }, 1500);
            }, () => {
                console.info('删除失败,请重新删除.');
            });

    }

    // 任务状态
    @observable panel = false;

    // 1 新任务, 2 旧任务
    @observable type = 1;

    // 0 筛选任务 1 添加已知任务  2 添加新任务 3 修改任务
    @observable steps = 0;

    // 默认任务未开始 0 未开始 1 进行中 2 已完成
    @observable state = 0;

    // 选中某一个任务用于修改或更新
    @observable selected = null;

    // loading状态
    @observable loading = true;

    // 恢复默认状态
    @action resetState() {
        this.type = 1;
        this.steps = 0;
        this.findName = '';
        this.state = 0;
        this.selected = null;
        // this.panel = false;
    }

    // 查找任务过滤条件
    @observable findName = '';

    // 返回查找
    @computed get find() {
        return this.items.filter((item,index) => {
            return this.findName && item.title.indexOf(this.findName) != -1;
        });

    }

};

export default TaskStore;



// 数据模型
// {
//         id: new Date().getTime().toString(36) + Math.random().toString(36).slice(2),
//         title: 一个任务, //任务名
//         type: 1, //1 为主任务 2为bug任务
//         estimateTime: 7200, //预估用时
//         actualTime: 7500, //实际用时
//         timeout: 300, //超时任务
//         state: 0, // 0 未开始 , 1 进行中 , 2 已完成
//         projectName: '福田整车', //项目名称
//         remarks: '福田整车', //项目名称
//         lastUpdateTime: new Date().getTime()
//         createTme: new Date().getTime()
//     }