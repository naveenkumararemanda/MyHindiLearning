readJSON();

let dataJ = {};
let currentSelection

function readJSON() {
  const basePath = (function () {
    const p = window.location.pathname;
    return p.endsWith('/') ? p : p.replace(/\/[^\/]*$/, '/');
  })();
  const sampleUrl = new URL('assets/data/sample.json', window.location.origin + basePath).href;

  fetch(sampleUrl).then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }).then(data => {
    console.log('fetched json:', data);
    dataJ = data;

    renderTree(dataJ);

  }).catch(error => {
    console.error('Error fetching JSON:', error);
  });
}

function renderTree(data) {

  const tree = document.getElementById('tree');
  const contentArea = document.getElementById('contentArea');
  tree.innerHTML = '';
  Object.keys(data).forEach(key => {
    const lesson = data[key];
    const lessonNode = document.createElement('div');
    lessonNode.className = 'tree-node lesson';
    lessonNode.textContent = lesson.title;
    lessonNode.onclick = (e) => { e.stopPropagation(); select('lesson', key); toggle(lessonNode); };

    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'children';

    lesson.topics.forEach((topic, ti) => {
      const topicNode = document.createElement('div');
      topicNode.className = 'tree-node topic ';
      topicNode.textContent = topic.topic;
      topicNode.onclick = (e) => { e.stopPropagation(); select('topic', key, ti); };
      childrenContainer.appendChild(topicNode);

      topic.sub_topics.forEach((item, qi) => {
        const qNode = document.createElement('div');
        qNode.className = 'tree-node question ';
        qNode.textContent = item.q.substring(0, 50) + (item.q.length > 50 ? '...' : '');
        qNode.onclick = (e) => { e.stopPropagation(); select('qa', key, ti, qi); };
        topicNode.appendChild(qNode);
      });
    });
    lessonNode.appendChild(childrenContainer);
    tree.appendChild(lessonNode);
  });
  const toggle = (node) => {
    const children = node.querySelector('.children');
    if (children) {
      node.classList.toggle('open');
    }
  }
  const clearSelection = () => document.querySelectorAll('.tree-node').forEach(n => n.classList.remove('selected'));

  const select = (type, key, ti, qi) => {
    clearSelection();
    event.target.classList.add('selected');
    currentSelection = { type, key, ti, qi };

    if (type === 'lesson') {
      showLessonEditor(key);
    } else if (type === 'topic') {
      showTopicEditor(key, ti);
    } else if (type === 'qa') {
      showQAEditor(key, ti, qi);
    }
  };

  const showLessonEditor = (key) => {
    contentArea.innerHTML = `
      <div class="editor">
        <h3>Edit Lesson</h3>
        <input type="text" value="${data[key].title}" id="editTitle" />
        <button class="btn success" onclick="updateLesson('${key}')">Save</button>
        <button class="btn danger" onclick="deleteLesson('${key}')">Delete Lesson</button>
      </div>`;
  };

  const showTopicEditor = (key, ti) => {
    const t = data[key].topics[ti];
    contentArea.innerHTML = `
      <div class="editor">
        <h3>Edit Topic</h3>
        <input type="text" value="${t.topic}" id="editTopicName" />
        <input type="text" value="${t.topic_type}" id="editTopicType" placeholder="questions / meanings / fillblanks" />
        <button class="btn success" onclick="updateTopic('${key}',${ti})">Save</button>
      </div>`;
  };

  const showQAEditor = (key, ti, qi) => {
    const item = data[key].topics[ti].sub_topics[qi];
    contentArea.innerHTML = `
      <div class="editor">
        <h3>Edit Question/Meaning</h3>
        <textarea id="editQ">${item.q}</textarea>
        <textarea id="editA">${item.a}</textarea>
        <button class="btn success" onclick="updateQA('${key}',${ti},${qi})">Save</button>
        <button class="btn danger" onclick="deleteQA('${key}',${ti},${qi})">Delete</button>
      </div>`;
  };
}

function addLesson() {
  const key = prompt("Key (e.g. lesson10):");
  const title = prompt("Title:");
  if (key && title) { dataJ[key] = { title, topics: [] }; renderTree(dataJ); }
  console.log('fetched json:', dataJ);
}

function addTopic() {
  if (!currentSelection || currentSelection.type !== 'lesson'){
    return alert("Please select a lesson first");
  }
  const key = currentSelection.key;
  if (!dataJ[key]) return alert("Lesson not found");
  const name = prompt("Topic name:");
  const type = prompt("Type (questions/meanings/fillblanks):");
  if (name && type) {
    dataJ[key].topics.push({ topic: name.trim(), topic_type: type.trim(), sub_topics: [] });
    renderTree(dataJ);
    // setTimeout(() =>{
    //   const lessonNode = document.querySelector('.tree-node.lesson');
    //   if (lessonNode && !lessonNode.classList.contains('open')) {
    //     lessonNode.classList.add('open');
    //     lessonNode.querySelector('.children').computedStyleMap.display = 'block';
    //     }
    // }, 100);
  }
}

function addQA(){
  if (!currentSelection || currentSelection.type !== 'topic'){
    return alert("Please select a topic first")
  }
  const {key, ti} = currentSelection;
  const q = prompt("Question : ");
  const a = prompt("Answer : ");
  if(q && a){
    dataJ[key].topics[ti].sub_topics.push({
      q: q,
      a: a
    });
  renderTree(dataJ);
  }
}

function updateLesson(key) {
  dataJ[key].title = document.getElementById('editTitle').value;
  renderTree(dataJ);
}

function updateTopic(key, ti) {
  dataJ[key].topics[ti].topic = document.getElementById('editTopicName').value;
  dataJ[key].topics[ti].topic_type = document.getElementById('editTopicType').value;
  renderTree(dataJ);
}

function updateQA(key, ti, qi) {
  dataJ[key].topics[ti].sub_topics[qi].q = document.getElementById('editQ').value;
  dataJ[key].topics[ti].sub_topics[qi].a = document.getElementById('editA').value;
  renderTree(dataJ);
}

function deleteLesson(key) {
  confirm("Delete lesson?") && (delete dataJ[key], renderTree(dataJ), contentArea.innerHTML = '<div class="welcome"><h1>Select an item</h1></div>')
}

function deleteQA(key, ti, qi) {
  confirm("Delete?") && (dataJ[key].topics[ti].sub_topics.splice(qi, 1), renderTree())
}

function exportData() {
  const blob = new Blob([JSON.stringify(dataJ, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'hindi-data.json'; a.click();
}
