let pokemonData = [];

// Type badge colors
const typeColors = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', grass: '#78C850',
    electric: '#F8D030', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', fairy: '#EE99AC'
};

// Load CSV data using PapaParse
Papa.parse('pokemon.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {
        pokemonData = results.data;
        const datalist = document.getElementById('pokemonList');
        pokemonData.forEach(p => {
            if (p.pokemon) {
                const option = document.createElement('option');
                option.value = p.pokemon;
                datalist.appendChild(option);
            }
        });
    }
});

document.getElementById('analyzeBtn').addEventListener('click', performAnalysis);
document.getElementById('pokemonSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performAnalysis();
});

function performAnalysis() {
    const query = document.getElementById('pokemonSearch').value.toLowerCase().trim();
    const current = pokemonData.find(p => p.pokemon && p.pokemon.toLowerCase() === query);

    if (!current) {
        alert('Pokémon not found! Please check the spelling.');
        return;
    }

    const evolution = pokemonData.find(p => p.evolves_from_species_id === current.species_id);
    displayResults(current, evolution);
}

function getPokemonImage(p) {
    if (!p) return '';
    const pokeId = p.id || p.species_id;
    if (pokeId) {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`;
    }
    return '';
}

function displayResults(curr, evo) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.classList.remove('hidden');

    // Current Pokémon details
    const currImg = document.getElementById('currImg');
    currImg.src = getPokemonImage(curr);
    document.getElementById('currName').textContent = curr.pokemon;
    
    setBadge('currTypeBadge', curr.type_1);
    document.getElementById('currStats').innerHTML = getStatsHTML(curr);

    const evoBox = document.getElementById('evolutionCard');
    const verdictBox = document.getElementById('verdictBox');
    const verdictText = document.getElementById('verdictText');

    if (!evo) {
        evoBox.style.opacity = '0.5';
        document.getElementById('evoImg').src = '';
        document.getElementById('evoName').textContent = 'Max Stage';
        document.getElementById('evoTypeBadge').style.display = 'none';
        document.getElementById('evoStats').innerHTML = '<p style="text-align:center; color:#888; margin-top:40px;">No further evolution available.</p>';
        
        verdictBox.style.borderLeftColor = '#e67e22';
        verdictBox.querySelector('h3').style.color = '#e67e22';
        verdictBox.querySelector('h3').textContent = 'Final Evolution';
        verdictText.innerHTML = `<strong>${capitalize(curr.pokemon)}</strong> har allerede nået sin endelige form og kan ikke udvikle sig yderligere!`;
        return;
    }

    evoBox.style.opacity = '1';
    document.getElementById('evoTypeBadge').style.display = 'inline-block';
    const evoImg = document.getElementById('evoImg');
    evoImg.src = getPokemonImage(evo);
    document.getElementById('evoName').textContent = evo.pokemon;
    
    setBadge('evoTypeBadge', evo.type_1);
    document.getElementById('evoStats').innerHTML = getStatsHTML(evo);

    // Calculate totals
    const currTotal = curr.attack + curr.defense + curr.hp + curr.special_attack + curr.special_defense + curr.speed;
    const evoTotal = evo.attack + evo.defense + evo.hp + evo.special_attack + evo.special_defense + evo.speed;
    const diff = evoTotal - currTotal;

    verdictBox.style.borderLeftColor = diff >= 0 ? '#27ae60' : '#e74c3c';
    verdictBox.querySelector('h3').style.color = diff >= 0 ? '#27ae60' : '#e74c3c';
    verdictBox.querySelector('h3').textContent = diff >= 0 ? 'Anbefaling: Evolve! 🚀' : 'Overvej det en ekstra gang ⚠️';

    if (diff >= 0) {
        verdictText.innerHTML = `Ja! Ved at udvikle til <strong>${capitalize(evo.pokemon)}</strong> stiger de samlede basestats fra <strong>${currTotal}</strong> til <strong>${evoTotal}</strong> — en markant stigning på <strong>+${diff}</strong> point!`;
    } else {
        verdictText.innerHTML = `Forsigtig! De samlede basestats falder fra ${currTotal} til ${evoTotal} (${diff}). Tjek specifikke evner før du udvikler.`;
    }
}

function setBadge(elementId, type) {
    const badge = document.getElementById(elementId);
    badge.textContent = type;
    badge.style.backgroundColor = typeColors[type.toLowerCase()] || '#777';
}

function getStatsHTML(p) {
    const stats = [
        { label: 'HP', val: p.hp },
        { label: 'Attack', val: p.attack },
        { label: 'Defense', val: p.defense },
        { label: 'Sp. Atk', val: p.special_attack },
        { label: 'Sp. Def', val: p.special_defense },
        { label: 'Speed', val: p.speed }
    ];

    return stats.map(s => {
        const percent = Math.min(Math.round((s.val / 200) * 100), 100);
        return `
            <div class="stat-row">
                <div class="stat-info">
                    <span>${s.label}</span>
                    <span>${s.val}</span>
                </div>
                <div class="stat-bar-bg">
                    <div class="stat-bar-fill" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
