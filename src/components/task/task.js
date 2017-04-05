import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classNames';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as Tooltips, Legend, ReferenceLine } from 'Recharts';
import { Switch, Icon, Steps, Select, Input, Button, message, Modal, Spin, Tooltip, Table, DatePicker, Tag } from 'antd';

const { MonthPicker, RangePicker } = DatePicker;
// import { Steps } from 'antd';
const Step = Steps.Step;
const Option = Select.Option;

// animate
// import { TweenOneGroup } from 'rc-tween-one';
import QueueAnim from 'rc-queue-anim';


// style
import './task.scss';

// Store
import TaskStore from '../../store/task';
import TaskConst from '../../store/const';

// tools
import utils from '../../tools/utils.js';

// 初始化数据
let task = new TaskStore();

@observer class Header extends Component {

    render() {
        return (
            <header className="task-header">
                <hgroup className="task-header-wrap">
                    <span className="title">任务时间管理</span>
                    <span className="ver">alpha</span>
                </hgroup>
            </header>
        )
    }

}

@observer class Footer extends Component {

    render() {
        return (
            <footer className="task-footer">
                <hgroup className="task-footer-wrap">
                    <a href="http://www.littcc.com" title="by littcc">
                        <span>BY.</span>
                        <span>LITTCC</span>
                    </a>
                </hgroup>
            </footer>
        )
    }

}

@observer class Loading extends Component {

    render() {

        let loadingClass = classNames({
            'task-loading': true,
            'active': task.loading
        });

        // <div className="ball-beat">
        //     <div></div>
        //     <div></div>
        //     <div></div>
        // </div>
        return (
            <div className={loadingClass}>
                <Spin size="large" />
            </div>
        );
    }

}

@observer class TaskTableRibbon extends Component {

    constructor(arg) {
        super(...arg);
        this.addTaskHandle = this.addTaskHandle.bind(this);
        this.filterPanel = this.filterPanel.bind(this);
        this.selectDate = this.selectDate.bind(this);
        this.filterState = this.filterState.bind(this);
        // this.statistics = this.statistics.bind(this);
        this.state = {
            filter: false,
            statistics: false,
            statisticsThisWeek: false
        };
    }

    render() {
        let filterPanelClass = classNames({
                'task-table-filter-panel': true,
                'active': this.state.filter
            }),
            thisWeekClass = classNames({
                'task-table-filter-button': true,
                'this-week-hide': this.state.statistics && !this.state.statisticsThisWeek
            }),
            lastWeekClass = classNames({
                'task-table-filter-button': true,
                'last-week-hide': this.state.statistics && this.state.statisticsThisWeek
            });

        const options = task.projects.map(item => <Option key={item.id} value={item.projectName}>{item.projectName}</Option>);

        return (
            <section className="task-table-ribbon">
                <div className="task-table-filter">
                    <div className={filterPanelClass}>
                        <RangePicker size="large" onOk={this.selectDate} onChange={this.selectDate}/>
                        <Select defaultValue="-1" placeholder="任务状态" style={{ width: 100 }} size="large" onChange={this.filterState} allowClear={true}>
                            <Option value="-1">全部状态</Option>
                            <Option value="0">未开始</Option>
                            <Option value="1">进行中</Option>
                            <Option value="2">已完成</Option>
                        </Select>
                        <Select defaultValue="-1" placeholder="任务类型" style={{ width: 100 }} size="large" allowClear={true}>
                            <Option value="-1">全部类型</Option>
                            <Option value="1">开发任务</Option>
                            <Option value="2">修复缺陷</Option>
                        </Select>  
                        <Select defaultValue="-1" placeholder="项目" style={{ width: 100 }} size="large" allowClear={true}>
                            <Option value="-1">全部项目</Option>
                            {options}
                        </Select>
                    </div>
                    <Tooltip placement="top" title="统计上周已完成的任务">
                        <Button type="dashed" icon="bar-chart" className={lastWeekClass} onClick={this.statistics.bind(this,false)}>{this.state.statistics ? '恢复' : '上周'}</Button>
                    </Tooltip>
                    <Tooltip placement="top" title="统计本周已完成的任务">
                        <Button type="dashed" icon="bar-chart" className={thisWeekClass} onClick={this.statistics.bind(this,true)}>{this.state.statistics ? '恢复' : '本周'}</Button>
                    </Tooltip>
                    <Tooltip placement="top" title="自定义过滤条件">                    
                    <Button type="dashed" icon="filter" className="task-table-filter-button" onClick={this.filterPanel}>{this.state.filter ? '收起' : '过滤'}</Button>
                    </Tooltip>                    
                </div>
                <Tooltip placement="top" title="开始一个新的任务吧">                                    
                <Button type="primary" className="task-add-task" icon="plus-circle-o" onClick={this.addTaskHandle}>开始任务</Button>
                </Tooltip>                    
            </section>
        );
    }

