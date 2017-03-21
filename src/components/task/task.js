import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classNames';
import { Switch, Icon, Steps, Select, Input, Button, message, Modal ,Spin} from 'antd';
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

@observer class TaskTableAdd extends Component {

    constructor(arg) {
        super(...arg);
        this.addTaskHandle = this.addTaskHandle.bind(this);
    }

    render() {
        return (
            // <button className="task-add-task" type="button" ></button>
            <Button type="primary" className="task-add-task" icon="plus-circle-o" onClick={this.addTaskHandle}>开始任务</Button>
        );
    }

    addTaskHandle() {
        task.panel = true;

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
        //     projectName: '',
        //     type: false,
        //     current: 0,
        //     projects: task.projects
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
                                <Step title="未开始" onClick={this.changeTaskState.bind(this, 0)} />
                                <Step title="进行中" onClick={this.changeTaskState.bind(this, 1)} />
                                <Step title="已完成" onClick={this.changeTaskState.bind(this, 2)} />
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

@observer class TaskTableFilter extends Component {

    render() {
        return (
            <span></span>
        )
        // return (
        //     <ul className="task-filter">
        //         <li className="task-filter-item">week</li>
        //     </ul>
        // )
    }

    findTaskHandle() {

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
        if (task.items.length > 0) {
            items = task.items.map(item => {
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
                <ul className="item-ul"><li className="item-li-not"><Icon type="question-circle-o" />没有发现相关的任务哟,赶紧开始添加吧!</li></ul>
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
                <TaskTableAdd></TaskTableAdd>
                <TaskTableFilter></TaskTableFilter>
                <TaskTableHeader></TaskTableHeader>
                <TaskTableContent></TaskTableContent>
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