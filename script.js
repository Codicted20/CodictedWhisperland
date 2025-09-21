// const bgAudio = new Audio("audio/bg.mp3");
// bgAudio.loop = true;
// bgAudio.play();
const books = document.querySelectorAll(".book");
const magicContainer = document.getElementById("magicContainer");
const magicContent = magicContainer.querySelector(".magic-content");
const container = document.querySelector(".butterfly-container");
const bookContainer = document.querySelector(".bookContainer");
const sizeChanger = document.querySelector(".sizeChanger");
let currentLanguage = "hi"; // Default: Hindi
let closingFromCloseBtn = false;

const butterflyImages = [
  "assets/butterfly1.webp",
  "assets/butterfly2.webp",
  "assets/butterfly3.webp",
  "assets/butterfly4.webp",
];

// ✅ Reusable close button creator
function createCloseButton(onClickHandler) {
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✖";
  closeBtn.classList.add("close-btn");
  closeBtn.addEventListener("click", onClickHandler);
  return closeBtn;
}

// ✅ Show Magic Container when book is clicked
books.forEach((book) => {
  book.addEventListener("click", () => {
    magicContent.innerHTML = "";

    // Add close button to magic container
    const closeBtn = createCloseButton(closeMagic);
    magicContent.appendChild(closeBtn);

    // Add book image
    const img = document.createElement("img");
    img.src = book.src;
    img.alt = "Book Image";
    img.classList.add("SelectedBook");
    magicContent.appendChild(img);

    // Show magic container
    magicContainer.classList.remove("hide");
    magicContainer.classList.add("show");
    magicContainer.style.display = "flex";
  });
});

// ✅ Magic Container Close Function
function closeMagic() {
  magicContainer.classList.remove("show");
  magicContainer.classList.add("hide");
  setTimeout(() => {
    magicContainer.style.display = "none";
  }, 500);
}

// ✅ SelectedBook click toggles bookContainer
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("SelectedBook")) {
    fullScreen();
    loadBook(currentBookName);
    console.log("SelectedBook clicked");
    sizeChanger.style.display = "block";

    if (bookContainer) {
      // Pehle se existing close button hata do (agar hai)
      // Agar pehle se close button exist karta hai to dobara create mat karo
      let existingCloseBtn = bookContainer.querySelector(".close-btn");
      if (!existingCloseBtn) {
        const closeBtn = createCloseButton(() => {
          closingFromCloseBtn = true;
          bookContainer.classList.remove("visible");
          sizeChanger.style.display = "none";
          audio.pause();
          audio.currentTime = 0;
          currentScale = 1;
          bookContainer.style.transform = `scale(${currentScale})`;
          currentMode = "voice";
          soundIcon.className = "fas fa-volume-up";
          currentLanguage = "hi";
          languageToggleBtn.textContent = "अA";
          currentPage = 0;
          loadPage(currentPage);
          // ✅ Reset flag back after short delay
          setTimeout(() => {
            closingFromCloseBtn = false;
          }, 100); // small delay so loadPage runs with flag
        });
        bookContainer.prepend(closeBtn);
      }

      // Show the container
      bookContainer.classList.add("visible");

      // ✅ Play audio only now
      if (currentMode === "voice") {
        loadAudio(currentBookName, currentPage);
      }
    }
  }
});

// ✅ Butterfly Logic
function createButterfly() {
  const butterfly = document.createElement("img");
  const randomIndex = Math.floor(Math.random() * butterflyImages.length);
  butterfly.src = butterflyImages[randomIndex];
  butterfly.classList.add("butterfly");

  const left = Math.random() * 90 + 5;
  butterfly.style.left = `${left}vw`;

  const scale = 0.5 + Math.random() * 0.5;
  const rotate = Math.random() * 20 - 10;
  butterfly.style.transform = `scale(${scale}) rotate(${rotate}deg)`;

  container.appendChild(butterfly);

  setTimeout(() => {
    butterfly.remove();
  }, 30000);
}

for (let i = 0; i < 3; i++) {
  createButterfly();
}
setInterval(() => {
  createButterfly();
}, 2000);

// ========== BOOK LOGIC ==========

let currentBookName = "book1";
const soundIcon = document.getElementById("soundIcon");
const rightPage = document.querySelector(".rightPage");
const leftPage = document.querySelector(".leftPage");
const nextBtn = document.querySelector(".NextBtn");
const prevBtn = document.querySelector(".PrevBtn");
const scenePrevBtn = document.getElementById("scenePrevBtn");
const sceneNextBtn = document.getElementById("sceneNextBtn");
// const SceneToggle = document.querySelectorAll(".SceneToggle");
const SceneToggle = document.querySelectorAll(".SceneToggle");
const modeToggleBtn = document.getElementById("modeToggleBtn");

