
// {% for lesson in lessons %}
//     <a href="/lesson/{{ lesson.number }}/" class="lesson-card">
//         <h3>Lesson {{ lesson.number }}</h3>
//         <p>{{ lesson.title }}</p>
//     </a>
//     {% endfor %}

readJSON();

function readJSON(){
    fetch("https://drive.google.com/uc?export=download&id=1CdMB_UcmRT_99JItjKU3GzfXLNW1qE7-").then(response => response.json()).then(data => {
        console.log(data);
    }).catch(error => {
        console.error('Error fetching JSON:', error);
    });
}