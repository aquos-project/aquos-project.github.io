// --- 1. GESTION DE LA LANGUE ---
function toggleLanguage() {
    document.body.classList.toggle('lang-en');
    const btn = document.getElementById('btn-lang');
    if (btn) {
        btn.innerText = document.body.classList.contains('lang-en') ? "EN / FR" : "FR / EN";
    }
    recupererVraiesDonnees(); 
    initialiserGraphique(); 
}

// --- 2. RÉCUPÉRATION DU PACK DE DONNÉES ADAFRUIT IO API ---
const username = "sasouki";
async function recupererVraiesDonnees() {
    try {
        let res = await fetch(`https://io.adafruit.com/api/v2/${username}/feeds/donnees?nocache=${new Date().getTime()}`);
        let data = await res.json();
        const badge = document.getElementById('carte-statut');
        if (badge) {
            badge.style.background = "#e8f5e9";
            badge.style.color = "#2e7d32";
            badge.innerHTML = '🟢 Système AQUOS en ligne';
        }
    } catch (error) {
        console.error("Erreur de récupération :", error);
    }
}

// --- 3. CONFIGURATION DU GRAPHIQUE HISTORIQUE ---
let showerChart = null;
function initialiserGraphique() {
    const ctx = document.getElementById('showerChart');
    if (!ctx) return;
    if (showerChart) showerChart.destroy();
    showerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["0 min", "2 min", "4 min", "6 min", "8 min", "10 min"],
            datasets: [{ label: 'Turbidité (NTU)', data: [10, 120, 45, 12, 10, 8], borderColor: '#00b4d8', fill: true }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// --- 4. CONFIGURATION ET FONCTIONNEMENT DES VIDÉOS ---
function initialiserVideosAccueil() {
    const video1 = document.getElementById('bg-video-1');
    const video2 = document.getElementById('bg-video-2');
    if (!video1 || !video2) return;

    setInterval(() => {
        video1.classList.toggle('video-active');
        video2.classList.toggle('video-active');
        if (video1.classList.contains('video-active')) {
            video1.currentTime = 0;
            video1.play().catch(() => {});
        } else {
            video2.currentTime = 0;
            video2.play().catch(() => {});
        }
    }, 10000);
}

// --- 5. LOGIQUE DU SIMULATEUR ---
function initialiserSimulateur() {
    const inputPeople = document.getElementById('sim-people');
    const inputTime = document.getElementById('sim-time');
    const valPeople = document.getElementById('sim-people-val');
    const valTime = document.getElementById('sim-time-val');
    const resLiters = document.getElementById('res-liters');
    const resEuros = document.getElementById('res-euros');

    if (!inputPeople || !inputTime) return;

    function calculateSavings() {
        const people = parseInt(inputPeople.value);
        const time = parseInt(inputTime.value);
        if (valPeople) valPeople.innerText = people;
        if (valTime) valTime.innerText = time;

        const litersPerYear = Math.round(people * time * 12 * 365 * 0.7);
        const eurosPerYear = Math.round(litersPerYear * 0.007);

        if (resLiters) resLiters.innerText = litersPerYear.toLocaleString('fr-FR');
        if (resEuros) resEuros.innerText = eurosPerYear.toLocaleString('fr-FR');
    }

    inputPeople.addEventListener('input', calculateSavings);
    inputTime.addEventListener('input', calculateSavings);
    calculateSavings();
}

// --- 6. LOGIQUE DE LA FAQ ---
function initialiserFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            const answer = this.nextElementSibling;
            if (answer) answer.classList.toggle('open');
        });
    });
}

// --- 7. INITIALISATIONS GLOBALES AU CHARGEMENT ---
window.addEventListener('load', () => {
    recupererVraiesDonnees();
    initialiserGraphique(); 
    initialiserVideosAccueil();
    initialiserSimulateur();
    initialiserFAQ();
    initialiserSAV(); 
    basculerProfilSAV(); 
});