let currentPage = 0;
let totalPages = 0;
let bookData = null;
let currentSceneIndex = 0;
let audio = new Audio();
let sceneInterval = null;

let currentMode = "voice";
modeToggleBtn.addEventListener("click", () => {
  if (currentMode === "manual") {
    currentMode = "voice";
    soundIcon.className = "fas fa-volume-up";

    startVoiceMode();
  } else {
    currentMode = "manual";
    soundIcon.className = "fas fa-volume-mute";

    stopVoiceMode();
  }

  // ✅ Re-run page load to trigger updated SceneToggle visibility
  loadPage(currentPage);
});

function startVoiceMode() {
  loadAudio(currentBookName, currentPage);
}

function stopVoiceMode() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  if (sceneInterval) {
    clearInterval(sceneInterval);
    sceneInterval = null;
  }
}

function loadBook(bookName) {
  currentBookName = bookName;

  fetch(`data/${bookName}.json`)
    .then((res) => res.json())
    .then((data) => {
      bookData = data.pages;
      totalPages = bookData.length;
      currentPage = 0;
      loadPage(currentPage);
    })
    .catch((err) => console.error("Error loading book:", err));
}

function loadAudio(bookName, pageIndex) {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  // ✅ Naya audio banaye
  audio = new Audio(
    `audio/${currentLanguage}/${bookName}page${pageIndex + 1}.mp3`
  );

  // ✅ Play safely with catch
  audio.play().catch((err) => {
    console.warn("Audio play failed:", err);
  });

  // ✅ Agar pehle se interval chal raha hai to clear karo
  if (sceneInterval) clearInterval(sceneInterval);

  // ✅ Scene change track karne ke liye interval
  sceneInterval = setInterval(() => {
    handleSceneChangeByAudio();
  }, 500);

  // ✅ Jab audio khatam ho → voice mode me next page auto flip
  audio.onended = () => {
    console.log("Audio finished for page:", pageIndex);
    if (currentMode === "voice" && currentPage < totalPages - 1) {
      nextBtn.click(); // simulate button click → page flip
    }
  };
}

function loadPage(index) {
  if (!bookData || index >= totalPages) return;

  const page = bookData[index];
  currentSceneIndex = 0;
  const textClass = currentLanguage === "hi" ? "hindi-text" : "english-text";
  rightPage.innerHTML = `<p class="${textClass}">${
    page.rightText[currentLanguage] || "Translation not available"
  }</p>`;
  leftPage.innerHTML = "";

  if (page.scenes && page.scenes.length > 0) {
    leftPage.insertAdjacentHTML(
      "afterbegin",
      `<img src="${page.scenes[0].image}" alt="Scene Image" />`
    );
  }

  // ✅ Show/hide scene toggle buttons based on manual mode and scenes
  SceneToggle.forEach((btn) => {
    if (currentMode === "manual" && page.scenes && page.scenes.length > 1) {
      btn.style.opacity = "1";
    } else {
      btn.style.opacity = "0";
    }
  });
  if (currentMode === "voice" && !closingFromCloseBtn) {
    loadAudio(currentBookName, currentPage); // ✅ Only play audio if not closing
  }
}

const languageToggleBtn = document.getElementById("languageToggleBtn");

languageToggleBtn.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "hi" : "en";
  languageToggleBtn.textContent = currentLanguage === "en" ? "Aअ" : "अA";

  loadPage(currentPage); // Reload current page with new language
});

function updateSceneImage(imagePath) {
  let imgEl = leftPage.querySelector("img");

  if (!imgEl) {
    // Agar pehle image nahi hai
    leftPage.insertAdjacentHTML(
      "afterbegin",
      `<img src="${imagePath}" alt="Scene Image" style="opacity:0; transition: opacity 0.5s ease;" />`
    );
    requestAnimationFrame(() => {
      const newImg = leftPage.querySelector("img");
      if (newImg) newImg.style.opacity = "1";
    });
    return;
  }

  // Agar pehle se image hai
  // Turant src change karein aur opacity 0 → 1 animate kare
  imgEl.style.transition = "none"; // pehle transition remove karo
  imgEl.style.opacity = "0";       // instantly hide

  // Turant src change karo
  imgEl.src = imagePath;

  // Small delay with requestAnimationFrame for smooth fade-in
  requestAnimationFrame(() => {
    imgEl.style.transition = "opacity 0.5s ease";
    imgEl.style.opacity = "1"; // fade-in
  });
}


function handleSceneChangeByAudio() {
  const page = bookData[currentPage];
  if (!page || !page.scenes) return;

  const currentTime = audio.currentTime;
  let newSceneIndex = currentSceneIndex;

  for (let i = 0; i < page.scenes.length; i++) {
    if (currentTime >= page.scenes[i].time) {
      newSceneIndex = i;
    } else {
      break;
    }
  }

  if (newSceneIndex !== currentSceneIndex) {
    currentSceneIndex = newSceneIndex;
    updateSceneImage(page.scenes[currentSceneIndex].image);
  }
}

