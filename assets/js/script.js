// {% for lesson in lessons %}
//     <a href="/lesson/{{ lesson.number }}/" class="lesson-card">
//         <h3>Lesson {{ lesson.number }}</h3>
//         <p>{{ lesson.title }}</p>
//     </a>
//     {% endfor %}

// loadVoices();
readJSON();

function loadVoices() {
  const availableVoices = [];
  const voices = speechSynthesis.getVoices();
  console.log("voices", voices);
  for (const voice of voices) {
    if (voice.lang.startsWith("hi")) {
      availableVoices.push(voice);
    }
  }
  if (availableVoices) {
    const voicesDropDown = document.getElementById("voice-selection");
    let i = 0;
    for (const voice in availableVoices){
        const voiceLink = document.createElement("a");
        voiceLink.href = `index.html?voice=${i}`;
        i++;
        console.log("voice", voice);
        const voiceName = document.createElement("h3");
        voiceName.textContent = voice.name;
        voiceLink.appendChild(voiceName);
        voicesDropDown.appendChild(voiceLink);
    }
  }
}

function readJSON() {
  const lessongrid = document.getElementById("lessongrid");
  if (!lessongrid) {
    console.error('No element with id "lessongrid" found in the DOM.');
    return;
  }
  const basePath = (function () {
    const p = window.location.pathname;
    // keep the trailing slash for the current directory
    return p.endsWith("/") ? p : p.replace(/\/[^\/]*$/, "/");
  })();
  const jsonUrl = new URL(
    "assets/data/lessons.json",
    window.location.origin + basePath
  ).href;
  const sampleUrl = new URL(
    "assets/data/sample.json",
    window.location.origin + basePath
  ).href;

  fetch(sampleUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      console.log("fetched json:", data);
      // clear existing children (optional)

      lessongrid.innerHTML = "";
      for (let key in data) {
        if (key.startsWith("lesson")) {
          const lessonNum = parseInt(key.replace("lesson", ""));
          const lesson = data[key];
          const lessonLink = document.createElement("a");
          lessonLink.href = `lesson.html?lesson=${lessonNum}`;
          lessonLink.className = "lesson-card";

          const lessonTitle = document.createElement("h3");
          lessonTitle.textContent = `Lesson ${lessonNum}`;
          lessonLink.appendChild(lessonTitle);

          const lessonDesc = document.createElement("p");
          lessonDesc.textContent = lesson.title || "";
          lessonLink.appendChild(lessonDesc);

          lessongrid.appendChild(lessonLink);
        } else if (key.startsWith("composition")) {
          const lessonNum = parseInt(key.replace("composition", ""));
          const lesson = data[key];
          const lessonLink = document.createElement("a");
          lessonLink.href = `lesson.html?composition=${lessonNum}`;
          lessonLink.className = "lesson-card";

          const lessonTitle = document.createElement("h3");
          lessonTitle.textContent = `Composition ${lessonNum}`;
          lessonLink.appendChild(lessonTitle);

          const lessonDesc = document.createElement("p");
          lessonDesc.textContent = lesson.title || "";
          lessonLink.appendChild(lessonDesc);

          lessongrid.appendChild(lessonLink);
        } else if (key.startsWith("letterwriting")) {
          const lessonNum = parseInt(key.replace("letterwriting", ""));
          const lesson = data[key];
          const lessonLink = document.createElement("a");
          lessonLink.href = `lesson.html?letterwriting=${lessonNum}`;
          lessonLink.className = "lesson-card";

          const lessonTitle = document.createElement("h3");
          lessonTitle.textContent = `LetterWriting ${lessonNum}`;
          lessonLink.appendChild(lessonTitle);

          const lessonDesc = document.createElement("p");
          lessonDesc.textContent = lesson.title || "";
          lessonLink.appendChild(lessonDesc);

          lessongrid.appendChild(lessonLink);
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching JSON:", error);
    });
}
