import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classNames';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as Tooltips, Legend, ReferenceLine } from 'Recharts';
import { Switch, Icon, Steps, Select, Input, Button, message, Modal, Spin, Tooltip, Table } from 'antd';
// import { Steps } from 'antd';
const Step = Steps.Step;
const Option = Select.Option;

// animate
// import { TweenOneGroup } from 'rc-tween-one';


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

        return (
            <section className="task-table-ribbon">
                <div className="task-table-filter">
                    <div className={filterPanelClass}>
                        <Select defaultValue="项目" style={{ width: 120 }}>
                            <Option value="全部项目">全部项目</Option>
                            <Option value="日常">日常</Option>
                            <Option value="学习">学习</Option>
                        </Select>
                        <Select defaultValue="状态" style={{ width: 120 }}>
                            <Option value="全部任务">全部任务</Option>
                            <Option value="未开始">未开始</Option>
                            <Option value="进行中">进行中</Option>
                            <Option value="已完成">已完成</Option>
                        </Select>
                        <Select defaultValue="类型" style={{ width: 120 }}>
                            <Option value="全部任务">全部任务</Option>
                            <Option value="修复缺陷">修复缺陷</Option>
                            <Option value="开发任务">开发任务</Option>
                        </Select>
                    </div>
                    <Tooltip placement="top" title="统计上周已完成的任务">
                        <Button type="dashed" icon="bar-chart" className={lastWeekClass} onClick={this.statistics.bind(this,false)}>{this.state.statistics ? '恢复' : '上周'}</Button>
                    </Tooltip>
                    <Tooltip placement="top" title="统计本周已完成的任务">
                        <Button type="dashed" icon="bar-chart" className={thisWeekClass} onClick={this.statistics.bind(this,true)}>{this.state.statistics ? '恢复' : '本周'}</Button>
                    </Tooltip>
                    <Button type="dashed" icon="filter" className="task-table-filter-button" onClick={this.filterPanel}>{this.state.filter ? '收起' : '过滤'}</Button>
                </div>
                <Button type="primary" className="task-add-task" icon="plus-circle-o" onClick={this.addTaskHandle}>开始任务</Button>
            </section>
        );
    }

    addTaskHandle() {
        task.panel = true;

    }

    filterPanel() {
        this.setState({
            filter: !this.state.filter
        });

    }

    statistics(thisWeek) {
        task.statistics = !task.statistics;
        task.statisticsThisWeek = thisWeek;
        this.setState({
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
                            {list}
                        </ul>
                    </label>
                </section>
        } else if (task.steps === 1) {
            let selected = task.selected;
            // task.state = selected.state;

            // console.log(task.state,selected.state)

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
            // task.state = 0;
            // this.setState({
            // current: 0
            // });
            task.state = 0;
            return false;
        }

        if (utils.timeFormatTranslate.hTos(this.refs.taskThisTime.refs.input.value.trim()) >= utils.timeFormatTranslate.hTos(this.refs.taskEstimateTime.refs.input.value.trim())) {
            task.state = 2;
            // this.setState({
            //     current: 2
            // });
        } else {
            task.state = 1;
            // this.setState({
            //     current: 1
            // });
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
        // if ()
        console.log(selected);
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
            title: () => '统计结果',
            pagination: false,
            size: 'middle'
        }
    }

    render() {
        const projects = [];

        if (!task.statistics || task.list.length == 0) {
            return (<span></span>);
        }

        _.map(task.projects, (item, index) => {

            let project = {
                key: index,
                projectName: item.projectName,
                estimatedDevelopmentTime: 0,
                actualDevelopmentTime: 0,
                estimatedBugFixesTime: 0,
                actualBugFixesTime: 0
            };

            // 任务&修复bug时长
            _.map(task.list, (item) => {
                if (item.projectName === project.projectName) {
                    if (item.type === 1) {
                        project.estimatedDevelopmentTime += item.estimateTime;
                        project.actualDevelopmentTime += item.actualTime;
                    } else if (item.type === 2) {
                        project.estimatedBugFixesTime += item.estimateTime;
                        project.actualBugFixesTime += item.actualTime;
                    }
                }
            })

            // 总时长
            project.estimatedTime = project.estimatedDevelopmentTime + project.estimatedBugFixesTime;
            project.actualTime = project.actualDevelopmentTime + project.actualBugFixesTime;

            // 计算比例
            project.developmentTimeDeviation = utils.proportion((project.actualDevelopmentTime - project.estimatedDevelopmentTime) / project.estimatedDevelopmentTime * 100);
            project.bugFixesTimeDeviation = utils.proportion((project.actualBugFixesTime - project.estimatedBugFixesTime) / project.estimatedBugFixesTime * 100);
            project.timeDeviation = utils.proportion((project.actualTime - project.estimatedTime) / project.estimatedTime * 100);
            project.quality = utils.proportion(project.actualDevelopmentTime / project.actualTime * 100);
            project.effectiveness = utils.proportion(100 - [(project.actualTime - project.estimatedDevelopmentTime) / project.estimatedDevelopmentTime * 100]);

            //字符转数字供统计图表使用
            project.developmentTimeDeviationNumber = parseInt(project.developmentTimeDeviation);
            project.bugFixesTimeDeviationNumber = parseInt(project.bugFixesTimeDeviation);
            project.timeDeviationNumber = parseInt(project.timeDeviation);
            project.qualityNumber = parseInt(project.quality);
            project.effectivenessNumber = parseInt(project.effectiveness);

            // 格式化时间
            project.estimatedTime = utils.timeFormatTranslate.sTohToNumber(project.estimatedDevelopmentTime + project.estimatedBugFixesTime);
            project.actualTime = utils.timeFormatTranslate.sTohToNumber(project.actualDevelopmentTime + project.actualBugFixesTime);
            project.estimatedDevelopmentTime = utils.timeFormatTranslate.sTohToNumber(project.estimatedDevelopmentTime);
            project.actualDevelopmentTime = utils.timeFormatTranslate.sTohToNumber(project.actualDevelopmentTime);
            project.estimatedBugFixesTime = utils.timeFormatTranslate.sTohToNumber(project.estimatedBugFixesTime);
            project.actualBugFixesTime = utils.timeFormatTranslate.sTohToNumber(project.actualBugFixesTime);

            // push
            projects.push(project);

        });

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
            dataIndex: 'estimatedBugFixesTime',
            key: 'estimatedBugFixesTime',
        }, {
            title: '实际缺陷时间',
            dataIndex: 'actualBugFixesTime',
            key: 'actualBugFixesTime',
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
            dataIndex: 'bugFixesTimeDeviation',
            key: 'bugFixesTimeDeviation',
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

        return (
            <div className="task-statistics">
                <Table {...this.state} columns={columns} dataSource={projects}></Table>
                <div className="task-statistics-chart">
                    <BarChart width={500} height={300} data={projects}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="projectName" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltips />
                        <Legend />
                        <Bar dataKey="estimatedDevelopmentTime" name="预估开发时间" stackId="a" fill="#1fc759" />
                        <Bar dataKey="actualDevelopmentTime" name="实际开发时间" stackId="b" fill="#1ba94c" />
                        <Bar dataKey="estimatedBugFixesTime" name="预估缺陷时间" stackId="c" fill="#FF4351" />
                        <Bar dataKey="actualBugFixesTime" name="实际缺陷时间" stackId="d" fill="#da3a46" />
                        <Bar dataKey="estimatedTime" name="预估总时间" stackId="e" fill="#8884d8" />
                        <Bar dataKey="actualTime" name="实际总时间" stackId="f" fill="#625f9a" />
                    </BarChart>
                    <BarChart width={500} height={300} data={projects}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="projectName" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltips />
                        <Legend />
                        <ReferenceLine y={0} stroke='#000' />
                        <Bar dataKey="developmentTimeDeviationNumber" name="开发时间偏差" stackId="a" fill="#1fc759" />
                        <Bar dataKey="bugFixesTimeDeviationNumber" name="缺陷时间偏差" stackId="b" fill="#FF4351" />
                        <Bar dataKey="timeDeviationNumber" name="总时间偏差" stackId="c" fill="#8884d8" />
                        <Bar dataKey="qualityNumber" name="开发质量" stackId="d" fill="#02a6f2" />
                        <Bar dataKey="effectivenessNumber" name="开发效率" stackId="e" fill="#ff9800" />
                    </BarChart>
                </div>
            </div>
        )

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
                {items}                
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
                <TaskPanel></TaskPanel>
                <TaskTable></TaskTable>
                <Footer></Footer>
            </div>
        );

    }

}

export default AppTask;