scenePrevBtn.addEventListener("click", () => {
  if (currentMode !== "manual") return;

  const page = bookData[currentPage];
  if (!page || !page.scenes || currentSceneIndex <= 0) return;

  currentSceneIndex--;
  updateSceneImage(page.scenes[currentSceneIndex].image);
});

sceneNextBtn.addEventListener("click", () => {
  if (currentMode !== "manual") return;

  const page = bookData[currentPage];
  if (!page || !page.scenes || currentSceneIndex >= page.scenes.length - 1)
    return;

  currentSceneIndex++;
  updateSceneImage(page.scenes[currentSceneIndex].image);
});

document.querySelectorAll(".book").forEach((bookImg) => {
  bookImg.addEventListener("click", () => {
    const bookName = bookImg.dataset.book;
    currentBookName = bookName;
    // loadBook(bookName);
  });
});

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages - 1) {
    // Clear LEFT PAGE before animation starts
    leftPage.style.transition = "opacity 0.4s ease";
    leftPage.style.opacity = "0";

    setTimeout(() => {
      leftPage.innerHTML = "";
      leftPage.style.transition = "none";
      leftPage.style.opacity = "1";
    }, 400); // Match this with opacity transition duration

    rightPage.style.transition = "transform 1s";
    rightPage.style.transform = "rotateY(-180deg)";

    setTimeout(() => {
      rightPage.style.transition = "none";
      rightPage.style.transform = "rotateY(0deg)";
      currentPage++;
      loadPage(currentPage);

      // Voice mode support
      if (currentMode === "voice") {
        loadAudio(currentBookName, currentPage);
      } else {
        stopVoiceMode();
      }
    }, 600);
  }
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 0) {
    // Clear RIGHT PAGE before animation starts
    rightPage.style.transition = "opacity 0.4s ease";
    rightPage.style.opacity = "0";

    setTimeout(() => {
      rightPage.innerHTML = "";
      rightPage.style.transition = "none";
      rightPage.style.opacity = "1";
    }, 400); // Match this with opacity transition duration

    leftPage.style.transition = "transform 1s";
    leftPage.style.transform = "rotateY(180deg)";

    setTimeout(() => {
      leftPage.style.transition = "none";
      leftPage.style.transform = "rotateY(0deg)";
      currentPage--;
      loadPage(currentPage);

      // Voice mode support
      if (currentMode === "voice") {
        loadAudio(currentBookName, currentPage);
      } else {
        stopVoiceMode();
      }
    }, 600);
  }
});

const largeBtn = document.querySelector(".Large");
const smallBtn = document.querySelector(".Small");
// Starting scale
let currentScale = 1;
// Maximum and minimum scale limit
const maxScale = 2.5;
const minScale = 0.5;
const scaleStep = 0.2;

largeBtn.addEventListener("click", () => {
  if (currentScale < maxScale) {
    currentScale += scaleStep;
    bookContainer.style.transform = `scale(${currentScale})`;
  }
});

smallBtn.addEventListener("click", () => {
  if (currentScale > minScale) {
    currentScale -= scaleStep;
    bookContainer.style.transform = `scale(${currentScale})`;
  }
});
//fullScree
function fullScreen() {
  const elem = document.documentElement;
  const icon = document.getElementById("fs-icon");

  if (
    !document.fullscreenElement &&
    !document.webkitFullscreenElement &&
    !document.msFullscreenElement
  ) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    icon.classList.remove("fa-expand");
    icon.classList.add("fa-compress");
  }
}

function toggleFullScreenFromButton() {
  const icon = document.getElementById("fs-icon");

  if (
    !document.fullscreenElement &&
    !document.webkitFullscreenElement &&
    !document.msFullscreenElement
  ) {
    fullScreen();
  } else {
    // Exit fullscreen only from the button
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    icon.classList.remove("fa-compress");
    icon.classList.add("fa-expand");
  }
}
// ===== Preloader Logic =====
document.addEventListener("DOMContentLoaded", () => {
  let progressText = document.getElementById("progress-text");
  let bookContent = document.getElementById("book-content");
  let preloader = document.getElementById("preloader");

  let progress = 0;
  let fakeLoading = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 5; // 5–15% increase
    if (progress > 100) progress = 100;

    progressText.textContent = `Loading your library... ${progress}%`;

    if (progress === 100) {
      clearInterval(fakeLoading);
      setTimeout(() => {
        preloader.style.display = "none";
        bookContent.style.display = "block";
      }, 600);
    }
  }, 300);
});
