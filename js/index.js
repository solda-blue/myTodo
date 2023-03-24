const clock = document.getElementById('clock');
const week = ['일', '월', '화', '수', '목', '금', '토'];
const btnSort = document.getElementById('countSort');
const listSort = document.querySelector('.list-sort');
const btnCompleteDelete = document.getElementById('completeDelete');
const modalTransparent = document.querySelector('.modal-transparent');

let select = 1;

handleDate();
setInterval(handleDate, 1000);

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

    let showDay = document.createElement('h4');
    showDay.innerText = `${c} (${weekLabel})`;
    clock.appendChild(showDay);

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    let showTime = document.createElement('h4');
    showTime.style = 'margin-left:5px';
    showTime.innerText = `${hours}:${minutes}:${seconds}`;
    clock.appendChild(showTime);
};

// FIXME: 이거 나중에 공부하고 바꿔야 할 듯
// 정렬 버튼 => 모달창
btnSort.addEventListener('click', function() {
    listSort.style.display = 'block';
    modalTransparent.style.display = 'block';
    this.classList.add('options-add');
    modalTransparent.addEventListener('click', handleModal, {once :true});
});
// 모달창 닫기
function handleModal(e) {
    console.log(e.target);
    this.style.display = 'none';
    listSort.style.display = 'none';
    btnSort.classList.remove('options-add');
};
// 정렬 이벤트
listSort.addEventListener('click', function(e) {
    if(e.target !== e.currentTarget) {
        console.log(e.target);
        this.style.display = 'none';
        modalTransparent.style.display = 'none';
        btnSort.classList.remove('options-add');
        let regChar = e.target.innerText;
        btnSort.firstElementChild.innerText = '정렬 : ' + regChar;
        select = e.target.dataset.sort;
        handleData(select);
        // 이벤트 삭제 TODO: 이벤트 공부 많이 해야겠다
        modalTransparent.removeEventListener('click', handleModal);
    }
});

// 완료 항목 삭제
btnCompleteDelete.addEventListener('click', async function() {
    // if(document.querySelector('.main').childElementCount > 0) {
    //     if(confirm('삭제하시겠습니까?')) {
    //         const url = `http://127.0.0.1:8088/todo/deleteall.json`;
    //         const body = {};
    //         const headers = {
    //             "Content-Type" : "application/json"
    //         };
    //         const { data } = await axios.post(url, body, {headers});
    //         if(data.status === 200) {
    //             handleCompleteData();
    //             handleCount();
    //             handleNoti('삭제되었습니다.');
    //         }
    //     }
    // } else {
    //     console.log('항목 없음');
    //     return
    // };
    handleNoti('noti test');
});

// 삭제 알림
function handleNoti(text) {
    let notiBox = document.createElement('div');
    let noti = document.createElement('div');
    noti.classList.add('noti');
    notiBox.appendChild(noti);
    noti.innerText = text;
    document.body.appendChild(notiBox);
    notiBox.classList.add('noti-box');
    setTimeout(deleteNoti, 4000, notiBox);
}
// 생성한 notiBox 삭제
function deleteNoti(el) {
    el.remove();
}