const Store = require('electron-store');
const store = new Store();

window.addEventListener('DOMContentLoaded', () => {
  document.body.innerHTML = `
  <header id="titlebar">
  <div id="drag-region">

    <div id="window-title">
      <img src="../icons/logo.png">
      <span>BCS Developer</span>
    </div>

    <div id="window-controls">
      <div class="button" id="min-button">
        <img class="icon" srcset="../icons/min-w-10.png 1x, ../icons/min-w-12.png 1.25x, ../icons/min-w-15.png 1.5x, ../icons/min-w-15.png 1.75x, ../icons/min-w-20.png 2x, ../icons/min-w-20.png 2.25x, ../icons/min-w-24.png 2.5x, ../icons/min-w-30.png 3x, ../icons/min-w-30.png 3.5x" draggable="false" />
      </div>
      <div class="button" id="max-button">
        <img class="icon" srcset="../icons/max-w-10.png 1x, ../icons/max-w-12.png 1.25x, ../icons/max-w-15.png 1.5x, ../icons/max-w-15.png 1.75x, ../icons/max-w-20.png 2x, ../icons/max-w-20.png 2.25x, ../icons/max-w-24.png 2.5x, ../icons/max-w-30.png 3x, ../icons/max-w-30.png 3.5x" draggable="false" />
      </div>
      <div class="button" id="restore-button">
        <img class="icon" srcset="../icons/restore-w-10.png 1x, ../icons/restore-w-12.png 1.25x, ../icons/restore-w-15.png 1.5x, ../icons/restore-w-15.png 1.75x, ../icons/restore-w-20.png 2x, ../icons/restore-w-20.png 2.25x, ../icons/restore-w-24.png 2.5x, ../icons/restore-w-30.png 3x, ../icons/restore-w-30.png 3.5x" draggable="false" />
      </div>
      <div class="button" id="close-button">
        <img class="icon" srcset="../icons/close-w-10.png 1x, ../icons/close-w-12.png 1.25x, ../icons/close-w-15.png 1.5x, ../icons/close-w-15.png 1.75x, ../icons/close-w-20.png 2x, ../icons/close-w-20.png 2.25x, ../icons/close-w-24.png 2.5x, ../icons/close-w-30.png 3x, ../icons/close-w-30.png 3.5x" draggable="false" />
      </div>

      <div class="button" id="back-button">
        <img class="icon" src="../icons/back.png" draggable="false" />
      </div>
    </div>
  </div>
  </header>` + document.body.innerHTML
  let theme = store.get("userInterface.theme")
  document.body.classList.add(theme)

  if(document.getElementById("addtotop")){
    document.getElementById("addtotop").style.display="block"
    document.getElementById("drag-region").prepend(document.getElementById("addtotop"))
  }
})
  