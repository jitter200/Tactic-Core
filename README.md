# TACTIC CORE

![Version](https://img.shields.io/badge/version-1.4.2-C6FF00?style=flat-square\&labelColor=080A0B)
![HTML5](https://img.shields.io/badge/HTML5-native-E34F26?style=flat-square\&logo=html5\&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-native-1572B6?style=flat-square\&logo=css3\&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?style=flat-square\&logo=javascript\&logoColor=080A0B)
<img width="1060" height="608" alt="image" src="https://github.com/user-attachments/assets/c1984ca9-fd1b-400b-a0b1-aecda11c516d" />

**TACTIC CORE** is a single-player browser-based esports management simulator. Create your own organization, build a competitive roster, develop young talent, prepare tactics, manage finances, and fight your way to the top of the world ranking.

The game is built entirely with HTML, CSS, and vanilla JavaScript. It has no external runtime dependencies and requires no build step.

> The current in-game interface is available in Russian.

## Features

### Create Your Organization
<img width="1896" height="1032" alt="image" src="https://github.com/user-attachments/assets/f9676245-e5bb-496b-95be-4e7198a8d1ef" />

* Choose a team name and tag
* Select a region
* Customize primary and secondary colors
* Choose a custom SVG logo
* Name your home arena
* Start from the bottom of a 24-team world ranking

### Roster Management
<img width="1904" height="1080" alt="image" src="https://github.com/user-attachments/assets/33edd937-d75d-4520-8a9b-9dc80070ad81" />

* Manage five starting players and up to two substitutes
* Build a balanced lineup around different player roles
* Track overall rating, potential, form, morale, fatigue, and market value
* Work with eight player attributes:

  * Aim
  * Reaction
  * Positioning
  * Tactical thinking
  * Utility usage
  * Communication
  * Composure
  * Discipline
* Renew contracts, change player status, compare players, and manage the transfer list

### Academy
<img width="1832" height="1080" alt="image" src="https://github.com/user-attachments/assets/cdbc5240-32f0-4048-95dd-aead58367c12" />

* Develop up to 10 academy players between the ages of 14 and 18
* Choose one prospect from three candidates at the start of a new season
* Track player potential and weekly development
* Promote young players to the senior roster
* Sell or release academy players
* Make decisions when players reach the academy age limit

### Staff
<img width="1904" height="1080" alt="image" src="https://github.com/user-attachments/assets/61ba633c-47ff-4b97-b0bb-5b9b50142ec0" />

Five staff members provide permanent bonuses to different areas of the club:

* **Coach** — improves player development
* **Psychologist** — supports morale and team chemistry
* **Physiotherapist** — reduces player fatigue
* **Assistant Coach** — improves preparation for a specialized map
* **Analyst** — reveals parts of the opponent's tactical setup before a match

### Transfers and Contracts
<img width="1900" height="1080" alt="image" src="https://github.com/user-attachments/assets/800e2667-f5e2-4183-8acb-285577133450" />

* Sign free agents
* Scout players from other organizations
* Search the market by role, rating, age, region, country, and value
* Submit transfer fees, salaries, contract lengths, and squad roles
* Receive offers for your own players
* Track incoming offers, outgoing offers, and transfer history
* Automatically place eligible young signings in the academy when required

### Training System
<img width="1892" height="1080" alt="image" src="https://github.com/user-attachments/assets/a94b049a-69ae-4669-b736-4fcc158aa33b" />

Distribute exactly 100% of the weekly training workload between:

* Aim and reaction
* Tactical skills
* Teamwork and chemistry
* Individual map preparation
* Fitness
* Rest and recovery

Player growth depends on age, potential, current level, staff quality, and training priorities.

### Tactical System
<img width="1900" height="1080" alt="image" src="https://github.com/user-attachments/assets/b9a54444-9ed2-4b1e-ada5-e0e758c31f12" />

Build a tactical setup before every match:

* Tempo: slow, balanced, or fast
* Aggression: low, medium, or high
* Risk level: cautious, standard, or risky
* Utility usage
* Team discipline
* Six attacking plans
* Six defensive plans

Tactical choices interact with the opponent's strategy. AI teams generate their own tactics, while the analyst can reveal selected parameters before the match.

### Maps and Veto
<img width="1892" height="1080" alt="image" src="https://github.com/user-attachments/assets/fd847007-f7e3-4c30-aa80-1569414bbb15" />

The game includes five maps with different tactical profiles:

* **District** — tactics and utility
* **Foundry** — aim and long-range duels
* **Transit** — positioning and rotations
* **Bastion** — discipline and structured play
* **Harbor** — composure and long sightlines

Choose a priority map, improve map preparation through training, and complete a full pick/ban phase before BO1 and BO3 matches.

### Live Match Simulation

* Round-by-round text broadcast
* Dynamic win probability
* Team economy
* Alive-player tracking
* Attack and defense side changes
* BO1 and BO3 series
* Match speed controls: x1, x2, and x4
* Pause, resume, skip-round, and instant-finish controls
* Detailed post-match statistics
* Kills, deaths, assists, ADR, opening kills, clutches, utility, and player ratings
* MVP selection after every match

### Fatigue and Injuries

* Match load increases player fatigue
* High fatigue increases injury risk
* Injuries are intentionally rare
* An injured player can miss up to three matches
* Medical reports appear after matches

### Competitions and Ranking

Compete against 23 AI-controlled organizations across a 24-week season.

Main competitions:

1. **Opening Circuit**
2. **Regional Clash**
3. **WORLD CORE ESPORTS**
4. **MAJOR MASTERS DIVISION**

Tournament systems include knockout brackets, a Swiss stage, qualification rounds, tournament tables, prize money for first place, second place, and semifinalists, as well as additional ranking rewards.

The world ranking reacts to the strength of each opponent. Beating a stronger team gives more points, while an unexpected loss is more costly. Team categories are updated according to final ranking positions after each season.

### Career Mode

* Up to five full seasons
* 24 weeks per season
* Seasonal objectives
* Persistent roster, finances, contracts, player development, and club history
* New tournament schedules every season
* New free agents and academy prospects
* Career history with final rankings, records, objectives, champions, and budgets

### Finances

* Starting club budget
* Weekly organization income
* Player salary expenses
* Match income
* Tournament prize money
* Transfer income and expenses
* Complete transaction history

### Save System and Settings

* Automatic saving
* Manual saving
* Browser `localStorage` persistence
* Background music volume control
* Default match simulation speed
* Reduced-motion mode
* Save deletion from the main menu or settings

## Gameplay Loop

1. Review your roster, academy, finances, and upcoming schedule.
2. Distribute the weekly training workload.
3. Adjust tactics and choose a priority map.
4. Scout the opponent and complete the map veto.
5. Watch or fast-forward the live match simulation.
6. React to results, injuries, transfers, player development, and ranking changes.

## Tech Stack

* HTML5
* CSS3
* Vanilla JavaScript
* Browser `localStorage`
* Inline custom SVG graphics
* Native HTML Audio

No frameworks, package managers, databases, or build tools are required.

## Getting Started

### Option 1: Open Directly

Download or clone the repository and open `index.html` in a modern browser.

### Option 2: Run a Local Server

```bash
git clone <repository-url>
cd tactic-core
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Project Structure

````text
tactic-core/
├── index.html       # Application entry point
├── styles.css       # Interface, layout, animations, and responsive styles
├── data.js          # Teams, players, maps, tournaments, and game-state generation
├── simulation.js    #, databases, or build tools are required.

## Getting Started

### Option 1: Open Directly

Download or clone the repository and open `index.html` in a modern browser.

### Option 2: Run a Local Server

```bash
git clone <repository-url>
cd tactic-core
python -m http.server 8000
````

Then open:

```text
http://localhost:8000
```

## Project Structure

```text
tactic-core/
├── index.html       # Application entry point
├── styles.css       # Interface, layout, animations, and responsive styles
├── data.js          Match engine, tactics, player performance, and injuries
├── save.js          # localStorage save system
├── app.js           # UI rendering, navigation, career systems, and interactions
└── esports.mp3      # Background music
```

## Save Data

Career progress is stored locally in the browser under the following key:

```text
tactic-core-save-v1
```

Clearing browser storage or using the in-game **Delete Save** option permanently removes the current career.

## Browser Support

A recent version of Chrome, Edge, Firefox, or another modern browser is recommended. JavaScript and browser storage must be enabled.

## Current Version

**v1.4.2**

TACTIC CORE is currently in active development.
