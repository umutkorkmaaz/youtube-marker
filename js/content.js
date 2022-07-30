document.addEventListener("DOMContentLoaded", () => {
  const videoID = new URL(window.location.href).searchParams.get("v");
  let videoMarkups = getVideoMarkups(videoID);
  videoMarkups.then((markups) => {
    console.log(markups);
  });
  let videoStatus = false;
  const video = document.querySelector("video");
  const rightControls = document.querySelector(
    ".ytp-chrome-controls .ytp-right-controls"
  );
  const svg =
    '<svg height="100%" viewBox="0 0 24 24" width="75%"><use class="ytp-svg-shadow" href="#ytp-id-8688"></use><path fill="#fff" fill-rule="evenodd" id="ytp-id-8688" d="M17,18V5H7V18L12,15.82L17,18M17,3A2,2 0 0,1 19,5V21L12,18L5,21V5C5,3.89 5.9,3 7,3H17M11,7H13V9H15V11H13V13H11V11H9V9H11V7Z" /></svg>';
  //right controls button.
  const button = document.createElement("button");
  button.classList.add("ytp-button");
  button.classList.add("ytp-markup-button");
  button.setAttribute("data-tooltip-target-id", "ytp-markup-button");
  button.setAttribute("aria-label", "Markup");
  button.setAttribute("title", "Markup");
  button.innerHTML = svg;
  rightControls.prepend(button);

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
  input.addEventListener("keyup", function (e) {
    if (e.keyCode === 27) {
      input.value = "";
      wrapper.classList.add("hidden");
      videoState(videoStatus,video);
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
      videoState(videoStatus,video);
    }
  });

  wrapper.appendChild(input);
  document.body.append(wrapper);

  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("ytp-markup-button") &&
      wrapper.classList.contains("hidden")
    ) {
      video.pause();
      videoStatus = video.paused;
      input.focus();
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
        videoState(videoStatus,video);
        wrapper.classList.add("hidden");
      }
    }
  });
});

function getDuration() {
  let video = document.querySelector("video");
  let time = video.currentTime;
  return {
    time: time,
    formatted: fancyTimeFormat(time),
  };
}
function videoState(status,video) {
  if (!status) {
    if (video === undefined) {
      video = document.querySelector("video");
    }

    video.play();
  }
}
function fancyTimeFormat(duration) {
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
  });
}
function getVideoMarkups(id) {
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
