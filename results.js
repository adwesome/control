var SERVER_HOSTNAME = 'http://127.0.0.1:5000';
if (location.hostname)
  SERVER_HOSTNAME = 'https://scratchit.cards';

var uid, /*orgs, votes,*/ visitors, participants, votes_clean = [], ages_stats = {}, orgs_dict = {};
var males, females, males_p, females_p;
const setup = {};
var orgs_stats = {}, table;
var votes_city_base;


const population_segezha = 22000;
const population_russia = 144820422;
const k_sr = population_segezha / population_russia;
const viewers = 5600 / 1.6;
var virality = 3; // to evaluate
var viral_max = 5;
var filled, k_cr;


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

const ids_voters = {'sex': 5, 'age': 6, 'orgs': 8};

const bad_voters = [247, 267, 240, 219, 218, 130, 19, 246, 39, 24, 274, 217, 207, 209, 157, 142, 139, 109, 105, 184, 61, 257, 110, 196, 120, 214, 94, 108, 91, 13, 205, 123, 226, 189, 192, 260, 286, 233, 243, 265, 179, 87, 228, 60, 18, 245, 106, 54, 64, 154, 152, 153, 178, 182, 103, 104, 288, 338,335,341,334,317,336,313,330];
// m: 43, 264, 115, 128, f: 78, 72, 
const categories_map = {
  'Кафе, рестораны, бары': [
    'Кафе-бар',
    'Кондитерская',
    'Кафе',
    'Кафе, бар',
    'Магазин кулинарии, производство кондитерских и хлебобулочных изделий',
    'Суши-бар',
    'Кальян-бар, антикафе',
    'Быстрое питание',
    'Пиццерия, кафе',
    'Ресторан',
    'Быстрое питание, ресторан, кафе',
    'Кафе, ресторан, быстрое питание',
    'Кафе, мороженое',
    'Кафе, столовая',
    'Рестораны',
    'Бары',
    'Магазин кулинарии',
    'Трактир',
    'Доставка еды и обедов, магазин суши и роллов',
    'Магазин японской кухни',
  ],
  'Красота': [
    'Парикмахерские',
    'Салон красоты',
    'Ногтевые студии',
    'Парикмахерская',
    'Студия красоты',
    'Ногтевая студия',
    'Магазин парфюмерии и косметики',
    'Магазин парфюмерии и косметики, магазин хозтоваров',
    'Сеть магазинов косметики и бытовой химии',
    'Магазин косметики и товаров для дома',
  ],
  'Отдых': [
    'Гостиница',
    'Баня, сауна',
    'Сауна',
    'Компьютерный клуб, киберспорт',
    'Развлекательный центр',
    'Кинотеатр',
    'Товары для рыбалки, магазин верхней одежды',
    'Детский развлекательный центр',
    'Гостиницы',
    'Турагентство, туристический инфоцентр'
  ],
  'Продукты': [
    'Магазин продуктов',
    'Молочный магазин',
    'Супермаркет',
    'Супермаркеты',
    'Продуктовый магазин',
    'Сеть супермаркетов',
    'Рыбный магазин',
    'Продовольственный магазин',
    'Орехи, снеки, сухофрукты, магазин подарков и сухофруктов',
    'Магазин низких цен',
  ],
  'Аптека и оптика': [
    'Аптека',
    'Салон оптики',
  ],
  'Спорт': [
    'Спортивный комплекс',
    'Спортивный магазин, товары для отдыха и туризма',
  ],
  'Авто- и мото-': [
    'Шиномонтаж', 
    'Электро- и бензоинструмент, запчасти для мототехники', 
    'Магазин автозапчастей и автотоваров',
    'Автошкола',
    'Автосервис',
    'Автомойка',
    'АЗС',
    'Автосервис, автотехцентр',
  ],
  'Товары для обустройства дома и дачи': [
    'Магазин для садоводов',
    'Строительный магазин',
    'Строительный магазин, магазин сантехники, электрики',
    'Торговый центр, фасады и фасадные системы',
    'Магазин мебели',
    'Магазин хозтоваров, бытовой химии и строительных материалов',
    'Магазин мебели, светильники, окна',
    'Окна',
    'Окна, жалюзи и рулонные шторы, двери',
    'Торговый центр',
    'Автоматические двери и ворота, двери',
    'Строительная компания',
    'Буровые работы, монтаж и обслуживание систем водоснабжения',
    'Магазин товаров для школы и офиса',
    'Товары для дома',
  ],
  'Бытовая техника и электроника': [
    'Оператор сотовой связи, товары для мобильных телефонов',
    'Компьютерный магазин, магазин электроники',
    'Компьютерный магазин, магазин бытовой техники',
    'Магазин бытовой техники, электроники и детских товаров',
    'Фотоуслуги, ремонт оргтехники, расходные материалы',
  ],
  'Алкоголь': [
    'Магазин разливного пива',
    'Магазин алкогольных напитков',
  ],
  'Одежда и обувь': [
    'Магазин обуви',
    'Магазин одежды',
    'Магазин нижнего белья',
    'Магазин одежды, магазин бижутерии',
    'Секонд-хенд',
    'Ремонт одежды',
    'Магазин ткани, швейная фурнитура',
    'Ателье по пошиву одежды',
  ],
  'Подарки и сувениры': [
    'Магазин подарков и сувениров',
    'Ювелирный магазин',
  ],
  'Товары для детей': [
    'Магазин детских товаров',
  ],
  'Товары для животных': [
    'Магазин',
  ],
  'Стоматология': [
    'Стоматологическая клиника',
    'Частные стоматологии',
    'Стоматологическая клиника, детская стоматология',
  ],
  'Канцтовары': [
    'Канцтовары',
    'Магазин канцтоваров'
  ],
  'Цветы': [
    'Салон',
    'Магазин цветов',
    'Магазин цветов, доставка цветов и букетов',
  ],
  'Страхование и юристы': [
    'Нотариусы',
    'Страховая компания, страхование автомобилей',
    'Агентство недвижимости, земельные участки',
  ],
};

