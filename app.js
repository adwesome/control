var SERVER_HOSTNAME = 'http://127.0.0.1:5000';
if (location.hostname)
  SERVER_HOSTNAME = 'https://scratchit.cards';

const setup = {};

const population_segezha = 22000;
const population_russia = 144820422;
const k_sr = population_segezha / population_russia;

const sexes = {'f': 1, 'm': 2};
const ages = {
  1: '10-14 лет',
  2: '15-19 лет',
  3: '20-24 лет',
  4: '25-29 лет',
  5: '30-34 лет',
  6: '35-39 лет',
  7: '40-44 лет',
  8: '45-49 лет',
  9: '50-54 лет',
  10: '55-59 лет',
  11: '60-64 лет',
  12: '65-69 лет',
  13: '70-79 лет',
};

const ru = {
  '10-14 лет': {'males': 4716792, 'females': 4471948},
  '15-19 лет': {'males': 4060571, 'females': 3882861},
  '20-24 лет': {'males': 3695263, 'females': 3557843},
  '25-29 лет': {'males': 3698549, 'females': 3593328},
  '30-34 лет': {'males': 5043324, 'females': 4945787},
  '35-39 лет': {'males': 6354235, 'females': 6385462},
  '40-44 лет': {'males': 5651019, 'females': 5914216},
  '45-49 лет': {'males': 4965318, 'females': 5464120},
  '50-54 лет': {'males': 4436200, 'females': 5001925},
  '55-59 лет': {'males': 3818980, 'females': 4615266},
  '60-64 лет': {'males': 4195118, 'females': 5641975},
  '65-69 лет': {'males': 3484287, 'females': 5430683},
  '70-79 лет': {'males': 3718328, 'females': 7203090},
};


function draw_ages_checkboxes() {
  let result = '';
  for (id in ages) {
    const label = ages[id];
    result = `<label class="ages-group"><input type="checkbox" class="selected_ages" name="" value="${id}" checked disabled> ${label}</label><br>` + result;
  }
  result = `<label class="ages-group"><input type="checkbox" id="all_ages" name="" value="all" checked disabled> <b>Все</b></label><br>` + result;
  //document.getElementById("ages").innerHTML = result;
}

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
  /*
  const checkboxes = document.querySelectorAll('.selected_ages');
  checkboxes.forEach((el) => {
    el.addEventListener('change', function(e) {
      apply_filters();
    });
  });
  const all_ages = document.getElementById('all_ages');
  all_ages.addEventListener('change', function(e) {
    if (e.target.checked) {
      checkboxes.forEach((el) => {
        el.checked = true;
      });
    }
    else {
      checkboxes.forEach((el) => {
        el.checked = false;
      });
    }

    apply_filters();
  });
  */
}

function collect_setup() {
  const selectors = document.querySelectorAll('select');
  selectors.forEach((el) => {
    setup[el.id] = el.value;
  });
  const selected_ages = [];
  const checkboxes = document.querySelectorAll('.selected_ages:checked');
  checkboxes.forEach((el) => {
    selected_ages.push(parseInt(el.value));
  });
  setup["selected_ages"] = selected_ages;
}

async function get_smth(smth) {
  const response = await fetch(SERVER_HOSTNAME + `/${smth}`, {});
  const o = await response.json();
  return o;
}

async function get_data() {
  collect_setup();
  return await get_smth(`get/control?bid=${setup.brand}`);
}

