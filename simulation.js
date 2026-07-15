(function () {
  'use strict';

  const D = window.GameData;

  function isPlayerInjured(player) {
    return Number(player && player.injuryMatches || 0) > 0;
  }

  function starterLineup(team) {
    const seniorPlayers = Array.isArray(team && team.players) ? team.players : [];
    const healthy = seniorPlayers.filter((player) => !isPlayerInjured(player));
    const starters = healthy.filter((player) => player.isStarter).slice(0, 5);
    if (starters.length < 5) {
      const reserves = healthy.filter((player) => !player.isStarter).sort((a,b)=>b.overall-a.overall).slice(0, 5 - starters.length);
      starters.push(...reserves);
    }
    // Если здоровых игроков основы и резерва не хватает, команда получает
    // временный экстренный вызов лучших здоровых воспитанников. Игрок остаётся в академии.
    if (starters.length < 5) {
      const academy = (team.academy || []).filter((player) => !isPlayerInjured(player)).sort((a,b)=>b.overall-a.overall).slice(0, 5 - starters.length);
      starters.push(...academy);
    }
    return starters.slice(0, 5);
  }

  function injuryRiskForFatigue(fatigue) {
    const value = Number(fatigue || 0);
    if (value >= 95) return 0.024;
    if (value >= 85) return 0.012;
    if (value >= 75) return 0.006;
    if (value >= 60) return 0.0025;
    return 0.0008;
  }

  function tickTeamInjuries(team) {
    const recovered = [];
    [...(team.players || []), ...(team.academy || [])].forEach((player) => {
      const remaining = Number(player.injuryMatches || 0);
      if (remaining <= 0) return;
      player.injuryMatches = Math.max(0, remaining - 1);
      if (player.injuryMatches === 0) {
        recovered.push(player);
        player.injuryName = '';
      }
    });
    return recovered;
  }

  function rollMatchInjuries(team, participants) {
    const injuries = [];
    const injuryNames = ['Перегрузка запястья', 'Растяжение кисти', 'Мышечное перенапряжение', 'Боль в спине'];
    (participants || []).forEach((player) => {
      if (!player || isPlayerInjured(player)) return;
      if (Math.random() >= injuryRiskForFatigue(player.fatigue)) return;
      const roll = Math.random();
      const games = roll < 0.72 ? 1 : roll < 0.94 ? 2 : 3;
      player.injuryMatches = Math.min(3, games);
      player.injuryName = injuryNames[Math.floor(Math.random() * injuryNames.length)];
      injuries.push({ playerId: player.id, teamId: team.id, matches: player.injuryMatches, name: player.injuryName });
    });
    return injuries;
  }

  function processTeamMatchInjuries(team, participants) {
    const recovered = tickTeamInjuries(team);
    const injuries = rollMatchInjuries(team, participants);
    return { recovered, injuries };
  }

  function calculatePlayerRating(row, rounds, isWinner) {
    const safeRounds = Math.max(1, Number(rounds) || 1);
    const killDiffImpact = ((Number(row.kills) || 0) - (Number(row.deaths) || 0)) / safeRounds * 1.15;
    const adrImpact = ((Number(row.adr) || 0) - 80) / 140 * 0.35;
    const assistImpact = (Number(row.assists) || 0) / safeRounds * 0.18;
    const openingImpact = (Number(row.firstKills) || 0) / safeRounds * 0.22;
    const clutchImpact = (Number(row.clutches) || 0) * 0.05;
    const resultImpact = isWinner ? 0.03 : -0.03;
    return Number(D.clamp(1 + killDiffImpact + adrImpact + assistImpact + openingImpact + clutchImpact + resultImpact, 0.40, 2.00).toFixed(2));
  }

  function playerEffective(player, extraBonus) {
    const moraleMod = (player.morale - 60) * 0.045;
    const fatigueMod = -Math.max(0, player.fatigue - 35) * 0.055;
    const formMod = (player.form - 55) * 0.065;
    return D.clamp(player.overall + moraleMod + fatigueMod + formMod + Number(extraBonus || 0), 35, 106);
  }

  function aggressionLevel(tactics) {
    if (!tactics) return 50;
    const numeric = Number(tactics.aggression);
    if (Number.isFinite(numeric)) return D.clamp(numeric, 0, 100);
    return { 'Низкая': 35, 'Средняя': 55, 'Высокая': 80 }[tactics.aggression] || 50;
  }

  function tempoMatchupModifier(tempo, opponentTempo) {
    if (!tempo || !opponentTempo || tempo === opponentTempo) return 0;
    const beats = {
      'Медленный': 'Сбалансированный',
      'Быстрый': 'Медленный',
      'Сбалансированный': 'Быстрый'
    };
    if (beats[tempo] === opponentTempo) return 0.30;
    if (beats[opponentTempo] === tempo) return -0.30;
    return 0;
  }

  function attackPlanModifier(attack, opponentDefense) {
    const matchups = {
      'Быстрый выход A': { good: 'Усилить B', bad: 'Усилить A' },
      'Быстрый выход B': { good: 'Усилить A', bad: 'Усилить B' },
      'Игра через центр': { good: 'Агрессивная защита', bad: 'Пассивная защита' },
      'Медленная атака': { good: 'Пассивная защита', bad: 'Агрессивная защита' },
      'Контроль карты': { good: 'Ранний сбор информации', bad: 'Стандартная защита' },
      'Ложный выход': { good: 'Стандартная защита', bad: 'Ранний сбор информации' }
    };
    const matchup = matchups[attack];
    if (!matchup) return 0;
    if (opponentDefense === matchup.good) return 0.80;
    if (opponentDefense === matchup.bad) return -0.80;
    return 0;
  }

  function tacticsModifier(tactics, opponentTactics, side) {
    if (!tactics) return 0;
    let mod = 0;

    if (opponentTactics) mod += tempoMatchupModifier(tactics.tempo, opponentTactics.tempo);

    if (tactics.tempo === 'Быстрый' && aggressionLevel(tactics) >= 70) mod += 0.25;
    if (tactics.tempo === 'Медленный' && Number(tactics.discipline || 0) >= 70) mod += 0.25;
    if (tactics.tempo === 'Сбалансированный' && Number(tactics.utility || 0) >= 70) mod += 0.25;

    if (tactics.risk === 'Осторожный') mod += side === 'DEF' ? 0.45 : -0.25;
    else if (tactics.risk === 'Рискованный') mod += side === 'ATK' ? 0.45 : -0.25;
    else if (tactics.risk === 'Стандартный') mod += 0.10;

    // Результат пары «атака против защиты» меняет только силу атакующей команды.
    // Защитник не получает зеркальный бонус, поэтому общий разрыв не удваивается.
    if (side === 'ATK' && opponentTactics) {
      mod += attackPlanModifier(tactics.attack, opponentTactics.defense);
    }
    return mod;
  }

  function comparePlayersForAttribute(a, b, attribute) {
    const attrDiff = Number(b.attrs[attribute] || 0) - Number(a.attrs[attribute] || 0);
    if (attrDiff) return attrDiff;
    const overallDiff = Number(b.overall || 0) - Number(a.overall || 0);
    if (overallDiff) return overallDiff;
    const formDiff = Number(b.form || 0) - Number(a.form || 0);
    if (formDiff) return formDiff;
    return String(a.id).localeCompare(String(b.id));
  }

  function bestCurrentPlayer(players) {
    return [...players].sort((a, b) => {
      const effectiveDiff = playerEffective(b) - playerEffective(a);
      if (effectiveDiff) return effectiveDiff;
      const overallDiff = Number(b.overall || 0) - Number(a.overall || 0);
      if (overallDiff) return overallDiff;
      const formDiff = Number(b.form || 0) - Number(a.form || 0);
      if (formDiff) return formDiff;
      return String(a.id).localeCompare(String(b.id));
    })[0] || null;
  }

  function setMaxBonus(bonusMap, playerId, value) {
    bonusMap[playerId] = Math.max(Number(bonusMap[playerId] || 0), Number(value || 0));
  }

  function addBonus(bonusMap, playerId, value) {
    bonusMap[playerId] = Number(bonusMap[playerId] || 0) + Number(value || 0);
  }

  function tacticalPlayerBonuses(team, tactics) {
    const lineup = starterLineup(team);
    const bonuses = {};
    if (!tactics || !lineup.length) return bonuses;

    // После значения 80 лучший саппорт получает постепенно растущий временный бонус.
    // Более высокое значение сильнее раскрывает саппорта, но одновременно увеличивает расходы экономики.
    const utility = Number(tactics.utility || 0);
    if (utility > 80) {
      const support = bestCurrentPlayer(lineup.filter((player) => player.role === 'Саппорт'));
      const supportBonus = utility >= 100 ? 1 : utility >= 90 ? 0.75 : 0.5;
      if (support) addBonus(bonuses, support.id, supportBonus);
    }

    // Высокая дисциплина усиливает одного капитана. При дисциплине ниже 70
    // бонус получает один лучший рифлер/энтри, а при их отсутствии — снайпер.
    if (Number(tactics.discipline || 0) >= 70) {
      const captain = bestCurrentPlayer(lineup.filter((player) => player.role === 'Капитан'));
      if (captain) addBonus(bonuses, captain.id, 1);
    } else {
      let candidates = lineup.filter((player) => player.role === 'Рифлер' || player.role === 'Энтри');
      if (!candidates.length) candidates = lineup.filter((player) => player.role === 'Снайпер');
      const improvisor = bestCurrentPlayer(candidates);
      if (improvisor) addBonus(bonuses, improvisor.id, 1);
    }
    return bonuses;
  }

  function mapPlayerBonuses(teamA, teamB, mapId) {
    const allPlayers = [...starterLineup(teamA), ...starterLineup(teamB)];
    const bonuses = {};
    const profiles = {
      district: { roles: ['Капитан', 'Саппорт'], attributes: ['tactics', 'utility'] },
      foundry: { roles: ['Снайпер', 'Энтри'], attributes: ['reaction'] },
      transit: { roles: ['Люркер', 'Универсал'], attributes: ['positioning'] },
      bastion: { roles: ['Рифлер', 'Саппорт'], attributes: ['discipline'] },
      harbor: { roles: ['Снайпер', 'Универсал'], attributes: ['composure'] }
    };
    const profile = profiles[mapId];
    if (!profile || !allPlayers.length) return bonuses;

    allPlayers.forEach((player) => {
      if (profile.roles.includes(player.role)) setMaxBonus(bonuses, player.id, 1);
    });

    profile.attributes.forEach((attribute) => {
      const best = [...allPlayers].sort((a, b) => comparePlayersForAttribute(a, b, attribute))[0];
      if (best) setMaxBonus(bonuses, best.id, 0.7);
    });
    return bonuses;
  }

  function combinedPlayerBonuses(team, opponentTeam, mapId, tactics) {
    const mapBonuses = mapPlayerBonuses(team, opponentTeam, mapId);
    const tacticalBonuses = tacticalPlayerBonuses(team, tactics);
    const result = {};
    starterLineup(team).forEach((player) => {
      result[player.id] = Number(mapBonuses[player.id] || 0) + Number(tacticalBonuses[player.id] || 0);
    });
    return result;
  }

  function calculateTeamPower(team, opponentTeam, mapId, tactics, opponentTactics, side) {
    const lineup = starterLineup(team);
    const playerBonuses = combinedPlayerBonuses(team, opponentTeam, mapId, tactics);
    const playerPower = lineup.reduce((sum, player) => sum + playerEffective(player, playerBonuses[player.id]), 0) / Math.max(1, lineup.length);
    const mapPower = team.mapSkill[mapId] || 60;
    const chemistry = team.chemistry || 50;
    const role = D.roleBalance(team).bonus;
    const tactical = tacticsModifier(tactics, opponentTactics, side);
    const sideBonus = side === 'DEF' ? 0.7 : 0;
    const priorityBonus = team.preferredMap === mapId ? 0.45 : 0;
    return playerPower * 0.67 + mapPower * 0.18 + chemistry * 0.11 + role + tactical + sideBonus + priorityBonus;
  }

  function estimateWinChance(teamA, teamB, mapId, tacticsA, tacticsB, powerBonusA, powerBonusB) {
    // Прогноз относится ко всей карте, поэтому усредняем обе половины:
    // A в атаке / B в защите и A в защите / B в атаке.
    // Две одинаковые команды теперь получают около 50/50, а не 47.6/52.4 из-за стартовой стороны.
    const bonusA = Number(powerBonusA || 0);
    const bonusB = Number(powerBonusB || 0);
    const diffFirstHalf = (calculateTeamPower(teamA, teamB, mapId, tacticsA, tacticsB, 'ATK') + bonusA)
      - (calculateTeamPower(teamB, teamA, mapId, tacticsB, tacticsA, 'DEF') + bonusB);
    const diffSecondHalf = (calculateTeamPower(teamA, teamB, mapId, tacticsA, tacticsB, 'DEF') + bonusA)
      - (calculateTeamPower(teamB, teamA, mapId, tacticsB, tacticsA, 'ATK') + bonusB);
    const averageDifference = (diffFirstHalf + diffSecondHalf) / 2;
    const chance = 1 / (1 + Math.exp(-averageDifference / 7.4));
    return D.clamp(chance, 0.08, 0.92);
  }

  function weightedPlayer(lineup, statKey, effectiveBonuses) {
    const weights = lineup.map((player) => {
      let weight = playerEffective(player, effectiveBonuses && effectiveBonuses[player.id]);
      if (statKey && player.attrs[statKey]) weight += player.attrs[statKey] * 0.25;
      if (player.role === 'Энтри' && statKey === 'reaction') weight += 10;
      if (player.role === 'Снайпер' && statKey === 'aim') weight += 10;
      return Math.max(1, weight);
    });
    const total = weights.reduce((sum, value) => sum + value, 0);
    let roll = Math.random() * total;
    for (let index = 0; index < lineup.length; index += 1) {
      roll -= weights[index];
      if (roll <= 0) return lineup[index];
    }
    return lineup[lineup.length - 1];
  }

  function randomTime(index, total) {
    const seconds = Math.max(2, Math.round(105 - ((index + 1) / (total + 1)) * 100 + (Math.random() * 10 - 5)));
    const minute = Math.floor(seconds / 60);
    const second = String(seconds % 60).padStart(2, '0');
    return `${String(minute).padStart(2, '0')}:${second}`;
  }

  function addStat(stats, playerId, key, amount) {
    if (!stats[playerId]) return;
    stats[playerId][key] = (stats[playerId][key] || 0) + amount;
  }

  function sideForTeamA(totalRounds) {
    const played = Math.max(0, Number(totalRounds) || 0);
    if (played < 24) return played < 12 ? 'ATK' : 'DEF';
    // В овертайме стороны меняются каждые три раунда: 25–27, 28–30 и далее.
    const overtimeRound = played - 24;
    return Math.floor(overtimeRound / 3) % 2 === 0 ? 'ATK' : 'DEF';
  }

  function takeWeightedPlayer(pool, statKey, effectiveBonuses) {
    if (!pool.length) return null;
    const player = weightedPlayer(pool, statKey, effectiveBonuses);
    const index = pool.findIndex((item) => item.id === player.id);
    if (index >= 0) pool.splice(index, 1);
    return player;
  }

  function excessiveUtilityCost(tactics) {
    const utility = Number(tactics && tactics.utility || 0);
    if (utility <= 80) return 0;
    // Дополнительный расход начисляется постепенно в каждом раунде:
    // 85 = $50, 90 = $150, 95 = $200, 100 = $250.
    return Math.round(((utility - 80) * 12.5) / 50) * 50;
  }

  function createRound(match) {
    const sideA = sideForTeamA(Number(match.mapScoreA || 0) + Number(match.mapScoreB || 0));
    const sideB = sideA === 'ATK' ? 'DEF' : 'ATK';
    const mapId = match.maps[match.mapIndex];
    const effectiveBonusesA = combinedPlayerBonuses(match.teamA, match.teamB, mapId, match.tacticsA);
    const effectiveBonusesB = combinedPlayerBonuses(match.teamB, match.teamA, mapId, match.tacticsB);
    const powerA = calculateTeamPower(match.teamA, match.teamB, mapId, match.tacticsA, match.tacticsB, sideA) + Number(match.powerBonusA || 0);
    const powerB = calculateTeamPower(match.teamB, match.teamA, mapId, match.tacticsB, match.tacticsA, sideB) + Number(match.powerBonusB || 0);
    const economyA = match.economyA;
    const economyB = match.economyB;
    const ecoModA = economyA < 2500 ? -2.6 : economyA > 16500 ? 0.8 : 0;
    const ecoModB = economyB < 2500 ? -2.6 : economyB > 16500 ? 0.8 : 0;
    // Предматчевый процент относится к шансу выиграть карту, а не один раунд.
    // Поэтому разница силы переводится в вероятность раунда мягко: +5 силы ≈ 53.75% на раунд,
    // что на дистанции карты даёт примерно 65–66% на победу.
    const roundPowerDiff = (powerA + ecoModA) - (powerB + ecoModB);
    const pA = D.clamp(0.5 + roundPowerDiff * 0.0075, 0.15, 0.85);
    const aWon = Math.random() < pA;
    const winnerTeam = aWon ? match.teamA : match.teamB;
    const loserTeam = aWon ? match.teamB : match.teamA;
    const winnerLineup = aWon ? match.lineupA : match.lineupB;
    const loserLineup = aWon ? match.lineupB : match.lineupA;

    const winnerSurvivors = Math.floor(Math.random() * 5) + 1;
    const loserSurvivors = Math.random() < 0.13 ? 1 : 0;
    const winnerKills = 5 - loserSurvivors;
    const loserKills = 5 - winnerSurvivors;
    const killSequence = [];
    const availableLoserVictims = [...loserLineup];
    const availableWinnerVictims = [...winnerLineup];

    // Жертвы выбираются без возвращения в пул. Один игрок физически не может
    // получить две смерти в одном раунде, а K/D и рейтинг больше не искажаются.
    for (let i = 0; i < winnerKills; i += 1) {
      const victim = takeWeightedPlayer(availableLoserVictims);
      if (victim) killSequence.push({ killer: weightedPlayer(winnerLineup, i === 0 ? 'reaction' : 'aim', aWon ? effectiveBonusesA : effectiveBonusesB), victim, team: winnerTeam.id });
    }
    for (let i = 0; i < loserKills; i += 1) {
      const victim = takeWeightedPlayer(availableWinnerVictims);
      if (victim) killSequence.push({ killer: weightedPlayer(loserLineup, 'aim', aWon ? effectiveBonusesB : effectiveBonusesA), victim, team: loserTeam.id });
    }
    killSequence.sort(() => Math.random() - 0.5);

    const aliveA = new Set(match.lineupA.map((player) => player.id));
    const aliveB = new Set(match.lineupB.map((player) => player.id));
    const events = [];
    // Оставляем место для всех убийств, тактического события и итога раунда.
    // Раньше часть убийств могла исчезать из статистики из-за жёсткого лимита событий.
    const eventCount = Math.min(12, killSequence.length + 4);
    const firstDuel = killSequence[0];
    const firstTeam = firstDuel.team === match.teamA.id ? match.teamA : match.teamB;

    events.push({
      type: 'first',
      text: `${firstDuel.killer.nickname} выигрывает стартовую перестрелку для ${firstTeam.tag}.`,
      action: { kind: 'kill', data: firstDuel }
    });

    const tacticalPool = [];
    const attackTactics = sideA === 'ATK' ? match.tacticsA : match.tacticsB;
    const attackTeam = sideA === 'ATK' ? match.teamA : match.teamB;
    if (attackTactics.attack === 'Контроль карты') tacticalPool.push(`${attackTeam.tag} методично забирает пространство и удерживает ключевые углы.`);
    if (attackTactics.attack === 'Быстрый выход A') tacticalPool.push(`${attackTeam.tag} начинает быстрый выход на точку A под серией гранат.`);
    if (attackTactics.attack === 'Быстрый выход B') tacticalPool.push(`${attackTeam.tag} резко ускоряется в сторону точки B.`);
    if (attackTactics.attack === 'Игра через центр') tacticalPool.push(`${attackTeam.tag} вкладывает ресурсы в контроль центра.`);
    if (attackTactics.attack === 'Медленная атака') tacticalPool.push(`${attackTeam.tag} тянет время и вынуждает защиту раскрыть позиции.`);
    if (attackTactics.attack === 'Ложный выход') tacticalPool.push(`${attackTeam.tag} показывает давление на одной точке и готовит смену направления.`);
    tacticalPool.push(`${attackTeam.tag} использует ${Math.floor(2 + Math.random() * 4)} гранаты для захвата пространства.`);
    tacticalPool.push(`Защита начинает раннюю перетяжку после полученной информации.`);

    const middleEvents = [];
    middleEvents.push({ type: 'normal', text: tacticalPool[Math.floor(Math.random() * tacticalPool.length)] });
    for (let i = 1; i < killSequence.length && middleEvents.length < eventCount - 2; i += 1) {
      const duel = killSequence[i];
      const sameKiller = i > 1 && killSequence[i - 1].killer.id === duel.killer.id;
      middleEvents.push({
        type: sameKiller ? 'multi' : 'kill',
        text: sameKiller ? `${duel.killer.nickname} делает двойное убийство и ломает расстановку соперника.` : `${duel.killer.nickname} переигрывает ${duel.victim.nickname} в дуэли.`,
        action: { kind: 'kill', data: duel }
      });
    }

    const planted = sideA === 'ATK' ? (aWon ? Math.random() < 0.72 : Math.random() < 0.48) : (!aWon ? Math.random() < 0.72 : Math.random() < 0.48);
    if (planted && middleEvents.length < eventCount - 1) {
      middleEvents.push({ type: 'plant', text: `Устройство установлено. Защите приходится начинать ретейк.` });
    }

    if (Math.random() < 0.18 && middleEvents.length < eventCount - 1) {
      const clutcher = weightedPlayer(winnerLineup, 'composure', aWon ? effectiveBonusesA : effectiveBonusesB);
      middleEvents.push({ type: 'clutch', text: `${clutcher.nickname} остаётся в меньшинстве и выигрывает решающий клатч.`, action: { kind: 'clutch', playerId: clutcher.id } });
    }

    if ((economyA < 2500 || economyB < 2500) && middleEvents.length < eventCount - 1) {
      const ecoTeam = economyA < economyB ? match.teamA : match.teamB;
      middleEvents.unshift({ type: 'economy', text: `${ecoTeam.tag} проводит экономический раунд с ограниченной закупкой.` });
    }

    middleEvents.slice(0, Math.max(1, eventCount - 2)).forEach((event) => events.push(event));
    events.push({ type: 'round', text: `РАУНД ВЫИГРЫВАЕТ ${winnerTeam.name.toUpperCase()}.` });

    // Apply stat changes and derive alive counters in event order.
    events.forEach((event, index) => {
      if (event.action && event.action.kind === 'kill') {
        const duel = event.action.data;
        addStat(match.stats, duel.killer.id, 'kills', 1);
        addStat(match.stats, duel.victim.id, 'deaths', 1);
        if (Math.random() < 0.42) {
          const assistLineup = duel.team === match.teamA.id ? match.lineupA : match.lineupB;
          const assistantBonuses = duel.team === match.teamA.id ? effectiveBonusesA : effectiveBonusesB;
          const assistant = weightedPlayer(assistLineup.filter((p) => p.id !== duel.killer.id), null, assistantBonuses);
          if (assistant) addStat(match.stats, assistant.id, 'assists', 1);
        }
        if (index === 0) addStat(match.stats, duel.killer.id, 'firstKills', 1);
        if (duel.victim.teamId === match.teamA.id) aliveA.delete(duel.victim.id); else aliveB.delete(duel.victim.id);
      }
      if (event.action && event.action.kind === 'clutch') addStat(match.stats, event.action.playerId, 'clutches', 1);
      event.aliveA = aliveA.size;
      event.aliveB = aliveB.size;
      event.time = randomTime(index, events.length);
      delete event.action;
    });

    const utilityTeam = Math.random() < 0.5 ? match.lineupA : match.lineupB;
    utilityTeam.forEach((player) => addStat(match.stats, player.id, 'utility', Math.floor(Math.random() * 20) + 8));
    [...match.lineupA, ...match.lineupB].forEach((player) => addStat(match.stats, player.id, 'damage', Math.floor(Math.random() * 75) + 28));

    return {
      aWon, events, pA, winnerTeam, sideA, sideB, winnerSurvivors, loserSurvivors,
      utilityCostA: excessiveUtilityCost(match.tacticsA),
      utilityCostB: excessiveUtilityCost(match.tacticsB)
    };
  }

  function mapFinished(scoreA, scoreB) {
    const max = Math.max(scoreA, scoreB);
    const min = Math.min(scoreA, scoreB);
    if (max >= 13 && min <= 11) return true;
    if (min < 12) return false;
    // Каждый блок овертайма состоит из шести раундов. После 15:15
    // следующая победная отметка — 19, после 18:18 — 22 и так далее.
    const overtimeCycle = Math.floor((min - 12) / 3);
    const target = 16 + overtimeCycle * 3;
    return max >= target && max - min >= 2;
  }

  function initPlayerStats(lineups) {
    const stats = {};
    lineups.flat().forEach((player) => {
      stats[player.id] = { playerId: player.id, kills: 0, deaths: 0, assists: 0, damage: 0, firstKills: 0, clutches: 0, utility: 0, maps: 0, rating: 0, adr: 0 };
    });
    return stats;
  }

  class MatchController {
    constructor(options) {
      this.state = options.state;
      this.teamA = options.teamA;
      this.teamB = options.teamB;
      this.maps = options.maps;
      this.format = options.format || 'BO1';
      this.tacticsA = options.tacticsA;
      this.tacticsB = options.tacticsB || randomAITactics();
      this.powerBonusA = Number(options.powerBonusA || 0);
      this.powerBonusB = Number(options.powerBonusB || 0);
      this.onUpdate = options.onUpdate || function () {};
      this.onEvent = options.onEvent || function () {};
      this.onComplete = options.onComplete || function () {};
      this.onMapComplete = options.onMapComplete || function () {};
      this.lineupA = starterLineup(this.teamA);
      this.lineupB = starterLineup(this.teamB);
      this.stats = initPlayerStats([this.lineupA, this.lineupB]);
      this.mapIndex = 0;
      this.mapScoreA = 0;
      this.mapScoreB = 0;
      this.mapsWonA = 0;
      this.mapsWonB = 0;
      this.mapResults = [];
      this.totalRounds = 0;
      this.round = 1;
      this.economyA = 4000;
      this.economyB = 4000;
      this.lossBonusA = 1900;
      this.lossBonusB = 1900;
      this.aliveA = 5;
      this.aliveB = 5;
      this.paused = true;
      this.speed = Number(this.state.settings.defaultSpeed) || 1;
      this.fastForward = false;
      this.timeout = null;
      this.currentEvents = [];
      this.currentEventIndex = 0;
      this.currentRoundResult = null;
      this.finished = false;
      this.lastSideA = sideForTeamA(0);
      this.emitUpdate();
    }

    get snapshot() {
      return {
        teamA: this.teamA,
        teamB: this.teamB,
        currentMap: D.MAPS.find((map) => map.id === this.maps[this.mapIndex]),
        mapIndex: this.mapIndex,
        maps: this.maps,
        scoreA: this.mapScoreA,
        scoreB: this.mapScoreB,
        mapsWonA: this.mapsWonA,
        mapsWonB: this.mapsWonB,
        round: this.round,
        sideA: sideForTeamA(this.mapScoreA + this.mapScoreB),
        sideB: sideForTeamA(this.mapScoreA + this.mapScoreB) === 'ATK' ? 'DEF' : 'ATK',
        economyA: this.economyA,
        economyB: this.economyB,
        aliveA: this.aliveA,
        aliveB: this.aliveB,
        speed: this.speed,
        paused: this.paused,
        fastForward: this.fastForward,
        chanceA: estimateWinChance(this.teamA, this.teamB, this.maps[this.mapIndex], this.tacticsA, this.tacticsB, this.powerBonusA, this.powerBonusB)
      };
    }

    emitUpdate() {
      this.onUpdate(this.snapshot);
    }

    start() {
      if (this.finished) return;
      this.paused = false;
      this.emitUpdate();
      if (!this.currentEvents.length) this.beginRound(); else this.playNextEvent();
    }

    pause() {
      this.paused = true;
      clearTimeout(this.timeout);
      this.emitUpdate();
    }

    resume() {
      this.start();
    }

    setSpeed(speed) {
      this.speed = Number(speed);
      this.fastForward = false;
      this.emitUpdate();
    }

    simulateToEnd() {
      this.fastForward = true;
      this.paused = false;
      this.emitUpdate();
      this.playNextEvent();
    }

    skipRound() {
      if (this.finished) return;
      clearTimeout(this.timeout);
      if (!this.currentEvents.length) this.beginRound();
      while (this.currentEventIndex < this.currentEvents.length) {
        const event = this.currentEvents[this.currentEventIndex++];
        this.aliveA = event.aliveA;
        this.aliveB = event.aliveB;
        if (event.type === 'round') this.onEvent(event, true);
      }
      this.finishRound();
    }

    beginRound() {
      if (this.paused || this.finished) return;
      this.aliveA = 5;
      this.aliveB = 5;
      const currentSideA = sideForTeamA(this.mapScoreA + this.mapScoreB);
      if (currentSideA !== this.lastSideA) {
        const currentSideB = currentSideA === 'ATK' ? 'DEF' : 'ATK';
        this.onEvent({type:'normal',time:'SIDE',text:`СМЕНА СТОРОН: ${this.teamA.tag} — ${currentSideA}, ${this.teamB.tag} — ${currentSideB}.`}, false);
        this.lastSideA = currentSideA;
      }
      this.currentRoundResult = createRound(this);
      this.currentEvents = this.currentRoundResult.events;
      this.currentEventIndex = 0;
      this.emitUpdate();
      this.playNextEvent();
    }

    playNextEvent() {
      if (this.paused || this.finished) return;
      if (!this.currentEvents.length) {
        this.beginRound();
        return;
      }
      if (this.currentEventIndex >= this.currentEvents.length) {
        this.finishRound();
        return;
      }
      const event = this.currentEvents[this.currentEventIndex++];
      this.aliveA = event.aliveA;
      this.aliveB = event.aliveB;
      this.onEvent(event, false);
      this.emitUpdate();
      const delay = this.fastForward ? 24 : Math.max(85, 720 / this.speed);
      this.timeout = setTimeout(() => this.playNextEvent(), delay);
    }

    finishRound() {
      if (!this.currentRoundResult) return;
      const aWon = this.currentRoundResult.aWon;
      const utilityCostA = Number(this.currentRoundResult.utilityCostA || 0);
      const utilityCostB = Number(this.currentRoundResult.utilityCostB || 0);
      if (aWon) {
        this.mapScoreA += 1;
        this.economyA = D.clamp(this.economyA - 3600 - utilityCostA + 3250 + 300, 0, 24000);
        this.economyB = D.clamp(this.economyB - 3300 - utilityCostB + this.lossBonusB, 0, 24000);
        this.lossBonusA = 1900;
        this.lossBonusB = D.clamp(this.lossBonusB + 500, 1900, 3400);
      } else {
        this.mapScoreB += 1;
        this.economyB = D.clamp(this.economyB - 3600 - utilityCostB + 3250 + 300, 0, 24000);
        this.economyA = D.clamp(this.economyA - 3300 - utilityCostA + this.lossBonusA, 0, 24000);
        this.lossBonusB = 1900;
        this.lossBonusA = D.clamp(this.lossBonusA + 500, 1900, 3400);
      }
      this.totalRounds += 1;
      this.round += 1;
      this.currentEvents = [];
      this.currentEventIndex = 0;
      this.currentRoundResult = null;
      this.emitUpdate();

      if (mapFinished(this.mapScoreA, this.mapScoreB)) {
        this.finishMap();
      } else if (!this.paused) {
        const delay = this.fastForward ? 35 : Math.max(180, 900 / this.speed);
        this.timeout = setTimeout(() => this.beginRound(), delay);
      }
    }

    finishMap() {
      const mapId = this.maps[this.mapIndex];
      const winnerId = this.mapScoreA > this.mapScoreB ? this.teamA.id : this.teamB.id;
      if (winnerId === this.teamA.id) this.mapsWonA += 1; else this.mapsWonB += 1;
      this.mapResults.push({ mapId, scoreA: this.mapScoreA, scoreB: this.mapScoreB, winnerId });
      [...this.lineupA, ...this.lineupB].forEach((player) => addStat(this.stats, player.id, 'maps', 1));
      this.onMapComplete(this.mapResults[this.mapResults.length - 1]);

      const needed = this.format === 'BO3' ? 2 : 1;
      if (this.mapsWonA >= needed || this.mapsWonB >= needed || this.mapIndex >= this.maps.length - 1) {
        this.finishMatch();
        return;
      }

      this.mapIndex += 1;
      this.mapScoreA = 0;
      this.mapScoreB = 0;
      this.round = 1;
      this.totalRounds = 0;
      this.economyA = 4000;
      this.economyB = 4000;
      this.lossBonusA = 1900;
      this.lossBonusB = 1900;
      this.lastSideA = sideForTeamA(0);
      this.aliveA = 5;
      this.aliveB = 5;
      this.emitUpdate();
      if (!this.paused) this.timeout = setTimeout(() => this.beginRound(), this.fastForward ? 60 : 900);
    }

    finishMatch() {
      this.finished = true;
      this.paused = true;
      clearTimeout(this.timeout);
      const winnerId = this.mapsWonA > this.mapsWonB ? this.teamA.id : this.teamB.id;
      const result = finalizeMatchResult(this, winnerId);
      this.onComplete(result);
    }
  }

  function finalizeMatchResult(controller, winnerId) {
    const current = D.getCurrentCalendarEntry(controller.state);
    const isFriendly = Boolean(current && current.match && current.match.friendly);
    const allStats = Object.values(controller.stats).map((row) => {
      const player = D.findPlayer(controller.state, row.playerId);
      const rounds = controller.mapResults.reduce((sum, map) => sum + map.scoreA + map.scoreB, 0) || 1;
      row.adr = Math.round(row.damage / Math.max(1, rounds));
      row.nickname = player ? player.nickname : 'UNKNOWN';
      row.teamId = player ? player.teamId : null;
      row.rating = calculatePlayerRating(row, rounds, row.teamId === winnerId);
      return row;
    });
    allStats.sort((a, b) => b.rating - a.rating);

    const winner = winnerId === controller.teamA.id ? controller.teamA : controller.teamB;
    const loser = winnerId === controller.teamA.id ? controller.teamB : controller.teamA;
    const expectedWinner = 1 / (1 + Math.pow(10, (loser.ratingPoints - winner.ratingPoints) / 320));
    const baseGain = Math.round(28 * (1.25 - expectedWinner));
    const points = isFriendly ? 0 : D.clamp(baseGain, 10, 38);
    if (!isFriendly) {
      winner.ratingPoints += points;
      loser.ratingPoints = Math.max(100, loser.ratingPoints - Math.round(points * 0.78));
    }
    winner.winStreak = (winner.winStreak || 0) + 1;
    winner.lossStreak = 0;
    loser.lossStreak = (loser.lossStreak || 0) + 1;
    loser.winStreak = 0;
    winner.history.unshift('W');
    loser.history.unshift('L');
    winner.history = winner.history.slice(0, 8);
    loser.history = loser.history.slice(0, 8);

    const userWon = winnerId === controller.state.userTeamId;
    const userTeam = D.getUserTeam(controller.state);
    const userPlayers = starterLineup(userTeam);
    userPlayers.forEach((player) => {
      const row = controller.stats[player.id];
      player.morale = D.clamp(player.morale + (userWon ? 4 : -4) + (row.rating >= 1.15 ? 2 : row.rating < 0.8 ? -2 : 0), 0, 100);
      player.fatigue = D.clamp(player.fatigue + 9 + controller.mapResults.length * 3, 0, 100);
      player.form = D.clamp(player.form + (row.rating - 1) * 8 + (userWon ? 1 : -1), 0, 100);
      player.stats.matches += 1;
      player.stats.maps += row.maps;
      player.stats.kills += row.kills;
      player.stats.deaths += row.deaths;
      player.stats.assists += row.assists;
      player.stats.firstKills += row.firstKills;
      player.stats.clutches += row.clutches;
      player.stats.utility += row.utility;
      player.stats.adr = Number(((player.stats.adr * (player.stats.matches - 1) + row.adr) / player.stats.matches).toFixed(1));
      player.stats.rating = Number(((player.stats.rating * (player.stats.matches - 1) + row.rating) / player.stats.matches).toFixed(2));
    });
    userTeam.chemistry = D.clamp(userTeam.chemistry + (userWon ? 2 : -1), 0, 100);

    const injuryReportA = processTeamMatchInjuries(controller.teamA, controller.lineupA);
    const injuryReportB = processTeamMatchInjuries(controller.teamB, controller.lineupB);
    const injuries = [...injuryReportA.injuries, ...injuryReportB.injuries];
    const recovered = [...injuryReportA.recovered, ...injuryReportB.recovered];
    if (!isFriendly) D.updateRanks(controller.state);
    const result = {
      id: `result-${Date.now()}`,
      week: controller.state.season.week,
      teamAId: controller.teamA.id,
      teamBId: controller.teamB.id,
      winnerId,
      mapsWonA: controller.mapsWonA,
      mapsWonB: controller.mapsWonB,
      mapResults: controller.mapResults,
      stats: allStats,
      mvp: allStats[0],
      ratingChange: isFriendly ? 0 : (winner.id === controller.state.userTeamId ? points : -Math.round(points * 0.78)),
      friendly: isFriendly,
      injuries,
      recovered: recovered.map((player)=>({playerId:player.id,teamId:player.teamId})),
      completedAt: Date.now()
    };
    controller.state.lastMatch = result;

    if (current && current.match) {
      current.match.status = 'completed';
      current.match.result = result;
    }

    const matchIncome = isFriendly ? (userWon ? 10000 : 5000) : (userWon ? 18000 : 7000);
    userTeam.budget += matchIncome;
    controller.state.finances.transactions.unshift({ id: `tx-match-${Date.now()}`, week: controller.state.season.week, type: 'income', amount: matchIncome, label: isFriendly ? 'Доход от товарищеского матча' : (userWon ? 'Матчевый бонус за победу' : 'Доход от участия в матче') });

    const newsTitle = isFriendly
      ? `${userTeam.name} проводит товарищеский матч с ${controller.teamA.id===userTeam.id?controller.teamB.name:controller.teamA.name}`
      : (userWon ? `${userTeam.name} побеждает ${loser.name}` : `${winner.name} останавливает ${userTeam.name}`);
    const newsBody = `Итог матча ${controller.mapsWonA}:${controller.mapsWonB}. Лучшим игроком стал ${result.mvp.nickname} с оценкой ${result.mvp.rating}.`;
    controller.state.news.unshift(D.makeNews(`news-match-${Date.now()}`, controller.state.season.week, newsTitle, newsBody, isFriendly ? 'friendly' : (userWon ? 'user' : 'league')));
    injuries.filter((item)=>item.teamId===controller.state.userTeamId).forEach((item)=>{
      const player=D.findPlayer(controller.state,item.playerId);
      if(player)controller.state.news.unshift(D.makeNews(`news-injury-${Date.now()}-${player.id}`,controller.state.season.week,`${player.nickname} получил травму`,`${item.name}. Игрок пропустит ${item.matches} ${item.matches===1?'матч':'матча'}.`,'medical'));
    });
    if (winner.winStreak >= 4) {
      controller.state.news.unshift(D.makeNews(`news-streak-${Date.now()}`, controller.state.season.week, `${winner.name} одерживает четвёртую победу подряд`, `Команда укрепляет позиции в мировом рейтинге после серии успешных матчей.`, 'league'));
    }
    return result;
  }

  function randomAITactics() {
    const pick = (array) => array[Math.floor(Math.random() * array.length)];
    return {
      tempo: pick(['Медленный', 'Сбалансированный', 'Быстрый']),
      aggression: pick(['Низкая', 'Средняя', 'Высокая']),
      risk: pick(['Осторожный', 'Стандартный', 'Рискованный']),
      utility: 45 + Math.floor(Math.random() * 40),
      discipline: 45 + Math.floor(Math.random() * 40),
      attack: pick(['Контроль карты', 'Быстрый выход A', 'Быстрый выход B', 'Игра через центр', 'Медленная атака', 'Ложный выход']),
      defense: pick(['Стандартная защита', 'Агрессивная защита', 'Усилить A', 'Усилить B', 'Пассивная защита', 'Ранний сбор информации'])
    };
  }

  function simulateAIWeek(state) {
    const teams = state.teams.filter((team) => !team.isUser);
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      const a = shuffled[i];
      const b = shuffled[i + 1];
      const map = D.MAPS[Math.floor(Math.random() * D.MAPS.length)].id;
      const chance = estimateWinChance(a, b, map, randomAITactics(), randomAITactics());
      const winner = Math.random() < chance ? a : b;
      const loser = winner.id === a.id ? b : a;
      const expected = 1 / (1 + Math.pow(10, (loser.ratingPoints - winner.ratingPoints) / 320));
      const gain = D.clamp(Math.round(24 * (1.2 - expected)), 8, 32);
      winner.ratingPoints += gain;
      loser.ratingPoints = Math.max(100, loser.ratingPoints - Math.round(gain * 0.72));
      winner.history.unshift('W');
      loser.history.unshift('L');
      winner.history = winner.history.slice(0, 8);
      loser.history = loser.history.slice(0, 8);
      winner.winStreak = (winner.winStreak || 0) + 1;
      winner.lossStreak = 0;
      loser.lossStreak = (loser.lossStreak || 0) + 1;
      loser.winStreak = 0;
      winner.chemistry = D.clamp(winner.chemistry + 0.7, 35, 100);
      loser.chemistry = D.clamp(loser.chemistry - 0.3, 35, 100);
    }

    teams.forEach((team) => {
      const map = D.MAPS[Math.floor(Math.random() * D.MAPS.length)].id;
      team.mapSkill[map] = D.clamp(team.mapSkill[map] + (Math.random() * 1.4 - 0.3), 35, 98);
      if (state.season.week - team.rosterChangedWeek > 1) team.chemistry = D.clamp(team.chemistry + 0.35, 35, 100);
      team.players.forEach((player) => {
        player.fatigue = D.clamp(player.fatigue + Math.floor(Math.random() * 7) - 2, 0, 100);
        player.form = D.clamp(player.form + Math.floor(Math.random() * 5) - 2, 30, 95);
        player.morale = D.clamp(player.morale + (team.history[0] === 'W' ? 1 : -1), 20, 98);
      });
      processTeamMatchInjuries(team,starterLineup(team));
    });

    D.updateRanks(state);
  }

  window.GameSimulation = {
    starterLineup,
    calculatePlayerRating,
    playerEffective,
    aggressionLevel,
    tempoMatchupModifier,
    attackPlanModifier,
    tacticsModifier,
    tacticalPlayerBonuses,
    mapPlayerBonuses,
    excessiveUtilityCost,
    calculateTeamPower,
    estimateWinChance,
    randomAITactics,
    sideForTeamA,
    isPlayerInjured,
    injuryRiskForFatigue,
    tickTeamInjuries,
    rollMatchInjuries,
    processTeamMatchInjuries,
    mapFinished,
    createRound,
    MatchController,
    simulateAIWeek
  };
})();
