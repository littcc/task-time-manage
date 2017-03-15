import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// base
import './base/base.js'

// task
import Task from './components/task/task';

// rander
addEventListener('DOMContentLoaded', () => {

    const task = document.getElementById('app-task');
    ReactDOM.render(<Task />, task);

}, false);