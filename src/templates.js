import { html } from 'lit-html';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { events } from './events';

export function projectTemplate({tasks, title}) {
    return html`
        <div>
            <h1>${title}</h1>
            <ul>
                ${tasks.map(task => taskTemplate(task))}
                <li>${taskInputTemplate()}</li>
            </ul>
        </div>
    `
}

function taskInputTemplate() {
    let titleRef = createRef()
    let descriptionRef = createRef();

    function addTaskHandler() {
        events.emit('addTask', {
            title: titleRef.value.value,
            description: descriptionRef.value.value,
        })
    }

    return html`
        <div>
            <div>
                <label>Title</label>
                <input ${ref(titleRef)} tyep="text" />
            </div>
            <div>
                <label>Description</div>
                <input ${ref(descriptionRef)} type="text" />
            </div>
            <div>
                <button @click=${addTaskHandler} type="button" >Add Task</button>
            </div>
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

export function leftMenuTemplate(projects) {

    function displayProject(project) {
        if(projects.currentPorjectOnDisplay === project) return;
        events.emit('renderProject', project);
    }

    function projectBtn(project) {
        return html`
            <div @click=${() => displayProject(project)}>
                <span>
                    ${project.title}
                </span>
            </div>
        `
    }

    function addProjectInput() {
        const titleRef = createRef();

        return html`
            <div>
                <label>Title</label>
                <input ${ref(titleRef)} type="text">
                <button @click=${() => events.emit('createProject', {
                    title: titleRef.value.value
                })} type="button">
                    Create Project
                </button>
            </div>
        `
    }

    return html`
        <div>
            ${projects.builtIn.map(projectBtn)}
            <div>
                <span>Projects</span>
            </div>
            ${projects.custom.map(projectBtn)}
            ${addProjectInput()}
        </div>
    `
}