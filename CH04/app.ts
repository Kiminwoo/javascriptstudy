interface Store  {
  currentPage: number;
  feeds : NewsFeed[];
}

interface News  { // 중복으로 사용되는 변수들 
  readonly id: number;
  readonly time_ago: string;
  readonly title: string;
  readonly url: string;
  readonly user: string;
  readonly content: string;
}

interface NewsFeed extends News { // 인터셉트 (타입엘리어스) :: type alias
  readonly comments_count: number;
  readonly points: number;
  read?: boolean; // 있을 때도 있고 없을 때도 있고 
}

interface NewsDetail extends News {
  readonly comments: NewsComment[];
}

interface NewsComment extends News {
  readonly comments: NewsComment[];
  readonly level: number;
}

const container: HTMLElement | null = document.getElementById('root');
const content = document.createElement('div');
const ajax: XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'; // 뉴스 피드 
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'; // 뉴스 내용 
const store: Store = {
  currentPage :1,
  feeds: [],
};

class Api {
  url: string;
  ajax: XMLHttpRequest;

  
  getRequest<AjaxResponse>(url: string): AjaxResponse {
    const ajax = new XMLHttpRequest();
    ajax.open('GET', url, false);
    ajax.send();

    return JSON.parse(ajax.response);
  }
}

class NewsFeedApi {
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>();
  }
}

class NewsDetailApi {
  getData(id:string): NewsDetail {
    return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id',id));
  }
}

function makeFeeds(feeds: NewsFeed[]): NewsFeed[]{ // 피드 클릭 여부 함수
  for(let i=0; i < feeds.length; i++){
    feeds[i].read = false;
  }

  return feeds;
}

function updateView(html:string): void{ // 타입 가드 코드 
  if(container){
    container.innerHTML = html ; 
  } else {
    console.log("최상위 컨테이너가 없어 UI를 진행하지 못합니다.")
  }
}

function newsFeed(): void{ // 뉴스 피드 함수 
  const api = new NewsFeedApi(NEWS_URL);
  let newsFeed: NewsFeed[] = store.feeds;
  const newsList = [];
  let template = `
  <div class="bg-gray-600 min-h-screen">
    <div class="bg-white text-xl">
      <div class="mx-auto px-4">
        <div class="flex justify-between items-center py-6">
          <div class="flex justify-start">
            <h1 class="font-extrabold">Hacker News</h1>
          </div>
          <div class="items-center justify-end">
            <a href="#/page/{{__prev_page__}}" class="text-gray-500">
              Previous
            </a>
            <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
              Next
            </a>
          </div>
        </div> 
      </div>
    </div>
    <div class="p-4 text-2xl text-gray-700">
      {{__news_feed__}}        
    </div>
  </div>
`;
  if (newsFeed.length === 0) { // 첫 로딩시에만 ajax 통신 
    newsFeed = store.feeds = makeFeeds(api.getData());
  }  


  for(let i = ( store.currentPage -1 ) * 10 ; i < store.currentPage * 10; i++) { // 뉴스 피드 페이징 처리 
  newsList.push(
      `
      <div class="p-6 ${newsFeed[i].read ? 'bg-red-500' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${newsFeed[i].comments_count}</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
            <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
            <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
          </div>  
        </div>
      </div>    
    `
    );
  }

  template = template.replace('{{__news_feed__}}', newsList.join(''));
  template = template.replace('{{__prev_page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
  template = template.replace('{{__next_page__}}', String(store.currentPage < 3 ? store.currentPage + 1 : 3));
  
  updateView(template);
}

function newsDetail() { // 뉴스 내용 함수 
  const id = location.hash.substr(7);
  const api = new NewsDetailApi(CONTENT_URL.replace('@id', id))
  const newsContent = api.getData();
  let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>

        {{__comments__}}

      </div>
    </div>
  `;

  for(let i=0; i < store.feeds.length; i++) { // 피드 클릭 여부 함수  
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  function makeComment(comments: NewsComment[]):string { // 피드의 댓글 함수 
    const commentString = [];

    for (let i = 0; i < comments.length; i++) {
      const comment: NewsComment = comments[i];
      commentString.push(`
        <div style="padding-left: ${comment.level}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comment.user}</strong> ${comment.time_ago}
          </div>
          <p class="text-gray-700">${comment.content}</p>
        </div>      
      `);

      if (comment.comments.length > 0) {
        commentString.push(makeComment(comment.comments));
      }
    }

    return commentString.join('');
  }

  updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));
}

function router(){ // 라우터 함수 
  const routePath = location.hash; // 주소값으로 라우터 처리  
  if(routePath === ''){ // location.hash 에 #만 있을 경우 빈문자열로 
    newsFeed();
  } else if (routePath.indexOf('#/page/')>=0){
    store.currentPage = Number(routePath.substr(7));
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener('hashchange',router);

router();