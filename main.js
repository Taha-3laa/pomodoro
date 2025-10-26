let mins = document.querySelector(".timer .mins");
let secs = document.querySelector(".timer .secs");

let btnStart = document.querySelector("button.start");
let btnReset = document.querySelector("button.reset");
let btnSettings = document.querySelector(".header span.settings");

let settings = document.querySelector(".header div.settings");
let settingsOptions = document.querySelectorAll(".settings-options li");
let options = document.querySelectorAll(".options > div");

let settingsObj = {};
settingsObj = JSON.parse(localStorage.getItem("Settings"));
if (!settingsObj) {
  settingsObj = {
    durations: {
      pomodoro: 25,
      shortBreak: 10,
      longBreak: 15,
    },
    seasions: {
      seasionsDurations: [],
      Nums: 4,
    },
    volume: true,
    background:
      "linear-gradient(to top, rgb(67, 67, 67) 0%, rgb(0, 0, 0) 100%)",
    theme: "white",
  };
}

seasions = settingsObj.seasions;
let durations = settingsObj.durations;

// sounds
let sounds = [new Audio("sounds/break.mp3"), new Audio("sounds/pomo.mp3")];

function playSound(type) {
  if (settingsObj.volume) {
    sounds.forEach((s) => {
      if (s.src.endsWith(`${type}.mp3`))
        s.play();
    });
  }
}

window.addEventListener("beforeunload", () => {
  localStorage.setItem("Settings", JSON.stringify(settingsObj));
});

//update all Controls
function updateControls() {

  // update theme & background 
  document.documentElement.style.setProperty("--themeColor", settingsObj.theme);
  document.documentElement.style.setProperty("--background",settingsObj.background);
  //Update Values of All Duration Controls
  durationsContorls[0].value = durations.pomodoro;
  durationsContorls[1].value = durations.shortBreak;
  durationsContorls[2].value = durations.longBreak;

  //Update Pomo
  mins.dataset.time = durations.pomodoro;
  mins.innerText = durations.pomodoro;
  //Update Seasions
  seasionsinput.value = seasions.Nums;

  //Update Volume
  volumeinput.checked = settingsObj.volume;

  //update Background
  backgroundsOptions.forEach((bg) => {
    if (settingsObj.background.includes("#")) {
      backgroundsOptions.item(3).classList.add("active");
      return;
    }
    bg.classList.toggle("active", bg.dataset.bg == settingsObj.background);
  });

  //update Theme
  themes.forEach((theme) => {
    theme.classList.toggle("active", theme.dataset.color == settingsObj.theme);
  });
}

//duration controls
let isDurationsChanged = false;
let durationsContorls = document.querySelectorAll(".durations input");
durationsContorls.forEach((input) => {
  input.addEventListener("change", (event) => {
    if (event.target.id == "pomodoro") durations.pomodoro = event.target.value;
    else if (event.target.id == "shortbreak")
      durations.shortBreak = event.target.value;
    else durations.longBreak = event.target.value;
    isDurationsChanged = true;
  });
});

let isSeasionsChanged = false;
let seasionsinput = options[1].children[0].children[1];
seasionsinput.addEventListener("change", () => {
  isSeasionsChanged = seasionsinput.value != seasions.Nums;
});

let volumeinput = options[2].children[0].children[1];
volumeinput.addEventListener("change", () => {
  settingsObj.volume = volumeinput.checked;
});

// backgrounds
let backgroundsOptions = document.querySelectorAll(".backgrounds li");
backgroundsOptions.forEach((background) => {
  background.addEventListener("click", (event) => {
    if (background.querySelector("input[type='color']")) return;

    backgroundsOptions.forEach((background) => {
      background.classList.remove("active");
    });

    event.currentTarget.classList.add("active");
    selectBackground(event);
  });
});

let colorPicker = document.querySelector("input[type='color']");
colorPicker.addEventListener("input", selectBackground);