    filterState(value) {
        task.filterParams.state = parseInt(value);
    }

    selectDate(dates, dateStrings) {
        task.filterParams.start = new Date(dateStrings[0] + ' 00:00:00');
        task.filterParams.end = new Date(dateStrings[1] + ' 00:00:00');
    }

    addTaskHandle() {
        task.panel = true;

    }

    filterPanel() {
        task.statistics = false;
        task.statisticsThisWeek = false;
        task.filter = !task.filter;
        this.setState({
            filter: task.filter,
            statistics: false,
            statisticsThisWeek: false
        });

    }

    statistics(thisWeek) {
        task.statistics = !task.statistics;
        task.statisticsThisWeek = thisWeek;
        task.filter = false;
        this.setState({
            filter: task.filter,
            statistics: task.statistics,
            statisticsThisWeek: thisWeek
        });
    }

}

@observer class TaskPanel extends Component {

    constructor(arg) {
        super(...arg);
        this.findTask = this.findTask.bind(this);
        this.selectTaskItem = this.selectTaskItem.bind(this);
        this.startTaskItem = this.startTaskItem.bind(this);
        this.closeTaskPanel = this.closeTaskPanel.bind(this);
        this.addTask = this.addTask.bind(this);
        this.updateTask = this.updateTask.bind(this);
        this.timeChange = this.timeChange.bind(this);
        this.changeProjectName = this.changeProjectName.bind(this);
        this.changeTaskType = this.changeTaskType.bind(this);
        // this.state = {
        //     state: 0,
        // }

    }

