var SERVER_HOSTNAME = 'http://127.0.0.1:5000';
if (location.hostname)
  SERVER_HOSTNAME = 'https://scratchit.cards';

async function get_code() {
  const code = document.getElementById('code').value;
  const response = await get_smth('draws/code/check?code=' + code);
  return response;
}

function draw_code_status(data) {
  html = '';
  if (data.code == 404)
    html += '<p><br>Такого кода не существует</p>';
  else if (data.code == 200) {
    const status = data.result[0][1];
    if (status == 1)
      html += '<p><br>Подарок не вручен</p>';
    else if (status == 2)
      html += '<p><br>Подарок уже вручен</p>';
  }

  document.getElementById('code_status').innerHTML = html;
}

async function check_code() {
  const data = await get_code();
  draw_code_status(data);
}

function enable_listeners() {
  const selectors = document.querySelectorAll('button');
  selectors.forEach((el) => {
    el.addEventListener('click', function(e) {
      check_code();
    });
  });
}

async function get_smth(smth) {
  const response = await fetch(SERVER_HOSTNAME + `/${smth}`, {});
  return await response.json();
}

async function get_data() {
  return await get_smth(`get/draws/codes`);
}

function draw_data(data) {
  let html = '';
  data.forEach((code) => {
    if (code[1] == 2)  // gifted
      html += `<s>${code[0]}</s><br>`;
    else  
      html += `${code[0]}<br>`;
  });
  document.getElementById("all_codes").innerHTML = html;
}

window.onload = async function() {
  try {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    //window.Telegram.WebApp.requestFullscreen();
    //window.Telegram.WebApp.setBackgroundColor("#fffaf0");  // floralwhite
    //window.Telegram.WebApp.setHeaderColor("#fffaf0");  // floralwhite
  } // Error: WebAppHeaderColorKeyInvalid at setHeaderColor
  catch(error) {
    ;
  }
  const data = await get_data();
  draw_data(data);
  enable_listeners();
}