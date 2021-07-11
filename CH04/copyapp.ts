type Store2 = {
    currentPage: number;
    feeds: NewsFeed2[];
}

interface News2  { 
    readonly id: number;
    readonly time_ago: string;
    readonly title: string;
    readonly url: string;
    readonly user: string;
    readonly content: string;
}

interface NewsFeed2 extends News2 {
    readonly comments_count: number;
    readonly points: number;
    readonly read?: boolean;
}

interface NewsDetail2 extends News2 {
    readonly comments: NewsComment2[];
}

interface NewsComment2 extends News2 {
    readonly comments: NewsComment2[];
    readonly level: number;
}

const container2: HTMLElement | null = document.getElementById('root');
const content2 = document.createElement('div');
const ajax2: XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL2 = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL2 = 'https://api.hnpwa.com/v0/item/@id.json';
const store2: Store2 = {
    currentPage: 1,
    feeds: [],
};

class Api2 {
  
  url: string;
  ajax: XMLHttpRequest;

  getRequest<AjaxResponse>(url: string): AjaxResponse {
    const ajax = new XMLHttpRequest();
    ajax.open('GET', url, false);
    ajax.send();

    return JSON.parse(ajax.response);
  }
}

class NewsFeedApi2 {
  getData(): NewsFeed2[] {
    return this.getRequest<NewsFeed2[]>();
   }
}

class NewsDetailApi2 {
  getData(id: string): NewsDetail2 {
    return this.getRequest<NewsDetail2>(CONTENT_URL.replace('@id', id));
  }
}

function getData2<AjaxResponse>(url: string): AjaxResponse {
    ajax2.open('GET', url, false);
    ajax2.send();
    return JSON.parse(ajax2.response);
}

function makeFeeds2(feeds: NewsFeed2[]): NewsFeed2[] {
    for (let i = 0; i < feeds.length; i++) {
        feeds[i].read = false;
    }
    return feeds;
}

function updateView2(html: string): void{
    if (container) {
        container.innerHTML = html;
    } else {
        console.log("최상위 컨테이너가 없어 UI를 진행하지 못합니다")
    }
}


function newsFeed2(): void {
    let newsFeed: NewsFeed2[] = store.feeds;
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
    
    if (newsFeed.length === 0) {
        newsFeed = store2.feeds = makeFeeds2(getData2<NewsFeed2[]>(NEWS_URL2));
    }

    for (let i = (store2.currentPage - 1) * 10; i < store2.currentPage * 10; i++){
        newsList.push(`
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
        `);
    }
    template = template.replace('{{__news_feed__}}', newsList.join(''));
    template = template.replace('{{__prev_page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
    template = template.replace('{{__next_page__}}', String(store.currentPage < 3 ? store.currentPage + 1 : 3));

    updateView(template);
}


function newsDetail2() {
    const id = location.hash.substr(7);
    const newsContent = getData<NewsDetail>(CONTENT_URL.replace('@id',id))
    let template = 
    `
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

    for (let i = 0; i < store2.feeds.length; i++) {
        if (store2.feeds[i].id === Number(id)) {
            store2.feeds[i].read = true;
            break;
        }
    }

    function makeComment2(comments: NewsComment2[]):string {
        const commentString = [];

        for (let i = 0; i < comments.length; i++) {
            const comment: NewsComment2 = comments[i];
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
                commentString.push(makeComment2(comment.comments));
            }
        }

        return commentString.join('');
    }
    updateView(template.replace('{{__comments__}}', makeComment2(newsContent.comments)));
}

function router2() {
    const routePath = location.hash;
    if (routePath === '') {
        newsFeed();
    } else if (routePath.indexOf('#/page/') >= 0) {
        store2.currentPage = Number(routePath.substr(7));
        newsFeed();
    } else {
        newsDetail();
    }
}

window.addEventListener('hashchange', router2);

router2();
