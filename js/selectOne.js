// 모달창 
const modal = document.getElementById('modal');
const todoOne = document.querySelector('.todo-one');
const btnDelete = document.getElementById('delete');
const todoNo = document.getElementById('todoNo');
// 우선순위 관련
const btnImportant = document.getElementById('btnImportant');
const optionList = document.querySelector('.selectbox-option');
// 목표일 관련
const goalOptionList = document.querySelector('.daybox-option');
const btnGoal = document.getElementById('btnGoal');
const btnMonth = document.getElementById('btnMonth');
const btnDay = document.getElementById('btnDay');
const monthList = document.querySelector('.month-option');
const dayList = document.querySelector('.day-option');
const dayBox = document.querySelector('.day-box');
// 목표일 삭제버튼
const btnGoalDelete = document.getElementById('btnGoalDelete');
// 메모
const memo = document.getElementById('memo');

// 월에 따라서 일수 조정
function makeDay(num) {
    let count = dayList.childElementCount;
    for(let i = 0; i < count; i++) {
        dayList.firstChild.remove()
    }
    for(let i = 0; i < num; i++) {
        let day = document.createElement('button');
        day.innerText = i + 1;
        if(i < 9) {
            day.setAttribute('data-day', '0' + (i+1));
        } else {
            day.setAttribute('data-day', i+1);
        }
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
        let day = data.result.day;
        renderDay(day);

        if(data.result.day !== '' && data.result.day !== '없음') {
            // 처음 렌더링 될 때 현재 설정된 월에 따라서 카운트
            let count = day.slice(-5, -3);
            let child = monthList.children[count-1].dataset.cnt;
            makeDay(child);
        } else {
            makeDay(31);
        }
        // 목표일 삭제 버튼 & 메소드
        let width =  btnGoal.clientWidth;
        btnGoalDelete.style.left = `${width-11}px`;
        // 목표일 유무를 확인하여서 삭제버튼 띄울지 말지 표시
        if(btnGoal.innerText.includes('없음')) {
            btnGoalDelete.classList.add('disabled');
        // chk == 1 일때만 보여주기
        } else if(data.result.chk != 1) {
            btnGoalDelete.classList.add('disabled');
        }
        else {
            btnGoalDelete.classList.remove('disabled');
        }
    }
}

// todoOne 모달에서 날짜 버튼에 날짜 보여주는 방식
function renderDay(val) {
    if(val === '없음' || val === '') {
        btnGoal.innerText = '날짜 : 없음';
    } else {
        // 구분자로 잘라서 년, 월, 일 값을 배열로 담음
        let arr = val.split('-');
        // 구조분해 할당으로 월과 일을 각각 month, day 라는 변수에 담음
        let [_, month, day] = arr;
        let month1 = '';
        let day1 = '';
        // 한자리 월과 일의 앞의 0을 제거하고 변수에 담음
        if(month[0] == 0) {
            month1 = month.slice(1);
        } else {
            month1 = month;
        }
        if(day[0] == 0) {
            day1 = day.slice(1);
        } else {
            day1 = day;
        }
        // 월과 일에 초기 값 : xx 일때 빼고 출력
        if(day === 'xx') {
            btnGoal.innerText = `날짜 : ${month1}월`;
        } else if(month == 'xx') {
            btnGoal.innerText = `날짜 : ${day1}일`;
        } else {
            btnGoal.innerText = `날짜 : ${month1}월 ${day1}일`;
        }
    }
};

// todo 삭제 이벤트
btnDelete.addEventListener('click', async function() {
    // TODO: dialogue 창도 되면 만들자
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
            handleNoti('삭제되었습니다');
            closeModal();
            handleCount();
        }
    }
})

// 모달창 끄기
modal.addEventListener('click', function(e) {
    if(e.target !== e.currentTarget) {
        
    } else {
        btnGoal.classList.remove('days-btn-on');
        btnImportant.classList.remove('toggle-btn-on');
        goalOptionList.classList.remove('daybox-option-on');
        optionList.classList.remove('selectbox-option-on');
        closeModal();
    }
});

// setTime으로 모달 닫기 animation용
function closeModal() {
    todoOne.style.animation = 'scaledown 0.3s';
    setTimeout(() => {modal.style.display = 'none';}, 200);
}

// 날짜 월 바꾸기
monthList.addEventListener('click', async function(e) {
    if(e.target !== e.currentTarget) {
        let month = e.target.dataset.month;
        // 월별로 일수 동적으로 생성 FIXME: 좀더 단순하게 만들 수 있을 듯
        let cnt = e.target.dataset.cnt;
        makeDay(cnt);
        
        const url = `http://127.0.0.1:8088/todo/updatemonth.json`;
        const headers = {
            "Content-Type":"application/json"
        };
        const body = {
            no : todoNo.dataset.no,
            month : month
        };
        const { data } = await axios.put(url, body, {headers});
        if(data.status === 200) {
            console.log(data.result);
            let day = data.result.day.slice(-2);
            // 아직 일수가 정해져있지 않을 땐 월만 그린다
            if(day.includes('xx')) {
                console.log('신규');
                renderDay(data.result.day);
            } else {
                // 미리 설정한 일수가 새로 바꾼 달의 일수보다 많을 때 그 달의 제일 마지막 일로 다시 저장
                if(day > cnt) {
                    handleUpdateDay(cnt);
                } else {
                    renderDay(data.result.day);
                }
            }
            monthList.classList.remove('month-option-on');
            handleSelectOneTodo(todoNo.dataset.no);
        }
    }
});

