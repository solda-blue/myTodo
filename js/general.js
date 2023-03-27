const todo = document.getElementById('todo');
const content = document.getElementById('content');

// todo & 완료 버튼
const btnCount = document.getElementById('count');
const btnComplete = document.getElementById('complete');
const tabBorder = document.querySelector('.tab-border');
// 모달창 
const modal = document.getElementById('modal');
const todoOne = document.querySelector('.todo-one');
const btnDelete = document.getElementById('delete');
const todoNo = document.getElementById('todoNo');
// 우선순위 관련
const btnImportant = document.querySelector('.toggle-btn');
const optionList = document.querySelector('.selectbox-option');
// 매모
const memo = document.getElementById('memo');

// 현재 보여주는 목록이 뭔지 알려주는 변수
let listNow = 1;
// SPA FIXME: 여기 좀 많이 손봐야 할 듯
window.onload = function() {
    axios.get('./view/main.html')
    .then(function(res) {
        console.log('Main Loaded');
        content.innerHTML = res.request.responseText;
        const main = document.querySelector('.main');
        onMounted();
    })
    .catch(function(err) {
        console.log(err);
    })
};
window.addEventListener('resize', function() {
    let left = 0;
    if(listNow === 1) {
        left = btnCount.getBoundingClientRect().left;
    } else if(listNow === 2) {
        left = btnComplete.getBoundingClientRect().left;
    }
    tabBorder.style.left = `${left}px`;
})
// 브라우저 실행시 함수모음
async function onMounted() {
    await handleData(select);
    await handleCount();
    handleTab(btnCount);
    handleCheck();
}

// input 이벤트 모음
function handleCheck() {
    const main = document.querySelector('.main');
    main.addEventListener('click', function(e) {
        // 체크 이벤트
        if(e.target.type === 'checkbox') {
            // console.log(e.target.parentElement);
            let div = e.target.parentElement;
            handleComplete(div);
        } 
        // info 버튼 이벤트
        else if(e.target.className === 'info') {
            // 여기에 함수 호출하면 될 듯?
            let no = e.target.dataset.no;
            handleSelectOneTodo(no);
        }
        // title 수정 이벤트
        else if(e.target !== e.currentTarget) {
            let putTodo = e.target;
            console.log(putTodo);
            // 클릭시 이벤트 생성
            putTodo.addEventListener('keydown', updateTitle);
            putTodo.addEventListener('focusout', updateTitleFocus);
        }
    });
}

// input 클릭시 업데이트 이벤트 한번 실행하고 실행후 바로 종료
// 여기서 말하는 this는 이 이벤트가 달린 태그를 뜻함(바로 위에 있는 putTodo)
function updateTitle({ key, isComposing }) {
    if (isComposing) {
        return
      }
      if (key !== "Enter") {
        return
      }
      handleUpdate(this.dataset.no, this.value);
      // 작업을 끝내고 이벤트 삭제시켜서 중복 호출 안되게
      this.removeEventListener('keydown', updateTitle);
      this.removeEventListener('focusout', updateTitleFocus);
      // input에 걸려있던 focus 해제
      this.blur();
};
function updateTitleFocus() {
    handleUpdate(this.dataset.no, this.value);
    this.removeEventListener('keydown', updateTitle);
    this.removeEventListener('focusout', updateTitleFocus);
}

// 완료 에니메이션 위주
function handleComplete(el) {
    let no = el.firstChild.dataset.no;
    // 완료 요청 보내기
    handlePutCheck(no);
    // css 애니메이션이랑 시간을 맞춰야 함
    el.children[2].classList.add('complete-color');
    el.classList.add('complete');
    setTimeout(() => {
        el.style.display = 'none';
        el.classList.remove('todo-list');
        el.classList.remove('complete');
        // el.children[2].classList.remove('complete-color');
    }, 1500);
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
    if(data.status === 200) {
        // handleData(select);
        handleNoti('수정되었습니다');
    }
    console.log(data);
}

