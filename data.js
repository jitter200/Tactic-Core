(function () {
  'use strict';

  const GAME_TITLE = 'TACTIC CORE';
  const GAME_SUBTITLE = 'ESPORTS MANAGEMENT SIMULATOR';
  const VERSION = '1.4.2';
  const MAX_SEASONS = 5;

  const REGIONS = ['Европа', 'Северная Америка', 'Южная Америка', 'Азия', 'СНГ', 'Океания'];
  const COUNTRIES = [
    ['Польша', 'PL', 'Европа'], ['Германия', 'DE', 'Европа'], ['Франция', 'FR', 'Европа'],
    ['Швеция', 'SE', 'Европа'], ['Дания', 'DK', 'Европа'], ['Финляндия', 'FI', 'Европа'],
    ['Испания', 'ES', 'Европа'], ['Португалия', 'PT', 'Европа'], ['Сербия', 'RS', 'Европа'],
    ['Украина', 'UA', 'СНГ'], ['Казахстан', 'KZ', 'СНГ'], ['Армения', 'AM', 'СНГ'],
    ['США', 'US', 'Северная Америка'], ['Канада', 'CA', 'Северная Америка'], ['Мексика', 'MX', 'Северная Америка'],
    ['Бразилия', 'BR', 'Южная Америка'], ['Аргентина', 'AR', 'Южная Америка'], ['Чили', 'CL', 'Южная Америка'],
    ['Япония', 'JP', 'Азия'], ['Южная Корея', 'KR', 'Азия'], ['Монголия', 'MN', 'Азия'],
    ['Австралия', 'AU', 'Океания'], ['Новая Зеландия', 'NZ', 'Океания']
  ];

  const ROLES = ['Снайпер', 'Капитан', 'Энтри', 'Люркер', 'Саппорт', 'Рифлер', 'Универсал'];
  const IDEAL_ROLES = ['Капитан', 'Снайпер', 'Энтри', 'Саппорт', 'Рифлер'];
  const ATTRS = [
    ['aim', 'Стрельба'],
    ['reaction', 'Реакция'],
    ['positioning', 'Позиционирование'],
    ['tactics', 'Тактическое мышление'],
    ['utility', 'Использование гранат'],
    ['communication', 'Коммуникация'],
    ['composure', 'Хладнокровие'],
    ['discipline', 'Дисциплина']
  ];

  const ROLE_WEIGHTS = {
    'Снайпер': { aim: 1.5, reaction: 1.35, positioning: 1.0, tactics: 0.75, utility: 0.55, communication: 0.6, composure: 1.25, discipline: 0.7 },
    'Капитан': { aim: 0.7, reaction: 0.65, positioning: 0.95, tactics: 1.55, utility: 1.0, communication: 1.5, composure: 1.0, discipline: 1.35 },
    'Энтри': { aim: 1.45, reaction: 1.35, positioning: 1.15, tactics: 0.7, utility: 0.65, communication: 0.7, composure: 0.9, discipline: 0.8 },
    'Люркер': { aim: 1.15, reaction: 1.0, positioning: 1.5, tactics: 1.15, utility: 0.7, communication: 0.65, composure: 1.2, discipline: 0.9 },
    'Саппорт': { aim: 0.8, reaction: 0.75, positioning: 1.05, tactics: 1.05, utility: 1.55, communication: 1.35, composure: 0.9, discipline: 1.35 },
    'Рифлер': { aim: 1.3, reaction: 1.15, positioning: 1.1, tactics: 0.85, utility: 0.8, communication: 0.85, composure: 1.0, discipline: 0.95 },
    'Универсал': { aim: 1.0, reaction: 1.0, positioning: 1.0, tactics: 1.0, utility: 1.0, communication: 1.0, composure: 1.0, discipline: 1.0 }
  };

  const MAPS = [
    {
      id: 'district', name: 'District', label: 'Плотная городская застройка', bias: 'тактика',
      description: 'Плотная городская застройка и сложные выходы на точки. Здесь особенно важны капитаны, саппорты, тактическое мышление и эффективное использование гранат.'
    },
    {
      id: 'foundry', name: 'Foundry', label: 'Индустриальные линии и дальние дуэли', bias: 'стрельба',
      description: 'Индустриальная карта с длинными линиями и частыми прямыми дуэлями. Здесь особенно важны снайперы, энтри и высокая реакция.'
    },
    {
      id: 'transit', name: 'Transit', label: 'Быстрые ротации и контроль центра', bias: 'командная игра',
      description: 'Запутанная система переходов и быстрые ротации между точками. Здесь особенно важны люркеры, универсалы и грамотное позиционирование.'
    },
    {
      id: 'bastion', name: 'Bastion', label: 'Узкие укреплённые проходы и борьба за высоту', bias: 'дисциплина',
      description: 'Узкие укреплённые проходы требуют точного исполнения командного плана. Здесь особенно важны рифлеры, саппорты и высокая дисциплина.'
    },
    {
      id: 'harbor', name: 'Harbor', label: 'Открытые причалы, длинные линии и быстрые обходы', bias: 'позиционирование',
      description: 'Открытые причалы создают длинные линии для перестрелок и напряжённые концовки раундов. Здесь особенно важны снайперы, универсалы и высокое хладнокровие.'
    }
  ];

  const TOURNAMENTS = [
    { id: 'opening', name: 'Opening Circuit', weeks: [3, 5], participants: 8, prize: 225000, format: 'Плей-офф на 8 команд' },
    { id: 'regional', name: 'Regional Clash', weeks: [7, 10], participants: 16, prize: 525000, format: 'Плей-офф на 16 команд' },
    { id: 'masters', name: 'WORLD CORE ESPORTS', weeks: [13, 19], participants: 16, prize: 1050000, format: '4 раунда швейцарской системы + плей-офф' },
    { id: 'world', name: 'MAJOR MASTERS DIVISION', weeks: [20, 24], participants: 24, prize: 2250000, format: 'Предварительный раунд + плей-офф на 24 команды' }
  ];

  const TEAM_BLUEPRINTS = [
    ['Team Wasps', 'WASP', 'Европа', '#FFD23A', '#FFF17A', 'wasp'],
    ['Team Sokol', 'SOK', 'Северная Америка', '#73FF5A', '#B7FF9E', 'falcon'],
    ['Mouse Sports', 'MSE', 'Европа', '#FF4B4B', '#FF8A8A', 'mletter'],
    ['Team Dragon', 'DRGN', 'СНГ', '#F3F5F2', '#D3D8D7', 'dragon'],
    ['Aurowave', 'AWR', 'Европа', '#56D8FF', '#B5F4FF', 'wave'],
    ['Cavalry Esports', 'CAV', 'Северная Америка', '#5BA8FF', '#C6E2FF', 'horse'],
    ['Nomads', 'NMD', 'Азия', '#FF8A1E', '#FFD59B', 'helmet'],
    ['FYT', 'FYT', 'Европа', '#F3F5F2', '#3B4045', 'fletter'],
    ['Team Panther', 'PTH', 'Южная Америка', '#D4FF39', '#1D3C2C', 'panther'],
    ['BoomBoom', 'BB', 'СНГ', '#F5F5F5', '#FF5454', 'bbmark'],
    ['Team Fluster', 'FLS', 'Европа', '#FF4545', '#FF9A9A', 'pistol'],
    ['Green Petal', 'GPT', 'Океания', '#61FF7A', '#C4FF9A', 'petal'],
    ['Tianlu Esports', 'TLU', 'Азия', '#FF4545', '#FF9A9A', 'lion'],
    ['Fanatics', 'FNC', 'Европа', '#FF8A1E', '#FFD59B', 'fanaticsf'],
    ['Boston80', 'B80', 'Северная Америка', '#C6FF00', '#8EFFC5', 'toxic'],
    ['Quantum Yard', 'QY', 'Азия', '#B3FF00', '#CBFF8D', 'ring'],
    ['WW Team', 'WW', 'СНГ', '#FF4545', '#FF9A9A', 'wwmark'],
    ['Solar Index', 'SLX', 'Южная Америка', '#C6FF00', '#97FF65', 'star'],
    ['Ghost Relay', 'GHR', 'Европа', '#BFFF00', '#7AFFD1', 'eye'],
    ['Vector Nine', 'V9', 'Северная Америка', '#CFFF00', '#AAFF7A', 'tech'],
    ['Axiom Crew', 'AXM', 'Океания', '#B1FF00', '#85FFC7', 'letter'],
    ['Cold Archive', 'COLD', 'Европа', '#C6FF00', '#74FF99', 'shield'],
    ['Delta Chapel', 'DLT', 'Южная Америка', '#CFFF2D', '#8AFF77', 'crystal'],
    ['Nova Freight', 'NVF', 'Азия', '#BFFF00', '#7BFFE1', 'bird']
  ];

  const FIRST_NAMES = ['Marek', 'Jonas', 'Elias', 'Milo', 'Noah', 'Aron', 'Luka', 'Dario', 'Niko', 'Soren', 'Tomas', 'Rene', 'Ilya', 'Lev', 'Anton', 'Viktor', 'Oskar', 'Emil', 'Hugo', 'Kai', 'Ren', 'Jin', 'Min', 'Tae', 'Bruno', 'Caio', 'Mateo', 'Diego', 'Leo', 'Finn', 'Aiden', 'Cole', 'Mason', 'Theo', 'Riku', 'Kenji', 'Adrian', 'Pavel', 'Miran', 'Alex'];
  const LAST_NAMES = ['Vale', 'Keller', 'Novak', 'Lind', 'Roth', 'Meyer', 'Stone', 'Ward', 'Hale', 'Kirov', 'Orlov', 'Sato', 'Mori', 'Han', 'Park', 'Silva', 'Costa', 'Ramos', 'Vega', 'Frost', 'Voss', 'Neri', 'Kane', 'Cross', 'Nash', 'Reed', 'Blake', 'Stern', 'Dahl', 'Aalto', 'Mills', 'Quinn', 'Bell', 'Ivers', 'Mann', 'Kozar', 'Reyes', 'Lima', 'Nolan', 'Sparks'];
  const NICK_PARTS_A = ['VEX', 'KRY', 'NEX', 'RUNE', 'ZED', 'AXI', 'VOID', 'FLUX', 'ECHO', 'NOVA', 'HEX', 'RIFT', 'SYN', 'ZERO', 'BYTE', 'FROST', 'MIST', 'KITE', 'ONYX', 'RAZE', 'MESH', 'CORE', 'DUSK', 'PULSE', 'GLINT', 'ARC', 'NIGHT', 'LUX', 'VOLT', 'RELAY'];
  const NICK_PARTS_B = ['9', 'X', 'R', 'Q', 'ONE', '77', 'K', 'IX', 'V', 'EX', 'IO', 'A', 'N', 'Z', '13', '2K', 'OS', 'ER', 'Y', '0'];

  function mulberry32(seed) {
    return function () {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function randomInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function choice(rng, array) {
    return array[Math.floor(rng() * array.length)];
  }

  function calculateOverall(attrs, role) {
    const weights = ROLE_WEIGHTS[role] || ROLE_WEIGHTS['Универсал'];
    let weighted = 0;
    let total = 0;
    Object.keys(weights).forEach((key) => {
      weighted += attrs[key] * weights[key];
      total += weights[key];
    });
    const core = weighted / total;
    const consistency = 100 - (Math.max(...Object.values(attrs)) - Math.min(...Object.values(attrs)));
    return Math.round(clamp(core * 0.94 + consistency * 0.06, 1, 99));
  }

  function calculateMarketValue(overall, potential, age) {
    const rating = clamp(Number(overall) || 50, 35, 99);
    const ceiling = clamp(Number(potential) || rating, rating, 99);
    const playerAge = Number(age) || 25;
    const growth = Math.max(0, rating - 55);
    const eliteGrowth = Math.max(0, rating - 70);
    const potentialBonus = Math.max(0, ceiling - rating) * 12000;

    // Стоимость растёт нелинейно: игроки 80+ должны быть дорогими активами,
    // а звёзды 85–90 OVR не должны быть доступны новой организации после одной сделки.
    let value = 90000
      + Math.pow(growth, 2) * 1800
      + Math.pow(eliteGrowth, 3) * 320
      + potentialBonus;

    if (rating < 55) {
      value = 45000 + Math.max(0, rating - 40) * 5500 + Math.max(0, ceiling - rating) * 8000;
    }

    const ageMultiplier = playerAge <= 20 ? 1.18
      : playerAge <= 23 ? 1.10
      : playerAge <= 27 ? 1
      : playerAge <= 30 ? 0.90
      : 0.80;

    return Math.max(30000, Math.round((value * ageMultiplier) / 5000) * 5000);
  }

  function makeNickname(rng, used) {
    let nickname = '';
    let attempts = 0;
    do {
      const base = choice(rng, NICK_PARTS_A);
      const suffix = rng() > 0.58 ? choice(rng, NICK_PARTS_B) : '';
      nickname = `${base}${suffix}`;
      attempts += 1;
      if (attempts > 20) nickname = `${base}${Math.floor(rng() * 999)}`;
    } while (used.has(nickname));
    used.add(nickname);
    return nickname;
  }

  function makePlayer(rng, id, base, role, teamId, usedNicks, countryOverride) {
    const country = countryOverride || choice(rng, COUNTRIES);
    const age = randomInt(rng, 18, 31);
    const variance = age <= 20 ? 8 : 6;
    const attrs = {};
    ATTRS.forEach(([key]) => {
      attrs[key] = clamp(Math.round(base + randomInt(rng, -variance, variance)), 35, 96);
    });

    if (role === 'Снайпер') { attrs.aim += 4; attrs.reaction += 3; attrs.composure += 3; }
    if (role === 'Капитан') { attrs.tactics += 6; attrs.communication += 5; attrs.discipline += 4; attrs.aim -= 2; }
    if (role === 'Энтри') { attrs.aim += 4; attrs.reaction += 5; attrs.positioning += 2; }
    if (role === 'Люркер') { attrs.positioning += 5; attrs.composure += 3; }
    if (role === 'Саппорт') { attrs.utility += 6; attrs.communication += 4; attrs.discipline += 3; }
    if (role === 'Рифлер') { attrs.aim += 3; attrs.reaction += 2; }
    Object.keys(attrs).forEach((key) => attrs[key] = clamp(attrs[key], 35, 99));

    const overall = calculateOverall(attrs, role);
    const potential = clamp(overall + randomInt(rng, age <= 20 ? 6 : 1, age <= 22 ? 16 : 8), overall, 98);
    const value = calculateMarketValue(overall, potential, age);
    const salary = Math.round((overall * overall * 0.72 + randomInt(rng, 200, 1400)) / 50) * 50;
    const secondaryChoices = ROLES.filter((item) => item !== role);

    return {
      id,
      teamId,
      firstName: choice(rng, FIRST_NAMES),
      lastName: choice(rng, LAST_NAMES),
      nickname: makeNickname(rng, usedNicks),
      age,
      country: country[0],
      countryCode: country[1],
      region: country[2],
      role,
      secondaryRole: choice(rng, secondaryChoices),
      attrs,
      overall,
      value,
      salary,
      contractWeeks: randomInt(rng, 18, 70),
      morale: randomInt(rng, 58, 83),
      fatigue: randomInt(rng, 3, 18),
      form: randomInt(rng, 48, 75),
      potential,
      status: 'Основной состав',
      isStarter: true,
      listed: false,
      injuryMatches: 0,
      injuryName: '',
      joinedWeek: 1,
      mapBonus: choice(rng, MAPS).id,
      avatarSeed: randomInt(rng, 1, 9999),
      stats: { matches: 0, maps: 0, kills: 0, deaths: 0, assists: 0, adr: 0, firstKills: 0, clutches: 0, utility: 0, rating: 0 }
    };
  }

  function academyRoleBase(role, attrs) {
    if (role === 'Снайпер') { attrs.aim += 3; attrs.reaction += 2; attrs.composure += 2; }
    if (role === 'Капитан') { attrs.tactics += 5; attrs.communication += 4; attrs.discipline += 3; attrs.aim -= 2; }
    if (role === 'Энтри') { attrs.aim += 3; attrs.reaction += 4; attrs.positioning += 1; }
    if (role === 'Люркер') { attrs.positioning += 4; attrs.composure += 3; }
    if (role === 'Саппорт') { attrs.utility += 5; attrs.communication += 3; attrs.discipline += 2; }
    if (role === 'Рифлер') { attrs.aim += 3; attrs.reaction += 2; }
  }

  function makeAcademyPlayer(rng, id, teamId, usedNicks, baseOverride) {
    const role = choice(rng, ROLES);
    const country = choice(rng, COUNTRIES);
    const age = randomInt(rng, 14, 18);
    let base = Number(baseOverride);
    if (!Number.isFinite(base)) {
      // Большинство воспитанников находятся в диапазоне 43–66 OVR.
      // Редкие сильные поколения возможны, но рейтинг в академии не превышает 84.
      base = rng() < 0.035 ? randomInt(rng, 72, 81) : randomInt(rng, 43, 64);
    }
    const attrs = {};
    ATTRS.forEach(([key]) => { attrs[key] = clamp(base + randomInt(rng, -8, 8), 30, 92); });
    academyRoleBase(role, attrs);
    Object.keys(attrs).forEach((key) => { attrs[key] = clamp(attrs[key], 30, 96); });
    let overall = calculateOverall(attrs, role);
    while (overall > 84) {
      Object.keys(attrs).forEach((key) => { attrs[key] = Math.max(30, attrs[key] - 1); });
      overall = calculateOverall(attrs, role);
    }
    const potential = clamp(overall + randomInt(rng, 8, 30) + (age <= 15 ? 3 : 0), overall + 3, 99);
    return {
      id,
      teamId,
      firstName: choice(rng, FIRST_NAMES),
      lastName: choice(rng, LAST_NAMES),
      nickname: makeNickname(rng, usedNicks),
      age,
      country: country[0],
      countryCode: country[1],
      region: country[2],
      role,
      secondaryRole: choice(rng, ROLES.filter((item) => item !== role)),
      attrs,
      overall,
      value: calculateMarketValue(overall, potential, age),
      salary: 0,
      contractWeeks: 0,
      morale: randomInt(rng, 58, 82),
      fatigue: randomInt(rng, 0, 10),
      form: randomInt(rng, 48, 72),
      potential,
      status: 'Академия',
      isStarter: false,
      inAcademy: true,
      pendingGraduation: false,
      listed: false,
      injuryMatches: 0,
      injuryName: '',
      joinedWeek: 1,
      academyYears: 0,
      academyWeeks: 0,
      academyProgress: {},
      academyOvrProgress: 0,
      lastDevelopment: null,
      mapBonus: choice(rng, MAPS).id,
      avatarSeed: randomInt(rng, 1, 9999),
      stats: { matches: 0, maps: 0, kills: 0, deaths: 0, assists: 0, adr: 0, firstKills: 0, clutches: 0, utility: 0, rating: 0 }
    };
  }

  function staffMember(rng, type, title, mapId) {
    const rating = randomInt(rng, 52, 84);
    return {
      id: `staff-${type}-${randomInt(rng, 1000, 9999)}`,
      type,
      title,
      firstName: choice(rng, FIRST_NAMES),
      lastName: choice(rng, LAST_NAMES),
      rating,
      mapId: mapId || null
    };
  }

  function createStaff(rng) {
    return {
      coach: staffMember(rng, 'coach', 'Тренер'),
      psychologist: staffMember(rng, 'psychologist', 'Психолог'),
      physio: staffMember(rng, 'physio', 'Физиотерапевт'),
      assistant: staffMember(rng, 'assistant', 'Помощник тренера', choice(rng, MAPS).id),
      analyst: staffMember(rng, 'analyst', 'Аналитик')
    };
  }

  function createStaffForSeed(seed) {
    return createStaff(mulberry32(Number(seed || Date.now()) + 68171));
  }

  function collectUsedPlayerIdentity(state) {
    const usedNicks = new Set();
    const usedIds = new Set();
    (state.teams || []).forEach((team) => {
      [...(team.players || []), ...(team.academy || []), ...(team.academyGraduates || [])].forEach((player) => {
        if (player.nickname) usedNicks.add(player.nickname);
        if (player.id) usedIds.add(player.id);
      });
    });
    (state.freeAgents || []).forEach((player) => {
      if (player.nickname) usedNicks.add(player.nickname);
      if (player.id) usedIds.add(player.id);
    });
    return { usedNicks, usedIds };
  }

  function createAcademyCandidates(state, teamId, seasonNumber, count, seed) {
    const safeCount = clamp(Math.floor(Number(count) || 3), 1, 10);
    const season = Math.max(1, Math.floor(Number(seasonNumber) || 1));
    const rng = mulberry32(Number(seed || Date.now()) + season * 22543 + Number(String(teamId).replace(/\D/g, '') || 1) * 379);
    const identity = collectUsedPlayerIdentity(state);
    const candidates = [];
    for (let index = 0; index < safeCount; index += 1) {
      let id = `academy-candidate-${teamId}-s${season}-${index + 1}`;
      let suffix = 1;
      while (identity.usedIds.has(id)) id = `academy-candidate-${teamId}-s${season}-${index + 1}-${suffix++}`;
      identity.usedIds.add(id);
      const player = makeAcademyPlayer(rng, id, teamId, identity.usedNicks);
      player.generatedSeason = season;
      candidates.push(player);
    }
    return candidates;
  }

  function teamTierBase(index) {
    if (index < 4) return { tier: 'Топ-команда', base: 84, points: 1450 - index * 25, budget: 1700000 };
    if (index < 12) return { tier: 'Сильная команда', base: 76, points: 1325 - (index - 4) * 25, budget: 1050000 };
    if (index < 20) return { tier: 'Средняя команда', base: 68, points: 1110 - (index - 12) * 24, budget: 700000 };
    return { tier: 'Развивающаяся команда', base: 60, points: 880 - (index - 20) * 28, budget: 460000 };
  }

  function buildTeams(seed) {
    const rng = mulberry32(seed || 20260714);
    const usedNicks = new Set();
    let playerCounter = 1;
    const teams = TEAM_BLUEPRINTS.map((blueprint, index) => {
      const tier = teamTierBase(index);
      const roles = [...IDEAL_ROLES];
      const players = roles.map((role) => {
        const matchingCountries = COUNTRIES.filter((country) => country[2] === blueprint[2]);
        const country = matchingCountries.length && rng() > 0.25 ? choice(rng, matchingCountries) : choice(rng, COUNTRIES);
        return makePlayer(rng, `p${playerCounter++}`, tier.base + randomInt(rng, -3, 3), role, `team${index + 1}`, usedNicks, country);
      });
      const mapSkill = {};
      MAPS.forEach((map) => mapSkill[map.id] = clamp(tier.base + randomInt(rng, -7, 7), 42, 94));
      const academy = Array.from({ length: 5 }, (_, academyIndex) => makeAcademyPlayer(
        rng,
        `academy-team${index + 1}-${academyIndex + 1}`,
        `team${index + 1}`,
        usedNicks,
        clamp(Math.round(tier.base * 0.72) + randomInt(rng, -7, 4), 42, 72)
      ));
      return {
        id: `team${index + 1}`,
        name: blueprint[0],
        tag: blueprint[1],
        region: blueprint[2],
        primaryColor: blueprint[3],
        secondaryColor: blueprint[4],
        logoType: blueprint[5],
        tier: tier.tier,
        budget: tier.budget + randomInt(rng, -120000, 180000),
        ratingPoints: tier.points + randomInt(rng, -12, 12),
        previousRank: index + 1,
        rank: index + 1,
        chemistry: clamp(tier.base + randomInt(rng, -18, 4), 45, 92),
        mapSkill,
        players,
        academy,
        academyGraduates: [],
        staff: createStaff(rng),
        history: [],
        winStreak: 0,
        lossStreak: 0,
        rosterChangedWeek: 0,
        isUser: false
      };
    });

    // Часть игроков доступна на трансферном рынке уже в начале карьеры.
    [7, 10, 14, 17, 20, 22].forEach((teamIndex) => {
      const candidate = teams[teamIndex].players.slice().sort((a, b) => a.overall - b.overall)[0];
      if (candidate) candidate.listed = true;
    });

    const freeAgents = [];
    const freeRoles = ['Снайпер', 'Капитан', 'Энтри', 'Саппорт', 'Рифлер', 'Люркер', 'Универсал', 'Рифлер', 'Энтри', 'Саппорт', 'Снайпер', 'Универсал'];
    freeRoles.forEach((role, index) => {
      const player = makePlayer(rng, `fa${index + 1}`, randomInt(rng, 54, 73), role, null, usedNicks);
      player.contractWeeks = 0;
      player.status = 'Свободный агент';
      player.isStarter = false;
      player.salary = Math.round(player.salary * 0.9 / 50) * 50;
      freeAgents.push(player);
    });
    return { teams, freeAgents };
  }

  function createSeasonFreeAgents(state, seasonNumber, count, seed) {
    const safeCount = clamp(Math.floor(Number(count) || 0), 0, 20);
    if (!safeCount) return [];

    const season = clamp(Math.floor(Number(seasonNumber) || 2), 2, MAX_SEASONS);
    const rng = mulberry32(Number(seed || Date.now()) + season * 17041 + safeCount * 313);
    const usedNicks = new Set();
    const usedIds = new Set();

    (state.teams || []).forEach((team) => {
      [...(team.players || []), ...(team.academy || []), ...(team.academyGraduates || [])].forEach((player) => {
        if (player.nickname) usedNicks.add(player.nickname);
        if (player.id) usedIds.add(player.id);
      });
    });
    (state.freeAgents || []).forEach((player) => {
      if (player.nickname) usedNicks.add(player.nickname);
      if (player.id) usedIds.add(player.id);
    });

    // Роли распределяются равномерно, чтобы в каждом новом наборе были
    // капитаны, снайперы, энтри, саппорты и рифлеры, а не случайный перекос.
    const roleCycle = [
      'Капитан', 'Снайпер', 'Энтри', 'Саппорт', 'Рифлер',
      'Люркер', 'Универсал', 'Рифлер', 'Энтри', 'Саппорт',
      'Снайпер', 'Капитан', 'Рифлер', 'Люркер', 'Универсал',
      'Энтри', 'Саппорт', 'Снайпер', 'Рифлер', 'Капитан'
    ];
    const minBase = 54 + season;
    const maxBase = 73 + season * 2;
    const agents = [];

    for (let index = 0; index < safeCount; index += 1) {
      let id = `fa-s${season}-${index + 1}`;
      let suffix = 1;
      while (usedIds.has(id)) {
        id = `fa-s${season}-${index + 1}-${suffix++}`;
      }
      usedIds.add(id);

      const role = roleCycle[index % roleCycle.length];
      const player = makePlayer(rng, id, randomInt(rng, minBase, maxBase), role, null, usedNicks);
      player.teamId = null;
      player.contractWeeks = 0;
      player.status = 'Свободный агент';
      player.isStarter = false;
      player.listed = false;
      player.joinedWeek = 1;
      player.generatedSeason = season;
      player.salary = Math.max(500, Math.round(player.salary * 0.9 / 50) * 50);
      agents.push(player);
    }

    return agents;
  }

  function createCalendar(teams, userTeamId, seed) {
    const rng = mulberry32((seed || 20260714) + 77);
    const opponents = teams.filter((team) => team.id !== userTeamId);
    const calendar = [];

    for (let week = 1; week <= 24; week += 1) {
      const tournament = TOURNAMENTS.find((item) => week >= item.weeks[0] && week <= item.weeks[1]);
      const entry = {
        week,
        training: true,
        salary: true,
        income: true,
        tournamentId: tournament ? tournament.id : null,
        match: null,
        completed: false,
        events: []
      };

      // Core League остаётся отдельным матчем. Турнирные соперники назначаются
      // движком сетки: следующий матч появляется только после определения пары.
      if (week === 2) {
        const opponent = choice(rng, opponents);
        entry.match = {
          id: `match-w${week}`,
          opponentId: opponent.id,
          tournamentId: 'league',
          tournamentName: 'Core League',
          format: 'BO1',
          status: 'pending',
          result: null,
          veto: null
        };
      }
      calendar.push(entry);
    }
    return calendar;
  }

  function makeNews(id, week, title, body, type) {
    return { id, week, title, body, type: type || 'league', time: Date.now() };
  }

  function createNewGame(orgConfig) {
    const seed = Date.now() % 2147483647;
    const generated = buildTeams(seed);
    const teams = generated.teams;
    const rng = mulberry32(seed + 912);
    const replacementIndex = 23;
    const replacement = teams[replacementIndex];
    // При повторной генерации состава пользовательской команды учитываем
    // не только игроков клубов, но и уже созданных свободных агентов.
    // Это исключает одинаковые никнеймы между составом и трансферным рынком.
    const userNickSet = new Set([
      ...teams.flatMap((team) => [
        ...(team.players || []).map((player) => player.nickname),
        ...(team.academy || []).map((player) => player.nickname),
        ...(team.academyGraduates || []).map((player) => player.nickname)
      ]),
      ...generated.freeAgents.map((player) => player.nickname)
    ]);
    const userPlayers = replacement.players.map((player, index) => {
      const role = IDEAL_ROLES[index];
      const fresh = makePlayer(rng, player.id, randomInt(rng, 60, 66), role, replacement.id, userNickSet);
      fresh.morale = randomInt(rng, 62, 78);
      fresh.fatigue = randomInt(rng, 2, 10);
      fresh.form = randomInt(rng, 52, 68);
      return fresh;
    });

    replacement.name = orgConfig.name.trim();
    replacement.tag = orgConfig.tag.trim().toUpperCase();
    replacement.region = orgConfig.region;
    replacement.primaryColor = orgConfig.primaryColor;
    replacement.secondaryColor = orgConfig.secondaryColor;
    replacement.logoType = orgConfig.logoType;
    replacement.arena = orgConfig.arena.trim();
    replacement.budget = 500000;
    replacement.ratingPoints = 700;
    replacement.rank = 24;
    replacement.previousRank = 24;
    replacement.tier = 'Новая организация';
    replacement.chemistry = randomInt(rng, 47, 57);
    replacement.players = userPlayers;
    replacement.isUser = true;
    replacement.mapSkill = {};
    MAPS.forEach((map) => {
      replacement.mapSkill[map.id] = randomInt(rng, 55, 64);
    });

    const calendar = createCalendar(teams, replacement.id, seed);
    const state = {
      version: VERSION,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      seed,
      title: GAME_TITLE,
      subtitle: GAME_SUBTITLE,
      userTeamId: replacement.id,
      career: {
        maxSeasons: MAX_SEASONS,
        completedSeasons: [],
        freeAgentSeasons: [],
        academyCandidateSeasons: [],
        tournamentWins: []
      },
      teams,
      freeAgents: generated.freeAgents,
      season: {
        number: 1,
        week: 1,
        maxWeek: 24,
        calendar,
        completed: false,
        championId: null,
        // Позиции в начале недели используются как единая точка отсчёта.
        // Несколько пересчётов рейтинга в течение недели больше не меняют направление стрелки.
        rankBaseline: Object.fromEntries(teams.map((team) => [team.id, team.rank])),
        objectives: [
          { id: 'top10', text: 'Войти в топ-10 мирового рейтинга', done: false },
          { id: 'chem70', text: 'Поднять химию до 70', done: false },
          { id: 'world', text: 'Выиграть MAJOR MASTERS DIVISION', done: false }
        ]
      },
      tournaments: TOURNAMENTS.map((tournament) => ({
        ...tournament,
        stage: 'Ожидание',
        standings: [],
        bracket: [],
        winnerId: null
      })),
      training: {
        allocations: { aim: 10, tactics: 10, teamwork: 15, district: 8, foundry: 8, transit: 8, bastion: 8, harbor: 8, fitness: 15, rest: 10 },
        confirmedWeek: 0
      },
      tactics: {
        tempo: 'Сбалансированный',
        aggression: 'Средняя',
        risk: 'Стандартный',
        utility: 65,
        discipline: 70,
        attack: 'Контроль карты',
        defense: 'Стандартная защита',
        confirmedWeek: 0
      },
      finances: {
        weeklyIncome: 52000,
        transactions: [
          { id: `tx-${Date.now()}`, week: 1, type: 'income', amount: 500000, label: 'Стартовый бюджет организации' }
        ]
      },
      transfers: {
        incomingOffers: [],
        outgoingOffers: [],
        history: []
      },
      news: [
        makeNews('news-start', 1, `${replacement.name} начинает путь`, `Новая организация ${replacement.tag} получила слот в Core League и представила стартовый состав.`, 'user'),
        makeNews('news-rank', 1, 'Сезон официально открыт', 'Двадцать четыре команды начинают борьбу за первое место мирового рейтинга.', 'league')
      ],
      settings: { autosave: true, defaultSpeed: 1, reducedMotion: false, musicVolume: 60 },
      lastMatch: null,
      lastView: 'dashboard',
      ui: { compareIds: [], transferTab: 'free', filters: {}, dashboardHint: null, academyCandidates: [], academyCandidateSeason: null }
    };

    updateRanks(state, false);
    return state;
  }

  function getUserTeam(state) {
    return state.teams.find((team) => team.id === state.userTeamId);
  }

  function findTeam(state, id) {
    return state.teams.find((team) => team.id === id);
  }

  function findPlayer(state, id) {
    for (const team of state.teams) {
      const player = [...(team.players || []), ...(team.academy || []), ...(team.academyGraduates || [])].find((item) => item.id === id);
      if (player) return player;
    }
    return state.freeAgents.find((player) => player.id === id) || null;
  }

  function findPlayerTeam(state, playerId) {
    return state.teams.find((team) => [...(team.players || []), ...(team.academy || []), ...(team.academyGraduates || [])].some((player) => player.id === playerId)) || null;
  }

  function updateRanks(state, trackChanges = true) {
    const sorted = [...state.teams].sort((a, b) => b.ratingPoints - a.ratingPoints);
    const baseline = state && state.season && state.season.rankBaseline && typeof state.season.rankBaseline === 'object'
      ? state.season.rankBaseline
      : null;
    sorted.forEach((team, index) => {
      const oldRank = Number(team.rank || index + 1);
      if (trackChanges) {
        const weekStartRank = baseline ? Number(baseline[team.id]) : NaN;
        team.previousRank = Number.isFinite(weekStartRank) ? weekStartRank : oldRank;
      } else if (!Number.isFinite(Number(team.previousRank))) {
        team.previousRank = oldRank;
      }
      team.rank = index + 1;
    });
  }

  function captureRankBaseline(state) {
    if (!state || !state.season || !Array.isArray(state.teams)) return {};
    const baseline = Object.fromEntries(state.teams.map((team) => [team.id, Number(team.rank || 1)]));
    state.season.rankBaseline = baseline;
    return baseline;
  }

  function roleBalance(team) {
    const starters = team.players.filter((player) => player.isStarter).slice(0, 5);
    const counts = {};
    starters.forEach((player) => counts[player.role] = (counts[player.role] || 0) + 1);
    let bonus = 0;
    const issues = [];
    if (!counts['Капитан']) { bonus -= 5; issues.push('Нет капитана'); } else bonus += 1.5;
    if (!counts['Снайпер']) { bonus -= 4; issues.push('Нет снайпера'); } else bonus += 1.2;
    if (!counts['Энтри']) { bonus -= 2; issues.push('Нет энтри'); }
    if (!counts['Саппорт']) { bonus -= 2; issues.push('Нет саппорта'); }
    Object.keys(counts).forEach((role) => {
      if (counts[role] >= 3) { bonus -= (counts[role] - 2) * 2.5; issues.push(`Слишком много игроков роли «${role}»`); }
      if (role === 'Капитан' && counts[role] > 1) { bonus -= 2; issues.push('Два капитана в составе'); }
    });
    if (starters.length < 5) { bonus -= (5 - starters.length) * 10; issues.push('Неполный основной состав'); }
    return { bonus, issues };
  }

  function teamAverage(team, field) {
    const starters = team.players.filter((player) => player.isStarter).slice(0, 5);
    if (!starters.length) return 0;
    return starters.reduce((sum, player) => sum + player[field], 0) / starters.length;
  }

  function money(value) {
    return `$${Math.round(value).toLocaleString('ru-RU')}`;
  }

  function formatSigned(value) {
    const rounded = Math.round(value);
    return rounded > 0 ? `+${rounded}` : String(rounded);
  }

  function dateForWeek(week, seasonNumber) {
    const season = Math.max(1, Math.floor(Number(seasonNumber) || 1));
    const base = new Date(2026, 7, 3);
    base.setDate(base.getDate() + ((season - 1) * 24 + (Number(week) - 1)) * 7);
    return base.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function getCurrentCalendarEntry(state) {
    return state.season.calendar.find((entry) => entry.week === state.season.week);
  }

  function getTournamentName(state, id) {
    if (!id || id === 'league') return 'Core League';
    const tournament = state.tournaments.find((item) => item.id === id);
    return tournament ? tournament.name : 'Core League';
  }

  window.GameData = {
    GAME_TITLE, GAME_SUBTITLE, VERSION, MAX_SEASONS, REGIONS, COUNTRIES, ROLES, IDEAL_ROLES, ATTRS,
    ROLE_WEIGHTS, MAPS, TOURNAMENTS, TEAM_BLUEPRINTS,
    clamp, randomInt, choice, calculateOverall, calculateMarketValue, createSeasonFreeAgents, createAcademyCandidates, createStaff, createStaffForSeed, createCalendar, createNewGame, getUserTeam, findTeam,
    findPlayer, findPlayerTeam, updateRanks, captureRankBaseline, roleBalance, teamAverage, money, formatSigned,
    dateForWeek, getCurrentCalendarEntry, getTournamentName, makeNews
  };
})();
