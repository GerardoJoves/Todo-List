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

    function findProject(title) {
        return [index, ...custom].find((project) => project.title === title)
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
        findProject,
    }
})();

function loadProject() {
    render(projectTemplate(projects.currentOnDisplay, [...projects.builtIn, ...projects.custom]), projectDisplayContainer)
}

function loadLeftMenu() {
    render(leftMenuTemplate(projects), leftMenu)
}

events.on('addTask', (taskInfo) => {
    if(projects.currentOnDisplay.title === taskInfo.project) {
        projects.currentOnDisplay.addTask(new Task(taskInfo))
        loadProject()
        loadLeftMenu()
    } else if(taskInfo.project === 'Index'){
        projects.builtIn[0].addTask(new Task(taskInfo))
        loadLeftMenu()
    } else {
        for(let project of projects.custom) {
            if(project.title === taskInfo.project) {
                project.addTask(new Task(taskInfo))
                loadLeftMenu()
                return
            }
        }
    }
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

events.on('triggerModal', ({task, edit}) => {
    modal.classList.add('show-modal')
    render(modalContentTemplate(task, edit, projects.currentOnDisplay, [...projects.builtIn, ...projects.custom]), modalContent)
})

events.on('editTask', ({task, newTitle, newDescription, newDueDate, newPriority, project}) => {
    if(task.project != project) {
        projects.findProject(task.project).removeTask(task)
        projects.findProject(project).addTask(task)
    }
    task.edit({
        title: newTitle,
        description: newDescription,
        dueDate: newDueDate,
        priority: newPriority,
        project,
    })
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