import './styles.css';
import { render } from 'lit-html';
import { Project } from './project';
import { Task } from './task';
import { events } from './events';
import { projectTemplate, leftMenuTemplate } from './templates';

const projectDisplayContainer = document.querySelector('#project-display');
const hamburgerMenuIcon = document.querySelector('#hamburger-menu-icon');
const leftMenu = document.querySelector('#left-menu');

hamburgerMenuIcon.addEventListener('click', function() {
    leftMenu.classList.toggle('hidden')
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

    return {
        currentProjectOnDisplay: index,
        get builtIn() {
            return [...builtIn]
        },
        get custom() {
            return [...custom]
        },
        addCustomProject,
    }
})();

events.on('addTask', (taskInfo) => {
    projects.currentProjectOnDisplay.addTask(new Task(taskInfo))
    render(projectTemplate(projects.currentProjectOnDisplay), projectDisplayContainer)
})

events.on('renderProject', (project) => {
    render(projectTemplate(project), projectDisplayContainer)
    projects.currentProjectOnDisplay = project;
})

events.on('createProject', (projectInfo) => {
    projects.addCustomProject(new Project(projectInfo))
    render(leftMenuTemplate(projects), leftMenu)
})

render(projectTemplate(projects.currentProjectOnDisplay), projectDisplayContainer)
render(leftMenuTemplate(projects), leftMenu)