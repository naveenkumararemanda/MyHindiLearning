google.charts.load("elements", "1", { packages: "transliteration" });
    let transliterationControl;
    function onLoad() {
        const opts = { sourceLanguage: google.elements.transliteration.LanguageCode.ENGLISH, destinationLanguage: [google.elements.transliteration.LanguageCode.HINDI], shortcutKey: 'ctrl+g', transliterationEnabled: true };
        transliterationControl = new google.elements.transliteration.TransliterationControl(opts);
        showQuestion();
    }
    google.charts.setOnLoadCallback(onLoad);

readJSON();

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

// var speakButtons = document.getElementsByClassName("speak-btn");
// var i;

// for (i = 0; i < speakButtons.length; i++) {
//   speakButtons[i].addEventListener("click", function() {
//     const textToSpeak = '';
//     textToSpeak = speakButtons[i].dataset.userId;
//     // speak(textToSpeak);
//     console.log('speak button clicked:', textToSpeak);
//   });
// }

function getQueryParam(name){
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get(name));
  }


function readJSON(){
    const div_question_answers = document.getElementById('question-answers');
    const div_fill_blanks = document.getElementById('fill-blanks');
    const div_meanings = document.getElementById('meanings');
    const lessontitle = document.getElementById('lesson-title');


    fetch("/assets/data/lessons.json").then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }).then(data => {
        console.log('fetched json:', data);
        const lessonNum = getQueryParam('lesson');
        const lesson = data[`lesson${lessonNum}`];
        if(!lesson){
            console.error('Lesson data not found for lesson number:', getQueryParam('lesson'));
            return;
        }
        
        lessontitle.innerText = 'Lesson ' + lessonNum + " : " + lesson.title || 'Lesson';
        
        const tag_btn = document.createElement('button');
        tag_btn.textContent = "Listen";
        tag_btn.className = "speak-btn";
        tag_btn.type = "button";


        // helper to create a listen button
        const makeListenBtn = (text, lang = 'hi-IN') => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'speak-btn';
            btn.textContent = 'Listen';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                speak(text, lang);
            });
            return btn;
        };

        // Populate Q&A
        if(lesson.questions){
            const tag_ol = document.createElement('ol');
            for (let q in lesson.questions) {
                const question = lesson.questions[q];
                const tag_li = document.createElement('li');
                const tag_h4 = document.createElement('h4');
                const tag_h3 = document.createElement('h3');

                tag_btn.dataset.userId = question.q;
                const qBtn = makeListenBtn(question.q || '');
                tag_h4.innerHTML = 'Q: ' + question.q;// + tag_btn.outerHTML;   
                tag_h4.appendChild(qBtn);
                tag_btn.dataset.userId = question.a;      
                const aBtn = makeListenBtn(question.a || '');     
                tag_h3.innerHTML = 'A: ' + question.a;// + tag_btn.outerHTML;
                tag_h3.appendChild(aBtn);
                tag_li.appendChild(tag_h4);
                tag_li.appendChild(tag_h3);

                tag_ol.appendChild(tag_li);
            }
            div_question_answers.appendChild(tag_ol);
        }
        // Populate Fill in the blanks
        if(lesson.fillblanks){
            const tag_ol = document.createElement('ol');
            for (let fb in lesson.fillblanks) {
                const question = lesson.fillblanks[fb];
                const tag_li = document.createElement('li');
                const tag_h4 = document.createElement('h4');

                const qBtn = makeListenBtn(question.q || '');
                tag_h4.innerHTML = '' + question.q;// + tag_btn.outerHTML;
                tag_h4.appendChild(qBtn);
                tag_li.appendChild(tag_h4);
                tag_ol.appendChild(tag_li);
            }
            div_fill_blanks.appendChild(tag_ol);
        }
        // Populate Meanings
        if(lesson.meanings){
            const tag_ol = document.createElement('ol');
            for (let m in lesson.meanings) {
                const question = lesson.meanings[m];
                const tag_li = document.createElement('li');
                const tag_h4 = document.createElement('h4');
                
                const qBtn = makeListenBtn(question.q + ' - '+ question.a || '');
                tag_h4.innerHTML = '' + question.q + ' - '+ question.a;
                tag_h4.appendChild(qBtn);
                
                tag_li.appendChild(tag_h4);

                tag_ol.appendChild(tag_li);
            }
            div_meanings.appendChild(tag_ol);
        }


    }).catch(error => {
        console.error('Error fetching JSON:', error);
    });
}  

// new globals to manage playback
let currentUtterance = null;
let currentText = '';
let currentLang = 'hi-IN';

function startSpeech(text, lang = 'hi-IN') {
    if (!('speechSynthesis' in window)) return;
    // stop any ongoing speech and set current state
    stopSpeech();
    currentText = text || '';
    currentLang = lang || 'hi-IN';
    if (!currentText) return;

    const u = new SpeechSynthesisUtterance(currentText);
    u.lang = currentLang;
    u.rate = 0.8;
    const v = (speechSynthesis.getVoices() || []).find(v => (v.lang || '').startsWith('hi')) || null;
    if (v) u.voice = v;

    u.onend = () => { currentUtterance = null; /* update UI if needed */ };
    u.onerror = (e) => { console.error('speech error', e); currentUtterance = null; };

    currentUtterance = u;
    window.speechSynthesis.speak(u);
}

function pauseSpeech() {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
    }
}

function resumeSpeech() {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    } else if (!window.speechSynthesis.speaking && currentText) {
        // resume by restarting the same text
        startSpeech(currentText, currentLang);
    }
}

function stopSpeech() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    currentUtterance = null;
}

// keep old speak() name if other code calls it
function speak(t, l = 'hi-IN') {
    startSpeech(t, l);
}

// ...existing code...
const play = document.getElementById('speech-play');
play.addEventListener('click', () => resumeSpeech());
const pause = document.getElementById('speech-pause');
pause.addEventListener('click', () => pauseSpeech());
const stop = document.getElementById('speech-stop');
stop.addEventListener('click', () => stopSpeech());

// small change: ensure makeListenBtn uses startSpeech (replace previous call to speak)
const makeListenBtn = (text, lang = 'hi-IN') => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'speak-btn';
    btn.textContent = 'Listen';
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        startSpeech(text, lang);
    });
    return btn;
};
 window.speechSynthesis.onvoiceschanged = () => {
        const voices = speechSynthesis.getVoices();
        // console.log(voices);
    };

