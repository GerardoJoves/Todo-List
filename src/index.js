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

    return {
        currentOnDisplay: index,
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
    projects.currentOnDisplay.addTask(new Task(taskInfo))
    render(projectTemplate(projects.currentOnDisplay), projectDisplayContainer)
    render(leftMenuTemplate(projects), leftMenu)
})

events.on('renderProject', (project) => {
    projects.currentOnDisplay = project;
    render(projectTemplate(project), projectDisplayContainer)
    render(leftMenuTemplate(projects), leftMenu)
})

events.on('createProject', (projectInfo) => {
    projects.addCustomProject(new Project(projectInfo))
    render(leftMenuTemplate(projects), leftMenu)
})

render(projectTemplate(projects.currentOnDisplay), projectDisplayContainer)
render(leftMenuTemplate(projects), leftMenu)