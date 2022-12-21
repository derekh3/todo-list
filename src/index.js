import "./style.css";
import Close from "./close.svg";

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
    // let title = prompt("Title?");
    // let description = prompt("Description?");
    // let dueDate = prompt("Due date?");
    // let priority = prompt("Priority?");
    let title = "";
    let description = "";
    let dueDate = "";
    let priority = "";
    let todo = todoFactory(title, description, dueDate, priority);
    projects[currentProject].todoArray.push(todo);
    DOMController.openTodo(
      currentProject,
      projects[currentProject].todoArray.length - 1,
      todo
    );
  };

  const editTodo = (projectKey, todoIndex, todo) => {
    projects[projectKey].todoArray[todoIndex] = todo;
    DOMController.hideTodos();
    displayTodos();
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
    editTodo,
  };
})();

const DOMController = ((doc) => {
  const content = doc.querySelector(".cards-container");
  const everything = doc.querySelector(".content-container");
  const projectsList = doc.querySelector(".projects-list");
  const openTodoModal = doc.querySelector(".modal.open-todo");
  const body = doc.getElementsByTagName("body");

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
    todoDescription.classList.add("card-description");
    let todoDueDate = doc.createElement("p");
    let todoPriority = doc.createElement("p");
    let todoOpen = doc.createElement("button");

    todoTitle.textContent = todo.title;
    todoDescription.textContent = todo.description;
    todoDueDate.textContent = `Due: ${todo.dueDate}`;
    todoPriority.textContent = `Priority: ${todo.priority}`;
    todoOpen.textContent = "Open";

    todoOpen.onclick = () => {
      // blurBackground();
      openTodo(projectKey, todoIndex, todo);
    };

    todoElement.appendChild(closeIcon);
    todoElement.appendChild(todoTitle);
    // todoElement.appendChild(todoDescription);
    todoElement.appendChild(todoDueDate);
    todoElement.appendChild(todoPriority);
    todoElement.appendChild(todoOpen);
    content.appendChild(todoElement);
  };
  const hideTodos = () => {
    content.innerHTML = "";
  };

  const hideProjects = () => {
    projectsList.innerHTML = "";
  };

  const openTodo = (projectKey, todoIndex, todo) => {
    let openTodoModalContent = doc.querySelector(".open-todo.modal-content");

    openTodoModal.className = "modal open-todo is-visuallyHidden";
    setTimeout(function () {
      openTodoModal.className = "modal open-todo";
    }, 100);
    everything.className = "content-container is-blurred";

    let closeIcon = new Image();
    closeIcon.src = Close;
    closeIcon.classList.add("close-modal");
    closeIcon.onclick = () => {
      openTodoModal.className = "modal open-todo is-hidden is-visuallyHidden";
      // body.className = "";
      everything.className = "content-container";
      todo.title = todoTitle.value;
      todoDescription.textContent = todoDescription.value;
      todo.description = todoDescription.textContent;
      todo.dueDate = todoDueDate.value;
      todo.priority = todoPriority.value;
      AppController.editTodo(projectKey, todoIndex, todo);
    };

    let titleLabel = doc.createElement("label");
    let descriptionLabel = doc.createElement("label");
    let dueDateLabel = doc.createElement("label");
    let priorityLabel = doc.createElement("label");

    titleLabel.setAttribute("for", "modal-title");
    descriptionLabel.setAttribute("for", "modal-description");
    dueDateLabel.setAttribute("for", "modal-dueDate");
    priorityLabel.setAttribute("for", "modal-priority");

    titleLabel.textContent = "Title";
    descriptionLabel.textContent = "Description";
    dueDateLabel.textContent = "Due date";
    priorityLabel.textContent = "Priority";

    let todoTitle = doc.createElement("input");
    let todoDescription = doc.createElement("textarea");
    let todoDueDate = doc.createElement("input");
    let todoPriority = doc.createElement("input");

    todoTitle.setAttribute("value", `${todo.title}`);
    todoDescription.textContent = `${todo.description}`;
    todoDueDate.setAttribute("value", `${todo.dueDate}`);
    todoPriority.setAttribute("value", `${todo.priority}`);

    todoTitle.setAttribute("id", "modal-title");
    todoDescription.setAttribute("id", "modal-description");
    todoDueDate.setAttribute("id", "modal-dueDate");
    todoPriority.setAttribute("id", "modal-priority");

    openTodoModalContent.innerHTML = "";

    openTodoModalContent.appendChild(closeIcon);

    openTodoModalContent.appendChild(titleLabel);
    openTodoModalContent.appendChild(todoTitle);

    openTodoModalContent.appendChild(descriptionLabel);
    openTodoModalContent.appendChild(todoDescription);

    openTodoModalContent.appendChild(dueDateLabel);
    openTodoModalContent.appendChild(todoDueDate);

    openTodoModalContent.appendChild(priorityLabel);
    openTodoModalContent.appendChild(todoPriority);
  };

  return {
    displayTodo,
    addProjectToList,
    hideTodos,
    hideProjects,
    activateDefaultProject,
    openTodo,
  };
})(document);

AppController.createDefaultProject();
AppController.displayProjects();
AppController.displayDefaultProject();
