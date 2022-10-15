import './styles.css';
import { render } from 'lit-html';
import { Project } from './project';
import { Task } from './task';
import { events } from './events';
import { projectTemplate, leftMenuTemplate, modalContentTemplate } from './templates';

const projectDisplayContainer = document.querySelector('#project-display');
const hamburgerMenuIcon = document.querySelector('#hamburger-menu-icon');
const leftMenu = document.querySelector('#left-menu');
const modal = document.querySelector('.modal');
const modalContent = document.querySelector('.modal-content');
const headerAddTaskBtn = document.querySelector('#create-task-icon');

function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}


if(window.innerWidth > 800) leftMenu.classList.toggle('active')

hamburgerMenuIcon.addEventListener('click', function() {
    leftMenu.classList.toggle('active')
})

headerAddTaskBtn.addEventListener('click', () => {
    events.emit('triggerModal', {newTask: true})
})

const projects = (function() {
    const defaultProject = new Project({
        title: 'Index'
    });

    const list = [defaultProject];
    const builtIn = [defaultProject];
    const custom = [];

    function addProject(project) {
        list.push(project)
        custom.push(project)
    }

    function deleteProject(project) {
        for(let i = 0; i < list.length; i++) {
            if(list[i] === project) {
                list.splice(i, 1)
            }
        }
        for(let i = 0; i < custom.length; i++) {
            if(custom[i] === project) {
                custom.splice(i, 1)
            }
        }
    }

    function findProject(title) {
        return [defaultProject, ...list].find((project) => project.title === title)
    }

    return {
        currentOnDisplay: defaultProject,
        defaultProject,
        list,
        builtIn,
        custom,
        addProject,
        deleteProject,
        findProject,
    }
})();

if(storageAvailable('localStorage')) {
    const storedProjects = localStorage.getItem('projects') ? JSON.parse(localStorage.getItem('projects')) : null;

    events.on('updateLocalStorage', () => {
        localStorage.setItem('projects', JSON.stringify(projects.list))
        console.log(JSON.stringify(projects.list))
    })

    if(storedProjects) {
        storedProjects.forEach(p => {
            let project = null;
            if(p.title === 'Index') project = projects.defaultProject
            else {
                project = new Project(p)
                projects.addProject(project)
            }

            p.tasks.forEach(t => {
                project.addTask(new Task(t))
            })
        });
    }
}

function loadProject() {
    render(projectTemplate(projects.currentOnDisplay, projects), projectDisplayContainer)
}

function loadLeftMenu() {
    render(leftMenuTemplate(projects), leftMenu)
}

events.on('addTask', ({taskInfo, project = null}) => {
    if(!project) {
        project = projects.findProject(taskInfo.ownerProject)
    }

    let task = new Task(taskInfo);
    project.addTask(task)
    events.emit('updateLocalStorage')
    loadProject()
    loadLeftMenu()
})

events.on('renderProject', (project) => {
    projects.currentOnDisplay = project;
    render(projectTemplate(project, projects), projectDisplayContainer)
    loadLeftMenu()
})

events.on('createProject', (projectInfo) => {
    projects.addProject(new Project(projectInfo))
    events.emit('updateLocalStorage')
    loadLeftMenu()
    loadProject()
})

events.on('deleteTask', (task) => {
    projects.currentOnDisplay.removeTask(task)
    events.emit('updateLocalStorage')
    loadProject()
    loadLeftMenu()
})

events.on('triggerModal', ({task = null, editTask = false, newTask = false}) => {
    modal.classList.add('show-modal')
    render(modalContentTemplate({task, editTask, newTask,projects}), modalContent)
})

events.on('editTask', ({task, newValues}) => {
    console.log(newValues.dueDate)
    if(newValues.ownerProject != projects.currentOnDisplay.title) {
        projects.findProject(task.ownerProject).removeTask(task)
        projects.findProject(newValues.ownerProject).addTask(task)
    }
    task.edit(newValues)
    events.emit('updateLocalStorage')
    loadProject()
    loadLeftMenu()
})

events.on('closeModal', () => {
    modal.classList.remove('show-modal')
})

events.on('deleteProject', (project) => {
    projects.deleteProject(project)
    projects.currentOnDisplay = projects.builtIn[0];
    events.emit('updateLocalStorage')
    loadProject()
    loadLeftMenu()
})

loadProject()
loadLeftMenu()