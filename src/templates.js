import { format } from 'date-fns';
import { html, nothing } from 'lit-html';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { live } from 'lit-html/directives/live.js';
import { cache } from 'lit-html/directives/cache.js';
import { events } from './events';

export function projectTemplate(project, projects) {
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

    function addTaskToProject(taskInfo) {
        hideInput()
        events.emit('addTask', {taskInfo, project})
    }

    return html`
        <div class="project">
            <div>
                <h1 class="project-title">${project.title}</h1>
                ${project === projects.defaultProject ?
                    nothing : 
                    html`<span class="delete-project" @click=${() => events.emit('deleteProject', project)}>
                        Delete Project
                    </span>`
                }
            </div>
            <ul>
                ${project.tasks.map(task => taskTemplate(task))}
            </ul>
            <div class="task-input-container">
                <div ${ref(showInputBtnRef)} @click=${showInput} class="display-task-input">Add Task</div>
                <div ${ref(taskInputRef)} class="hidden">
                    ${taskInputTemplate({
                        submitionHandler: addTaskToProject,
                        cancelationHandler: hideInput,
                        projects,
                        defaultValues: false,
                    })}
                </div>
            </div>
        </div>
    `
}

function taskInputTemplate({
    submitionHandler,
    cancelationHandler,
    projects,
    defaultValues = null,
}) {

    const refs = {
        title: createRef(),
        description: createRef(),
        priority: createRef(),
        dueDate: createRef(),
        ownerProject: createRef(),
    }

    function getInputValues() {
        return {
            title: refs.title.value.value,
            description: refs.description.value.value,
            priority: refs.priority.value.value,
            dueDate: refs.dueDate.value.value,
            ownerProject: refs.ownerProject.value.value,
        }
    }

    function clearInput() {
        refs.title.value.value = '';
        refs.description.value.value = '';
        refs.dueDate.value.value = '';
        refs.priority.value.value = 'high';
        refs.ownerProject.value.value = projects.currentOnDisplay.title
    }

    function controlBtns() {
        return html`
            <div class="buttons">
                <button type="button"
                    @click=${() => {
                        let inputValues = getInputValues();
                        clearInput()
                        submitionHandler(inputValues)
                    }}>
                    Confirm
                </button>
                <button type="button"
                    @click=${() => {
                        clearInput()
                        cancelationHandler()
                    }}>
                    Cancel
                </button>
            </div>
        `
    }

    return html`
        <div>
            <div class="task-input">

                <label>Title</label>
                <input ${ref(refs.title)} type="text" class="title"
                    .value=${defaultValues ? live(defaultValues.title) : ''}>

                <label>Due Date</label>
                <input ${ref(refs.dueDate)} type="date" class="date"
                    .value=${defaultValues ? live(defaultValues.dueDate) : ''}>

                <label>Description</label>
                <textarea ${ref(refs.description)}
                    .value=${defaultValues ? live(defaultValues.description) : ''}></textarea>

                <label>Priority</label>

                <select ${ref(refs.priority)}
                    .value=${defaultValues ? live(defaultValues.priority) : 'high'}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                <label>Project</label>

                <select ${ref(refs.ownerProject)}>
                    ${projects.list.map((project) => {
                        return html`
                            <option
                                value=${project.title}
                                .selected=${projects.currentOnDisplay.title === project.title ? true : false}>
                                ${project.title}
                            </option>
                        `})}
                </select>
            </div>

            ${controlBtns()}
        </div>
    `
}

export function modalContentTemplate({
    task,
    editTask = false,
    projects,
}) {

    function editTaskHandler(taskInfo) {
        events.emit('editTask', {task, newValues: taskInfo})
        events.emit('closeModal')
    }

    function closeModalHandler() {
        events.emit('closeModal')
    }

    function editView() {
        return html`
            <div>
                ${taskInputTemplate({
                    submitionHandler: editTaskHandler,
                    cancelationHandler: closeModalHandler,
                    projects, 
                    defaultValues: task,
                })}
            </div>`
    }

    function detailView() {
        return html `
            <div class="details">
                <div class="details-content">
                    <div class="section">
                        <span>Title: </span>
                        <div>${task.title}</div>
                    </div>
                    <div class="section">
                        <span>Description: </span>
                        <div>${task.description ? task.description : 'No description'}</div>
                    </div>
                    <div class="section">
                        <span>Due Date: </span>
                        <div>${task.dueDate ? format(new Date(task.dueDate), 'MMM do Y') : 'No due Date'}</div>
                    </div>
                    <div class="section">
                        <span>Priority: </span>
                        <div>${task.priority}</div>
                    </div>
                </div>
                <span @click=${closeModalHandler} class="close-modal-btn">x</span>
            </div>`
    }

    return html`${cache(editTask ? editView() : detailView())}`
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

    let taskRef = createRef();
    let checkboxRef = createRef();
    function checkboxHandler(e) {
        e.stopPropagation()
        if(checkboxRef.value.checked) {
            task.completed = true;
            console.log(taskRef.value)
            taskRef.value.classList.add('completed')
        } else {
            task.completed = false;
            taskRef.value.classList.remove('completed')
        }
        console.log(task)
    }

    return html`
        <li class="task ${task.priority ? task.priority : nothing} ${task.completed ? 'completed' : ''}"
        ${ref(taskRef)}
        @click=${() => events.emit('triggerModal', {task, edit: false})}>
            <div>
                <input type="checkbox" value="completed"
                class="task-checkbox" ${ref(checkboxRef)}
                @click=${checkboxHandler}
                .checked=${live(task.completed ? true : false)}>
            </div>
            <div class="title">${task.title}</div>
            <div class="icons-container">
                <span @click=${(e) => {
                        e.stopPropagation()
                        events.emit('triggerModal', {task, editTask: true})
                    }}>${editIcon}</span>
                <span @click=${(e) => {
                        e.stopPropagation()
                        events.emit('deleteTask', task)
                    }}>${deleteIcon}</span>
            </div>
            <div class="due-date">${task.dueDate ? format(new Date(task.dueDate), 'MMM do Y') : 'No due date'}
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
    const titleRef = createRef();
    function projectInput() {

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
            ${projectInput()}
            <div class="projects-container custom">
                ${projects.custom.map(projectBtn)}
            </div>
        </div>
    `
}