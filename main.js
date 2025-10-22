let mins = document.querySelector(".timer .mins");
let secs = document.querySelector(".timer .secs");

let btnStart = document.querySelector("button.start");
let btnReset = document.querySelector("button.reset");

let btnSettings = document.querySelector(".header span.settings");
let settings = document.querySelector(".header div.settings");
let settingsOptions = document.querySelectorAll(".settings-options li");
let options = document.querySelectorAll(".options > div");

// custom mins event 
mins.addEventListener("minsChanged",()=>{
  console.log(mins.innerText, mins.dataset.time);
  mins.innerText = mins.dataset.time;
  console.log(mins.innerText, mins.dataset.time);
});


let settingsObj = {
  Durations: {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  },
  seasions: 4,
  volume: true,
  backgroundSelected: null,
  theme: "white",
  UpdateSettings () {
    // update durations 
    mins.dataset.time = this.Durations.pomodoro;
    const minsChanged = new CustomEvent("minsChanged");
    mins.dispatchEvent(minsChanged);

    document.documentElement.style.setProperty("--themeColor",this.theme);
    document.documentElement.style.setProperty("--background",this.backgroundSelected);
  }
};

let durationsContorls = document.querySelectorAll(".durations input");
  durationsContorls.forEach(input => {
    input.addEventListener("change", (event)=>{
      if (event.target.id == 'pomodoro') 
        settingsObj.Durations.pomodoro = event.target.value;
      else if (event.target.id == 'shortbreak')
        settingsObj.Durations.shortBreak = event.target.value;
      else 
        settingsObj.Durations.longBreak = event.target.value;
    });
})

let seasionsinput = options[1].children[0].children[1];
seasionsinput.addEventListener("change",()=>{
  settingsObj.seasions = seasionsinput.value;
})

let volumeinput = options[2].children[0].children[1];
volumeinput.addEventListener("change",()=>{
  settingsObj.volume = volumeinput.checked;
})


// backgrounds 
let backgroundsOptions = document.querySelectorAll(".backgrounds li");
backgroundsOptions.forEach(background => {
  background.addEventListener("click",(event)=>{

    if (background.querySelector("input[type='color']")) return;
    
    backgroundsOptions.forEach(background =>{
      background.classList.remove("active");
    })
    
    event.currentTarget.classList.add("active");
    selectBackground(event);
  })
})

let colorPicker = document.querySelector("input[type='color']");
colorPicker.addEventListener("change",selectBackground);

function selectBackground (event) {
  let bgValue;
  if (event.currentTarget === colorPicker) {
    backgroundsOptions.forEach(ele => ele.classList.remove("active"));   
    colorPicker.parentElement.classList.add("active");
    bgValue = colorPicker.value;
    colorPicker.parentElement.dataset.bg = bgValue;
  }else
    bgValue = event.currentTarget.dataset.bg;
    settingsObj.backgroundSelected = bgValue;
}

// theme 
let themes = document.querySelectorAll(".theme span");
themes.forEach(theme => {
  theme.addEventListener("click",(event) =>{
    themes.forEach(theme => { theme.classList.remove("active")})
    event.currentTarget.classList.add("active");
    console.log(event.currentTarget.dataset.color);
    settingsObj.theme = event.currentTarget.dataset.color;
  })
})

let btnSave = document.querySelector(".settings-buttons button");
//apply all settings
btnSave.addEventListener("click", () => {
  settingsObj.UpdateSettings();
});

btnSettings.addEventListener("click", () => {
  settings.classList.toggle("active");
});

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

function twoDigits(num) {
  return num < 10 ? `0${num}` : `${num}`;
}

function updateDurationUI() {
  console.log(timer.mins,timer.secs)
  mins.innerText = twoDigits(timer.mins);
  secs.innerText = twoDigits(timer.secs);
}

let countSecs = 0;
let timerID;
let timer = {
  mins: 0,
  secs: 0,
  isFinished: false,
  run() {
    if (!this.isFinished) {
        this.mins = parseInt(mins.dataset.time);
        console.log(this.mins,this.secs);
      timerID = setInterval(() => {
        if (this.secs == 0) {
          if (this.mins == 0) {
            // timer is finished
            console.log("time is finished ");
            this.isFinished = true;
            clearInterval(timerID);
            return;
          }
          --this.mins;
          this.secs = 59;
        } else 
        --this.secs;
        ++countSecs;
        increaseProgress();
        // update UI
        updateDurationUI();
      }, 1000);
    }
  },
  stop() {
    clearTimeout(timerID);
  },
  reset() {
    this.secs = 0;
    this.mins = parseInt(mins.dataset.time);
    updateDurationUI();
    this.isFinished = false;
    countSecs = 0;
    progressCircle.style.strokeDashoffset = circumference;
  },
};

function runTimer() {
  if (btnStart.dataset.status == "play") {
    timer.run();
  } else {
    timer.stop();
  }
  changeBtnState();
}
btnStart.addEventListener("click", runTimer);
btnReset.addEventListener("click", resetTimer);

function resetTimer() {
  timer.reset();
  btnStart.dataset.status = "pause";
  runTimer();
}

function changeBtnState() {
  if (btnStart.dataset.status == "play") {
    btnStart.dataset.status = "pause";
    btnStart.children[0].classList.replace("fa-play", "fa-pause");
  } else {
    btnStart.dataset.status = "play";
    btnStart.children[0].classList.replace("fa-pause", "fa-play");
  }
}
