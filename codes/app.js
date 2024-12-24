var SERVER_HOSTNAME = 'http://127.0.0.1:5000';
if (location.hostname)
  SERVER_HOSTNAME = 'https://scratchit.cards';

async function apply_filters() {
  const data = await get_data();
  draw_data(data);
  draw_chart(data.charts.participation);
}

function enable_listeners() {
  const selectors = document.querySelectorAll('select');
  selectors.forEach((el) => {
    el.addEventListener('change', function(e) {
      apply_filters();
    });
  });
}

async function get_smth(smth) {
  const response = await fetch(SERVER_HOSTNAME + `/${smth}`, {});
  const o = await response.json();
  return o;
}

async function get_data() {
  return await get_smth(`get/draws/codes`);
}

function draw_data(data) {
  console.log(data);
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
}