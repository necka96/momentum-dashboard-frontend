const getBgImage = async () => {
  const getImage = await fetch(
    "https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature"
  );
  if (!getImage.ok) {
    document.body.style.backgroundImage = `url("https://images.unsplash.com/photo-1520962922320-2038eebab146?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8bmF0dXJhbHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60")`;
  }
  const data = await getImage.json();

  document.body.style.backgroundImage = `url(${data.urls.full})`;
  document.getElementById("author").textContent = `By ${data.user.name}`;
};
getBgImage();

function getCurrentTime() {
  const date = new Date();
  document.getElementById("time").textContent = date.toLocaleTimeString(
    "en-us",
    { timeStyle: "short" }
  );
}

setInterval(getCurrentTime, 1000);

const successCallback = async (position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const getWratherData = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=aa7a74c0b91bf54da9fcc12f098b2f5a`
  );
  if (!getWratherData.ok) {
    throw Error("Weather data not available");
  } else {
    const data = await getWratherData.json();
    const tempCelsius = Math.round(data.main.temp) - 273.15;
    const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById("weather").innerHTML = `
                <img src=${iconUrl} />
                <p class="weather-temp">${tempCelsius.toFixed()}º</p>
                <p class="weather-city">${data.name}</p>
            `;
  }
};

const errorCallback = (error) => {
  if (error.code == error.PERMISSION_DENIED) {
    alert(
      "Please enable location services for this website to see the current temperature in your city"
    );
  }
};

if (!navigator.geolocation) {
  alert("Geolocation is not supported by your browser");
} else {
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
}

document.getElementById("toDo").addEventListener("click", () => {
  getToDo();
  document.getElementById("toDoItem").classList.add("active");
});
document.getElementById("close").addEventListener("click", () => {
  document.getElementById("toDoItem").classList.remove("active");
});
const btn = document.getElementById("btn");

const toDoInput = document.getElementById("toDoInput");

const createToDo = async () => {
  const inputValue = toDoInput.value;
  const data = {
    toDo: inputValue,
  };
  const postToDo = await fetch("https://momentumtodo.onrender.com/list/v1/", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (postToDo.ok) {
    const data = await postToDo.json();
    toDoInput.value = "";
    getToDo();
  }
};

btn.addEventListener("click", createToDo);

toDoInput.addEventListener("keyup", (e) => {
  if (event.key === "Enter") {
    createToDo();
    getToDo();
  }
});

const listItems = document.getElementById("list-items");

const getToDo = async () => {
  const getToDoItem = await fetch(
    "https://momentumtodo.onrender.com/list/v1/toDo",
    {
      method: "GET",
    }
  );
  if (getToDoItem.ok) {
    const data = await getToDoItem.json();

    listItems.innerHTML = render(data);
    document.getElementById("toDoItem").classList.add("active");
  }
};

const render = (data) => {
  let html = ``;
  data.map((item) => {
    html += `
   <div id=${item._id}>
    <li ><span class="todo-text">${item.toDo}<span>
     </li> 
      <span class="edit-icon right">&#9998;</span>
      <span class="update-icon hidden right">&#10004;</span> <span class="delete-icon right">&#10008;</span>
   </div>
   `;
  });
  return html;
};

listItems.addEventListener("click", (e) => {
  const target = e.target;
  const parent = target.parentElement;
  const todoId = parent.id;

  if (target.classList.contains("edit-icon")) {
    const todoText = parent.querySelector(".todo-text").textContent;

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("value", todoText);
    parent.querySelector(".todo-text").replaceWith(input);

    parent.querySelector(".edit-icon").classList.add("hidden");
    parent.querySelector(".update-icon").classList.remove("hidden");
  }

  if (target.classList.contains("update-icon")) {
    const updatedTodoText = parent.querySelector("input").value;

    fetch(`https://momentumtodo.onrender.com/list/v1/toDo/${todoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toDo: updatedTodoText }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("I cant update item" + response.status);
        }

        return response.json();
      })
      .then((data) => {
        const newTodoText = document.createElement("span");
        newTodoText.classList.add("todo-text");
        newTodoText.textContent = data.toDo;
        parent.querySelector("input").replaceWith(newTodoText);

        parent.querySelector(".edit-icon").classList.remove("hidden");
        parent.querySelector(".update-icon").classList.add("hidden");
      })
      .catch((error) => {
        console.error(error);
      });
  }
  if (target.classList.contains("delete-icon")) {
    fetch(`https://momentumtodo.onrender.com/list/v1/toDo/delete/${todoId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete item: " + response.status);
        }
        // Remove the deleted item from the list
        parent.remove();
      })
      .catch((error) => {
        console.error(error);
        alert("Failed to delete item: " + error.message);
      });
  }
});

const daysTag = document.querySelector(".days"),
  currentDate = document.querySelector(".current-date"),
  prevNextIcon = document.querySelectorAll(".icons span");

// getting new date, current year and month
let date = new Date(),
  currYear = date.getFullYear(),
  currMonth = date.getMonth();

// storing full name of all months in array
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const renderCalendar = () => {
  let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), // getting first day of month
    lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // getting last date of month
    lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
    lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
  let liTag = "";

  for (let i = firstDayofMonth; i > 0; i--) {
    // creating li of previous month last days
    liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
  }

  for (let i = 1; i <= lastDateofMonth; i++) {
    // creating li of all days of current month
    // adding active class to li if the current day, month, and year matched
    let isToday =
      i === date.getDate() &&
      currMonth === new Date().getMonth() &&
      currYear === new Date().getFullYear()
        ? "active"
        : "";
    liTag += `<li class="${isToday}">${i}</li>`;
  }

  for (let i = lastDayofMonth; i < 6; i++) {
    // creating li of next month first days
    liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
  }
  currentDate.innerText = `${months[currMonth]} ${currYear}`; // passing current mon and yr as currentDate text
  daysTag.innerHTML = liTag;
};
renderCalendar();

prevNextIcon.forEach((icon) => {
  // getting prev and next icons
  icon.addEventListener("click", () => {
    // adding click event on both icons
    // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
    currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

    if (currMonth < 0 || currMonth > 11) {
      // if current month is less than 0 or greater than 11
      // creating a new date of current year & month and pass it as date value
      date = new Date(currYear, currMonth, new Date().getDate());
      currYear = date.getFullYear(); // updating current year with new date year
      currMonth = date.getMonth(); // updating current month with new date month
    } else {
      date = new Date(); // pass the current date as date value
    }
    renderCalendar(); // calling renderCalendar function
  });
});

document.getElementById("calendar").addEventListener("click", () => {
  document.getElementById("wrapper").classList.add("active");
});

document.getElementById("closeCalendar").addEventListener("click", () => {
  document.getElementById("wrapper").classList.remove("active");
});