// todo 목록 가져오기
async function handleData(select, page) {
    const url = `http://127.0.0.1:8088/todo/select.json?text=&page=${page}&select=${select}`;
    const headers = {
        "Content-Type" : "application/json"
    }
    const { data } = await axios.get(url, {headers});
    if(data.status === 200) {
        handleTodoIn(data);
    }
}

// completed 목록 가져오기
async function handleCompleteData(page) {
    const url = `http://127.0.0.1:8088/todo/selectcomplete.json?page=${page}`;
    const headers = {
        "Content-Type" : "application/json"
    };
    const { data } = await axios.get(url, {headers});
    if(data.status === 200) {
        handleTodoIn(data);
    }
}

// 가져온 데이터 렌더링
function handleTodoIn(data) {
    const main = document.getElementById('main');
    main.innerHTML = "";
    console.log(data);
    let delay = 0;
    for(let i = 0; i < data.result.length; i++) {
        delay += 80;
        setTimeout(async () => {
            let frame = makeTodoFrame();
            for(let j = 0; j < 4; j++) {
                frame.children[j].setAttribute('data-no', data.result[i]._id);
            };
            frame.children[2].setAttribute('value', data.result[i].title);
            // switch 문으로 중요도 확인해서 빨리 추가
            let important = frame.children[1];
            switch(data.result[i].important) {
                case '3' : important.innerText = '!!!'; break;
                case '2' : important.innerText = ' !!'; break;
                    // important.style.color = 'orangered'; break;
                case '1' : important.innerText = '  !'; break;
                    // important.style.color = 'orange'; break;
                default : important.innerText = '  ';
            };
            if(data.result[i].chk === 2) {
                frame.children[0].setAttribute('checked', true);
                frame.children[0].setAttribute('disabled', true);
                frame.children[2].setAttribute('readonly', true);
            };
            main.appendChild(frame);
        }, delay);
    }
};

// todo-list 형식만 따로 
function makeTodoFrame() {
    // 태그 생성
    let div = document.createElement('div');
    let chk = document.createElement('input');
    let important = document.createElement('span');
    let todos = document.createElement('input');
    let info = document.createElement('img');
    // 태그 style
    div.classList.add('todo-list');
    chk.setAttribute('type', 'checkbox');
    chk.classList.add('chk');
    important.classList.add('important');
    todos.classList.add('input', 'todos');
    todos.setAttribute('maxlength', 50);
    info.classList.add('info');
    info.setAttribute('src', '/assets/svg/info.svg');
    // div 안에 태그 넣기
    div.appendChild(chk);
    div.appendChild(important);
    div.appendChild(todos);
    div.appendChild(info);
    return div;
}

// todo 목록 / 완료된 목록
btnComplete.addEventListener('click', completeWithClass);
btnCount.addEventListener('click', todoWithClass);

function handleTab(el) {
    let width = el.clientWidth;
    let left = el.getBoundingClientRect().left;
    // console.log(width, left);
    tabBorder.style.width = `${width}px`;
    tabBorder.style.left = `${left}px`;
    console.log(tabBorder.clientWidth, tabBorder.getBoundingClientRect().left);
}

