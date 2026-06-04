// --- 1. GESTION DE LA LANGUE (BILINGUE) ---
function toggleLanguage() {
    document.body.classList.toggle('lang-en');
    const btn = document.getElementById('btn-lang');
    btn.innerText = document.body.classList.contains('lang-en') ? "EN / FR" : "FR / EN";
    recupererVraiesDonnees(); 
    initialiserGraphique(); // Relance le graphique pour le traduire
}

// --- 2. RÉCUPÉRATION DU PACK DE DONNÉES ADAFRUIT IO API ---
const username = "sasouki";

async function recupererVraiesDonnees() {
    try {
        let res = await fetch(`https://io.adafruit.com/api/v2/${username}/feeds/donnees?nocache=${new Date().getTime()}`);
        let data = await res.json();

        const derniereMiseAJour = new Date(data.updated_at).getTime();
        const maintenant = new Date().getTime();
        const differenceSecondes = (maintenant - derniereMiseAJour) / 1000;
        const badge = document.getElementById('carte-statut');

        // --- DÉCOUPAGE DE LA DONNÉE ADAFRUIT ---
        let valeurs = data.last_value.split(',');
        
        // Sécurité anti-yoyo : on nettoie le texte (.trim()) pour être sûr à 100%
        let vraiDernierMode = (valeurs.length === 6) ? valeurs[5].trim() : "NORMAL";
        let toleranceSecondes = 40; 

        if (vraiDernierMode === "AQUOS" || vraiDernierMode === "NORMAL" || vraiDernierMode === "MANUEL") {
            toleranceSecondes = 12; // Détection à 12s pour absorber les latences du Wi-Fi
        } else {
            toleranceSecondes = 40; // Patience (40s) en mode Veille
        }

        // --- VÉRIFICATION DE LA CONNEXION ---
        if (differenceSecondes < toleranceSecondes && differenceSecondes >= 0) {
            badge.style.background = "#e8f5e9";
            badge.style.color = "#2e7d32";
            badge.innerHTML = '<span class="fr">🟢 Système AQUOS en ligne</span><span class="en">🟢 AQUOS System online</span>';

            if(valeurs.length === 6) {
                let tempVal = parseFloat(valeurs[0]).toFixed(1);
                let ntu = parseFloat(valeurs[1]).toFixed(0);
                let ppm = parseFloat(valeurs[2]).toFixed(0);
                let pompeVal = valeurs[3];
                let uvVal = valeurs[4].trim();
                let modeStr = valeurs[5].trim();

                // 1. Température & Animation de la jauge thermique
                let tempFloat = parseFloat(tempVal);
                document.getElementById('val-temp').innerText = tempVal + " °C";

                const thermoLiquid = document.getElementById('thermo-liquid');
                const thermoBulb = document.getElementById('thermo-bulb');

                // Échelle de conversion : 15°C = jauge vide (0%), 42°C = jauge pleine (100%)
                const tempMin = 15;
                const tempMax = 42;
                let pourcentageHauteur = ((tempFloat - tempMin) / (tempMax - tempMin)) * 100;
                
                if (pourcentageHauteur < 0) pourcentageHauteur = 0;
                if (pourcentageHauteur > 100) pourcentageHauteur = 100;

                let couleurThermique = "#0077b6"; 

                if (tempFloat === -127.0) {
                    document.getElementById('stat-temp').className = "dash-status status-alert";
                    document.getElementById('stat-temp').innerHTML = '<span class="fr">Erreur Capteur ⚠️</span><span class="en">Sensor Error ⚠️</span>';
                    pourcentageHauteur = 0;
                    couleurThermique = "#6c757d"; 
                } else if (tempFloat < 35.0) {
                    document.getElementById('stat-temp').className = "dash-status status-neutral";
                    document.getElementById('stat-temp').innerHTML = '<span class="fr">Eau Froide 🥶</span><span class="en">Cold Water 🥶</span>';
                    couleurThermique = "#0077b6"; 
                } else if (tempFloat >= 35.0 && tempFloat <= 39.0) {
                    document.getElementById('stat-temp').className = "dash-status status-ok";
                    document.getElementById('stat-temp').innerHTML = '<span class="fr">Idéale 🌡️</span><span class="en">Ideal 🌡️</span>';
                    couleurThermique = "#20c997"; 
                } else {
                    document.getElementById('stat-temp').className = "dash-status status-alert";
                    document.getElementById('stat-temp').innerHTML = '<span class="fr">Trop Chaude ! 🔥</span><span class="en">Too Hot! 🔥</span>';
                    couleurThermique = "#dc3545"; 
                }

                if (thermoLiquid && thermoBulb) {
                    thermoLiquid.style.height = pourcentageHauteur + "%";
                    thermoLiquid.style.backgroundColor = couleurThermique;
                    thermoBulb.style.backgroundColor = couleurThermique;
                }

                // 2. Turbidité
                document.getElementById('val-turb').innerText = ntu + " NTU";
                if (ntu > 50) {
                    document.getElementById('stat-turb').className = "dash-status status-alert";
                    document.getElementById('stat-turb').innerHTML = '<span class="fr">Eau Trouble</span><span class="en">Cloudy</span>';
                } else {
                    document.getElementById('stat-turb').className = "dash-status status-ok";
                    document.getElementById('stat-turb').innerHTML = '<span class="fr">Eau Claire</span><span class="en">Clear</span>';
                }

                // 3. TDS
                document.getElementById('val-tds').innerText = ppm + " ppm";
                if (ppm > 445) {
                    document.getElementById('stat-tds').className = "dash-status status-alert";
                    document.getElementById('stat-tds').innerHTML = '<span class="fr">Savon / Impuretés</span><span class="en">Soap / Impurities</span>';
                } else {
                    document.getElementById('stat-tds').className = "dash-status status-ok";
                    document.getElementById('stat-tds').innerHTML = '<span class="fr">Pureté OK</span><span class="en">Purity OK</span>';
                }

                // 4. Pompe & Jauge à aiguille
                document.getElementById('val-pump').innerText = pompeVal + " %";
                
                let pompePourcentage = parseFloat(pompeVal);
                if (isNaN(pompePourcentage)) pompePourcentage = 0;
                if (pompePourcentage < 0) pompePourcentage = 0;
                if (pompePourcentage > 100) pompePourcentage = 100;
                
                let angleAiguille = -90 + (pompePourcentage * 1.8); 
                let needle = document.getElementById('pump-needle');
                if (needle) needle.style.transform = `rotate(${angleAiguille}deg)`;

                document.getElementById('stat-pump').className = pompePourcentage > 0 ? "dash-status status-ok" : "dash-status status-neutral";
                document.getElementById('stat-pump').innerHTML = pompePourcentage > 0 ? '<span class="fr">En marche</span><span class="en">Running</span>' : '<span class="fr">À l\'arrêt</span><span class="en">Stopped</span>';

                // 5. UV & Interrupteur (Toggle)
                let uvSwitch = document.getElementById('uv-switch');
                if (uvSwitch) {
                    if (uvVal === "ON") {
                        uvSwitch.classList.add('active'); 
                    } else {
                        uvSwitch.classList.remove('active'); 
                    }
                }
                
                document.getElementById('stat-uv').className = uvVal === "ON" ? "dash-status status-ok" : "dash-status status-neutral";
                document.getElementById('stat-uv').innerHTML = uvVal === "ON" ? '<span class="fr">Traitement actif</span><span class="en">Active</span>' : '<span class="fr">Inactif</span><span class="en">Inactive</span>';

                // 6. Mode 
                document.getElementById('val-mode').innerText = modeStr;
                if (modeStr === "AQUOS") {
                    document.getElementById('stat-mode').className = "dash-status status-ok";
                    document.getElementById('stat-mode').innerHTML = '<span class="fr">Recyclage actif ♻️</span><span class="en">Active recycling ♻️</span>';
                } else if (modeStr === "VIDANGE") {
                    document.getElementById('stat-mode').className = "dash-status status-alert";
                    document.getElementById('stat-mode').innerHTML = '<span class="fr">Évacuation 🚿</span><span class="en">Draining 🚿</span>';
                } else if (modeStr === "VEILLE") {
                    document.getElementById('stat-mode').className = "dash-status status-neutral";
                    document.getElementById('stat-mode').innerHTML = '<span class="fr">En veille 💤</span><span class="en">Standby 💤</span>';
                } else {
                    document.getElementById('stat-mode').className = "dash-status status-neutral";
                    document.getElementById('stat-mode').innerHTML = '<span class="fr">Fonctionnement standard</span><span class="en">Standard run</span>';
                }
            }

        } else {
            // SI HORS LIGNE
            badge.style.background = "#ffebee";
            badge.style.color = "#c62828";
            badge.innerHTML = '<span class="fr">🔴 Système AQUOS hors ligne</span><span class="en">🔴 AQUOS System offline</span>';
            
            // Remise à zéro Thermomètre
            const thermoLiquid = document.getElementById('thermo-liquid');
            const thermoBulb = document.getElementById('thermo-bulb');
            if (thermoLiquid && thermoBulb) {
                thermoLiquid.style.height = "0%";
                thermoLiquid.style.backgroundColor = "#6c757d";
                thermoBulb.style.backgroundColor = "#6c757d";
            }

            // Remise à zéro Aiguille Pompe
            const needle = document.getElementById('pump-needle');
            if (needle) needle.style.transform = "rotate(-90deg)";
            
            // Remise à zéro Interrupteur UV
            const uvSwitch = document.getElementById('uv-switch');
            if (uvSwitch) uvSwitch.classList.remove('active');

            const ids = ['mode', 'temp', 'turb', 'tds', 'pump', 'uv'];
            ids.forEach(id => {
                document.getElementById('val-' + id).innerText = id === 'mode' ? '...' : (id === 'uv' ? '--' : '-- ' + (id === 'temp' ? '°C' : (id === 'turb' ? 'NTU' : (id === 'tds' ? 'ppm' : '%'))));
                document.getElementById('stat-' + id).className = "dash-status status-neutral";
                document.getElementById('stat-' + id).innerHTML = '<span class="fr">Hors tension</span><span class="en">Powered off</span>';
            });
        }
    } catch (error) {
        console.error("Erreur de récupération :", error);
    }
}

