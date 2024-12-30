var SERVER_HOSTNAME = 'http://127.0.0.1:5000';
if (location.hostname)
  SERVER_HOSTNAME = 'https://scratchit.cards';

function get_value_from_form(element_id) {
  return document.getElementById(element_id).value.trim();
}

async function get_code() {
  const tguid = get_tguid_from_url();
  const code = get_value_from_form('code');
  return await get_smth(`draws/code/check?code=${code}&a=${tguid}`);
}

function show_status_gifted(special_state, data) {
  let html = '';
  if (special_state)
    html += '<p>Подарок только что отмечен врученным</p>';
  else {
    html += `<p>🔵 Код найден. Не вручаем подарок, т.к. подарок уже был вручен`;
    if (data[2])
      html += `: ${data[2]}`;
    if (data[3])
      html += `. Дата вручения: ${Date(data[3])}`;
    else
      html += '. Дата вручения не указана.'
    html += '</p>';
    html += `<p>Здесь надо какие-то рекомендации продавцу, что следует делать в этой ситуации...</p>`;
  }

  document.getElementById('code_status').innerHTML = html;
  document.getElementById('code_update').style.display = 'none';
}
function show_status_not_gifted() {
  document.getElementById('code_status').innerHTML = '<p>🟢 Код найден. Придет выигравший. Вручаем подарок только по коду из приложения.</p>';
  document.getElementById('code_update').style.display = 'block';
  document.getElementById('code_comments_select').value = '';
  document.getElementById('code_comment').value = '';
  document.getElementById('code_comments_select').focus();
  //document.getElementById('code_comment').scrollIntoView();
}
function show_status_not_gifted_allowed() {
  document.getElementById('code_status').innerHTML = '<p>🟡 Код найден. Придет за подарком кто-то другой. Вручаем подарок по коду, предъявленному как угодно.</p>';
  document.getElementById('code_update').style.display = 'block';
  document.getElementById('code_comments_select').value = '';
  document.getElementById('code_comment').value = '';
  //document.getElementById('code_comment').focus();
  //document.getElementById('code_comment').scrollIntoView();
}
function show_status_not_exists() {
  document.getElementById('code_status').innerHTML = '<p>🔴 Код не найден. Не вручаем подарок</p><p>Здесь надо какие-то рекомендации продавцу, что следует делать в этой ситуации...</p>';
  document.getElementById('code_update').style.display = 'none';
}
function unknown_status(status) {
  document.getElementById('code_status').innerHTML = `<p>Неизвестный статус у подарка: ${status}</p>`;
  document.getElementById('code_update').style.display = 'none';
}

function draw_code_status(data, special_state) {
  if (data.code == 404)
    return show_status_not_exists();

  if (data.code == 200) {
    const status = data.result[0][1];
    if ([1, 3, 5].includes(status))
      return show_status_not_gifted();
    if (status == 2)
      return show_status_gifted(special_state, data.result[0]);
    if (status == 4)
      return show_status_not_gifted_allowed();
    else
      return unknown_status(status);
  }
}

async function check_code(special_state) {
  //document.getElementById('code').focus();
  const data = await get_code();
  draw_code_status(data, special_state);
}

function input_field_cleanup() {
  document.getElementById('code').value = '';
}
function input_field_focus() {
  document.getElementById('code').focus();
}

async function update_code() {
  let comment = get_value_from_form('code_comments_select');
  if (!comment)
    comment = get_value_from_form('code_comment');

  const data = {'code': get_value_from_form('code'), 'comment': comment}
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
  input_field_cleanup();
  input_field_focus();
}

function draw_doughnut_chart(stats) {
  const gifted_percent = Math.round(stats.gifted * 100 / stats.total);
  const await_percent = Math.round(stats.await * 100 / stats.total);
  const await_another_percent = Math.round(stats.await_another * 100 / stats.total);
  const dont_await_percent = Math.round(stats.dont_await * 100 / stats.total);
  const won_percent = 100 - gifted_percent - await_percent - await_another_percent - dont_await_percent;

  let labels = [];
  let data = [];
  let bg_color = [];
  if (stats.gifted != 0) {
    labels.push(`Получили подарки (${stats.gifted} шт., ${gifted_percent}%)`);
    data.push(stats.gifted);
    bg_color.push('limegreen');
  }
  if (stats.wins != 0) {
    labels.push(`Назначен, ждем выбор (${stats.wins} шт., ${won_percent}%)`);
    data.push(stats.wins);
    bg_color.push('lightgray');
  }
  if (stats.await != 0) {
    labels.push(`Придут за подарками (${stats.await} шт., ${await_percent}%)`);
    data.push(stats.await);
    bg_color.push('deepskyblue');
  }
  if (stats.await_another != 0) {
    labels.push(`Другой придет за подарками (${stats.await_another} шт., ${await_another_percent}%)`);
    data.push(stats.await_another);
    bg_color.push('orange');
  }
  if (stats.dont_await != 0) {
    labels.push(`Не придут (${stats.dont_await} шт., ${dont_await_percent}%)`);
    data.push(stats.dont_await);
    bg_color.push('red');
  }

  canvas_id = 'chart_stats';
  existing_chart = Chart.getChart(canvas_id);
  if (existing_chart != undefined)
    existing_chart.destroy();

  new Chart(canvas_id, {
    type: 'doughnut',
    options: {
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          enabled: false,
        }
      },
    },
    data: {
      labels: labels,
      datasets: [{
        //label: 'My First Dataset',
        data: data,
        backgroundColor: bg_color,
        hoverOffset: 4
      }]
    }
  });
}

