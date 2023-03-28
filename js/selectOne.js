// 모달창 
const modal = document.getElementById('modal');
const todoOne = document.querySelector('.todo-one');
const btnDelete = document.getElementById('delete');
const todoNo = document.getElementById('todoNo');
// 우선순위 관련
const btnImportant = document.getElementById('btnImportant');
const optionList = document.querySelector('.selectbox-option');
// 목표일 관련
const btnGoal = document.getElementById('btnGoal');
const btnMonth = document.getElementById('btnMonth');
const goalOptionList = document.querySelector('.daybox-option');
const btnDay = document.getElementById('btnDay');
const monthList = document.querySelector('.month-option');
const dayList = document.querySelector('.day-option');
// 매모
const memo = document.getElementById('memo');

// makeDay();

function makeDay() {
    for(let i = 0; i < 31; i++) {
        let day = document.createElement('button');
        day.innerText = i + 1;
        day.classList.add('day-btn');
        dayList.appendChild(day);
    }
}

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
            handleNoti('삭제되었습니다');
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

btnMonth.addEventListener('mouseover', function() {
    if(todoNo.dataset.chk === '1') {
        monthList.classList.add('month-option-on');
        console.log('hi');
    }
});
btnMonth.addEventListener('mouseleave', function() {
    if(todoNo.dataset.chk === '1') {
        monthList.classList.remove('month-option-on');
    }
})

// 목표일 옵션 토글
btnGoal.addEventListener('click', function() {
    if(todoNo.dataset.chk === "1") {
        if(!this.classList.contains('days-btn-on')) {
            this.classList.add('days-btn-on');
            goalOptionList.classList.add('daybox-option-on');
        } else {
            this.classList.remove('days-btn-on');
            goalOptionList.classList.add('daybox-option-on');
        }
    }
});

// 우선순위 옵션 토글
btnImportant.addEventListener('click', function() {
    if(todoNo.dataset.chk === "1") {
        if(!this.classList.contains('toggle-btn-on')) {
            this.classList.add('toggle-btn-on');
            optionList.classList.add('selectbox-option-on');
        } else {
            this.classList.remove('toggle-btn-on');
            optionList.classList.add('selectbox-option-on');
        }
    }
});
// 우선순위 버튼 외부 영역 누르면 꺼짐
modal.addEventListener('click', function(e) {
    if(!e.target.classList.contains('toggle-btn-on')&&
    !e.target.classList.contains('selectbox-option')) {
        optionList.classList.remove('selectbox-option-on');
        btnImportant.classList.remove('toggle-btn-on');
    }
    if(!e.target.classList.contains('days-btn-on')&&
    !e.target.classList.contains('daybox-option')) {
        goalOptionList.classList.remove('daybox-option-on');
        btnGoal.classList.remove('days-btn-on');
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
                case '3' : important1.innerText = '!!!'; break;
                case '2' : important1.innerText = '!! '; break;
                case '1' : important1.innerText = '!  '; break;
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