    render() {
        let filterList = task.find,
            list, className, panel, state,
            btnClassName = classNames({
                'task-next': true,
                'task-continue': task.continue
            }),
            randerStateClassName = classNames({
                'task-panel-mask': true,
                'active': task.panel
            });

        if (filterList.length) {
            list = task.find.map((item) => {
                let itemClass = classNames({
                    'task-fliter-item': true,
                    'type-bug': item.type === 2
                });
                return <li className={itemClass} key={item.id} onClick={this.selectTaskItem.bind(this,item)}>
                            <span>{item.title}</span>
                       </li>

            });
        }

        if (task.steps === 0) {
            panel = <section className="task-panel" onClick={this.preventDefault}>
                    <label>
                    <input type="text" placeholder="请输入任务名称" onChange={this.findTask} ref="taskName" onKeyUp={this.startTaskItem}/>
                        <button type="button" className={btnClassName} onClick={this.startTaskItem}></button>
                        <ul className="task-fliter-items">
                            <QueueAnim delay={300}>
                            {list}
                            </QueueAnim>                            
                        </ul>
                    </label>
                </section>
        } else if (task.steps === 1) {
            let selected = task.selected;

            panel = <section className="task-panel-continue" onClick={this.preventDefault}>
                <div className="task-panel-continue-info">
                    <Input type="text" placeholder={"预计用时" + utils.timeFormatTranslate.sToh(selected.estimateTime)} size="large" disabled/>
                    <Input type="text" placeholder={"实际用时" + utils.timeFormatTranslate.sToh(selected.actualTime)} size="large" disabled/>
                </div>
                <div className="task-panel-continue-info">
                    <Input type="text" placeholder="本次用时 ( 输入的时间会累加到实际用时 )" ref="taskThisTime" size="large"/>
                </div>
                <div className="task-panel-continue-title">
                    <span>请选择任务状态</span>
                    <Steps size="small" current={selected.state} direction="horizontal">
                        <Step title="未开始" onClick={this.changeTaskState.bind(this, 0, selected)} />
                        <Step title="进行中" onClick={this.changeTaskState.bind(this, 1, selected)} />
                        <Step title="已完成" onClick={this.changeTaskState.bind(this, 2, selected)} />
                    </Steps>
                </div>
                <div className="task-panel-continue-submit">
                    <Button onClick={this.cancelAddTask.bind(this)} size="small">取消</Button>
                    <Button type="primary" onClick={this.updateTask} size="small">确认</Button>
                </div>
            </section>
        } else if (task.steps === 2) {
            const options = task.projects.map(item => <Option key={item.id} value={item.projectName}>{item.projectName}</Option>);

            panel = <section className="task-panel-continue" onClick={this.preventDefault}>
                        <div className="task-panel-continue-info">
                            <Input type="text" placeholder="预估用时" ref="taskEstimateTime" size="large" onChange={this.timeChange} />
                            <Switch checkedChildren={'修复缺陷'} unCheckedChildren={'开发任务'} onChange={this.changeTaskType}/>
                        </div>
                        <div className="task-panel-continue-info">
                            <Input type="text" placeholder="本次用时" ref="taskThisTime" size="large" onChange={this.timeChange} />
                            <Select
                                combobox
                                placeholder="所属项目名称"
                                size="large"
                                style={{ width: '50%' }}
                                allowClear
                                notFoundContent=""
                                defaultActiveFirstOption={false}
                                onChange={this.changeProjectName}
                            >
                                {options}
                            </Select>
                        </div>
                        <div className="task-panel-continue-title">
                            <span>请选择任务状态</span>
                            <Steps size="small" current={task.state} direction="horizontal">
                                <Step title="未开始" key="0" onClick={this.changeTaskState.bind(this, 0, undefined)} />
                                <Step title="进行中" key="1" onClick={this.changeTaskState.bind(this, 1, undefined)} />
                                <Step title="已完成" key="2" onClick={this.changeTaskState.bind(this, 2, undefined)} />
                            </Steps>
                        </div>
                        <div className="task-panel-continue-info">
                            <Input type="text" placeholder="备注" ref="taskThisTime" size="large" ref="taskRemarks"/>
                        </div>
                        <div className="task-panel-continue-submit">
                            <Button onClick={this.cancelAddTask.bind(this)} size="small">取消</Button>
                            <Button type="primary" onClick={this.addTask.bind(this)} size="small">确认</Button>
                        </div>
                    </section>
        } else if (task.steps === 3) {
            let selected = task.selected;

            const options = task.projects.map(item => <Option key={item.id} value={item.projectName}>{item.projectName}</Option>);

            panel = <section className="task-panel-continue" onClick={this.preventDefault}>
                <div className="task-panel-continue-info">
                    <Input type="text" placeholder="预估用时" ref="taskEstimateTime" size="large" onChange={this.timeChange} defaultValue={utils.timeFormatTranslate.sToh(selected.estimateTime)}/>
                    <Switch checkedChildren={'修复缺陷'} unCheckedChildren={'开发任务'} ref="taskType" defaultChecked={selected.type === 2} onChange={this.changeTaskType} />
                </div>
                <div className="task-panel-continue-info">
                    <Input type="text" placeholder="实际用时" ref="taskThisTime" size="large" onChange={this.timeChange} defaultValue={utils.timeFormatTranslate.sToh(selected.actualTime)}/>
                    <Select
                        combobox
                        placeholder="所属项目名称"
                        size="large"
                        style={{ width: '50%' }}
                        allowClear
                        notFoundContent=""
                        defaultValue={selected.projectName}
                        defaultActiveFirstOption={false}
                        onChange={this.changeProjectName}
                    >
                        {options}
                    </Select>
                </div>
                <div className="task-panel-continue-title">
                    <span>请选择任务状态</span>
                    <Steps size="small" current={selected.state} direction="horizontal">
                        <Step title="未开始" onClick={this.changeTaskState.bind(this, 0, selected)} />
                        <Step title="进行中" onClick={this.changeTaskState.bind(this, 1, selected)} />
                        <Step title="已完成" onClick={this.changeTaskState.bind(this, 2, selected)} />
                    </Steps>
                </div>
                <div className="task-panel-continue-info">
                    <Input type="text" placeholder="备注" size="large" ref="taskRemarks" defaultValue={selected.remarks}/>
                </div>
                <div className="task-panel-continue-submit">
                    <Button onClick={this.cancelChangeTask.bind(this)} size="small">取消</Button>
                    <Button type="primary" onClick={this.changeTask.bind(this)} size="small">确认</Button>
                </div>
            </section>
        }

        return (
            <div className={randerStateClassName} onClick={this.closeTaskPanel}>
                {panel}
            </div>
        )

    }

    preventDefault(e) {
        utils.preventDefault(e);

    }

    closeTaskPanel(event) {
        this.preventDefault(event);

        if (task.steps === 3) {
            this.cancelChangeTask();
            return false;
        }

        if (task.steps !== 0) {
            task.selected = null;
            task.resetState();
            return false;
        }

        task.panel = false;

    }

