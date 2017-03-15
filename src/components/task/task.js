import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classNames';

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

        return (
            <div className={loadingClass}>
                <div className="ball-beat">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
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
            <button className="task-add-task" type="button" onClick={this.addTaskHandle}></button>
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

    }

    render() {
        let filterList = task.find,
            list, className, panel, state,
            btnClassName = classNames({
                'task-next': true,
                'task-continue': task.type === 2
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

            panel = <section className="task-panel-continue" onClick={this.preventDefault}>
                        <div className="task-panel-continue-title"></div>
                        <div className="task-panel-continue-info">
                    <input type="text" className="task-panel-continue-info-input" placeholder="请输入本次任务用时" ref="taskThisTime"/>
                            <input type="checkbox" className="task-panel-continue-info-state" ref="taskState"/>
                        </div>
                        <div className="task-panel-continue-submit">
                            <button className="task-panel-cancel" onClick={this.cancelAddTask.bind(this)}></button>
                            <button className="task-panel-enter" onClick={this.updateTask.bind(this)}></button>
                        </div>
                </section>
        } else if (task.steps === 2) {
            if (task.state > 0) {
                state = <input type="checkbox" className="task-panel-continue-info-state" ref="taskState" defaultChecked={task.state === 2}/>
            }
            panel = <section className="task-panel-continue" onClick={this.preventDefault}>
                        <div className="task-panel-continue-title"></div>
                        <div className="task-panel-continue-info">
                            <input type="text" className="task-panel-continue-info-input" placeholder="预估用时" ref="taskEstimateTime" onChange={this.timeChange}/>
                            <input type="checkbox" className="task-panel-continue-info-state task-panel-continue-info-type" ref="taskType"/>
                        </div>
                        <div className="task-panel-continue-info">
                            <input type="text" className="task-panel-continue-info-input" placeholder="本次用时" ref="taskThisTime" onChange={this.timeChange}/>
                            {state}
                            <input type="text" className="task-panel-continue-info-input" placeholder="所属项目" ref="taskProjectName"/>
                        </div>
                        <div className="task-panel-continue-info">
                            <input type="text" className="task-panel-continue-info-input" placeholder="备注" ref="taskRemarks"/>
                        </div>
                        <div className="task-panel-continue-submit">
                            <button className="task-panel-cancel" onClick={this.cancelAddTask.bind(this)}></button>
                            <button className="task-panel-enter" onClick={this.addTask.bind(this)}></button>
                        </div>
                </section>
        } else if (task.steps === 3) {
            let selected = task.selected;
            // chancked = {  }
            if (task.state > 0) {
                state = <input type="checkbox" className="task-panel-continue-info-state" ref="taskState" defaultChecked={task.state === 2} />
            }
            panel = <section className="task-panel-continue" onClick={this.preventDefault}>
                <div className="task-panel-continue-title"></div>
                <div className="task-panel-continue-info">
                    <input type="text" className="task-panel-continue-info-input" placeholder="预估用时" ref="taskEstimateTime" defaultValue={utils.timeFormatTranslate.sToh(selected.estimateTime)} onChange={this.timeChange} />
                    <input type="checkbox" className="task-panel-continue-info-state task-panel-continue-info-type" ref="taskType" defaultChecked={selected.type === 2}/>
                    
                </div>
                <div className="task-panel-continue-info">
                    <input type="text" className="task-panel-continue-info-input" placeholder="实际用时" ref="taskThisTime" defaultValue={utils.timeFormatTranslate.sToh(selected.actualTime)} onChange={this.timeChange}/>
                    {state}
                    <input type="text" className="task-panel-continue-info-input" placeholder="所属项目" ref="taskProjectName" defaultValue={selected.projectName}/>
                </div>
                <div className="task-panel-continue-info">
                    <input type="text" className="task-panel-continue-info-input" placeholder="备注" ref="taskRemarks" defaultValue={selected.remarks}/>
                </div>
                <div className="task-panel-continue-submit">
                    <button className="task-panel-cancel" onClick={this.cancelChangeTask.bind(this)}></button>
                    <button className="task-panel-enter" onClick={this.changeTask.bind(this)}></button>
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
            this.selected = null;
            task.resetState();
            return false;
        }

        task.panel = false;

    }

    selectTaskItem(item) {
        this.refs.taskName.value = task.findName = item.title;
        this.selected = item;
        task.type = 2;

    }

    startTaskItem(e) {
        if (e.keyCode !== undefined && e.keyCode !== 13) {
            return false;
        }

        if (task.findName === '') {
            alert('请填写正确的任务名称.');
            return false;
        }

        if (!this.selected) {
            let enter = confirm('确认添加一条新任务? 否则请选择一项已存在的任务.');
            if (enter) {
                task.steps = 2;
            }
        } else {
            task.steps = 1;
        }

    }

    updateTask() {

        if (!utils.isTime(this.refs.taskThisTime.value)) {
            alert('预计用时 格式错误');
            return false;
        }

        let params = {};
        params.id = this.selected.id;
        params.actualTime = utils.timeFormatTranslate.hTos(this.refs.taskThisTime.value.trim()) + this.selected.actualTime;
        params.state = 1;
        params.timeout = params.actualTime - this.selected.estimateTime;
        if (this.refs.taskState.checked) {
            params.state = 2;
        }
        console.log(params);

        task.update(params);

    }

    timeChange(e) {
        if (utils.timeFormatTranslate.hTos(this.refs.taskThisTime.value.trim()) === 0 || utils.timeFormatTranslate.hTos(this.refs.taskEstimateTime.value.trim()) === 0) {
            task.state = 0;
            return false;
        }

        if (utils.timeFormatTranslate.hTos(this.refs.taskThisTime.value.trim()) >= utils.timeFormatTranslate.hTos(this.refs.taskEstimateTime.value.trim())) {
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
        if (this.refs.taskEstimateTime.value === '0' || !utils.isTime(this.refs.taskEstimateTime.value) || !this.refs.taskProjectName.value.trim()) {
            alert('预计用时&所属项目 - 格式错误');
            return false;
        }

        let params = _.assign({}, task.selected);

        // params.title = item.title;
        params.estimateTime = utils.timeFormatTranslate.hTos(this.refs.taskEstimateTime.value.trim());
        params.actualTime = utils.timeFormatTranslate.hTos(this.refs.taskThisTime.value.trim());
        params.type = !this.refs.taskType.checked ? 1 : 2;
        params.state = params.actualTime == 0 ? 0 : this.refs.taskState.checked ? 2 : 1;
        params.projectName = this.refs.taskProjectName.value.trim();
        params.remarks = this.refs.taskRemarks.value.trim();
        params.timeout = params.actualTime - params.estimateTime;

        console.log(params)
        task.update(params);

    }

    addTask() {
        if (this.refs.taskEstimateTime.value === '0' || !utils.isTime(this.refs.taskEstimateTime.value) || !this.refs.taskProjectName.value.trim()) {
            alert('预计用时&所属项目 - 格式错误');
            return false;
        }

        let params = {};

        params.title = task.findName;
        params.estimateTime = utils.timeFormatTranslate.hTos(this.refs.taskEstimateTime.value.trim());
        params.actualTime = utils.timeFormatTranslate.hTos(this.refs.taskThisTime.value.trim());
        params.type = !this.refs.taskType.checked ? 1 : 2;
        // params.state = params.actualTime == 0 ? 0 : 1;
        params.state = params.actualTime == 0 ? 0 : this.refs.taskState.checked ? 2 : 1;
        params.projectName = this.refs.taskProjectName.value.trim();
        params.remarks = this.refs.taskRemarks.value.trim();
        params.timeout = params.actualTime - params.estimateTime;

        // if (task.state === 1 && this.refs.taskState.checked) {
        //     params.state = 2;
        // }

        // console.log(params);

        task.add(params);

    }

    cancelAddTask() {
        this.selected = null;
        task.resetState();

    }

    findTask(event) {
        this.selected = null;
        task.type = 1;
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
                <ul className="item-ul"><li className="item-li">没有发现相关的任务哟,赶紧开始添加吧!</li></ul>
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

        let enter = confirm('确认删除该任务?');

        if (enter) {
            task.delete(item);
        }

    }

    view(e) {
        console.log('该事件还在整理中');
    }

    change(item, e) {
        task.selected = item;
        task.panel = true;
        task.steps = 3;
        task.state = item.state;
        console.log(task.selected)

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