import { observable, computed, action } from 'mobx';

import { notification, message, Modal } from 'antd';

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

                    this.projects = _.uniqBy(this.items, 'projectName');

                }

                setTimeout(() => {
                    this.loading = false;
                }, 300);

            });

        ls.getItem('taskName')
            .then((data) => {
                if (data) {
                    this.name = data;
                }

            });
    }

    @observable items = [];
    @observable name = '-';

    @observable setName() {
        ls.getItem('taskName')
            .then((name) => {
                let result = window.prompt('请输入负责人姓名');
                console.log(result);
                if (!result) {
                    message.error('负责人姓名输入有误');
                    return false;
                }

                ls.setItem('taskName', result.trim())
                    .then(() => {
                        this.name = result.trim();
                        this.items.map((item) => {
                            item.name = this.name;
                        });
                        ls.setItem('taskDB', this.items.$mobx.values)
                            .then((data) => {
                                notification['success']({
                                    message: '设置成功',
                                    description: '负责人设置成功',
                                });

                            }, () => {
                                notification['error']({
                                    message: '设置失败',
                                    description: '负责人设置失败',
                                });
                            });
                    });

            });

    }

    @observable add(task) {
        let id, createTime;

        createTime = new Date().getTime();
        id = createTime.toString(36) + Math.random().toString(36).slice(2);
        task.id = id;
        task.name = this.name;
        task.createTime = task.lastUpdateTime = createTime;

        this.items.unshift(task);

        ls.setItem('taskDB', this.items.$mobx.values)
            .then((data) => {
                this.panel = false;
                notification['success']({
                    message: '成功',
                    description: '任务添加成功',
                });

                this.projects.push(task);
                this.projects = _.uniqBy(this.projects, 'projectName');

                setTimeout(() => {
                    this.resetState();
                }, 1500);

            }, () => {
                notification['error']({
                    message: '添加失败',
                    description: '添加任务失败,请重新尝试添加.',
                });
            });

    }

    @observable update(task) {
        let index = _.findIndex(this.items, { id: task.id });
        task.lastUpdateTime = new Date().getTime();

        this.items.unshift(_.assign(this.items.splice(index, 1)[0], task));

        ls.setItem('taskDB', this.items.$mobx.values)
            .then((data) => {
                this.panel = false;
                notification['success']({
                    message: '成功',
                    description: '任务更新成功',
                });
                setTimeout(() => {
                    this.resetState();
                }, 1500);
            }, () => {
                notification['error']({
                    message: '更新失败',
                    description: '更新任务失败,请重新尝试更新.',
                });
            });

    }

    @observable delete(task) {
        let index = _.findIndex(this.items, { id: task.id });

        this.items.splice(index, 1);

        ls.setItem('taskDB', this.items.$mobx.values)
            .then((data) => {
                this.panel = false;
                notification['success']({
                    message: '成功',
                    description: '任务删除成功',
                });
                setTimeout(() => {
                    this.resetState();
                }, 1500);
            }, () => {
                console.info('删除失败,请重新删除.');
            });

    }

    // 任务状态
    @observable panel = false;

    // 1 新任务, 2 旧任务
    @observable
    continue = false;

    // 0 筛选任务 1 添加已知任务  2 添加新任务 3 修改任务
    @observable steps = 0;

    // 默认任务未开始 0 未开始 1 进行中 2 已完成
    @observable state = 0;

    // 项目名称
    @observable projects = [];

    // 任务类型 1 任务 2 缺陷
    @observable type = 0;

    // 选中某一个任务用于修改或更新
    @observable selected = null;

    @observable projectName = '';

    // loading状态
    @observable loading = true;

    // 恢复默认状态
    @action resetState() {
        this.continue = false;
        this.steps = 0;
        this.findName = '';
        this.projectName = '';
        this.state = 0;
        this.selected = null;
        this.type = 0;
    }

    // 查找任务过滤条件
    @observable findName = '';

    // 返回查找
    @computed get find() {
        return this.items.filter((item, index) => {
            return this.findName && item.title.indexOf(this.findName) != -1;
        });

    }

    // 统计相关
    @observable statistics = false;

    // 本周
    @observable statisticsThisWeek = false;

    @observable filter = false;

    @observable filterParams = {
        start: undefined,
        end: undefined,
        projectName: undefined,
        state: undefined,
        type: undefined
    };

    @computed get list() {
        if (this.statistics === true) {
            return this.items.filter((item, index) => {
                let time = utils.getTimeStamp({ week: true });
                if (this.statisticsThisWeek) {
                    return item.state === 2 && item.lastUpdateTime >= time.thisWeek.start && item.lastUpdateTime <= time.thisWeek.end;
                }
                return item.state === 2 && item.lastUpdateTime >= time.lastWeek.start && item.lastUpdateTime <= time.lastWeek.end;

            });
        } else if (this.filter === true) {
            return this.items.filter((item, index) => {
                let state = (this.filterParams.state === undefined || this.filterParams.state === -1) ? item.state : this.filterParams.state;
                return item.state === state && item.lastUpdateTime >= this.filterParams.start && item.lastUpdateTime <= this.filterParams.end;
            });
        } else {
            return this.items;
        }
    };


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