// {% for lesson in lessons %}
//     <a href="/lesson/{{ lesson.number }}/" class="lesson-card">
//         <h3>Lesson {{ lesson.number }}</h3>
//         <p>{{ lesson.title }}</p>
//     </a>
//     {% endfor %}


readJSON();

function readJSON(){
    const lessongrid = document.getElementById('lessongrid');
    if (!lessongrid) {
        console.error('No element with id "lessongrid" found in the DOM.');
        return;
    }

    fetch("/assets/data/lessons.json").then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }).then(data => {
        console.log('fetched json:', data);
        // clear existing children (optional)
        lessongrid.innerHTML = '';
        for (let key in data) {
            if(key.startsWith("lesson")){
                const lessonNum = parseInt(key.replace("lesson", ""));
                const lesson = data[key];
                const lessonLink = document.createElement('a');
                lessonLink.href = `lesson.html?lesson=${lessonNum}`;
                lessonLink.className = 'lesson-card';

                const lessonTitle = document.createElement('h3');
                lessonTitle.textContent = `Lesson ${lessonNum}`;
                lessonLink.appendChild(lessonTitle);

                const lessonDesc = document.createElement('p');
                lessonDesc.textContent = lesson.title || '';
                lessonLink.appendChild(lessonDesc);

                lessongrid.appendChild(lessonLink);
            }
        }
    }).catch(error => {
        console.error('Error fetching JSON:', error);
    });
}