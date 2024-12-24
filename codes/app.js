var SERVER_HOSTNAME = 'http://127.0.0.1:5000';
if (location.hostname)
  SERVER_HOSTNAME = 'https://scratchit.cards';

function get_value_from_form(element_id) {
  return document.getElementById(element_id).value;
}

function focusAndOpenKeyboard(el, timeout) {  // https://stackoverflow.com/questions/54424729/ios-show-keyboard-on-input-focus
  if(!timeout)
    timeout = 100;
  // Align temp input element approximately where the input element is
  // so the cursor doesn't jump around
  var __tempEl__ = document.createElement('input');
  __tempEl__.style.position = 'absolute';
  __tempEl__.style.top = (el.offsetTop + 7) + 'px';
  __tempEl__.style.left = el.offsetLeft + 'px';
  __tempEl__.style.height = 0;
  __tempEl__.style.opacity = 0;
  // Put this temp element as a child of the page <body> and focus on it
  document.body.appendChild(__tempEl__);
  __tempEl__.focus();

  // The keyboard is open. Now do a delayed focus on the target element
  setTimeout(function() {
    el.focus();
    el.click();
    // Remove the temp element
    document.body.removeChild(__tempEl__);
  }, timeout);
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
  document.getElementById('code_comment').focus();
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
    el.addEventListener('click', async function(e) {
      if (el.id == 'btn_code_check')
        check_code();
      else if (el.id == 'btn_code_update')
        update_code();
      else if (el.id == 'view-all-codes-tab') {
        const data = await get_data();
        draw_data(data);
      }
      else if (el.id == 'check-codes-tab')
        document.getElementById('code').focus();
    });
  });

  document.getElementById('code').focus();
}

async function get_smth(smth) {
  const response = await fetch(SERVER_HOSTNAME + `/${smth}`, {});
  return await response.json();
}

async function get_data() {
  return await get_smth(`get/draws/codes`);
}

function draw_data(data) {
  let html = '<table id="all-codes-table" class="table table-striped" style="width:100%"><thead><tr><th>Код</th><th>Статус</th><th>Комментарий</th><th>Дата вручения</th></tr></thead><tbody>';
  data.forEach((code) => {
    html += '<tr>';
    html += '<td>' + code[0] + '</td>';
    if (code[1] == 1)
      html += '<td>Не вручен</td>';
    if (code[1] == 2)
      html += '<td>Вручен</td>';
    html += '<td>' + code[2] + '</td>';
    if (code[3])
      html += '<td>' + code[3] + '</td>';
    else
      html += '<td></td>';
    html += '</tr>';
  });
  html += '</tbody>';

  document.getElementById("all_codes").innerHTML = html;
  new DataTable('#all-codes-table', {
    initComplete: function (settings, json) {
      const search = document.getElementsByTagName('input')[0];
      search.classList.remove('form-control-sm');
      search.focus();
    },
    language: {
      search: "",
      searchPlaceholder: "Поиск...",
      emptyTable: "Ничего не найдено",
      info: "Показано с _START_ по _END_ из _TOTAL_ записей",
      zeroRecords: 'Ничего не найдено',
      infoEmpty: "Показано с 0 по 0 из _TOTAL_ записей",
      infoFiltered:   "(из _MAX_ - общего числа записей)",
    },
    paging: false,
    autoWidth: true,
    order: [[0, 'desc']],
    responsive: true,
    columns: [
      { width: 'auto', className: 'all' },
      { width: 'auto', className: 'all' }, // https://datatables.net/extensions/responsive/examples/column-control/classes.html
      { width: 'auto', className: 'desktop' },
      { width: 'auto', className: 'desktop' },
    ],
    columnDefs2: [
      {
        target: 0, // ID
        visible: false,
        searchable: false
      },
    ],
    columnDefs: [
      { type: 'text', targets: 0 }, //{ type: 'num', targets: 5 },
      { responsivePriority: 1, targets: 0 },
      { responsivePriority: 1, targets: 1 },
    ],
    //stateSave: true,
  });
}

window.onload = function() {
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
  enable_listeners();
  //document.getElementById('code').focus();

  // https://stackoverflow.com/questions/54424729/ios-show-keyboard-on-input-focus
  var myElement = document.getElementById('code');
  var modalFadeInDuration = 300;
  focusAndOpenKeyboard(myElement, modalFadeInDuration); // or without the second argument
}
