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
  document.getElementById("ages").innerHTML = result;
}

function apply_filters() {
  draw_data();
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
  var result = '<table class="table table-sm"><tr><th style="border: 0" rowspan="2" colspan="2"></th><th colspan="6" style="text-align: center;">Участвуют в розыгрышах</th></tr>';
  const map = {0: 'Сегодня'};
  const max_cols = cohorts[0].length + 1;
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
    for (let j = 0; j < max_cols - 1; j++) {
      const cc = c[j];
      if (cc != undefined && c[0]) {
        const percent = Math.round(cc * 100/c[0]);
        result += `<td class="cohort-data `;
        if (percent >= 60)
          result += 'cohort-strong ';
        if (percent <= 20)
          result += 'cohort-weak ';
        
        result += `">${cc}<br><span class="cohort-data-percent`
        result += `">${percent}%</span></td>`;
      }
      else if (cc != undefined && c[0] == 0)
        result += `<td class="cohort-data cohort-weak">${cc}<br><span class="cohort-data-percent">100%</span></td>`;
      else
        result += '<td></td>';
    }
    result += '</tr>';
  }
  return result += '</table>';
}

async function draw_data() {
  const data = await get_data();
  var keys = Object.keys(data.audience);
  keys.forEach((key) => {
    console.log(key)
    document.getElementById(key).innerHTML = data.audience[key];
  });
  document.getElementById("players_brand_percent").innerHTML = Math.round(data.audience.players_brand * 100 / data.audience.players_total_active) + '%';
  
  const base = data.audience.players_total_active;
  keys.forEach((key) => {
    if (!['players_total', 'players_brand', 'players_churned', 'players_total_active'].includes(key))
      document.getElementById(key + "_percent").innerHTML = Math.round(data.audience[key] * 100 / base) + '%';
  });

  document.getElementById('par_total').innerHTML = data.campaign.par_total;
  document.getElementById('par_total_percent').innerHTML = Math.round(data.campaign.par_total * 100 / data.audience.players_brand);
  document.getElementById('par_today').innerHTML = data.campaign.par_today;
  document.getElementById('par_today_percent').innerHTML = Math.round(data.campaign.par_today * 100 / data.audience.players_brand);

  document.getElementById('cohorts').innerHTML = draw_cohorts(data.cohorts);
}

window.onload = async function() {
  draw_ages_checkboxes();
  enable_listeners();
  await draw_data();
}