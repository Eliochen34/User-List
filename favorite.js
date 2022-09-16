// 定義變數
const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";

const allUsersDataPanel = document.querySelector("#allUsersDataPanel");
const userInfo = document.querySelector("#userInfo");
const userPic = document.querySelector(".card-img-top");
const userName = document.querySelector(".user-name");
const users = JSON.parse(localStorage.getItem('favoriteUsers'));
const USERS_PER_PAGE = 16
const paginator = document.querySelector('#paginator')


// Functions:

// 定義一個函式，顯示最愛的users列表

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
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
        </div>
      </div>  
    </div>  
  `;
  });
  allUsersDataPanel.innerHTML = htmlContent;
}

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


// 定義一個函式，將使用者移出最愛user清單
function removeFromFavorite(id) {
  if (!users || !users.length) return
  const userIndex = users.findIndex((user) => user.id === id)
  users.splice(userIndex, 1)

  if (userIndex === -1) return

  localStorage.setItem('favoriteUsers', JSON.stringify(users))
  displayUsers(getUsersByPage(1))
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
  const startIndex = (page - 1) * USERS_PER_PAGE
  return users.slice(startIndex, startIndex + USERS_PER_PAGE)

}


// 監聽器

allUsersDataPanel.addEventListener("click", function (event) {
  const target = event.target;
  if (target.matches('.btn-show-user')) {
    console.log(target.dataset.id);
    showUserModal(Number(target.dataset.id));
  } else if (target.matches('.btn-remove-favorite')) {
    console.log(target.dataset.id)
    removeFromFavorite(Number(target.dataset.id))
  }
});

// 在分頁器綁定監聽器，點擊分頁時顯示對應的使用者資料
paginator.addEventListener('click', function onPaginatorCkicked(event) {
  const target = event.target
  const page = Number(target.dataset.page)
  displayUsers(getUsersByPage(page))
})


displayUsers(getUsersByPage(1))
renderPaginator(users.length)