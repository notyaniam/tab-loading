// get user details from the local storage if exists
let userDetails = localStorage.getItem("userDetails")
  ? JSON.parse(localStorage.getItem("userDetails"))
  : null;

let taskDetails = localStorage.getItem("taskDetails")
  ? JSON.parse(localStorage.getItem("taskDetails"))
  : [];

const searchInputElement = document.querySelector(".search__input");
const weatherElement = document.querySelector(".weather");
const focusInputElement = document.querySelector(".focus-container__input");
const todoInputElement = document.querySelector(".focus-container__todo");
const activityElement = document.querySelector(".focus-container__activity");
const quoteElement = document.querySelector(".quote");
const quoteTextElement = document.querySelector(".quote__text");
const quoteAuthorElement = document.querySelector(".quote__author");
const contentElement = document.querySelector(".preloader__content");

// update time
setInterval(() => {
  let now = new Date();
  now = now.toLocaleTimeString().substring(0, 5);
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

// listen to double click on the focus input and add role
focusInputElement.addEventListener("dblclick", () => {
  focusInputElement.setAttribute("role", "textbox");
  focusInputElement.setAttribute("contenteditable", true);
});

focusInputElement.addEventListener("focusout", () => {
  if (focusInputElement.textContent === "") {
    // reset to default name if no name detected
    focusInputElement.textContent = userDetails.name;
  }
  // remove editability
  ["role", "contenteditable"].forEach((action) =>
    focusInputElement.removeAttribute(action)
  );
});

// listen to enter on the focus input element
focusInputElement.addEventListener("keydown", (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();
    // update the local storage with new name
    let name = e.target.textContent;
    if (name) {
      name = `${name.charAt(0).toUpperCase()}${name.substring(1)}`;
      // console.log(name);
      userDetails.name = name;
      localStorage.setItem("userDetails", JSON.stringify(userDetails));
    } else {
      // reset to default name if no name detected
      focusInputElement.textContent = userDetails.name;
    }

    // remove editability
    ["role", "contenteditable"].forEach((action) =>
      focusInputElement.removeAttribute(action)
    );
  }
});

// event listener to new tasks addition
todoInputElement.addEventListener("keydown", (e) => {
  // check if the key pressed is enter and prevent default
  if (e.keyCode === 13) {
    e.preventDefault();

    // check if there's any content
    if (e.target.value !== "") {
      // get all current li tags

      const count = activityElement.children.length;
      const task = e.target.value.replace(/\s+/g, " ").trim();
      const content = { elementId: `activity${count + 1}`, task };

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

// function to add new element into the ul
function updateActivityContainer(content, action = 0) {
  const { elementId, task } = content;
  // create a new li element
  const newActivityElement = document.createElement("li");
  newActivityElement.classList.add("focus-container__activity");
  newActivityElement.innerHTML = `
    <label for=${elementId} class="checkmark">
        <input type="checkbox"class='activity-input' name=${elementId} id=${elementId} />
        <span>${task}</span>
    </label>`;

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
  document.querySelectorAll(".checkmark").forEach((el) => {
    // add individual task listeners by refiltering with their new ids
    let checkmarkElement = el.querySelector(".activity-input");
    checkmarkElement = document.getElementById(checkmarkElement.id);

    // initialize element listener
    checkmarkElement.addEventListener("change", (e) => {
      // monitor change in the element and update local storage
      const { id } = checkmarkElement;
      if (checkmarkElement.checked) {
        // update local storage item status
        taskDetails = taskDetails.map((task) =>
          task.elementId === id ? { ...task, status: true } : task
        );
        console.log(taskDetails);
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
    });
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
    taskDetails.forEach((task) => {
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

  const url = `http://localhost:5000/api/weather?loc=${city}`;
  xhr.open("get", url, true);
  xhr.send();
}

// function to get random quote
function fetchRandomQuote() {
  const xhr = new XMLHttpRequest();
  xhr.responseType = "json";
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // console.log(xhr.response);
        updateQuote(xhr.response);
      }
    }
  };

  const url = "http://localhost:5000/api/quote";
  xhr.open("get", url, true);
  xhr.send();
}

// function to load weather into the dom
function updateWeather(response) {
  // update the temperature, icon, location
  const temp = response.main.temp;
  const { icon, description } = response.weather[0];
  const loc = response.name;

  weatherElement.title = description;
  weatherElement.querySelector(".weather__temp").textContent = temp;
  const iconElement = weatherElement.querySelector(".weather__icon");
  iconElement.src = `http://openweathermap.org/img/w/${icon}.png`;

  weatherElement.querySelector(".weather__location").textContent = loc;
}

// function to update the quote and author
function updateQuote(response) {
  const { q: quote, a: author } = response[0];
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
  window.location.href = `https://www.google.com/search?q=${refinedRequest}`;
}
