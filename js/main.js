// get user details from the local storage if exists
let userDetails = localStorage.getItem("userDetails")
  ? JSON.parse(localStorage.getItem("userDetails"))
  : null;

let taskDetails;

taskDetailsLoader();

const searchInputElement = document.querySelector(".search__input");
const weatherElement = document.querySelector(".weather");
const weatherLocationElement = document.querySelector(".weather__location");
const focusInputElement = document.querySelector(".focus-container__input");
const finishBtnElement = document.querySelector(".clear-btn");
const todoInputElement = document.querySelector(".focus-container__todo");
const activityElement = document.querySelector(".focus-container__activity");
const quoteContainerElement = document.querySelector(".quote-container");
const quoteElement = document.querySelector(".quote");
const quoteTextElement = document.querySelector(".quote__text");
const quoteAuthorElement = document.querySelector(".quote__author");
const contentElement = document.querySelector(".preloader__content");

// update time
setInterval(() => {
  let now = new Date();
  now = new Date(now).toLocaleTimeString("en-GB").substring(0, 5);
  document.querySelector(".focus-container__time").textContent = now;
  document.querySelectorAll(".focus-container__period").forEach((el) => {
    el.textContent = getPeriod(now);
  });
}, 1000);

// display preloader before site fully loads
document.addEventListener("DOMContentLoaded", () => {
  // provide a form for the user to enter details
  if (!userDetails) {
    document.querySelector(".preloader__text").remove();
    contentElement.style.visibility = "visible";
    getUserData();
  }

  // get weather and update user details
  if (userDetails) {
    contentElement.remove();
    const name = userDetails.name;
    const city = userDetails.city;

    // update the user's name
    focusInputElement.textContent = name;
    searchInputElement.value = "";
    fetchWeather(city);

    // update weather periodically
    setInterval(() => {
      fetchWeather(city);
    }, 1000 * 60 * 30);

    fetchRandomQuote();
    window.addEventListener("load", () => {
      document.querySelector(".preloader").remove();
    });

    // update existing tasks from local storage
    if (taskDetails.length) {
      // load the tasks from the local storage
      activityCRUD("read");
      // map all input elements to change listener
      updateTotalListeners();
    }
    // manage the clear finished button status
    enableClearBtn();
    requestWideScreen();
  }
});

// monitor search input and redirect to google on enter
searchInputElement.addEventListener("keydown", (e) => {
  // check if keycode is enter and prevent enter default
  if (e.keyCode === 13) {
    e.preventDefault();
    searchRequest(e.target.value);
  }
});

const detailsElements = [focusInputElement, weatherLocationElement];

// MANAGING THE USER DETAILS ELEMENTS
// listen to double click on the focus input and add role
detailsElements.forEach((element) => {
  // enabling editing on the elements
  element.addEventListener("dblclick", () => {
    element.setAttribute("role", "textbox");
    element.setAttribute("contenteditable", true);

    // move the cursor to the end of the element
    setCursorToEnd(element);
  });

  // disabling edit on the elements
  element.addEventListener("focusout", () => {
    // remove editability
    ["role", "contenteditable"].forEach((action) =>
      element.removeAttribute(action)
    );

    // reset to default name if no name detected
    if (element.textContent === "") {
      if (element.querySelector(".weather__location")) {
        element.textContent = userDetails.city;
      } else {
        element.textContent = userDetails.name;
      }
    }
  });

  // updating the localstorage with the new details
  // listen to enter on the focus input element
  element.addEventListener("keydown", (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      let elClasses = [...element.classList];
      // update the local storage with new name
      let newText = e.target.textContent;

      if (newText) {
        newText = `${newText.charAt(0).toUpperCase()}${newText.substring(1)}`;
        console.log(elClasses.includes("weather__location"));
        // console.log(name);
        if (elClasses.includes("weather__location")) {
          userDetails.city = newText;
          fetchWeather(newText);
        } else {
          userDetails.name = newText;
        }
        localStorage.setItem("userDetails", JSON.stringify(userDetails));
      } else {
        // reset to default name if no name detected
        if (elClasses.includes("weather__location")) {
          element.textContent = userDetails.city;
        } else {
          element.textContent = userDetails.name;
        }
      }

      // remove editability
      ["role", "contenteditable"].forEach((action) =>
        element.removeAttribute(action)
      );
    }
  });
});

// event listener to new tasks addition
todoInputElement.addEventListener("keydown", (e) => {
  // check if the key pressed is enter and prevent default
  if (e.keyCode === 13) {
    e.preventDefault();

    // check if there's any content
    if (e.target.value !== "") {
      const elementId = Math.ceil(Math.random() * 10000).toString();
      // get all current li elements

      const task = e.target.value.replace(/\s+/g, " ").trim();
      const content = { elementId: `tsk-${elementId}`, task };

      // add the content to the ul
      updateActivityContainer(content);
    }

    // reset the input element
    todoInputElement.value = "";
    // remove focus from the element
    todoInputElement.blur();
    // update listeners
    updateTotalListeners();
  }
});

// monitor screen size and display text as needed
window.addEventListener("resize", requestWideScreen);