function draw_cohorts(cohorts) {
  const max_cols = cohorts[0].length + 1;
  var result = `<table class="table table-sm"><tr><th style="border: 0" rowspan="2" colspan="2"></th><th colspan="${max_cols}" style="text-align: center;">Участвуют, дней подряд</th></tr>`;
  const map = {0: 'Сегодня'};
  for (let j = 0; j < max_cols - 1; j++) {
    if (j == -1)
      result += `<th></th>`;
    //else if (j == 0)
    //  result += `<th>Пришли</th>`;
    else
      result += `<th style="font-weight: normal;">${j} дн.</th>`;
  }
  result += `<tr><td rowspan="${cohorts.length + 1}" style="writing-mode: vertical-rl; writing-mode: vertical-rl;
    transform: rotate(180deg);
    text-align: center;
    font-weight: bold;
    border: 0;
    ">Пришли впервые</td></tr>`;
  cohorts.reverse();
  for (let i = 0; i < cohorts.length; i++) {
    const c = cohorts[i];
    result += '<tr>';
    if (map[i])
      result += '<td>' + map[i] + '</td>';
    else
      result += `<td>${i} дн. назад</td>`;
    let cc_previous;
    for (let j = 0; j < max_cols - 1; j++) {
      const cc = c[j];
      if (cc != undefined && c[j]) {
        const percent = Math.round(cc * 100/c[0]);
        result += `<td class="cohort-data `;
        if (percent <= 20)
          result += 'cohort-weak ';
        if (cc > cc_previous)
          result += 'negative-churn ';
        if (cc == cc_previous)
          result += 'keep-score ';
        if (percent >= 60)
          result += 'cohort-strong ';

        result += `">${cc}<br><span class="cohort-data-percent`
        result += `">${percent}%</span></td>`;
      }
      else if (cc != undefined && c[j] == 0)
        result += `<td class="cohort-data cohort-weak">${cc}<br><span class="cohort-data-percent">100%</span></td>`;
      else
        result += '<td></td>';

      cc_previous = cc;
    }
    result += '</tr>';
  }
  return result += '</table>';
}

function draw_data(data) {
  var keys = Object.keys(data.audience);
  keys.forEach((key) => {
    //console.log(key)
    document.getElementById(key).innerHTML = data.audience[key];
  });
  document.getElementById("players_brand_percent").innerHTML = Math.round(data.audience.players_brand * 100 / data.audience.players_total_active) + '%';
  document.getElementById("players_churned_percent").innerHTML = Math.round(data.audience.players_churned * 100 / data.audience.players_total) + '%';

  const base = data.audience.players_brand;
  keys.forEach((key) => {
    if (!['players_total', 'players_brand', 'players_churned', 'players_total_active'].includes(key))
      document.getElementById(key + "_percent").innerHTML = Math.round(data.audience[key] * 100 / base) + '%';
  });

  document.getElementById('par_total').innerHTML = data.campaign.par_total;
  document.getElementById('par_total_percent').innerHTML = Math.round(data.campaign.par_total * 100 / base);
  document.getElementById('par_today').innerHTML = data.campaign.par_today;
  document.getElementById('par_today_percent').innerHTML = Math.round(data.campaign.par_today * 100 / base);
  document.getElementById('par_yesterday').innerHTML = data.campaign.par_yesterday;
  document.getElementById('par_yesterday_percent').innerHTML = Math.round(data.campaign.par_yesterday * 100 / base);
  document.getElementById('cohorts').innerHTML = draw_cohorts(data.cohorts);
}

function make_dataset(data) {
  var dataset = {'number': [], 'integral': []};
  if (data.length > 1) {
    for (let i = 0; i < 24; i++) {
      var sum = 0;
      for (let j = 0; j < data.length; j++) {
        if (data[j][i])
          sum += data[j][i];
      }
      dataset.number.push(sum / data.length);
    }
  }
  else {
    dataset.number = data[0];
  }
  var total = 0;
  for (let i = 0; i < 24; i++) {
    if (dataset.number[i])
      total += dataset.number[i];
  }

  var integral = 0;
  for (let i = 0; i < dataset.number.length; i++) {
    if (dataset.number[i])
      integral += dataset.number[i];

    dataset.integral.push(integral);
  }

  return dataset;
}