    selectTaskItem(item) {
        this.refs.taskName.value = task.findName = item.title;
        task.selected = item;
        task.continue = true;

    }

    startTaskItem(e) {
        if (e.keyCode !== undefined && e.keyCode !== 13) {
            return false;
        }

        if (task.findName === '') {
            message.error('请输入正确的任务名称')
            return false;
        }

        if (!task.selected) {

            Modal.confirm({
                title: '警告',
                content: '确认添加一条新任务? 否则请选择一项已存在的任务',
                okText: '确认',
                cancelText: '取消',
                onOk: function() {
                    task.steps = 2;
                },
                onCancel: function() {

                }
            });
        } else {
            task.steps = 1;
        }

    }

    updateTask() {

        if (!utils.isTime(this.refs.taskThisTime.refs.input.value)) {
            message.error('请输入正确的本次任务使用时间');
            return false;
        }

        let params = {};
        params.id = task.selected.id;
        params.actualTime = utils.timeFormatTranslate.hTos(this.refs.taskThisTime.refs.input.value.trim()) + task.selected.actualTime;
        params.state = task.selected.state;
        params.timeout = params.actualTime - task.selected.estimateTime;

        task.update(params);

    }

    timeChange(e) {
        if (utils.timeFormatTranslate.hTos(this.refs.taskThisTime.refs.input.value.trim()) === 0 || utils.timeFormatTranslate.hTos(this.refs.taskEstimateTime.refs.input.value.trim()) === 0) {
            task.state = 0;
            return false;

        }

        if (utils.timeFormatTranslate.hTos(this.refs.taskThisTime.refs.input.value.trim()) >= utils.timeFormatTranslate.hTos(this.refs.taskEstimateTime.refs.input.value.trim())) {
            task.state = 2;

        } else {
            task.state = 1;

        }

    }

    cancelChangeTask() {
        task.panel = false;
        setTimeout(function() {
            task.resetState();
        }, 500);
    }

    changeTask() {
        if (!this.refs.taskEstimateTime.refs.input.value || !utils.isTime(this.refs.taskEstimateTime.refs.input.value)) {
            message.error('请输入正确的任务预估时间');
            return false;
        }
        if (!task.selected.projectName) {
            message.error('请输入或选择正确的项目名称');
            return false;
        }

        let params = _.assign({}, task.selected);

        params.estimateTime = utils.timeFormatTranslate.hTos(this.refs.taskEstimateTime.refs.input.value.trim());
        params.actualTime = utils.timeFormatTranslate.hTos(this.refs.taskThisTime.refs.input.value.trim());
        params.type = task.type || task.selected.type;
        params.state = task.selected.state;
        params.projectName = task.projectName.trim() || task.selected.projectName;
        params.remarks = this.refs.taskRemarks.refs.input.value.trim();
        params.timeout = params.actualTime - params.estimateTime;

        task.update(params);

    }

    changeProjectName(value) {
        task.projectName = value;

    }

    changeTaskType(value) {
        task.type = !value ? 1 : 2;

    }

    changeTaskState(value, selected) {
        if (selected) {
            if (selected.actualTime > 0 && value === 0) return false;
            selected.state = value;
        } else {
            task.state = value;
        }

    }

    addTask() {

        if (!this.refs.taskEstimateTime.refs.input.value || !utils.isTime(this.refs.taskEstimateTime.refs.input.value)) {
            message.error('请输入正确的任务预估时间');
            return false;
        }
        if (!task.projectName || task.projectName.trim() === "") {
            message.error('请输入或选择正确的项目名称');
            return false;
        }


        let params = {};

        params.title = task.findName;
        params.estimateTime = utils.timeFormatTranslate.hTos(this.refs.taskEstimateTime.refs.input.value.trim());
        params.actualTime = utils.timeFormatTranslate.hTos(this.refs.taskThisTime.refs.input.value.trim());
        params.type = task.type === 0 ? 1 : task.type;
        params.state = task.state;
        params.projectName = task.projectName.trim();
        params.remarks = this.refs.taskRemarks.refs.input.value.trim();
        params.timeout = params.actualTime - params.estimateTime;

        task.add(params);

    }

    cancelAddTask() {
        task.selected = null;
        task.resetState();

    }

    findTask(event) {
        task.selected = null;
        task.continue = false;
        task.findName = event.target.value.trim();

    }

}

@observer class TaskStatistics extends Component {