// 날짜 일 바꾸기
dayList.addEventListener('click', async function(e) {
    if(e.target !== e.currentTarget) {
        handleUpdateDay(e.target.dataset.day);
    }
});

// todo 목표일 일자 수정
// 인자로 해당 버튼의 dataset 값을 받아와서 화면을 그려줌
async function handleUpdateDay(day) {
    let findWord = '월';
    if(!btnGoal.innerText.includes(findWord)) {
        handleNoti('월을 선택해주세요');
        return;
    }
    // let day = el.dataset.day;
    const url = `http://127.0.0.1:8088/todo/updateday.json`;
    const headers = {
        "Content-Type":"application/json"
    };
    const body = {
        no : todoNo.dataset.no,
        day : day
    };
    const { data } = await axios.put(url, body, {headers});
    if(data.status === 200) {
        console.log(data.result);
        renderDay(data.result.day);
        handleSelectOneTodo(todoNo.dataset.no);
        goalOptionList.classList.remove('daybox-option-on');
        let tag = document.querySelector(`.todo-list[data-no='${todoNo.dataset.no}']`);
        // 여기서 말하는 태그는 todolist 그 자체를 말한다 
        if(tag.childElementCount > 4) {
            tag.lastElementChild.remove();
            console.log('태그 삭제함')
        }
        btnGoal.classList.remove('days-btn-on');
        // FIXME: 날짜 div 안보이게 해야함 
        // dayList.style.height = 0;
        makeDayTag(data.result, tag);
        dayList.classList.remove('day-option-on');
    }
}
// 목표일 삭제
btnGoalDelete.addEventListener('click', handleDeleteDay);
async function handleDeleteDay() {
    let no = todoNo.dataset.no;
    const url = `http://127.0.0.1:8088/todo/deleteday.json`;
    const body = { no : no };
    const headers = { "Content-Type":"application/json" };
    const { data } = await axios.put(url, body, {headers});
    if(data.status === 200) {
        console.log(data.result);
        let tag = document.querySelector(`.todo-list[data-no='${todoNo.dataset.no}']`);
        if(tag.childElementCount > 4) {
            tag.lastElementChild.remove();
            console.log('태그 삭제함')
        }
        handleSelectOneTodo(no);
    }
}

// FIXME: 여기부분 간략하게
btnMonth.addEventListener('mouseover', function() {
    if(todoNo.dataset.chk === '1') {
        monthList.classList.add('month-option-on');
    }
});
monthList.addEventListener('mouseover', function() {
    if(todoNo.dataset.chk === '1') {
        monthList.classList.add('month-option-on');
    }
});
monthList.addEventListener('mouseleave', function() {
    if(todoNo.dataset.chk === '1') {
        monthList.classList.remove('month-option-on');
    }
});
btnMonth.addEventListener('mouseleave', function() {
    if(todoNo.dataset.chk === '1') {
        monthList.classList.remove('month-option-on');
    }
});

btnDay.addEventListener('mouseover', function() {
    if(todoNo.dataset.chk === '1') {
        dayList.classList.add('day-option-on');
    }
});
dayList.addEventListener('mouseover', function() {
    if(todoNo.dataset.chk === '1') {
        dayList.classList.add('day-option-on');
    }
});
dayList.addEventListener('mouseleave', function() {
    if(todoNo.dataset.chk === '1') {
        dayList.classList.remove('day-option-on');
    }
});
btnDay.addEventListener('mouseleave', function() {
    if(todoNo.dataset.chk === '1') {
        dayList.classList.remove('day-option-on');
    }
});

// 삭제버튼 hover시에도 goal 버튼 하이라이트 적용
btnGoalDelete.addEventListener('mouseover', function() {
    btnGoal.classList.add('days-btn-on');
});
btnGoalDelete.addEventListener('mouseleave', function() {
    btnGoal.classList.remove('days-btn-on');
});

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
todoOne.addEventListener('click', function(e) {
    if(!e.target.classList.contains('toggle-btn-on')&&
    !e.target.classList.contains('selectbox-option')) {
        optionList.classList.remove('selectbox-option-on');
        btnImportant.classList.remove('toggle-btn-on');
    }
    // console.log(e.target);
    // console.log(e.currentTarget);
    if(e.target.classList.contains('month-btn')) {
        console.log('monthBtn');
    } else if(e.target.classList.contains('day-btn')) {
        console.log('dayBtn');
    } else if(!e.target.classList.contains('days-btn-on')&&
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