// Base de données virtuelle des techniciens (Mise à jour en direct)
let fichesAQUOS = {
    plomberie: [
        { nom: "Jean Dupuis", tel: "0612345678", adresse: "14 Rue du Faubourg Saint-Antoine, Paris", probleme: "Fuite d'eau détectée au niveau du receveur" },
        { nom: "Marc Vasseur", tel: "0789456123", adresse: "59 Avenue de Gergovie, Clermont-Ferrand", probleme: "Baisse anormale de pression sur le réseau principal" }
    ],
    filtration: [
        { nom: "Marie Lucas", tel: "0798765432", adresse: "3 Place Bellecour, Lyon", probleme: "Odeur désagréable persistante durant le cycle" }
    ],
    electronique: [
        { nom: "Thomas Lenoir", tel: "0655443322", adresse: "88 Boulevard de la Canebière, Marseille", probleme: "Le panneau de contrôle de la douche reste éteint" }
    ],
    pompes: [
        { nom: "Sophie Martin", tel: "0611223344", adresse: "22 Rue de la République, Lille", probleme: "Le moteur de recyclage émet un bruit anormal" }
    ],
    installateur: [
        { nom: "Lucas Morel", tel: "0622334455", adresse: "12 Rue des Capucins, Bordeaux", probleme: "Demande d'ajustement mécanique des parois de la cabine" }
    ]
};

// --- 8. LOGIQUE DU FORMULAIRE SAV INTELLIGENT ---
function basculerProfilSAV() {
    const profil = document.querySelector('input[name="profil"]:checked').value;
    const blocUtilisateur = document.getElementById('bloc-utilisateur-panne');
    const blocMaintenance = document.getElementById('bloc-maintenance-activite');
    const selectUtilisateur = document.getElementById('panne-raison');
    const selectMaintenance = document.getElementById('maintenance-activite');
    const inputAdresse = document.getElementById('adresse-sav');

    if (!blocUtilisateur || !blocMaintenance || !selectUtilisateur || !selectMaintenance || !inputAdresse) return;

    if (profil === 'utilisateur') {
        blocUtilisateur.style.display = 'block';
        selectUtilisateur.required = true;
        inputAdresse.required = true;
        blocMaintenance.style.display = 'none';
        selectMaintenance.required = false;
        selectMaintenance.value = "";
    } else {
        blocUtilisateur.style.display = 'none';
        selectUtilisateur.required = false;
        inputAdresse.required = false;
        inputAdresse.value = "";
        blocMaintenance.style.display = 'block';
        selectMaintenance.required = true;
    }
}

function retourFormulaireSAV() {
    const formSav = document.getElementById('form-sav');
    
    // 1. On vide intégralement tous les champs tapés
    formSav.reset(); 
    
    // 2. On réaffiche le formulaire vide
    formSav.style.display = 'block';
    
    // 3. On cache et on vide l'écran de succès
    document.getElementById('sav-success-screen').style.display = 'none';
    document.getElementById('sav-success-screen').innerHTML = '';
    
    // 4. On s'assure que les bons champs sont affichés (au cas où on était sur Maintenance)
    basculerProfilSAV(); 
}