    constructor(arg) {
        super(...arg);
        this.state = {
            title: () => '完成任务',
            pagination: false,
            size: 'middle'
        }
    }

    render() {
        const result = {
            projects: [],
            defectTask: {},
            developmentTask: {},
            unfinishedDevelopmentTask: {},
            unfinishedDefectTask: {},
            unfinished: [],
            time: {
                name: task.name,
                developmentTime: 0,
                defectTime: 0,
                totalTime: 0,
            }
        };
        let unfinishedProject = {};

        if (task.list.length === 0 || (!task.filter && !task.statistics) || (task.filterParams.state === 0 || task.filterParams.state === 1 ? true : false)) {
            return (<span></span>);
        }

        // 已完成的任务
        _.map(task.projects, (item, index) => {

            let name = item.projectName;

            let project = {
                key: index,
                projectName: name,
                estimatedDevelopmentTime: 0,
                actualDevelopmentTime: 0,
                estimatedDefectTime: 0,
                actualDefectTime: 0
            };

            // 默认数据定义
            unfinishedProject[name] = {};
            unfinishedProject[name].projectName = name;
            unfinishedProject[name].estimatedDevelopmentTime = 0;
            unfinishedProject[name].estimatedDefectTime = 0;

            result.developmentTask[name] = [];
            result.unfinishedDevelopmentTask[name] = [];
            result.defectTask[name] = [];
            result.unfinishedDefectTask[name] = [];

            // 任务&修复缺陷时间统计
            _.map(task.list, (item) => {
                if (item.projectName === name && item.state === 2) {
                    if (item.type === 1) {
                        project.estimatedDevelopmentTime += item.estimateTime;
                        project.actualDevelopmentTime += item.actualTime;
                        result.developmentTask[name].push(item);
                    } else if (item.type === 2) {
                        project.estimatedDefectTime += item.estimateTime;
                        project.actualDefectTime += item.actualTime;
                        result.defectTask[name].push(item);
                    }
                }
            });

            // 总时长
            project.estimatedTime = project.estimatedDevelopmentTime + project.estimatedDefectTime;
            project.actualTime = project.actualDevelopmentTime + project.actualDefectTime;

            // 组员本周开发时长
            result.time.developmentTime += project.actualDevelopmentTime;
            result.time.defectTime += project.actualDefectTime;
            result.time.totalTime += project.actualTime;

            // 计算比例
            project.developmentTimeDeviation = utils.proportion((project.actualDevelopmentTime - project.estimatedDevelopmentTime) / project.estimatedDevelopmentTime * 100);
            project.defectTimeDeviation = utils.proportion((project.actualDefectTime - project.estimatedDefectTime) / project.estimatedDefectTime * 100);
            project.timeDeviation = utils.proportion((project.actualTime - project.estimatedTime) / project.estimatedTime * 100);
            project.quality = utils.proportion(project.actualDevelopmentTime / project.actualTime * 100);
            project.effectiveness = utils.proportion(100 - [(project.actualTime - project.estimatedDevelopmentTime) / project.estimatedDevelopmentTime * 100]);

            //字符转数字供统计图表使用
            project.developmentTimeDeviationNumber = parseInt(project.developmentTimeDeviation);
            project.defectTimeDeviationNumber = parseInt(project.defectTimeDeviation);
            project.timeDeviationNumber = parseInt(project.timeDeviation);
            project.qualityNumber = parseInt(project.quality);
            project.effectivenessNumber = parseInt(project.effectiveness);

            // 格式化时间
            project.estimatedTime = utils.timeFormatTranslate.sTohToNumber(project.estimatedDevelopmentTime + project.estimatedDefectTime);
            project.actualTime = utils.timeFormatTranslate.sTohToNumber(project.actualDevelopmentTime + project.actualDefectTime);
            project.estimatedDevelopmentTime = utils.timeFormatTranslate.sTohToNumber(project.estimatedDevelopmentTime);
            project.actualDevelopmentTime = utils.timeFormatTranslate.sTohToNumber(project.actualDevelopmentTime);
            project.estimatedDefectTime = utils.timeFormatTranslate.sTohToNumber(project.estimatedDefectTime);
            project.actualDefectTime = utils.timeFormatTranslate.sTohToNumber(project.actualDefectTime);

            // push
            result.projects.push(project);

        });

        // 未完成的任务时长
        _.map(task.items, (item) => {
            if (item.state !== 2) {
                if (item.type === 1) {
                    unfinishedProject[item.projectName].estimatedDevelopmentTime += item.estimateTime;
                    result.unfinishedDevelopmentTask[item.projectName].push(item);
                } else if (item.type === 2) {
                    unfinishedProject[item.projectName].estimatedDefectTime += item.estimateTime;
                    result.unfinishedDefectTask[item.projectName].push(item);
                }
            }
        });

        for (var i in unfinishedProject) {
            if (unfinishedProject[i].estimatedDevelopmentTime || unfinishedProject[i].estimatedDefectTime) {
                result.unfinished.push(unfinishedProject[i]);
            }
        }

        console.log(result);

        const columns = [{
            title: '项目',
            dataIndex: 'projectName',
            key: 'projectName',
        }, {
            title: '预估开发时间',
            dataIndex: 'estimatedDevelopmentTime',
            key: 'estimatedDevelopmentTime',
        }, {
            title: '实际开发时间',
            dataIndex: 'actualDevelopmentTime',
            key: 'actualDevelopmentTime',
        }, {
            title: '预估缺陷时间',
            dataIndex: 'estimatedDefectTime',
            key: 'estimatedDefectTime',
        }, {
            title: '实际缺陷时间',
            dataIndex: 'actualDefectTime',
            key: 'actualDefectTime',
        }, {
            title: '预估总时间',
            dataIndex: 'estimatedTime',
            key: 'estimatedTime',
        }, {
            title: '实际总时间',
            dataIndex: 'actualTime',
            key: 'actualTime',
        }, {
            title: '开发时间偏差',
            dataIndex: 'developmentTimeDeviation',
            key: 'developmentTimeDeviation',
        }, {
            title: '缺陷时间偏差',
            dataIndex: 'defectTimeDeviation',
            key: 'defectTimeDeviation',
        }, {
            title: '总时间偏差',
            dataIndex: 'timeDeviation',
            key: 'timeDeviation',
        }, {
            title: '开发质量',
            dataIndex: 'quality',
            key: 'quality',
        }, {
            title: '开发效率',
            dataIndex: 'effectiveness',
            key: 'effectiveness',
        }];

        const unfinishedColumns = [{
            title: '项目名称',
            dataIndex: 'projectName',
            key: 'projectName',
            width: '334px',
        }, {
            title: '预估开发总时间(h)',
            dataIndex: 'estimatedDevelopmentTime',
            key: 'estimatedDevelopmentTime',
            width: '333px',
            render: (text) => {
                return utils.timeFormatTranslate.sTohToNumber(text);
            },
        }, {
            title: '预估修复缺陷总时间(h)',
            dataIndex: 'estimatedDefectTime',
            key: 'estimatedDefectTime',
            width: '333px',
            render: (text) => {
                return utils.timeFormatTranslate.sTohToNumber(text);
            },
        }];

        const timeColumns = [{
            title: '组员',
            dataIndex: 'name',
            key: 'name',
            width: '250px'
        }, {
            title: '开发时间(h)',
            dataIndex: 'developmentTime',
            key: 'developmentTime',
            width: '250px',
            render: (text) => {
                return utils.timeFormatTranslate.sTohToNumber(text);
            },
        }, {
            title: '修复缺陷时间(h)',
            dataIndex: 'defectTime',
            key: 'defectTime',
            width: '250px',
            render: (text) => {
                return utils.timeFormatTranslate.sTohToNumber(text);
            },
        }, {
            title: '花费总时间(h)',
            dataIndex: 'totalTime',
            key: 'totalTime',
            width: '250px',
            render: (text) => {
                return utils.timeFormatTranslate.sTohToNumber(text);
            },
        }];

        return (
            <div className="task-statistics">
                <TaskTableStatisticsDetails title="已完成的开发任务" data={result.developmentTask}></TaskTableStatisticsDetails>
                <TaskTableStatisticsDetails title="已完成的缺陷任务" data={result.defectTask}></TaskTableStatisticsDetails>
                <TaskTableUnfinishedStatisticsDetails title="未完成的开发任务" data={result.unfinishedDevelopmentTask}></TaskTableUnfinishedStatisticsDetails>
                <TaskTableUnfinishedStatisticsDetails title="未完成的缺陷任务" data={result.unfinishedDefectTask}></TaskTableUnfinishedStatisticsDetails>
                <div className="task-statistice-details">
                    <Tag color="purple">数据统计分析</Tag>
                    <Table title={() => '开发时长'} pagination={false} size='middle' columns={timeColumns} dataSource={[result.time]}></Table>
                    <Table title={() => '未完成任务'} pagination={false} size='middle' columns={unfinishedColumns} dataSource={result.unfinished}></Table>
                    <Table title={() => '完成任务'} pagination={false} size='middle' columns={columns} dataSource={result.projects}></Table>
                    <div className="task-statistics-chart">
                        <BarChart width={500} height={300} data={result.projects}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="projectName" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltips />
                            <Legend />
                            <Bar dataKey="estimatedDevelopmentTime" name="预估开发时间" stackId="a" fill="#1fc759" />
                            <Bar dataKey="actualDevelopmentTime" name="实际开发时间" stackId="b" fill="#1ba94c" />
                            <Bar dataKey="estimatedDefectTime" name="预估缺陷时间" stackId="c" fill="#FF4351" />
                            <Bar dataKey="actualDefectTime" name="实际缺陷时间" stackId="d" fill="#da3a46" />
                            <Bar dataKey="estimatedTime" name="预估总时间" stackId="e" fill="#8884d8" />
                            <Bar dataKey="actualTime" name="实际总时间" stackId="f" fill="#625f9a" />
                        </BarChart>
                        <BarChart width={500} height={300} data={result.projects}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="projectName" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltips />
                            <Legend />
                            <ReferenceLine y={0} stroke='#000' />
                            <Bar dataKey="developmentTimeDeviationNumber" name="开发时间偏差" stackId="a" fill="#1fc759" />
                            <Bar dataKey="defectTimeDeviationNumber" name="缺陷时间偏差" stackId="b" fill="#FF4351" />
                            <Bar dataKey="timeDeviationNumber" name="总时间偏差" stackId="c" fill="#8884d8" />
                            <Bar dataKey="qualityNumber" name="开发质量" stackId="d" fill="#02a6f2" />
                            <Bar dataKey="effectivenessNumber" name="开发效率" stackId="e" fill="#ff9800" />
                        </BarChart>
                    </div>
                </div>
            </div>
        )

    }

}

