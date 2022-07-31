let videoID = new URL(window.location.href).searchParams.get("v");
let oldVideoID = videoID;

(() => {
  const rightControls = document.querySelector(".ytp-right-controls");
  let player, videoStatus;
  let videoMarkups = [];

  const buttonHandler = (e) => {
    let wrapper = document.querySelector(".ytp-markup-wrapper");
    if (
      e.target.classList.contains("ytp-markup-button") &&
      wrapper.classList.contains("hidden")
    ) {
      player.pause();
      videoStatus = player.paused;
      document.querySelector("#markup_input").focus();
      let x = e.clientX;
      let y = e.clientY;
      wrapper.style.left = x + "px";
      wrapper.style.top = y + "px";
      wrapper.classList.remove("hidden");
    } else {
      if (
        !e.target.classList.contains("ytp-markup-input") &&
        !e.target.classList.contains("ytp-markup-wrapper")
      ) {
        wrapper.classList.add("hidden");
      }
    }
  };

  const goMarkup = (e) => {
    if (e.target.classList.contains("markup-row")) {
      let time = e.target.getAttribute("data-time");
      player.currentTime = time;
      player.play();
    }
  };

  document.addEventListener("click", goMarkup);
  document.addEventListener("click", buttonHandler);

  const start = () => {
    if (!document.querySelector("#markup_button")) {
      const markupButton = createPlayerButton();
      rightControls.prepend(markupButton);
    }
    if (!document.querySelector("#markup_input")) {
      const contextInput = createContextInput();
      document.body.append(contextInput);
    }

    player = document.querySelector("video");
    fetchMarkups(videoID).then((markups) => {
      videoMarkups = markups;
      const callback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
          if (mutation.type === "childList") {
            
            if(videoID !== oldVideoID){
              document.querySelector('.markup-panel').remove();
              oldVideoID = videoID;
            }
            
            if (document.querySelector("#secondary")) {
              if (!document.querySelector(".markup-panel")) {
                const panel = markupPanel(videoMarkups);
                document.querySelector("#secondary").prepend(panel);
              }
            }
          }
        }
      };
      const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);
    });
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;
    if (type === "NEW") {
      videoID = videoId;
      start();
    }
  });

  start();
})();

const targetNode = document.body;
const config = { childList: true, subtree: true };

function markupPanel(items) {
  let panel = document.createElement("div");
  panel.classList.add("markup-panel");
  panel.id = "markup-panel";
  panel.innerHTML = `<div class="markup-panel-title"><p>Markups</p></div>`;

  const rowList = document.createElement("div");
  rowList.id = "markup-row-list";
  if (items.length === 0) {
    rowList.innerHTML = `<i>There is no markups for this video.</i>`;
  }
  items.forEach((item, index) => {
    rowList.appendChild(createMarkupRow(item, index));
  });

  panel.appendChild(rowList);
  return panel;
}

function createMarkupRow(markup, index) {
  let context = markup.context,
    time = markup.time,
    formatted = markup.formatted;
  let row = document.createElement("div");
  row.classList.add("markup-row");
  row.setAttribute("data-time", time);
  row.innerHTML = `<div class="markup-context">${context}</div><div class="markup-formatted"  id="${index}">${formatted}</div>`;
  return row;
}

function createPlayerButton() {
  const svg = chrome.runtime.getURL("./bookmark.svg");
  const button = document.createElement("button");

  button.classList.add("ytp-button");
  button.classList.add("ytp-markup-button");
  button.id = "markup_button";
  button.setAttribute("data-tooltip-target-id", "ytp-markup-button");
  button.setAttribute("aria-label", "Markup");
  button.setAttribute("title", "Markup");

  fetch(svg).then((response) => {
    response.text().then((text) => {
      button.innerHTML = text;
    });
  });

  return button;
}
function createContextInput() {
  //context entry area.
  const wrapper = document.createElement("div");
  wrapper.classList.add("ytp-markup-wrapper");
  wrapper.classList.add("hidden");
  wrapper.style.position = "absolute";

  const input = document.createElement("input");
  input.type = "text";
  input.classList.add("ytp-markup-input");
  input.setAttribute("placeholder", "Add Context");
  input.setAttribute("aria-label", "Add Context");
  input.setAttribute("title", "Add Context");
  input.id = "markup_input";

  const inputHandler = function (e) {
    if (e.keyCode === 27) {
      input.value = "";
      wrapper.classList.add("hidden");
    }
    if (e.keyCode === 13) {
      const { time, formatted } = getDuration();
      let text = input.value;

      let markup = {
        context: text,
        formatted: formatted,
        time: time,
      };

      addMarkup(videoID, markup);
      input.value = "";
      wrapper.classList.add("hidden");
    }
  };
  input.addEventListener("keyup", inputHandler);

  wrapper.appendChild(input);
  return wrapper;
}

function getDuration() {
  let video = document.querySelector("video");
  let time = video.currentTime;
  return {
    time: time,
    formatted: fancyTimeFormat(time),
  };
}

function fancyTimeFormat(duration) {
  //https://stackoverflow.com/a/11486026/9070012
  // Hours, minutes and seconds
  var hrs = ~~(duration / 3600);
  var mins = ~~((duration % 3600) / 60);
  var secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}

function addMarkup(id, newMarkup) {
  chrome.storage.local.get({ [id]: [] }, function (result) {
    let markupList = result[id];
    markupList.push(newMarkup);
    chrome.storage.local.set({ [id]: markupList });
    if (document.querySelector("#markup-row-list i")) {
      document.querySelector("#markup-row-list i").remove();
    }
    document
      .getElementById("markup-row-list")
      .appendChild(createMarkupRow({ ...newMarkup }, markupList.length - 1));
  });
}

function fetchMarkups(id) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ [id]: [] }, function (result) {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      // Pass the data retrieved from storage down the promise chain.
      resolve(result[id]);
    });
  });
}
