var SERVER_HOSTNAME = 'http://127.0.0.1:5000';
if (location.hostname)
  SERVER_HOSTNAME = 'https://scratchit.cards';

function get_value_from_form(element_id) {
  return document.getElementById(element_id).value;
}

async function get_code() {
  const code = get_value_from_form('code');
  return await get_smth('draws/code/check?code=' + code);
}

function show_status_gifted(special_state) {
  let html = '';
  if (special_state)
    html += '<p>Подарок только что отмечен врученным.</p>';
  else
    html += '<p>Подарок уже вручен</p><p>Здесь надо какие-то рекомендации продавцу, что следует делать в этой ситуации...</p>';

  document.getElementById('code_status').innerHTML = html;
  document.getElementById('code_update').style.display = 'none';
}
function show_status_not_gifted() {
  document.getElementById('code_status').innerHTML = '<p>Подарок не вручен</p>';
  document.getElementById('code_update').style.display = 'block';
}
function show_status_not_exists() {
  document.getElementById('code_status').innerHTML = '<p>Такого кода не существует</p><p>Здесь надо какие-то рекомендации продавцу, что следует делать в этой ситуации...</p>';
}

function draw_code_status(data, special_state) {
  if (data.code == 404)
    return show_status_not_exists();

  if (data.code == 200) {
    const status = data.result[0][1];
    if (status == 1)
      return show_status_not_gifted();
    if (status == 2)
      return show_status_gifted(special_state);
  }
}

async function check_code(special_state) {
  const data = await get_code();
  draw_code_status(data, special_state);
}

async function update_code() {
  const data = {'code': get_value_from_form('code'), 'comment': get_value_from_form('code_comment')}
  const response = await fetch(SERVER_HOSTNAME + '/draws/code/update', {
    mode: 'no-cors',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  check_code('just gifted');
}

function enable_listeners() {
  const selectors = document.querySelectorAll('button');
  selectors.forEach((el) => {
    el.addEventListener('click', function(e) {
      if (el.id == 'btn_code_check')
        check_code();
      else if (el.id == 'btn_code_update')
        update_code();
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