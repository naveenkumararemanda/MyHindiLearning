// app.js
const App = (() => {
  let data = JSON.parse(localStorage.getItem('hindiData') || JSON.stringify(DEFAULT_DATA));
  if (!localStorage.getItem('hindiData')) localStorage.setItem('hindiData', JSON.stringify(DEFAULT_DATA));

  const save = () => localStorage.setItem('hindiData', JSON.stringify(data));
  const $ = s => document.querySelector(s);
  const tree = $('#tree');
  const contentArea = $('#contentArea');

  const renderTree = () => {
    tree.innerHTML = '';
    Object.keys(data).forEach(key => {
      const lesson = data[key];
      const lessonNode = document.createElement('div');
      lessonNode.className = 'tree-node lesson';
      lessonNode.textContent = lesson.title;
      lessonNode.onclick = (e) => { e.stopPropagation(); select('lesson', key); toggle(lessonNode); };
      tree.appendChild(lessonNode);

      lesson.topics.forEach((topic, ti) => {
        const topicNode = document.createElement('div');
        topicNode.className = 'tree-node topic';
        topicNode.textContent = topic.topic;
        topicNode.onclick = (e) => { e.stopPropagation(); select('topic', key, ti); };
        lessonNode.appendChild(topicNode);

        topic.sub_topics.forEach((item, qi) => {
          const qNode = document.createElement('div');
          qNode.className = 'tree-node question';
          qNode.textContent = item.q.substring(0, 50) + (item.q.length > 50 ? '...' : '');
          qNode.onclick = (e) => { e.stopPropagation(); select('qa', key, ti, qi); };
          topicNode.appendChild(qNode);
        });
      });
    });
  };

  const toggle = (node) => node.classList.toggle('open');
  const clearSelection = () => document.querySelectorAll('.tree-node').forEach(n => n.classList.remove('selected'));

  const select = (type, key, ti, qi) => {
    clearSelection();
    event.target.classList.add('selected');

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
        <button class="btn success" onclick="App.updateLesson('${key}')">Save</button>
        <button class="btn danger" onclick="App.deleteLesson('${key}')">Delete Lesson</button>
      </div>`;
  };

  const showTopicEditor = (key, ti) => {
    const t = data[key].topics[ti];
    contentArea.innerHTML = `
      <div class="editor">
        <h3>Edit Topic</h3>
        <input type="text" value="${t.topic}" id="editTopicName" />
        <input type="text" value="${t.topic_type}" id="editTopicType" placeholder="questions / meanings / fillblanks" />
        <button class="btn success" onclick="App.updateTopic('${key}',${ti})">Save</button>
      </div>`;
  };

  const showQAEditor = (key, ti, qi) => {
    const item = data[key].topics[ti].sub_topics[qi];
    contentArea.innerHTML = `
      <div class="editor">
        <h3>Edit Question/Meaning</h3>
        <textarea id="editQ">${item.q}</textarea>
        <textarea id="editA">${item.a}</textarea>
        <button class="btn success" onclick="App.updateQA('${key}',${ti},${qi})">Save</button>
        <button class="btn danger" onclick="App.deleteQA('${key}',${ti},${qi})">Delete</button>
      </div>`;
  };

  return {
    renderTree,
    addLesson: () => {
      const key = prompt("Key (e.g. lesson10):");
      const title = prompt("Title:");
      if (key && title) { data[key] = { title, topics: [] }; save(); renderTree(); }
    },
    addTopic: () => {
      const key = prompt("Lesson key:");
      if (!data[key]) return alert("Lesson not found");
      const name = prompt("Topic name:");
      const type = prompt("Type (questions/meanings/fillblanks):");
      if (name && type) {
        data[key].topics.push({ topic: name, topic_type: type, sub_topics: [] });
        save(); renderTree();
      }
    },
    updateLesson: (key) => {
      data[key].title = $('#editTitle').value;
      save(); renderTree();
    },
    updateTopic: (key, ti) => {
      data[key].topics[ti].topic = $('#editTopicName').value;
      data[key].topics[ti].topic_type = $('#editTopicType').value;
      save(); renderTree();
    },
    updateQA: (key, ti, qi) => {
      data[key].topics[ti].sub_topics[qi].q = $('#editQ').value;
      data[key].topics[ti].sub_topics[qi].a = $('#editA').value;
      save(); renderTree();
    },
    deleteLesson: (key) => confirm("Delete lesson?") && (delete data[key], save(), renderTree(), contentArea.innerHTML = '<div class="welcome"><h1>Select an item</h1></div>'),
    deleteQA: (key, ti, qi) => confirm("Delete?") && (data[key].topics[ti].sub_topics.splice(qi,1), save(), renderTree()),
    exportData: () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'hindi-data.json'; a.click();
    },
    importData: (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = ev => { data = JSON.parse(ev.target.result); save(); renderTree(); alert("Imported!"); };
      r.readAsText(file);
    },
    clearAll: () => confirm("Delete everything?") && (localStorage.clear(), location.reload())
  };
})();

App.renderTree();