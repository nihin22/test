let pokemonData = [];

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

document.getElementById('analyzeBtn').addEventListener('click', () => {
    const query = document.getElementById('pokemonSearch').value.toLowerCase().trim();
    const current = pokemonData.find(p => p.pokemon && p.pokemon.toLowerCase() === query);

    if (!current) {
        alert('Pokémon not found! Please check the spelling.');
        return;
    }

    // Find if this Pokémon evolves into another
    const evolution = pokemonData.find(p => p.evolves_from_species_id === current.species_id);

    displayResults(current, evolution);
});

function getPokemonImage(p) {
    const id = p.species_id || p.id;
    if (id && id <= 721) {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    }
    return p.url_image || '';
}

function displayResults(curr, evo) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.classList.remove('hidden');

    // Current Pokémon details
    document.getElementById('currImg').src = getPokemonImage(curr);
    document.getElementById('currName').textContent = capitalize(curr.pokemon);
    document.getElementById('currTypes').textContent = `Type: ${curr.type_1}${curr.type_2 ? '/' + curr.type_2 : ''}`;
    document.getElementById('currStats').innerHTML = getStatsHTML(curr);

    const evoBox = document.getElementById('evolutionPokemonBox');
    const verdictText = document.getElementById('verdictText');

    if (!evo) {
        evoBox.style.opacity = '0.5';
        document.getElementById('evoImg').src = '';
        document.getElementById('evoName').textContent = 'No Further Evolution';
        document.getElementById('evoTypes').textContent = '-';
        document.getElementById('evoStats').innerHTML = '';
        verdictText.innerHTML = `<h2>Verdict</h2><p><strong>${capitalize(curr.pokemon)}</strong> is already at its final evolutionary stage! No evolution is available.</p>`;
        return;
    }

    evoBox.style.opacity = '1';
    document.getElementById('evoImg').src = getPokemonImage(evo);
    document.getElementById('evoName').textContent = capitalize(evo.pokemon);
    document.getElementById('evoTypes').textContent = `Type: ${evo.type_1}${evo.type_2 ? '/' + evo.type_2 : ''}`;
    document.getElementById('evoStats').innerHTML = getStatsHTML(evo);

    // Calculate total stats
    const currTotal = curr.attack + curr.defense + curr.hp + curr.special_attack + curr.special_defense + curr.speed;
    const evoTotal = evo.attack + evo.defense + evo.hp + evo.special_attack + evo.special_defense + evo.speed;

    if (evoTotal > currTotal) {
        verdictText.innerHTML = `Yes! Evolving into <strong>${capitalize(evo.pokemon)}</strong> boosts total base stats from <strong>${currTotal}</strong> to <strong>${evoTotal}</strong> (+${evoTotal - currTotal}). Definitely evolve!`;
    } else {
        verdictText.innerHTML = `Think twice! Evolving doesn't increase total base stats positively in this case.`;
    }
}

function getStatsHTML(p) {
    return `
        <li>HP: ${p.hp}</li>
        <li>Attack: ${p.attack}</li>
        <li>Defense: ${p.defense}</li>
        <li>Sp. Atk: ${p.special_attack}</li>
        <li>Sp. Def: ${p.special_defense}</li>
        <li>Speed: ${p.speed}</li>
    `;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
