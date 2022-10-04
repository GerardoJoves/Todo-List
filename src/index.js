import './styles.css';
import { render } from 'lit-html';
import { Project } from './project';
import { Task } from './task';
import { events } from './events';
import { projectTemplate, leftMenuTemplate, editTaskInputTemplate } from './templates';
import { customizeObject } from 'webpack-merge';

const projectDisplayContainer = document.querySelector('#project-display');
const hamburgerMenuIcon = document.querySelector('#hamburger-menu-icon');
const leftMenu = document.querySelector('#left-menu');
const modal = document.querySelector('.modal');
const modalContent = document.querySelector('.modal-content');

hamburgerMenuIcon.addEventListener('click', function() {
    leftMenu.classList.toggle('active')
})

const projects = (function() {
    const index = new Project({
        title: 'Index'
    });

    const builtIn = [index];
    const custom = [];

    function addCustomProject(project) {
        custom.push(project)
    }

    function deleteProject(project) {
        for(let i = 0; i < custom.length; i++) {
            if(custom[i] === project) {
                custom.splice(i, 1)
            }
        }
    }

    return {
        currentOnDisplay: index,
        get builtIn() {
            return [...builtIn]
        },
        get custom() {
            return [...custom]
        },
        addCustomProject,
        deleteProject,
    }
})();

function loadProject() {
    render(projectTemplate(projects.currentOnDisplay, [...projects.builtIn, ...projects.custom]), projectDisplayContainer)
}

function loadLeftMenu() {
    render(leftMenuTemplate(projects), leftMenu)
}

events.on('addTask', (taskInfo) => {
    projects.currentOnDisplay.addTask(new Task(taskInfo))
    loadProject()
    loadLeftMenu()
})

events.on('renderProject', (project) => {
    projects.currentOnDisplay = project;
    render(projectTemplate(project, [...projects.builtIn, ...projects.custom]), projectDisplayContainer)
    loadLeftMenu()
})

events.on('createProject', (projectInfo) => {
    projects.addCustomProject(new Project(projectInfo))
    loadLeftMenu()
    loadProject()
})

events.on('deleteTask', (task) => {
    projects.currentOnDisplay.removeTask(task)
    loadProject()
    loadLeftMenu()
})

events.on('displayTaskEditing', (task) => {
    modal.classList.add('show-modal')
    render(editTaskInputTemplate(task, [...projects.builtIn, ...projects.custom]), modalContent)
})

events.on('editTask', ({task, newTitle, newDescription}) => {
    task.edit({title: newTitle, description: newDescription})
    loadProject()
})

events.on('closeEditingForm', () => {
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