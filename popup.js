document.addEventListener('DOMContentLoaded',function(){
  fetchMarkups().then((response) => {
    for (const [key, value] of Object.entries(response)){
      let markup = value.at(0);
      addVideo({
          id: key,
          title: markup.title ?? "Unknown",
          count: value.length
      });
    }
  });
})

function addVideo(item){
  const list = document.getElementById("videolist");

  let markupItem = document.createElement('div');
  markupItem.classList.add("markup-item");

  let link = document.createElement('div');
  link.classList.add("video-link");
  link.setAttribute("data-url",`https://www.youtube.com/watch?v=${item.id}`);
  link.innerHTML = `<img src="https://i.ytimg.com/vi/${item.id}/hq720.jpg" class="video-thumbnail"><span class="video-title">${item.title}</span> <span class="markup-count">${item.count}</span>`;
  markupItem.appendChild(link);
  link.onclick = () => {
    open(`https://www.youtube.com/watch?v=${item.id}`)
  }

  list.appendChild(markupItem);
}

function open(url){
  getCurrentTab().then((tab) => {
      chrome.tabs.update(tab.id, { url: url });
  });
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function fetchMarkups() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, function (result) {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      // Pass the data retrieved from storage down the promise chain.
      resolve(result);
    });
  });
}