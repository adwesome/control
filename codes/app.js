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
    html += '<p>Подарок только что отмечен врученным</p>';
  else
    html += '<p>Подарок уже вручен</p><p>Здесь надо какие-то рекомендации продавцу, что следует делать в этой ситуации...</p>';

  document.getElementById('code_status').innerHTML = html;
  document.getElementById('code_update').style.display = 'none';
}
function show_status_not_gifted() {
  document.getElementById('code_status').innerHTML = '<p>Подарок не вручен</p>';
  document.getElementById('code_update').style.display = 'block';
  document.getElementById('code_comment').focus();
  //document.getElementById('code_comment').scrollIntoView();
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
  //document.getElementById('code').focus();
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

function draw_doughnut_chart(stats) {
  const gifted_percent = Math.round(stats.gifted * 100 / stats.total);
  const won_percent = 100 - gifted_percent;

  let labels = [];
  let data = [];
  let bg_color = [];
  if (stats.gifted != 0) {
    labels.push(`Получили подарки (${gifted_percent}%)`);
    data.push(stats.gifted);
    bg_color.push('limegreen');
  }
  if (stats.wins != 0) {
    labels.push(`Не пришли за подарками (${won_percent}%)`);
    data.push(stats.wins);
    bg_color.push('deepskyblue');
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
  let html = `<p>Получили подарки ${stats.gifted} из ${stats.total} человек,<br>${stats.wins} человек не пришли за подарками (либо не отмечены, как пришедшие)`;
  document.getElementById('stats').innerHTML = html;
}

function draw_chart(data) {
  let stats = {'total': 0, 'wins': 0, 'gifted': 0};
  data.forEach((d) => {
    stats.total += 1;
    if (d[1] == 1)
      stats.wins += 1;
    if (d[1] == 2)
      stats.gifted += 1;
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
      html += '<td>Не вручен</td>';
    if (code[1] == 2)
      html += '<td>Вручен</td>';
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
  document.getElementById('code').focus();
}
