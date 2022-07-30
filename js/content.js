document.addEventListener("DOMContentLoaded", () => {
  let rightControls = document.querySelector(
    ".ytp-chrome-controls .ytp-right-controls"
  );

  let svg =
    '<svg height="100%" viewBox="0 0 24 24" width="75%"><use class="ytp-svg-shadow" href="#ytp-id-8688"></use><path fill="#fff" fill-rule="evenodd" id="ytp-id-8688" d="M17,18V5H7V18L12,15.82L17,18M17,3A2,2 0 0,1 19,5V21L12,18L5,21V5C5,3.89 5.9,3 7,3H17M11,7H13V9H15V11H13V13H11V11H9V9H11V7Z" /></svg>';
  let button = document.createElement("button");
  button.classList.add("ytp-button");
  button.classList.add("ytp-markup-button");
  button.setAttribute("data-tooltip-target-id", "ytp-markup-button");
  button.setAttribute("aria-label", "Markup");
  button.setAttribute("title", "Markup");
  button.innerHTML = svg;

  let inputStyles = {
    display: "block",
    position: "absolute",
    width: "200px",
    bottom: "70px",
    border: "none",
    height: "40px",
    paddingLeft: "10px",
  };

  document.addEventListener("click", function (e) {
    let input = button.nextSibling;
    let video = document.querySelector("video");
    let videoStatus = video.paused;
    if (
      e.target.classList.contains("ytp-markup-button") &&
      input.style.display === "none"
    ) {
      for (let style in inputStyles) {
        input.style[style] = inputStyles[style];
      }
      input.focus();
      video.pause();
    } else {
      if (
        !e.target.classList.contains("ytp-markup-input") &&
        input.style.display === "block"
      ) {
        input.style.display = "none";
        videoState(videoStatus);
      }
    }
  });

  rightControls.prepend(button);

  let input = document.createElement("input");
  input.type = "text";
  input.classList.add("ytp-markup-input");
  input.setAttribute("placeholder", "Add Context");
  input.setAttribute("aria-label", "Add Context");
  input.setAttribute("title", "Add Context");
  input.style.display = "none";
  button.after(input);
});

function getDuration() {
  let video = document.querySelector("video");
  let time = video.currentTime;
  return {
    time: time,
    formatted: fancyTimeFormat(time),
  };
}
function videoState(status){
    let video = document.querySelector("video");
    if(!status){
        video.play();
    }else{
        video.pause();
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