function draw_ages_checkboxes() {
  let result = '';
  for (id in ages) {
    const label = ages[id];
    result = `<label class="ages-group"><input type="checkbox" class="selected_ages" name="" value="${id}" checked> ${label}</label><br>` + result;
  }
  result = `<label class="ages-group"><input type="checkbox" id="all_ages" name="" value="all" checked> <b>Все</b></label><br>` + result;
  document.getElementById("ages").innerHTML = result;
}

function calc_sexes() {
  let r = {'f': 0, 'm': 0};
  votes_clean.forEach((vote) => {  
    if (vote[ids_voters.sex] == sexes.f)
      r.f += 1;
    else
      r.m += 1;
  });
  
  females = r.f;
  males = r.m;
  females_p = parseInt((females * 100 / participants));
  males_p = parseInt((males * 100 / participants));
  //console.log('calc_sexes', females, males)
  //let result = `Женщин: ${females} (${females_p}%). Мужчин: ${males} (${males_p}%).`;
  //document.getElementById('sexes').innerHTML = result;
}

function calc_voters() {
  const cr = parseInt(participants * 100 / visitors);
  const cr_ = parseInt(3 * 100 / participants);
  let result = `Пришли на страничку: ${visitors}. Отметились: ${participants}. CR: ${cr}%.`;
  result += `<br><br>CR в выигрыш 3 х 1к руб для ${participants} человек, заполнивших анкету: ${cr_}% (на что эти люди уже соглашаются уже сейчас, если подарок 1к руб).`;
  document.getElementById('voters').innerHTML = result;
}

function filter_by_data_clarity() {
  const votes_extra_clean = [];
  votes.forEach((vote) => {
    if (setup.clarity == 'all') {
      if (vote[ids_voters.orgs] != '')
        votes_extra_clean.push(vote);
    }
    else {
      if (vote[ids_voters.orgs] != '' && !bad_voters.includes(vote[0]))
        votes_extra_clean.push(vote);
    }
  });
  votes_clean = votes_extra_clean;
}

function filter_by_sex() {
  if (setup.sex == 'all')
    return;

  const votes_extra_clean = [];
  votes_clean.forEach((vote) => {
    if (setup.sex == 'f' && vote[ids_voters.sex] == 1)
      votes_extra_clean.push(vote);
    else if (setup.sex == 'm' && vote[ids_voters.sex] == 2)
      votes_extra_clean.push(vote);
  });
  votes_clean = votes_extra_clean;
}

function filter_by_ages() {
  const votes_extra_clean = [];
  votes_clean.forEach((vote) => {
    if (setup.selected_ages.includes(vote[ids_voters.age])) {
      votes_extra_clean.push(vote);
    }
  });

  votes_clean = votes_extra_clean;
}