function selectBackground(event) {
  let bgValue;
  if (event.currentTarget === colorPicker) {
    bgValue = colorPicker.value;
    backgroundsOptions.forEach((ele) => ele.classList.remove("active"));
    colorPicker.parentElement.classList.add("active");
    colorPicker.parentElement.dataset.bg = bgValue;
  } else bgValue = event.currentTarget.dataset.bg;
  settingsObj.background = bgValue;
}

// themes
let themes = document.querySelectorAll(".theme span");
themes.forEach((theme) => {
  theme.addEventListener("click", (event) => {
    themes.forEach((theme) => {
      theme.classList.remove("active");
    });
    event.currentTarget.classList.add("active");
    settingsObj.theme = event.currentTarget.dataset.color;
  });
});

function createSeasionComponent(status) {
  let li = document.createElement("li");
  let icon = document.createElement("i");
  icon.className = "fa-solid fa-fire";

  if (status) icon.style.setProperty("color", "var(--primaryColor)");

  li.appendChild(icon);
  return li;
}

let progressCircle = document.querySelector("circle");
let circumference = 2 * Math.PI * parseInt(progressCircle.getAttribute("r"));

let progress;
function increaseProgress() {
  progress = countSecs / (parseInt(mins.dataset.time) * 60);
  progressCircle.style.strokeDashoffset = circumference * (1 - progress);
}

settingsOptions.forEach((s) => {
  s.addEventListener("click", showOptions);
});

function showOptions(event) {
  settingsOptions.forEach((s) => {
    if (s != event.target) s.classList.remove("active");
  });
  event.target.classList.add("active");

  options.forEach((o) => {
    o.classList.toggle(
      "active",
      o.classList.contains(event.target.innerText.toLowerCase())
    );
  });
}

let seasionslist = document.querySelector("ul.seasions");
function addSeasions() {
  let seasionsNums = seasions.Nums;
  for (let i = 0; i < seasionsNums; i++) {
    let s = {};
    // add prev seasionstimer.dataset.mins
    if (seasions && seasions.seasionsDurations[i]) {
      s = seasions.seasionsDurations[i];
    } else {
      // open first time
      s.pomodoro = durations.pomodoro;
      s.break = durations.shortBreak;
      s.done = false;
      if (i == seasionsNums - 1) s.break = durations.longBreak;
      seasions.seasionsDurations.push(s);
    }
    seasionslist.appendChild(createSeasionComponent(s.done));
  }
}
// setup
updateControls();
addSeasions();

let countSeasionsDone = 0;
function updateSeasionsDurations() {
  for (let i = 0; i < seasions.Nums; i++) {
    seasions.seasionsDurations[i].pomodoro = durations.pomodoro;
    seasions.seasionsDurations[i].break = durations.shortBreak;
    if (i == seasions.Nums - 1)
      seasions.seasionsDurations[i].break = durations.longBreak;
  }
  if (btnStart.dataset.status == "play") {
    updateCurrentSeasion();
  }
}

function updateSeasions() {
  for (let i =0 ;i <seasionsinput.value; i++) {
    if (seasionsinput.value > seasions.Nums) addNewSeasion();
    else if (seasionsinput.value < seasions.Nums) deleteSeasion();
  }
}

function applyNewSettings() {
  if (isDurationsChanged) updateSeasionsDurations();
  if (isSeasionsChanged) updateSeasions();
  document.documentElement.style.setProperty("--themeColor", settingsObj.theme);
  document.documentElement.style.setProperty("--background",settingsObj.background);
  isSeasionsChanged = false;
  isDurationsChanged = false;
}

// buttons
let btnSave = document.querySelector(".settings-buttons button");
btnSave.addEventListener("click", () => {
  btnSettings.click();
  applyNewSettings();
  localStorage.setItem("Settings", JSON.stringify(settingsObj));
});

btnSettings.addEventListener("click", () => {
  settings.classList.toggle("active");
});

function addNewSeasion() {
  let newSeasion = {};
  let lastSeasion = seasions.seasionsDurations[seasions.Nums - 1];
  Object.assign(newSeasion, lastSeasion);
  lastSeasion.break = durations.shortBreak;
  seasions.seasionsDurations.push(newSeasion);
  seasionslist.appendChild(createSeasionComponent());
  ++seasions.Nums;
}

