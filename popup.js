document.addEventListener('DOMContentLoaded',function(){
    fetchMarkups().then((response) => {
        for (const [key, value] of Object.entries(response)){
            let markup = value.at(0);

            console.log(markup);
            addVideo({
                id: key,
                title: markup.title ?? "Unknown",
                count: value.length
            });
        }
    });



})

function convertToHTML(string){
    var parser = new DOMParser();
	var doc = parser.parseFromString(string, 'text/html');
	return doc.body;
}

function addVideo(item){
    const list = document.getElementById("videolist");

    let markupItem = document.createElement('div');
    markupItem.classList.add("markup-item");

    let link = document.createElement('div');
    link.classList.add("video-link");
    link.setAttribute("data-url",`https://www.youtube.com/watch?v=${item.id}`);
    link.innerHTML = `<span class="video-title">${item.title}</span> <span class="markup-count">${item.count}</span>`;
    markupItem.appendChild(link);
    link.addEventListener("click", open)

    list.appendChild(markupItem);
}
function open(e){
    let url = e.target.getAttribute("data-url");
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