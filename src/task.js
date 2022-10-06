import { isThisQuarter } from "date-fns";

export class Task {
    constructor({title, description, dueDate, priority, project}) {
        this.title = title;
        this.description = description; 
        this.dueDate = dueDate;
        this.priority = priority;
        this.project = project;
    }

    edit(props) {
        for(let [prop, value] of Object.entries(props)) {
            if(this.hasOwnProperty(prop)) this[prop] = value;
        }
    }
}