@observer class TaskTableSettingName extends Component {
    constructor(arg) {
        super(...arg);
    }

    render() {
        return (
            <div onClick={this.setName} className="task-setting-name">
                <Button icon="setting">设置负责人</Button>
            </div>
        )
    }

    setName() {
        task.setName();
    }

}

@observer class TaskTableStatisticsDetails extends Component {

    constructor(arg) {
        super(...arg);
    }

    render() {
        let { title, data } = this.props;

        const columns = [{
            title: '任务名称',
            dataIndex: 'title',
            key: 'title',
            width: '700px'
        }, {
            title: '预估时间(h)',
            dataIndex: 'estimateTime',
            key: 'estimateTime',
            width: '100px',
            render: (text) => {
                return utils.timeFormatTranslate.sTohToNumber(text);
            },
        }, {
            title: '负责人',
            dataIndex: 'name',
            key: 'name',
            width: '100px'
        }, {
            title: '花费时间(h)',
            dataIndex: 'actualTime',
            key: 'actualTime',
            width: '100px',
            render: (text) => {
                return utils.timeFormatTranslate.sTohToNumber(text);
            }
        }];

        let table = _.map(task.projects, (item, index) => {
            var key = new Date().getTime().toString(36) + Math.random().toString(36);
            if (data[item.projectName].length > 0) {
                return <Table rowKey={item.projectName + key} key={key} title={() => item.projectName} pagination={false} size='middle' columns={columns} dataSource={data[item.projectName]}></Table>
            }
        })

        return (
            <div className="task-statistice-details">
                <Tag color="green">{title}</Tag>
                {table}
            </div>
        );
    }

}

