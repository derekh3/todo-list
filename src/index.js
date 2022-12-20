import "./style.css";
import Close from "./close.svg";

function component() {
  const element = document.createElement("div");

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = "Hello2";

  return element;
}

function todoFactory(title, description, dueDate, priority) {
  // function setTitle(newTitle) {
  //   this.title = newTitle;
  // }
  // function setDescription(newTitle) {
  //   this.title = newTitle;
  // }
  // function setDueDate(newTitle) {
  //   this.title = newTitle;
  // }
  // function setPriority(newTitle) {
  //   this.title = newTitle;
  // }
  return {
    title,
    description,
    dueDate,
    priority,
    // setTitle,
    // setDescription,
    // setDueDate,
    // setPriority,
  };
}

function projectFactory(name, todoArray) {
  return { name, todoArray };
}

const AppController = (() => {
  const projects = {};
  let currentProject = "default";
  let projectsCounter = 1;
  const createDefaultProject = () => {
    const todo1 = todoFactory(
      "todo 1",
      "test project 1",
      "July 1, 2023",
      "medium"
    );
    const todo2 = todoFactory(
      "todo 2",
      "test project 2",
      "July 2, 2023",
      "high"
    );
    const defaultProject = projectFactory("Example Project", [todo1, todo2]);
    projects["default"] = defaultProject;
  };

  const createProject = () => {
    let projectName = prompt("Project name?");

    let key = `project-${projectsCounter}`;
    projectsCounter++;
    projects[key] = projectFactory(`${projectName}`, []);
    DOMController.addProjectToList(key, projectName);

    if (Object.keys(projects).length === 1) {
      currentProject = key;
    }
  };

  const deleteProject = (projectKey) => {
    if (currentProject === projectKey) {
      DOMController.hideTodos();
    }
    delete projects[projectKey];
    DOMController.hideProjects();
    displayProjects();
  };

  const displayDefaultProject = () => {
    switchProject("default");
    DOMController.activateDefaultProject();
    // displayTodos("default");
  };

  const displayProjects = () => {
    for (var key in projects) {
      if (projects.hasOwnProperty(key)) {
        DOMController.addProjectToList(key, projects[key].name);
      }
    }
  };

  const displayTodos = (projectKey = currentProject) => {
    let project = projects[projectKey];
    for (let i = 0; i < project.todoArray.length; i++) {
      DOMController.displayTodo(
        projectKey,
        i,
        project.name,
        project.todoArray[i]
      );
    }
  };
  const switchProject = (key) => {
    currentProject = key;
    DOMController.hideTodos();
    displayTodos(key);
  };

  const deleteTodo = (projectKey, todoIndex) => {
    projects[projectKey].todoArray.splice(todoIndex, 1);
    DOMController.hideTodos();
    displayTodos(projectKey);
  };

  const addTodo = () => {
    let title = prompt("Title?");
    let description = prompt("Description?");
    let dueDate = prompt("Due date?");
    let priority = prompt("Priority?");
    let todo = todoFactory(title, description, dueDate, priority);
    console.log(projects[currentProject]);
    projects[currentProject].todoArray.push(todo);
  };

  return {
    createProject,
    deleteProject,
    createDefaultProject,
    displayDefaultProject,
    displayTodos,
    displayProjects,
    switchProject,
    deleteTodo,
    addTodo,
  };
})();

const DOMController = ((doc) => {
  const content = doc.querySelector(".cards-container");
  const projectsList = doc.querySelector(".projects-list");

  const addTodoBtn = doc.querySelector(".add-todo");
  addTodoBtn.onclick = () => {
    AppController.addTodo();
    DOMController.hideTodos();
    AppController.displayTodos();
  };

  const addProjectBtn = doc.querySelector(".add-project");
  addProjectBtn.onclick = () => {
    AppController.createProject();
  };

  const activateDefaultProject = () => {
    let projects = doc.querySelectorAll(".project");
    console.log(projects);
    if (projects.length === 1) {
      projects[0].classList.add("project-active");
    }
  };

  const addProjectToList = (key, projectName) => {
    let newProject = doc.createElement("div");
    newProject.classList.add("project");
    let projectText = doc.createElement("div");
    projectText.textContent = projectName;
    projectText.classList.add("project-text");
    newProject.setAttribute("data-project", `${key}`);
    newProject.onclick = (e) => {
      let oldProject = doc.querySelector(".project-active");
      if (oldProject !== null) {
        oldProject.classList.toggle("project-active");
      }
      newProject.classList.add("project-active");
      AppController.switchProject(key);
    };

    newProject.appendChild(projectText);

    let closeIcon = new Image();
    closeIcon.src = Close;
    closeIcon.classList.add("close-project");
    closeIcon.onclick = (e) => {
      AppController.deleteProject(
        e.target.parentElement.getAttribute("data-project", "key")
      );
      e.stopPropagation();
    };
    newProject.appendChild(closeIcon);
    if (projectsList.innerHTML === "") {
      newProject.classList.add("project-active");
    }
    projectsList.appendChild(newProject);
  };

  const displayTodo = (projectKey, todoIndex, projectName, todo) => {
    let todoElement = doc.createElement("div");
    todoElement.classList.add("card");
    todoElement.setAttribute("data-project", `${projectName}`);

    let closeIcon = new Image();
    closeIcon.src = Close;
    closeIcon.classList.add("close-card");
    closeIcon.onclick = () => {
      AppController.deleteTodo(projectKey, todoIndex);
    };

    let todoTitle = doc.createElement("div");
    let todoDescription = doc.createElement("p");
    let todoDueDate = doc.createElement("p");
    let todoPriority = doc.createElement("p");
    todoTitle.textContent = todo.title;
    todoDescription.textContent = todo.description;
    todoDueDate.textContent = todo.dueDate;
    todoPriority.textContent = todo.priority;

    todoElement.appendChild(closeIcon);
    todoElement.appendChild(todoTitle);
    todoElement.appendChild(todoDescription);
    todoElement.appendChild(todoDueDate);
    todoElement.appendChild(todoPriority);
    content.appendChild(todoElement);
  };
  const hideTodos = () => {
    content.innerHTML = "";
  };

  const hideProjects = () => {
    projectsList.innerHTML = "";
  };
  return {
    displayTodo,
    addProjectToList,
    hideTodos,
    hideProjects,
    activateDefaultProject,
  };
})(document);

// const testTodo = todoFactory("Test", "testtest", "July 3, 1991", "high");
// testTodo.title = "HAHAH";
// const testElement = document.createElement("div");
// testElement.textContent = testTodo.title;
// document.body.appendChild(component());
// console.log(testTodo.title);
// document.body.appendChild(testElement);

AppController.createDefaultProject();
AppController.displayProjects();
AppController.displayDefaultProject();
