const todo = document.getElementById('todo');
const content = document.getElementById('content');

// 모달창 
const modal = document.getElementById('modal');
const btnDelete = document.getElementById('delete');
const todoNo = document.getElementById('todoNo');
// 우선순위 관련
const btnImportant = document.querySelector('.toggle-btn');
const optionList = document.querySelector('.selectbox-option');
// 매모
const memo = document.getElementById('memo');

// SPA FIXME: 여기 좀 많이 손봐야 할 듯
window.onload = function() {
    axios.get('./view/main.html')
    .then(function(res) {
        console.log('Main Loaded');
        content.innerHTML = res.request.responseText;
        const main = document.querySelector('.main');
        handleData();
        handleCount();
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
            div.children[1].style = 'background-color : #67C23A;opacity:1;';
            div.classList.add('complete');
            handleComplete(div);
        } 
        // info 버튼 이벤트
        else if(e.target.className === 'material-symbols-outlined') {
            // 여기에 함수 호출하면 될 듯?
            let no = e.target.dataset.no;
            handleSelectOneTodo(no);
        }
        // 남은것들
        else if(e.target !== e.currentTarget) {
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
        el.classList.remove('complete');
    }, 500);
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
        handleCount();
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
    const url = `http://127.0.0.1:8088/todo/select.json?text=&page=${page}&select=1`;
    const headers = {
        "Content-Type" : "application/json"
    }
    const { data } = await axios.get(url, {headers});
    if(data.status === 200) {
        handleTodoIn(data, main);
    }
}

// completed 목록 가져오기
async function handleCompleteData(page) {
    const main = document.querySelector('.main');
    const url = `http://127.0.0.1:8088/todo/selectcomplete.json?page=${page}`;
    const headers = {
        "Content-Type" : "application/json"
    };
    const { data } = await axios.get(url, {headers});
    if(data.status === 200) {
        handleCompleteIn(data, main);
    }
}

// 컴플리트 데이터 렌더링
function handleCompleteIn(data, main) {
    main.innerHTML = "";
    console.log(data);
    let delay = 0;
    for(let i = 0; i < data.result.length; i++) {
        delay += 80;
        setTimeout(async () => {
            let div = document.createElement('div');
            let todos = document.createElement('input');
            let chk = document.createElement('input');
            let info = document.createElement('span');
            let important = document.createElement('span');
            important.classList.add('important');
            if(data.result[i].important == '3') {
                important.innerText = '!!!';
            } else if(data.result[i].important == '2') {
                important.innerText = ' !!';
            } else if(data.result[i].important == '1') {
                important.innerText = '  !';
            } else {
                important.innerText = '';
            }
            div.classList.add('todo-list');
            chk.setAttribute('type', 'checkbox');
            chk.classList.add('chk');
            chk.setAttribute('data-no', data.result[i]._id);
            chk.value = (data.result[i].chk);
            todos.setAttribute('value', data.result[i].title);
            todos.setAttribute('data-no', data.result[i]._id);
            todos.classList.add('input', 'todos');
            todos.setAttribute('readonly', true);
            chk.setAttribute('checked', true);
            chk.setAttribute('disabled', true);
            info.classList.add('material-symbols-outlined');
            info.setAttribute('data-no', data.result[i]._id);
            info.innerText = 'info';
            let infoDiv = document.createElement('div');
            infoDiv.appendChild(info);
            infoDiv.classList.add('info');
            div.appendChild(important);
            div.appendChild(chk);
            div.appendChild(todos);
            div.appendChild(infoDiv);
            main.appendChild(div);
        }, delay);
    }
}

// todo 목록 / 완료된 목록
const btnCount = document.getElementById('count');
const btnComplete = document.getElementById('complete');
btnComplete.addEventListener('click', function() {
    completeWithClass();
});
btnCount.addEventListener('click', function() {
    todoWithClass();
});
function todoWithClass() {
    handleData();
    btnComplete.classList.remove('on');
    btnCount.classList.add('on');
}
function completeWithClass() {
    handleCompleteData();
    btnCount.classList.remove('on');
    btnComplete.classList.add('on');
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
            let info = document.createElement('span');
            let important = document.createElement('span');
            important.classList.add('important');
            important.setAttribute('data-no', data.result[i]._id);
            if(data.result[i].important == '3') {
                important.innerText = '!!!';
            } else if(data.result[i].important == '2') {
                important.innerText = ' !!';
            } else if(data.result[i].important == '1') {
                important.innerText = '  !';
            } else {
                important.innerText = '   ';
            }
            div.classList.add('todo-list');
            chk.setAttribute('type', 'checkbox');
            chk.classList.add('chk');
            chk.setAttribute('data-no', data.result[i]._id);
            chk.value = (data.result[i].chk);
            todos.setAttribute('value', data.result[i].title);
            todos.setAttribute('data-no', data.result[i]._id);
            todos.classList.add('input', 'todos');
            info.classList.add('material-symbols-outlined');
            info.setAttribute('data-no', data.result[i]._id);
            info.innerText = 'info';
            let infoDiv = document.createElement('div');
            infoDiv.appendChild(info);
            infoDiv.classList.add('info');
            div.appendChild(important);
            div.appendChild(chk);
            div.appendChild(todos);
            div.appendChild(infoDiv);
            main.appendChild(div);
        }, delay);
    }
}