@observer class TaskTableUnfinishedStatisticsDetails extends Component {

    constructor(arg) {
        super(...arg);
    }

    render() {
        let { title, data } = this.props;

        const columns = [{
            title: '任务名称',
            dataIndex: 'title',
            key: 'title',
            width: '700px'
        }, {
            title: '预估时间(h)',
            dataIndex: 'estimateTime',
            key: 'estimateTime',
            width: '300px',
            render: (text) => {
                return utils.timeFormatTranslate.sTohToNumber(text);
            },
        }];

        let table = _.map(task.projects, (item) => {
            var key = new Date().getTime().toString(36) + Math.random().toString(36);
            if (data[item.projectName].length > 0) {
                return <Table rowKey={item.projectName + key} key={key} title={() => item.projectName} pagination={false} size='middle' columns={columns} dataSource={data[item.projectName]}></Table>
            }
        })

        return (
            <div className="task-statistice-details">
                <Tag color="red">{title}</Tag>
                {table}
            </div>
        );
    }

}

@observer class TaskTableHeader extends Component {

    render() {

        return (
            <ul className="task-main-table-head">
                <li>任务名</li>
                <li>预估时长</li>
                <li>实际时长</li>
                <li>超时</li>
                <li>状态</li>
                <li>项目</li>
            </ul>
        );

    }

}

