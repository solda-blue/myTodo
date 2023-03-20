const todo = document.getElementById('todo');
const content = document.getElementById('content');

// SPA FIXME: 여기 좀 많이 손봐야 할 듯
window.onload = function() {
    axios.get('./view/main.html')
    .then(function(res) {
        console.log('Main Loaded');
        content.innerHTML = res.request.responseText;
        const main = document.querySelector('.main');
        handleData();
        handleCheck();
    })
    .catch(function(err) {
        console.log(err);
    })
};

// 완료 
function handleCheck() {
    const main = document.querySelector('.main');
    main.addEventListener('click', function(e) {
        if(e.target.type === 'checkbox') {
            // console.log(e.target.parentElement);
            let div = e.target.parentElement;
            div.classList.add('complete');
            handleComplete(div);
        } else if (e.target !== e.currentTarget) {
            let putTodo = e.target;
            console.log(putTodo);
            putTodo.addEventListener('keydown', ({ key, isComposing }) => {
                if (isComposing) {
                  return
                }
                if (key !== "Enter") {
                  return
                }
                handleUpdate(putTodo.dataset.no, putTodo.value);
            });
        }
    })
}

// 완료
function handleComplete(el) {
    let no = el.firstChild.dataset.no;
    handlePutCheck(no);
    setTimeout(() => {
        el.style.display = 'none';
        el.classList.remove('todo-list');
    }, 500)
}

// 완료 요청
async function handlePutCheck(no) {
    const url = 'http://127.0.0.1:8088/todo/complete.json';
    const headers = {
        "Content-Type" : "application/json"
    };
    const body = {
        no : no
    };
    const { data } = await axios.put(url, body, {headers});
    if(data.status === 200) {
        console.log(data);
    }
}

// FIXME: put 이벤트 추가하기
async function handleUpdate(no, title) {
    const url = `http://127.0.0.1:8088/todo/update.json`;
    const headers = {
        "Content-Type" : "application/json"
    };
    const body = {
        no : no,
        title : title
    };
    const { data } = await axios.put(url, body, {headers});
    console.log(data);
    if(data.status === 200) {
        handleData();
    }
}

// todo 목록 가져오기
async function handleData(page) {
    const main = document.querySelector('.main');
    const url = `http://127.0.0.1:8088/todo/select.json?text=&page=${page}`;
    const headers = {
        "Content-Type" : "application/json"
    }
    const { data } = await axios.get(url, {headers});
    if(data.status === 200) {
        handleTodoIn(data, main);
    }
}

// 가져온 데이터 렌더링
function handleTodoIn(data, main) {
    main.innerHTML = "";
    console.log(data);
    let delay = 0;
    for(let i = 0; i < data.result.length; i++) {
        delay += 80;
        setTimeout(async () => {
            let div = document.createElement('div');
            let todos = document.createElement('input');
            let chk = document.createElement('input');
            div.classList.add('todo-list');
            chk.setAttribute('type', 'checkbox');
            chk.classList.add('chk');
            chk.setAttribute('data-no', data.result[i]._id);
            chk.value = (data.result[i].chk);
            todos.setAttribute('value', data.result[i].title);
            todos.setAttribute('data-no', data.result[i]._id);
            todos.classList.add('input', 'todos');
            // todos.setAttribute('readonly', true);
            div.appendChild(chk);
            div.appendChild(todos);
            main.appendChild(div);
        }, delay);
    }
}

// todo insert
todo.addEventListener('keydown', ({ key, isComposing }) => {
    if (isComposing) {
      return
    }
    if (key !== "Enter") {
      return
    }
    console.log(todo.value);
    handleInsert();
});

todo.addEventListener('focusout', () => {
    todo.value = "";
});

// todo request
const handleInsert = async () => {
    if((todo.value.trim() !== "")) {
        const url = 'http://127.0.0.1:8088/todo/insert.json';
        const headers = {"Content-Type":"application/json"};
        const body = {
            title : todo.value
        }
        const { data } = await axios.post(url, body, {headers});
        if(data.status === 200) {
            console.log(data.result);
            handleData();
            todo.value = "";
        };
    }
};