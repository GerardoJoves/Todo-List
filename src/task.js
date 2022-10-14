export class Task {
    constructor({title, description, dueDate, priority, ownerProject, completed = false}) {
        this.title = title;
        this.description = description; 
        this.dueDate = dueDate;
        this.priority = priority;
        this.ownerProject = ownerProject;
        this.completed = !!completed;
    }

    edit(props) {
        for(let [prop, value] of Object.entries(props)) {
            if(this.hasOwnProperty(prop)) this[prop] = value;
        }
    }
}