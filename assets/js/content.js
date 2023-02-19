let videoID = new URL(window.location.href).searchParams.get("v");
let oldVideoID = videoID;
let player;
const goMarkup = (time,e) => {
  if(!e.target.classList.contains("markup-remove")){
    let player = document.querySelector("video");
    player.currentTime = time;
    player.play();
  }
};

(() => {
  let videoMarkups = [];

  const buttonHandler = (e) => {
    let wrapper = document.querySelector(".ytp-markup-wrapper");

    if (
      e.target.classList.contains("ytp-markup-button") &&
      wrapper.classList.contains("hidden")
    ) {
      //stop video
      player.pause();

      //Generate overlay for dialog
      let overlay = generateOverlay();
      document.body.appendChild(overlay);

      //Remove hidden class from wrapper
      wrapper.classList.remove("hidden");
      document.getElementsByClassName(
        "ytp-markup-dialog-desc"
      )[0].innerHTML = `Markup will be added at <span class="timestamp">${
        getDuration().formatted
      }</span>`;
      document.getElementById("markup_input").focus();
    } else {
      if (
        !wrapper.classList.contains("hidden") &&
        !e.target.classList.contains("ytp-markup-input") &&
        !e.target.classList.contains("ytp-markup-dialog-desc") &&
        !e.target.classList.contains("ytp-markup-dialog-title") &&
        !e.target.classList.contains("ytp-markup-dialog-button-container") &&
        !e.target.classList.contains("timestamp") &&
        e.target.id !== "save_markup" &&
        !e.target.classList.contains("ytp-markup-wrapper")
      ) {
        if (e.target.id === "cancel_markup") {
          document.getElementById("markup_input").value = "";
        }

        //remove overlay
        document
          .getElementsByTagName("tp-yt-iron-overlay-backdrop")[0]
          .remove();
        //hide wrapper
        wrapper.classList.add("hidden");
        player.play();
      }
    }
  };

  const start = () => {
    if (videoID !== null) {
      document.addEventListener("click", buttonHandler);

      const rightControls = document.querySelector(".ytp-right-controls");
      if (!document.querySelector("#markup_button")) {
        const markupButton = createPlayerButton();
        rightControls.prepend(markupButton);
      }
      if (!document.querySelector("#markup_input")) {
        const contextInput = createContextModal();
        document.body.append(contextInput);
      }

      player = document.querySelector("video");

      fetchMarkups(videoID).then((markups) => {
        videoMarkups = markups;
        const callback = function (mutationsList, observer) {
          for (let mutation of mutationsList) {
            if (mutation.type === "childList") {
              if (videoID !== oldVideoID && oldVideoID !== null) {
                document.querySelector(".markup-panel").remove();
              }
              oldVideoID = videoID;
              if (document.querySelector("#columns #secondary")) {
                if (!document.querySelector(".markup-panel")) {
                  const panel = markupPanel(videoMarkups);
                  document.querySelector("#columns #secondary").prepend(panel);
                }
              }
            }
          }
        };
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
      });
    }
  };

  const targetNode = document.body;
  const config = { childList: true, subtree: true };
  chrome.runtime.onMessage.addListener((obj) => {
    const { type, videoId } = obj;
    if (type === "NEW") {
      videoID = videoId;
      start();
    }
  });

  start();
})();

function markupPanel(items) {
  let panel = document.createElement("div");
  panel.classList.add("markup-panel");
  panel.id = "markup-panel";
  panel.innerHTML = `
    <div class="markup-header">
      <span>Markups</span>
      <div style="height: 40px"></div>
    </div>        
  `;
  /* panel.innerHTML = `<div class="markup-panel-title"><p>Markups</p></div>`; */
  const rowList = document.createElement("div");
  rowList.id = "markup-row-list";
  if (items.length === 0) {
    rowList.innerHTML = `<div class="markup-row"><i>There is no markup for this video.</i></div>`;
  }
  items.forEach((item, index) => {
    rowList.appendChild(createMarkupRow(item, index));
  });

  panel.appendChild(rowList);
  return panel;
}

function clearMarkupPanel() {
  if (document.querySelector("#markup-row-list")) {
    document.querySelector("#markup-row-list").innerHTML = "";
  }
}

function createMarkupRow(markup, index) {
  let context = markup.context,
    time = markup.time,
    formatted = markup.formatted;
  let row = document.createElement("div");
  row.classList.add("markup-row");
  row.id = `markup${index}`;
  row.onclick = (event) => {
    goMarkup(time,event);
  };

  row.innerHTML = `
  <div class="markup-context">${context}</div>
  <div style="display: flex; flex: 1;"><div class="markup-formatted" >${formatted}</div></div>`;

  const removeButton = document.createElement("div");
  removeButton.classList.add("markup-remove");
  removeButton.innerHTML =
    '<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope tp-yt-iron-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope tp-yt-iron-icon"><path d="M11,17H9V8h2V17z M15,8h-2v9h2V8z M19,4v1h-1v16H6V5H5V4h4V3h6v1H19z M17,5H7v15h10V5z" class="style-scope tp-yt-iron-icon"></path></g></svg>';

  removeButton.onclick = () => {
    deleteMarkup(time);
  };

  row.appendChild(removeButton);

  return row;
}