// 할일 개수, 완료한 개수
async function handleCount() {
    const url = `http://127.0.0.1:8088/todo/count.json`;
    const headers = {
        "Content-Type" : "application/json"
    };
    const { data } = await axios.get(url, {headers});
    
    if(data.status === 200) {
        const count = document.getElementById('count');
        const complete = document.getElementById('complete');
        count.innerHTML = `todo : ${data.todo}`;
        complete.innerHTML = `completed : ${data.completed}`;
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

// todo insert request
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
            handleCount();
            todo.value = "";
        };
    }
};

// todo 한개 조회
async function handleSelectOneTodo(no) {
    const url = `http://127.0.0.1:8088/todo/selectone.json?no=${no}`;
    const headers = {
        'Content-Type' : 'application/json'
    };
    const { data } = await axios.get(url, {headers});
    if(data.status === 200) {
        console.log(data);
        modal.style.display = 'block';
        const title = document.getElementById('title');
        title.innerText = data.result.title;
        todoNo.setAttribute('data-no', data.result._id);
        todoNo.setAttribute('data-chk', data.result.chk);
        if(data.result.chk !== 1) {
            memo.contentEditable = false;
        }
        memo.innerText = data.result.memo;
        let arrImportant = ['없음', '낮음', '중간', '높음'];
        btnImportant.innerText = '우선 순위 : ' + arrImportant[data.result.important];
    }
}

// todo 삭제 이벤트
btnDelete.addEventListener('click', async function() {
    if(confirm('삭제하시겠습니까?')) {
        let no = todoNo.dataset.no;
        let chk = todoNo.dataset.chk;
        const url = `http://127.0.0.1:8088/todo/delete.json`;
        const body = {
            no : no
        };
        const headers = {
            "Content-Type" : "application/json"
        };

        const { data } = await axios.post(url, body, {headers});
        if(data.status === 200) {
            if(chk == 1) {
                todoWithClass();
            } else if (chk == 2) {
                completeWithClass();
            }
            console.log('삭제되었습니다.');
            modal.style.display = 'none';
        }
    }
})

// 모달창 끄기
modal.addEventListener('click', function(e) {
    if(e.target !== e.currentTarget) {

    } else {
        modal.style.display = 'none';

    }
});

// 우선순위 옵션 토글
btnImportant.addEventListener('click', function() {
    if(todoNo.dataset.chk === "1") {
        optionList.classList.toggle('hide');
    }
});
// 우선순위 버튼 외부 영역 누르면 꺼짐
modal.addEventListener('click', function(e) {
    if(!e.target.classList.contains('toggle-btn')&&
    !e.target.classList.contains('selectbox-option')) {
        optionList.classList.add('hide');
    }
});

// 우선순위 수정
optionList.addEventListener('click', async function(e) {
    if(e.target !== e.currentTarget) {
        let important = e.target.value;
        console.log(important);
        const url = `http://127.0.0.1:8088/todo/important.json`;
        const body = {
            no : todoNo.dataset.no,
            important : important
        };
        const headers = {
            "Content-Type" : "application/json"
        };
        const { data } = await axios.put(url, body, {headers});
        if(data.status === 200) {
            let arrImportant = ['없음', '낮음', '중간', '높음'];
            btnImportant.innerText = '우선 순위 : ' + arrImportant[important];
            // querySelector 로도 data- 에 접근할 수 있다
            let important1 = document.querySelector(`.important[data-no='${todoNo.dataset.no}']`);
            if(important == '3') {
                important1.innerText = '!!!';
            } else if(important == '2') {
                important1.innerText = ' !!';
            } else if(important == '1') {
                important1.innerText = '  !';
            } else {
                important1.innerText = " ";
            }
        }
    }
});

memo.addEventListener('focusout', async function(e) {
    if(memo.innerText !== "") {
        const memo = this.innerText;
        console.log(memo);
        const url = `http://127.0.0.1:8088/todo/memo.json`;
        const body = {
            no : todoNo.dataset.no,
            memo : memo
        };
        const headers = {
            "Content-Type" : "application/json"
        };
        const { data } = await axios.put(url, body, {headers});
        if(data.status === 200) {
            this.innerText = memo;
        }
    }
});