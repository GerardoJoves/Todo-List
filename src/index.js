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

if(window.innerWidth > 800) leftMenu.classList.toggle('active')
hamburgerMenuIcon.addEventListener('click', function() {
    leftMenu.classList.toggle('active')
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

function loadProject() {
    render(projectTemplate(projects.currentOnDisplay, projects), projectDisplayContainer)
}

function loadLeftMenu() {
    render(leftMenuTemplate(projects), leftMenu)
}

events.on('addTask', ({taskInfo, project}) => {
    let task = new Task(taskInfo);
    project.addTask(task)
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
    loadLeftMenu()
    loadProject()
})

events.on('deleteTask', (task) => {
    projects.currentOnDisplay.removeTask(task)
    loadProject()
    loadLeftMenu()
})

events.on('triggerModal', ({task, editTask}) => {
    modal.classList.add('show-modal')
    render(modalContentTemplate({task, editTask, projects}), modalContent)
})

events.on('editTask', ({task, newValues}) => {
    if(newValues.ownerProject != projects.currentOnDisplay.title) {
        projects.findProject(task.ownerProject).removeTask(task)
        projects.findProject(newValues.ownerProject).addTask(task)
    }
    task.edit(newValues)
    loadProject()
    loadLeftMenu()
})

events.on('closeModal', () => {
    modal.classList.remove('show-modal')
})

events.on('deleteProject', (project) => {
    projects.deleteProject(project)
    projects.currentOnDisplay = projects.builtIn[0];
    loadProject()
    loadLeftMenu()
})

loadProject()
loadLeftMenu()