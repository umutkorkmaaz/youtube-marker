//secondary-inner
function panel(items) {
  let panel = document.createElement("div");
  panel.classList.add("markup-panel");
  panel.id = "markup-panel";
  items.forEach((item) => {
    panel.appendChild(createMarkupRow(item));
  });
  return panel;
}

function createMarkupRow(markup) {
  let context = markup.context,
    time = markup.time,
    formatted = markup.formatted;
  let row = document.createElement("div");
  row.classList.add("markup-row");
  row.innerHTML = `<div class="markup-time">${time}</div><div class="markup-context">${context}</div><div class="markup-formatted">${formatted}</div>`;
  return row;
}

export default { panel };
