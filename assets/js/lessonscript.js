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
        // Populate Q&A
        if(lesson.questions){
            const tag_ol = document.createElement('ol');
            for (let q in lesson.questions) {
                const question = lesson.questions[q];
                const tag_li = document.createElement('li');
                const tag_h4 = document.createElement('h4');
                const tag_h3 = document.createElement('h3');
                
                tag_h4.innerHTML = 'Q: ' + question.q + tag_btn.outerHTML;
                tag_h3.innerHTML = 'A: ' + question.a + tag_btn.outerHTML;
                
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

                tag_h4.innerHTML = '' + question.q + tag_btn.outerHTML;
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
                
                tag_h4.innerHTML = '' + question.q + tag_btn.outerHTML + ' - '+ question.a + tag_btn.outerHTML;
                
                tag_li.appendChild(tag_h4);

                tag_ol.appendChild(tag_li);
            }
            div_meanings.appendChild(tag_ol);
        }


    }).catch(error => {
        console.error('Error fetching JSON:', error);
    });
}  