function filter_by_search_input() {
  const fd = table.rows( {search:'applied'} ).data();
  const category = document.getElementById('category');
  if (!table.search() && fd.length == 0 && category.value == '') { // initial load
    //console.log('filter_by_search_input', 'init');
    return;
  }
  else if (!table.search() && !table.column(3).search()) { // search applied 
    //console.log('filter_by_search_input', 'search');
    return;
  }
  else if (fd.length == 0) { // filter no found
    votes_clean = [];
    //console.log('filter_by_search_input', '404');
    return;
  }

  const votes_extra_clean = [];
  const pushed_votes = [];
  for (let i = 0; i < fd.length; i++) {
    const oid = fd[i][0];
    for (let j = 0; j < votes_clean.length; j++) {
      const vote = votes_clean[j];
      if (vote[ids_voters.orgs].split(',').includes(oid) && !pushed_votes.includes(vote[0])) {
        votes_extra_clean.push(vote);
        pushed_votes.push(vote[0]);
      }
    }
  }
  votes_clean = votes_extra_clean;
}

/*
function filter_by_category() {
  const votes_extra_clean = [];
  if (setup.category == 'all' || setup.category == '')
    return;

  votes_clean.forEach((vote) => {
    if (setup.category == 1) {
      votes_extra_clean.push(vote);
    }
  });

  votes_clean = votes_extra_clean;
}
*/

function collect_votes_by_setup() {
  filter_by_data_clarity();
  participants = votes_clean.length;
  filled = votes_clean.length;
  k_cr = filled / viewers;
  votes_city_base = [...votes_clean];
  filter_by_sex();
  //filter_by_category();
  calc_sexes();
  filter_by_ages();
  votes_clean_fixed = votes_clean;
  filter_by_search_input();
}

function sum_of_array(array) {  // https://stackoverflow.com/questions/1230233/how-to-find-the-sum-of-an-array-of-numbers
  return array.reduce(function(a, b) { return a + b; }, 0);
}

function fill_audience() {
  const stats_before_filter = calc_ages(votes_city_base);
  const stats_after_filter = calc_ages();
  let i = 0;
  let result = {};
  for (let age in ru) {
    const city_population = ru[age];
    const f_k = stats_after_filter.females[i] / stats_before_filter.females[i];
    const f_c = Math.round(f_k * k_sr * k_cr * virality * city_population.females);
    const m_k = stats_after_filter.males[i] / stats_before_filter.males[i];
    const m_c = Math.round(m_k * k_sr * k_cr * virality * city_population.males);
    result[age] = {'females': f_c ? f_c : 0, 'males': m_c ? m_c : 0};
    i++;
  }

  var html = '';
  let total = 0;
  let total_max = 0;
  const ages = Object.keys(ru).reverse();
  ages.forEach((age) => {
    const t = result[age].females + result[age].males;
    const t_max = result[age].females * viral_max + result[age].males * viral_max;
    html += `${t}-${t_max}<br>`;
    total += t;
    total_max += t_max;
  });
  html = `<b>${total}-${total_max}</b><br>` + html;

  document.getElementById('audience').innerHTML = html;
}

function calc_ages(votes) {
  if (!votes)
    votes = votes_clean;

  let ages_stats = {...ages};
  for (key in ages_stats)
    ages_stats[key] = {'total': 0, 'f': 0, 'm': 0};

  votes.forEach((vote) => {
    ages_stats[vote[ids_voters.age]]['total'] += 1;
    if (vote[ids_voters.sex] == sexes.f)
      ages_stats[vote[ids_voters.age]]['f'] += 1;
    else
      ages_stats[vote[ids_voters.age]]['m'] += 1;
  });

  let ms = [], ms_p = [];
  let fs = [], fs_p = [];
  for (key in ages_stats) {
    //let total = ages_stats[key].total;
    //let total_p = parseInt(total * 100 / participants);
    let f = ages_stats[key].f;
    fs.push(f);
    let m = ages_stats[key].m;
    ms.push(m);
    //let f_p = Math.round((f * 100 / participants) * 10) / 10;
    //let m_p = Math.round((m * 100 / participants) * 10) / 10;
    ////result += `${ages[key]}: ${total} (${total_p}%) (из которых Женщин: ${f} (${f_p}), Мужчин: ${m} (${m_p}))<br>`;
    //fs_p.push(f_p);
    //ms_p.push(m_p);
  }
  
  return {'females': fs, 'males': ms};
}

function get_category_by_type(type) {
  for (category in categories_map) {
    const em = categories_map[category];
    for (let i = 0; i < em.length; i++) {
      if (em[i] == type)
        return category;
    }
  }
}



