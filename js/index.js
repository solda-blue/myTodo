const clock = document.getElementById('clock');
const week = ['일', '월', '화', '수', '목', '금', '토']

handleDate();
setInterval(handleDate, 1000);

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
}