function initialiserSAV() {
    const formSav = document.getElementById('form-sav');
    const successScreen = document.getElementById('sav-success-screen');

    if (formSav && successScreen) {
        formSav.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const emailInput = document.getElementById('email-sav').value;
            const telInput = document.getElementById('tel-sav').value;
            const profil = formSav.querySelector('input[name="profil"]:checked').value;
            const btnSubmit = formSav.querySelector('button[type="submit"]');
            
            btnSubmit.innerText = "Traitement en cours...";
            btnSubmit.disabled = true;

            try {
                if (profil === 'utilisateur') {
                    // 1. UTILISATEUR : ENVOI RÉEL À FORMSPREE
                    const response = await fetch('https://formspree.io/f/xykappqb', {
                        method: 'POST',
                        body: new FormData(formSav),
                        headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        formSav.style.display = 'none';
                        successScreen.style.display = 'block';

                        const selectElement = document.getElementById('panne-raison');
                        const labelPanne = selectElement.options[selectElement.selectedIndex].text;
                        const valeurPanne = selectElement.value;
                        const adresseVal = document.getElementById('adresse-sav').value;

                        // Aiguillage du problème vers le bon secteur
                        let secteurAssocie = "plomberie";
                        if (valeurPanne === "odeur") secteurAssocie = "filtration";
                        if (valeurPanne === "ecran_eteint") secteurAssocie = "electronique";
                        if (valeurPanne === "pas_debit") secteurAssocie = "pompes";

                        // Ajout du ticket dans la base virtuelle pour que la maintenance le voie
                        fichesAQUOS[secteurAssocie].unshift({
                            nom: "Nouveau Client (" + emailInput.split('@')[0] + ")",
                            tel: telInput,
                            adresse: adresseVal,
                            probleme: "Urgent : " + labelPanne
                        });

                        successScreen.innerHTML = `
                            <div style="font-size: 3.5rem; margin-bottom: 15px;">✅</div>
                            <h3 style="color: var(--primary); margin-bottom: 15px; font-size: 1.5rem;">Demande transmise avec succès</h3>
                            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
                                Notre équipe technique a bien reçu votre demande d'assistance.<br>
                                Un expert va vous recontacter rapidement pour intervenir au <strong>${adresseVal}</strong>.
                            </p>
                            <button onclick="retourFormulaireSAV()" class="btn" style="background: #6c757d; margin: auto;">Fermer</button>
                        `;
                    } else {
                        alert("Une erreur s'est produite lors de la transmission au serveur.");
                    }
                } else {
                    // 2. MAINTENANCE : CONSULTATION DES TICKETS SANS ENVOI FORMSPREE
                    formSav.style.display = 'none';
                    successScreen.style.display = 'block';
                    
                    const secteur = document.getElementById('maintenance-activite').value;
                    let fichesDuSecteur = fichesAQUOS[secteur] || [];
                    let fichesHTML = "";
                    
                    if (fichesDuSecteur.length === 0) {
                        fichesHTML = `<div style="color:#777; text-align:center; padding: 20px;">Aucune intervention requise dans ce secteur.</div>`;
                    } else {
                        fichesDuSecteur.forEach(item => {
                            fichesHTML += `
                                <div style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: left;">
                                    <div style="font-weight: bold; color: #1e293b; font-size: 1.05rem; margin-bottom: 5px;">${item.nom} — Tél: <a href="tel:${item.tel}" style="color: var(--primary); text-decoration: none;">${item.tel}</a></div>
                                    ${item.adresse ? `<div style="color: #475569; margin-bottom: 5px; font-size: 0.95rem;"><strong>Adresse :</strong> ${item.adresse}</div>` : ''}
                                    <div style="color: #ef4444; font-size: 0.95rem;">Défaut : ${item.probleme}</div>
                                </div>
                            `;
                        });
                    }
                    
                    successScreen.innerHTML = `
                        <div style="font-size: 3.5rem; margin-bottom: 15px;">🔧</div>
                        <h3 style="color: var(--primary); margin-bottom: 15px; font-size: 1.4rem;">Fiches d'intervention chargées</h3>
                        <p style="color: #555; font-size: 0.95rem; margin-bottom: 20px; line-height: 1.5;">
                            Vos coordonnées professionnelles (<strong>${emailInput}</strong>) sont validées.<br>
                            Voici la liste des interventions urgentes en <strong>${secteur.toUpperCase()}</strong> :
                        </p>
                        <div style="background: #ffffff; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e2e8f0; overflow: hidden;">
                            ${fichesHTML}
                        </div>
                        <button onclick="retourFormulaireSAV()" class="btn" style="background: #6c757d; margin: auto;">Retour</button>
                    `;
                }
            } catch (error) {
                alert("Erreur de connexion.");
            } finally {
                btnSubmit.innerText = "Envoyer la demande";
                btnSubmit.disabled = false;
            }
        });
    }
}

