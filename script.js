// --- 1. GESTION DE LA LANGUE (BILINGUE) ---
function toggleLanguage() {
    document.body.classList.toggle('lang-en');
    const btn = document.getElementById('btn-lang');
    btn.innerText = document.body.classList.contains('lang-en') ? "EN / FR" : "FR / EN";
    recupererVraiesDonnees(); 
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

        // TOLÉRANCE AUGMENTÉE À 10 SECONDES (Car le mode Veille envoie toutes les 30s)
        if (differenceSecondes < 10 && differenceSecondes >= 0) {
            badge.style.background = "#e8f5e9";
            badge.style.color = "#2e7d32";
            badge.innerHTML = '<span class="fr">🟢 Système AQUOS en ligne</span><span class="en">🟢 AQUOS System online</span>';

            let valeurs = data.last_value.split(',');
            
            if(valeurs.length === 6) {
                let tempVal = parseFloat(valeurs[0]).toFixed(1);
                let ntu = parseFloat(valeurs[1]).toFixed(0);
                let ppm = parseFloat(valeurs[2]).toFixed(0);
                let pompeVal = valeurs[3];
                let uvVal = valeurs[4];
                let modeStr = valeurs[5];

               // 1. Température (Dynamique et Sécurisée)
                let tempFloat = parseFloat(tempVal);
                document.getElementById('val-temp').innerText = tempVal + " °C";

                if (tempFloat === -127.0) {
                    // Cas d'erreur du capteur (Faux contact/débranché)
                    document.getElementById('stat-temp').className = "dash-status status-alert";
                    document.getElementById('stat-temp').innerHTML = '<span class="fr">Erreur Capteur ⚠️</span><span class="en">Sensor Error ⚠️</span>';
                } 
                else if (tempFloat < 35.0) {
                    // Eau trop froide
                    document.getElementById('stat-temp').className = "dash-status status-neutral";
                    document.getElementById('stat-temp').innerHTML = '<span class="fr">Eau Froide 🥶</span><span class="en">Cold Water 🥶</span>';
                } 
                else if (tempFloat >= 35.0 && tempFloat <= 39.0) {
                    // Zone de confort parfaite (Nominale)
                    document.getElementById('stat-temp').className = "dash-status status-ok";
                    document.getElementById('stat-temp').innerHTML = '<span class="fr">Idéale 🌡️</span><span class="en">Ideal 🌡️</span>';
                } 
                else {
                    // Eau trop chaude (Danger de brûlure)
                    document.getElementById('stat-temp').className = "dash-status status-alert";
                    document.getElementById('stat-temp').innerHTML = '<span class="fr">Trop Chaude ! 🔥</span><span class="en">Too Hot! 🔥</span>';
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

                // 4. Pompe
                document.getElementById('val-pump').innerText = pompeVal + " %";
                document.getElementById('stat-pump').className = pompeVal > 0 ? "dash-status status-ok" : "dash-status status-neutral";
                document.getElementById('stat-pump').innerHTML = pompeVal > 0 ? '<span class="fr">En marche</span><span class="en">Running</span>' : '<span class="fr">À l\'arrêt</span><span class="en">Stopped</span>';

                // 5. UV
                document.getElementById('val-uv').innerText = uvVal;
                document.getElementById('stat-uv').className = uvVal === "ON" ? "dash-status status-ok" : "dash-status status-neutral";
                document.getElementById('stat-uv').innerHTML = uvVal === "ON" ? '<span class="fr">Traitement actif</span><span class="en">Active</span>' : '<span class="fr">Inactif</span><span class="en">Inactive</span>';

                // 6. Mode (AVEC LA GESTION DE LA VEILLE)
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
            // SI VRAIMENT HORS LIGNE (> 10 secondes)
            badge.style.background = "#ffebee";
            badge.style.color = "#c62828";
            badge.innerHTML = '<span class="fr">🔴 Système AQUOS hors ligne</span><span class="en">🔴 AQUOS System offline</span>';
            
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

// Initialisation automatique au chargement
recupererVraiesDonnees();
// On garde la lecture toutes les 3 secondes pour que le réveil soit quasi instantané sur le site !

// --- 1. GESTION DE LA LANGUE (BILINGUE) ---
function toggleLanguage() {
    document.body.classList.toggle('lang-en');
    const btn = document.getElementById('btn-lang');
    btn.innerText = document.body.classList.contains('lang-en') ? "EN / FR" : "FR / EN";
    recupererVraiesDonnees(); 
}

// --- 2. RÉCUPÉRATION DU PACK DE DONNÉES ADAFRUIT IO API ---
const username = "sasouki";

async function recupererVraiesDonnees() {
    try {
        // On ne fait plus qu'UNE SEULE requête vers le flux "donnees" !
        let res = await fetch(`https://io.adafruit.com/api/v2/${username}/feeds/donnees?nocache=${new Date().getTime()}`);
        let data = await res.json();

        const derniereMiseAJour = new Date(data.updated_at).getTime();
        const maintenant = new Date().getTime();
        const differenceSecondes = (maintenant - derniereMiseAJour) / 1000;
        const badge = document.getElementById('carte-statut');

        // L'Arduino envoie toutes les 3s. Si on n'a rien depuis 10s, c'est hors ligne !
        if (differenceSecondes < 10 && differenceSecondes >= 0) {
            badge.style.background = "#e8f5e9";
            badge.style.color = "#2e7d32";
            badge.innerHTML = '<span class="fr">🟢 Système AQUOS en ligne</span><span class="en">🟢 AQUOS System online</span>';

            // DÉCOUPAGE DE LA PHRASE (ex: "37.5,15,120,80,ON,AQUOS")
            let valeurs = data.last_value.split(',');
            
            // On vérifie que le paquet contient bien les 6 infos pour éviter les bugs
            if(valeurs.length === 6) {
                let tempVal = parseFloat(valeurs[0]).toFixed(1);
                let ntu = parseFloat(valeurs[1]).toFixed(0);
                let ppm = parseFloat(valeurs[2]).toFixed(0);
                let pompeVal = valeurs[3];
                let uvVal = valeurs[4];
                let modeStr = valeurs[5];

                // 1. Température
                document.getElementById('val-temp').innerText = tempVal + " °C";
                document.getElementById('stat-temp').className = "dash-status status-ok";
                document.getElementById('stat-temp').innerHTML = '<span class="fr">Idéale</span><span class="en">Ideal</span>';

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

                // 4. Pompe
                document.getElementById('val-pump').innerText = pompeVal + " %";
                document.getElementById('stat-pump').className = pompeVal > 0 ? "dash-status status-ok" : "dash-status status-neutral";
                document.getElementById('stat-pump').innerHTML = pompeVal > 0 ? '<span class="fr">En marche</span><span class="en">Running</span>' : '<span class="fr">À l\'arrêt</span><span class="en">Stopped</span>';

                // 5. UV
                document.getElementById('val-uv').innerText = uvVal;
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

// Initialisation automatique au chargement
recupererVraiesDonnees();
// RAFRAÎCHISSEMENT TOUTES LES 3 SECONDES !
setInterval(recupererVraiesDonnees, 3000);