@observer class TaskTableContent extends Component {

    // constructor(arg) {
    //     super(...arg);
    //     this.animation = { left: '20%', yoyo: true, repeat: -1, duration: 1000 };
    // }

    render() {
        let items;
        if (task.list.length > 0) {
            items = task.list.map(item => {
                return <TaskTableItems key={item.id} items={item}/>
            });
        } else {
            items = <TaskTableNotData/>;
        }
        return (
            <ul className="task-main-table-content">
                <QueueAnim delay={300}>
                    {items}
                </QueueAnim>
            </ul>
        );
    }

}

@observer class TaskTableNotData extends Component {

    render() {
        return (
            <li className="task-main-table-content-item">
                <ul className="item-ul"><li className="item-li-not"><Icon type="exclamation-circle-o" />啊呀,没有发现任务.</li></ul>
            </li>
        )
    }

}

@observer class TaskTableItem extends Component {

    constructor(arg) {
        super(...arg);
    }

    render() {
        let item = this.props.item,
            taskState = classNames({
                'task-state': true,
                'tsak-state-not-started': item.state === 0,
                'tsak-state-ongoing': item.state === 1,
                'tsak-state-done': item.state === 2,
            });

        return (
            <ul className="item-ul">
                <li className="item-li">{item.title}</li>
                <li className="item-li item-li-time">{utils.timeFormatTranslate.sToh(item.estimateTime)}</li>
                <li className="item-li item-li-time">{utils.timeFormatTranslate.sToh(item.actualTime)}</li>
                <li className="item-li item-li-time">{utils.timeFormatTranslate.sTom(item.timeout)}</li>
                <li className="item-li">
                    <span className={taskState}>{TaskConst.state[item.state]}</span>
                </li>
                <li className="item-li">{item.projectName}</li>
                <li className="item-event-mask">
                    <button className="item-event-button view-button" onClick={this.view.bind(event)}>查看</button>
                    <button className="item-event-button change-button" onClick={this.change.bind(event, item)}>修改</button>
                    <button className="item-event-button delete-button" onClick={this.delete.bind(event, item)}>删除</button>
                </li>
            </ul>
        );
    }

    delete(item, e) {

        Modal.confirm({
            title: '警告',
            content: '确认删除该任务?',
            okText: '确认',
            cancelText: '取消',
            onOk: function() {
                task.delete(item);
            },
            onCancel: function() {

            }
        });

        // if (enter) {}

    }

    view(e) {
        message.warn('该事件还在整理中,稍后开放')
    }

    change(item, e) {
        task.selected = item;
        task.panel = true;
        task.steps = 3;
        task.state = item.state;

    }

}

@observer class TaskTableBugItems extends Component {

    render() {
        let buglist = this.props.item.map(item => <TaskTableItem key={item.id} item={item}></TaskTableItem>);

        return (
            <div className="item-bug">
                {buglist}
            </div>
        );
    }

}

@observer class TaskTableItems extends Component {

    render() {
        let item = this.props.items,
            bugItems,
            itemClass = classNames({
                'task-main-table-content-item': true,
                'type-bug': item.type === 2
            });

        if (item.bugItems && item.bugItems.length > 0) {
            bugItems = <TaskTableBugItems item={item.bugItems}></TaskTableBugItems>;
        }
        return (
            <li className={itemClass}>
                <TaskTableItem item={item}></TaskTableItem>
                {bugItems}
            </li>
        );
    }

}

@observer class TaskTable extends Component {

    render() {

        return (
            <main className="table-main">
                <TaskTableRibbon></TaskTableRibbon>
                <TaskTableHeader></TaskTableHeader>
                <TaskTableContent></TaskTableContent>
                <TaskStatistics></TaskStatistics>
            </main>
        );

    }

}

@observer class AppTask extends Component {

    render() {

        return (
            <div>
                <Loading></Loading>
                <Header></Header>
                <TaskTableSettingName></TaskTableSettingName>
                <TaskPanel></TaskPanel>
                <TaskTable></TaskTable>
                <Footer></Footer>
            </div>
        );

    }

}

export default AppTask;