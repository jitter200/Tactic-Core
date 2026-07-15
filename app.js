(function () {
  'use strict';

  const D = window.GameData;
  const S = window.GameSave;
  const Sim = window.GameSimulation;
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');
  const toastRoot = document.getElementById('toast-root');

  let gameState = null;
  let currentView = 'menu';
  let vetoState = null;
  let matchController = null;
  const backgroundMusic = new Audio('esports.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.preload = 'auto';
  let audioUnlocked = false;
  let headerNotificationTimer = null;
  const MAX_SENIOR_ROSTER = 7;
  const MAX_ACADEMY_PLAYERS = 10;

  const NAV_ITEMS = [
    ['dashboard', 'Главная', 'home'],
    ['roster', 'Состав', 'users'],
    ['academy', 'Академия', 'academy'],
    ['staff', 'Персонал', 'staff'],
    ['transfers', 'Трансферы', 'swap'],
    ['training', 'Тренировки', 'activity'],
    ['tactics', 'Тактика', 'target'],
    ['maps', 'Карты', 'map'],
    ['calendar', 'Календарь', 'calendar'],
    ['tournaments', 'Турниры', 'trophy'],
    ['ranking', 'Рейтинг', 'ranking'],
    ['finances', 'Финансы', 'wallet'],
    ['settings', 'Настройки', 'settings']
  ];

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function icon(name, size) {
    const paths = {
      home: '<path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z"/>',
      users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20c.5-4 2.6-6 5.5-6s5 2 5.5 6M14 15c3.8-.5 5.8 1.2 6.5 5"/>',
      swap: '<path d="M4 7h13l-3-3M20 17H7l3 3"/>',
      activity: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
      target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
      map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
      calendar: '<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M7 2v6M17 2v6M3 10h18"/>',
      trophy: '<path d="M8 4h8v5c0 4-1.8 6-4 6s-4-2-4-6zM8 6H4v2c0 3 2 4 4 4M16 6h4v2c0 3-2 4-4 4M12 15v4M8 21h8"/>',
      ranking: '<path d="M5 20V9h4v11M10 20V4h4v16M15 20v-7h4v7M3 20h18"/>',
      wallet: '<path d="M3 6h16v14H3zM3 9h18v7h-6a3 3 0 0 1 0-6h6M16 13h.01"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.37a1.7 1.7 0 0 0-1 .63 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.5 19.3a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.13 15a1.7 1.7 0 0 0-.63-1 1.7 1.7 0 0 0-1.1-.4H2.3v-4h.1A1.7 1.7 0 0 0 4 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.4 4.13a1.7 1.7 0 0 0 1-.63 1.7 1.7 0 0 0 .4-1.1V2.3h4v.1A1.7 1.7 0 0 0 15 4a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 8.4c.17.37.4.7.63 1 .3.35.7.55 1.1.6h.1v4h-.1A1.7 1.7 0 0 0 19.4 15z"/>',
      save: '<path d="M4 3h14l2 2v16H4zM8 3v6h8V3M8 21v-7h8v7"/>',
      exit: '<path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10"/>',
      close: '<path d="m5 5 14 14M19 5 5 19"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
      trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/>',
      check: '<path d="m4 13 5 5L20 6"/>',
      arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
      search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
      pause: '<path d="M8 5v14M16 5v14"/>',
      play: '<path d="m8 5 11 7-11 7z"/>',
      skip: '<path d="m5 5 9 7-9 7zM18 5v14"/>',
      fast: '<path d="m3 5 8 7-8 7zM11 5l8 7-8 7z"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.7-5 3.3-7 8-7s7.3 2 8 7"/>',
      academy: '<path d="m3 8 9-5 9 5-9 5z"/><path d="M6 10v5c3 3 9 3 12 0v-5M21 8v7"/>',
      staff: '<rect x="4" y="7" width="16" height="13" rx="1"/><path d="M9 7V4h6v3M4 12h16M10 12v2h4v-2"/>'
    };
    return `<svg width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.info}</svg>`;
  }

  function logoSVG(type, primary, secondary) {
    const p = primary || '#C6FF00';
    const s = secondary || '#73FF5A';
    const shapes = {
      bird: `<path d="M9 31 31 9l-5 15 17-10-12 16 18 4-19 4 8 15-14-12-7 14-1-18z"/><path d="M26 24 43 14" opacity=".45"/>`,
      shield: `<path d="M12 10h40v22c0 14-10 24-20 28C22 56 12 46 12 32z"/><path d="M22 20h20v14c0 7-4 12-10 15-6-3-10-8-10-15z" opacity=".28"/>`,
      star: `<path d="m32 5 6 18 19-5-15 13 15 13-19-5-6 18-6-18-19 5 15-13L7 18l19 5z"/>`,
      eye: `<path d="M5 32S14 15 32 15s27 17 27 17-9 17-27 17S5 32 5 32z"/><circle cx="32" cy="32" r="8" fill="#080A0B"/><path d="m32 21 4 11-4 11-4-11z" fill="${s}"/>`,
      letter: `<path d="M12 12h40v10H37v30H27V22H12z"/><path d="M16 36h32v8H16z" opacity=".35"/>`,
      mletter: `<path d="M10 50V14h10l12 14 12-14h10v36h-9V28L33 42h-2L19 28v22z"/><path d="M16 47V20l16 18 16-18v27" opacity=".26"/>`,
      fletter: `<path d="M14 14h36v9H24v12h22v9H24v16H14z"/><path d="M24 35h18" stroke="${p}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".32"/>`,
      ring: `<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="12" fill="#080A0B"/><path d="M8 32h48M32 8v48" opacity=".35"/>`,
      crystal: `<path d="M32 5 54 24 43 55 21 55 10 24z"/><path d="m10 24 22 8 22-8M32 5v27M21 55l11-23 11 23" opacity=".35"/>`,
      tech: `<path d="M10 10h18v8H18v10h-8zM36 10h18v18h-8V18H36zM10 36h8v10h10v8H10zM36 36h8v10h10v8H36z"/><circle cx="32" cy="32" r="7" fill="${s}"/>`,
      wasp: `<path d="M20 18h24l8 8-8 8H20l-8-8z"/><path d="M28 34h8l4 10h-16z" opacity=".92"/><path d="M26 18l-7-8M38 18l7-8M17 27H8M56 27h-9" stroke="${p}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M26 23h12M24 27h16M26 31h12" stroke="#080A0B" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="23" cy="26" r="2.5" fill="#080A0B"/><circle cx="41" cy="26" r="2.5" fill="#080A0B"/>`,
      falcon: `<path d="M11 37 30 14h19l-13 9 15 3-8 6 6 8-16-2-11 9 4-10z"/><path d="M34 22 23 32l13 1-8 9" opacity=".35"/><circle cx="39" cy="20" r="2.2" fill="#080A0B"/>`,
      dragon: `<path d="M14 42 18 23l13-11h14l8 9-2 10-10 6 6 4-8 11-12-1-8 6 2-9z"/><path d="M31 12l4 10 8 2-7 4M22 36h18M40 37l8 5" opacity=".35"/><circle cx="40" cy="23" r="2.4" fill="#080A0B"/>
      <path d="M25 26h8" stroke="#080A0B" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      helmet: `<path d="M14 35c0-12 8-21 18-24l8-1c12 3 20 12 20 25v11H46V29H18v17H14z"/><path d="M20 29c2-7 8-11 17-12 7 0 13 3 18 12" opacity=".32"/><path d="M25 38h14" stroke="#080A0B" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      pistol: `<path d="M14 28h24l10-7h8v8l-6 4v9H34l-7 7h-9l5-8H14z"/><path d="M40 28v-8M46 35v7" opacity=".3"/><path d="M28 28v13" stroke="#080A0B" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      bbmark: `<path d="M15 14h18c8 0 12 3 12 9 0 4-2 7-6 8 6 2 9 5 9 11 0 8-6 12-16 12H15z"/><path d="M25 22h7c4 0 6-1 6-4s-2-4-6-4h-7zm0 18h8c5 0 8-2 8-5s-3-5-8-5h-8z" fill="${s}"/><path d="M37 14h5c8 0 12 3 12 9 0 4-2 7-6 8 6 2 9 5 9 11 0 8-6 12-16 12h-4z" fill="${p}" opacity=".9"/>`,
      wave: `<path d="M8 38c8-13 16-19 24-19 6 0 10 2 14 7 4 5 7 7 11 7 4 0 7-2 11-8l4 3c-6 12-13 18-22 18-6 0-10-2-14-7-4-5-7-7-11-7-4 0-8 3-13 9z"/><path d="M15 46c7-8 13-11 19-11 5 0 9 2 13 6 3 4 6 5 9 5 3 0 6-2 10-6" opacity=".35"/>`,
      lion: `<path d="M18 43 14 30l6-13 12-7h13l11 6 5 13-4 13-11 8H29z"/><path d="M25 19 22 11M33 16V8M41 17l4-8M49 21l8-5" opacity=".35"/><circle cx="42" cy="27" r="2.3" fill="#080A0B"/><path d="M28 29h11M31 35c3 2 7 2 10 0" stroke="#080A0B" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      toxic: `<circle cx="32" cy="32" r="6"/><path d="M32 11c4 0 7 2 9 5l7-4c-4-5-10-8-16-8z"/><path d="M13 27c-2 4-2 8 0 12l-7 4c-3-6-3-13 0-18z"/><path d="M51 27c2 5 2 9 0 14l7 4c4-7 4-15 0-22z"/><path d="M23 48c6 3 12 3 18 0l4 7c-8 4-16 4-26 0z"/><path d="M18 19c-3 3-5 7-5 12h8c0-3 1-5 3-7z"/><path d="M43 19c3 3 5 7 5 12h-8c0-3-1-5-3-7z"/>`,
      wwmark: `<path d="M10 14 17 50h8l7-18 7 18h8l7-36h-7l-4 24-8-20h-6l-8 20-4-24z"/><path d="M18 44 26 22M38 22l8 22" opacity=".28"/>`,
      fanaticsf: `<path d="M14 12h16v8h-7v8h10v8H23v16H14z"/><path d="M30 12h11l-5 6 6 4-7 5 6 4-7 5 7 6H30l-8-6 6-5-6-4 7-5-6-4z"/><path d="M37 18h13M35 28h11M34 38h10" opacity=".32"/>`,
      petal: `<path d="M32 10c10 4 18 15 18 27 0 10-6 18-18 22-12-4-18-12-18-22 0-12 8-23 18-27z"/><path d="M32 14c-2 12-2 28 0 40" opacity=".34"/><path d="M22 34c8 2 12 2 20 0" opacity=".28"/>`,
      horse: `<path d="M18 48V27l11-12h16l6 7-3 9-10 5 8 12H34l-5-8h-4l-2 8z"/><path d="M28 15 25 9M37 15l5-6M44 27h6" opacity=".35"/><circle cx="40" cy="24" r="2.3" fill="#080A0B"/><path d="M23 31h13" stroke="#080A0B" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      panther: `<path d="M12 39c6-13 15-22 28-24l12 4-6 7 8 7-10 13-18 3-10-5z"/><path d="M24 27h15M20 33h11M44 22l8-3" opacity=".35"/><circle cx="43" cy="25" r="2.2" fill="#080A0B"/>`
    };
    return `<svg viewBox="0 0 64 64" fill="none" stroke="${p}" stroke-width="3" stroke-linejoin="round" aria-hidden="true"><g fill="${p}" stroke="none">${shapes[type] || shapes.tech}</g></svg>`;
  }

  function playerAvatarSVG(player, teamColor) {
    const c = teamColor || '#C6FF00';
    const seed = Number(player.avatarSeed || 1);
    const maskType = seed % 4;
    const side = seed % 2 ? 1 : -1;
    const eyeY = 92 + (seed % 8);
    const mask = [
      `<path d="M64 92h72l-7 38H71z" fill="#14191b" stroke="${c}" stroke-width="2"/><path d="M78 106h44" stroke="${c}" stroke-width="3"/>`,
      `<path d="m66 91 68 2-11 44-50-2z" fill="#101416" stroke="${c}" stroke-width="2"/><path d="M82 109h32M85 119h26" stroke="${c}"/>`,
      `<path d="M69 94h62l-8 30-22 12-25-13z" fill="#111517" stroke="${c}" stroke-width="2"/><circle cx="101" cy="110" r="5" fill="${c}"/>`,
      `<path d="m71 91 58 1 7 37-35 11-35-11z" fill="#0e1214" stroke="${c}" stroke-width="2"/><path d="m78 105 22 10 24-11" stroke="${c}" stroke-width="2"/>`
    ][maskType];
    return `<svg viewBox="0 0 200 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="g${seed}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c}" stop-opacity=".45"/><stop offset=".6" stop-color="${c}" stop-opacity="0"/></linearGradient>
        <clipPath id="clip${seed}"><path d="M24 220c5-47 22-72 52-83-13-16-18-37-14-62 4-29 19-48 38-48s34 19 38 48c4 25-1 46-14 62 30 11 47 36 52 83z"/></clipPath>
      </defs>
      <rect width="200" height="220" fill="#090b0c"/>
      <path d="M0 ${45 + seed % 35} 200 ${95 + seed % 30}V0H0z" fill="url(#g${seed})" opacity=".7"/>
      <g clip-path="url(#clip${seed})">
        <path d="M24 220c5-47 22-72 52-83-13-16-18-37-14-62 4-29 19-48 38-48s34 19 38 48c4 25-1 46-14 62 30 11 47 36 52 83z" fill="#15191b"/>
        <path d="M50 220c7-36 26-55 50-55s43 19 50 55" fill="#202628"/>
        <path d="M55 76c9-43 29-57 45-57s36 14 45 57l-12 17-66-1z" fill="#1e2426" stroke="#2a3234" stroke-width="2"/>
        <path d="M61 76c9-17 20-26 39-26s30 9 39 26" fill="#0c0f10"/>
        ${mask}
        <path d="M${side > 0 ? 70 : 105} ${eyeY}h25" stroke="${c}" stroke-width="3" opacity=".9"/>
        <path d="M45 173 8 207M155 173l37 34" stroke="${c}" stroke-width="2" opacity=".28"/>
        <path d="M72 142 100 160l28-18" stroke="${c}" stroke-width="2" opacity=".5"/>
      </g>
      <path d="M15 25h30M15 25v30M185 195h-30M185 195v-30" stroke="${c}" opacity=".45"/>
      <g fill="${c}" opacity=".65"><rect x="18" y="62" width="3" height="26"/><rect x="178" y="115" width="3" height="38"/></g>
    </svg>`;
  }

  function mapSVG(mapId, color) {
    const c = color || '#C6FF00';
    const layouts = {
      district: `<path d="M36 36h74v34h31v-18h72v43h-36v29h47v68h-74v-30h-40v22H45v-52h30V99H36z"/><path d="M110 70v92M75 99h102M141 52v72M150 162h-40"/>`,
      foundry: `<path d="M33 43h74v28h45V43h76v54h-36v32h28v72h-83v-35H93v35H35v-62h25V99H33z"/><path d="M107 71v95M60 99h132M93 129h99M137 166v-37"/>`,
      transit: `<path d="M27 38h84v35h36V38h80v49h-28v41h31v73h-79v-32h-43v32H29v-68h29V91H27z"/><path d="M111 73v96M58 91h141M58 133h141M108 169V73"/>`,
      bastion: `<path d="M38 35h70v30h42V35h72v52h-28v31h35v77h-73v-29h-49v29H39v-59h28V91H38z"/><path d="M108 65v101M67 91h127M67 136h89M150 65v101M107 166h49"/>`,
      harbor: `<path d="M31 46h78v30h38V41h79v48h-31v42h31v66h-77v-31h-46v31H32v-61h25V96H31z"/><path d="M109 76v90M57 96h138M57 136h138M147 41v125M103 166h46"/>`
    };
    return `<svg viewBox="0 0 260 230" fill="none" aria-hidden="true">
      <defs><pattern id="grid-${mapId}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0v20" fill="none" stroke="rgba(255,255,255,.055)" stroke-width="1"/></pattern></defs>
      <rect width="260" height="230" fill="url(#grid-${mapId})"/>
      <g stroke="rgba(255,255,255,.5)" stroke-width="5" stroke-linejoin="round">${layouts[mapId]}</g>
      <g stroke="${c}" stroke-width="2"><circle cx="67" cy="66" r="17"/><circle cx="194" cy="176" r="17"/><path d="M113 113h34M130 96v34"/></g>
      <g fill="${c}" font-family="Arial Black,Arial" font-size="13"><text x="62" y="71">A</text><text x="189" y="181">B</text><text x="124" y="118">M</text></g>
      <path d="M10 12h35M10 12v24M250 218h-35M250 218v-24" stroke="${c}" opacity=".65"/>
    </svg>`;
  }

  function landingGlyph() {
    return `<svg viewBox="0 0 520 650" fill="none" aria-hidden="true">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#C6FF00"/><stop offset="1" stop-color="#73FF5A" stop-opacity=".2"/></linearGradient></defs>
      <path d="M100 94 350 25 490 195 423 513 173 625 31 421z" stroke="rgba(255,255,255,.18)"/>
      <path d="m145 168 196-86 106 148-74 220-191 80L73 386z" fill="url(#lg)" opacity=".12" stroke="#C6FF00" stroke-width="2"/>
      <path d="M84 356c77-112 148-193 287-251-56 101-51 185 26 286-130-60-205-47-313-35z" fill="#C6FF00" opacity=".9"/>
      <path d="M123 350c64-75 121-129 211-180-30 70-24 124 27 193-91-38-151-35-238-13z" fill="#080A0B"/>
      <circle cx="271" cy="286" r="24" fill="#73FF5A"/>
      <path d="M18 105h156M18 105v88M498 544H340M498 544v-88" stroke="#C6FF00"/>
      <g stroke="rgba(255,255,255,.24)"><path d="M0 235h520M0 412h520M172 0v650M360 0v650"/></g>
    </svg>`;
  }

  function brandGlyphSVG() {
    return `<svg viewBox="50 80 390 390" fill="none" aria-hidden="true">
      <path d="M84 356c77-112 148-193 287-251-56 101-51 185 26 286-130-60-205-47-313-35z" fill="#C6FF00"/>
      <path d="M123 350c64-75 121-129 211-180-30 70-24 124 27 193-91-38-151-35-238-13z" fill="#080A0B"/>
      <circle cx="271" cy="286" r="24" fill="#73FF5A"/>
    </svg>`;
  }

  function getUserTeam() { return D.getUserTeam(gameState); }

  function applySpecialTeamIdentity(team) {
    if (!team || team.isUser) return;
    const presets = {
      team1: { name: 'Team Wasps', tag: 'WASP', primaryColor: '#FFD23A', secondaryColor: '#FFF17A', logoType: 'wasp' },
      team2: { name: 'Team Sokol', tag: 'SOK', primaryColor: '#73FF5A', secondaryColor: '#B7FF9E', logoType: 'falcon' },
      team3: { name: 'Mouse Sports', tag: 'MSE', primaryColor: '#FF4B4B', secondaryColor: '#FF8A8A', logoType: 'mletter' },
      team4: { name: 'Team Dragon', tag: 'DRGN', primaryColor: '#F3F5F2', secondaryColor: '#D3D8D7', logoType: 'dragon' },
      team5: { name: 'Aurowave', tag: 'AWR', primaryColor: '#56D8FF', secondaryColor: '#B5F4FF', logoType: 'wave' },
      team6: { name: 'Cavalry Esports', tag: 'CAV', primaryColor: '#5BA8FF', secondaryColor: '#C6E2FF', logoType: 'horse' },
      team7: { name: 'Nomads', tag: 'NMD', primaryColor: '#FF8A1E', secondaryColor: '#FFD59B', logoType: 'helmet' },
      team8: { name: 'FYT', tag: 'FYT', primaryColor: '#F3F5F2', secondaryColor: '#3B4045', logoType: 'fletter' },
      team9: { name: 'Team Panther', tag: 'PTH', primaryColor: '#D4FF39', secondaryColor: '#1D3C2C', logoType: 'panther' },
      team10: { name: 'BoomBoom', tag: 'BB', primaryColor: '#F5F5F5', secondaryColor: '#FF5454', logoType: 'bbmark' },
      team11: { name: 'Team Fluster', tag: 'FLS', primaryColor: '#FF4545', secondaryColor: '#FF9A9A', logoType: 'pistol' },
      team12: { name: 'Green Petal', tag: 'GPT', primaryColor: '#61FF7A', secondaryColor: '#C4FF9A', logoType: 'petal' },
      team13: { name: 'Tianlu Esports', tag: 'TLU', primaryColor: '#FF4545', secondaryColor: '#FF9A9A', logoType: 'lion' },
      team14: { name: 'Fanatics', tag: 'FNC', primaryColor: '#FF8A1E', secondaryColor: '#FFD59B', logoType: 'fanaticsf' },
      team15: { name: 'Boston80', tag: 'B80', primaryColor: '#C6FF00', secondaryColor: '#8EFFC5', logoType: 'toxic' },
      team17: { name: 'WW Team', tag: 'WW', primaryColor: '#FF4545', secondaryColor: '#FF9A9A', logoType: 'wwmark' }
    };
    const preset = presets[team.id];
    if (!preset) return;
    Object.assign(team, preset);
  }

  function currentEntry() { return D.getCurrentCalendarEntry(gameState); }
  function getOpponentFromEntry(entry) { return entry && entry.match ? D.findTeam(gameState, entry.match.opponentId) : null; }

  function getMatchAITactics(match) {
    if (!match) return Sim.randomAITactics();
    if (!match.aiTactics) match.aiTactics = Sim.randomAITactics();
    return match.aiTactics;
  }

  function clearDashboardHint() {
    if (!gameState || !gameState.ui) return;
    gameState.ui.dashboardHint = null;
    const hint = document.querySelector('.dashboard-return-hint');
    if (hint) hint.remove();
    document.querySelectorAll('.nav-btn.suggested').forEach((node) => node.classList.remove('suggested'));
  }

  function preferredMapId() {
    const team = getUserTeam();
    const id = gameState && gameState.preferredMap;
    return D.MAPS.some((map) => map.id === id) ? id : bestMapForTeam(team);
  }

  function getMusicVolumeValue() {
    const raw = gameState && gameState.settings ? gameState.settings.musicVolume : 60;
    return Math.max(0, Math.min(100, Number.isFinite(Number(raw)) ? Number(raw) : 60));
  }

  function isMusicMutedByView() {
    return false;
  }

  function updateBackgroundMusicVolume() {
    backgroundMusic.volume = getMusicVolumeValue() / 100;
  }

  function syncBackgroundMusic(forcePlay) {
    updateBackgroundMusicVolume();
    if (isMusicMutedByView() || backgroundMusic.volume <= 0) {
      backgroundMusic.pause();
      return;
    }
    if (!audioUnlocked && !forcePlay) return;
    const playPromise = backgroundMusic.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }

  function unlockAudio() {
    audioUnlocked = true;
    syncBackgroundMusic(true);
  }

  function setHeaderTransferNotification(buyer, player, amount) {
    if (!gameState) return;
    gameState.ui = gameState.ui || {};
    const now = Date.now();
    const current = gameState.ui.headerNotification;
    const count = current && current.expiresAt > now ? Number(current.count || 1) + 1 : 1;
    gameState.ui.headerNotification = {
      id: `transfer-notice-${now}`,
      type: 'transfer',
      count,
      eyebrow: count > 1 ? `${count} НОВЫХ ПРЕДЛОЖЕНИЙ` : 'ТРАНСФЕРНОЕ ПРЕДЛОЖЕНИЕ',
      title: count > 1 ? `Последнее: ${buyer.name} → ${player.nickname}` : `${buyer.name} хочет купить ${player.nickname}`,
      meta: `${D.money(amount)} // ОТКРЫТЬ ПРЕДЛОЖЕНИЯ`,
      expiresAt: now + 11000
    };
  }

  function getActiveHeaderNotification() {
    const notice = gameState && gameState.ui ? gameState.ui.headerNotification : null;
    if (!notice) return null;
    if (Number(notice.expiresAt || 0) <= Date.now()) {
      gameState.ui.headerNotification = null;
      return null;
    }
    return notice;
  }

  function scheduleHeaderNotification() {
    if (headerNotificationTimer) clearTimeout(headerNotificationTimer);
    const notice = getActiveHeaderNotification();
    if (!notice) return;
    const delay = Math.max(200, notice.expiresAt - Date.now());
    headerNotificationTimer = setTimeout(() => {
      if (!gameState || !gameState.ui || !gameState.ui.headerNotification || gameState.ui.headerNotification.id !== notice.id) return;
      gameState.ui.headerNotification = null;
      const node = document.querySelector('[data-header-notification]');
      if (node) {
        node.classList.add('is-hiding');
        setTimeout(() => node.remove(), 220);
      }
    }, delay);
  }

  function shouldSuggestDashboardReturn() {
    return Boolean(gameState && gameState.ui && gameState.ui.dashboardHint && currentView !== 'dashboard');
  }

  function dashboardHintHTML() {
    const source = gameState && gameState.ui ? gameState.ui.dashboardHint : null;
    const message = source === 'training'
      ? 'План тренировок подтверждён. Перейдите на главную, чтобы продолжить неделю.'
      : source === 'tactics'
        ? 'План тактики подтверждён. Перейдите на главную, чтобы продолжить неделю.'
        : 'План на неделю подтверждён. Перейдите на главную, чтобы продолжить.';
    return `<div class="dashboard-return-hint"><div class="kicker">NEXT STEP // MAIN HUB</div><strong>${message}</strong><button class="btn btn-sm btn-primary" data-action="navigate" data-view="dashboard">Открыть главную ${icon('arrow')}</button></div>`;
  }

  function toast(message, type, duration) {
    const node = document.createElement('div');
    node.className = `toast ${type || ''}`;
    node.textContent = message;
    toastRoot.appendChild(node);
    setTimeout(() => node.remove(), duration || 3400);
  }

  function saveGame(showMessage) {
    if (!gameState) return false;
    gameState.updatedAt = Date.now();
    gameState.lastView = currentView === 'match' || currentView === 'veto' || currentView === 'postmatch' ? 'dashboard' : currentView;
    const ok = S.save(gameState);
    if (showMessage) toast(ok ? 'Игра сохранена' : 'Ошибка сохранения', ok ? '' : 'error');
    return ok;
  }

  function autosave() {
    if (gameState && gameState.settings.autosave) saveGame(false);
  }

  function openModal(title, body, wide) {
    modalRoot.className = 'modal-root open';
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal"></div>
      <section class="modal ${wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}">
        <header class="modal-head"><h2>${escapeHTML(title)}</h2><button class="btn icon-btn" data-action="close-modal" aria-label="Закрыть">${icon('close')}</button></header>
        <div class="modal-body">${body}</div>
      </section>`;
  }

  function closeModal() {
    modalRoot.className = 'modal-root';
    modalRoot.innerHTML = '';
  }

  function renderApp() {
    document.body.classList.toggle('reduced-motion', Boolean(gameState && gameState.settings.reducedMotion));
    if (currentView === 'create') {
      renderCreateOrganization();
      syncBackgroundMusic();
      return;
    }
    if (!gameState || currentView === 'menu') {
      renderMenu();
      syncBackgroundMusic();
      return;
    }
    if (currentView === 'match') {
      renderMatchScreen();
      syncBackgroundMusic();
      return;
    }
    updateTournamentStates(false);
    renderShell();
    syncBackgroundMusic();
  }

  function renderMenu() {
    const hasSave = S.exists();
    app.innerHTML = `<main class="landing screen-fade">
      <section class="landing-art">
        <div class="landing-brand">
          <div class="kicker">Competitive operations system // 01</div>
          <h1 class="landing-title">TACTIC <span>CORE</span></h1>
          <div class="landing-subtitle">Esports management simulator</div>
        </div>
        <div class="landing-glyph">${landingGlyph()}</div>
        <div class="landing-orbit"></div>
        <div class="landing-meta">
          <div><div class="kicker">Teams</div><strong>24</strong><div class="muted tiny upper">В мировой системе</div></div>
          <div><div class="kicker">Players</div><strong>120+</strong><div class="muted tiny upper">Уникальных карьер</div></div>
          <div><div class="kicker">Season</div><strong>24</strong><div class="muted tiny upper">Игровые недели</div></div>
        </div>
      </section>
      <section class="landing-menu">
        <div class="menu-card">
          <div class="kicker">Career terminal // access</div>
          <h2 class="page-title" style="margin-top:15px">ЦЕНТР<br>УПРАВЛЕНИЯ</h2>
          <p class="muted" style="line-height:1.65;margin:18px 0 0">Создайте организацию, соберите состав и пройдите полный сезон вымышленной соревновательной FPS-лиги.</p>
          <div class="menu-actions">
            <button class="btn btn-primary btn-lg" data-action="new-career"><span>Новая карьера</span>${icon('arrow')}</button>
            <button class="btn btn-lg" data-action="continue" ${hasSave ? '' : 'disabled'}><span>Продолжить</span>${icon('play')}</button>
            <button class="btn btn-danger" data-action="delete-save" ${hasSave ? '' : 'disabled'}><span>Удалить сохранение</span>${icon('trash')}</button>
          </div>
          <div class="version"><span>Build ${D.VERSION}</span><span>Local / Offline</span></div>
        </div>
      </section>
    </main>`;
  }

  function renderCreateOrganization() {
    app.innerHTML = `<main class="create-screen screen-fade">
      <aside class="create-aside">
        <button class="btn btn-sm" data-action="back-menu">${icon('arrow')} Назад</button>
        <div style="margin-top:52px" class="kicker">Organization builder // 02</div>
        <h1 class="page-title" style="margin-top:14px">СОЗДАЙТЕ<br>СВОЙ КЛУБ</h1>
        <p class="muted" style="line-height:1.65;margin-top:20px">Ваша организация заменит одну из команд лиги, получит пять игроков среднего уровня и стартовый бюджет $500 000.</p>
        <div class="divider"></div>
        <div class="stack small muted">
          <div class="row-between"><span>Мировых команд</span><strong class="acid">24</strong></div>
          <div class="row-between"><span>Стартовый рейтинг</span><strong class="acid">#24</strong></div>
          <div class="row-between"><span>Длина сезона</span><strong class="acid">24 недели</strong></div>
        </div>
      </aside>
      <section class="create-content">
        <form id="org-form" class="create-form">
          <div class="panel panel-pad">
            <div class="panel-head"><div><div class="kicker">Identity parameters</div><h2 class="section-title" style="margin-top:8px">Параметры организации</h2></div><span class="tag tag-acid">Обязательные поля</span></div>
            <div class="form-grid">
              <label class="label">Название организации<input class="input" name="name" maxlength="28" required value="Apex Dominion" placeholder="Например, Apex Dominion"></label>
              <label class="label">Тег, 2–5 символов<input class="input" name="tag" minlength="2" maxlength="5" required value="APX" pattern="[A-Za-zА-Яа-я0-9]{2,5}" placeholder="APX"></label>
              <label class="label">Регион<select class="select" name="region">${D.REGIONS.map((region) => `<option>${region}</option>`).join('')}</select></label>
              <label class="label">Домашняя арена<input class="input" name="arena" maxlength="32" required value="Core Hall" placeholder="Core Hall"></label>
              <div class="full color-pair">
                <label class="label">Основной цвет<div class="color-control"><input type="color" name="primaryColor" value="#C6FF00"><span>#C6FF00</span></div></label>
                <label class="label">Дополнительный цвет<div class="color-control"><input type="color" name="secondaryColor" value="#73FF5A"><span>#73FF5A</span></div></label>
              </div>
              <div class="full label">Выберите эмблему
                <div class="logo-picker">${['bird','shield','star','eye','letter','ring','crystal','tech'].map((type, index) => `<button type="button" class="logo-option ${index === 0 ? 'active' : ''}" data-action="select-logo" data-logo="${type}" aria-label="Эмблема ${index + 1}">${logoSVG(type)}</button>`).join('')}</div>
                <input type="hidden" name="logoType" value="bird">
              </div>
            </div>
            <div id="org-preview" class="org-preview panel">${organizationPreviewHTML('Apex Dominion','APX','#C6FF00','#73FF5A','bird','Европа')}</div>
            <div class="row-between wrap" style="margin-top:18px;justify-content:flex-end"><button type="submit" class="btn btn-primary btn-lg">Создать организацию ${icon('arrow')}</button></div>
          </div>
        </form>
      </section>
    </main>`;
  }

  function organizationPreviewHTML(name, tag, primary, secondary, logoType, region) {
    return `<div class="org-preview-logo" style="color:${escapeHTML(primary)}">${logoSVG(logoType, primary, secondary)}</div>
      <div><div class="kicker">Live preview</div><div style="font-family:Arial Black,sans-serif;font-size:29px;text-transform:uppercase;margin-top:7px">${escapeHTML(name || 'Название клуба')}</div><div class="row wrap" style="margin-top:10px"><span class="tag tag-acid">${escapeHTML(tag || 'TAG')}</span><span class="tag">${escapeHTML(region)}</span><span class="tag">Core League</span></div></div>`;
  }

  function renderShell() {
    const team = getUserTeam();
    const viewHTML = renderView();
    const highlightDashboard = shouldSuggestDashboardReturn();
    const hintHTML = highlightDashboard ? dashboardHintHTML() : '';
    app.innerHTML = `<div class="shell screen-fade">
      <aside class="sidebar">
        <div class="sidebar-brand"><div class="brand-mark">${brandGlyphSVG()}</div><div class="brand-text"><strong>TACTIC CORE</strong><small>Management system</small></div></div>
        <nav class="nav">${NAV_ITEMS.map((item, index) => `<button class="nav-btn ${currentView === item[0] ? 'active' : ''} ${highlightDashboard && item[0] === 'dashboard' ? 'suggested' : ''}" data-action="navigate" data-view="${item[0]}">${icon(item[2])}<span>${item[1]}</span><b class="nav-index">${String(index + 1).padStart(2,'0')}</b></button>`).join('')}</nav>
        <div class="sidebar-bottom">
          <button class="nav-btn" data-action="save-game">${icon('save')}<span>Сохранить игру</span></button>
          <button class="nav-btn" data-action="exit-menu">${icon('exit')}<span>В главное меню</span></button>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <div class="topbar-org"><div class="topbar-logo" style="color:${team.primaryColor}">${logoSVG(team.logoType, team.primaryColor, team.secondaryColor)}</div><div class="topbar-org-name"><strong>${escapeHTML(team.name)}</strong><small>${escapeHTML(team.tag)} // ${escapeHTML(team.region)}</small></div></div>
          <div class="topbar-stats">
            <div class="top-stat"><small>Бюджет</small><strong class="acid">${D.money(team.budget)}</strong></div>
            <div class="top-stat"><small>Сезон / неделя</small><strong>S${gameState.season.number} · W${gameState.season.week}/${gameState.season.maxWeek}</strong></div>
            <div class="top-stat"><small>Рейтинг</small><strong>#${team.rank}</strong></div>
          </div>
        </header>
        ${hintHTML}
        <main class="content">${viewHTML}</main>
      </div>
    </div>`;
  }

  function pageHead(index, title, description, actions) {
    return `<div class="page-head"><div class="page-head-copy"><div class="kicker">Screen ${index} // Management terminal</div><h1 class="page-title" style="margin-top:10px">${title}</h1><p>${description}</p></div>${actions ? `<div class="row wrap">${actions}</div>` : ''}</div>`;
  }

  function renderView() {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'roster': return renderRoster();
      case 'academy': return renderAcademy();
      case 'staff': return renderStaff();
      case 'transfers': return renderTransfers();
      case 'training': return renderTraining();
      case 'tactics': return renderTactics();
      case 'maps': return renderMaps();
      case 'calendar': return renderCalendar();
      case 'tournaments': return renderTournaments();
      case 'ranking': return renderRanking();
      case 'finances': return renderFinances();
      case 'settings': return renderSettings();
      case 'veto': return renderVeto();
      case 'postmatch': return renderPostMatch();
      default: currentView = 'dashboard'; return renderDashboard();
    }
  }

  function stableStringHash(value) {
    let hash=2166136261;
    String(value||'').split('').forEach((char)=>{hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);});
    return hash>>>0;
  }

  function analystReportHTML(entry) {
    const team=getUserTeam();
    const analyst=team.staff&&team.staff.analyst;
    if(!entry||!entry.match||!analyst)return '';
    const tactics=getMatchAITactics(entry.match);
    if(!tactics)return '';
    const count=analystRevealCount(analyst.rating);
    const fields=[
      {key:'tempo',label:'Темп',value:tactics.tempo},
      {key:'aggression',label:'Агрессия',value:tactics.aggression},
      {key:'risk',label:'Риск',value:tactics.risk},
      {key:'attack',label:'План атаки',value:tactics.attack},
      {key:'defense',label:'План защиты',value:tactics.defense},
      {key:'utility',label:'Использование гранат',value:tactics.utility},
      {key:'discipline',label:'Дисциплина',value:tactics.discipline}
    ];
    const seed=stableStringHash(`${entry.match.id}-${analyst.id}-${gameState.season.number}`);
    const selected=fields.slice().sort((a,b)=>((stableStringHash(a.key)+seed)%997)-((stableStringHash(b.key)+seed)%997)).slice(0,count);
    return `<div class="analyst-report"><div class="row-between"><div><div class="kicker">ANALYST REPORT // ${escapeHTML(analyst.firstName)} ${escapeHTML(analyst.lastName)}</div><strong>Разведданные о тактике соперника</strong></div><span class="tag tag-acid">${count}/4</span></div><div class="analyst-grid">${selected.map((item)=>`<div><small>${escapeHTML(item.label)}</small><strong>${escapeHTML(item.value)}</strong></div>`).join('')}</div></div>`;
  }

  function renderDashboard() {
    const team = getUserTeam();
    const lineup = Sim.starterLineup(team);
    const safeCount = Math.max(1, lineup.length);
    const avgMorale = Math.round(lineup.reduce((s,p) => s+p.morale,0)/safeCount);
    const avgFatigue = Math.round(lineup.reduce((s,p) => s+p.fatigue,0)/safeCount);
    const avgForm = Math.round(lineup.reduce((s,p) => s+p.form,0)/safeCount);
    updateObjectives();
    const warnings = getWarnings();

    if (gameState.season.completed) {
      const summary = gameState.season.summary || buildSeasonSummary();
      const canStartNext = gameState.season.number < gameState.career.maxSeasons;
      const actions = `<button class="btn" data-action="save-game">${icon('save')} Сохранить</button>${canStartNext?`<button class="btn btn-primary" data-action="start-new-season">НОВЫЙ СЕЗОН ${icon('arrow')}</button>`:'<span class="tag tag-acid">КАРЬЕРА ЗАВЕРШЕНА</span>'}`;
      return `${pageHead('01','ИТОГИ СЕЗОНА',`Сезон ${gameState.season.number} завершён. Итоговые результаты сохранены в истории карьеры.`,actions)}
        ${seasonSummaryPanelHTML(summary)}
        ${newSeasonWidgetHTML(summary)}
        <div class="grid-4" style="margin:16px 0">
          ${metricCard('01','Итоговый рейтинг',`#${summary.finalRank}`,`${Math.round(summary.ratingPoints)} рейтинговых очков`)}
          ${metricCard('02','Баланс сезона',`${summary.wins}–${summary.losses}`,`${summary.matches} сыгранных матчей`)}
          ${metricCard('03','Командная химия',`${Math.round(team.chemistry)}`,team.chemistry >= 70 ? 'Сильная сыгранность' : 'Есть запас для роста',team.chemistry)}
          ${metricCard('04','Бюджет клуба',D.money(team.budget),'Переходит в следующий сезон')}
        </div>
        <div class="grid-2">
          <section class="panel panel-pad"><div class="panel-head"><h2 class="section-title">Задачи сезона</h2><span class="tag">${summary.objectivesDone}/3</span></div><div class="task-list">${gameState.season.objectives.map((o) => `<div class="task ${o.done?'done':''}"><span class="task-dot"></span><span>${escapeHTML(o.text)}</span></div>`).join('')}</div></section>
          <section class="panel panel-pad"><div class="panel-head"><h2 class="section-title">Последние результаты</h2><span class="tag">SEASON ${String(summary.number).padStart(2,'0')}</span></div>${formHTML(team.history,8)}</section>
        </div>
        ${careerHistoryHTML()}
        <section class="panel panel-pad" style="margin-top:16px"><div class="panel-head"><h2 class="section-title">Новости лиги</h2><button class="btn btn-sm" data-action="navigate" data-view="ranking">Открыть рейтинг</button></div><div class="news-list">${gameState.news.slice(0,4).map(newsHTML).join('')}</div></section>`;
    }

    const entry = currentEntry();
    const opponent = getOpponentFromEntry(entry);
    const forecastMap = preferredMapId();
    const opponentTactics = opponent && entry && entry.match ? getMatchAITactics(entry.match) : null;
    const chance = opponent ? Math.round(Sim.estimateWinChance(team, opponent, forecastMap, gameState.tactics, opponentTactics, Number(entry.match.comebackPowerBonus || 0), 0) * 100) : 0;
    return `${pageHead('01','ГЛАВНАЯ',`Сезон ${gameState.season.number} из ${gameState.career.maxSeasons}. Текущая ситуация в клубе, ближайший матч и события лиги.`, `<button class="btn" data-action="save-game">${icon('save')} Сохранить</button><button class="btn btn-primary" data-action="end-week">Завершить неделю ${icon('arrow')}</button>`)}
      <div class="grid-4" style="margin-bottom:16px">
        ${metricCard('01','Мировой рейтинг',`#${team.rank}`,`${D.formatSigned(team.previousRank - team.rank)} позиции за период`)}
        ${metricCard('02','Командная химия',`${Math.round(team.chemistry)}`,team.chemistry >= 70 ? 'Состав действует уверенно' : 'Нужно больше командной работы',team.chemistry)}
        ${metricCard('03','Средняя мораль',`${avgMorale}`,avgMorale >= 70 ? 'Позитивная атмосфера' : 'Есть напряжение в составе',avgMorale)}
        ${metricCard('04','Средняя усталость',`${avgFatigue}`,avgFatigue > 60 ? 'Требуется отдых' : 'Нагрузка под контролем',avgFatigue,true)}
      </div>
      <div class="dashboard-grid">
        <section class="next-match panel cut">
          <div class="row-between"><div><div class="kicker">Season ${String(gameState.season.number).padStart(2,'0')} // Week ${gameState.season.week}</div><h2 class="section-title" style="margin-top:8px">${opponent ? 'Следующий матч' : 'Неделя без матча'}</h2></div><span class="tag tag-acid">${opponent ? escapeHTML(entry.match.format) : 'TRAINING WEEK'}</span></div>
          ${opponent ? `<div class="match-versus">
            ${teamFaceHTML(team)}<div class="vs">VS</div>${teamFaceHTML(opponent)}
          </div>
          <div class="row-between wrap" style="margin-bottom:14px"><div><strong>${escapeHTML(entry.match.tournamentName)}</strong><div class="muted small" style="margin-top:4px">${D.dateForWeek(gameState.season.week, gameState.season.number)} · соперник #${opponent.rank}</div></div><button class="btn btn-primary" data-action="prepare-match">Подготовиться к матчу ${icon('arrow')}</button></div>
          <div class="chance-block"><div class="chance-labels"><span>${team.tag} ${chance}%</span><span>${100-chance}% ${opponent.tag}</span></div><div class="chance-bar"><span class="chance-user" style="--chance:${chance}%"></span><span class="chance-opp"></span></div><div class="muted tiny upper" style="margin-top:8px">Прогноз для карты ${escapeHTML(D.MAPS.find((map)=>map.id===forecastMap).name)} · тактика соперника зафиксирована до матча</div></div>${analystReportHTML(entry)}` : `<div class="empty-state" style="margin-top:24px;min-height:240px"><div>${icon('activity',56)}<strong style="display:block;color:var(--text);margin-top:12px">Матчей на этой неделе нет</strong><p>Используйте время для тренировки, восстановления и работы на трансферном рынке.</p></div></div>`}
        </section>
        <div class="stack">
          <section class="panel panel-pad"><div class="panel-head"><h2 class="section-title">Задачи сезона</h2><span class="tag">${gameState.season.objectives.filter(o=>o.done).length}/3</span></div><div class="task-list">${gameState.season.objectives.map((o) => `<div class="task ${o.done?'done':''}"><span class="task-dot"></span><span>${escapeHTML(o.text)}</span></div>`).join('')}</div></section>
          <section class="panel panel-pad"><div class="panel-head"><h2 class="section-title">Последние результаты</h2><span class="tag">FORM ${avgForm}</span></div>${formHTML(team.history,8)}</section>
        </div>
      </div>
      <div class="grid-2" style="margin-top:16px">
        <section class="panel panel-pad"><div class="panel-head"><h2 class="section-title">Предупреждения</h2><span class="tag ${warnings.length?'tag-danger':''}">${warnings.length}</span></div><div class="warning-list">${warnings.length ? warnings.map(w=>`<div class="warning-item">${escapeHTML(w)}</div>`).join('') : '<div class="muted small">Критических предупреждений нет.</div>'}</div></section>
        <section class="panel panel-pad"><div class="panel-head"><h2 class="section-title">Новости лиги</h2><button class="btn btn-sm" data-action="navigate" data-view="ranking">Открыть рейтинг</button></div><div class="news-list">${gameState.news.slice(0,4).map(newsHTML).join('')}</div></section>
      </div>
      ${careerHistoryHTML()}`;
  }

  function seasonSummaryPanelHTML(summary) {
    const champion = D.findTeam(gameState, summary.championId);
    const worldWinner = D.findTeam(gameState, summary.worldWinnerId);
    return `<section class="season-summary panel cut">
      <div class="season-summary-copy"><div class="kicker">SEASON ${String(summary.number).padStart(2,'0')} // FINAL REPORT</div><h2>${summary.finalRank===1?'МИРОВОЙ ЛИДЕР':`ИТОГОВОЕ МЕСТО #${summary.finalRank}`}</h2><p>Сезон завершён со статистикой <strong>${summary.wins} побед / ${summary.losses} поражений</strong>. Состав, бюджет, рейтинг, контракты и развитие игроков сохраняются.</p></div>
      <div class="season-summary-facts"><div><small>Лидер рейтинга</small><strong>${champion?escapeHTML(champion.name):'—'}</strong></div><div><small>MAJOR MASTERS DIVISION</small><strong>${worldWinner?escapeHTML(worldWinner.name):'—'}</strong></div><div><small>Выполнено задач</small><strong>${summary.objectivesDone} / 3</strong></div></div>
    </section>`;
  }

  function newSeasonWidgetHTML(summary) {
    const maxSeasons = gameState.career.maxSeasons;
    const canStartNext = summary.number < maxSeasons;
    if (!canStartNext) {
      return `<section class="new-season-widget panel cut career-finished"><div><div class="kicker">CAREER COMPLETE // ${maxSeasons} SEASONS</div><h2>КАРЬЕРА ЗАВЕРШЕНА</h2><p>Все ${maxSeasons} сезонов пройдены. Итоги каждого сезона сохранены ниже.</p></div><span class="career-count">${maxSeasons}/${maxSeasons}</span></section>`;
    }
    return `<section class="new-season-widget panel cut"><div><div class="kicker">NEXT CYCLE // SEASON ${String(summary.number+1).padStart(2,'0')}</div><h2>НАЧАТЬ НОВЫЙ СЕЗОН</h2><p>Состав, деньги, контракты, характеристики, рейтинг и история клуба сохранятся. Календарь и турниры будут сформированы заново, а на рынке появятся 20 новых свободных агентов.</p></div><div class="new-season-actions"><span class="career-count">${summary.number}/${maxSeasons}</span><button class="btn btn-primary btn-lg" data-action="start-new-season">НАЧАТЬ НОВЫЙ СЕЗОН ${icon('arrow')}</button></div></section>`;
  }

  function careerHistoryHTML() {
    const seasons = gameState.career && Array.isArray(gameState.career.completedSeasons) ? gameState.career.completedSeasons : [];
    if (!seasons.length) return '';
    return `<section class="panel panel-pad career-history" style="margin-top:16px"><div class="panel-head"><h2 class="section-title">История сезонов</h2><span class="tag">${seasons.length}/${gameState.career.maxSeasons}</span></div><div class="table-wrap"><table><thead><tr><th>Сезон</th><th>Итоговое место</th><th>Матчи</th><th>Задачи</th><th>Победитель рейтинга</th><th>Главный чемпионат</th><th>Бюджет</th></tr></thead><tbody>${seasons.slice().reverse().map((item)=>{const champion=D.findTeam(gameState,item.championId);const world=D.findTeam(gameState,item.worldWinnerId);return `<tr><td><strong>S${String(item.number).padStart(2,'0')}</strong></td><td class="${item.finalRank===1?'acid':''}"><strong>#${item.finalRank}</strong></td><td>${item.wins}–${item.losses}</td><td>${item.objectivesDone}/3</td><td>${champion?escapeHTML(champion.name):'—'}</td><td>${world?escapeHTML(world.name):'—'}</td><td>${D.money(item.budget)}</td></tr>`;}).join('')}</tbody></table></div></section>`;
  }

  function metricCard(index, label, value, sub, progress, danger) {
    return `<div class="metric" data-index="${index}"><div class="metric-label">${label}</div><div class="metric-value">${value}</div>${progress != null ? `<div class="progress ${danger?'danger-bar':''}" style="margin-top:12px"><span style="--value:${D.clamp(progress,0,100)}%"></span></div>` : ''}<div class="metric-sub">${sub}</div></div>`;
  }

  function teamFaceHTML(team) {
    return `<div class="team-face"><div class="team-face-logo" style="--team-color:${team.primaryColor};color:${team.primaryColor}">${logoSVG(team.logoType,team.primaryColor,team.secondaryColor)}</div><div><div class="team-face-name">${escapeHTML(team.tag)}</div><div class="muted small">${escapeHTML(team.name)}</div></div></div>`;
  }

  function formHTML(history, count) {
    const results = [...(history || [])].slice(0,count);
    while (results.length < count) results.push('—');
    return `<div class="results-strip">${results.map(r => `<span class="result-pill ${r==='W'?'w':r==='L'?'l':''}">${r}</span>`).join('')}</div>`;
  }

  function newsHTML(news) {
    return `<article class="news-item"><div class="news-meta"><span>W${news.week} // ${escapeHTML(news.type)}</span><span>${new Date(news.time).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</span></div><strong>${escapeHTML(news.title)}</strong><p>${escapeHTML(news.body)}</p></article>`;
  }

  function getWarnings() {
    const team = getUserTeam();
    const warnings = [];
    const expiring = team.players.filter(p => p.contractWeeks <= 6);
    if (expiring.length) warnings.push(`Контракты заканчиваются: ${expiring.map(p=>p.nickname).join(', ')}`);
    const tired = team.players.filter(p => p.isStarter && p.fatigue >= 65);
    if (tired.length) warnings.push(`Высокая усталость у игроков: ${tired.map(p=>p.nickname).join(', ')}`);
    const injured = team.players.filter((p)=>Number(p.injuryMatches||0)>0);
    if (injured.length) warnings.push(`Травмированы: ${injured.map((p)=>`${p.nickname} (${p.injuryMatches} мат.)`).join(', ')}`);
    const unhappy = team.players.filter(p => p.morale <= 35);
    if (unhappy.length) warnings.push(`Низкая мораль: ${unhappy.map(p=>p.nickname).join(', ')}`);
    const roleIssues = D.roleBalance(team).issues;
    warnings.push(...roleIssues);
    if (team.budget < weeklySalary(team) * 2) warnings.push('Бюджета осталось меньше чем на две недельные выплаты зарплат.');
    if ((team.academyGraduates||[]).length) warnings.push(`Решите будущее выпускников академии: ${(team.academyGraduates||[]).map((player)=>player.nickname).join(', ')}`);
    if ((team.academy||[]).length >= MAX_ACADEMY_PLAYERS) warnings.push('Академия заполнена. Для новых игроков потребуется освободить место.');
    return warnings;
  }

  function renderRoster() {
    const team = getUserTeam();
    const starters = team.players.filter(p=>p.isStarter).slice(0,5);
    const bench = team.players.filter(p=>!p.isStarter);
    const balance = D.roleBalance(team);
    return `${pageHead('02','СОСТАВ','Пять игроков стартового состава и до двух запасных. Управляйте ролями, контрактами и состоянием команды.', `<button class="btn" data-action="open-compare">Сравнить игроков</button><button class="btn btn-primary" data-action="navigate" data-view="transfers">Открыть рынок ${icon('arrow')}</button>`)}
      <div class="row-between wrap" style="margin-bottom:14px"><div class="row wrap"><span class="tag tag-acid">Стартовый состав ${starters.length}/5</span><span class="tag">Игроки клуба ${team.players.length}/${MAX_SENIOR_ROSTER}</span><span class="tag">Химия ${Math.round(team.chemistry)}</span><span class="tag ${balance.issues.length?'tag-danger':''}">Баланс ролей ${balance.bonus>=0?'+':''}${balance.bonus.toFixed(1)}</span></div>${balance.issues.length?`<span class="warning small">${escapeHTML(balance.issues.join(' · '))}</span>`:'<span class="acid small">Ролевой баланс в норме</span>'}</div>
      <div class="roster-grid">${starters.map((player,index)=>playerCardHTML(player,team,index)).join('')}</div>
      <section class="panel panel-pad" style="margin-top:18px"><div class="panel-head"><div><div class="kicker">Reserve unit</div><h2 class="section-title" style="margin-top:7px">Запасные игроки</h2></div><span class="tag">${bench.length}</span></div>${bench.length?`<div class="bench-grid">${bench.map(p=>benchCardHTML(p,team)).join('')}</div>`:`<div class="empty-state"><div>${icon('user',48)}<strong style="display:block;color:var(--text);margin-top:12px">Запасных игроков нет</strong><p>Подпишите игрока на трансферном рынке. Новый игрок попадёт в резерв, если основной состав уже заполнен.</p><button class="btn btn-primary" data-action="navigate" data-view="transfers">Перейти к трансферам</button></div></div>`}</section>`;
  }

  function staffQualityLabel(rating) {
    const value = Number(rating || 50);
    if (value >= 82) return 'Элитный';
    if (value >= 70) return 'Сильный';
    if (value >= 58) return 'Надёжный';
    return 'Развивающийся';
  }

  function analystRevealCount(rating) {
    const value = Number(rating || 50);
    if (value >= 82) return 4;
    if (value >= 70) return 3;
    if (value >= 58) return 2;
    return 1;
  }

  function academyDevelopmentHTML(player) {
    const last = player.lastDevelopment;
    if (!last || !Array.isArray(last.changes) || !last.changes.length) {
      return `<div class="academy-progress-note"><span>Развитие</span><strong>Ожидает недельной тренировки</strong></div>`;
    }
    const labels = Object.fromEntries(D.ATTRS);
    return `<div class="academy-progress-note"><span>Последняя неделя</span><strong>${last.changes.map((item)=>`${escapeHTML(labels[item.key] || item.key)} +${Number(item.value || 0).toFixed(2)}`).join(' · ')}</strong></div>`;
  }

  function academyPlayerCardHTML(player, team, graduate) {
    const progress = D.clamp(Number(player.academyOvrProgress || 0), 0, 99);
    const injured=Number(player.injuryMatches||0)>0;
    const status = injured ? `Травма · ${player.injuryMatches} мат.` : graduate ? 'Требуется решение' : player.listed ? 'На трансфере' : 'Академия';
    return `<article class="academy-card panel" data-action="open-player" data-player-id="${player.id}">
      <div class="academy-card-avatar" style="--academy-color:${team.primaryColor}">${playerAvatarSVG(player,team.primaryColor)}<span class="academy-rating">${player.overall}</span><span class="academy-potential">POT ${player.potential}</span></div>
      <div class="academy-card-body"><div class="row-between"><div><h3>${escapeHTML(player.nickname)}</h3><p>${escapeHTML(player.role)} · ${player.age} лет · ${escapeHTML(player.country)}</p></div><span class="tag ${injured||graduate||player.listed?'tag-danger':'tag-acid'}">${status}</span></div>
      ${graduate ? `<div class="warning-item" style="margin-top:12px">Игрок достиг предельного возраста академии. Выберите его дальнейшее будущее.</div>` : `${academyDevelopmentHTML(player)}<div class="row-between tiny upper muted" style="margin-top:12px"><span>Прогресс до следующего OVR</span><strong class="acid">${Math.round(progress)}%</strong></div><div class="progress" style="margin-top:7px"><span style="--value:${progress}%"></span></div>`}
      <div class="row wrap" style="margin-top:14px">${graduate
        ? `<button class="btn btn-primary btn-sm" data-action="promote-academy" data-player-id="${player.id}">В состав</button><button class="btn btn-sm" data-action="replace-reserve-for-graduate" data-player-id="${player.id}">Заменить запасного</button><button class="btn btn-sm ${player.listed?'btn-danger':''}" data-action="toggle-list" data-player-id="${player.id}">${player.listed?'Снять с трансфера':'Выставить на трансфер'}</button><button class="btn btn-danger btn-sm" data-action="release-academy-player" data-player-id="${player.id}">Расторгнуть</button>`
        : `<button class="btn btn-primary btn-sm" data-action="promote-academy" data-player-id="${player.id}">В состав</button><button class="btn btn-sm ${player.listed?'btn-danger':''}" data-action="toggle-list" data-player-id="${player.id}">${player.listed?'Снять с трансфера':'Выставить на трансфер'}</button>`}</div></div>
    </article>`;
  }

  function renderAcademy() {
    const team = getUserTeam();
    const academy = team.academy || [];
    const graduates = team.academyGraduates || [];
    const pending = gameState.ui && Array.isArray(gameState.ui.academyCandidates) ? gameState.ui.academyCandidates : [];
    const candidateAction = pending.length ? `<button class="btn btn-primary" data-action="open-academy-candidates">Выбрать игрока из 3 кандидатов ${icon('arrow')}</button>` : '';
    return `${pageHead('03','АКАДЕМИЯ','Развивайте молодых игроков, следите за потенциалом и переводите готовых воспитанников в основной состав.', candidateAction)}
      <div class="grid-4" style="margin-bottom:16px">
        ${metricCard('01','Игроки академии',`${academy.length}/${MAX_ACADEMY_PLAYERS}`,'Свободные места для развития')}
        ${metricCard('02','Средний OVR',academy.length?Math.round(academy.reduce((s,p)=>s+p.overall,0)/academy.length):'—','Текущий уровень воспитанников')}
        ${metricCard('03','Средний потенциал',academy.length?Math.round(academy.reduce((s,p)=>s+p.potential,0)/academy.length):'—','Потолок развития')}
        ${metricCard('04','Качество тренера',team.staff&&team.staff.coach?team.staff.coach.rating:'—',team.staff&&team.staff.coach?staffQualityLabel(team.staff.coach.rating):'Не назначен')}
      </div>
      ${graduates.length?`<section class="panel panel-pad" style="margin-bottom:16px"><div class="panel-head"><div><div class="kicker">AGE LIMIT // DECISION REQUIRED</div><h2 class="section-title" style="margin-top:7px">Игроки, покинувшие академию</h2></div><span class="tag tag-danger">${graduates.length}</span></div><div class="academy-grid">${graduates.map((player)=>academyPlayerCardHTML(player,team,true)).join('')}</div></section>`:''}
      <section class="panel panel-pad"><div class="panel-head"><div><div class="kicker">Youth development unit</div><h2 class="section-title" style="margin-top:7px">Состав академии</h2></div><span class="tag ${academy.length>=MAX_ACADEMY_PLAYERS?'tag-danger':'tag-acid'}">${academy.length}/${MAX_ACADEMY_PLAYERS}</span></div>
      ${academy.length?`<div class="academy-grid">${academy.map((player)=>academyPlayerCardHTML(player,team,false)).join('')}</div>`:`<div class="empty-state"><div>${icon('academy',50)}<strong style="display:block;color:var(--text);margin-top:12px">Академия пуста</strong><p>Новые кандидаты появляются в начале каждого сезона.</p></div></div>`}</section>`;
  }

  function staffEffectDescription(member) {
    if (!member) return 'Специалист не назначен.';
    if (member.type === 'coach') return 'Ускоряет развитие стрельбы, реакции и тактических навыков основной команды и академии.';
    if (member.type === 'psychologist') return 'Поддерживает мораль игроков и помогает команде быстрее наращивать химию.';
    if (member.type === 'physio') return 'Снижает накопленную усталость игроков после каждой игровой недели.';
    if (member.type === 'assistant') {
      const map = D.MAPS.find((item)=>item.id===member.mapId);
      return `Каждую неделю улучшает подготовку к карте ${map ? map.name : 'из своей специализации'}.`;
    }
    if (member.type === 'analyst') return `Перед матчем раскрывает ${analystRevealCount(member.rating)} параметра тактики соперника.`;
    return 'Помогает развитию организации.';
  }

  function renderStaff() {
    const team = getUserTeam();
    const staff = team.staff || {};
    const members = ['coach','psychologist','physio','assistant','analyst'].map((key)=>staff[key]).filter(Boolean);
    return `${pageHead('04','ПЕРСОНАЛ','Пять специалистов постоянно влияют на тренировки, состояние команды, подготовку карт и предматчевую информацию.')}
      <div class="staff-grid">${members.map((member,index)=>`<article class="staff-card panel"><div class="staff-index">0${index+1}</div><div class="staff-avatar">${icon(member.type==='coach'?'target':member.type==='psychologist'?'users':member.type==='physio'?'activity':member.type==='assistant'?'map':'eye',42)}</div><div class="kicker">${escapeHTML(member.type.toUpperCase())}</div><h2>${escapeHTML(member.title)}</h2><div class="staff-name">${escapeHTML(member.firstName)} ${escapeHTML(member.lastName)}</div><div class="staff-rating"><strong>${member.rating}</strong><span>${staffQualityLabel(member.rating)}</span></div><div class="progress"><span style="--value:${member.rating}%"></span></div><p>${escapeHTML(staffEffectDescription(member))}</p></article>`).join('')}</div>`;
  }

  function showAcademyCandidatesModal() {
    const team = getUserTeam();
    const candidates = gameState.ui && Array.isArray(gameState.ui.academyCandidates) ? gameState.ui.academyCandidates : [];
    if (!candidates.length) { toast('На этот сезон кандидаты уже выбраны.','warning'); return; }
    const full = (team.academy || []).length >= MAX_ACADEMY_PLAYERS;
    openModal('ВЫБОР ИГРОКА В АКАДЕМИЮ', `<div class="stack"><div class="row-between wrap"><div><div class="kicker">NEW SEASON // YOUTH INTAKE</div><h3 class="section-title" style="margin-top:7px">Выберите одного из трёх кандидатов</h3></div><span class="tag ${full?'tag-danger':'tag-acid'}">Академия ${(team.academy||[]).length}/${MAX_ACADEMY_PLAYERS}</span></div>${full?'<div class="warning-item">Академия заполнена. Продайте, переведите или отпустите одного игрока, затем вернитесь к выбору кандидата.</div>':''}<div class="academy-candidate-grid">${candidates.map((player)=>`<article class="academy-candidate panel"><div class="academy-candidate-avatar">${playerAvatarSVG(player,team.primaryColor)}<span>${player.overall} OVR</span></div><h2>${escapeHTML(player.nickname)}</h2><div class="row wrap"><span class="tag tag-acid">${escapeHTML(player.role)}</span><span class="tag">${player.age} лет</span><span class="tag">Потенциал ${player.potential}</span></div><div class="attr-grid" style="margin-top:12px">${D.ATTRS.map(([key,label])=>`<div class="attr-row"><div class="attr-row-head"><span>${label}</span><b>${player.attrs[key]}</b></div><div class="progress"><span style="--value:${player.attrs[key]}%"></span></div></div>`).join('')}</div><button class="btn btn-primary" data-action="choose-academy-candidate" data-player-id="${player.id}" ${full?'disabled':''}>Выбрать игрока</button></article>`).join('')}</div></div>`,true);
  }

  function playerCardHTML(player, team, index) {
    return `<article class="player-card" data-action="open-player" data-player-id="${player.id}">
      <div class="player-card-avatar"><span class="player-card-number">P-${String(index+1).padStart(2,'0')}</span><div class="player-rating">${player.overall}</div>${playerAvatarSVG(player,team.primaryColor)}</div>
      <div class="player-card-body"><div class="player-nick">${escapeHTML(player.nickname)}</div><div class="player-real">${escapeHTML(player.firstName)} ${escapeHTML(player.lastName)} · ${player.age} лет</div><div class="player-card-meta"><span class="tag tag-acid">${escapeHTML(player.role)}</span><span class="tag">${escapeHTML(player.countryCode)}</span><span class="tag">${D.money(player.salary)}/нед.</span>${Number(player.injuryMatches||0)>0?`<span class="tag tag-danger">Травма · ${player.injuryMatches} мат.</span>`:''}</div>
      <div class="player-bars">${miniBar('Мораль',player.morale)}${miniBar('Устал.',player.fatigue,true)}${miniBar('Форма',player.form)}</div></div>
    </article>`;
  }

  function benchCardHTML(player,team) {
    const injured=Number(player.injuryMatches||0)>0;
    return `<div class="bench-card" data-action="open-player" data-player-id="${player.id}">${playerAvatarSVG(player,team.primaryColor)}<div><strong>${escapeHTML(player.nickname)}</strong><div class="muted small" style="margin-top:4px">${escapeHTML(player.role)} · ${player.overall} OVR · контракт ${player.contractWeeks} нед.</div>${injured?`<span class="tag tag-danger" style="margin-top:7px">${escapeHTML(player.injuryName||'Травма')} · ${player.injuryMatches} мат.</span>`:''}</div><button class="btn btn-sm" data-action="set-starter" data-player-id="${player.id}" ${injured?'disabled':''}>В основу</button></div>`;
  }

  function miniBar(label,value,danger) {
    return `<div class="mini-bar-row"><span>${label}</span><div class="progress ${danger?'danger-bar':''}"><span style="--value:${D.clamp(value,0,100)}%"></span></div><b>${Math.round(value)}</b></div>`;
  }

  function playerProfileBody(player) {
    const team = D.findPlayerTeam(gameState,player.id);
    const isOwn = team && team.id === gameState.userTeamId;
    const isAcademy = Boolean(player.inAcademy);
    const isGraduate = Boolean(player.pendingGraduation);
    const teamColor = team ? team.primaryColor : '#C6FF00';
    const attrs = D.ATTRS.map(([key,label])=>`<div class="attr-row"><div class="attr-row-head"><span>${label}</span><b>${player.attrs[key]}</b></div><div class="progress"><span style="--value:${player.attrs[key]}%"></span></div></div>`).join('');
    let actions = '';
    if (isOwn) {
      if (isAcademy) {
        actions = `<button class="btn btn-primary" data-action="promote-academy" data-player-id="${player.id}">Перевести в состав</button><button class="btn ${player.listed?'btn-danger':''}" data-action="toggle-list" data-player-id="${player.id}">${player.listed?'Снять с трансфера':'Выставить на трансфер'}</button>`;
      } else if (isGraduate) {
        actions = `<button class="btn btn-primary" data-action="promote-academy" data-player-id="${player.id}">Перевести в состав</button><button class="btn" data-action="replace-reserve-for-graduate" data-player-id="${player.id}">Заменить запасного</button><button class="btn ${player.listed?'btn-danger':''}" data-action="toggle-list" data-player-id="${player.id}">${player.listed?'Снять с трансфера':'Выставить на трансфер'}</button><button class="btn btn-danger" data-action="release-academy-player" data-player-id="${player.id}">Расторгнуть контракт</button>`;
      } else {
        actions = `${player.isStarter?`<button class="btn btn-warning" data-action="set-reserve" data-player-id="${player.id}">Перевести в запас</button>`:`<button class="btn btn-primary" data-action="set-starter" data-player-id="${player.id}">Поставить в основу</button>`}${player.age<=18?`<button class="btn" data-action="move-to-academy" data-player-id="${player.id}">Перевести в академию</button>`:''}<button class="btn" data-action="contract-modal" data-player-id="${player.id}">Новый контракт</button><button class="btn" data-action="toggle-compare" data-player-id="${player.id}">Сравнить</button><button class="btn ${player.listed?'btn-danger':''}" data-action="toggle-list" data-player-id="${player.id}">${player.listed?'Снять с трансфера':'Выставить на трансфер'}</button>`;
      }
    } else {
      actions = `<button class="btn btn-primary" data-action="offer-player" data-player-id="${player.id}">${team?'Сделать предложение':'Подписать игрока'}</button><button class="btn" data-action="toggle-compare" data-player-id="${player.id}">Сравнить</button>`;
    }
    const contractValue = isAcademy ? '—' : `${player.contractWeeks} нед.`;
    const contractSub = isAcademy ? 'Развитие в системе клуба' : player.contractWeeks<=6?'Скоро истекает':'Действующий';
    return `<div class="player-profile">
      <div class="profile-hero"><div class="profile-rating">${player.overall}</div>${playerAvatarSVG(player,teamColor)}<div class="profile-name"><strong>${escapeHTML(player.nickname)}</strong><small>${escapeHTML(player.firstName)} ${escapeHTML(player.lastName)} · ${player.age} лет · ${escapeHTML(player.country)}</small></div></div>
      <div><div class="row wrap"><span class="tag tag-acid">${escapeHTML(player.role)}</span><span class="tag">Вторая роль: ${escapeHTML(player.secondaryRole)}</span><span class="tag">Потенциал ${player.potential}</span><span class="tag ${isGraduate?'tag-danger':''}">${escapeHTML(player.status)}</span>${Number(player.injuryMatches||0)>0?`<span class="tag tag-danger">${escapeHTML(player.injuryName||'Травма')} · пропустит ${player.injuryMatches} мат.</span>`:''}</div>
      <div class="grid-3" style="margin:15px 0">${metricCard('A','Стоимость',D.money(player.value),'Рыночная оценка')}${metricCard('B','Зарплата',player.salary?D.money(player.salary):'—',isAcademy?'Академический контракт':'За игровую неделю')}${metricCard('C','Контракт',contractValue,contractSub)}</div>
      <h3 class="section-title" style="margin:4px 0 12px">Характеристики</h3><div class="attr-grid">${attrs}</div>
      <div class="grid-3" style="margin-top:15px">${metricCard('D','Мораль',Math.round(player.morale),'Текущее состояние',player.morale)}${metricCard('E','Усталость',Math.round(player.fatigue),'Высокая снижает эффективность',player.fatigue,true)}${metricCard('F','Форма',Math.round(player.form),'Текущая игровая форма',player.form)}</div>
      ${isAcademy?`<div class="divider"></div><h3 class="section-title">Развитие в академии</h3><div style="margin-top:12px">${academyDevelopmentHTML(player)}<div class="row-between tiny upper muted" style="margin-top:12px"><span>Прогресс до следующего OVR</span><strong class="acid">${Math.round(Number(player.academyOvrProgress||0))}%</strong></div><div class="progress" style="margin-top:7px"><span style="--value:${D.clamp(Number(player.academyOvrProgress||0),0,99)}%"></span></div></div>`:`<div class="divider"></div><h3 class="section-title">Статистика сезона</h3><div class="table-wrap" style="margin-top:10px"><table><thead><tr><th>Матчи</th><th>K</th><th>D</th><th>A</th><th>ADR</th><th>Первые</th><th>Клатчи</th><th>Рейтинг</th></tr></thead><tbody><tr><td>${player.stats.matches}</td><td>${player.stats.kills}</td><td>${player.stats.deaths}</td><td>${player.stats.assists}</td><td>${player.stats.adr}</td><td>${player.stats.firstKills}</td><td>${player.stats.clutches}</td><td class="acid"><strong>${player.stats.rating || '—'}</strong></td></tr></tbody></table></div>`}
      <div class="profile-actions">${actions}</div></div>
    </div>`;
  }

  function renderTransfers() {
    const tab = gameState.ui.transferTab || 'free';
    const filters = gameState.ui.filters || {};
    const players = transferPlayersForTab(tab).filter(player=>filterPlayer(player,filters));
    return `${pageHead('05','ТРАНСФЕРЫ','Свободные агенты, игроки других команд, трансферный список и предложения по вашим игрокам.', `<button class="btn" data-action="clear-filters">Сбросить фильтры</button>`)}
      <section class="panel">
        <div class="tabs">${[['free','Свободные агенты'],['all','Все игроки'],['listed','Выставлены на трансфер'],['offers','Мои предложения']].map(([id,label])=>`<button class="tab-btn ${tab===id?'active':''}" data-action="transfer-tab" data-tab="${id}">${label}</button>`).join('')}</div>
        ${tab==='offers' ? renderTransferOffers() : `<div class="filters">${transferFiltersHTML(filters)}</div><div class="panel-pad"><div class="row-between" style="margin-bottom:12px"><span class="muted small">Найдено игроков: <strong class="acid">${players.length}</strong></span><span class="tag">Состав до 7 игроков · академия до 10</span></div><div class="transfer-list">${players.length?players.map(transferCardHTML).join(''):`<div class="empty-state"><div>${icon('search',50)}<strong style="display:block;color:var(--text);margin-top:12px">Игроки не найдены</strong><p>Измените фильтры или откройте другую вкладку.</p></div></div>`}</div></div>`}
      </section>`;
  }

  function transferPlayersForTab(tab) {
    if (tab === 'free') return gameState.freeAgents;
    if (tab === 'listed') return gameState.teams.filter(t=>!t.isUser).flatMap(t=>[...(t.players||[]),...(t.academy||[]),...(t.academyGraduates||[])].filter(p=>p.listed));
    if (tab === 'all') return gameState.teams.filter(t=>!t.isUser).flatMap(t=>[...(t.players||[]),...(t.academy||[])]);
    return [];
  }

  function filterPlayer(player,filters) {
    if (filters.role && player.role !== filters.role) return false;
    if (filters.region && player.region !== filters.region) return false;
    if (filters.country && !player.country.toLowerCase().includes(filters.country.toLowerCase())) return false;
    if (filters.minRating && player.overall < Number(filters.minRating)) return false;
    if (filters.maxAge && player.age > Number(filters.maxAge)) return false;
    if (filters.maxValue && player.value > Number(filters.maxValue)) return false;
    return true;
  }

  function transferFiltersHTML(filters) {
    return `<label class="label">Роль<select class="select" data-filter="role"><option value="">Все роли</option>${D.ROLES.map(r=>`<option ${filters.role===r?'selected':''}>${r}</option>`).join('')}</select></label>
      <label class="label">Рейтинг от<input class="input" type="number" min="1" max="99" value="${filters.minRating||''}" data-filter="minRating" placeholder="60"></label>
      <label class="label">Возраст до<input class="input" type="number" min="14" max="45" value="${filters.maxAge||''}" data-filter="maxAge" placeholder="28"></label>
      <label class="label">Стоимость до<input class="input" type="number" min="0" step="50000" value="${filters.maxValue||''}" data-filter="maxValue" placeholder="500000"></label>
      <label class="label">Регион<select class="select" data-filter="region"><option value="">Все регионы</option>${D.REGIONS.map(r=>`<option ${filters.region===r?'selected':''}>${r}</option>`).join('')}</select></label>
      <label class="label">Страна<input class="input" value="${escapeHTML(filters.country||'')}" data-filter="country" placeholder="Польша"></label>
      <button class="btn" data-action="apply-filters">Применить</button>`;
  }

  function transferCardHTML(player) {
    const team = D.findPlayerTeam(gameState,player.id);
    const color = team ? team.primaryColor : '#C6FF00';
    const keyAttrs = Object.entries(player.attrs).sort((a,b)=>b[1]-a[1]).slice(0,3);
    return `<article class="transfer-card"><div class="transfer-avatar">${playerAvatarSVG(player,color)}</div><div class="transfer-name"><strong>${escapeHTML(player.nickname)}</strong><small>${escapeHTML(player.role)} · ${player.age} лет · ${escapeHTML(player.country)}${team?` · ${escapeHTML(team.tag)}`:' · свободный агент'}</small><div class="row wrap" style="margin-top:7px"><span class="tag tag-acid">${player.overall} OVR</span>${player.inAcademy?'<span class="tag">Академия</span>':''}${player.listed?'<span class="tag tag-danger">На трансфере</span>':''}</div></div><div class="transfer-stats"><div class="transfer-stat"><strong>${D.money(player.value)}</strong><small>Стоимость</small></div><div class="transfer-stat"><strong>${player.salary?D.money(player.salary):'—'}</strong><small>Зарплата</small></div><div class="transfer-stat"><strong>${player.contractWeeks||'—'}</strong><small>Нед. контракта</small></div></div><div class="attr-chips">${keyAttrs.map(([key,value])=>`<span class="attr-chip">${D.ATTRS.find(a=>a[0]===key)[1]} ${value}</span>`).join('')}</div><button class="btn btn-primary btn-sm" data-action="offer-player" data-player-id="${player.id}">${team?'Предложение':'Подписать'}</button></article>`;
  }

  function renderTransferOffers() {
    const incoming = gameState.transfers.incomingOffers;
    const outgoing = gameState.transfers.outgoingOffers;
    const history = gameState.transfers.history.slice(0,10);
    return `<div class="panel-pad stack"><section><div class="panel-head"><h2 class="section-title">Входящие предложения</h2><span class="tag">${incoming.length}</span></div>${incoming.length?`<div class="transfer-list">${incoming.map(offer=>incomingOfferHTML(offer)).join('')}</div>`:'<div class="empty-state" style="min-height:150px"><div>Пока нет предложений по вашим игрокам.</div></div>'}</section>
      <section><div class="panel-head"><h2 class="section-title">Исходящие предложения</h2><span class="tag">${outgoing.length}</span></div>${outgoing.length?`<div class="table-wrap"><table><thead><tr><th>Игрок</th><th>Клуб</th><th>Сумма</th><th>Зарплата</th><th>Статус</th></tr></thead><tbody>${outgoing.map(o=>`<tr><td><strong>${escapeHTML(o.playerName)}</strong></td><td>${escapeHTML(o.teamName||'Свободный агент')}</td><td>${D.money(o.fee||0)}</td><td>${D.money(o.salary)}</td><td><span class="tag ${o.status==='Принято'?'tag-acid':o.status==='Отклонено'?'tag-danger':''}">${o.status}</span></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-state" style="min-height:120px"><div>Вы ещё не делали предложений.</div></div>'}</section>
      <section><div class="panel-head"><h2 class="section-title">История трансферов</h2><span class="tag">${history.length}</span></div>${history.length?`<div class="table-wrap"><table><thead><tr><th>Неделя</th><th>Событие</th><th>Игрок</th><th>Сумма</th></tr></thead><tbody>${history.map(h=>`<tr><td>W${h.week}</td><td>${escapeHTML(h.type)}</td><td>${escapeHTML(h.playerName)}</td><td>${D.money(h.amount||0)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="muted small">История пока пуста.</div>'}</section></div>`;
  }

  function incomingOfferHTML(offer) {
    const player = D.findPlayer(gameState,offer.playerId);
    const buyer = D.findTeam(gameState,offer.teamId);
    if (!player || !buyer) return '';
    return `<div class="transfer-card"><div class="rank-logo" style="color:${buyer.primaryColor}">${logoSVG(buyer.logoType,buyer.primaryColor,buyer.secondaryColor)}</div><div class="transfer-name"><strong>${escapeHTML(buyer.name)}</strong><small>Предложение за ${escapeHTML(player.nickname)} · рыночная стоимость ${D.money(player.value)}</small></div><div class="transfer-stats"><div class="transfer-stat"><strong class="acid">${D.money(offer.amount)}</strong><small>Предложение</small></div><div class="transfer-stat"><strong>${Math.round(offer.amount/player.value*100)}%</strong><small>От стоимости</small></div></div><div></div><div class="row"><button class="btn btn-primary btn-sm" data-action="accept-sale" data-offer-id="${offer.id}">Принять</button><button class="btn btn-danger btn-sm" data-action="reject-sale" data-offer-id="${offer.id}">Отклонить</button></div></div>`;
  }

  function renderTraining() {
    const allocations = gameState.training.allocations;
    const total = Object.values(allocations).reduce((sum,v)=>sum+Number(v),0);
    const effects = calculateTrainingEffects(allocations);
    const labels = [
      ['aim','Стрельба','Развитие стрельбы и реакции'],
      ['tactics','Тактика','Тактическое мышление и дисциплина'],
      ['teamwork','Командная игра','Химия и коммуникация'],
      ...D.MAPS.map((map)=>[map.id,`Подготовка ${map.name}`,'Уровень команды на карте']),
      ['fitness','Физическая форма','Снижение усталости и поддержка формы'],
      ['rest','Отдых','Восстановление усталости и морали']
    ];
    return `${pageHead('06','ТРЕНИРОВКИ','Распределите ровно 100% недельного времени. Эффект зависит от возраста, потенциала и текущего уровня игроков.', `<button class="btn btn-primary" data-action="confirm-training">Подтвердить план ${icon('check')}</button>`)}
      <div class="training-layout"><section class="panel panel-pad"><div class="panel-head"><div><div class="kicker">Weekly allocation</div><h2 class="section-title" style="margin-top:7px">Распределение времени</h2></div><span class="tag ${total===100?'tag-acid':'tag-danger'}">${total}% / 100%</span></div>${labels.map(([key,label,desc])=>`<div class="training-row"><div><strong class="small upper">${label}</strong><div class="muted tiny" style="margin-top:4px">${desc}</div></div><input class="range" type="range" min="0" max="60" step="5" value="${allocations[key]}" data-training="${key}"><div class="range-value" id="training-value-${key}">${allocations[key]}%</div></div>`).join('')}</section>
      <aside class="panel panel-pad"><div class="kicker">Projected impact</div><div class="allocation-total ${total===100?'acid':'danger'}" id="training-total">${total}%</div><div class="muted small">Сумма должна быть равна 100%.</div><div class="effect-list" id="training-effects">${trainingEffectsHTML(effects)}</div><div class="divider"></div><div class="small muted" style="line-height:1.55">Прогресс характеристик накапливается постепенно. Молодые игроки с высоким потенциалом развиваются быстрее, а игроки высокого рейтинга получают меньший прирост.</div><div class="tag ${gameState.training.confirmedWeek===gameState.season.week?'tag-acid':''}" style="margin-top:14px">${gameState.training.confirmedWeek===gameState.season.week?'План подтверждён':'План не подтверждён'}</div></aside></div>`;
  }

  function calculateTrainingEffects(a) {
    const mapLoad = D.MAPS.reduce((sum,map)=>sum+Number(a[map.id]||0),0);
    const effects = {
      aim: Number(a.aim||0) * 0.018,
      tactics: Number(a.tactics||0) * 0.016,
      chemistry: Number(a.teamwork||0) * 0.055,
      fatigue: Math.max(-16, (Number(a.aim||0)+Number(a.tactics||0)+Number(a.teamwork||0)+mapLoad)*0.055 - Number(a.fitness||0)*0.12 - Number(a.rest||0)*0.28),
      morale: Number(a.rest||0)*0.06 + Number(a.teamwork||0)*0.015 - Math.max(0,Number(a.aim||0)+Number(a.tactics||0)-50)*0.012
    };
    const priority = preferredMapId();
    D.MAPS.forEach((map)=>{
      const multiplier = map.id === priority ? 1.35 : 1;
      effects[map.id] = Number(a[map.id]||0) * 0.035 * multiplier;
    });
    return effects;
  }

  function trainingEffectsHTML(e) {
    const items = [
      ['Стрельба / реакция',`+${e.aim.toFixed(2)} прогресса`],
      ['Тактические навыки',`+${e.tactics.toFixed(2)} прогресса`],
      ['Командная химия',`${e.chemistry>=0?'+':''}${e.chemistry.toFixed(1)}`],
      ...D.MAPS.map((map)=>[map.name,`+${e[map.id].toFixed(1)}`]),
      ['Усталость',`${e.fatigue>=0?'+':''}${e.fatigue.toFixed(1)}`],
      ['Мораль',`${e.morale>=0?'+':''}${e.morale.toFixed(1)}`]
    ];
    return items.map(([label,value])=>`<div class="effect-row"><span>${label}</span><strong class="${value.startsWith('-')?'danger':'acid'}">${value}</strong></div>`).join('');
  }

  function tacticTooltip(key, value) {
    const tips = {
      tempo: {
        'Медленный': 'Помогает против сбалансированного темпа, но уязвим к быстрому. Высокая командная дисциплина делает этот стиль надёжнее.',
        'Сбалансированный': 'Помогает против быстрого темпа, но уступает медленному. Хорошее использование гранат усиливает контроль раунда.',
        'Быстрый': 'Помогает против медленного темпа, но уязвим к сбалансированному. Высокая агрессия усиливает давление на соперника.'
      },
      aggression: {
        'Низкая': 'Снижает риск ранних потерь, помогает сохранять структуру раунда и аккуратнее разыгрывать преимущество.',
        'Средняя': 'Даёт гибкий баланс между давлением и надёжностью. Команда легче адаптируется к развитию раунда.',
        'Высокая': 'Создаёт постоянное давление и хорошо сочетается с быстрым темпом, но чаще приводит к рискованным стартовым дуэлям.'
      },
      risk: {
        'Осторожный': 'Лучше раскрывается на защите: команда бережёт игроков и удерживает позиции. На атаке действует менее решительно.',
        'Стандартный': 'Стабильный вариант без сильного перекоса. Даёт небольшой универсальный эффект на обеих сторонах.',
        'Рискованный': 'Лучше раскрывается на атаке: команда смелее идёт на размены и быстрые решения. На защите становится уязвимее.'
      },
      attack: {
        'Быстрый выход A': 'Хорошо работает, когда соперник усиливает точку B. Теряет эффективность против усиленной защиты точки A.',
        'Быстрый выход B': 'Хорошо работает, когда соперник усиливает точку A. Теряет эффективность против усиленной защиты точки B.',
        'Игра через центр': 'Хорошо наказывает агрессивную защиту, но хуже работает против пассивной расстановки.',
        'Медленная атака': 'Хорошо вскрывает пассивную защиту, но уязвима к активному давлению защитников.',
        'Контроль карты': 'Хорошо работает против раннего сбора информации, но может застрять против стандартной защиты.',
        'Ложный выход': 'Хорошо запутывает стандартную защиту, но хуже работает против раннего сбора информации.'
      },
      defense: {
        'Стандартная защита': 'Надёжно сдерживает контроль карты, но может ошибиться против ложного выхода.',
        'Агрессивная защита': 'Мешает медленной атаке занять пространство, но уязвима к игре через центр.',
        'Усилить A': 'Хорошо встречает быстрый выход на A, но оставляет больше пространства на точке B.',
        'Усилить B': 'Хорошо встречает быстрый выход на B, но оставляет больше пространства на точке A.',
        'Пассивная защита': 'Сдерживает игру через центр, но позволяет медленной атаке постепенно занять пространство.',
        'Ранний сбор информации': 'Помогает распознать ложный выход, но может открыть зоны для контроля карты.'
      }
    };
    return tips[key] && tips[key][value] ? tips[key][value] : '';
  }

  function tacticOptionButton(key, value, current) {
    return `<button class="option-btn ${current===value?'active':''}" data-action="set-tactic" data-key="${key}" data-value="${value}" data-tooltip="${escapeHTML(tacticTooltip(key,value))}">${value}</button>`;
  }

  function renderTactics() {
    const t = gameState.tactics;
    const utilityTooltip = 'При значении 70 и выше сбалансированный темп лучше контролирует раунд. После 80 лучший саппорт получает постепенно растущий временный бонус, а дополнительный расход на гранаты увеличивается вплоть до $250 за раунд.';
    const disciplineTooltip = 'При значении 70 и выше медленный темп становится надёжнее, а лучший капитан эффективнее руководит командой. Ниже 70 больше свободы получает лучший рифлер или энтри, а при их отсутствии — снайпер.';
    return `${pageHead('07','ТАКТИКА','Настройте общий стиль, атакующие и защитные схемы. Наведите курсор на любой вариант, чтобы увидеть его сильные и слабые стороны.', `<button class="btn btn-primary" data-action="confirm-tactics">Подтвердить тактику ${icon('check')}</button>`)}
      <div class="grid-2"><section class="panel tactic-card"><div class="kicker">Global parameters</div><h2 class="section-title" style="margin:7px 0 18px">Общие параметры</h2>
        ${tacticOptions('tempo','Темп',['Медленный','Сбалансированный','Быстрый'],t.tempo)}
        ${tacticOptions('aggression','Агрессия',['Низкая','Средняя','Высокая'],t.aggression)}
        ${tacticOptions('risk','Риск',['Осторожный','Стандартный','Рискованный'],t.risk)}
        <div class="divider"></div><div class="training-row tactic-range-row" data-tooltip="${escapeHTML(utilityTooltip)}"><div><strong class="small upper">Использование гранат</strong></div><input class="range" type="range" min="0" max="100" step="5" value="${t.utility}" data-tactic-range="utility"><div class="range-value" id="tactic-value-utility">${t.utility}</div></div>
        <div class="training-row tactic-range-row" data-tooltip="${escapeHTML(disciplineTooltip)}"><div><strong class="small upper">Командная дисциплина</strong></div><input class="range" type="range" min="0" max="100" step="5" value="${t.discipline}" data-tactic-range="discipline"><div class="range-value" id="tactic-value-discipline">${t.discipline}</div></div>
      </section>
      <div class="stack"><section class="panel tactic-card"><div class="kicker">Attack protocol</div><h2 class="section-title" style="margin:7px 0 14px">Тактика атаки</h2><div class="option-grid">${['Контроль карты','Быстрый выход A','Быстрый выход B','Игра через центр','Медленная атака','Ложный выход'].map(v=>tacticOptionButton('attack',v,t.attack)).join('')}</div></section>
      <section class="panel tactic-card"><div class="kicker">Defense protocol</div><h2 class="section-title" style="margin:7px 0 14px">Тактика защиты</h2><div class="option-grid">${['Стандартная защита','Агрессивная защита','Усилить A','Усилить B','Пассивная защита','Ранний сбор информации'].map(v=>tacticOptionButton('defense',v,t.defense)).join('')}</div></section><span class="tag ${t.confirmedWeek===gameState.season.week?'tag-acid':''}">${t.confirmedWeek===gameState.season.week?'Тактика подтверждена на неделю':'Подтвердите настройки перед матчем'}</span></div></div>`;
  }

  function tacticOptions(key,label,values,current) {
    return `<div style="margin-bottom:18px"><div class="row-between" style="margin-bottom:9px"><strong class="small upper">${label}</strong><span class="muted tiny">${current}</span></div><div class="option-grid">${values.map(v=>tacticOptionButton(key,v,current)).join('')}</div></div>`;
  }

  function renderMaps() {
    const team = getUserTeam();
    const preferred = gameState.preferredMap || bestMapForTeam(team);
    return `${pageHead('08','КАРТЫ','Приоритетная карта развивается быстрее на тренировках, немного усиливает команду в матче и используется для стабильного предматчевого прогноза. Соперник также учитывает этот приоритет при вето.', `<button class="btn" data-action="navigate" data-view="training">Настроить тренировки</button>`)}
      <div class="map-grid">${D.MAPS.map((map,index)=>`<article class="panel map-card"><div class="row-between"><div><div class="kicker">Map 0${index+1}</div><h2 class="section-title" style="margin-top:7px">${map.name}</h2></div><span class="tag ${preferred===map.id?'tag-acid':''}">${preferred===map.id?'Приоритет':'Доступна'}</span></div><div class="map-plan">${mapSVG(map.id,team.primaryColor)}</div><div class="row-between"><div><div class="muted tiny upper">Подготовка команды</div><div class="map-skill">${Math.round(team.mapSkill[map.id])}</div></div><div style="text-align:right"><div class="muted tiny upper">Последние матчи</div>${formHTML(team.history,5)}</div></div><div class="progress" style="margin:12px 0 14px"><span style="--value:${team.mapSkill[map.id]}%"></span></div><p class="muted small" style="line-height:1.5">${escapeHTML(map.description || map.label)}</p><button class="btn ${preferred===map.id?'btn-primary':''}" data-action="prefer-map" data-map-id="${map.id}" style="width:100%">${preferred===map.id?'Приоритетная карта':'Сделать приоритетом'}</button></article>`).join('')}</div>`;
  }

  function renderCalendar() {
    return `${pageHead('09','КАЛЕНДАРЬ','Полный сезон из 24 недель. Каждая неделя включает тренировки, зарплаты, доходы, матчи и турнирные события.', `<button class="btn btn-primary" data-action="end-week">Завершить текущую неделю ${icon('arrow')}</button>`)}
      <div class="calendar-grid">${gameState.season.calendar.map(entry=>weekCardHTML(entry)).join('')}</div>`;
  }

  function weekCardHTML(entry) {
    const current = entry.week===gameState.season.week;
    const match = entry.match;
    const opponent = match?D.findTeam(gameState,match.opponentId):null;
    return `<article class="week-card ${current?'current':''} ${entry.completed?'completed':''}"><span class="week-status">${entry.completed?'Завершено':current?'Текущая':'Запланировано'}</span><div class="week-number">W${String(entry.week).padStart(2,'0')}</div><div class="muted tiny upper" style="margin-top:4px">${D.dateForWeek(entry.week, gameState.season.number)}</div><div class="week-events"><div class="week-event">Недельные тренировки</div><div class="week-event">Зарплаты и доход организации</div>${entry.tournamentId?`<div class="week-event">${escapeHTML(D.getTournamentName(gameState,entry.tournamentId))}</div>`:''}${match?`<div class="week-event match"><strong>${match.status==='completed'?(match.result.winnerId===gameState.userTeamId?'ПОБЕДА':'ПОРАЖЕНИЕ'):`${match.format} · VS ${escapeHTML(opponent.tag)}`}</strong><br>${escapeHTML(match.tournamentName)}</div>`:'<div class="week-event">Матчей нет</div>'}</div>${current&&match&&match.status==='pending'?'<button class="btn btn-primary btn-sm" data-action="prepare-match" style="width:100%;margin-top:12px">Подготовиться</button>':''}</article>`;
  }

  function rankCategoryForPosition(rank) {
    const position = Number(rank || 24);
    if (position <= 4) return 'ТОП-КОМАНДА';
    if (position <= 12) return 'ТИР 2';
    if (position <= 20) return 'ТИР-3';
    return 'ТИР-4';
  }

  function applySeasonRankCategories(state) {
    if (!state || !Array.isArray(state.teams)) return;
    const seasonNumber=Number(state.season&&state.season.number||1);
    state.teams.forEach((team) => { team.tier = rankCategoryForPosition(team.rank); team.tierSeason=seasonNumber; });
  }

  function tournamentPayouts(t) {
    const winner = Math.round(Number(t.prize || 0));
    return { winner, runnerUp: Math.round(winner * .50), semifinal: Math.round(winner * .25) };
  }

  function tournamentPrizeLineHTML(t) {
    const payout = tournamentPayouts(t);
    return `<div class="tournament-payouts"><span>1 место <strong>${D.money(payout.winner)}</strong></span><span>2 место <strong>${D.money(payout.runnerUp)}</strong></span><span>3–4 место <strong>${D.money(payout.semifinal)}</strong></span></div>`;
  }

  function tournamentTitleBadgeHTML(tournamentId) {
    const wins = gameState && gameState.career && Array.isArray(gameState.career.tournamentWins)
      ? gameState.career.tournamentWins.filter((item)=>item.tournamentId===tournamentId).sort((a,b)=>a.season-b.season)
      : [];
    if (!wins.length) return '';
    const seasons = wins.map((item)=>`S${item.season}`).join(' · ');
    return `<span class="tournament-title-badge" data-tooltip="${escapeHTML(seasons)}" aria-label="Победы: ${escapeHTML(seasons)}">${icon('trophy',18)}</span>`;
  }

  function renderTournaments() {
    updateTournamentStates(false);
    return `${pageHead('10','ТУРНИРЫ','Четыре этапа сезона с растущими призовыми фондами. Стадии и таблицы обновляются по мере продвижения календаря.', '')}
      <div class="tournament-grid">${gameState.tournaments.map(t=>tournamentCardHTML(t)).join('')}</div>`;
  }

  function tournamentCardHTML(t) {
    const config = getTournamentConfig(t);
    const currentStage = tournamentStageForWeek(t, gameState.season.week);
    const activeIndex = t.winnerId ? config.cardStages.length - 1 : config.cardStages.findIndex((stage) => stage.key === currentStage.key);
    return `<article class="panel tournament-card"><div class="row-between"><div><div class="kicker">W${t.weeks[0]}–W${t.weeks[1]} // ${t.participants} teams</div><h2 class="section-title" style="margin-top:8px">${escapeHTML(t.name)}</h2></div><div class="row">${tournamentTitleBadgeHTML(t.id)}<span class="tag ${t.stage!=='Ожидание'?'tag-acid':''}">${escapeHTML(t.stage)}</span></div></div><div class="tournament-prize">${D.money(t.prize)}</div><div class="muted small">Приз за первое место · ${escapeHTML(t.format)}</div>${tournamentPrizeLineHTML(t)}<div class="stage-line">${config.cardStages.map((stage,i)=>`<div class="stage ${i===activeIndex?'active':''}">${escapeHTML(stage.label)}</div>`).join('')}</div><div class="row-between" style="margin-top:24px"><div class="small muted">Победитель: <strong class="${t.winnerId?'acid':''}">${t.winnerId?escapeHTML(D.findTeam(gameState,t.winnerId).name):'не определён'}</strong></div><button class="btn btn-sm" data-action="tournament-details" data-tournament-id="${t.id}">Таблица и сетка</button></div></article>`;
  }

  function renderRanking() {
    const teams = [...gameState.teams].sort((a,b)=>a.rank-b.rank);
    return `${pageHead('11','МИРОВОЙ РЕЙТИНГ','Победа над сильной командой приносит больше очков. Неожиданное поражение от слабого соперника отнимает больше.', '')}
      <div class="table-wrap"><table class="table-clickable"><thead><tr><th>#</th><th>Изм.</th><th>Команда</th><th>Регион</th><th>Категория</th><th>Очки</th><th>Последние 5</th><th>Химия</th></tr></thead><tbody>${teams.map(team=>rankingRowHTML(team)).join('')}</tbody></table></div>`;
  }

  function rankingRowHTML(team) {
    const change=team.previousRank-team.rank;
    return `<tr data-action="open-team" data-team-id="${team.id}" ${team.isUser?'style="background:rgba(198,255,0,.055)"':''}><td><span class="rank-number ${team.isUser?'acid':''}">${String(team.rank).padStart(2,'0')}</span></td><td><span class="rank-change ${change>0?'up':change<0?'down':''}">${change>0?'▲ '+change:change<0?'▼ '+Math.abs(change):'—'}</span></td><td><div class="rank-team"><div class="rank-logo" style="color:${team.primaryColor}">${logoSVG(team.logoType,team.primaryColor,team.secondaryColor)}</div><div><strong>${escapeHTML(team.name)}</strong><div class="muted tiny" style="margin-top:3px">${escapeHTML(team.tag)}${team.isUser?' · ВАШ КЛУБ':''}</div></div></div></td><td>${escapeHTML(team.region)}</td><td><span class="tag">${escapeHTML(team.tier)}</span></td><td><strong>${Math.round(team.ratingPoints)}</strong></td><td>${formHTML(team.history,5)}</td><td>${Math.round(team.chemistry)}</td></tr>`;
  }

  function renderFinances() {
    const team=getUserTeam();
    const salaries=weeklySalary(team);
    const net=gameState.finances.weeklyIncome-salaries;
    return `${pageHead('12','ФИНАНСЫ','Бюджет организации, еженедельные доходы, зарплатная ведомость и история всех операций.', '')}
      <div class="finance-summary">${metricCard('01','Текущий бюджет',D.money(team.budget),'Доступно для трансферов')}${metricCard('02','Доход в неделю',D.money(gameState.finances.weeklyIncome),'Медиа, партнёры и лига')}${metricCard('03','Зарплаты в неделю',D.money(salaries),`${team.players.length} игроков`)}${metricCard('04','Чистый поток',`${net>=0?'+':''}${D.money(net)}`,net>=0?'Положительный баланс':'Расходы выше доходов')}</div>
      <div class="grid-2" style="margin-top:16px"><section class="panel panel-pad"><div class="panel-head"><h2 class="section-title">Зарплатная ведомость</h2><span class="tag">${D.money(salaries)}/нед.</span></div><div class="table-wrap"><table><thead><tr><th>Игрок</th><th>Роль</th><th>Статус</th><th>Контракт</th><th>Зарплата</th></tr></thead><tbody>${team.players.slice().sort((a,b)=>b.salary-a.salary).map(p=>`<tr data-action="open-player" data-player-id="${p.id}" style="cursor:pointer"><td><strong>${escapeHTML(p.nickname)}</strong></td><td>${escapeHTML(p.role)}</td><td>${p.isStarter?'Основа':'Запас'}</td><td>${p.contractWeeks} нед.</td><td>${D.money(p.salary)}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="panel panel-pad"><div class="panel-head"><h2 class="section-title">История операций</h2><span class="tag">${gameState.finances.transactions.length}</span></div>${gameState.finances.transactions.slice(0,20).map(tx=>`<div class="transaction"><span class="tag">W${tx.week}</span><span>${escapeHTML(tx.label)}</span><strong class="amount ${tx.type}">${tx.type==='income'?'+':'−'}${D.money(Math.abs(tx.amount))}</strong></div>`).join('')}</section></div>`;
  }

  function renderSettings() {
    const s=gameState.settings;
    return `${pageHead('13','НАСТРОЙКИ','Параметры сохранения, скорости симуляции, музыки и отображения. Все настройки хранятся вместе с карьерой.', '')}
      <div class="settings-list"><div class="setting-row"><div><strong>Автоматическое сохранение</strong><p>Сохранять карьеру после матча, трансфера и завершения недели.</p></div><label class="checkbox-row"><input type="checkbox" data-setting="autosave" ${s.autosave?'checked':''}><span>${s.autosave?'Включено':'Выключено'}</span></label></div>
      <div class="setting-row"><div><strong>Громкость музыки</strong><p>Фоновая музыка играет постоянно, включая экран живой симуляции матча.</p></div><div class="music-setting"><input class="music-slider" type="range" min="0" max="100" step="1" value="${s.musicVolume ?? 60}" data-setting="musicVolume"><strong id="music-volume-value">${s.musicVolume ?? 60}%</strong></div></div>
      <div class="setting-row"><div><strong>Скорость матча по умолчанию</strong><p>Начальная скорость появления событий текстовой трансляции.</p></div><select class="select" style="width:130px" data-setting="defaultSpeed"><option value="1" ${s.defaultSpeed==1?'selected':''}>x1</option><option value="2" ${s.defaultSpeed==2?'selected':''}>x2</option><option value="4" ${s.defaultSpeed==4?'selected':''}>x4</option></select></div>
      <div class="setting-row"><div><strong>Уменьшить анимации</strong><p>Почти мгновенные переходы и отключение декоративного движения.</p></div><label class="checkbox-row"><input type="checkbox" data-setting="reducedMotion" ${s.reducedMotion?'checked':''}><span>${s.reducedMotion?'Включено':'Выключено'}</span></label></div>
      <div class="setting-row"><div><strong>Ручное сохранение</strong><p>Сохранить текущее состояние карьеры в localStorage браузера.</p></div><button class="btn btn-primary" data-action="save-game">${icon('save')} Сохранить игру</button></div>
      <div class="setting-row"><div><strong>Удалить карьеру</strong><p>Сохранение будет удалено без возможности восстановления.</p></div><button class="btn btn-danger" data-action="delete-save">${icon('trash')} Удалить сохранение</button></div></div>`;
  }

  function renderVeto() {
    const entry = currentEntry();
    if (!entry || !entry.match || entry.match.status === 'completed') {
      currentView = 'dashboard';
      return renderDashboard();
    }
    const team = getUserTeam();
    const opponent = getOpponentFromEntry(entry);
    if (!vetoState || vetoState.matchId !== entry.match.id) initializeVeto(entry, team, opponent);
    const instruction = vetoInstruction(entry.match.format);
    return `${pageHead('14','ВЫБОР КАРТ','Проведите вето перед матчем. Уровень соперника показан приблизительным диапазоном.', `<button class="btn" data-action="navigate" data-view="dashboard">Вернуться</button>`)}
      <section class="panel panel-pad veto-screen">
        <div class="veto-head"><div class="kicker">Map veto protocol // ${escapeHTML(entry.match.format)}</div><h2 class="page-title" style="font-size:50px;margin-top:10px">${escapeHTML(instruction.title)}</h2><p class="muted">${escapeHTML(instruction.text)}</p></div>
        <div class="veto-teams">${teamFaceHTML(team)}<div class="vs">VS</div>${teamFaceHTML(opponent)}</div>
        ${analystReportHTML(entry)}
        <div class="veto-map-grid">${D.MAPS.map(map=>vetoMapHTML(map,team,opponent,entry.match.format)).join('')}</div>
        <div class="row-between wrap" style="margin-top:20px"><div class="small muted" id="veto-summary">${vetoSummaryHTML(entry.match.format)}</div><button class="btn btn-primary btn-lg" data-action="start-match" ${vetoState.ready?'':'disabled'}>Начать матч ${icon('play')}</button></div>
      </section>`;
  }

  function initializeVeto(entry, team, opponent) {
    vetoState = { matchId: entry.match.id, format: entry.match.format, poolSize: D.MAPS.length, phase: 'start', userBans: [], aiBans: [], userPicks: [], aiPicks: [], maps: [], ready: false };
    const saved = entry.match.veto;
    const savedMapsAreValid = saved && saved.poolSize === D.MAPS.length && Array.isArray(saved.maps) && saved.maps.every((id)=>D.MAPS.some((map)=>map.id===id));
    if (savedMapsAreValid) vetoState = JSON.parse(JSON.stringify(saved));
  }

  function vetoInstruction(format) {
    if (format === 'BO1') {
      if (vetoState.ready) return { title: 'КАРТА ОПРЕДЕЛЕНА', text: 'Четыре карты исключены. Оставшаяся карта станет игровой.' };
      if (vetoState.userBans.length === 0) return { title: 'ЗАПРЕТИТЕ ПЕРВУЮ КАРТУ', text: 'После вашего запрета соперник исключит одну карту.' };
      return { title: 'ЗАПРЕТИТЕ ВТОРУЮ КАРТУ', text: 'После второго запрета соперник исключит ещё одну карту. Оставшаяся станет игровой.' };
    }
    if (vetoState.ready) return { title: 'ВЕТО ЗАВЕРШЕНО', text: 'Выбраны две карты серии и решающая карта.' };
    if (vetoState.userBans.length === 0) return { title: 'ЗАПРЕТИТЕ ОДНУ КАРТУ', text: 'Соперник ответит своим запретом. После этого останется три карты.' };
    return { title: 'ВЫБЕРИТЕ СВОЮ КАРТУ', text: 'Соперник выберет вторую карту, а оставшаяся станет решающей.' };
  }

  function vetoMapHTML(map,team,opponent,format) {
    const userBanned = vetoState.userBans.includes(map.id);
    const aiBanned = vetoState.aiBans.includes(map.id);
    const banned = userBanned || aiBanned;
    const userPicked = vetoState.userPicks.includes(map.id);
    const aiPicked = vetoState.aiPicks.includes(map.id);
    const matchMap = vetoState.maps.includes(map.id);
    const selected = userPicked || aiPicked || matchMap;
    const userSkill=Math.round(team.mapSkill[map.id]);
    const oppSkill=Math.round(opponent.mapSkill[map.id]);
    const low=D.clamp(oppSkill-4,1,99), high=D.clamp(oppSkill+4,1,99);
    const isPriority = preferredMapId() === map.id;
    let status=isPriority?'Приоритетная карта':'Доступна';
    let actionLabel = format==='BO1' ? 'BAN' : (vetoState.userBans.length ? 'PICK' : 'BAN');
    if(userBanned){status='Ваш запрет';actionLabel='BAN';}
    else if(aiBanned){status='Запрет соперника';actionLabel='BAN';}
    else if(userPicked){status='Ваш выбор';actionLabel='PICK';}
    else if(aiPicked){status='Выбор соперника';actionLabel='PICK';}
    else if(matchMap){status=format==='BO1'?'Игровая карта':'Решающая карта';actionLabel='PLAY';}
    return `<article class="veto-map ${banned?'banned':''} ${selected&&!banned?'selected':''}" data-action="veto-map" data-map-id="${map.id}"><div class="row-between"><div><div class="kicker">${escapeHTML(map.name)}${isPriority?' // PRIORITY':''}</div><h3 class="section-title" style="margin-top:7px">${status}</h3></div><span class="tag ${selected&&!banned||isPriority&&!banned?'tag-acid':banned?'tag-danger':''}">${actionLabel}</span></div><div class="map-plan">${mapSVG(map.id,team.primaryColor)}</div><div class="grid-2"><div><div class="muted tiny upper">Ваша подготовка</div><strong style="font-size:27px" class="acid">${userSkill}</strong></div><div style="text-align:right"><div class="muted tiny upper">Сила соперника</div><strong style="font-size:27px">${low}–${high}</strong></div></div><div class="row-between" style="margin-top:10px"><span class="power-range">История ${team.history.filter(r=>r==='W').length}/${team.history.length||0}</span><span class="power-range">${escapeHTML(map.label)}</span></div></article>`;
  }

  function vetoSummaryHTML(format) {
    if (!vetoState) return '';
    if (format === 'BO1') {
      if (vetoState.ready) return `Игровая карта: <strong class="acid">${D.MAPS.find(m=>m.id===vetoState.maps[0]).name}</strong>`;
      return `Ваши запреты: <strong class="acid">${vetoState.userBans.length}/2</strong> · запреты соперника: <strong>${vetoState.aiBans.length}/2</strong>`;
    }
    if (!vetoState.userBans.length) return 'Ожидается ваш запрет.';
    if (!vetoState.userPicks.length) return 'Запреты завершены. Выберите карту своей команды.';
    if (!vetoState.ready) return 'Соперник выбирает свою карту...';
    return `Карты: <strong class="acid">${vetoState.maps.map(id=>D.MAPS.find(m=>m.id===id).name).join(' · ')}</strong>`;
  }

  function renderMatchScreen() {
    const team = getUserTeam();
    const entry = currentEntry();
    const opponent = getOpponentFromEntry(entry);
    const maps = vetoState && vetoState.maps.length ? vetoState.maps : [bestMapForTeam(team)];
    const currentMap = D.MAPS.find(m=>m.id===maps[0]);
    app.innerHTML = `<main class="match-screen screen-fade">
      <header class="broadcast-top">
        <div class="broadcast-team"><div class="broadcast-logo" style="color:${team.primaryColor}">${logoSVG(team.logoType,team.primaryColor,team.secondaryColor)}</div><div><div class="broadcast-team-name">${escapeHTML(team.name)}</div><div class="broadcast-team-meta"><span id="side-a">ATK</span> · <span id="alive-label-a">5 живых</span></div></div></div>
        <div class="score-center"><div class="kicker" id="match-map-label">${escapeHTML(currentMap.name)} // ${escapeHTML(entry.match.format)}</div><div class="map-score"><span id="score-a">0</span><span class="colon">:</span><span id="score-b">0</span></div><div class="series-score">Счёт по картам <strong id="series-a">0</strong> : <strong id="series-b">0</strong></div></div>
        <div class="broadcast-team right"><div class="broadcast-logo" style="color:${opponent.primaryColor}">${logoSVG(opponent.logoType,opponent.primaryColor,opponent.secondaryColor)}</div><div><div class="broadcast-team-name">${escapeHTML(opponent.name)}</div><div class="broadcast-team-meta"><span id="side-b">DEF</span> · <span id="alive-label-b">5 живых</span></div></div></div>
      </header>
      <div class="broadcast-body">
        <section class="feed-panel"><div class="round-header"><div><div class="kicker">Live text broadcast</div><div class="round-title" id="round-title">РАУНД 1</div></div><div class="tag tag-acid" id="match-status">ПОДГОТОВКА</div></div><div class="feed" id="match-feed"><div class="feed-event normal"><span class="feed-time">LIVE</span><span>Команды выходят на сервер. Текстовая трансляция готова к запуску.</span></div></div></section>
        <aside class="broadcast-side">
          <div class="side-stat"><div class="side-stat-head"><span>Вероятность раунда</span><span id="chance-label">50%</span></div><div class="chance-bar" style="margin-top:10px"><span class="chance-user" id="chance-bar" style="--chance:50%"></span><span class="chance-opp"></span></div></div>
          <div class="side-stat"><div class="side-stat-head"><span>Экономика</span><span>Кредиты</span></div><div class="row-between" style="margin-top:7px"><strong id="economy-a">$4 000</strong><strong id="economy-b">$4 000</strong></div></div>
          <div class="side-stat"><div class="side-stat-head"><span>Живые игроки</span><span id="alive-score">5 : 5</span></div><div class="alive-row" style="margin-top:10px"><div class="alive-dots" id="alive-a">${aliveDots(5)}</div><span class="muted tiny">VS</span><div class="alive-dots right" id="alive-b">${aliveDots(5)}</div></div></div>
          <div class="side-stat"><div class="side-stat-head"><span>Карты серии</span><span id="map-counter">1/${maps.length}</span></div><div id="series-maps" class="stack" style="margin-top:9px">${maps.map((id,i)=>`<div class="row-between small"><span>${D.MAPS.find(m=>m.id===id).name}</span><span class="tag ${i===0?'tag-acid':''}" id="map-status-${i}">${i===0?'LIVE':'NEXT'}</span></div>`).join('')}</div></div>
          <div class="speed-row"><button class="btn speed-btn ${gameState.settings.defaultSpeed==1?'active':''}" data-action="match-speed" data-speed="1">x1</button><button class="btn speed-btn ${gameState.settings.defaultSpeed==2?'active':''}" data-action="match-speed" data-speed="2">x2</button><button class="btn speed-btn ${gameState.settings.defaultSpeed==4?'active':''}" data-action="match-speed" data-speed="4">x4</button></div>
          <div class="broadcast-controls"><button class="btn" data-action="match-pause">${icon('pause')} Пауза</button><button class="btn" data-action="match-resume">${icon('play')} Продолжить</button><button class="btn" data-action="match-skip">${icon('skip')} Пропустить раунд</button><button class="btn btn-primary" data-action="match-finish">${icon('fast')} До конца</button></div>
        </aside>
      </div>
    </main>`;
  }

  function aliveDots(count) {
    return Array.from({length:5},(_,i)=>`<span class="alive-dot ${i<count?'':'dead'}"></span>`).join('');
  }

  function updateMatchHUD(snapshot) {
    if (currentView!=='match') return;
    const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
    set('score-a',snapshot.scoreA); set('score-b',snapshot.scoreB); set('series-a',snapshot.mapsWonA); set('series-b',snapshot.mapsWonB);
    set('round-title',`РАУНД ${snapshot.round}`); set('side-a',snapshot.sideA); set('side-b',snapshot.sideB);
    set('alive-label-a',`${snapshot.aliveA} живых`); set('alive-label-b',`${snapshot.aliveB} живых`); set('alive-score',`${snapshot.aliveA} : ${snapshot.aliveB}`);
    set('economy-a',D.money(snapshot.economyA)); set('economy-b',D.money(snapshot.economyB));
    set('chance-label',`${Math.round(snapshot.chanceA*100)}%`); set('match-map-label',`${snapshot.currentMap.name} // ${snapshot.mapIndex+1}/${snapshot.maps.length}`); set('map-counter',`${snapshot.mapIndex+1}/${snapshot.maps.length}`);
    set('match-status',snapshot.paused?'ПАУЗА':snapshot.fastForward?'БЫСТРАЯ СИМУЛЯЦИЯ':'LIVE');
    const bar=document.getElementById('chance-bar');if(bar)bar.style.setProperty('--chance',`${Math.round(snapshot.chanceA*100)}%`);
    const a=document.getElementById('alive-a');if(a)a.innerHTML=aliveDots(snapshot.aliveA);
    const b=document.getElementById('alive-b');if(b)b.innerHTML=aliveDots(snapshot.aliveB);
    document.querySelectorAll('.speed-btn').forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.speed)===snapshot.speed&&!snapshot.fastForward));
    snapshot.maps.forEach((id,i)=>{const el=document.getElementById(`map-status-${i}`);if(!el)return;el.className='tag';if(i<snapshot.mapIndex){el.textContent='DONE';}else if(i===snapshot.mapIndex){el.textContent='LIVE';el.classList.add('tag-acid');}else el.textContent='NEXT';});
  }

  function appendMatchEvent(event, silent) {
    const feed=document.getElementById('match-feed');
    if(!feed)return;
    const node=document.createElement('div');
    node.className=`feed-event ${event.type||'normal'}`;
    node.innerHTML=`<span class="feed-time">${escapeHTML(event.time||'--:--')}</span><span>${escapeHTML(event.text)}</span>`;
    feed.appendChild(node);
    if(feed.children.length>180)feed.removeChild(feed.children[0]);
    feed.scrollTop=feed.scrollHeight;
  }

  function appendMapComplete(result) {
    const map=D.MAPS.find(m=>m.id===result.mapId);
    appendMatchEvent({type:'round',time:'MAP',text:`КАРТА ${map.name.toUpperCase()} ЗАВЕРШЕНА СО СЧЁТОМ ${result.scoreA}:${result.scoreB}.`});
  }

  function renderPostMatch() {
    const result=gameState.lastMatch;
    if(!result){currentView='dashboard';return renderDashboard();}
    const a=D.findTeam(gameState,result.teamAId), b=D.findTeam(gameState,result.teamBId);
    const mvpPlayer=D.findPlayer(gameState,result.mvp.playerId);
    const userWon=result.winnerId===gameState.userTeamId;
    const rowsA=result.stats.filter(r=>r.teamId===a.id);
    const rowsB=result.stats.filter(r=>r.teamId===b.id);
    const userInjuries=(result.injuries||[]).filter((item)=>item.teamId===gameState.userTeamId).map((item)=>({item,player:D.findPlayer(gameState,item.playerId)})).filter((row)=>row.player);
    const resultDescription=result.friendly?'Товарищеский матч завершён. Его результат не изменяет очки мирового рейтинга.':`Матч завершён. Рейтинг ${result.ratingChange>=0?'вырос':'снизился'} на ${Math.abs(result.ratingChange)} очков.`;
    return `${pageHead('15',userWon?'ПОБЕДА':'ПОРАЖЕНИЕ',resultDescription, `<button class="btn btn-primary" data-action="navigate" data-view="calendar">Перейти к календарю ${icon('arrow')}</button>`)}
      ${userInjuries.length?`<section class="panel panel-pad injury-report"><div class="kicker">MEDICAL REPORT // AFTER MATCH</div><h2 class="section-title" style="margin-top:7px">Травмы после матча</h2>${userInjuries.map(({item,player})=>`<div class="warning-item" style="margin-top:10px"><strong>${escapeHTML(player.nickname)}</strong> · ${escapeHTML(item.name)} · пропустит ${item.matches} ${item.matches===1?'матч':'матча'}</div>`).join('')}</section>`:''}
      <div class="result-hero"><section class="panel result-score-panel"><div class="kicker">Final match result // Week ${result.week}</div><div class="result-big-score">${result.mapsWonA}<span>:</span>${result.mapsWonB}</div><div class="row-between wrap" style="margin-top:15px"><strong>${escapeHTML(a.name)}</strong><strong>${escapeHTML(b.name)}</strong></div><div class="map-result-list">${result.mapResults.map(r=>{const map=D.MAPS.find(m=>m.id===r.mapId);return `<span class="map-result-pill">${map.name} · ${r.scoreA}:${r.scoreB}</span>`;}).join('')}</div></section>
      <aside class="panel mvp-card"><div class="row-between"><div><div class="kicker">Player of the match</div><h2 class="section-title" style="margin-top:7px">Лучший игрок</h2></div><span class="tag tag-acid">MVP</span></div><div class="mvp-avatar">${playerAvatarSVG(mvpPlayer,D.findPlayerTeam(gameState,mvpPlayer.id).primaryColor)}</div><div class="row-between"><div><div class="mvp-name">${escapeHTML(mvpPlayer.nickname)}</div><div class="muted small">${escapeHTML(mvpPlayer.role)} · ${result.mvp.kills}-${result.mvp.deaths}-${result.mvp.assists}</div></div><div class="mvp-rating">${result.mvp.rating}</div></div></aside></div>
      <section class="panel panel-pad" style="margin-top:16px"><div class="panel-head"><h2 class="section-title">Подробная статистика</h2><div class="row"><button class="btn btn-sm" data-action="navigate" data-view="ranking">Мировой рейтинг</button><button class="btn btn-sm" data-action="navigate" data-view="roster">Открыть состав</button></div></div>${matchStatsTable(a,rowsA,result.mvp.playerId)}<div style="height:14px"></div>${matchStatsTable(b,rowsB,result.mvp.playerId)}</section>`;
  }

  function matchStatsTable(team,rows,mvpId) {
    return `<div class="table-wrap"><table><thead><tr><th colspan="2">${escapeHTML(team.name)}</th><th>K</th><th>D</th><th>A</th><th>+/−</th><th>ADR</th><th>Первые</th><th>Клатчи</th><th>Гранаты</th><th>Оценка</th></tr></thead><tbody>${rows.sort((a,b)=>b.rating-a.rating).map(r=>{const p=D.findPlayer(gameState,r.playerId);return `<tr ${r.playerId===mvpId?'style="background:rgba(198,255,0,.06)"':''}><td>${r.playerId===mvpId?'<span class="tag tag-acid">MVP</span>':''}</td><td><strong>${escapeHTML(p.nickname)}</strong><div class="muted tiny">${escapeHTML(p.role)}</div></td><td>${r.kills}</td><td>${r.deaths}</td><td>${r.assists}</td><td class="${r.kills-r.deaths>=0?'acid':'danger'}">${r.kills-r.deaths>=0?'+':''}${r.kills-r.deaths}</td><td>${r.adr}</td><td>${r.firstKills}</td><td>${r.clutches}</td><td>${r.utility}</td><td class="${r.rating>=1?'acid':'danger'}"><strong>${r.rating}</strong></td></tr>`;}).join('')}</tbody></table></div>`;
  }

  function openTeamModal(teamId) {
    const team=D.findTeam(gameState,teamId);if(!team)return;
    const avg=Math.round(D.teamAverage(team,'overall'));
    const body=`<div class="row-between wrap"><div class="row"><div class="rank-logo" style="width:78px;height:78px;color:${team.primaryColor}">${logoSVG(team.logoType,team.primaryColor,team.secondaryColor)}</div><div><div class="kicker">World rank #${team.rank}</div><h2 class="page-title" style="font-size:42px;margin-top:6px">${escapeHTML(team.name)}</h2><div class="row wrap" style="margin-top:8px"><span class="tag tag-acid">${escapeHTML(team.tag)}</span><span class="tag">${escapeHTML(team.region)}</span><span class="tag">${escapeHTML(team.tier)}</span></div></div></div><div class="grid-3" style="min-width:360px">${metricCard('A','Очки',Math.round(team.ratingPoints),'Мировой рейтинг')}${metricCard('B','Средний OVR',avg,'Основной состав')}${metricCard('C','Химия',Math.round(team.chemistry),'Командная игра',team.chemistry)}</div></div><div class="divider"></div><div class="table-wrap"><table class="table-clickable"><thead><tr><th>Игрок</th><th>Роль</th><th>OVR</th><th>Возраст</th><th>Страна</th><th>Стоимость</th></tr></thead><tbody>${team.players.map(p=>`<tr data-action="open-player" data-player-id="${p.id}"><td><strong>${escapeHTML(p.nickname)}</strong></td><td>${escapeHTML(p.role)}</td><td class="acid"><strong>${p.overall}</strong></td><td>${p.age}</td><td>${escapeHTML(p.country)}</td><td>${D.money(p.value)}</td></tr>`).join('')}</tbody></table></div>`;
    openModal(team.name,body,true);
  }

  function openTournamentDetails(id) {
    const t=gameState.tournaments.find(x=>x.id===id);if(!t)return;
    ensureTournamentData(t);
    const config=getTournamentConfig(t);
    const rows=sortedTournamentRows(t);
    const swissFinished=t.id==='masters'&&(t.processedWeeks||[]).includes(16);
    const qualifierIds=swissFinished?t.qualifierIds:rows.slice(0,8).map((row)=>row.teamId);
    const statusFor=(row,index)=>{
      if(t.winnerId===row.teamId)return '<span class="tag tag-acid">Победитель</span>';
      if(t.id==='masters'){
        if(qualifierIds.includes(row.teamId))return `<span class="tag ${swissFinished?'tag-acid':''}">${swissFinished?'Плей-офф':'Зона топ-8'}</span>`;
        return swissFinished?'<span class="tag">Не прошла</span>':'<span class="tag">Швейцарская система</span>';
      }
      if(t.id==='world'&&row.seed<=8&&!(t.processedWeeks||[]).includes(20))return '<span class="tag tag-acid">Прямой проход</span>';
      const lost=(t.bracket||[]).some((match)=>match.winnerId&&(match.a===row.teamId||match.b===row.teamId)&&match.winnerId!==row.teamId);
      return lost?'<span class="tag">Выбыла</span>':'<span class="tag tag-acid">В турнире</span>';
    };
    const standings=rows.map((row,i)=>{const team=D.findTeam(gameState,row.teamId);const divider=t.id==='masters'&&i===7?'border-bottom:2px solid var(--acid);':'';return `<tr style="${divider}${team&&team.isUser?'background:rgba(198,255,0,.055);':''}"><td>${i+1}</td><td><strong>${escapeHTML(team.name)}</strong>${team.isUser?' <span class="acid">· ВЫ</span>':''}</td><td>${row.played}</td><td>${row.wins}</td><td>${row.losses}</td><td class="acid"><strong>${row.points}</strong></td><td>${statusFor(row,i)}</td></tr>`;}).join('');
    const swissHTML=t.id==='masters'?`<div class="divider"></div><h3 class="section-title">Швейцарские раунды</h3><div class="table-wrap"><div class="bracket" style="--bracket-cols:${Math.max(1,t.swissRounds.length)};grid-template-columns:repeat(${Math.max(1,t.swissRounds.length)},minmax(170px,1fr));min-width:${Math.max(650,t.swissRounds.length*190)}px">${t.swissRounds.map((round)=>`<div class="bracket-col"><div class="kicker">Раунд ${round.round} · W${round.week}</div>${round.matches.map((m)=>{const ta=D.findTeam(gameState,m.a),tb=D.findTeam(gameState,m.b);return `<div class="bracket-match"><div class="bracket-team ${m.winnerId===m.a?'winner':''}"><span>${ta?escapeHTML(ta.tag):'TBD'}</span><strong>${m.scoreA??'—'}</strong></div><div class="bracket-team ${m.winnerId===m.b?'winner':''}"><span>${tb?escapeHTML(tb.tag):'TBD'}</span><strong>${m.scoreB??'—'}</strong></div></div>`;}).join('')}</div>`).join('')}</div></div>`:'';
    const bracketColumns=config.bracketStages.map((stage)=>{
      const matches=(t.bracket||[]).filter((m)=>m.stageKey===stage.key);
      return `<div class="bracket-col"><div class="kicker">${escapeHTML(stage.label)} · W${stage.week}</div>${matches.length?matches.map((m)=>{const ta=D.findTeam(gameState,m.a),tb=D.findTeam(gameState,m.b);return `<div class="bracket-match"><div class="bracket-team ${m.winnerId===m.a?'winner':''}"><span>${ta?escapeHTML(ta.tag):'TBD'}</span><strong>${m.scoreA??'—'}</strong></div><div class="bracket-team ${m.winnerId===m.b?'winner':''}"><span>${tb?escapeHTML(tb.tag):'TBD'}</span><strong>${m.scoreB??'—'}</strong></div></div>`;}).join(''):'<div class="bracket-match"><div class="bracket-team"><span>Пары определятся позже</span><strong>—</strong></div></div>'}</div>`;
    }).join('');
    const bracketHTML=`<div class="table-wrap"><div class="bracket" style="grid-template-columns:repeat(${config.bracketStages.length},minmax(170px,1fr));min-width:${Math.max(650,config.bracketStages.length*190)}px">${bracketColumns}</div></div>`;
    openModal(t.name,`<div class="row-between wrap"><div><div class="kicker">W${t.weeks[0]}–W${t.weeks[1]} // ${t.participants} teams</div><div class="tournament-prize">${D.money(t.prize)}</div><div class="muted small">Приз за первое место · ${escapeHTML(t.format)} · стадия: ${escapeHTML(t.stage)}</div>${tournamentPrizeLineHTML(t)}</div><div class="row">${tournamentTitleBadgeHTML(t.id)}<span class="tag ${t.winnerId?'tag-acid':''}">${t.winnerId?`Победитель ${escapeHTML(D.findTeam(gameState,t.winnerId).tag)}`:'Турнир продолжается'}</span></div></div><div class="tactic-note" style="margin-top:18px">${escapeHTML(config.info)}</div><div class="divider"></div><h3 class="section-title">Турнирная таблица</h3><div class="table-wrap" style="margin-top:10px"><table><thead><tr><th>#</th><th>Команда</th><th>И</th><th>В</th><th>П</th><th>Очки</th><th>Статус</th></tr></thead><tbody>${standings}</tbody></table></div>${swissHTML}<div class="divider"></div><h3 class="section-title">Сетка плей-офф</h3>${bracketHTML}`,true);
  }

  function transferSuccessStatsHTML(player) {
    const rows = [
      ['Стрельба', player.attrs.aim],
      ['Реакция', player.attrs.reaction],
      ['Тактика', player.attrs.tactics],
      ['Коммуникация', player.attrs.communication]
    ];
    return rows.map(([label,value])=>`<div class="transfer-success-stat"><span>${label}</span><strong>${value}</strong><div class="progress"><span style="--value:${value}%"></span></div></div>`).join('');
  }

  function showTransferSuccessModal(type, player, amount, counterparty, accentColor) {
    const isPurchase = type === 'purchase';
    const color = accentColor || (isPurchase ? getUserTeam().primaryColor : '#C6FF00');
    const title = isPurchase ? 'ИГРОК ПРИСОЕДИНИЛСЯ К КОМАНДЕ' : 'ТРАНСФЕР ЗАВЕРШЁН';
    const eyebrow = isPurchase ? 'NEW SIGNING // DEAL COMPLETE' : 'PLAYER SOLD // DEAL COMPLETE';
    const destination = isPurchase && player.inAcademy ? 'academy' : 'roster';
    const summary = isPurchase
      ? player.inAcademy
        ? `${player.nickname} подписал контракт с ${getUserTeam().name}. Основной состав заполнен, поэтому игрок зарегистрирован в академии. Сумма сделки: ${D.money(amount)}.`
        : `${player.nickname} подписал контракт с ${getUserTeam().name}. Сумма сделки: ${D.money(amount)}.`
      : `${player.nickname} переходит в ${counterparty ? counterparty.name : 'новый клуб'}. Получено: ${D.money(amount)}.`;
    openModal(title, `<div class="transfer-success">
      <div class="transfer-success-avatar" style="--transfer-accent:${color}">${playerAvatarSVG(player,color)}<span>${player.overall} OVR</span></div>
      <div class="transfer-success-copy"><div class="kicker">${eyebrow}</div><h2>${escapeHTML(player.nickname)}</h2><p>${escapeHTML(summary)}</p>
      <div class="row wrap"><span class="tag tag-acid">${escapeHTML(player.role)}</span><span class="tag">${player.age} лет</span><span class="tag">${escapeHTML(player.country)}</span><span class="tag">Потенциал ${player.potential}</span></div>
      <div class="transfer-success-stats">${transferSuccessStatsHTML(player)}</div>
      <div class="row wrap"><button class="btn btn-primary" data-action="go-roster-after-transfer" data-destination="${destination}">${isPurchase&&player.inAcademy?'Перейти в академию':'Перейти к составу'} ${icon('arrow')}</button><button class="btn" data-action="close-modal">Закрыть</button></div></div>
    </div>`, true);
  }

  function showComebackTrainingModal(entry) {
    const team = getUserTeam();
    const boosted = team.players.map((player)=>`<span>${escapeHTML(player.nickname)} <b>+5 формы</b></span>`).join('');
    openModal('КОМАНДА ОТЛИЧНО ПОТРЕНИРОВАЛАСЬ', `<div class="comeback-training">
      <div class="comeback-mark">${icon('activity',64)}</div>
      <div><div class="kicker">REACTION CAMP // LOSING STREAK RESPONSE</div><h2>КОМАНДА ОТЛИЧНО ПОТРЕНИРОВАЛАСЬ</h2><p>После серии из двух поражений команда провела дополнительный тренировочный сбор перед следующим матчем.</p>
      <div class="comeback-effects"><div><small>Форма игроков</small><strong>+5</strong></div><div><small>Сила на картах матча</small><strong>+2.5</strong></div></div>
      <div class="comeback-roster">${boosted}</div>
      <button class="btn btn-primary btn-lg" data-action="continue-after-comeback">Продолжить к подготовке матча ${icon('arrow')}</button></div>
    </div>`, true);
  }

  function applyComebackTrainingIfNeeded(entry) {
    const team = getUserTeam();
    if (!entry || !entry.match || Number(team.lossStreak || 0) < 2 || entry.match.comebackTrainingApplied) return false;
    team.players.forEach((player)=>{ player.form = D.clamp(Number(player.form || 0) + 5, 0, 100); });
    entry.match.comebackTrainingApplied = true;
    entry.match.comebackPowerBonus = 2.5;
    autosave();
    showComebackTrainingModal(entry);
    return true;
  }

  function openPlayerModal(playerId) {
    const player=D.findPlayer(gameState,playerId);if(!player)return;
    openModal(player.nickname,playerProfileBody(player),true);
  }

  function openCompareModal() {
    const ids=gameState.ui.compareIds||[];
    if(ids.length<2){
      const own=getUserTeam().players;
      openModal('Сравнение игроков',`<p class="muted">Выберите двух игроков. Нажмите «Добавить» у первого и второго кандидата.</p><div class="transfer-list">${own.map(p=>`<div class="transfer-card"><div class="transfer-avatar">${playerAvatarSVG(p,getUserTeam().primaryColor)}</div><div class="transfer-name"><strong>${escapeHTML(p.nickname)}</strong><small>${escapeHTML(p.role)} · ${p.overall} OVR</small></div><div></div><div></div><button class="btn btn-sm ${ids.includes(p.id)?'btn-primary':''}" data-action="toggle-compare" data-player-id="${p.id}">${ids.includes(p.id)?'Выбран':'Добавить'}</button></div>`).join('')}</div>`,true);
      return;
    }
    const [a,b]=ids.map(id=>D.findPlayer(gameState,id));
    const rows=D.ATTRS.map(([key,label])=>`<tr><td>${label}</td><td class="${a.attrs[key]>=b.attrs[key]?'acid':''}"><strong>${a.attrs[key]}</strong></td><td class="${b.attrs[key]>=a.attrs[key]?'acid':''}"><strong>${b.attrs[key]}</strong></td></tr>`).join('');
    openModal('Сравнение игроков',`<div class="grid-2"><div class="panel panel-pad" style="text-align:center"><div style="height:170px">${playerAvatarSVG(a,D.findPlayerTeam(gameState,a.id)?.primaryColor)}</div><h2 class="section-title">${escapeHTML(a.nickname)}</h2><div class="acid" style="font-family:Impact;font-size:45px">${a.overall}</div><div class="muted small">${escapeHTML(a.role)}</div></div><div class="panel panel-pad" style="text-align:center"><div style="height:170px">${playerAvatarSVG(b,D.findPlayerTeam(gameState,b.id)?.primaryColor)}</div><h2 class="section-title">${escapeHTML(b.nickname)}</h2><div class="acid" style="font-family:Impact;font-size:45px">${b.overall}</div><div class="muted small">${escapeHTML(b.role)}</div></div></div><div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>Параметр</th><th>${escapeHTML(a.nickname)}</th><th>${escapeHTML(b.nickname)}</th></tr></thead><tbody>${rows}<tr><td>Мораль</td><td>${Math.round(a.morale)}</td><td>${Math.round(b.morale)}</td></tr><tr><td>Усталость</td><td>${Math.round(a.fatigue)}</td><td>${Math.round(b.fatigue)}</td></tr><tr><td>Стоимость</td><td>${D.money(a.value)}</td><td>${D.money(b.value)}</td></tr><tr><td>Зарплата</td><td>${D.money(a.salary)}</td><td>${D.money(b.salary)}</td></tr></tbody></table></div><div class="row" style="margin-top:14px"><button class="btn" data-action="clear-compare">Очистить выбор</button></div>`,true);
  }

  function openContractModal(playerId) {
    const player=D.findPlayer(gameState,playerId);if(!player)return;
    openModal('Новый контракт',`<form id="contract-form" data-player-id="${player.id}" class="stack"><div class="panel panel-pad"><div class="row-between"><div><div class="kicker">${escapeHTML(player.nickname)} // ${escapeHTML(player.role)}</div><h3 class="section-title" style="margin-top:7px">Условия продления</h3></div><div class="acid" style="font-family:Impact;font-size:42px">${player.overall}</div></div></div><div class="form-grid"><label class="label">Зарплата в неделю<input class="input" name="salary" type="number" min="500" step="50" value="${Math.round(player.salary*1.08/50)*50}" required></label><label class="label">Срок контракта<select class="select" name="weeks"><option value="24">24 недели</option><option value="36" selected>36 недель</option><option value="52">52 недели</option><option value="72">72 недели</option></select></label></div><div class="muted small">Игрок может отказаться, если зарплата слишком низкая или срок не соответствует его ожиданиям. При подписании выплачивается бонус в размере одной недельной зарплаты.</div><button class="btn btn-primary" type="submit">Предложить контракт</button></form>`);
  }

  function teamMemberLocation(team, playerId) {
    const buckets = ['players','academy','academyGraduates'];
    for (const bucket of buckets) {
      const list = team && Array.isArray(team[bucket]) ? team[bucket] : [];
      const index = list.findIndex((player)=>player.id===playerId);
      if (index >= 0) return { bucket, index, player: list[index] };
    }
    return null;
  }

  function removeTeamMember(team, playerId) {
    const location = teamMemberLocation(team,playerId);
    if (!location) return null;
    return team[location.bucket].splice(location.index,1)[0] || null;
  }

  function transferDestination(player, team) {
    if ((team.players || []).length < MAX_SENIOR_ROSTER) return 'roster';
    if (Number(player.age || 99) <= 18 && (team.academy || []).length < MAX_ACADEMY_PLAYERS) return 'academy';
    return 'blocked';
  }

  function openTransferOfferModal(playerId) {
    const player=D.findPlayer(gameState,playerId);if(!player)return;
    const team=D.findPlayerTeam(gameState,playerId);
    const isFree=!team;
    const own=getUserTeam();
    const destination=transferDestination(player,own);
    if(destination==='blocked'){
      if(Number(player.age||99)<=18 && (own.academy||[]).length>=MAX_ACADEMY_PLAYERS && own.players.length>=MAX_SENIOR_ROSTER){
        toast('Основной состав и академия заполнены. Освободите место перед завершением трансфера.','error');
      }else{
        toast('В основном составе уже 7 игроков. Сначала продайте или отпустите одного из них.','warning');
      }
      return;
    }
    const academyNotice=destination==='academy'?`<div class="warning-item"><strong>Игрок будет зарегистрирован в академии.</strong><br>В основном составе нет свободных мест. После принятия предложения ${escapeHTML(player.nickname)} автоматически займёт место в академии.</div>`:'';
    const statusField=destination==='academy'?'<input type="hidden" name="status" value="reserve">':`<label class="label">Планируемый статус<select class="select" name="status"><option value="reserve">Игрок ротации</option><option value="starter">Основной игрок</option></select></label>`;
    openModal(isFree?'Подписание свободного агента':'Трансферное предложение',`<form id="transfer-offer-form" data-player-id="${player.id}" class="stack"><div class="panel panel-pad"><div class="row-between"><div><div class="kicker">${escapeHTML(player.nickname)} // ${escapeHTML(player.role)}</div><h3 class="section-title" style="margin-top:7px">${isFree?'Условия контракта':`Переговоры с ${escapeHTML(team.name)}`}</h3></div><div class="acid" style="font-family:Impact;font-size:42px">${player.overall}</div></div><div class="grid-3" style="margin-top:14px">${metricCard('A','Стоимость',D.money(player.value),'Оценка рынка')}${metricCard('B','Текущая зарплата',player.salary?D.money(player.salary):'—','За неделю')}${metricCard('C','Ваш бюджет',D.money(own.budget),'Доступные средства')}</div></div>${academyNotice}<div class="form-grid">${isFree?'':`<label class="label">Сумма трансфера<input class="input" name="fee" type="number" min="0" step="5000" value="${Math.round(player.value*(player.listed?1.02:(player.overall>=80?1.30:1.18))/5000)*5000}" required></label>`}<label class="label">Зарплата в неделю<input class="input" name="salary" type="number" min="500" step="50" value="${Math.max(500,Math.round((player.salary||700)*1.08/50)*50)}" required></label><label class="label">Срок контракта<select class="select" name="weeks"><option value="24">24 недели</option><option value="36" selected>36 недель</option><option value="52">52 недели</option><option value="72">72 недели</option></select></label>${statusField}</div><div class="muted small">Решение зависит от зарплаты, срока контракта, рейтинга вашей организации и обещанного статуса. Предложение может быть отклонено.</div><button class="btn btn-primary" type="submit">${destination==='academy'?'Подтвердить трансфер':'Отправить предложение'}</button></form>`);
  }

  function handleClick(event) {
    const target=event.target.closest('[data-action]');
    if(!target)return;
    const action=target.dataset.action;
    if(action==='new-career'){gameState=null;currentView='create';renderApp();return;}
    if(action==='back-menu'){currentView='menu';renderApp();return;}
    if(action==='continue'){const loaded=S.load();if(loaded){gameState=normalizeState(loaded);currentView=gameState.lastView||'dashboard';saveGame(false);renderApp();toast('Сохранение загружено');}return;}
    if(action==='delete-save'){confirmDeleteSave();return;}
    if(action==='navigate'){closeModal();currentView=target.dataset.view;if(currentView==='dashboard'&&gameState.ui)gameState.ui.dashboardHint=null;gameState.lastView=currentView;autosave();renderApp();return;}
    if(action==='open-transfer-offers'){gameState.ui.headerNotification=null;gameState.ui.transferTab='offers';currentView='transfers';gameState.lastView=currentView;renderApp();return;}
    if(action==='start-new-season'){startNewSeason();return;}
    if(action==='save-game'){saveGame(true);return;}
    if(action==='exit-menu'){saveGame(false);currentView='menu';renderApp();return;}
    if(action==='close-modal'){closeModal();return;}
    if(action==='go-roster-after-transfer'){closeModal();currentView=target.dataset.destination==='academy'?'academy':'roster';gameState.lastView=currentView;renderApp();return;}
    if(action==='open-academy-candidates'){showAcademyCandidatesModal();return;}
    if(action==='choose-academy-candidate'){chooseAcademyCandidate(target.dataset.playerId);return;}
    if(action==='promote-academy'){event.stopPropagation();promoteAcademyPlayer(target.dataset.playerId);return;}
    if(action==='move-to-academy'){event.stopPropagation();moveSeniorPlayerToAcademy(target.dataset.playerId);return;}
    if(action==='release-academy-player'){event.stopPropagation();releaseAcademyPlayer(target.dataset.playerId);return;}
    if(action==='replace-reserve-for-graduate'){event.stopPropagation();openGraduateReplacementModal(target.dataset.playerId);return;}
    if(action==='confirm-graduate-replacement'){event.stopPropagation();confirmGraduateReplacement(target.dataset.playerId,target.dataset.reserveId);return;}
    if(action==='continue-after-comeback'){closeModal();currentView='veto';vetoState=null;gameState.lastView=currentView;renderApp();return;}
    if(action==='select-logo'){document.querySelectorAll('.logo-option').forEach(x=>x.classList.remove('active'));target.classList.add('active');const input=document.querySelector('[name="logoType"]');if(input)input.value=target.dataset.logo;updateOrgPreview();return;}
    if(action==='open-player'){event.stopPropagation();openPlayerModal(target.dataset.playerId);return;}
    if(action==='open-team'){openTeamModal(target.dataset.teamId);return;}
    if(action==='set-starter'){event.stopPropagation();setStarter(target.dataset.playerId);return;}
    if(action==='set-reserve'){event.stopPropagation();setReserve(target.dataset.playerId);return;}
    if(action==='contract-modal'){openContractModal(target.dataset.playerId);return;}
    if(action==='toggle-list'){toggleTransferList(target.dataset.playerId);return;}
    if(action==='toggle-compare'){toggleCompare(target.dataset.playerId);return;}
    if(action==='open-compare'){openCompareModal();return;}
    if(action==='clear-compare'){gameState.ui.compareIds=[];closeModal();toast('Выбор для сравнения очищен');return;}
    if(action==='transfer-tab'){gameState.ui.transferTab=target.dataset.tab;renderApp();return;}
    if(action==='clear-filters'){gameState.ui.filters={};renderApp();return;}
    if(action==='apply-filters'){readTransferFilters();renderApp();return;}
    if(action==='offer-player'){openTransferOfferModal(target.dataset.playerId);return;}
    if(action==='accept-sale'){acceptIncomingOffer(target.dataset.offerId);return;}
    if(action==='reject-sale'){rejectIncomingOffer(target.dataset.offerId);return;}
    if(action==='confirm-training'){confirmTraining();return;}
    if(action==='set-tactic'){gameState.tactics[target.dataset.key]=target.dataset.value;gameState.tactics.confirmedWeek=0;clearDashboardHint();renderApp();return;}
    if(action==='confirm-tactics'){gameState.tactics.confirmedWeek=gameState.season.week;gameState.ui.dashboardHint='tactics';autosave();toast('Тактика подтверждена на текущую неделю');renderApp();return;}
    if(action==='prefer-map'){gameState.preferredMap=target.dataset.mapId;getUserTeam().preferredMap=target.dataset.mapId;autosave();toast(`${D.MAPS.find(m=>m.id===target.dataset.mapId).name} выбрана приоритетной`);renderApp();return;}
    if(action==='end-week'){endWeek();return;}
    if(action==='prepare-match'){prepareMatch();return;}
    if(action==='veto-map'){handleVetoMap(target.dataset.mapId);return;}
    if(action==='start-match'){startMatch();return;}
    if(action==='match-pause'){matchController&&matchController.pause();return;}
    if(action==='match-resume'){matchController&&matchController.resume();return;}
    if(action==='match-speed'){matchController&&matchController.setSpeed(Number(target.dataset.speed));return;}
    if(action==='match-skip'){matchController&&matchController.skipRound();return;}
    if(action==='match-finish'){matchController&&matchController.simulateToEnd();return;}
    if(action==='tournament-details'){openTournamentDetails(target.dataset.tournamentId);return;}
  }

  function handleInput(event) {
    const target=event.target;
    if(target.closest('#org-form'))updateOrgPreview();
    if(target.dataset.setting==='musicVolume'){
      const value=Math.max(0,Math.min(100,Number(target.value)||0));
      if(gameState&&gameState.settings){
        gameState.settings.musicVolume=value;
        const out=document.getElementById('music-volume-value');
        if(out)out.textContent=`${value}%`;
        updateBackgroundMusicVolume();
        autosave();
      }
      return;
    }
    if(target.dataset.training){
      gameState.training.allocations[target.dataset.training]=Number(target.value);
      gameState.training.confirmedWeek=0;
      clearDashboardHint();
      const val=document.getElementById(`training-value-${target.dataset.training}`);if(val)val.textContent=`${target.value}%`;
      const total=Object.values(gameState.training.allocations).reduce((s,v)=>s+Number(v),0);
      const totalEl=document.getElementById('training-total');if(totalEl){totalEl.textContent=`${total}%`;totalEl.className=`allocation-total ${total===100?'acid':'danger'}`;}
      const effectEl=document.getElementById('training-effects');if(effectEl)effectEl.innerHTML=trainingEffectsHTML(calculateTrainingEffects(gameState.training.allocations));
      const tag=document.querySelector('.training-layout .tag');if(tag){tag.textContent=`${total}% / 100%`;tag.className=`tag ${total===100?'tag-acid':'tag-danger'}`;}
    }
    if(target.dataset.tacticRange){
      gameState.tactics[target.dataset.tacticRange]=Number(target.value);gameState.tactics.confirmedWeek=0;
      clearDashboardHint();
      const el=document.getElementById(`tactic-value-${target.dataset.tacticRange}`);if(el)el.textContent=target.value;
    }
  }

  function handleChange(event) {
    const target=event.target;
    if(target.dataset.filter){gameState.ui.filters[target.dataset.filter]=target.value;}
    if(target.dataset.setting){
      const key=target.dataset.setting;
      if(key==='musicVolume'){
        gameState.settings.musicVolume=Math.max(0,Math.min(100,Number(target.value)||0));
        updateBackgroundMusicVolume();
        autosave();
        toast('Громкость музыки изменена');
        return;
      }
      gameState.settings[key]=target.type==='checkbox'?target.checked:Number(target.value)||target.value;
      autosave();renderApp();toast('Настройка изменена');
    }
  }

  function handleSubmit(event) {
    if(event.target.id==='org-form'){
      event.preventDefault();
      const form=new FormData(event.target);
      const config={name:form.get('name'),tag:form.get('tag'),region:form.get('region'),arena:form.get('arena'),primaryColor:form.get('primaryColor'),secondaryColor:form.get('secondaryColor'),logoType:form.get('logoType')};
      if(!config.name.trim()||!config.arena.trim()||!/^[A-Za-zА-Яа-я0-9]{2,5}$/.test(config.tag)){toast('Проверьте название, арену и тег организации.','error');return;}
      gameState=normalizeState(D.createNewGame(config));currentView='dashboard';saveGame(false);renderApp();toast('Организация создана. Добро пожаловать в Core League.');return;
    }
    if(event.target.id==='contract-form'){
      event.preventDefault();submitContract(event.target);return;
    }
    if(event.target.id==='transfer-offer-form'){
      event.preventDefault();submitTransferOffer(event.target);return;
    }
  }

  function updateOrgPreview() {
    const form=document.getElementById('org-form');if(!form)return;
    const data=new FormData(form);
    document.querySelectorAll('.color-control').forEach(control=>{const input=control.querySelector('input');const span=control.querySelector('span');if(input&&span)span.textContent=input.value.toUpperCase();});
    const preview=document.getElementById('org-preview');if(preview)preview.innerHTML=organizationPreviewHTML(data.get('name'),data.get('tag'),data.get('primaryColor'),data.get('secondaryColor'),data.get('logoType'),data.get('region'));
  }

  function readTransferFilters() {
    document.querySelectorAll('[data-filter]').forEach(input=>{gameState.ui.filters[input.dataset.filter]=input.value;});
  }

  function confirmDeleteSave() {
    openModal('Удаление сохранения',`<div class="stack"><p>Удалить текущую карьеру? Это действие нельзя отменить.</p><div class="row"><button class="btn btn-danger" data-action="confirm-delete-save">Удалить навсегда</button><button class="btn" data-action="close-modal">Отмена</button></div></div>`);
    const button=modalRoot.querySelector('[data-action="confirm-delete-save"]');
    if(button)button.addEventListener('click',()=>{S.remove();gameState=null;currentView='menu';closeModal();renderApp();toast('Сохранение удалено');},{once:true});
  }

  function chooseAcademyCandidate(playerId) {
    const team=getUserTeam();
    team.academy=team.academy||[];
    const candidates=gameState.ui&&Array.isArray(gameState.ui.academyCandidates)?gameState.ui.academyCandidates:[];
    const player=candidates.find((item)=>item.id===playerId);
    if(!player)return;
    if(team.academy.length>=MAX_ACADEMY_PLAYERS){toast('Академия заполнена. Сначала освободите место.','error');return;}
    player.teamId=team.id;player.inAcademy=true;player.pendingGraduation=false;player.status='Академия';player.isStarter=false;player.listed=false;player.joinedWeek=gameState.season.week;
    team.academy.push(player);
    gameState.ui.academyCandidates=[];
    gameState.news.unshift(D.makeNews(`news-academy-choice-${Date.now()}`,gameState.season.week,`${player.nickname} присоединился к академии`,`${team.name} выбрала ${player.age}-летнего игрока роли «${player.role}» с потенциалом ${player.potential}.`,'academy'));
    autosave();closeModal();currentView='academy';gameState.lastView=currentView;renderApp();toast(`${player.nickname} добавлен в академию`);
  }

  function promoteAcademyPlayer(playerId) {
    const team=getUserTeam();
    if(team.players.length>=MAX_SENIOR_ROSTER){toast('В основном составе уже 7 игроков. Освободите место или замените одного из запасных.','error');return;}
    let player=null;
    let index=(team.academy||[]).findIndex((item)=>item.id===playerId);
    if(index>=0)player=team.academy.splice(index,1)[0];
    if(!player){index=(team.academyGraduates||[]).findIndex((item)=>item.id===playerId);if(index>=0)player=team.academyGraduates.splice(index,1)[0];}
    if(!player)return;
    player.inAcademy=false;player.pendingGraduation=false;player.status='Запасной';player.isStarter=false;player.listed=false;player.contractWeeks=Math.max(24,Number(player.contractWeeks||0));
    if(!player.salary)player.salary=Math.max(500,Math.round((player.overall*player.overall*.55)/50)*50);
    team.players.push(player);team.chemistry=D.clamp(team.chemistry-2,0,100);team.rosterChangedWeek=gameState.season.week;
    autosave();closeModal();renderApp();toast(`${player.nickname} переведён в основной состав`);
  }

  function moveSeniorPlayerToAcademy(playerId) {
    const team=getUserTeam();
    const player=team.players.find((item)=>item.id===playerId);
    if(!player)return;
    if(Number(player.age||99)>18){toast('Игроков 19 лет и старше нельзя переводить в академию.','error');return;}
    team.academy=team.academy||[];
    if(team.academy.length>=MAX_ACADEMY_PLAYERS){toast('Академия заполнена. Сначала освободите место.','error');return;}
    const wasStarter=player.isStarter;
    team.players=team.players.filter((item)=>item.id!==playerId);
    player.inAcademy=true;player.pendingGraduation=false;player.isStarter=false;player.status='Академия';player.listed=false;player.academyYears=Number(player.academyYears||0);player.academyWeeks=Number(player.academyWeeks||0);player.academyProgress=player.academyProgress||{};
    team.academy.push(player);
    if(wasStarter)promoteBestReserve(team);
    team.chemistry=D.clamp(team.chemistry-1,0,100);team.rosterChangedWeek=gameState.season.week;
    autosave();closeModal();renderApp();toast(`${player.nickname} переведён в академию`);
  }

  function releaseAcademyPlayer(playerId) {
    const team=getUserTeam();
    let player=removeTeamMember(team,playerId);
    if(!player)return;
    player.teamId=null;player.inAcademy=false;player.pendingGraduation=false;player.isStarter=false;player.status='Свободный агент';player.listed=false;player.contractWeeks=0;player.salary=Math.max(500,Number(player.salary||500));
    gameState.freeAgents.push(player);
    autosave();closeModal();renderApp();toast(`${player.nickname} стал свободным агентом`,'warning');
  }

  function openGraduateReplacementModal(playerId) {
    const team=getUserTeam();
    const graduate=(team.academyGraduates||[]).find((item)=>item.id===playerId);
    if(!graduate)return;
    const reserves=team.players.filter((player)=>!player.isStarter);
    if(!reserves.length){toast('В составе нет запасного игрока для замены.','error');return;}
    openModal('ЗАМЕНА ЗАПАСНОГО',`<div class="stack"><div class="warning-item">Выберите запасного игрока, который покинет клуб. ${escapeHTML(graduate.nickname)} займёт его место в основном составе.</div><div class="transfer-list">${reserves.map((reserve)=>`<div class="transfer-card"><div class="transfer-avatar">${playerAvatarSVG(reserve,team.primaryColor)}</div><div class="transfer-name"><strong>${escapeHTML(reserve.nickname)}</strong><small>${escapeHTML(reserve.role)} · ${reserve.overall} OVR · ${reserve.age} лет</small></div><div class="transfer-stats"><div class="transfer-stat"><strong>${D.money(reserve.value)}</strong><small>Стоимость</small></div></div><div></div><button class="btn btn-danger btn-sm" data-action="confirm-graduate-replacement" data-player-id="${graduate.id}" data-reserve-id="${reserve.id}">Заменить</button></div>`).join('')}</div></div>`,true);
  }

  function confirmGraduateReplacement(playerId,reserveId) {
    const team=getUserTeam();
    const graduateIndex=(team.academyGraduates||[]).findIndex((item)=>item.id===playerId);
    const reserveIndex=team.players.findIndex((item)=>item.id===reserveId&&!item.isStarter);
    if(graduateIndex<0||reserveIndex<0)return;
    const graduate=team.academyGraduates.splice(graduateIndex,1)[0];
    const reserve=team.players.splice(reserveIndex,1)[0];
    reserve.teamId=null;reserve.isStarter=false;reserve.status='Свободный агент';reserve.listed=false;reserve.contractWeeks=0;gameState.freeAgents.push(reserve);
    graduate.inAcademy=false;graduate.pendingGraduation=false;graduate.status='Запасной';graduate.isStarter=false;graduate.listed=false;graduate.contractWeeks=Math.max(24,Number(graduate.contractWeeks||0));if(!graduate.salary)graduate.salary=Math.max(500,Math.round((graduate.overall*graduate.overall*.55)/50)*50);
    team.players.push(graduate);team.chemistry=D.clamp(team.chemistry-3,0,100);team.rosterChangedWeek=gameState.season.week;
    autosave();closeModal();renderApp();toast(`${graduate.nickname} заменил ${reserve.nickname} в составе`);
  }

  function setStarter(playerId) {
    const team=getUserTeam();const player=team.players.find(p=>p.id===playerId);if(!player)return;
    if(Number(player.injuryMatches||0)>0){toast(`${player.nickname} травмирован и пропустит ещё ${player.injuryMatches} мат.`, 'warning');return;}
    if(player.isStarter){toast('Игрок уже находится в основном составе');return;}
    const starters=team.players.filter(p=>p.isStarter);
    if(starters.length>=5){const demote=starters.slice().sort((a,b)=>a.overall-b.overall)[0];demote.isStarter=false;demote.status='Запасной';}
    player.isStarter=true;player.status='Основной состав';team.chemistry=D.clamp(team.chemistry-3,0,100);team.rosterChangedWeek=gameState.season.week;
    autosave();closeModal();renderApp();toast(`${player.nickname} переведён в основной состав`);
  }

  function setReserve(playerId) {
    const team=getUserTeam();
    const player=team.players.find(p=>p.id===playerId);
    if(!player)return;
    if(!player.isStarter){toast('Игрок уже находится в запасе');return;}
    player.isStarter=false;
    player.status='Запасной';
    team.chemistry=D.clamp(team.chemistry-2,0,100);
    team.rosterChangedWeek=gameState.season.week;
    autosave();
    closeModal();
    renderApp();
    toast(`${player.nickname} переведён в запас`);
  }

  function toggleTransferList(playerId) {
    const location=teamMemberLocation(getUserTeam(),playerId);const player=location&&location.player;if(!player)return;
    player.listed=!player.listed;
    gameState.news.unshift(D.makeNews(`news-list-${Date.now()}`,gameState.season.week,`${player.nickname} ${player.listed?'выставлен на трансфер':'снят с трансфера'}`,player.listed?`Организация ${getUserTeam().tag} готова рассмотреть предложения по игроку.`:'Клуб решил прекратить поиск покупателя.','transfer'));
    autosave();closeModal();renderApp();toast(player.listed?'Игрок выставлен на трансфер':'Игрок снят с трансфера');
  }

  function toggleCompare(playerId) {
    const ids=gameState.ui.compareIds||[];
    const index=ids.indexOf(playerId);
    if(index>=0)ids.splice(index,1);else{if(ids.length>=2)ids.shift();ids.push(playerId);}
    gameState.ui.compareIds=ids;
    if(ids.length===2)openCompareModal();else openCompareModal();
  }

  function submitContract(form) {
    const player=D.findPlayer(gameState,form.dataset.playerId);if(!player)return;
    const data=new FormData(form);const salary=Number(data.get('salary'));const weeks=Number(data.get('weeks'));
    const team=getUserTeam();
    if(team.budget<salary){toast('Недостаточно средств для подписного бонуса.','error');return;}
    const minExpected=player.salary*(player.morale<45?1.18:0.95);
    const chance=D.clamp(0.62+(salary/minExpected-1)*0.55+(weeks>=36?0.12:-0.08)+(team.rank<=12?0.08:0),0.08,0.97);
    if(Math.random()>chance){player.morale=D.clamp(player.morale-5,0,100);closeModal();toast('Игрок отклонил предложение: условия показались недостаточными.','error');autosave();return;}
    team.budget-=salary;player.salary=salary;player.contractWeeks=weeks;player.morale=D.clamp(player.morale+6,0,100);
    gameState.finances.transactions.unshift({id:`tx-contract-${Date.now()}`,week:gameState.season.week,type:'expense',amount:salary,label:`Подписной бонус ${player.nickname}`});
    closeModal();autosave();renderApp();toast(`Контракт с ${player.nickname} продлён на ${weeks} недель`);
  }

  function submitTransferOffer(form) {
    const player=D.findPlayer(gameState,form.dataset.playerId);if(!player)return;
    const seller=D.findPlayerTeam(gameState,player.id);const user=getUserTeam();const data=new FormData(form);
    const fee=Number(data.get('fee')||0),salary=Number(data.get('salary')),weeks=Number(data.get('weeks')),status=data.get('status');
    const destination=transferDestination(player,user);
    if(destination==='blocked'){
      toast(Number(player.age||99)<=18?'Основной состав и академия заполнены. Освободите место перед завершением трансфера.':'В основном составе уже 7 игроков. Освободите место перед завершением трансфера.','error');
      return;
    }
    const upfront=fee+(seller?0:salary*2);
    if(user.budget<upfront){toast('Недостаточно средств для сделки.','error');return;}
    let reasons=[];let chance=0.55;
    if(seller){
      const location=teamMemberLocation(seller,player.id);
      const requiredFee=player.value*(player.listed?0.98+Math.random()*0.12:1.18+Math.random()*0.25)*(player.overall>=85?1.10:player.overall>=80?1.05:1);
      chance+=((fee/requiredFee)-1)*0.8;
      if(fee<requiredFee*0.88)reasons.push('слишком низкая сумма трансфера');
      if(location&&location.bucket==='players'&&seller.players.length<=5&&!player.listed){chance-=0.18;reasons.push('клуб не хочет терять игрока основы');}
    } else {
      chance+=0.12;
    }
    const salaryNeed=Math.max(500,Number(player.salary||500))*(player.morale<50?1.15:0.95);
    chance+=((salary/salaryNeed)-1)*0.6;
    if(salary<salaryNeed*0.9)reasons.push('низкая зарплата');
    if(weeks<30){chance-=0.12;reasons.push('слишком короткий контракт');}
    if(destination==='roster'&&status==='reserve'&&player.overall>=72){chance-=0.18;reasons.push('игрок не хочет быть запасным');}
    if(user.rank>18&&player.overall>=75){chance-=0.16;reasons.push('недостаточно высокий рейтинг организации');}
    chance=D.clamp(chance,0.04,0.96);
    const accepted=Math.random()<chance;
    const record={id:`out-${Date.now()}`,week:gameState.season.week,playerId:player.id,playerName:player.nickname,teamName:seller?seller.name:null,fee,salary,weeks,status:accepted?'Принято':'Отклонено',destination};
    gameState.transfers.outgoingOffers.unshift(record);
    if(!accepted){closeModal();toast(`Предложение отклонено: ${reasons[0]||'игрок выбрал другой вариант'}.`,'error');autosave();renderApp();return;}
    completeIncomingTransfer(player,seller,fee,salary,weeks,status,destination);
    closeModal();autosave();renderApp();showTransferSuccessModal('purchase',player,seller?fee:salary*2,seller,getUserTeam().primaryColor);
  }

  function completeIncomingTransfer(player,seller,fee,salary,weeks,status,destination) {
    const user=getUserTeam();
    const target=destination||transferDestination(player,user);
    if(target==='blocked')throw new Error('No roster or academy slot available');
    if(seller){
      const sellerLocation=teamMemberLocation(seller,player.id);
      removeTeamMember(seller,player.id);seller.budget+=fee;user.budget-=fee;
      gameState.finances.transactions.unshift({id:`tx-buy-${Date.now()}`,week:gameState.season.week,type:'expense',amount:fee,label:`Трансфер игрока ${player.nickname}`});
      if(sellerLocation&&sellerLocation.bucket==='players')refillAITeam(seller);
    }else{
      gameState.freeAgents=gameState.freeAgents.filter(p=>p.id!==player.id);const bonus=salary*2;user.budget-=bonus;
      gameState.finances.transactions.unshift({id:`tx-sign-${Date.now()}`,week:gameState.season.week,type:'expense',amount:bonus,label:`Подписной бонус свободному агенту ${player.nickname}`});
    }
    player.teamId=user.id;player.salary=salary;player.contractWeeks=weeks;player.listed=false;player.joinedWeek=gameState.season.week;player.morale=D.clamp(player.morale+7,0,100);player.pendingGraduation=false;
    if(target==='academy'){
      player.isStarter=false;player.inAcademy=true;player.status='Академия';player.academyYears=Number(player.academyYears||0);player.academyWeeks=Number(player.academyWeeks||0);player.academyProgress=player.academyProgress||{};user.academy=user.academy||[];user.academy.push(player);user.chemistry=D.clamp(user.chemistry-2,0,100);
    }else{
      player.inAcademy=false;
      const starters=user.players.filter(p=>p.isStarter);
      if(status==='starter'&&starters.length>=5){const demote=starters.slice().sort((a,b)=>a.overall-b.overall)[0];demote.isStarter=false;demote.status='Запасной';}
      player.isStarter=status==='starter'||starters.length<5;player.status=player.isStarter?'Основной состав':'Запасной';user.players.push(player);user.chemistry=D.clamp(user.chemistry-7,0,100);
    }
    user.rosterChangedWeek=gameState.season.week;
    gameState.transfers.history.unshift({id:`hist-${Date.now()}`,week:gameState.season.week,type:seller?'Покупка':'Подписание',playerName:player.nickname,amount:seller?fee:salary*2});
    gameState.news.unshift(D.makeNews(`news-sign-${Date.now()}`,gameState.season.week,`${user.name} подписала нового игрока`,target==='academy'?`${player.nickname} присоединился к клубу и зарегистрирован в академии.`:`${player.nickname} присоединился к команде на контракт сроком ${weeks} недель.`,'transfer'));
  }

  function refillAITeam(team) {
    if(team.players.length>=5)return;
    const candidate=gameState.freeAgents.slice().sort((a,b)=>b.overall-a.overall).find(p=>p.overall<=Math.round(D.teamAverage(team,'overall'))+5) || gameState.freeAgents[0];
    if(!candidate)return;
    gameState.freeAgents=gameState.freeAgents.filter(p=>p.id!==candidate.id);candidate.teamId=team.id;candidate.contractWeeks=36;candidate.isStarter=true;candidate.status='Основной состав';team.players.push(candidate);team.budget=Math.max(0,team.budget-candidate.salary*2);team.chemistry=D.clamp(team.chemistry-5,35,100);team.rosterChangedWeek=gameState.season.week;
  }

  function acceptIncomingOffer(offerId) {
    const offer=gameState.transfers.incomingOffers.find(o=>o.id===offerId);if(!offer)return;
    const user=getUserTeam();const location=teamMemberLocation(user,offer.playerId);const player=location&&location.player;const buyer=D.findTeam(gameState,offer.teamId);if(!player||!buyer)return;
    const buyerDestination=transferDestination(player,buyer);
    if(buyerDestination==='blocked'){
      gameState.transfers.incomingOffers=gameState.transfers.incomingOffers.filter((item)=>item.id!==offerId);
      autosave();renderApp();toast('Покупатель отозвал предложение: в клубе больше нет места для регистрации игрока.','warning');return;
    }
    removeTeamMember(user,player.id);user.budget+=offer.amount;buyer.budget=Math.max(0,buyer.budget-offer.amount);
    player.teamId=buyer.id;player.listed=false;player.pendingGraduation=false;
    if(buyerDestination==='academy'){player.inAcademy=true;player.isStarter=false;player.status='Академия';buyer.academy.push(player);}else{player.inAcademy=false;player.isStarter=buyer.players.filter(p=>p.isStarter).length<5;player.status=player.isStarter?'Основной состав':'Запасной';buyer.players.push(player);}
    if(location.bucket==='players')promoteBestReserve(user);user.chemistry=D.clamp(user.chemistry-(location.bucket==='players'?6:2),0,100);user.rosterChangedWeek=gameState.season.week;
    gameState.transfers.incomingOffers=gameState.transfers.incomingOffers.filter(o=>o.id!==offerId);gameState.transfers.history.unshift({id:`hist-${Date.now()}`,week:gameState.season.week,type:'Продажа',playerName:player.nickname,amount:offer.amount});gameState.finances.transactions.unshift({id:`tx-sale-${Date.now()}`,week:gameState.season.week,type:'income',amount:offer.amount,label:`Продажа игрока ${player.nickname}`});
    gameState.news.unshift(D.makeNews(`news-sale-${Date.now()}`,gameState.season.week,`${player.nickname} переходит в ${buyer.name}`,`${user.name} получила ${D.money(offer.amount)} за трансфер.`,'transfer'));
    autosave();renderApp();showTransferSuccessModal('sale',player,offer.amount,buyer,buyer.primaryColor);
  }

  function rejectIncomingOffer(offerId) {
    gameState.transfers.incomingOffers=gameState.transfers.incomingOffers.filter(o=>o.id!==offerId);autosave();renderApp();toast('Предложение отклонено');
  }

  function promoteBestReserve(team) {
    const starters=team.players.filter(p=>p.isStarter);if(starters.length>=5)return;
    team.players.filter(p=>!p.isStarter).sort((a,b)=>b.overall-a.overall).slice(0,5-starters.length).forEach(p=>{p.isStarter=true;p.status='Основной состав';});
  }

  function confirmTraining() {
    const total=Object.values(gameState.training.allocations).reduce((s,v)=>s+Number(v),0);
    if(total!==100){toast(`Сейчас распределено ${total}%. Нужно ровно 100%.`,'error');return;}
    gameState.training.confirmedWeek=gameState.season.week;gameState.ui.dashboardHint='training';autosave();toast('План тренировок подтверждён');renderApp();
  }

  function prepareMatch() {
    const entry=currentEntry();
    if(!entry||!entry.match){toast('На этой неделе нет матча.','warning');return;}
    if(entry.match.status==='completed'){currentView='postmatch';renderApp();return;}
    const availableLineup=Sim.starterLineup(getUserTeam());
    if(availableLineup.length!==5){currentView='roster';renderApp();toast('Для матча нужны пять доступных игроков. Подпишите запасного или освободите место для усиления состава.','error');return;}
    const emergencyAcademy=availableLineup.filter((player)=>player.inAcademy);
    if(emergencyAcademy.length)toast(`Из-за травм временно вызваны из академии: ${emergencyAcademy.map((player)=>player.nickname).join(', ')}.`,'warning',5200);
    if(gameState.tactics.confirmedWeek!==gameState.season.week){currentView='tactics';renderApp();toast('Сначала подтвердите тактику на текущую неделю.','warning');return;}
    if(applyComebackTrainingIfNeeded(entry))return;
    currentView='veto';vetoState=null;renderApp();
  }

  function handleVetoMap(mapId) {
    const entry=currentEntry();if(!entry||!entry.match||vetoState.ready)return;
    const team=getUserTeam(),opponent=getOpponentFromEntry(entry);
    const allIds=D.MAPS.map(m=>m.id);
    const isUnavailable=(id)=>vetoState.userBans.includes(id)||vetoState.aiBans.includes(id)||vetoState.userPicks.includes(id)||vetoState.aiPicks.includes(id);
    if(isUnavailable(mapId))return;

    if(entry.match.format==='BO1'){
      if(vetoState.userBans.length>=2)return;
      vetoState.userBans.push(mapId);
      const remaining=allIds.filter(id=>!isUnavailable(id));
      const threat=(id)=>(team.mapSkill[id]-opponent.mapSkill[id])+(id===preferredMapId()?3:0);
      const aiBan=remaining.slice().sort((a,b)=>threat(b)-threat(a))[0];
      if(aiBan)vetoState.aiBans.push(aiBan);
      if(vetoState.userBans.length===2){
        vetoState.maps=allIds.filter(id=>!isUnavailable(id));
        vetoState.ready=vetoState.maps.length===1;
      }
    }else{
      if(vetoState.userBans.length===0){
        vetoState.userBans=[mapId];
        const remaining=allIds.filter(id=>!isUnavailable(id));
        const threat=(id)=>(team.mapSkill[id]-opponent.mapSkill[id])+(id===preferredMapId()?3:0);
        const aiBan=remaining.slice().sort((a,b)=>threat(b)-threat(a))[0];
        if(aiBan)vetoState.aiBans=[aiBan];
      }else if(vetoState.userPicks.length===0){
        vetoState.userPicks=[mapId];
        const remaining=allIds.filter(id=>!isUnavailable(id));
        const aiPick=remaining.slice().sort((a,b)=>opponent.mapSkill[b]-opponent.mapSkill[a])[0];
        if(aiPick)vetoState.aiPicks=[aiPick];
        const decider=allIds.find(id=>!isUnavailable(id));
        vetoState.maps=[mapId,aiPick,decider].filter(Boolean);
        vetoState.ready=vetoState.maps.length===3;
      }
    }
    vetoState.poolSize=D.MAPS.length;
    entry.match.veto=JSON.parse(JSON.stringify(vetoState));autosave();renderApp();
  }

  function startMatch() {
    const entry=currentEntry();if(!entry||!entry.match||!vetoState||!vetoState.ready)return;
    const team=getUserTeam(),opponent=getOpponentFromEntry(entry);
    currentView='match';
    renderMatchScreen();
    matchController=new Sim.MatchController({
      state:gameState,teamA:team,teamB:opponent,maps:vetoState.maps,format:entry.match.format,tacticsA:gameState.tactics,tacticsB:getMatchAITactics(entry.match),powerBonusA:Number(entry.match.comebackPowerBonus||0),powerBonusB:0,
      onUpdate:updateMatchHUD,onEvent:appendMatchEvent,onMapComplete:appendMapComplete,
      onComplete:(result)=>{matchController=null;autosave();currentView='postmatch';renderApp();toast(result.winnerId===gameState.userTeamId?'Матч завершён победой':'Матч завершён поражением',result.winnerId===gameState.userTeamId?'':'warning');}
    });
    setTimeout(()=>matchController&&matchController.start(),350);
  }

  function createSeasonObjectives() {
    return [
      { id: 'top10', text: 'Войти в топ-10 мирового рейтинга', done: false },
      { id: 'chem70', text: 'Поднять химию до 70', done: false },
      { id: 'world', text: 'Выиграть MAJOR MASTERS DIVISION', done: false }
    ];
  }

  function buildSeasonSummaryForState(state) {
    const team = D.getUserTeam(state);
    const matches = (state.season.calendar || []).filter((entry) => entry.match && entry.match.status === 'completed' && entry.match.result);
    const wins = matches.filter((entry) => entry.match.result.winnerId === state.userTeamId).length;
    const world = (state.tournaments || []).find((tournament) => tournament.id === 'world');
    return {
      number: Number(state.season.number || 1),
      completedAt: Date.now(),
      finalRank: Number(team.rank || 24),
      ratingPoints: Math.round(Number(team.ratingPoints || 0)),
      budget: Math.round(Number(team.budget || 0)),
      chemistry: Math.round(Number(team.chemistry || 0)),
      matches: matches.length,
      wins,
      losses: matches.length - wins,
      objectivesDone: (state.season.objectives || []).filter((objective) => objective.done).length,
      championId: state.season.championId || null,
      worldWinnerId: world ? world.winnerId : null,
      results: matches.map((entry) => ({
        week: entry.week,
        opponentId: entry.match.opponentId,
        tournamentId: entry.match.tournamentId,
        tournamentName: entry.match.tournamentName,
        format: entry.match.format,
        winnerId: entry.match.result.winnerId,
        mapsWonA: entry.match.result.mapsWonA,
        mapsWonB: entry.match.result.mapsWonB,
        mapResults: (entry.match.result.mapResults || []).map((map) => ({ mapId: map.mapId, scoreA: map.scoreA, scoreB: map.scoreB, winnerId: map.winnerId }))
      })),
      playerStats: team.players.map((player) => ({
        id: player.id,
        nickname: player.nickname,
        overall: player.overall,
        stats: Object.assign({}, player.stats || {})
      }))
    };
  }

  function buildSeasonSummary() {
    return buildSeasonSummaryForState(gameState);
  }

  function archiveCurrentSeason() {
    gameState.career = gameState.career || { maxSeasons: D.MAX_SEASONS || 5, completedSeasons: [] };
    gameState.career.completedSeasons = Array.isArray(gameState.career.completedSeasons) ? gameState.career.completedSeasons : [];
    const summary = buildSeasonSummary();
    gameState.season.summary = summary;
    const existingIndex = gameState.career.completedSeasons.findIndex((item) => Number(item.number) === Number(summary.number));
    if (existingIndex >= 0) gameState.career.completedSeasons[existingIndex] = summary;
    else gameState.career.completedSeasons.push(summary);
    gameState.career.completedSeasons.sort((a,b) => a.number - b.number);
    return summary;
  }

  function finishCurrentSeason() {
    gameState.season.completed = true;
    D.updateRanks(gameState, false);
    applySeasonRankCategories(gameState);
    gameState.season.championId = [...gameState.teams].sort((a,b) => a.rank - b.rank)[0].id;
    updateObjectives();
    const summary = archiveCurrentSeason();
    const champion = D.findTeam(gameState, summary.championId);
    gameState.news.unshift(D.makeNews(`news-season-${Date.now()}`,gameState.season.week,`${champion.name} завершает сезон на первом месте`,`Финальный мировой рейтинг зафиксирован. ${getUserTeam().name} занимает позицию #${getUserTeam().rank}.`,'season'));
    return summary;
  }

  function resetPlayerSeasonStats(player, agePlayers) {
    if (agePlayers) player.age = Number(player.age || 18) + 1;
    player.stats = { matches: 0, maps: 0, kills: 0, deaths: 0, assists: 0, adr: 0, firstKills: 0, clutches: 0, utility: 0, rating: 0 };
    player.fatigue = D.clamp(Number(player.fatigue || 0) - 18, 0, 100);
    player.morale = D.clamp(Math.round(Number(player.morale || 50) * .75 + 50 * .25), 0, 100);
    player.form = D.clamp(Math.round(Number(player.form || 50) * .55 + 50 * .45), 20, 98);
    player.value = D.calculateMarketValue(player.overall, player.potential, player.age);
  }

  function staffRating(team,key,fallback) {
    return Number(team&&team.staff&&team.staff[key]&&team.staff[key].rating||fallback||55);
  }

  function academyTrainingKeys(player) {
    const byRole={
      'Снайпер':['aim','reaction'],
      'Капитан':['tactics','communication'],
      'Энтри':['reaction','aim'],
      'Люркер':['positioning','composure'],
      'Саппорт':['utility','communication'],
      'Рифлер':['aim','reaction'],
      'Универсал':['positioning','tactics']
    };
    return byRole[player.role]||['aim','tactics'];
  }

  function developAcademyPlayer(player,team) {
    player.academyProgress=player.academyProgress||{};
    player.academyWeeks=Number(player.academyWeeks||0)+1;
    const coach=staffRating(team,'coach',58);
    const ageFactor={14:1.25,15:1.17,16:1.08,17:.96,18:.84}[Number(player.age)]||.82;
    const potentialFactor=D.clamp(.70+(Number(player.potential||player.overall)-Number(player.overall||50))/48,.72,1.38);
    const overallFactor=D.clamp(1.22-(Number(player.overall||50)-45)/72,.42,1.22);
    const coachFactor=.76+coach/205;
    const seasonFactor=1+Number(player.academyYears||0)*.055;
    const randomFactor=.88+Math.random()*.24;
    const base=.105*ageFactor*potentialFactor*overallFactor*coachFactor*seasonFactor*randomFactor;
    const keys=academyTrainingKeys(player);
    const changes=[{key:keys[0],value:base*1.08},{key:keys[1],value:base*.86}];
    if(Math.random()<.32){
      const extra=D.ATTRS.map(([key])=>key).filter((key)=>!keys.includes(key));
      changes.push({key:extra[Math.floor(Math.random()*extra.length)],value:base*.48});
    }
    changes.forEach((item)=>{
      const value=Number(item.value.toFixed(3));
      player.academyProgress[item.key]=Number(player.academyProgress[item.key]||0)+value;
      while(player.academyProgress[item.key]>=1&&player.attrs[item.key]<98){player.attrs[item.key]+=1;player.academyProgress[item.key]-=1;}
      item.value=value;
    });
    const calculated=D.calculateOverall(player.attrs,player.role);
    player.overall=Math.min(84,calculated);
    const relevant=keys.map((key)=>Number(player.academyProgress[key]||0));
    player.academyOvrProgress=D.clamp(Math.round((relevant.reduce((sum,value)=>sum+value,0)/Math.max(1,relevant.length))*100),0,99);
    player.value=D.calculateMarketValue(player.overall,player.potential,player.age);
    player.lastDevelopment={week:gameState.season.week,season:gameState.season.number,changes,progress:player.academyOvrProgress};
    player.fatigue=D.clamp(Number(player.fatigue||0)-1,0,100);
    player.morale=D.clamp(Number(player.morale||60)+.2,0,100);
  }

  function processAcademyDevelopmentWeek() {
    gameState.teams.forEach((team)=>{
      (team.academy||[]).forEach((player)=>developAcademyPlayer(player,team));
      if(!team.isUser){
        const psych=staffRating(team,'psychologist',55);
        const physio=staffRating(team,'physio',55);
        const assistant=team.staff&&team.staff.assistant;
        team.chemistry=D.clamp(Number(team.chemistry||50)+.12+(psych-50)*.006,35,100);
        team.players.forEach((player)=>{
          player.morale=D.clamp(Number(player.morale||50)+.1+(psych-50)*.008,0,100);
          player.fatigue=D.clamp(Number(player.fatigue||0)-(.4+(physio-50)*.025),0,100);
        });
        if(assistant&&assistant.mapId&&team.mapSkill[assistant.mapId]!=null){team.mapSkill[assistant.mapId]=D.clamp(Number(team.mapSkill[assistant.mapId])+.16+(Number(assistant.rating||50)-50)*.008,35,98);}
      }
    });
  }

  function resolveAIAcademyGraduate(team,player) {
    const worst=[...(team.players||[])].sort((a,b)=>a.overall-b.overall)[0];
    if(team.players.length<MAX_SENIOR_ROSTER||worst&&player.overall>=worst.overall+3){
      if(team.players.length>=MAX_SENIOR_ROSTER&&worst){
        team.players=team.players.filter((item)=>item.id!==worst.id);worst.teamId=null;worst.isStarter=false;worst.status='Свободный агент';worst.listed=false;worst.contractWeeks=0;gameState.freeAgents.push(worst);
      }
      player.inAcademy=false;player.pendingGraduation=false;player.status='Запасной';player.isStarter=false;player.contractWeeks=36;player.salary=Math.max(500,Math.round((player.overall*player.overall*.55)/50)*50);team.players.push(player);
    }else{
      player.teamId=null;player.inAcademy=false;player.pendingGraduation=false;player.status='Свободный агент';player.listed=false;player.contractWeeks=0;player.salary=Math.max(500,Math.round((player.overall*player.overall*.5)/50)*50);gameState.freeAgents.push(player);team.budget+=Math.round(player.value*.35/5000)*5000;
    }
  }

  function prepareAcademiesForNewSeason(nextNumber,nextSeed) {
    const user=getUserTeam();
    gameState.teams.forEach((team)=>{
      team.academy=team.academy||[];team.academyGraduates=team.academyGraduates||[];
      const graduates=[];
      team.academy.forEach((player)=>{
        player.age=Number(player.age||18)+1;player.academyYears=Number(player.academyYears||0)+1;player.value=D.calculateMarketValue(player.overall,player.potential,player.age);
        if(player.age>=19)graduates.push(player);
      });
      team.academy=team.academy.filter((player)=>player.age<19);
      graduates.forEach((player)=>{
        if(team.isUser){player.inAcademy=false;player.pendingGraduation=true;player.isStarter=false;player.status='Требуется решение';player.listed=false;team.academyGraduates.push(player);}
        else resolveAIAcademyGraduate(team,player);
      });
      if(!team.isUser){
        const candidates=D.createAcademyCandidates(gameState,team.id,nextNumber,3,nextSeed+Number(team.id.replace(/\D/g,''))*101);
        if(team.academy.length>=MAX_ACADEMY_PLAYERS){
          const weakest=[...team.academy].sort((a,b)=>(a.potential+a.overall)-(b.potential+b.overall))[0];
          if(weakest){team.academy=team.academy.filter((item)=>item.id!==weakest.id);weakest.teamId=null;weakest.inAcademy=false;weakest.status='Свободный агент';weakest.salary=500;gameState.freeAgents.push(weakest);}
        }
        const chosen=candidates.sort((a,b)=>(b.potential*.6+b.overall*.4)-(a.potential*.6+a.overall*.4))[0];
        if(chosen&&team.academy.length<MAX_ACADEMY_PLAYERS){chosen.teamId=team.id;chosen.inAcademy=true;chosen.status='Академия';team.academy.push(chosen);}
      }
    });
    gameState.career.academyCandidateSeasons=Array.isArray(gameState.career.academyCandidateSeasons)?gameState.career.academyCandidateSeasons:[];
    if(!gameState.career.academyCandidateSeasons.includes(nextNumber)){
      gameState.ui.academyCandidates=D.createAcademyCandidates(gameState,user.id,nextNumber,3,nextSeed+8181);
      gameState.ui.academyCandidateSeason=nextNumber;
      gameState.career.academyCandidateSeasons.push(nextNumber);
    }
  }

  function processAIAcademyManagement(team) {
    team.academy=team.academy||[];
    if(team.academy.length>=MAX_ACADEMY_PLAYERS&&Math.random()<.12){
      const weak=[...team.academy].sort((a,b)=>(a.potential+a.overall)-(b.potential+b.overall))[0];
      if(weak){team.academy=team.academy.filter((item)=>item.id!==weak.id);weak.teamId=null;weak.inAcademy=false;weak.status='Свободный агент';weak.salary=500;gameState.freeAgents.push(weak);}
    }
    const prospect=[...team.academy].sort((a,b)=>b.overall-a.overall)[0];
    const worst=[...team.players].sort((a,b)=>a.overall-b.overall)[0];
    if(prospect&&worst&&prospect.overall>=worst.overall+3&&Math.random()<.22){
      team.academy=team.academy.filter((item)=>item.id!==prospect.id);
      if(team.players.length>=MAX_SENIOR_ROSTER){team.players=team.players.filter((item)=>item.id!==worst.id);worst.teamId=null;worst.isStarter=false;worst.status='Свободный агент';worst.contractWeeks=0;gameState.freeAgents.push(worst);}
      prospect.inAcademy=false;prospect.status='Запасной';prospect.isStarter=false;prospect.contractWeeks=36;prospect.salary=Math.max(500,Math.round((prospect.overall*prospect.overall*.55)/50)*50);team.players.push(prospect);team.rosterChangedWeek=gameState.season.week;
    }
  }

  function startNewSeason() {
    if (!gameState || !gameState.season.completed) {
      toast('Сначала завершите текущий сезон.','warning');
      return;
    }
    if (gameState.ui && Array.isArray(gameState.ui.academyCandidates) && gameState.ui.academyCandidates.length) {
      currentView = 'academy';
      gameState.lastView = currentView;
      renderApp();
      toast('Сначала выберите одного из кандидатов текущего сезона.','warning');
      setTimeout(()=>showAcademyCandidatesModal(),80);
      return;
    }
    if ((getUserTeam().academyGraduates || []).length) {
      currentView = 'academy';
      gameState.lastView = currentView;
      renderApp();
      toast('Сначала решите будущее игроков, достигших предельного возраста академии.','warning');
      return;
    }
    const maxSeasons = Number(gameState.career && gameState.career.maxSeasons || D.MAX_SEASONS || 5);
    const currentNumber = Number(gameState.season.number || 1);
    if (currentNumber >= maxSeasons) {
      toast('Все сезоны карьеры уже завершены.','warning');
      return;
    }

    if (!gameState.season.summary) archiveCurrentSeason();
    const nextNumber = currentNumber + 1;
    const agePlayers = nextNumber > 1 && nextNumber % 2 === 1;

    gameState.teams.forEach((team) => {
      team.history = [];
      team.winStreak = 0;
      team.lossStreak = 0;
      team.previousRank = team.rank;
      team.ratingPoints = Math.round(1000 + (Number(team.ratingPoints || 1000) - 1000) * .88);
      team.players.forEach((player) => resetPlayerSeasonStats(player, agePlayers));
    });
    gameState.freeAgents.forEach((player) => resetPlayerSeasonStats(player, agePlayers));
    D.updateRanks(gameState);

    const nextSeed = Number(gameState.seed || Date.now()) + nextNumber * 9973;
    gameState.seed = nextSeed;
    gameState.career.freeAgentSeasons = Array.isArray(gameState.career.freeAgentSeasons) ? gameState.career.freeAgentSeasons : [];
    const alreadyGenerated = gameState.career.freeAgentSeasons.includes(nextNumber);
    const newFreeAgents = alreadyGenerated ? [] : D.createSeasonFreeAgents(gameState, nextNumber, 20, nextSeed + 404);
    if (newFreeAgents.length) {
      gameState.freeAgents.push(...newFreeAgents);
      gameState.career.freeAgentSeasons.push(nextNumber);
      gameState.career.freeAgentSeasons.sort((a,b) => a - b);
    }
    gameState.season = {
      number: nextNumber,
      week: 1,
      maxWeek: 24,
      calendar: D.createCalendar(gameState.teams, gameState.userTeamId, nextSeed),
      completed: false,
      championId: null,
      rankBaseline: Object.fromEntries(gameState.teams.map((team) => [team.id, team.rank])),
      objectives: createSeasonObjectives(),
      summary: null
    };
    prepareAcademiesForNewSeason(nextNumber,nextSeed);
    gameState.teams.forEach((team)=>{team.previousRank=team.rank;});
    gameState.tournaments = D.TOURNAMENTS.map((tournament) => ({
      ...tournament,
      stage: 'Ожидание',
      standings: [],
      participantIds: [],
      bracket: [],
      swissRounds: [],
      qualifierIds: [],
      winnerId: null,
      rewarded: false,
      ratingRewarded: false,
      friendlyScheduled: false,
      friendlyWeek: null,
      processedWeeks: [],
      engineVersion: null
    }));
    gameState.training.confirmedWeek = 0;
    gameState.tactics.confirmedWeek = 0;
    gameState.transfers.incomingOffers = [];
    gameState.transfers.outgoingOffers = [];
    gameState.ui.compareIds = [];
    gameState.ui.headerNotification = null;
    gameState.ui.dashboardHint = null;
    gameState.lastMatch = null;
    if (newFreeAgents.length) gameState.news.unshift(D.makeNews(`news-free-agents-${Date.now()}`,1,'На рынок вышли новые свободные агенты',`${newFreeAgents.length} игроков доступны для подписания в разделе «Трансферы».`,'transfer'));
    gameState.news.unshift(D.makeNews(`news-season-start-${Date.now()}`,1,`Начинается сезон ${nextNumber}`,`${getUserTeam().name} сохраняет состав и продолжает борьбу за первое место мирового рейтинга.`,'season'));
    currentView = 'dashboard';
    gameState.lastView = currentView;
    updateTournamentStates(false);
    closeModal();
    saveGame(false);
    renderApp();
    toast(newFreeAgents.length ? `Сезон ${nextNumber} начался. На рынке появилось ${newFreeAgents.length} новых свободных агентов.` : `Сезон ${nextNumber} начался. Календарь и турниры обновлены.`);
    if(gameState.ui&&Array.isArray(gameState.ui.academyCandidates)&&gameState.ui.academyCandidates.length)setTimeout(()=>showAcademyCandidatesModal(),120);
  }

  function endWeek() {
    if(gameState.season.completed){toast('Сезон уже завершён. Итоги доступны на главной странице.','warning');return;}
    const entry=currentEntry();const team=getUserTeam();
    const total=Object.values(gameState.training.allocations).reduce((s,v)=>s+Number(v),0);
    if(total!==100||gameState.training.confirmedWeek!==gameState.season.week){currentView='training';renderApp();toast('Подтвердите план тренировок с суммой 100%.','warning');return;}
    if(team.players.filter(p=>p.isStarter).length!==5){currentView='roster';renderApp();toast('Выберите ровно пять игроков основного состава.','error');return;}
    if(entry.match&&entry.match.status!=='completed'){prepareMatch();toast('Сначала проведите запланированный матч.','warning');return;}
    if(entry.match&&gameState.tactics.confirmedWeek!==gameState.season.week){currentView='tactics';renderApp();toast('Подтвердите тактику перед завершением матчевой недели.','warning');return;}

    applyTrainingWeek();
    processAcademyDevelopmentWeek();
    processWeeklyFinances();
    processContracts();
    generateIncomingOffers();
    Sim.simulateAIWeek(gameState);
    processAITeamManagement();
    updateTournamentStates(true);
    entry.completed=true;
    entry.events.push('Тренировки применены','Зарплаты выплачены','Доход начислен');
    updateObjectives();

    if(gameState.season.week>=gameState.season.maxWeek){
      finishCurrentSeason();
      saveGame(false);currentView='dashboard';renderApp();showSeasonSummary();return;
    }

    gameState.season.week+=1;
    D.captureRankBaseline(gameState);
    gameState.ui.compareIds=[];
    saveGame(false);currentView='dashboard';renderApp();toast(`Началась ${gameState.season.week}-я игровая неделя`);
  }

  function applyTrainingWeek() {
    const team=getUserTeam();const a=gameState.training.allocations;const effects=calculateTrainingEffects(a);
    const coachRating=staffRating(team,'coach',58);
    const psychologistRating=staffRating(team,'psychologist',55);
    const physioRating=staffRating(team,'physio',55);
    const coachMultiplier=.82+coachRating/210;
    const moraleSupport=.12+Math.max(0,psychologistRating-45)*.014;
    const chemistrySupport=.18+Math.max(0,psychologistRating-45)*.012;
    const fatigueRecovery=.45+Math.max(0,physioRating-45)*.05;
    team.players.forEach(player=>{
      if(!player.trainingProgress)player.trainingProgress={};
      const ageFactor=player.age<=20?1.28:player.age<=23?1.08:player.age<=27?.82:player.age<=30?.55:.28;
      const potentialFactor=D.clamp((player.potential-player.overall)/14,.25,1.25);
      const levelFactor=D.clamp((92-player.overall)/32,.18,1.1);
      const factor=ageFactor*potentialFactor*levelFactor;
      const additions={
        aim:a.aim*.017*factor*coachMultiplier,
        reaction:a.aim*.013*factor*coachMultiplier,
        tactics:a.tactics*.016*factor*coachMultiplier,
        discipline:a.tactics*.012*factor*coachMultiplier,
        communication:a.teamwork*.014*factor,
        utility:a.teamwork*.009*factor
      };
      Object.entries(additions).forEach(([key,value])=>{
        player.trainingProgress[key]=(player.trainingProgress[key]||0)+value;
        while(player.trainingProgress[key]>=1&&player.attrs[key]<98){player.attrs[key]+=1;player.trainingProgress[key]-=1;}
      });
      if(player.age>=30&&Math.random()<.08){const keys=Object.keys(player.attrs);const key=keys[Math.floor(Math.random()*keys.length)];player.attrs[key]=Math.max(35,player.attrs[key]-1);}
      player.overall=D.calculateOverall(player.attrs,player.role);
      player.value=D.calculateMarketValue(player.overall,player.potential,player.age);
      player.fatigue=D.clamp(player.fatigue+effects.fatigue+(player.isStarter?1:0)-fatigueRecovery,0,100);
      player.morale=D.clamp(player.morale+effects.morale+(a.rest>=25?1:0)+moraleSupport,0,100);
      player.form=D.clamp(player.form+(a.fitness*.04+a.rest*.025)-Math.max(0,effects.fatigue)*.025,20,98);
    });
    team.chemistry=D.clamp(team.chemistry+effects.chemistry+chemistrySupport+(gameState.season.week-team.rosterChangedWeek>0?.5:0),0,100);
    D.MAPS.forEach((map)=>{
      team.mapSkill[map.id]=D.clamp(Number(team.mapSkill[map.id]||55)+effects[map.id],35,98);
    });
    const assistant=team.staff&&team.staff.assistant;
    if(assistant&&assistant.mapId&&team.mapSkill[assistant.mapId]!=null){
      const assistantBonus=.16+Math.max(0,Number(assistant.rating||50)-45)*.011;
      team.mapSkill[assistant.mapId]=D.clamp(Number(team.mapSkill[assistant.mapId])+assistantBonus,35,98);
    }
  }

  function processWeeklyFinances() {
    const team=getUserTeam();const salaries=weeklySalary(team),income=gameState.finances.weeklyIncome;
    team.budget-=salaries;team.budget+=income;
    gameState.finances.transactions.unshift({id:`tx-income-${Date.now()}`,week:gameState.season.week,type:'income',amount:income,label:'Еженедельный доход организации'});
    gameState.finances.transactions.unshift({id:`tx-salary-${Date.now()+1}`,week:gameState.season.week,type:'expense',amount:salaries,label:'Выплата зарплат игрокам'});
  }

  function processContracts() {
    const expiredUser=[];
    gameState.teams.forEach(team=>{
      const expired=[];
      team.players.forEach(player=>{player.contractWeeks=Math.max(0,player.contractWeeks-1);if(player.contractWeeks===0)expired.push(player);});
      expired.forEach(player=>{
        if(team.isUser){
          expiredUser.push(player);team.players=team.players.filter(p=>p.id!==player.id);player.teamId=null;player.isStarter=false;player.status='Свободный агент';player.listed=false;gameState.freeAgents.push(player);
        }else if(Math.random()<.76){player.contractWeeks=24+Math.floor(Math.random()*40);player.salary=Math.round(player.salary*(1+Math.random()*.12)/50)*50;}
        else{team.players=team.players.filter(p=>p.id!==player.id);player.teamId=null;player.isStarter=false;player.status='Свободный агент';player.listed=false;gameState.freeAgents.push(player);refillAITeam(team);}
      });
      if(!team.isUser)team.players.forEach(player=>{if(player.contractWeeks<=5&&Math.random()<.25){player.contractWeeks+=24;player.salary=Math.round(player.salary*1.06/50)*50;}});
    });
    if(expiredUser.length){promoteBestReserve(getUserTeam());getUserTeam().chemistry=D.clamp(getUserTeam().chemistry-5*expiredUser.length,0,100);gameState.news.unshift(D.makeNews(`news-expire-${Date.now()}`,gameState.season.week,'Контракт игрока завершён',`${expiredUser.map(p=>p.nickname).join(', ')} покинул клуб и стал свободным агентом.`,'transfer'));}
  }

  function generateIncomingOffers() {
    const team=getUserTeam();
    [...(team.players||[]),...(team.academy||[]),...(team.academyGraduates||[])].filter(p=>p.listed).forEach(player=>{
      const existing=gameState.transfers.incomingOffers.some(o=>o.playerId===player.id);
      if(existing||Math.random()>.58)return;
      const buyers=gameState.teams.filter((t)=>!t.isUser&&t.budget>player.value*.65&&transferDestination(player,t)!=='blocked');
      if(!buyers.length)return;
      const buyer=buyers[Math.floor(Math.random()*buyers.length)];
      const multiplier=.86+Math.random()*.42;
      const amount=Math.round(player.value*multiplier/5000)*5000;
      gameState.transfers.incomingOffers.push({id:`offer-${Date.now()}-${player.id}`,week:gameState.season.week,playerId:player.id,teamId:buyer.id,amount});
      gameState.news.unshift(D.makeNews(`news-offer-${Date.now()}-${player.id}`,gameState.season.week,`${buyer.name} сделала предложение по ${player.nickname}`,`Клуб предлагает ${D.money(amount)} за игрока.`,'transfer'));
      toast(`${buyer.name} хочет купить ${player.nickname} за ${D.money(amount)}. Откройте вкладку «Мои предложения».`, 'transfer', 7200);
    });
  }

  function processAITeamManagement() {
    const aiTeams=gameState.teams.filter(t=>!t.isUser);
    aiTeams.forEach(team=>{
      processAIAcademyManagement(team);
      if(team.lossStreak>=3&&team.players.length>5&&Math.random()<.22){const weak=team.players.slice().sort((a,b)=>a.overall-b.overall)[0];weak.listed=true;}
      if(team.players.length<5)refillAITeam(team);
      if(Math.random()<.05&&gameState.freeAgents.length&&team.players.length<MAX_SENIOR_ROSTER){const avg=D.teamAverage(team,'overall');const candidate=gameState.freeAgents.slice().sort((a,b)=>b.overall-a.overall).find(p=>p.overall>=avg-5&&p.salary*2<team.budget);if(candidate){gameState.freeAgents=gameState.freeAgents.filter(p=>p.id!==candidate.id);candidate.teamId=team.id;candidate.isStarter=false;candidate.status='Запасной';candidate.contractWeeks=36;team.players.push(candidate);team.budget-=candidate.salary*2;team.chemistry=D.clamp(team.chemistry-3,35,100);}}
    });
  }

  const TOURNAMENT_ENGINE_VERSION = 2;

  function getTournamentConfig(t) {
    const configs = {
      opening: {
        cardStages: [
          { key: 'quarterfinal', label: 'Четвертьфинал', week: 3, format: 'BO1' },
          { key: 'semifinal', label: 'Полуфинал', week: 4, format: 'BO3' },
          { key: 'final', label: 'Финал', week: 5, format: 'BO3' }
        ],
        bracketStages: [
          { key: 'quarterfinal', label: 'Четвертьфинал', week: 3, format: 'BO1' },
          { key: 'semifinal', label: 'Полуфинал', week: 4, format: 'BO3' },
          { key: 'final', label: 'Финал', week: 5, format: 'BO3' }
        ],
        info: 'Все 8 команд начинают турнир с четвертьфинала. Пары первой стадии определяются случайной жеребьёвкой, а дальше победители проходят по сетке.'
      },
      regional: {
        cardStages: [
          { key: 'round16', label: '1/8 финала', week: 7, format: 'BO1' },
          { key: 'quarterfinal', label: 'Четвертьфинал', week: 8, format: 'BO1' },
          { key: 'semifinal', label: 'Полуфинал', week: 9, format: 'BO3' },
          { key: 'final', label: 'Финал', week: 10, format: 'BO3' }
        ],
        bracketStages: [
          { key: 'round16', label: '1/8 финала', week: 7, format: 'BO1' },
          { key: 'quarterfinal', label: 'Четвертьфинал', week: 8, format: 'BO1' },
          { key: 'semifinal', label: 'Полуфинал', week: 9, format: 'BO3' },
          { key: 'final', label: 'Финал', week: 10, format: 'BO3' }
        ],
        info: 'Все 16 команд сразу находятся в сетке. Пары 1/8 финала определяются случайной жеребьёвкой, а дальше победители проходят по сетке.'
      },
      masters: {
        cardStages: [
          { key: 'swiss', label: 'Швейцарская система', weeks: [13, 16], format: 'BO1' },
          { key: 'quarterfinal', label: 'Четвертьфинал', week: 17, format: 'BO3' },
          { key: 'semifinal', label: 'Полуфинал', week: 18, format: 'BO3' },
          { key: 'final', label: 'Финал', week: 19, format: 'BO3' }
        ],
        bracketStages: [
          { key: 'quarterfinal', label: 'Четвертьфинал', week: 17, format: 'BO3' },
          { key: 'semifinal', label: 'Полуфинал', week: 18, format: 'BO3' },
          { key: 'final', label: 'Финал', week: 19, format: 'BO3' }
        ],
        swissWeeks: [13, 14, 15, 16],
        info: 'Команды проводят 4 раунда швейцарской системы. После W16 первые 8 мест проходят в четвертьфинал.'
      },
      world: {
        cardStages: [
          { key: 'preliminary', label: 'Предварительный раунд', week: 20, format: 'BO1' },
          { key: 'round16', label: '1/8 финала', week: 21, format: 'BO3' },
          { key: 'quarterfinal', label: 'Четвертьфинал', week: 22, format: 'BO3' },
          { key: 'semifinal', label: 'Полуфинал', week: 23, format: 'BO3' },
          { key: 'final', label: 'Финал', week: 24, format: 'BO3' }
        ],
        bracketStages: [
          { key: 'preliminary', label: 'Предварительный раунд', week: 20, format: 'BO1' },
          { key: 'round16', label: '1/8 финала', week: 21, format: 'BO3' },
          { key: 'quarterfinal', label: 'Четвертьфинал', week: 22, format: 'BO3' },
          { key: 'semifinal', label: 'Полуфинал', week: 23, format: 'BO3' },
          { key: 'final', label: 'Финал', week: 24, format: 'BO3' }
        ],
        info: 'Команды с посевом 1–8 сразу проходят в 1/8 финала. Посевы 9–24 начинают с предварительного раунда.'
      }
    };
    return configs[t.id] || configs.opening;
  }

  function tournamentStageForWeek(t, week) {
    const config = getTournamentConfig(t);
    if (week < t.weeks[0]) return { key: 'waiting', label: 'Ожидание' };
    for (const stage of config.cardStages) {
      if (stage.week === week) return stage;
      if (stage.weeks && week >= stage.weeks[0] && week <= stage.weeks[1]) {
        return Object.assign({}, stage, { label: `Швейцарский раунд ${week - stage.weeks[0] + 1}` });
      }
    }
    if (week > t.weeks[1]) return { key: 'completed', label: 'Завершён' };
    return config.cardStages[config.cardStages.length - 1];
  }

  function setTournamentStage(t) {
    if (t.winnerId) {
      t.stage = 'Завершён';
      return;
    }
    const stage = tournamentStageForWeek(t, gameState.season.week);
    t.stage = stage.label;
  }

  function bracketSeedOrder(size) {
    let order = [1, 2];
    while (order.length < size) {
      const nextSize = order.length * 2;
      const next = [];
      order.forEach((seed) => {
        next.push(seed, nextSize + 1 - seed);
      });
      order = next;
    }
    return order.slice(0, size);
  }

  function compareTournamentRows(t, a, b, state) {
    const source = state || gameState;
    const teamA = D.findTeam(source, a.teamId);
    const teamB = D.findTeam(source, b.teamId);
    return Number(b.points || 0) - Number(a.points || 0)
      || Number(b.wins || 0) - Number(a.wins || 0)
      || Number(a.seed || 99) - Number(b.seed || 99)
      || Number(teamA && teamA.rank || 99) - Number(teamB && teamB.rank || 99);
  }

  function sortedTournamentRows(t, state) {
    return (t.standings || []).slice().sort((a, b) => compareTournamentRows(t, a, b, state));
  }

  function normalizeTournamentStandings(t, state) {
    if (!Array.isArray(t.standings)) t.standings = [];
    t.standings.forEach((row, index) => {
      row.seed = Math.max(1, Number(row.seed || index + 1));
      row.wins = Math.max(0, Number(row.wins || 0));
      row.losses = Math.max(0, Number(row.losses || 0));
      row.played = row.wins + row.losses;
      row.points = row.wins * 3;
      row.opponents = Array.isArray(row.opponents) ? row.opponents : [];
    });
  }

  function selectTournamentParticipants(t) {
    const ranked = [...gameState.teams].sort((a, b) => a.rank - b.rank);
    const selected = ranked.slice(0, t.participants);
    const user = getUserTeam();
    if (!selected.some((team) => team.id === user.id)) selected[selected.length - 1] = user;
    return selected;
  }

  function makeTournamentMatch(t, stage, index, a, b, extra) {
    return Object.assign({
      id: `${t.id}-${stage.key}-${index + 1}`,
      stageKey: stage.key,
      stageLabel: stage.label,
      stageIndex: getTournamentConfig(t).bracketStages.findIndex((item) => item.key === stage.key),
      week: stage.week,
      format: stage.format || 'BO1',
      a: a || null,
      b: b || null,
      winnerId: null,
      scoreA: null,
      scoreB: null,
      counted: false
    }, extra || {});
  }

  function addBracketStage(t, stageKey, pairs, extras) {
    if ((t.bracket || []).some((match) => match.stageKey === stageKey)) return;
    const stage = getTournamentConfig(t).bracketStages.find((item) => item.key === stageKey);
    if (!stage) return;
    pairs.forEach((pair, index) => {
      const extra = extras && extras[index] ? extras[index] : null;
      t.bracket.push(makeTournamentMatch(t, stage, index, pair[0], pair[1], extra));
    });
  }

  function createSeededBracketStage(t, stageKey, ids) {
    const order = bracketSeedOrder(ids.length);
    const positioned = order.map((seed) => ids[seed - 1] || null);
    const pairs = [];
    for (let index = 0; index < positioned.length; index += 2) pairs.push([positioned[index], positioned[index + 1]]);
    addBracketStage(t, stageKey, pairs);
  }

  function tournamentDrawRandom(t, stageKey, ids) {
    let seed = stableStringHash(`${Number(gameState && gameState.seed || 0)}|S${Number(gameState && gameState.season && gameState.season.number || 1)}|${t.id}|${stageKey}|${ids.join(',')}`) || 1;
    const next = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const shuffled = ids.slice();
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(next() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function createRandomFirstBracketStage(t, stageKey, ids) {
    const shuffled = tournamentDrawRandom(t, stageKey, ids);
    const pairs = [];
    for (let index = 0; index < shuffled.length; index += 2) pairs.push([shuffled[index], shuffled[index + 1]]);
    addBracketStage(t, stageKey, pairs);
  }

  function ensureRandomFirstStageDraw(t) {
    if (!t || (t.id !== 'opening' && t.id !== 'regional')) return;
    if (Number(t.firstStageDrawVersion || 0) >= 1) return;
    const firstStage = getTournamentConfig(t).bracketStages[0];
    const matches = (t.bracket || []).filter((match) => match.stageKey === firstStage.key);
    const stageStarted = matches.some((match) => Boolean(match.winnerId) || match.scoreA != null || match.scoreB != null || match.counted);
    if (!stageStarted) {
      t.bracket = (t.bracket || []).filter((match) => match.stageKey !== firstStage.key);
      createRandomFirstBracketStage(t, firstStage.key, t.participantIds || []);
    }
    t.firstStageDrawVersion = 1;
  }

  function createWorldPreliminary(t) {
    const bySeed = new Map(t.standings.map((row) => [row.seed, row.teamId]));
    const pairs = [];
    const extras = [];
    for (let seed = 9; seed <= 16; seed += 1) {
      pairs.push([bySeed.get(seed), bySeed.get(33 - seed)]);
      extras.push({ slotSeed: seed });
    }
    addBracketStage(t, 'preliminary', pairs, extras);
  }

  function createSwissRound(t, round) {
    if ((t.swissRounds || []).some((item) => item.round === round)) return;
    const week = 12 + round;
    let pairs = [];
    if (round === 1) {
      const ids = t.standings.slice().sort((a, b) => a.seed - b.seed).map((row) => row.teamId);
      for (let index = 0; index < ids.length / 2; index += 1) pairs.push([ids[index], ids[index + ids.length / 2]]);
    } else {
      const remaining = sortedTournamentRows(t).map((row) => row.teamId);
      while (remaining.length) {
        const a = remaining.shift();
        const rowA = t.standings.find((row) => row.teamId === a);
        let opponentIndex = remaining.findIndex((id) => {
          const rowB = t.standings.find((row) => row.teamId === id);
          return rowB && rowA && rowB.wins === rowA.wins && !rowA.opponents.includes(id);
        });
        if (opponentIndex < 0) opponentIndex = remaining.findIndex((id) => !rowA.opponents.includes(id));
        if (opponentIndex < 0) opponentIndex = 0;
        const b = remaining.splice(opponentIndex, 1)[0];
        pairs.push([a, b]);
      }
    }
    const matches = pairs.map((pair, index) => ({
      id: `${t.id}-swiss-r${round}-${index + 1}`,
      stageKey: 'swiss',
      stageLabel: `Швейцарский раунд ${round}`,
      stageIndex: -1,
      round,
      week,
      format: 'BO1',
      a: pair[0],
      b: pair[1],
      winnerId: null,
      scoreA: null,
      scoreB: null,
      counted: false
    }));
    t.swissRounds.push({ round, week, matches });
  }

  function initializeTournamentData(t) {
    const participants = selectTournamentParticipants(t);
    t.engineVersion = TOURNAMENT_ENGINE_VERSION;
    t.participantIds = participants.map((team) => team.id);
    t.standings = participants.map((team, index) => ({
      teamId: team.id,
      seed: index + 1,
      played: 0,
      wins: 0,
      losses: 0,
      points: 0,
      opponents: []
    }));
    t.bracket = [];
    t.swissRounds = [];
    t.qualifierIds = [];
    t.winnerId = null;
    t.rewarded = false;
    t.ratingRewarded = false;
    t.friendlyScheduled = false;
    t.friendlyWeek = null;
    t.processedWeeks = [];
    t.stage = 'Ожидание';

    if (t.id === 'masters') createSwissRound(t, 1);
    else if (t.id === 'world') createWorldPreliminary(t);
    else if (t.id === 'opening' || t.id === 'regional') {
      createRandomFirstBracketStage(t, getTournamentConfig(t).bracketStages[0].key, t.participantIds);
      t.firstStageDrawVersion = 1;
    } else createSeededBracketStage(t, getTournamentConfig(t).bracketStages[0].key, t.participantIds);
  }

  function ensureTournamentData(t) {
    if (t.engineVersion !== TOURNAMENT_ENGINE_VERSION || !Array.isArray(t.participantIds) || !Array.isArray(t.standings)) {
      initializeTournamentData(t);
    }
    t.bracket = Array.isArray(t.bracket) ? t.bracket : [];
    t.swissRounds = Array.isArray(t.swissRounds) ? t.swissRounds : [];
    t.qualifierIds = Array.isArray(t.qualifierIds) ? t.qualifierIds : [];
    t.processedWeeks = Array.isArray(t.processedWeeks) ? t.processedWeeks : [];
    t.ratingRewarded = Boolean(t.ratingRewarded);
    t.friendlyScheduled = Boolean(t.friendlyScheduled);
    t.friendlyWeek = t.friendlyWeek == null ? null : Number(t.friendlyWeek);
    normalizeTournamentStandings(t, gameState);
    ensureRandomFirstStageDraw(t);
    syncTournamentCalendar(t);
  }

  function tournamentTeamStrength(team) {
    if (!team) return 0;
    const lineup=Sim.starterLineup(team);
    const average=lineup.length?lineup.reduce((sum,player)=>sum+Number(player.overall||50),0)/lineup.length:40;
    const form=lineup.length?lineup.reduce((sum,player)=>sum+Number(player.form||50),0)/lineup.length:40;
    const missingPenalty=Math.max(0,5-lineup.length)*120;
    return Number(team.ratingPoints || 1000) + average * 13 + Number(team.chemistry || 50) * 1.5 + form - missingPenalty;
  }

  function resolveAIMatch(t, match) {
    if (!match.a && !match.b) return;
    if (!match.a || !match.b) {
      const winnerId = match.a || match.b;
      recordTournamentResult(t, match, winnerId, match.a ? 1 : 0, match.b ? 1 : 0);
      return;
    }
    const teamA = D.findTeam(gameState, match.a);
    const teamB = D.findTeam(gameState, match.b);
    const difference = tournamentTeamStrength(teamA) - tournamentTeamStrength(teamB);
    const chanceA = D.clamp(1 / (1 + Math.exp(-difference / 170)), .16, .84);
    const winnerId = Math.random() < chanceA ? match.a : match.b;
    if (match.format === 'BO3') {
      const loserScore = Math.random() < .58 ? 1 : 0;
      recordTournamentResult(t, match, winnerId, winnerId === match.a ? 2 : loserScore, winnerId === match.b ? 2 : loserScore);
    } else {
      recordTournamentResult(t, match, winnerId, winnerId === match.a ? 1 : 0, winnerId === match.b ? 1 : 0);
    }
  }

  function applyAITournamentMatchImpact(match, winnerId) {
    if (!match || match.performanceApplied || !match.a || !match.b) return;
    if (match.a === gameState.userTeamId || match.b === gameState.userTeamId) return;
    const teamA = D.findTeam(gameState, match.a);
    const teamB = D.findTeam(gameState, match.b);
    if (!teamA || !teamB) return;
    const winner = winnerId === teamA.id ? teamA : teamB;
    const loser = winnerId === teamA.id ? teamB : teamA;
    const expectedWinner = 1 / (1 + Math.pow(10, (loser.ratingPoints - winner.ratingPoints) / 320));
    const formatMultiplier = match.format === 'BO3' ? 1.15 : 1;
    const points = D.clamp(Math.round(20 * (1.22 - expectedWinner) * formatMultiplier), 7, 30);
    winner.ratingPoints += points;
    loser.ratingPoints = Math.max(100, loser.ratingPoints - Math.round(points * .75));
    winner.winStreak = Number(winner.winStreak || 0) + 1;
    winner.lossStreak = 0;
    loser.lossStreak = Number(loser.lossStreak || 0) + 1;
    loser.winStreak = 0;
    winner.history = ['W', ...(winner.history || [])].slice(0, 8);
    loser.history = ['L', ...(loser.history || [])].slice(0, 8);
    winner.chemistry = D.clamp(Number(winner.chemistry || 50) + 1, 35, 100);
    loser.chemistry = D.clamp(Number(loser.chemistry || 50) - .5, 35, 100);
    winner.players.forEach((player) => {
      player.form = D.clamp(Number(player.form || 50) + 1.4, 20, 100);
      player.morale = D.clamp(Number(player.morale || 50) + 2, 0, 100);
      player.fatigue = D.clamp(Number(player.fatigue || 0) + (match.format === 'BO3' ? 5 : 3), 0, 100);
    });
    loser.players.forEach((player) => {
      player.form = D.clamp(Number(player.form || 50) - 1.1, 20, 100);
      player.morale = D.clamp(Number(player.morale || 50) - 2, 0, 100);
      player.fatigue = D.clamp(Number(player.fatigue || 0) + (match.format === 'BO3' ? 5 : 3), 0, 100);
    });
    Sim.processTeamMatchInjuries(teamA,Sim.starterLineup(teamA));
    Sim.processTeamMatchInjuries(teamB,Sim.starterLineup(teamB));
    match.performanceApplied = true;
    D.updateRanks(gameState);
  }

  function recordTournamentResult(t, match, winnerId, scoreA, scoreB) {
    if (!match || !winnerId) return;
    match.winnerId = winnerId;
    match.scoreA = Number(scoreA);
    match.scoreB = Number(scoreB);
    if (match.counted) return;
    const rowA = t.standings.find((row) => row.teamId === match.a);
    const rowB = t.standings.find((row) => row.teamId === match.b);
    if (rowA && rowB) {
      rowA.played += 1;
      rowB.played += 1;
      if (winnerId === match.a) {
        rowA.wins += 1;
        rowB.losses += 1;
      } else {
        rowB.wins += 1;
        rowA.losses += 1;
      }
      rowA.points = rowA.wins * 3;
      rowB.points = rowB.wins * 3;
      if (!rowA.opponents.includes(match.b)) rowA.opponents.push(match.b);
      if (!rowB.opponents.includes(match.a)) rowB.opponents.push(match.a);
    }
    match.counted = true;
    applyAITournamentMatchImpact(match, winnerId);
  }

  function getUserCalendarMatchForWeek(t, week) {
    const entry = gameState.season.calendar.find((item) => item.week === week);
    const currentMatch = entry && entry.match && entry.match.tournamentId === t.id ? entry.match : null;
    if (currentMatch && currentMatch.status === 'completed' && currentMatch.result) return currentMatch;
    if (t._legacyMatches && t._legacyMatches[week]) return t._legacyMatches[week];
    return currentMatch;
  }

  function applyUserCalendarResult(t, match, week) {
    const calendarMatch = getUserCalendarMatchForWeek(t, week);
    if (!calendarMatch || calendarMatch.status !== 'completed' || !calendarMatch.result) return false;
    const userId = gameState.userTeamId;
    const userWon = calendarMatch.result.winnerId === userId;
    const opponentId = match.a === userId ? match.b : match.a;
    const winnerId = userWon ? userId : opponentId;
    const userScore = Number(calendarMatch.result.mapsWonA != null ? calendarMatch.result.mapsWonA : (userWon ? (match.format === 'BO3' ? 2 : 1) : 0));
    const opponentScore = Number(calendarMatch.result.mapsWonB != null ? calendarMatch.result.mapsWonB : (userWon ? 0 : (match.format === 'BO3' ? 2 : 1)));
    const scoreA = match.a === userId ? userScore : opponentScore;
    const scoreB = match.b === userId ? userScore : opponentScore;
    recordTournamentResult(t, match, winnerId, scoreA, scoreB);
    return true;
  }

  function resolveTournamentMatches(t, matches, week, forceUserSimulation) {
    let waitingForUser = false;
    matches.forEach((match) => {
      if (match.winnerId) return;
      const hasUser = match.a === gameState.userTeamId || match.b === gameState.userTeamId;
      if (hasUser) {
        if (!applyUserCalendarResult(t, match, week)) {
          if (forceUserSimulation) resolveAIMatch(t, match);
          else waitingForUser = true;
        }
      } else resolveAIMatch(t, match);
    });
    return !waitingForUser && matches.every((match) => Boolean(match.winnerId));
  }

  function advanceBracket(t, stageKey) {
    const config = getTournamentConfig(t);
    const stageIndex = config.bracketStages.findIndex((stage) => stage.key === stageKey);
    const current = t.bracket.filter((match) => match.stageKey === stageKey);
    if (!current.length || !current.every((match) => match.winnerId)) return;
    if (stageIndex === config.bracketStages.length - 1) {
      t.winnerId = current[0].winnerId;
      t.stage = 'Завершён';
      return;
    }

    const nextStage = config.bracketStages[stageIndex + 1];
    if (t.id === 'world' && stageKey === 'preliminary') {
      const bySeed = new Map(t.standings.map((row) => [row.seed, row.teamId]));
      const prelimWinnerBySlot = new Map(current.map((match) => [match.slotSeed, match.winnerId]));
      const positioned = bracketSeedOrder(16).map((seed) => seed <= 8 ? bySeed.get(seed) : prelimWinnerBySlot.get(seed));
      const pairs = [];
      for (let index = 0; index < positioned.length; index += 2) pairs.push([positioned[index], positioned[index + 1]]);
      addBracketStage(t, nextStage.key, pairs);
      return;
    }

    const winners = current.map((match) => match.winnerId);
    const pairs = [];
    for (let index = 0; index < winners.length; index += 2) pairs.push([winners[index], winners[index + 1]]);
    addBracketStage(t, nextStage.key, pairs);
  }

  function createMastersPlayoff(t) {
    const qualifiers = sortedTournamentRows(t).slice(0, 8).map((row) => row.teamId);
    t.qualifierIds = qualifiers;
    createSeededBracketStage(t, 'quarterfinal', qualifiers);
  }

  function scheduleFriendlyForEliminatedUser(t, loserIds, week) {
    const userId = gameState.userTeamId;
    if (!Array.isArray(loserIds) || !loserIds.includes(userId) || t.friendlyScheduled) return false;
    const opponentId = loserIds.find((id)=>id && id!==userId);
    if (!opponentId) return false;
    const targetWeek = Number(week) + 1;
    const entry = gameState.season.calendar.find((item)=>item.week===targetWeek);
    if (!entry || (entry.match && entry.match.status==='completed')) return false;
    if (entry.match && entry.match.status==='pending') return false;
    const opponent = D.findTeam(gameState, opponentId);
    if (!opponent) return false;
    entry.match = {
      id: `friendly-${t.id}-s${gameState.season.number}-w${targetWeek}`,
      opponentId,
      tournamentId: 'friendly',
      tournamentName: 'Товарищеский матч',
      stageKey: 'friendly',
      stageLabel: 'Матч выбывших команд',
      format: 'BO1',
      status: 'pending',
      result: null,
      veto: null,
      aiTactics: Sim.randomAITactics(),
      friendly: true,
      sourceTournamentId: t.id
    };
    entry.events = Array.isArray(entry.events) ? entry.events : [];
    entry.events.push(`Товарищеский матч против ${opponent.name}`);
    t.friendlyScheduled = true;
    t.friendlyWeek = targetWeek;
    gameState.news.unshift(D.makeNews(`news-friendly-${t.id}-${Date.now()}`,targetWeek,'Назначен товарищеский матч',`${getUserTeam().name} сыграет с ${opponent.name}. Обе команды выбыли на начальной стадии турнира ${t.name}.`,'friendly'));
    return true;
  }

  function firstStageLosers(matches) {
    return (matches || []).filter((match)=>match && match.winnerId && match.a && match.b).map((match)=>match.winnerId===match.a?match.b:match.a);
  }

  function resolveTournamentWeek(t, week, forceUserSimulation) {
    if (t.processedWeeks.includes(week)) return true;
    const config = getTournamentConfig(t);
    let completed = false;

    if (t.id === 'masters' && config.swissWeeks.includes(week)) {
      const roundNumber = week - config.swissWeeks[0] + 1;
      const round = t.swissRounds.find((item) => item.round === roundNumber);
      if (!round) return false;
      completed = resolveTournamentMatches(t, round.matches, week, forceUserSimulation);
      if (completed) {
        if (roundNumber < 4) createSwissRound(t, roundNumber + 1);
        else {
          createMastersPlayoff(t);
          const nonQualifiers = sortedTournamentRows(t).slice(8).map((row)=>row.teamId);
          scheduleFriendlyForEliminatedUser(t, nonQualifiers, week);
        }
      }
    } else {
      const stage = config.bracketStages.find((item) => item.week === week);
      if (!stage) return false;
      const matches = t.bracket.filter((match) => match.stageKey === stage.key);
      if (!matches.length) return false;
      completed = resolveTournamentMatches(t, matches, week, forceUserSimulation);
      if (completed) {
        const isFirstStage = stage.key === config.bracketStages[0].key;
        const losers = isFirstStage ? firstStageLosers(matches) : [];
        advanceBracket(t, stage.key);
        if (isFirstStage) scheduleFriendlyForEliminatedUser(t, losers, week);
      }
    }

    if (completed) {
      t.processedWeeks.push(week);
      if (t.winnerId && !t.rewarded) {
        if (!t.suppressReward) awardTournament(t);
        t.rewarded = true;
      }
      syncTournamentCalendar(t);
    }
    return completed;
  }

  function findTournamentUserMatch(t, week) {
    for (const round of t.swissRounds || []) {
      if (round.week !== week) continue;
      const match = round.matches.find((item) => item.a === gameState.userTeamId || item.b === gameState.userTeamId);
      if (match) return match;
    }
    return (t.bracket || []).find((item) => item.week === week && (item.a === gameState.userTeamId || item.b === gameState.userTeamId)) || null;
  }

  function syncTournamentCalendar(t) {
    if (!gameState || !gameState.season || !Array.isArray(gameState.season.calendar)) return;
    for (let week = t.weeks[0]; week <= t.weeks[1]; week += 1) {
      const entry = gameState.season.calendar.find((item) => item.week === week);
      if (!entry) continue;
      entry.tournamentId = t.id;
      const expected = findTournamentUserMatch(t, week);
      const existing = entry.match && entry.match.tournamentId === t.id ? entry.match : null;
      if (!expected) {
        if (existing && existing.status !== 'completed') entry.match = null;
        continue;
      }
      const opponentId = expected.a === gameState.userTeamId ? expected.b : expected.a;
      if (!opponentId) continue;
      if (existing && existing.status === 'completed') {
        existing.tournamentMatchId = expected.id;
        existing.stageKey = expected.stageKey;
        existing.stageLabel = expected.stageLabel;
        continue;
      }
      if (existing && existing.status !== 'completed' && existing.opponentId === opponentId && existing.tournamentMatchId === expected.id) {
        existing.tournamentName = t.name;
        existing.stageKey = expected.stageKey;
        existing.stageLabel = expected.stageLabel;
        existing.format = expected.format;
        if (!existing.aiTactics) existing.aiTactics = Sim.randomAITactics();
        continue;
      }
      entry.match = {
        id: `match-${t.id}-w${week}`,
        opponentId,
        tournamentId: t.id,
        tournamentName: t.name,
        tournamentMatchId: expected.id,
        stageKey: expected.stageKey,
        stageLabel: expected.stageLabel,
        format: expected.format,
        status: 'pending',
        result: null,
        veto: null,
        aiTactics: Sim.randomAITactics()
      };
    }
  }

  function updateTournamentStates(progress) {
    gameState.tournaments.forEach((t) => {
      ensureTournamentData(t);
      const week = gameState.season.week;
      if (progress && week >= t.weeks[0] && week <= t.weeks[1]) resolveTournamentWeek(t, week, false);
      syncTournamentCalendar(t);
      setTournamentStage(t);
    });
  }

  function getUserTournamentPlacement(t) {
    if (t.winnerId === gameState.userTeamId) return 1;
    const loss = (t.bracket || []).find((match) => match.winnerId && (match.a === gameState.userTeamId || match.b === gameState.userTeamId) && match.winnerId !== gameState.userTeamId);
    if (loss) {
      const places = { final: 2, semifinal: 4, quarterfinal: 8, round16: 16, preliminary: 24 };
      return places[loss.stageKey] || t.participants;
    }
    const index = sortedTournamentRows(t).findIndex((row) => row.teamId === gameState.userTeamId);
    return index >= 0 ? index + 1 : t.participants;
  }

  function tournamentPlacementTeams(t) {
    const finalMatch=(t.bracket||[]).find((match)=>match.stageKey==='final'&&match.winnerId);
    const winnerId=t.winnerId||(finalMatch&&finalMatch.winnerId)||null;
    const runnerUpId=finalMatch?(finalMatch.winnerId===finalMatch.a?finalMatch.b:finalMatch.a):null;
    const semifinalists=(t.bracket||[]).filter((match)=>match.stageKey==='semifinal'&&match.winnerId).map((match)=>match.winnerId===match.a?match.b:match.a).filter(Boolean);
    return {winnerId,runnerUpId,semifinalists};
  }

  function tournamentRatingBonus(tournamentId) {
    return {opening:100,regional:125,masters:175,world:250}[tournamentId]||100;
  }

  function recordUserTournamentTitle(t) {
    if(t.winnerId!==gameState.userTeamId)return;
    gameState.career.tournamentWins=Array.isArray(gameState.career.tournamentWins)?gameState.career.tournamentWins:[];
    const exists=gameState.career.tournamentWins.some((item)=>item.tournamentId===t.id&&Number(item.season)===Number(gameState.season.number));
    if(!exists)gameState.career.tournamentWins.push({tournamentId:t.id,season:Number(gameState.season.number)});
  }

  function awardTournament(t) {
    const placement=tournamentPlacementTeams(t);
    const payouts=tournamentPayouts(t);
    const awards=[];
    if(placement.winnerId)awards.push({teamId:placement.winnerId,place:1,amount:payouts.winner});
    if(placement.runnerUpId)awards.push({teamId:placement.runnerUpId,place:2,amount:payouts.runnerUp});
    placement.semifinalists.forEach((teamId)=>awards.push({teamId,place:4,amount:payouts.semifinal}));
    awards.forEach((award)=>{
      const team=D.findTeam(gameState,award.teamId);
      if(!team||award.amount<=0)return;
      team.budget=Number(team.budget||0)+award.amount;
      if(team.id===gameState.userTeamId){
        gameState.finances.transactions.unshift({id:`tx-prize-${t.id}-${Date.now()}-${award.place}`,week:gameState.season.week,type:'income',amount:award.amount,label:`${award.place===1?'Победа':award.place===2?'Второе место':'3–4 место'} · ${t.name}`});
        gameState.news.unshift(D.makeNews(`news-prize-${t.id}-${Date.now()}`,gameState.season.week,`${getUserTeam().name} получает турнирные призовые`,`Команда заработала ${D.money(award.amount)} за ${award.place===1?'победу':award.place===2?'второе место':'выход в полуфинал'} на турнире ${t.name}.`,'tournament'));
      }
    });
    const winner=D.findTeam(gameState,placement.winnerId);
    if(winner&&!t.ratingRewarded){
      const bonus=tournamentRatingBonus(t.id);
      winner.ratingPoints=Number(winner.ratingPoints||0)+bonus;
      t.ratingRewarded=true;
      gameState.news.unshift(D.makeNews(`news-rating-title-${t.id}-${Date.now()}`,gameState.season.week,`${winner.name} получает бонус мирового рейтинга`,`Победа на турнире ${t.name} принесла команде дополнительные ${bonus} рейтинговых очков.`,'ranking'));
      D.updateRanks(gameState);
    }
    recordUserTournamentTitle(t);
  }

  function migrateTournamentSystem(state) {
    const legacyMatches = {};
    (state.season.calendar || []).forEach((entry) => {
      const match = entry.match;
      if (!match || !match.tournamentId || match.tournamentId === 'league') return;
      if (!legacyMatches[match.tournamentId]) legacyMatches[match.tournamentId] = {};
      legacyMatches[match.tournamentId][entry.week] = JSON.parse(JSON.stringify(match));
      entry.match = null;
    });

    state.tournaments = D.TOURNAMENTS.map((tournament) => ({
      ...tournament,
      stage: 'Ожидание',
      standings: [],
      participantIds: [],
      bracket: [],
      swissRounds: [],
      qualifierIds: [],
      winnerId: null,
      rewarded: false,
      processedWeeks: [],
      engineVersion: null
    }));

    gameState = state;
    state.tournaments.forEach((t) => {
      t._legacyMatches = legacyMatches[t.id] || {};
      t.suppressReward = true;
      ensureTournamentData(t);
      for (let week = t.weeks[0]; week <= Math.min(t.weeks[1], state.season.week); week += 1) {
        const entry = state.season.calendar.find((item) => item.week === week);
        const legacy = t._legacyMatches[week];
        const shouldReplay = week < state.season.week || Boolean(entry && entry.completed) || Boolean(legacy && legacy.status === 'completed');
        if (!shouldReplay) break;
        resolveTournamentWeek(t, week, true);
      }
      syncTournamentCalendar(t);
      Object.keys(t._legacyMatches).forEach((weekKey) => {
        const week = Number(weekKey);
        const expected = findTournamentUserMatch(t, week);
        const legacy = t._legacyMatches[week];
        const entry = state.season.calendar.find((item) => item.week === week);
        if (!entry || !expected || !legacy || legacy.status !== 'completed') return;
        legacy.tournamentName = t.name;
        legacy.tournamentMatchId = expected.id;
        legacy.stageKey = expected.stageKey;
        legacy.stageLabel = expected.stageLabel;
        entry.match = legacy;
      });
      delete t._legacyMatches;
      delete t.suppressReward;
      t.rewarded = Boolean(t.winnerId);
      setTournamentStage(t);
    });
  }

  function updateObjectives() {
    const team=getUserTeam();
    gameState.season.objectives.find(o=>o.id==='top10').done=team.rank<=10;
    gameState.season.objectives.find(o=>o.id==='chem70').done=team.chemistry>=70;
    gameState.season.objectives.find(o=>o.id==='world').done=gameState.tournaments.find(t=>t.id==='world').winnerId===team.id;
  }

  function showSeasonSummary() {
    const summary=gameState.season.summary||buildSeasonSummary();
    const team=getUserTeam();const champion=D.findTeam(gameState,summary.championId);const worldWinner=D.findTeam(gameState,summary.worldWinnerId);
    const canStart=summary.number<gameState.career.maxSeasons;
    openModal('Сезон завершён',`<div style="text-align:center"><div class="kicker">Season ${String(summary.number).padStart(2,'0')} // Final report</div><h2 class="page-title" style="font-size:58px;margin-top:12px">${summary.finalRank===1?'МИРОВОЙ ЛИДЕР':`ИТОГОВОЕ МЕСТО #${summary.finalRank}`}</h2><p class="muted">Первое место рейтинга заняла команда <strong class="acid">${champion?escapeHTML(champion.name):'—'}</strong>. Победитель главного чемпионата: <strong class="acid">${worldWinner?escapeHTML(worldWinner.name):'не определён'}</strong>.</p><div class="grid-3" style="margin-top:20px">${metricCard('A','Итоговый рейтинг',`#${summary.finalRank}`,`${summary.ratingPoints} очков`)}${metricCard('B','Баланс матчей',`${summary.wins}–${summary.losses}`,`${summary.matches} матчей`)}${metricCard('C','Бюджет',D.money(team.budget),'Переходит дальше')}</div><div class="row" style="justify-content:center;margin-top:20px">${canStart?`<button class="btn btn-primary" data-action="start-new-season">НАЧАТЬ СЕЗОН ${summary.number+1} ${icon('arrow')}</button>`:''}<button class="btn" data-action="close-modal">Закрыть отчёт</button></div></div>`,true);
  }

  function weeklySalary(team) { return team.players.reduce((sum,p)=>sum+Number(p.salary||0),0); }
  function bestMapForTeam(team) { return Object.entries(team.mapSkill).sort((a,b)=>b[1]-a[1])[0][0]; }

  function ensureUniquePlayerIdentity(state) {
    const usedNicks = new Set();
    const usedIds = new Set();
    const allPlayers = [
      ...(state.teams || []).flatMap((team) => [...(team.players || []),...(team.academy || []),...(team.academyGraduates || [])]),
      ...(state.freeAgents || []),
      ...((state.ui&&Array.isArray(state.ui.academyCandidates))?state.ui.academyCandidates:[])
    ];
    allPlayers.forEach((player, index) => {
      const base = String(player.nickname || `PLAYER${index + 1}`).toUpperCase();
      let nickname = base;
      let suffix = 2;
      while (usedNicks.has(nickname)) nickname = `${base}${suffix++}`;
      player.nickname = nickname;
      usedNicks.add(nickname);
      const baseId=String(player.id||`player-${index+1}`);
      let id=baseId;let idSuffix=2;
      while(usedIds.has(id))id=`${baseId}-${idSuffix++}`;
      player.id=id;usedIds.add(id);
    });
  }

  function normalizeState(state) {
    state.version=D.VERSION;
    state.career=Object.assign({maxSeasons:D.MAX_SEASONS||5,completedSeasons:[],freeAgentSeasons:[],academyCandidateSeasons:[],tournamentWins:[]},state.career||{});
    state.career.maxSeasons=D.MAX_SEASONS||5;
    state.career.completedSeasons=Array.isArray(state.career.completedSeasons)?state.career.completedSeasons:[];
    state.career.freeAgentSeasons=Array.isArray(state.career.freeAgentSeasons)?state.career.freeAgentSeasons.map(Number).filter((season)=>season>=2&&season<=state.career.maxSeasons):[];
    state.career.academyCandidateSeasons=Array.isArray(state.career.academyCandidateSeasons)?state.career.academyCandidateSeasons.map(Number).filter((season)=>season>=2&&season<=state.career.maxSeasons):[];
    state.career.tournamentWins=Array.isArray(state.career.tournamentWins)?state.career.tournamentWins.filter((item)=>item&&D.TOURNAMENTS.some((t)=>t.id===item.tournamentId)&&Number(item.season)>=1):[];
    state.season=state.season||{};
    state.season.number=Number(state.season.number||1);
    state.season.maxWeek=Number(state.season.maxWeek||24);
    state.season.week=Number(state.season.week||1);
    state.season.objectives=Array.isArray(state.season.objectives)&&state.season.objectives.length?state.season.objectives:createSeasonObjectives();
    state.season.summary=state.season.summary||null;
    state.season.rankBaseline=state.season.rankBaseline&&typeof state.season.rankBaseline==='object'?state.season.rankBaseline:Object.fromEntries((state.teams||[]).map((team)=>[team.id,Number(team.rank||1)]));
    state.ui=state.ui||{compareIds:[],transferTab:'free',filters:{}};
    state.ui.compareIds=state.ui.compareIds||[];state.ui.transferTab=state.ui.transferTab||'free';state.ui.filters=state.ui.filters||{};state.ui.headerNotification=null;state.ui.dashboardHint=state.ui.dashboardHint||null;state.ui.academyCandidates=Array.isArray(state.ui.academyCandidates)?state.ui.academyCandidates:[];
    state.settings=Object.assign({autosave:true,defaultSpeed:1,reducedMotion:false,musicVolume:60},state.settings||{});
    state.transfers=Object.assign({incomingOffers:[],outgoingOffers:[],history:[]},state.transfers||{});
    state.finances=Object.assign({weeklyIncome:52000,transactions:[]},state.finances||{});
    state.news=state.news||[];state.lastView=state.lastView||'dashboard';
    state.training=state.training||{allocations:{},confirmedWeek:0};
    state.training.allocations=Object.assign({aim:10,tactics:10,teamwork:15,fitness:15,rest:10},state.training.allocations||{});
    D.MAPS.forEach((map)=>{
      if(state.training.allocations[map.id]==null)state.training.allocations[map.id]=0;
    });
    state.teams.forEach((team,index)=>{
      team.academy=Array.isArray(team.academy)?team.academy:[];
      team.academyGraduates=Array.isArray(team.academyGraduates)?team.academyGraduates:[];
      const fallbackStaff=D.createStaffForSeed(Number(state.seed||Date.now())+(index+1)*977);
      team.staff=Object.assign(fallbackStaff,team.staff&&typeof team.staff==='object'?team.staff:{});
    });
    state.teams.forEach((team,index)=>{
      if(!team.academy.length&&!team.academyInitialized){
        team.academy=D.createAcademyCandidates(state,team.id,1,5,Number(state.seed||Date.now())+(index+1)*1301);
        team.academyInitialized=true;
      }
      team.academy.forEach((player)=>{player.teamId=team.id;player.inAcademy=true;player.pendingGraduation=false;player.isStarter=false;player.status='Академия';player.academyYears=Number(player.academyYears||0);player.academyWeeks=Number(player.academyWeeks||0);player.academyProgress=player.academyProgress||{};player.academyOvrProgress=Number(player.academyOvrProgress||0);player.stats=player.stats||{matches:0,maps:0,kills:0,deaths:0,assists:0,adr:0,firstKills:0,clutches:0,utility:0,rating:0};player.injuryMatches=Math.max(0,Math.min(3,Number(player.injuryMatches||0)));player.injuryName=player.injuryMatches?String(player.injuryName||'Травма'):'';player.value=D.calculateMarketValue(player.overall,player.potential,player.age);});
      team.academyGraduates.forEach((player)=>{player.teamId=team.id;player.inAcademy=false;player.pendingGraduation=true;player.isStarter=false;player.status='Требуется решение';player.stats=player.stats||{matches:0,maps:0,kills:0,deaths:0,assists:0,adr:0,firstKills:0,clutches:0,utility:0,rating:0};player.injuryMatches=Math.max(0,Math.min(3,Number(player.injuryMatches||0)));player.injuryName=player.injuryMatches?String(player.injuryName||'Травма'):'';player.value=D.calculateMarketValue(player.overall,player.potential,player.age);});
    });
    ensureUniquePlayerIdentity(state);
    state.teams.forEach(team=>{
      applySpecialTeamIdentity(team);
      team.history=team.history||[];
      team.mapSkill=team.mapSkill||{};
      D.MAPS.forEach((map,index)=>{
        if(team.mapSkill[map.id]==null){
          const known=Object.values(team.mapSkill).filter((value)=>Number.isFinite(Number(value))).map(Number);
          const fallback=known.length?known.reduce((sum,value)=>sum+value,0)/known.length:55;
          team.mapSkill[map.id]=D.clamp(Math.round(fallback+(index%2?2:-2)),35,98);
        }
      });
      team.players.forEach(p=>{p.stats=p.stats||{matches:0,maps:0,kills:0,deaths:0,assists:0,adr:0,firstKills:0,clutches:0,utility:0,rating:0};p.isStarter=p.isStarter!==false;p.injuryMatches=Math.max(0,Math.min(3,Number(p.injuryMatches||0)));p.injuryName=p.injuryMatches?String(p.injuryName||'Травма'):'';p.value=D.calculateMarketValue(p.overall,p.potential,p.age);});
    });
    (state.freeAgents||[]).forEach((player)=>{
      player.injuryMatches=Math.max(0,Math.min(3,Number(player.injuryMatches||0)));
      player.injuryName=player.injuryMatches?String(player.injuryName||'Травма'):'';
      player.value=D.calculateMarketValue(player.overall,player.potential,player.age);
    });
    const userTeam=D.getUserTeam(state);
    const currentSeasonNumber=Number(state.season.number||1);
    if((currentSeasonNumber>1||state.season.completed||state.career.completedSeasons.length)&&state.teams.some((team)=>!Number.isFinite(Number(team.tierSeason))))applySeasonRankCategories(state);
    if(currentSeasonNumber>=2&&!state.season.completed&&!state.career.academyCandidateSeasons.includes(currentSeasonNumber)&&!state.ui.academyCandidates.length){
      state.ui.academyCandidates=D.createAcademyCandidates(state,userTeam.id,currentSeasonNumber,3,Number(state.seed||Date.now())+currentSeasonNumber*8181);
      state.ui.academyCandidateSeason=currentSeasonNumber;
      state.career.academyCandidateSeasons.push(currentSeasonNumber);
      state.career.academyCandidateSeasons.sort((a,b)=>a-b);
    }
    const validPreferred=D.MAPS.some((map)=>map.id===state.preferredMap);
    state.preferredMap=validPreferred?state.preferredMap:bestMapForTeam(userTeam);
    userTeam.preferredMap=state.preferredMap;
    (state.season.calendar||[]).forEach((entry)=>{
      if(entry.match&&entry.match.status!=='completed'&&!entry.match.aiTactics)entry.match.aiTactics=Sim.randomAITactics();
    });
    (state.transfers.incomingOffers||[]).forEach((offer)=>{
      const player=D.findPlayer(state,offer.playerId);
      if(player){
        const minimum=Math.round(player.value*.86/5000)*5000;
        offer.amount=Math.max(Number(offer.amount||0),minimum);
      }
    });
    const hasCurrentTournamentEngine=Array.isArray(state.tournaments)
      && state.tournaments.length===D.TOURNAMENTS.length
      && state.tournaments.every((t)=>t.engineVersion===TOURNAMENT_ENGINE_VERSION);
    gameState=state;
    if(!hasCurrentTournamentEngine){
      migrateTournamentSystem(state);
    }else{
      state.tournaments.forEach((t)=>{
        const canonical=D.TOURNAMENTS.find((item)=>item.id===t.id);
        if(canonical){t.name=canonical.name;t.weeks=[...canonical.weeks];t.participants=canonical.participants;t.prize=canonical.prize;t.format=canonical.format;}
        ensureTournamentData(t);
        setTournamentStage(t);
      });
    }
    (state.tournaments||[]).forEach((t)=>{
      if(t.winnerId===state.userTeamId&&!state.career.tournamentWins.some((item)=>item.tournamentId===t.id&&Number(item.season)===Number(state.season.number))){
        state.career.tournamentWins.push({tournamentId:t.id,season:Number(state.season.number)});
      }
    });
    state.career.tournamentWins.sort((a,b)=>a.season-b.season||a.tournamentId.localeCompare(b.tournamentId));
    if(state.season&&Array.isArray(state.season.calendar)){
      state.season.calendar.forEach((entry)=>{
        if(!entry.match)return;
        const canonical=D.TOURNAMENTS.find((item)=>item.id===entry.match.tournamentId);
        if(canonical)entry.match.tournamentName=canonical.name;
      });
      const worldObjective=(state.season.objectives||[]).find((objective)=>objective.id==='world');
      if(worldObjective)worldObjective.text='Выиграть MAJOR MASTERS DIVISION';
      const ratingsByPlayer={};
      state.season.calendar.forEach((entry)=>{
        const result=entry.match&&entry.match.result;
        if(!result||!Array.isArray(result.stats))return;
        const rounds=(result.mapResults||[]).reduce((sum,map)=>sum+Number(map.scoreA||0)+Number(map.scoreB||0),0)||1;
        result.stats.forEach((row)=>{
          row.rating=Sim.calculatePlayerRating(row,rounds,row.teamId===result.winnerId);
          if(!ratingsByPlayer[row.playerId])ratingsByPlayer[row.playerId]=[];
          ratingsByPlayer[row.playerId].push(row.rating);
        });
        result.stats.sort((a,b)=>b.rating-a.rating);
        result.mvp=result.stats[0];
      });
      state.teams.forEach((team)=>team.players.forEach((player)=>{
        const ratings=ratingsByPlayer[player.id];
        if(ratings&&ratings.length)player.stats.rating=Number((ratings.reduce((sum,value)=>sum+value,0)/ratings.length).toFixed(2));
      }));
      const lastCompleted=[...state.season.calendar].reverse().find((entry)=>entry.match&&entry.match.result);
      if(lastCompleted)state.lastMatch=lastCompleted.match.result;
    }
    D.updateRanks(state, false);
    if(state.season.completed){
      if(!state.season.championId)state.season.championId=[...state.teams].sort((a,b)=>a.rank-b.rank)[0].id;
      if(!state.season.summary)state.season.summary=buildSeasonSummaryForState(state);
      const index=state.career.completedSeasons.findIndex((item)=>Number(item.number)===Number(state.season.summary.number));
      if(index>=0)state.career.completedSeasons[index]=state.season.summary;else state.career.completedSeasons.push(state.season.summary);
      state.career.completedSeasons.sort((a,b)=>a.number-b.number);
    }
    return state;
  }

  document.addEventListener('click',handleClick);
  document.addEventListener('input',handleInput);
  document.addEventListener('change',handleChange);
  document.addEventListener('submit',handleSubmit);
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape')closeModal();});
  document.addEventListener('pointerdown', unlockAudio, { passive: true });
  document.addEventListener('keydown', unlockAudio, { passive: true });

  updateBackgroundMusicVolume();
  renderApp();
})();
