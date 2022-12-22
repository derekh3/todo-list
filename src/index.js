import "./style.css";
import Close from "./close.svg";

function todoFactory(title, description, dueDate, priority, completed = false) {
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
    completed,
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
  let projects = {};
  let currentProject = "default";
  let projectsCounter = 1;
  const createDefaultProject = () => {
    const todo1 = todoFactory(
      "todo 1",
      "test project 1",
      "July 1, 2023",
      "medium",
      false
    );
    const todo2 = todoFactory(
      "todo 2",
      "test project 2",
      "July 2, 2023",
      "high",
      false
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
    populateStorage();
  };

  const deleteProject = (projectKey) => {
    if (currentProject === projectKey) {
      DOMController.hideTodos();
    }
    delete projects[projectKey];
    DOMController.hideProjects();
    displayProjects();
    populateStorage();
  };

  const displayDefaultProject = () => {
    switchProject("default");
    DOMController.activateDefaultProject();
    // displayTodos("default");
  };

  const displayProjects = () => {
    for (var key in projects) {
      if (projects.hasOwnProperty(key)) {
        DOMController.addProjectToList(key, projects[key].name, currentProject);
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
    populateStorage();
  };

  const deleteTodo = (projectKey, todoIndex) => {
    projects[projectKey].todoArray.splice(todoIndex, 1);
    DOMController.hideTodos();
    displayTodos(projectKey);
    populateStorage();
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
    populateStorage();
  };

  const toggleComplete = (projectKey, todoIndex) => {
    projects[projectKey].todoArray[todoIndex].completed =
      projects[projectKey].todoArray[todoIndex].completed === true
        ? false
        : true;
    console.log(projects[projectKey].todoArray[todoIndex].completed);
    populateStorage();
  };

  const populateStorage = () => {
    if (StorageController.storageAvailable("localStorage")) {
      localStorage.setItem("projects", JSON.stringify(projects));
      console.log("storing");
      console.log(projects);
      localStorage.setItem("currentProject", currentProject);
      console.log("Getting");
      console.log(JSON.parse(localStorage.getItem("projects")));
      localStorage.setItem("projectsCounter", projectsCounter);
    }
  };

  const retrieveStorage = () => {
    console.log(localStorage.getItem("projects"));
    projects = JSON.parse(localStorage.getItem("projects"));
    currentProject = localStorage.getItem("currentProject");
    console.log(localStorage.getItem("currentProject"));
    projectsCounter = localStorage.getItem("projectsCounter");
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
    toggleComplete,
    populateStorage,
    retrieveStorage,
  };
})();

const DOMController = ((doc) => {
  let checkboxCounter = 0;

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

  const addProjectToList = (key, projectName, currentProject) => {
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
    // if (projectsList.innerHTML === "") {
    if (key === currentProject) {
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
    todoTitle.classList.add("todo-title");
    let todoDescription = doc.createElement("p");
    todoDescription.classList.add("card-description");
    let todoDueDate = doc.createElement("p");
    todoDueDate.classList.add("todo-dueDate");
    let todoPriority = doc.createElement("p");
    todoPriority.classList.add("todo-priority");

    let todoCheckboxContainer = doc.createElement("div");
    todoCheckboxContainer.classList.add("checkbox-container");
    let todoCheckboxLabel = doc.createElement("label");
    todoCheckboxLabel.setAttribute("for", `checkbox-${checkboxCounter}`);
    todoCheckboxLabel.textContent = "Completed:";
    let todoCheckbox = doc.createElement("input");
    todoCheckbox.classList.add("checkbox");
    todoCheckbox.setAttribute("type", "checkbox");
    todoCheckbox.setAttribute("id", `checkbox-${checkboxCounter}`);
    checkboxCounter++;

    console.log(todo.title);
    console.log(todo.completed);
    if (todo.completed) {
      todoCheckbox.checked = true;
    } else {
      todoCheckbox.checked = false;
    }
    todoCheckbox.onclick = () => {
      AppController.toggleComplete(projectKey, todoIndex);
    };

    todoCheckboxContainer.appendChild(todoCheckboxLabel);
    todoCheckboxContainer.appendChild(todoCheckbox);

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
    todoElement.appendChild(todoCheckboxContainer);
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

const StorageController = (() => {
  function storageAvailable(type) {
    let storage;
    try {
      storage = window[type];
      const x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        // everything except Firefox
        (e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === "QuotaExceededError" ||
          // Firefox
          e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage &&
        storage.length !== 0
      );
    }
  }

  return { storageAvailable };
})();

let loadFromStorage = false;
if (StorageController.storageAvailable("localStorage")) {
  let obj = JSON.parse(localStorage.getItem("projects"));
  if (obj) {
    let project = obj[Object.keys(obj)[0]];
    if (Object.hasOwn(project, "todoArray")) {
      loadFromStorage = true;
    }
  }
}

if (loadFromStorage) {
  AppController.retrieveStorage();
  AppController.displayProjects();
  AppController.displayTodos();
} else {
  AppController.createDefaultProject();
  AppController.displayProjects();
  AppController.displayDefaultProject();
}