function createPlayerButton() {
  const button = document.createElement("button");

  button.classList.add("ytp-button");
  button.classList.add("ytp-markup-button");
  button.id = "markup_button";
  button.setAttribute("data-tooltip-target-id", "ytp-markup-button");
  button.setAttribute("aria-label", "Markup");
  button.setAttribute("title", "Markup");
  button.innerHTML = `<svg height="100%" viewBox="0 0 24 24" width="75%"><use class="ytp-svg-shadow" href="#ytp-id-8688"></use><path fill="#fff" fill-rule="evenodd" id="ytp-id-8688" d="M17,18V5H7V18L12,15.82L17,18M17,3A2,2 0 0,1 19,5V21L12,18L5,21V5C5,3.89 5.9,3 7,3H17M11,7H13V9H15V11H13V13H11V11H9V9H11V7Z" /></svg>`;


  return button;
}
function createContextModal() {
  //context entry area.
  const wrapper = document.createElement("div");
  wrapper.classList.add("ytp-markup-wrapper");
  wrapper.classList.add("hidden");

  //add title
  const dialogTitle = document.createElement("p");
  dialogTitle.innerHTML = "Add Markup";
  dialogTitle.classList.add("ytp-markup-dialog-title");
  wrapper.appendChild(dialogTitle);

  //timestamp area
  const timestamp = document.createElement("p");
  timestamp.classList.add("ytp-markup-dialog-desc");
  wrapper.appendChild(timestamp);

  //Create Input and event listener.
  const input = document.createElement("input");
  input.type = "text";
  input.classList.add("ytp-markup-input");
  input.setAttribute("placeholder", "Markup description");
  input.setAttribute("aria-label", "Markup description");
  input.setAttribute("title", "Markup description");
  input.setAttribute("autocomplete", "off");
  input.setAttribute("autocorrect", "off");
  input.setAttribute("spellcheck", "false");
  input.id = "markup_input";
  const inputHandler = function (e) {
    if (e.keyCode === 27) {
      input.value = "";
      wrapper.classList.add("hidden");
    }
    if (e.keyCode === 13) {
      saveHandler();
    }
  };
  input.addEventListener("keyup", inputHandler);
  wrapper.appendChild(input);

  //Button container
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("ytp-markup-dialog-button-container");
  //Cancel Button
  const cancelButton = document.createElement("button");
  cancelButton.setAttribute("type", "button");
  cancelButton.id = "cancel_markup";
  cancelButton.innerHTML = "Cancel";
  buttonContainer.appendChild(cancelButton);

  //Save button
  const saveButton = document.createElement("button");
  saveButton.setAttribute("type", "button");
  saveButton.id = "save_markup";
  saveButton.innerHTML = "Save";
  saveButton.addEventListener("click", saveHandler);
  buttonContainer.appendChild(saveButton);

  wrapper.appendChild(buttonContainer);

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

function deleteMarkup(time) {
  chrome.storage.sync.get({ [videoID]: [] }, function (result) {
    for (const [key, value] of Object.entries(result)) {
      value.forEach((item, index) => {
        if (time === item.time) {
          value.splice(index,1);
          document.getElementById(`markup${index}`).remove();
          result[videoID] = value;
          if(result[videoID].length === 0){
            document.getElementById('markup-row-list').innerHTML = '<div class="markup-row"><i>There is no markup for this video.</i></div>';
          }
        }
      });
    }
    chrome.storage.sync.set({ [videoID]: result[videoID] });
  });
}

function addMarkup(id, newMarkup) {
  let firstRow = document.querySelector('.markup-row');
  if(!firstRow.hasAttribute('id')){
    firstRow.remove();
  }
  chrome.storage.sync.get({ [id]: [] }, function (result) {
    let markupList = result[id];
    markupList.push(newMarkup);
    chrome.storage.sync.set({ [id]: markupList });
    document
      .getElementById("markup-row-list")
      .appendChild(createMarkupRow({ ...newMarkup }, markupList.length - 1));
  });
}

function fetchMarkups(id) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({ [id]: [] }, function (result) {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      // Pass the data retrieved from storage down the promise chain.
      resolve(result[id]);
    });
  });
}

function generateOverlay() {
  let overlay = document.createElement("tp-yt-iron-overlay-backdrop");
  overlay.classList.add("opened");
  overlay.setAttribute("opened", true);
  overlay.style.zIndex = "2201";
  return overlay;
}

function saveHandler() {
  const { time, formatted } = getDuration();
  const input = document.getElementById("markup_input");
  const wrapper = document.getElementsByClassName("ytp-markup-wrapper")[0];
  let text = input.value;
  const videoTitle = document.querySelector(
    "#title > h1 > yt-formatted-string"
  );

  let markup = {
    title: videoTitle.innerHTML,
    context: text,
    formatted: formatted,
    time: time,
  };
  addMarkup(videoID, markup);
  input.value = "";
  document.getElementsByTagName("tp-yt-iron-overlay-backdrop")[0].remove();
  let player = document.querySelector("video");
  player.play();
  wrapper.classList.add("hidden");
}