function deleteSeasion() {
  let prevLastSeasion = seasions.seasionsDurations[seasions.Nums - 2];
  let lastSeasion = seasions.seasionsDurations[seasions.Nums - 1];
  prevLastSeasion.break = lastSeasion.break;
  seasions.seasionsDurations.pop();
  seasionslist.querySelector("li:last-child").remove();
  --seasions.Nums;
}

btnStart.addEventListener("click", startSeasion);

function changeBtnState() {
  if (btnStart.dataset.status == "play") {
    btnStart.dataset.status = "pause";
    btnStart.children[0].classList.replace("fa-play", "fa-pause");
  } else {
    btnStart.dataset.status = "play";
    btnStart.children[0].classList.replace("fa-pause", "fa-play");
  }
}

function getLastSeasion() {
  for (let i = 0 ; i<seasions.Nums;  i++) {
    if (!seasions.seasionsDurations[i].done) {
      return seasions.seasionsDurations[i];
    }
  }
}

let currentSeasion = getLastSeasion();
function startSeasion() {
  // if (currentSeasion.done) {
  //   mins.dataset.status = 'b';
  // }
  
  if (btnStart.dataset.status == "play") timer.run();
  else timer.stop();
  
  changeBtnState();
}

function updateCurrentSeasion() {
  // pomodoro
  if (!currentSeasion.done) {
    mins.dataset.time = currentSeasion.pomodoro;
    timer.mins = currentSeasion.pomodoro;
  }
  // break
  else {
    mins.dataset.time = currentSeasion.break;
    timer.mins = currentSeasion.break;
  }
  updateDurationUI();
}

function resetSeasions() {
  for (let i = 0; i < seasions.Nums; i++) {
    seasions.seasionsDurations[i].done = false;
    markSeasion(i, false);
  }
  countSeasionsDone = 0;
  currentSeasion = seasions.seasionsDurations[0];
}

function markSeasion(index, done) {
  seasionslist.children[index].style.
  setProperty("color", done ? "var(--primaryColor)" : "var(--themeColor)");
}

function updateInterval() {
  if (mins.dataset.status == "f") {
    playSound("pomo");
    markSeasion(countSeasionsDone, true);
    mins.dataset.status = 'b';
    mins.dataset.time = currentSeasion.break;
    currentSeasion.done = true;
  } else {
    playSound("break");
    if (++countSeasionsDone == seasions.Nums) {
      console.log(countSeasionsDone,seasions.Nums)
      resetSeasions();
    }
    currentSeasion = seasions.seasionsDurations[countSeasionsDone];
    mins.dataset.time = currentSeasion.pomodoro;
    mins.dataset.status = 'f';
  }
}

function twoDigits(num) {
  return num < 10 ? `0${num}` : `${num}`;
}

function updateDurationUI() {
  console.log(timer.mins, timer.secs);
  mins.innerText = twoDigits(timer.mins);
  secs.innerText = twoDigits(timer.secs);
}

let countSecs = 0;
let timerID;
let timer = {
  mins: parseInt(mins.dataset.time),
  secs: 0,
  isFinished: false,
  run() {
    timerID = setInterval(() => {
      if (this.secs == 0) {
        if (this.mins == 0) {
          // timer is finished
          this.isFinished = true;
          updateInterval();
          this.reset();
          return;
        }
        --this.mins;
        this.secs = 59;
      } else --this.secs;
      ++countSecs;
      increaseProgress();
      // update UI
      updateDurationUI();
    }, 1000);
  },
  stop() {
    clearTimeout(timerID);
  },
  reset() {
    this.secs = 0;
    this.mins = parseInt(mins.dataset.time);
    updateDurationUI();
    this.stop();
    this.isFinished = false;
    countSecs = 0;
    progressCircle.style.strokeDashoffset = circumference;
    btnStart.dataset.status = "pause";
    changeBtnState();
  },
};

btnReset.addEventListener("click", () => timer.reset());