function draw_chart(data) {
  const bd = make_dataset(data.business_days);
  const wd = make_dataset(data.weekends);
  const td = make_dataset(data.today);
  const yd = make_dataset(data.yesterday);
  const tdwa = make_dataset(data.same_day_week_ago);

  let today_is = (new Date()).getDay();
  if (today_is == 0)  // assholes
    today_is = 7;

  const labels = {
    'ru': {
      'today': 'Сегодня',
      'yesterday': 'Вчера',
      'same_day_week_ago': 'Этот же день неделю назад',
      'today_total': 'Сегодня, сумма',
      'yesterday_total': 'Вчера, сумма',
      'same_day_week_ago_total': 'Этот же день неделю назад, сумма',
      'weekends': 'Выходные в среднем',
      'weekends_total': 'Выходные в среднем, сумма',
      'business_days': 'Будни в среднем',
      'business_days_total': 'Будни в среднем, сумма',
    }, 
    'en': {
      'today': 'Today',
      'yesterday': 'Yesterday',
      'same_day_week_ago': 'Same day last week',
      'today_total': 'Today, total',
      'yesterday_total': 'Yesterday, total',
      'same_day_week_ago_total': 'Same day last week, total',
      'weekends': 'Weekends avg.',
      'weekends_total': 'Weekends avg., total',
      'business_days': 'Business days avg.',
      'business_days_total': 'Business days avg., total',
    }};

  const lang = 'ru';

  var datasets = [
    {
      label: labels[lang].today,
      data: td.number,
      borderColor: 'forestgreen',
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 2,
      yAxisID: 'y',
    },
    {
      label: labels[lang].yesterday,
      data: yd.number,
      borderColor: 'lightgreen',
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 1.5,
      yAxisID: 'y',
      hidden: [6, 1].includes(today_is) ? true : false,  // do not show for Sat and Mon because another kind
    },
    {
      label: labels[lang].same_day_week_ago,
      data: tdwa.number,
      borderColor: 'forestgreen',
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 1,
      yAxisID: 'y',
    },
    {
      label: labels[lang].today_total,
      data: td.integral,
      borderColor: 'forestgreen',
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 2,
      yAxisID: 'y1',
      borderDash: [10,5],
      //hidden: true,
    },
    {
      label: labels[lang].yesterday_total,
      data: yd.integral,
      borderColor: 'lightgreen',
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 1.5,
      yAxisID: 'y1',
      borderDash: [10,5],
      hidden: [6, 1].includes(today_is) ? true : false,  // do not show for Sat and Mon because another kind
    },
    {
      label: labels[lang].same_day_week_ago_total,
      data: tdwa.integral,
      borderColor: 'forestgreen',
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 1,
      yAxisID: 'y1',
      borderDash: [10,5],
      //hidden: true,
    },
  ];

  if (today_is >= 6)  // Sat, Sun
    datasets.push(
      {
        label: labels[lang].weekends,
        data: wd.number,
        borderColor: 'lightgray',
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1.5,
        yAxisID: 'y',
      },
      {
        label: labels[lang].weekends_total,
        data: wd.integral,
        borderColor: 'lightgray',
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1.5,
        yAxisID: 'y1',
        borderDash: [10,5],
      },
    );
  else
    datasets.push(
      {
        label: labels[lang].business_days,
        data: bd.number,
        borderColor: 'lightgray',
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1.5,
        yAxisID: 'y',
      },
      {
        label: labels[lang].business_days_total,
        data: bd.integral,
        borderColor: 'lightgray',
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1.5,
        yAxisID: 'y1',
        borderDash: [10,5],
      },
  );

  if (Chart.getChart('chart-participation')) {  // https://stackoverflow.com/questions/72641188/canvas-is-already-in-use-chart-with-id-0-must-be-destroyed-before-the-canvas
    Chart.getChart('chart-participation')?.destroy();
  }

  new Chart('chart-participation', {
    type: 'line',
    data: {
      labels: [...Array(25).keys()].slice(1),
      datasets: datasets,
    },
    options: {
      plugins: {
        title: {
          display: false,
          text: 'Как пользователи приходят в приложение в течение суток'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          //max: 100,

          // grid line settings
          grid: {
            drawOnChartArea: false, // only want the grid lines for one axis to show up
          },
        },
      },
    },
  });
}

function estimate_leg(data) {
  const minutes = (new Date()).getMinutes();
  const ds = make_dataset(data.charts.participation.today)
  const estimate_number = Math.round(ds.number[ds.number.length - 1] * 60 / (minutes + 1));
  const estimate_integral = ds.integral[ds.integral.length - 1] + estimate_number;
  console.log(ds.integral, ds.integral.length, ds.integral[ds.integral.length - 1])
  document.getElementById('estimate_number').innerHTML = estimate_number;
  document.getElementById('estimate_integral').innerHTML = estimate_integral;

  document.getElementById('current_number').innerHTML = ds.number[ds.number.length - 1];
  document.getElementById('current_integral').innerHTML = ds.integral[ds.integral.length - 1];

  const ds_y = make_dataset(data.charts.participation.yesterday)
  const estimate_number_y = Math.round(ds_y.number[ds.number.length - 1]);
  const estimate_integral_y = Math.round(ds_y.integral[ds.integral.length - 1]);
  document.getElementById('estimate_number_y').innerHTML = estimate_number_y;
  document.getElementById('estimate_integral_y').innerHTML = estimate_integral_y;
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
  draw_ages_checkboxes();
  enable_listeners();
  const data = await get_data();
  draw_data(data);
  draw_chart(data.charts.participation);
  estimate_leg(data);
}