function draw_stats(stats) {
  let html = `<p>Всего подарков: ${stats.total}</p>`;
  document.getElementById('stats').innerHTML = html;
}

function draw_chart(data) {
  let stats = {'total': 0, 'wins': 0, 'gifted': 0, 'await': 0, 'await_another': 0, 'dont_await': 0,
  'annul_not_respond': 0, 'annul_rejected': 0};
  data.forEach((d) => {
    stats.total += 1;
    if (d[1] == 1)
      stats.wins += 1;
    if (d[1] == 2)
      stats.gifted += 1;
    if (d[1] == 3)
      stats.await += 1;
    if (d[1] == 4)
      stats.await_another += 1;
    if (d[1] == 5)
      stats.dont_await += 1;
  });

  draw_doughnut_chart(stats);
  draw_stats(stats);
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
        draw_chart(data);
      }
      else if (el.id == 'check-codes-tab')
        document.getElementById('code').focus();
    });
  });

  document.getElementById('code').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      check_code();
    }
  });

  //document.getElementById('code').focus();
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
      html += '<td>Назначен, ждем выбор</td>';
    else if (code[1] == 2)
      html += '<td>Вручен</td>';
    else if (code[1] == 3)
      html += '<td>Придут</td>';
    else if (code[1] == 4)
      html += '<td>Придет кто-то другой</td>';
    else if (code[1] == 5)
      html += '<td>Не придут</td>';
    else
      html += `<td>Неизвестный статус: ${code[1]}</td>`;
    html += '<td>' + code[2] + '</td>';
    if (code[3]) {
      const dt = new Date(code[3] * 1000);
      html += '<td>' + dt.toDateString() + ', ' + dt.toLocaleTimeString() + '</td>';
    }
    else
      html += '<td></td>';
    html += '</tr>';
  });
  html += '</tbody>';

  document.getElementById("all_codes").innerHTML = html;
  new DataTable('#all-codes-table', {
    initComplete: function (settings, json) {
      const search = document.querySelectorAll('input[type="search"]')[0];
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
      { width: 'auto', className: 'tablet-l desktop' },
      { width: 'auto', className: 'tablet-p tablet-l desktop' },
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

function get_tguid_from_url() {  // https://www.sitepoint.com/get-url-parameters-with-javascript/
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get('a');
  if (!id)
    return -1
  return parseInt(id);
}

function enable_admin() {
  document.getElementById('view-all-codes-tab').style.visibility = 'visible';
  document.getElementById('view-all-codes-tab-pane').style.visibility = 'visible';
}
function enable_seller() {
  document.getElementById('view-all-codes-tab').style.visibility = 'hidden';
  document.getElementById('view-all-codes-tab-pane').style.visibility = 'hidden';
}

async function get_comments(tguid) {
  const comments = await get_smth(`get/draws/codes/comments?a=${tguid}`);
  if (!comments)
    return;

  document.getElementById('code_comments_select').style.display = 'unset';
  let html = '<option value="">- Выберите из существующих -</option>';
  for (let i = 0; i < comments.result.length; i++) {
    html += `<option>${comments.result[i]}</option>`;
  }
  document.getElementById('code_comments_select').innerHTML = html;
}

window.onload = function() {
  try {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    //window.Telegram.WebApp.requestFullscreen();
    //window.Telegram.WebApp.setBackgroundColor("#fffaf0");  // floralwhite
    window.Telegram.WebApp.setHeaderColor("#fffaf0");  // floralwhite
  } // Error: WebAppHeaderColorKeyInvalid at setHeaderColor
  catch(error) {
    ;
  }

  const tguid = get_tguid_from_url();
  if ([359070623, 5144394044].includes(tguid))
    enable_admin();
  else
    enable_seller();

  enable_listeners();
  get_comments(tguid);

  document.getElementById('code').focus();
}
