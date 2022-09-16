export class Project {
    constructor({title}) {
        this.title = title; 
        this.tasks = []
    }

    addTask(newTask) {
        this.tasks.push(newTask);
    }
}