// event listener to show the author on mouse over
quoteElement.addEventListener("mouseover", () => {
  quoteAuthorElement.style.transform = "translateY(0)";
  quoteAuthorElement.style.opacity = "1";
});

// event listener to hide author on mouse out
quoteElement.addEventListener("mouseout", () => {
  quoteAuthorElement.style.transform = "translateY(-40%)";
  quoteAuthorElement.style.opacity = "0";
});

finishBtnElement.addEventListener("click", () => {
  deleteFinishedTasks();
});

// task details loader
function taskDetailsLoader() {
  taskDetails = localStorage.getItem("taskDetails")
    ? JSON.parse(localStorage.getItem("taskDetails"))
    : [];
}

// function to add new element into the ul
function updateActivityContainer(content, action = 0) {
  const { elementId, task, date } = content;
  const previousDate = !date ? new Date() : new Date(date);
  const now = new Date();
  let taskAge = (now - previousDate) / (1000 * 60 * 60 * 24);
  taskAge = Math.floor(taskAge);

  // create a new li element
  const newActivityElement = document.createElement("li");
  newActivityElement.classList.add("focus-container__activity");
  newActivityElement.innerHTML = `
    <label for=${elementId} class="checkmark">
        <input type="checkbox"class='activity-input' name=${elementId} id=${elementId} />
        <span>${task}</span>
    </label>
    <span>Age: ${taskAge} ${taskAge === 1 ? "day" : "days"}</span>
    <a href="#" class='focus-container__trash ${elementId}'>
      <i class="material-icons small">remove_circle_outline</i>
    </a>
    `;

  // add the element to the ul parent
  activityElement.prepend(newActivityElement);
  if (action) return;

  // add the item to local storage
  activityCRUD("add", content);

  return;
}

// update the listeners on new activities
function updateTotalListeners() {
  // reload all tasks
  // console.log(document.querySelectorAll(".checkmark"));
  document.querySelectorAll(".checkmark").forEach((el) => {
    // add individual task listeners by refiltering with their new ids
    let checkmarkElement = el.querySelector(".activity-input");
    checkmarkElement = document.getElementById(checkmarkElement.id);
    const deleteTagElement = document.querySelector(`.${checkmarkElement.id}`);

    // initialize element listener
    checkmarkElement.addEventListener("change", (e) => {
      // monitor change in the element and update local storage
      const { id } = checkmarkElement;
      if (checkmarkElement.checked) {
        // update local storage item status
        taskDetails = taskDetails.map((task) =>
          task.elementId === id ? { ...task, status: true } : task
        );
        // console.log(taskDetails);
        localStorage.setItem("taskDetails", JSON.stringify(taskDetails));
        // update the task with strike through class
        el.classList.add("focus-container--checked");
      } else {
        // update local storage item status
        taskDetails = taskDetails.map((task) =>
          task.elementId === id ? { ...task, status: false } : task
        );
        localStorage.setItem("taskDetails", JSON.stringify(taskDetails));
        // remove the strike through class from the element
        el.classList.remove("focus-container--checked");
      }
      enableClearBtn();
    });

    // monitor delete requests from the item
    // tag the element with an attribute and add event if missing
    if (deleteTagElement.getAttribute("listener") !== "true") {
      deleteTagElement.setAttribute("listener", "true");
      deleteTagElement.addEventListener("click", () => {
        // get element id from the class list
        const m = [...deleteTagElement.classList].filter((cl) =>
          cl.includes("tsk")
        );
        // evaluate if class exists and remove
        if (m.length) {
          activityCRUD("del", { elementId: m[0] });
        }
      });
    }
  });
}

// function to manage activities local storage CRUD
function activityCRUD(action, content = null) {
  // initialize task details array contains content
  taskDetails = taskDetails ? taskDetails : [];
  if (action === "read") {
    // if there are no tasks return
    if (!taskDetails.length) return;

    // loop through the tasks and add to the container
    taskDetails.sort((a, b) => a.status < b.status);
    taskDetails.forEach((task) => {
      // check if the item is soft deleted
      if (task.status && task.trash) {
        return;
      }

      // update the task container
      updateActivityContainer(task, 1);
      // select the element and update checked status
      if (task.status) {
        const inputElement = document.getElementById(task.elementId);
        inputElement.checked = true;
        // add strike through class to the label element
        inputElement
          .closest(".checkmark")
          .classList.add("focus-container--checked");
      }
    });
  }

  // evaluate what action is being requested
  if (action === "add") {
    // get the content from the item passed
    const { elementId, task } = content;
    // create the new object for the local storage
    const newActivity = { elementId, task, status: false, date: new Date() };
    // add the object to the task details and save to local storage
    taskDetails.push(newActivity);
    localStorage.setItem("taskDetails", JSON.stringify(taskDetails));
    return;
  }

  // handle delete request
  if (action === "del") {
    // get element id from the content object
    const { elementId } = content;
    // get parent li and remove
    console.log(elementId);
    const label = document.getElementById(elementId).parentElement;

    label.parentElement.remove();
    // remove from the local storage
    taskDetails = taskDetails.filter((item) => item.elementId !== elementId);
    localStorage.setItem("taskDetails", JSON.stringify(taskDetails));
    return;
  }
}