function todoWithClass() {
    handleTab(this);
    listNow = 1;
    // 리스트가 렌더링 되기 전까지 연속적으로 클릭 못하도록 일단 이벤트 삭제 하고
    // 리스트가 모두 렌더링 됐을 때 다시 이벤트 붙여주기
    btnComplete.removeEventListener('click', completeWithClass);
    btnCount.removeEventListener('click', todoWithClass);
    btnCompleteDelete.removeEventListener('click', DeleteAllCompleted);
    handleData(select);
    btnComplete.classList.remove('on');
    btnCount.classList.add('on');
    btnCompleteDelete.classList.remove('active');
    btnSort.classList.add('active');

    // 렌더링 되야하는 list 개수 카운팅해서 애니메이션 시간 계산
    let count = document.getElementById('count').firstElementChild;
    let num = Number(count.dataset.count);
    if(num > 10) {
        num = 10;
    }
    // 위의 계산한 시간 동안 버튼 이벤트 막아두기
    setTimeout(addEvent, (num * 80) + 300);
};
function completeWithClass() {
    handleTab(this);
    listNow = 2;
    btnCount.removeEventListener('click', todoWithClass);
    btnComplete.removeEventListener('click', completeWithClass);
    btnCompleteDelete.removeEventListener('click', DeleteAllCompleted);
    handleCompleteData();
    btnCount.classList.remove('on');
    btnComplete.classList.add('on');
    btnSort.classList.remove('active');
    btnCompleteDelete.classList.add('active');

    // 렌더링 되야하는 list 개수 카운팅해서 애니메이션 시간 계산
    let complete = document.getElementById('complete').firstElementChild;
    let num = Number(complete.dataset.count);
    if(num > 10) {
        num = 10;
    }
    // 위의 계산한 시간 동안 버튼 이벤트 막아두기
    setTimeout(addEvent, (num * 80) + 300);
};
// 이렇게 따로 함수로 만들어서 setTimeout에 넣어야 작동하네
function addEvent() {
    btnCount.addEventListener('click', todoWithClass);
    btnComplete.addEventListener('click', completeWithClass);
    btnCompleteDelete.addEventListener('click', DeleteAllCompleted);
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
        count.innerHTML = `<span data-count=${data.todo}>todo : ${data.todo}</span>`;
        complete.innerHTML = `<span data-count=${data.completed}>
                                completed : ${data.completed}</span>`;
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
            // list가 todo 일때만 화면에 추가
            if(listNow === 1) {
                let frame = makeTodoFrame();
                for(let i = 0; i < 4; i++) {
                    frame.children[i].setAttribute('data-no', data.result._id);
                };
                frame.children[2].setAttribute('value', data.result.title);
                document.getElementById('main').prepend(frame);
            } else if(listNow === 2) {
                // completed 일 때 추가하면 todo 페이지도 같이 보여줌
                todoWithClass();
            }
            handleCount();
            todo.value = "";
        };
        console.log(data);
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
        modal.style.display = 'flex';
        todoOne.style.animation = 'scaleup 0.3s';
        const title = document.getElementById('title');
        title.innerText = data.result.title;
        todoNo.setAttribute('data-no', data.result._id);
        todoNo.setAttribute('data-chk', data.result.chk);
        if(data.result.chk !== 1) {
            memo.contentEditable = false;
        };
        memo.innerText = data.result.memo;
        let arrImportant = ['없음', '낮음', '중간', '높음'];
        btnImportant.innerText = '우선 순위 : ' + arrImportant[data.result.important];
    }
}

// todo 삭제 이벤트
btnDelete.addEventListener('click', async function() {
    // TODO: dialogue 창도 되면 만들자
    // if(confirm('삭제하시겠습니까?')) {
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
            handleNoti('삭제되었습니다')
            closeModal();
        }
    // }
})

// 모달창 끄기
modal.addEventListener('click', function(e) {
    if(e.target !== e.currentTarget) {
        
    } else {
        closeModal();
    }
});

// setTime으로 모달 닫기 animation용
function closeModal() {
    todoOne.style.animation = 'scaledown 0.3s';
    setTimeout(() => {modal.style.display = 'none';}, 200);
}

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
            switch(important) {
                case '3' : important1.innerText = '!!!'; important1.style.color = 'deeppink';break;
                case '2' : important1.innerText = '!! '; important1.style.color = 'orangered'; break;
                case '1' : important1.innerText = '!  '; important1.style.color = 'yellow';break;
                default : important1.innerText = '   '; break;
            }
        }
    }
});

// 메모 수정
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