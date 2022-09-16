export class Task {
    constructor({title, description, dueDate, priority}) {
        this.title = title;
        this.description = description; 
        this.dueDate = dueDate;
        this.priority = priority;
    }

    edit(props) {
        for(let [prop, value] of Object.entries(props)) {
            if(this.hasOwnProperty(prop)) this[prop] = value;
        }
    }
}