// --- 3. CONFIGURATION DU GRAPHIQUE HISTORIQUE (CHART.JS) ---
let showerChart = null;

function initialiserGraphique() {
    const ctx = document.getElementById('showerChart');
    if (!ctx) return; // Si la balise canvas n'existe pas, on annule

    // Détection de la langue
    const isEn = document.body.classList.contains('lang-en');

    // Données de simulation d'une douche de 10 min
    const labelsFr = ["0 min (Démarrage)", "1 min (Savon)", "2 min (Rinçage)", "3 min", "4 min (AQUOS)", "5 min", "6 min", "7 min", "8 min", "9 min", "10 min (Fin)"];
    const labelsEn = ["0 min (Start)", "1 min (Soap)", "2 min (Rinsing)", "3 min", "4 min (AQUOS)", "5 min", "6 min", "7 min", "8 min", "9 min", "10 min (End)"];

    const donneesTurbidite = [10, 180, 120, 45, 12, 10, 9, 11, 10, 10, 8]; // NTU
    const donneesTDS = [150, 2100, 1400, 390, 180, 160, 155, 162, 158, 150, 145]; // ppm

    // Destruction du graphique précédent pour éviter les superpositions
    if (showerChart) {
        showerChart.destroy();
    }

    showerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: isEn ? labelsEn : labelsFr,
            datasets: [
                {
                    label: isEn ? 'Turbidity (NTU)' : 'Turbidité (NTU)',
                    data: donneesTurbidite,
                    borderColor: '#00b4d8',
                    backgroundColor: 'rgba(0, 180, 216, 0.1)',
                    yAxisID: 'yTurb',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: isEn ? 'Chemical Purity - TDS (ppm)' : 'Pureté Chimique - TDS (ppm)',
                    data: donneesTDS,
                    borderColor: '#7209b7',
                    backgroundColor: 'rgba(114, 9, 183, 0.05)',
                    yAxisID: 'yTDS',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                yTurb: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Turbidité (NTU)' },
                    min: 0,
                    max: 250
                },
                yTDS: {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'TDS (ppm)' },
                    min: 0,
                    max: 2500,
                    grid: { drawOnChartArea: false } 
                }
            }
        }
    });
}

// Initialisations globales au chargement de la page
window.addEventListener('load', () => {
    recupererVraiesDonnees();
    initialiserGraphique(); 
});

// Boucle réseau
setInterval(recupererVraiesDonnees, 3000);