function calc_orgs_stats(category) {
  orgs_stats = {};

  orgs.forEach((org) => {
    const oid = org[0];
    votes_clean_fixed.forEach((vote) => {
      const oids = vote[ids_voters.orgs].split(',');
      if (oids.includes(oid.toString())) {
        if (oid in orgs_stats)
          orgs_stats[oid]['total'] += 1;
        else
          orgs_stats[oid] = {'total': 1, 'f': 0, 'm': 0};

        if (vote[ids_voters.sex] == sexes.f)
          orgs_stats[oid]['f'] += 1;
        else
          orgs_stats[oid]['m'] += 1;
      }
    });
  });
}

function fill_table() {
  let result = [];
  for (oid in orgs_stats) {
    const org = orgs_stats[oid];
    const category = get_category_by_type(orgs_dict[oid].type);

    r = [
      oid, 
      orgs_dict[oid].name, 
      orgs_dict[oid].type, 
      category,
      orgs_dict[oid].address, 
      org.total, 
      Math.round((100 * org.total / participants) * 10) / 10,
      org.f,
      org.f == 0 ? 0 : Math.round((org.f * 100 / females) * 10) / 10,
      org.m, 
      org.m == 0 ? 0 : Math.round((org.m * 100 / males) * 10) / 10,
    ];
    result.push(r);
  }

  table.clear().draw();
  table.rows.add(result);
  table.columns.adjust().draw();
}

function fill_categories() {
  let categories = [];
  for (oid in orgs_stats) {
    const category = get_category_by_type(orgs_dict[oid].type);
    if (!categories.includes(category))
      categories.push(category);
  }

  result = `<option value="all">Все</option>`;
  categories.forEach((category) => {
    result += `<option>${category}</option>`;
  });
  document.getElementById('category').innerHTML = result;
}

function orgs_to_dict() {
  orgs.forEach((org) => {
    const o = {'name': org[1], 'type': org[2], 'address': org[3]};
    orgs_dict[org[0]] = o;
  });
}

function apply_filters() {
  collect_setup();
  //console.log(1)
  

  // category
  //let table = new DataTable('#results');
  /*
  if (setup.category == 'all')
    table.column(3).search('')//.draw(); // reset
  else {
    table.column(3).search(setup.category)//.draw();
    //participants = votes_clean.length;
    //calc_sexes();
    //calc_orgs_stats('total');
    //draw_chart();
  }
  */
  redraw_page();
}

function enable_listeners() {
  const selectors = document.querySelectorAll('select');
  selectors.forEach((el) => {
    el.addEventListener('change', function(e) {
      apply_filters();
    });
  });
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
  const response = await fetch(SERVER_HOSTNAME + `/${smth}/all`, {});
  const o = await response.json();
  return o;
}

function redraw_page() {
  collect_setup();
  //votes = (await get_smth('votes')).votes.slice(0, 900);
  //visitors = votes.length;
  //collect_votes_by_setup();
  //participants = votes_clean.length;
  //calc_sexes();

  //calc_voters();
  //calc_ages();

  //calc_orgs_stats('total');
  //fill_table();
  //collect_setup();
  //calc_orgs_normalized_stats();

  //draw_chart();
  //fill_audience();
}

function get_ages_data() {
  const ages_data = {'males': [], 'females': []};
  for (age in ru) {
    ages_data.males.push(Math.round(ru[age].males * k_sr));
    ages_data.females.push(Math.round(ru[age].females * k_sr));
  }
  return ages_data;
}

function get_param_from_url(param) {  // https://www.sitepoint.com/get-url-parameters-with-javascript/
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

function log() {
  fetch(SERVER_HOSTNAME + `?key=${get_param_from_url('key')}`, {});
}


window.onload = async function() {
  const content = document.getElementById('content');
  content.style.visibility = 'visible';
  /*
  const key = get_param_from_url('key');
  var msg_403 = 'Для доступа к ресурсу нужен ключ. ';
  const content = document.getElementById('content');
  content.style.visibility = 'visible';
  if (!key) {
    content.innerHTML = msg_403;
    return;
  }

  if (!a.includes(key)) {
    msg_403 += 'Указанный вами ключ не подходит. '
    content.innerHTML = msg_403;
    return;
  }
  */

  //orgs_to_dict();
  //apply_datatable('results');
  
  draw_ages_checkboxes();
  redraw_page();
  //fill_categories();
  
  //draw_chart('chart-sg', get_ages_data());
  enable_listeners();
  
  const query = get_param_from_url('q');
  if (query)
    table.search(query).draw();

  //log();
}