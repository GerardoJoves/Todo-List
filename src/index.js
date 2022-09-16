import './styles.css';
import { html, render } from 'lit-html';
import { createRef, ref } from 'lit-html/directives/ref.js'
import { Project } from './project';
import { Task } from './task';

const projectDisplay = document.querySelector('#project-display');

let currentProject = new Project({
    title: 'Index'
});

const taskInput = {
    titleRef: createRef(),
    descriptionRef: createRef(),
}

function addTaskHandler(e) {
    currentProject.addTask(new Task({
        title: taskInput.titleRef.value.value,
        description: taskInput.descriptionRef.value.value,
        dueDate: 'empty',
        priority: 'empty',
    }))

    render(projectTemplate(currentProject), projectDisplay);
}

function taskInputTemplate(inputObj) {
    return html`
        <div>
            <div>
                <label>Title</label>
                <input ${ref(inputObj.titleRef)} tyep="text" />
            </div>
            <div>
                <label>Description</div>
                <input ${ref(inputObj.descriptionRef)} type="text" />
            </div>
            <div>
                <button @click=${addTaskHandler} type="button" >Add Task</button>
            </div>
        </div>
    `
}

function projectTemplate({tasks, title}) {
    return html`
        <div>
            <h1>${title}</h1>
            <ul>
                ${tasks.map(task => taskTemplate(task))}
                <li>${taskInputTemplate(taskInput)}</li>
            </ul>
        </div>
    `
}

function taskTemplate({title, description, dueDate}) {
    return html`
        <li>
            <div>
                <button class="task-checkbox" type="button"></button>
            </div>
            <div>
                <div>
                    <div class="task-title">${title}</div>
                </div>
                <div>
                    <div>${description}</div>
                </div>
                <div>
                    <div>${dueDate}</div>
                </div>
            </div>
        </li>
    `
}



render(projectTemplate(currentProject), projectDisplay);