// function to add user data to local storage
function getUserData() {
  const userForm = document.getElementById("userDetails");
  userForm.addEventListener("submit", (e) => {
    // prevent default action
    e.preventDefault();

    // check if all fields have been filled
    const name = document.getElementById("userName").value;
    const city = document.getElementById("city").value;

    if (!name || !city) {
      const errorElement = document.createElement("small");
      errorElement.classList.add("preloader__error");
      errorElement.innerHTML = "All fields are required.";
      userForm.appendChild(errorElement);
      return;
    } else {
      userDetails = { name, city };
      localStorage.setItem("userDetails", JSON.stringify(userDetails));
      location.reload();
    }
  });
}

// move the cursor to end on content editable section
function setCursorToEnd(element) {
  // selecting the element through doc range
  const range = document.createRange();
  // selecting entire contents within the range of the element
  range.selectNodeContents(element);
  // collapse range to end point [false means to the end of the content]
  range.collapse(false);

  // get the selection and make changes
  const selection = window.getSelection();
  // removing any selection made
  selection.removeAllRanges();
  // making the selected range visible
  selection.addRange(range);
}

// function to add text requesting wider screen viewer
function requestWideScreen() {
  // get the notice element from the DOM
  const viewPortElement = document.getElementById("screen-viewer");
  // get quote container CSS styles
  const styles = window.getComputedStyle(quoteContainerElement);
  // get status of the visibility for the container
  const visibleStatus = styles.getPropertyValue("visibility");
  // get parent element for the notice
  const viewPortParent = viewPortElement.parentElement;

  // evaluate the status of the quote container visibility
  if (visibleStatus === "hidden") {
    // add notice to the DOM
    viewPortElement.innerHTML =
      "Consider viewing on a larger screen or maximum window";
    viewPortParent.classList.add("focus-container__viewport");
  } else {
    // remove notice from the DOM
    viewPortElement.innerHTML = "";
    // loop through in case the DOM loaded in small screen
    viewPortParent.classList.forEach((el) =>
      viewPortParent.classList.remove(el)
    );
  }
}

// function to enable or disable the finished button
function enableClearBtn() {
  // initializing the status counter
  let finishedCount = 0;
  // reloading the task details from the local storage
  taskDetailsLoader();
  // evaluating if task details has content
  if (taskDetails.length) {
    // looping through the array checking for status
    taskDetails.forEach(
      (item) => item.status && !item.trash && finishedCount++
    );
  }

  // evaluating if the counter changed
  if (finishedCount) {
    finishBtnElement.disabled = false;
  } else {
    finishBtnElement.disabled = true;
  }
}

// manage button click on the clear finished button
function deleteFinishedTasks() {
  let updatedTaskDetails;
  // soft delete tasks
  updatedTaskDetails = taskDetails.map((task) => {
    // check the status and append the trash to object
    if (task.status) {
      task.trash = true;
      return task;
    }
    // ignore if not for delete
    return task;
  });

  // save to the local storage
  localStorage.setItem("taskDetails", JSON.stringify(updatedTaskDetails));
  // clear the to do list UL
  activityElement.innerHTML = "";
  // read from the local storage content just saved
  activityCRUD("read");
  // re-populate listeners
  updateTotalListeners();
  // recheck the status of the clear button to disable it
  enableClearBtn();
}

// function to get weather
function fetchWeather(city) {
  const xhr = new XMLHttpRequest();
  xhr.responseType = "json";
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        updateWeather(xhr.response);
      }
    }
  };

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=806c1bffaa77dd82ca890c74f316c86b`;
  xhr.open("get", url, true);
  xhr.send();
}

// function to get random quote
async function fetchRandomQuote() {
  const url = "https://api.quotable.io/random";
  const response = await fetch(url);
  const data = await response.json();
  // console.log(data);
  updateQuote(data);
}

// function to load weather into the dom
function updateWeather(response) {
  // update the temperature, icon, location
  const temp = response.main.temp;
  const { icon, description } = response.weather[0];
  const loc = response.name;

  weatherElement.querySelector(".weather__value").title = description;
  weatherElement.querySelector(".weather__temp").textContent = temp;
  const iconElement = weatherElement.querySelector(".weather__icon");
  iconElement.src = `http://openweathermap.org/img/w/${icon}.png`;

  weatherElement.querySelector(".weather__location").textContent = loc;
}

// function to update the quote and author
function updateQuote(data) {
  const { content: quote, author: author } = data;
  quoteTextElement.textContent = quote;
  quoteAuthorElement.textContent = author;
}

// manage the times of the day and greetings
function getPeriod(time) {
  const hour = time.substring(0, 2);
  switch (true) {
    case hour >= 18:
      return "evening";
    case hour >= 12:
      return "afternoon";
    case hour >= 0:
      return "morning";
  }
}

// function to redirect to google search
function searchRequest(request) {
  const refinedRequest = request.replace(/\s+/g, " ").trim().replace(" ", "+");
  window.open(`https://www.google.com/search?q=${refinedRequest}`, "_blank");
  searchInputElement.value = "";
}
