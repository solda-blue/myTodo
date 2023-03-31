const clock = document.getElementById('clock');
const week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const btnSort = document.getElementById('countSort');
const listSort = document.querySelector('.list-sort');
const btnCompleteDelete = document.getElementById('completeDelete');
const modalTransparent = document.querySelector('.modal-transparent');
// 삭제 다이얼로그 모달
const modalConfirm = document.getElementById('modalConfirm');
const btnBoxDelete = document.querySelector('.box-confirm');
const dialogueDelete = document.querySelector('.delete-dialogue');

// 정렬용 변수
let select = 1;

handleDate();
// setInterval(handleDate, 1000*60);

// 로고 장난
document.addEventListener('scroll', function() {
    let scroll = document.documentElement.scrollTop;
    if(scroll > 97) {
        clock.style.opacity = 0;
    } else {
        clock.style.opacity = 1;
    }
})


// 시계
function handleDate() {
    clock.innerHTML = "";
    let now = new Date();
    let today = new Intl.DateTimeFormat('kr').format(now);

    let a = today.slice(6);
    let b = a.replace('.', '월');
    let c = b.replace('.', '일');

    let day = now.getDay();
    let weekLabel = week[day];

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let showTime = document.createElement('p');
    showTime.style = 'margin-left:5px';
    showTime.innerText = `${hours}:${minutes}:${seconds}`;

    let showWeek = document.createElement('span');
    let showDay = document.createElement('p');
    
    let dayBox = document.createElement('div');
    dayBox.classList.add('day-box');
    showWeek.classList.add('week');
    showDay.classList.add('day');
    showWeek.innerText = `${weekLabel}`;
    showDay.innerText = `${c}`;
    dayBox.appendChild(showDay);
    // dayBox.appendChild(showTime);
    clock.appendChild(showWeek);
    clock.appendChild(dayBox);
    // clock.appendChild(showTime);
};

function checkToday() {
    let today = moment().format('YYYY-MM-DD');
    return today;
}

// FIXME: 이거 나중에 공부하고 바꿔야 할 듯
// 정렬 버튼 => 모달창
btnSort.addEventListener('click', function() {
    // listSort.style.display = 'block';
    listSort.classList.toggle('list-sort-on');
    modalTransparent.style.display = 'block';
    this.classList.toggle('options-add');
    modalTransparent.addEventListener('click', handleModal, {once :true});
});
// 정렬 모달창 모달창 닫기
function handleModal(e) {
    console.log(e.target);
    this.style.display = 'none';
    // listSort.style.display = 'none';
    listSort.classList.remove('list-sort-on');
    btnSort.classList.remove('options-add');
};
// 정렬 이벤트
listSort.addEventListener('click', function(e) {
    if(e.target !== e.currentTarget) {
        console.log(e.target);
        modalTransparent.style.display = 'none';
        btnSort.classList.remove('options-add');
        let regChar = e.target.innerText;
        btnSort.firstElementChild.innerText = '정렬 : ' + regChar;
        select = e.target.dataset.sort;
        handleData(select);
        // 이벤트 삭제 TODO: 이벤트 공부 많이 해야겠다
        modalTransparent.removeEventListener('click', handleModal);
    };
    listSort.classList.remove('list-sort-on');
    btnSort.classList.remove('options-add');
});


// 완료 항목 전체삭제
function DeleteAllCompleted() {
    if(document.querySelector('.main').childElementCount > 0) {
        modalConfirm.style.display = 'flex';
        dialogueDelete.classList.add('delete-dialogue-on');
        btnBoxDelete.addEventListener('click', (e) => {
            if(e.target !== e.currentTarget) {
                if(e.target.classList.contains('cancer')) {
                    console.log(false);
                } else {
                    console.log(true);
                    requestDeleteAllCompleted();
                }
            }
            modalConfirm.style.display = 'none';
            dialogueDelete.classList.remove('delete-dialogue-on');
        }, {once : true});
    } else {
        handleNoti('삭제할 항목이 없습니다', 1);
    }
}

// 완료항목 전체 삭제 ajax
async function requestDeleteAllCompleted() {
    const url = `http://127.0.0.1:8088/todo/deleteall.json`;
    const body = {};
    const headers = {
        "Content-Type" : "application/json"
    };
    const { data } = await axios.post(url, body, {headers});
    if(data.status === 200) {
        handleCompleteData();
        handleCount();
        handleNoti('삭제되었습니다');
    }
}

// 노티 함수
function handleNoti(text, type) {
    // type을 지정해서 원하는 아이콘을 띄워 줄 수 있다
    if(type == null) {
        type = 0;
    }
    const types = [
        {type : 'success', icon : '/assets/svg/success.svg'},
        {type : 'error',   icon : '/assets/svg/error.svg'},
        {type : 'info',    icon : '/assets/svg/info.svg'},
    ]
    
    let notiBox = document.createElement('div');
    let icon = document.createElement('img');
    let message = document.createElement('span');
    let noti = document.createElement('div');
    icon.setAttribute('src',types[type].icon);
    message.style = `padding : 0 10px;`;
    message.innerText = text;
    noti.appendChild(icon);
    noti.appendChild(message);
    noti.classList.add('noti');
    notiBox.appendChild(noti);
    document.body.appendChild(notiBox);
    notiBox.classList.add('noti-box');
    setTimeout(deleteNoti, 3000, notiBox);
}
// 생성한 notiBox 삭제
function deleteNoti(el) {
    el.remove();
}

function handleDeleteTodo() {
    btnBoxDelete.addEventListener('click', (e) => {
        if(e.target !== e.currentTarget) {
            if(e.target.classList.contains('cancer')) {
                return false;
            } else {
                return true;
            }
        }
    }, {once : true})
}

// btnBoxDelete.addEventListener('click', function(e) {
//     console.log(e.target)
    
// })
