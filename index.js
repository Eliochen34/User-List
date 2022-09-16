const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const allUsersDataPanel = document.querySelector("#allUsersDataPanel");
const userInfo = document.querySelector("#userInfo");
const userPic = document.querySelector(".card-img-top");
const userName = document.querySelector(".user-name");
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const users = [];
let filteredUsers = []
const USERS_PER_PAGE = 16
const paginator = document.querySelector('#paginator')
const btnAddFavorite = document.querySelector(".btn-add-favorite")
let favoriteList = JSON.parse(localStorage.getItem('favoriteUsers')) || []

// 定義一個function顯示所有user
function displayUsers(data) {
  let htmlContent = "";
  data.forEach((item) => {
    htmlContent += `
    <div id="userInfo" class="col-sm-3 mb-3">
      <div class="card border-secondary">
        <img src="${item.avatar}" class="card-img-top" alt="User's picture" data-id="${item.id}" data-id="${item.id}">
        <div class="card-body">
          <h6 class="user-name">${item.name + " " + item.surname}</h6>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-user" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#user-modal">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>  
    </div>  
  `;
  });
  allUsersDataPanel.innerHTML = htmlContent;
}

// 定義一個function，顯示modal內容
function showUserModal(id) {
  const userModalTitle = document.querySelector("#userModalTitle");
  const userModalPic = document.querySelector("#userModalPic");
  const userModalInfo = document.querySelector("#userModalInfo");

  // 清除modal內前一個使用者資訊的殘影
  userModalTitle.textContent = ''
  userModalPic.src = ''
  userModalInfo.textContent = ''

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data;
    userModalTitle.innerText = data.name + " " + data.surname;
    userModalPic.src = data.avatar;
    userModalInfo.innerHTML = `
      <p>Email：${data.email}</p>
      <p>Gender：${data.gender}</p>
      <p>Age：${data.age}</p>
      <p>Region：${data.region}</p>
      <p>Birthday：${data.birthday}</p>
    `;
  });
}

// 定義一個函式，使用者點擊加入我的最愛的按鈕時，會將點擊對象的user資料存入localStorage
function addToFavorite(id) {
  // const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find((user) => user.id === id)
  if (favoriteList.some(user => user.id === id)) {
    return alert('此user已在favorite清單當中')
  }
  favoriteList.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteList))
}

// 定義一個函式，將使用者移出我的最愛
function removeFromFavorite(id) {
  const favoriteListIndex = favoriteList.findIndex((user) => user.id === id)
  favoriteList.splice(favoriteListIndex, 1)
  if (favoriteListIndex === -1) return
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteList))
}

// 切換addToFavorite按鈕樣式
function changeStyleAfterAdd(node) {
  node.classList.remove('btn-info', 'btn-add-favorite')
  node.classList.add('btn-remove-favorite', 'btn-danger')
  node.innerText = 'X'
}

// 切換removeFromFavorite按鈕樣式
function changeStyleAfterRemove(node) {
  node.classList.remove('btn-remove-favorite', 'btn-danger')
  node.classList.add('btn-info', 'btn-add-favorite')
  node.innerText = '+'
}

// 定義一個函式顯示分頁器，傳入的參數是總users的數量
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / USERS_PER_PAGE)
  let htmlContent = ''
  for (let page = 1; page <= numberOfPage; page++) {
    htmlContent += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = htmlContent
}

function getUsersByPage(page) {
  // 各頁數的users:
  // 第一頁: 開始0  結束15
  // 第二頁: 開始16 結束31
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}


// 點擊使用者的照片後，呼叫showUserModal這個function，目的是將modal內顯示的資料置換成該使用者的資料
allUsersDataPanel.addEventListener("click", function (event) {
  const target = event.target;
  if (target.matches('.btn-show-user')) {
    console.log(target.dataset.id);
    showUserModal(Number(target.dataset.id));
  } else if (target.matches('.btn-add-favorite')) {
    addToFavorite(Number(target.dataset.id))
    changeStyleAfterAdd(target)
  } else if (target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(target.dataset.id))
    changeStyleAfterRemove(target)
  }

});

// 在搜索的form綁定submit事件，搜索後顯示對應的使用者
searchForm.addEventListener('submit', function onSearchFromClicked(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredUsers = users.filter((user) => user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))
  console.log(filteredUsers)
  if (filteredUsers.length === 0) {
    return alert(`您輸入的內容:${keyword}沒有符合的user`)
  }
  // 搜索後預設顯示第一頁的資訊
  displayUsers(getUsersByPage(1))
  renderPaginator(filteredUsers.length)
})

// 在分頁器綁定監聽器，點擊分頁時顯示對應的使用者資料
paginator.addEventListener('click', function onPaginatorCkicked(event) {
  const target = event.target
  const page = Number(target.dataset.page)
  displayUsers(getUsersByPage(page))
})

// 用axios呼叫API去獲得所有使用者的資料，並顯示出來
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results);
    displayUsers(getUsersByPage(1));
    renderPaginator(users.length)
  })
  .catch((err) => console.log(err));

// console.log(favoriteList)