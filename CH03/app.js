const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'; // JSON 데이터 형식 

ajax.open('GET', NEWS_URL, false);
ajax.send();

const newsFeed = JSON.parse(ajax.response); // ajax.response (객체)
const ul = document.createElement('ul'); //  백틱 

for(let i = 0; i < 10; i++) {
  const li = document.createElement('li');

  li.innerHTML = newsFeed[i].title; // 브래킷 

  ul.appendChild(li);
}

document.getElementById('root').appendChild(ul);