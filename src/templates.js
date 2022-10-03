import { html, nothing } from 'lit-html';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { events } from './events';

export function projectTemplate({tasks, title}, projects) {
    const taskInputRef = createRef();
    const showInputBtnRef = createRef();

    function showInput() {
        taskInputRef.value.classList.remove('hidden')
        showInputBtnRef.value.classList.add('hidden')
    }

    function hideInput() {
        taskInputRef.value.classList.add('hidden')
        showInputBtnRef.value.classList.remove('hidden')
    }

    let titleRef = createRef();
    let descriptionRef = createRef();

    function addTaskHandler() {
        let title = titleRef.value.value;
        let description = descriptionRef.value.value;

        titleRef.value.value = '';
        descriptionRef.value.value = '';
        hideInput();

        events.emit('addTask', {title, description})
    }

    function buttons() {
        return html`
            <div class="buttons">
                <button @click=${addTaskHandler} type="button">Add Task</button>
                <button @click=${hideInput} type="button">Cancel</button>
            </div>
        `
    }

    return html`
        <div class="project">
            <h1 class="project-title">${title}</h1>
            <ul>
                ${tasks.map(task => taskTemplate(task))}
            </ul>
            <div class="task-input-container">
                <div ${ref(showInputBtnRef)} @click=${showInput} class="display-task-input">Add Task</div>
                <div ${ref(taskInputRef)} class="hidden">
                    ${taskInputTemplate(titleRef, descriptionRef, projects)}
                    ${buttons()}
                </div>
            </div>
        </div>
    `
}

function taskInputTemplate(titleRef, descriptionRef, projects, taskToEdit = null) {

    return html`
        <div class="task-input">

            <label>Title</label>
            <input ${ref(titleRef)} type="text" class="title"
                value=${taskToEdit ? taskToEdit.title : nothing}>

            <label>Due Date</label>
            <input type="date" class="date">

            <label>Description</label>
            <textarea ${ref(descriptionRef)}/>${taskToEdit ? taskToEdit.description : ''}</textarea>

            <label>Priority</label>
            <select>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>

            <label>Project</label>
            <select>
                ${projects.map(project => {
                    return html`
                        <option value=${project.title}>${project.title}</option>
                    `
                })}
            </select>
        </div>
    `
}

export function editTaskInputTemplate(task, projects) {
    let titleRef = createRef();
    let descriptionRef = createRef();

    function editTaskHandler() {
        let newTitle = titleRef.value.value;
        let newDescription = descriptionRef.value.value;
        events.emit('editTask', {task, newTitle, newDescription})
        events.emit('closeEditingForm')
    }

    function cancelHandler() {
        events.emit('closeEditingForm')
    }

    return html`
        <div>
            ${taskInputTemplate(titleRef, descriptionRef, projects, task)}
            <div class="buttons">
                <button @click=${editTaskHandler} type="button">Edit Task</button>
                <button @click=${cancelHandler} type="button">Cancel</button>
            </div>
        </div>
    `
}

function taskTemplate(task) {
    const editIcon = html`
    <svg style="width:20px;height:20px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M16.84,2.73C16.45,2.73 16.07,2.88 15.77,3.17L13.65,5.29L18.95,10.6L21.07,8.5C21.67,7.89 21.67,6.94 21.07,6.36L17.9,3.17C17.6,2.88 17.22,2.73 16.84,2.73M12.94,6L4.84,14.11L7.4,14.39L7.58,16.68L9.86,16.85L10.15,19.41L18.25,11.3M4.25,15.04L2.5,21.73L9.2,19.94L8.96,17.78L6.65,17.61L6.47,15.29" />
    </svg>`;
    const deleteIcon = html`
    <svg style="width:20px;height:20px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z" />
    </svg>`

    return html`
        <li class="task">
            <div>
                <input class="task-checkbox" type="checkbox" value="completed">
            </div>
            <div class="title">${task.title}</div>
            <div class="icons-container">
                <span @click=${() => events.emit('displayTaskEditing', task)}>${editIcon}</span>
                <span @click=${() => events.emit('deleteTask', task)}>${deleteIcon}</span>
            </div>
            <div class="description">${task.description}</div>
            <div>
                <div>${task.dueDate}</div>
            </div>
        </li>
    `
}

export function leftMenuTemplate(projects) {

    function displayProject(project) {
        if(projects.currentOnDisplay === project) return;
        events.emit('renderProject', project);
    }

    function projectBtn(project) {
        return html`
            <div @click=${() => displayProject(project)}
            class=${projects.currentOnDisplay === project ?
            'on-display' : nothing}>
                <span>
                    ${project.title}
                </span>
                <span>
                    ${project.numOfTasks > 0 ?
                        project.numOfTasks :
                        nothing}
                </span>
            </div>
        `
    }

    const inputRef = createRef();
    function addProjectInput() {
        const titleRef = createRef();

        return html`
            <div class="project-input hidden" ${ref(inputRef)}>
                <div>
                    <label>Title</label>
                    <input ${ref(titleRef)} type="text">
                </div>
                <div>
                    <button @click=${() => {
                        inputRef.value.classList.add('hidden')
                        events.emit('createProject', {title: titleRef.value.value})
                    }} type="button">
                        Create Project
                    </button>
                    <button @click=${() => inputRef.value.classList.add('hidden')}>
                        Cancel
                    </button>
                </div>
            </div>
        `
    }

    return html`
        <div>
            <div class="projects-container default">
                ${projects.builtIn.map(projectBtn)}
            </div>
            <div>
                <span>Projects</span>
                <div @click=${() => inputRef.value.classList.toggle('hidden')}>
                    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M13 19C13 19.34 13.04 19.67 13.09 20H4C2.9 20 2 19.11 2 18V6C2 4.89 2.89 4 4 4H10L12 6H20C21.1 6 22 6.89 22 8V13.81C21.39 13.46 20.72 13.22 20 13.09V8H4V18H13.09C13.04 18.33 13 18.66 13 19M20 18V15H18V18H15V20H18V23H20V20H23V18H20Z" />
                    </svg>
                </div>
            </div>
            ${addProjectInput()}
            <div class="projects-container custom">
                ${projects.custom.map(projectBtn)}
            </div>
        </div>
    `
}