// --- 9. GESTION DU RAPPORT PERSONNEL ---
let chartConsoInstance = null;
let chartTempsInstance = null;
let chartProvenanceInstance = null;

function afficherRapport(event) {
    event.preventDefault();
    const email = document.getElementById('email-rapport').value;
    document.getElementById('rapport-login').style.display = 'none';
    document.getElementById('rapport-content').style.display = 'block';
    document.getElementById('rapport-bienvenue').innerText = `Rapport d'analyse pour : ${email}`;
    initialiserGraphiquesRapport(email);
}

function fermerRapport() {
    document.getElementById('rapport-content').style.display = 'none';
    document.getElementById('rapport-login').style.display = 'block';
    document.getElementById('email-rapport').value = '';
}

function genererProfilUtilisateur(email) {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    const score = hash % 101; 
    const baseConso = 100 + (hash % 200);
    const consoData = [baseConso, baseConso + 40, baseConso - 20, baseConso + 15];
    const baseTime = 15 + (hash % 45);
    const timeData = [baseTime, baseTime + 10, baseTime - 5, baseTime + 20, baseTime, baseTime + 15, baseTime - 2];
    const pctRecycle = 55 + (hash % 36); 
    const pctReseau = 100 - pctRecycle;
    return { score, consoData, timeData, pctRecycle, pctReseau };
}

function initialiserGraphiquesRapport(email) {
    const profil = genererProfilUtilisateur(email);

    const ctxConso = document.getElementById('chart-conso').getContext('2d');
    if (chartConsoInstance) chartConsoInstance.destroy();
    chartConsoInstance = new Chart(ctxConso, {
        type: 'bar',
        data: {
            labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
            datasets: [{ label: 'Vos Litres', data: profil.consoData, backgroundColor: '#00b4d8', borderRadius: 5 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctxTemps = document.getElementById('chart-temps').getContext('2d');
    if (chartTempsInstance) chartTempsInstance.destroy();
    chartTempsInstance = new Chart(ctxTemps, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [{ label: 'Minutes', data: profil.timeData, borderColor: '#7209b7', backgroundColor: 'rgba(114, 9, 183, 0.1)', fill: true }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 120 } } }
    });

    const ctxProv = document.getElementById('chart-provenance').getContext('2d');
    if (chartProvenanceInstance) chartProvenanceInstance.destroy();
    chartProvenanceInstance = new Chart(ctxProv, {
        type: 'doughnut',
        data: {
            labels: ['Eau Recyclée %', 'Eau Réseau %'],
            datasets: [{ data: [profil.pctRecycle, profil.pctReseau], backgroundColor: ['#20c997', '#a2d2ff'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const marker = document.getElementById('eco-marker');
    const listeRec = document.getElementById('liste-recommandations');
    
    setTimeout(() => {
        if (marker) marker.style.left = profil.score + '%'; 
        let color, txt;

        if (profil.score < 33) {
            color = '#ff4d4d';
            txt = `<li>Temps moyen élevé. Utilisez le mode veille pendant le savonnage.</li>
                   <li>Économisez environ 400 Litres par mois en écourtant vos douches de 3 minutes.</li>`;
        } else if (profil.score < 66) {
            color = '#ffb300';
            txt = `<li>Consommation équilibrée. Réduisez la consigne d'un degré pour maximiser l'énergie.</li>
                   <li>Bon niveau de recyclage. Inspectez régulièrement les filtres.</li>`;
        } else {
            color = '#20c997';
            txt = `<li><strong>Parfait !</strong> Utilisation optimale de votre équipement AQUOS.</li>
                   <li>Votre taux de recyclage atteint de remarquables performances, préservant le réseau public.</li>`;
        }

        if (marker) marker.style.backgroundColor = color;
        if (listeRec) listeRec.innerHTML = txt;
    }, 100);
}