// --- 0. GESTION DE L'AUTHENTIFICATION (SIMULATION BASE DE DONNÉES) ---
let isLoginMode = true;

function afficherMessageAuth(texte, type) {
    const box = document.getElementById('auth-message');
    if (!box) return;
    
    box.style.display = 'block';
    box.innerHTML = texte;
    
    if (type === 'erreur') {
        box.style.backgroundColor = '#ffebee';
        box.style.color = '#c62828';
        box.style.border = '1px solid #ef9a9a';
    } else if (type === 'succes') {
        box.style.backgroundColor = '#e8f5e9';
        box.style.color = '#2e7d32';
        box.style.border = '1px solid #a5d6a7';
    } else if (type === 'info') {
        box.style.backgroundColor = '#e3f2fd';
        box.style.color = '#1565c0';
        box.style.border = '1px solid #90caf9';
    }
}

function mettreAJourTextesAuth() {
    const isEn = document.body.classList.contains('lang-en');
    
    const title = document.getElementById('auth-title');
    const btnSubmit = document.getElementById('btn-auth-submit');
    const switchText = document.getElementById('auth-switch-text');
    const switchLink = document.getElementById('auth-switch-link');
    
    if(title) title.innerHTML = isLoginMode ? (isEn ? "Login" : "Connexion") : (isEn ? "Create an account" : "Créer un compte");
    if(btnSubmit) btnSubmit.innerText = isLoginMode ? (isEn ? "Login" : "Se connecter") : (isEn ? "Sign up" : "S'inscrire");
    if(switchText) switchText.innerText = isLoginMode ? (isEn ? "No account yet?" : "Pas encore de compte ?") : (isEn ? "Already have an account?" : "Déjà un compte ?");
    if(switchLink) switchLink.innerText = isLoginMode ? (isEn ? "Create an account" : "Créer un compte") : (isEn ? "Login" : "Se connecter");
}

function basculerModeAuth() {
    isLoginMode = !isLoginMode;
    mettreAJourTextesAuth();
    
    const linkForgot = document.getElementById('link-forgot');
    const authMessage = document.getElementById('auth-message');
    
    if(linkForgot) linkForgot.style.display = isLoginMode ? "inline" : "none";
    if(authMessage) authMessage.style.display = 'none';
}

function gererAuthentification(event) {
    event.preventDefault();
    const authMessage = document.getElementById('auth-message');
    if (authMessage) authMessage.style.display = 'none';
    
    const isEn = document.body.classList.contains('lang-en');

    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const profilRadio = document.querySelector('input[name="auth-profil"]:checked');
    const profil = profilRadio ? profilRadio.value : 'utilisateur';

    let usersDB = JSON.parse(localStorage.getItem('aquos_users')) || {};

    if (isLoginMode) {
        if (!usersDB[email]) {
            afficherMessageAuth(isEn ? "No account found with this email. Please create an account." : "Aucun compte trouvé avec cet email. Veuillez créer un compte.", "erreur");
            return;
        }
        if (usersDB[email].password !== password) {
            afficherMessageAuth(isEn ? "Incorrect password for this email address." : "Mot de passe incorrect pour cette adresse email.", "erreur");
            return;
        }
    } else {
        if (usersDB[email]) {
            afficherMessageAuth(isEn ? "An account already exists with this email. Please log in." : "Un compte existe déjà avec cette adresse email. Veuillez vous connecter.", "erreur");
            return;
        }
        if (password.length < 4) {
            afficherMessageAuth(isEn ? "Password must contain at least 4 characters." : "Le mot de passe doit contenir au moins 4 caractères.", "erreur");
            return;
        }
        
        usersDB[email] = { password: password, profil: profil };
        localStorage.setItem('aquos_users', JSON.stringify(usersDB));
    }

    const authSection = document.getElementById('auth-section');
    const appContent = document.getElementById('app-content');
    if(authSection) authSection.style.display = 'none';
    if(appContent) appContent.style.display = 'block';
    
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.style.display = 'block';

    const inputEmailRapport = document.getElementById('email-rapport');
    const inputEmailSav = document.getElementById('email-sav');
    if (inputEmailRapport) inputEmailRapport.value = email;
    if (inputEmailSav) inputEmailSav.value = email;

    const profilEnregistre = usersDB[email] ? usersDB[email].profil : profil;
    const radioSav = document.querySelector(`input[name="profil"][value="${profilEnregistre}"]`);
    if (radioSav) {
        radioSav.checked = true;
        basculerProfilSAV();
    }

    window.location.hash = "analyse";
}

function motDePasseOublie() {
    const authMessage = document.getElementById('auth-message');
    if(authMessage) authMessage.style.display = 'none';
    
    const emailInput = document.getElementById('auth-email');
    if(!emailInput) return;
    
    const email = emailInput.value.trim();
    const isEn = document.body.classList.contains('lang-en');
    
    if (!email) {
        afficherMessageAuth(isEn ? "Please enter your email address in the field above before clicking." : "Veuillez renseigner votre adresse email dans le champ ci-dessus avant de cliquer.", "erreur");
        return;
    }

    let usersDB = JSON.parse(localStorage.getItem('aquos_users')) || {};
    
    if (!usersDB[email]) {
        afficherMessageAuth(isEn ? "No account is associated with this email address." : "Aucun compte n'est associé à cette adresse email.", "erreur");
        return;
    }

    afficherMessageAuth(isEn ? `(Mockup) Your current password is: <b>${usersDB[email].password}</b>` : `(Maquette) Votre mot de passe actuel est : <b>${usersDB[email].password}</b>`, "info");
}

function deconnexion() {
    const isEn = document.body.classList.contains('lang-en');
    
    const authSection = document.getElementById('auth-section');
    const appContent = document.getElementById('app-content');
    if(authSection) authSection.style.display = 'flex';
    if(appContent) appContent.style.display = 'none';
    
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.style.display = 'none';

    const authPass = document.getElementById('auth-password');
    if(authPass) authPass.value = "";
    
    fermerRapport();
    afficherMessageAuth(isEn ? "You have been successfully logged out." : "Vous avez été déconnecté avec succès.", "succes");
}

// --- 1. GESTION DE LA LANGUE ---
function toggleLanguage() {
    document.body.classList.toggle('lang-en');
    const isEn = document.body.classList.contains('lang-en');
    const btn = document.getElementById('btn-lang');
    if (btn) {
        btn.innerText = isEn ? "EN / FR" : "FR / EN";
    }
    
    const emailInput = document.getElementById('auth-email');
    if (emailInput) {
        emailInput.placeholder = document.body.classList.contains('lang-en') ? "your@email.com" : "votre@email.com";
    }

    if (document.getElementById('auth-title')) mettreAJourTextesAuth();
    
    document.querySelectorAll('option[data-fr]').forEach(opt => {
        opt.innerText = isEn ? opt.getAttribute('data-en') : opt.getAttribute('data-fr');
    });

    recupererVraiesDonnees(); 
    initialiserGraphique(); 
    
    const emailRapportEl = document.getElementById('email-rapport');
    const rapportContent = document.getElementById('rapport-content');
    if (emailRapportEl && rapportContent && rapportContent.style.display === 'block') {
        initialiserGraphiquesRapport(emailRapportEl.value);
    }
}

// --- 2. RÉCUPÉRATION DU PACK DE DONNÉES ADAFRUIT IO API ---
const username = "sasouki"; 
async function recupererVraiesDonnees() {
    const badge = document.getElementById('carte-statut');
    
    try {
        let res = await fetch(`https://io.adafruit.com/api/v2/${username}/feeds/donnees?nocache=${new Date().getTime()}`);
        
        if (!res.ok) throw new Error("Serveur injoignable");

        let data = await res.json();
        
        // --- CALCUL SÉCURISÉ DU TEMPS ---
        let dateDonnee = new Date(data.updated_at).getTime();
        let dateActuelle = new Date().getTime();
        // On calcule la différence en secondes
        let differenceEnSecondes = (dateActuelle - dateDonnee) / 1000;

        // Si la donnée date de plus de 20 secondes, on déclenche l'erreur (Hors ligne)
        // (Le système pardonne jusqu'à 20 secondes si le réseau est lent)
        if (differenceEnSecondes > 20 || differenceEnSecondes < -20) {
            throw new Error("Carte déconnectée (Donnée obsolète)");
        }

        // --- SI TOUT VA BIEN (EN LIGNE) ---
        if (badge) {
            badge.style.background = "#e8f5e9";
            badge.style.color = "#2e7d32";
            badge.innerHTML = document.body.classList.contains('lang-en') ? '🟢 AQUOS System Online' : '🟢 Système AQUOS en ligne';
        }

        if (data.last_value) {
            let valeurs = data.last_value.split(',');
            if(valeurs.length >= 6) {
                let temp = valeurs[0];
                let tds = valeurs[1];
                let turb = valeurs[2];
                let pompe = valeurs[3];
                let uv = valeurs[4];
                let mode = valeurs[5];

                updateDashboardCard('val-temp', temp + ' <span class="unit">°C</span>', 'stat-temp', 'En direct', '#00b4d8');
                updateDashboardCard('val-turb', turb + ' <span class="unit">NTU</span>', 'stat-turb', 'En direct', '#00b4d8');
                updateDashboardCard('val-tds', tds + ' <span class="unit">ppm</span>', 'stat-tds', 'En direct', '#00b4d8');
                updateDashboardCard('val-pump', pompe + ' <span class="unit">%</span>', 'stat-pump', 'En direct', '#00b4d8');
                updateDashboardCard('val-mode', mode, 'stat-mode', 'Actif', '#00b4d8');
                updateDashboardCard('val-uv', uv, 'stat-uv', uv === 'ON' ? 'Allumé' : 'Éteint', uv === 'ON' ? '#00b4d8' : '#6c757d');

                // Animation Thermomètre
                const thermoLiquid = document.getElementById('thermo-liquid');
                const thermoBulb = document.getElementById('thermo-bulb');
                if(thermoLiquid && thermoBulb) {
                    let tempPct = Math.min(Math.max((parseFloat(temp) / 50) * 100, 0), 100);
                    thermoLiquid.style.height = tempPct + '%';
                    thermoLiquid.style.backgroundColor = '#0077b6'; 
                    thermoBulb.style.backgroundColor = '#0077b6';
                }

                // Animation Jauge Pompe
                const pumpNeedle = document.getElementById('pump-needle');
                const gaugeWrapper = document.querySelector('.gauge-wrapper');
                if(pumpNeedle && gaugeWrapper) {
                    gaugeWrapper.classList.add('active');
                    let pumpVal = parseFloat(pompe) || 0;
                    let angle = -90 + (pumpVal * 1.8); 
                    pumpNeedle.style.transform = `rotate(${angle}deg)`;
                }

                // Bouton UV
                const uvSwitch = document.getElementById('uv-switch');
                if(uvSwitch) {
                    if(uv === 'ON') uvSwitch.classList.add('on');
                    else uvSwitch.classList.remove('on');
                }
            }
        }
    } catch (error) {
        // --- EN CAS D'ERREUR (HORS LIGNE) ---
        if (badge) {
            badge.style.background = "#ffebee";
            badge.style.color = "#c62828";
            badge.innerHTML = document.body.classList.contains('lang-en') ? '🔴 AQUOS System Offline' : '🔴 Système AQUOS hors ligne';
        }
        
        // Optionnel mais pro : On efface les valeurs pour montrer que c'est éteint
        updateDashboardCard('val-temp', '-- <span class="unit">°C</span>', 'stat-temp', 'Hors ligne', '#a0aec0');
        updateDashboardCard('val-turb', '-- <span class="unit">NTU</span>', 'stat-turb', 'Hors ligne', '#a0aec0');
        updateDashboardCard('val-tds', '-- <span class="unit">ppm</span>', 'stat-tds', 'Hors ligne', '#a0aec0');
        updateDashboardCard('val-pump', '-- <span class="unit">%</span>', 'stat-pump', 'Hors ligne', '#a0aec0');
        updateDashboardCard('val-mode', '--', 'stat-mode', 'Hors ligne', '#a0aec0');
        updateDashboardCard('val-uv', 'OFF', 'stat-uv', 'Éteint', '#a0aec0');

        // Remise à zéro des graphiques
        const thermoLiquid = document.getElementById('thermo-liquid');
        if(thermoLiquid) thermoLiquid.style.height = '0%';
        
        const pumpNeedle = document.getElementById('pump-needle');
        const gaugeWrapper = document.querySelector('.gauge-wrapper');
        if(pumpNeedle && gaugeWrapper) {
            gaugeWrapper.classList.remove('active');
            pumpNeedle.style.transform = `rotate(-90deg)`;
        }
        
        const uvSwitch = document.getElementById('uv-switch');
        if(uvSwitch) uvSwitch.classList.remove('on');
    }
}

function updateDashboardCard(valId, valText, statId, statText, color) {
    const valElement = document.getElementById(valId);
    const statElement = document.getElementById(statId);
    if(valElement) valElement.innerHTML = valText; 
    if(statElement) {
        statElement.innerText = statText;
        statElement.style.backgroundColor = color;
    }
}

// --- 3. GRAPHIQUE ET VIDÉOS ---
let showerChart = null;
function initialiserGraphique() {
    const isEn = document.body.classList.contains('lang-en');
    const ctx = document.getElementById('showerChart');
    if (!ctx) return;
    if (showerChart) showerChart.destroy();
    showerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["0 min", "2 min", "4 min", "6 min", "8 min", "10 min"],
            datasets: [{ label: isEn ? 'Turbidity (NTU)' : 'Turbidité (NTU)', data: [10, 120, 45, 12, 10, 8], borderColor: '#00b4d8', fill: true }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function initialiserVideosAccueil() {
    const video1 = document.getElementById('bg-video-1');
    const video2 = document.getElementById('bg-video-2');
    if (!video1 || !video2) return;

    setInterval(() => {
        video1.classList.toggle('video-active');
        video2.classList.toggle('video-active');
        if (video1.classList.contains('video-active')) {
            video1.currentTime = 0; video1.play().catch(() => {});
        } else {
            video2.currentTime = 0; video2.play().catch(() => {});
        }
    }, 10000);
}

// --- 4. SIMULATEUR & FAQ ---
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

        const litersPerYear = Math.round(people * time * 12 * 365 * 0.90);
        const eurosPerYear = Math.round(litersPerYear * 0.007);

        if (resLiters) resLiters.innerText = litersPerYear.toLocaleString('fr-FR');
        if (resEuros) resEuros.innerText = eurosPerYear.toLocaleString('fr-FR');
    }
    inputPeople.addEventListener('input', calculateSavings);
    inputTime.addEventListener('input', calculateSavings);
    calculateSavings();
}

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

// --- 5. LOGIQUE DU SAV & LIEN DE MAINTENANCE ---
let fichesAQUOS = {
    plomberie: [{ nom: "Jean Dupuis", tel: "0612345678", adresse: "14 Rue du Faubourg, Paris", probleme: "Fuite d'eau" }],
    filtration: [{ nom: "Marie Lucas", tel: "0798765432", adresse: "3 Place Bellecour, Lyon", probleme: "Odeur désagréable" }],
    electronique: [{ nom: "Thomas Lenoir", tel: "0655443322", adresse: "88 Bd Canebière, Marseille", probleme: "L'écran reste éteint" }],
    pompes: [{ nom: "Sophie Martin", tel: "0611223344", adresse: "22 Rue République, Lille", probleme: "Le moteur fait du bruit" }]
};

function verifierAffichageFiche() {
    const radioChecked = document.querySelector('input[name="profil"]:checked');
    if(!radioChecked) return;
    const profil = radioChecked.value;
    
    const panneEl = document.getElementById('panne-raison');
    const secteurEl = document.getElementById('maintenance-activite');
    const panne = panneEl ? panneEl.value : null;
    const secteur = secteurEl ? secteurEl.value : null;
    
    const blocLien = document.getElementById('bloc-lien-maintenance');
    const blocPrecision = document.getElementById('bloc-precision-autre');
    const inputPrecision = document.getElementById('precision-autre');
    
    if (blocLien) {
        if ((profil === 'utilisateur' && panne === 'ecran_eteint') || 
            (profil === 'maintenance' && secteur === 'electronique')) {
            blocLien.style.display = 'block';
        } else {
            blocLien.style.display = 'none';
        }
    }

    if (blocPrecision && inputPrecision) {
        if (profil === 'utilisateur' && panne === 'autre') {
            blocPrecision.style.display = 'block';
            inputPrecision.required = true;
        } else {
            blocPrecision.style.display = 'none';
            inputPrecision.required = false;
        }
    }
}

function basculerProfilSAV() {
    const radioChecked = document.querySelector('input[name="profil"]:checked');
    if(!radioChecked) return;
    const profil = radioChecked.value;
    
    const blocUtilisateur = document.getElementById('bloc-utilisateur-panne');
    const blocMaintenance = document.getElementById('bloc-maintenance-activite');
    const selectUtilisateur = document.getElementById('panne-raison');
    const selectMaintenance = document.getElementById('maintenance-activite');
    const inputAdresse = document.getElementById('adresse-sav');

    if (!blocUtilisateur || !blocMaintenance) return;

    if (profil === 'utilisateur') {
        blocUtilisateur.style.display = 'block';
        if(selectUtilisateur) selectUtilisateur.required = true;
        if(inputAdresse) inputAdresse.required = true;
        blocMaintenance.style.display = 'none';
        if(selectMaintenance) {
            selectMaintenance.required = false;
            selectMaintenance.value = "";
        }
    } else {
        blocUtilisateur.style.display = 'none';
        if(selectUtilisateur) {
            selectUtilisateur.required = false;
            selectUtilisateur.value = "";
        }
        if(inputAdresse) {
            inputAdresse.required = false;
            inputAdresse.value = "";
        }
        blocMaintenance.style.display = 'block';
        if(selectMaintenance) selectMaintenance.required = true;
    }
    verifierAffichageFiche();
}

function retourFormulaireSAV() {
    const formSav = document.getElementById('form-sav');
    if(!formSav) return;
    
    formSav.reset(); 
    formSav.style.display = 'block';
    
    const authEmailEl = document.getElementById('auth-email');
    const emailSavEl = document.getElementById('email-sav');
    if(authEmailEl && emailSavEl) {
        emailSavEl.value = authEmailEl.value;
    }

    const successScreen = document.getElementById('sav-success-screen');
    if(successScreen) {
        successScreen.style.display = 'none';
        successScreen.innerHTML = '';
    }
    
    basculerProfilSAV(); 
}

function initialiserSAV() {
    const selectPanne = document.getElementById('panne-raison');
    const selectMaintenance = document.getElementById('maintenance-activite');
    if (selectPanne) selectPanne.addEventListener('change', verifierAffichageFiche);
    if (selectMaintenance) selectMaintenance.addEventListener('change', verifierAffichageFiche);

    const formSav = document.getElementById('form-sav');
    const successScreen = document.getElementById('sav-success-screen');

    if (formSav && successScreen) {
        formSav.addEventListener('submit', async function(event) {
            event.preventDefault();
            const isEn = document.body.classList.contains('lang-en');
            const emailInput = document.getElementById('email-sav').value;
            const telInput = document.getElementById('tel-sav').value;
            const profilRadio = formSav.querySelector('input[name="profil"]:checked');
            const profil = profilRadio ? profilRadio.value : 'utilisateur';
            const btnSubmit = formSav.querySelector('button[type="submit"]');
            
            btnSubmit.innerText = isEn ? "Processing..." : "Traitement en cours...";
            btnSubmit.disabled = true;

            try {
                if (profil === 'utilisateur') {
                    const response = await fetch('https://formspree.io/f/xykappqb', {
                        method: 'POST', body: new FormData(formSav), headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        formSav.style.display = 'none';
                        successScreen.style.display = 'block';

                        const selectElement = document.getElementById('panne-raison');
                        let labelPanne = selectElement.options[selectElement.selectedIndex].text;
                        const valeurPanne = selectElement.value;
                        const adresseVal = document.getElementById('adresse-sav').value;
                        
                        if (valeurPanne === 'autre') {
                            const precisionText = document.getElementById('precision-autre').value;
                            labelPanne = isEn ? `Other: ${precisionText}` : `Autre : ${precisionText}`;
                        }

                        let secteurAssocie = "plomberie"; 
                        if (valeurPanne === "odeur") secteurAssocie = "filtration";
                        if (valeurPanne === "ecran_eteint") secteurAssocie = "electronique";
                        if (valeurPanne === "pas_debit") secteurAssocie = "pompes";

                        if(fichesAQUOS[secteurAssocie]) {
                            fichesAQUOS[secteurAssocie].unshift({
                                nom: "Client (" + emailInput.split('@')[0] + ")", tel: telInput, adresse: adresseVal, probleme: labelPanne
                            });
                        }

                        successScreen.innerHTML = `
                            <div style="font-size: 3.5rem; margin-bottom: 15px;">✅</div>
                            <h3 style="color: var(--primary); margin-bottom: 15px; font-size: 1.5rem;">${isEn ? 'Request successfully submitted' : 'Demande transmise avec succès'}</h3>
                            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
                                ${isEn ? 'An expert will contact you shortly to intervene at' : 'Un expert va vous recontacter rapidement pour intervenir au'} <strong>${adresseVal}</strong>.
                            </p>
                            <button onclick="retourFormulaireSAV()" class="btn" style="background: #6c757d; margin: auto;">${isEn ? 'Close' : 'Fermer'}</button>
                        `;
                    } else {
                        alert("Error with Formspree server.");
                    }
                } else {
                    formSav.style.display = 'none';
                    successScreen.style.display = 'block';
                    
                    const secteurEl = document.getElementById('maintenance-activite');
                    const secteur = secteurEl ? secteurEl.value : 'plomberie';
                    let fichesDuSecteur = fichesAQUOS[secteur] || [];
                    let fichesHTML = "";
                    
                    if (fichesDuSecteur.length === 0) {
                        fichesHTML = `<div style="color:#777; text-align:center; padding: 20px;">${isEn ? 'No intervention required.' : 'Aucune intervention requise.'}</div>`;
                    } else {
                        fichesDuSecteur.forEach(item => {
                            fichesHTML += `
                                <div style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: left;">
                                    <div style="font-weight: bold; color: #1e293b; font-size: 1.05rem;">${item.nom} — Tel: <a href="tel:${item.tel}">${item.tel}</a></div>
                                    ${item.adresse ? `<div style="color: #475569; font-size: 0.95rem;"><strong>${isEn?'Address':'Adresse'} :</strong> ${item.adresse}</div>` : ''}
                                    <div style="color: #ef4444; font-size: 0.95rem;">${isEn?'Issue':'Défaut'} : ${item.probleme}</div>
                                </div>
                            `;
                        });
                    }
                    
                    successScreen.innerHTML = `
                        <div style="font-size: 3.5rem; margin-bottom: 15px;">🔧</div>
                        <h3 style="color: var(--primary); margin-bottom: 15px; font-size: 1.4rem;">${isEn ? 'Files loaded' : 'Fiches chargées'}</h3>
                        <p style="color: #555; font-size: 0.95rem; margin-bottom: 20px;">${isEn ? 'List of interventions in' : 'Liste des interventions en'} <strong>${secteur.toUpperCase()}</strong> :</p>
                        <div style="background: #ffffff; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e2e8f0; overflow: hidden;">${fichesHTML}</div>
                        <button onclick="retourFormulaireSAV()" class="btn" style="background: #6c757d; margin: auto;">${isEn ? 'Return' : 'Retour'}</button>
                    `;
                }
            } catch (error) {
                alert("Connection Error.");
            } finally {
                btnSubmit.innerText = isEn ? "Submit request" : "Soumettre la demande";
                btnSubmit.disabled = false;
            }
        });
    }
}

// --- 6. RAPPORT PERSONNEL & ECO-SCORE ---
let chartConsoInstance = null;
let chartTempsInstance = null;
let chartProvenanceInstance = null;

function afficherRapport(event) {
    event.preventDefault();
    const emailEl = document.getElementById('email-rapport');
    if(!emailEl) return;
    
    const email = emailEl.value;
    const loginContent = document.getElementById('rapport-login');
    const rapportContent = document.getElementById('rapport-content');
    
    if(loginContent) loginContent.style.display = 'none';
    if(rapportContent) rapportContent.style.display = 'block';
    
    const isEn = document.body.classList.contains('lang-en');
    const bienvenue = document.getElementById('rapport-bienvenue');
    if(bienvenue) bienvenue.innerText = isEn ? `Eco Report for: ${email}` : `Rapport d'analyse pour : ${email}`;
    
    initialiserGraphiquesRapport(email);
}

function fermerRapport() {
    const content = document.getElementById('rapport-content');
    const login = document.getElementById('rapport-login');
    if(content) content.style.display = 'none';
    if(login) login.style.display = 'block';
}

function genererProfilUtilisateur(email) {
    let hash = 0;
    for (let i = 0; i < email.length; i++) { hash = email.charCodeAt(i) + ((hash << 5) - hash); }
    hash = Math.abs(hash);
    const score = hash % 101; 
    const baseConso = 100 + (hash % 200);
    const baseTime = 15 + (hash % 45);
    const pctRecycle = 55 + (hash % 36); 
    return { 
        score, 
        consoData: [baseConso, baseConso + 40, baseConso - 20, baseConso + 15], 
        timeData: [baseTime, baseTime + 10, baseTime - 5, baseTime + 20, baseTime, baseTime + 15, baseTime - 2], 
        pctRecycle, 
        pctReseau: 100 - pctRecycle 
    };
}

function initialiserGraphiquesRapport(email) {
    const profil = genererProfilUtilisateur(email);
    const isEn = document.body.classList.contains('lang-en');
    
    let labelLiters = isEn ? 'Liters' : 'Litres';
    let labelMins = isEn ? 'Minutes' : 'Minutes';
    let daysFr = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
    let daysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const ctxConso = document.getElementById('chart-conso');
    if(ctxConso) {
        if (chartConsoInstance) chartConsoInstance.destroy();
        chartConsoInstance = new Chart(ctxConso.getContext('2d'), {
            type: 'bar', data: { labels: ['S1', 'S2', 'S3', 'S4'], datasets: [{ label: labelLiters, data: profil.consoData, backgroundColor: '#00b4d8', borderRadius: 5 }] }, options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const ctxTemps = document.getElementById('chart-temps');
    if(ctxTemps) {
        if (chartTempsInstance) chartTempsInstance.destroy();
        chartTempsInstance = new Chart(ctxTemps.getContext('2d'), {
            type: 'line', data: { labels: isEn ? daysEn : daysFr, datasets: [{ label: labelMins, data: profil.timeData, borderColor: '#7209b7', backgroundColor: 'rgba(114, 9, 183, 0.1)', fill: true }] }, options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const ctxProv = document.getElementById('chart-provenance');
    if(ctxProv) {
        if (chartProvenanceInstance) chartProvenanceInstance.destroy();
        chartProvenanceInstance = new Chart(ctxProv.getContext('2d'), {
            type: 'doughnut', data: { labels: isEn ? ['Recycled %', 'Grid %'] : ['Recyclé %', 'Réseau %'], datasets: [{ data: [profil.pctRecycle, profil.pctReseau], backgroundColor: ['#20c997', '#a2d2ff'] }] }, options: { responsive: true, maintainAspectRatio: false }
        });
    }

    setTimeout(() => {
        const marker = document.getElementById('eco-marker');
        const liste = document.getElementById('liste-recommandations');
        if (marker) {
            marker.style.left = profil.score + '%'; 
            let color = profil.score < 33 ? '#ff4d4d' : profil.score < 66 ? '#ffb300' : '#20c997';
            marker.style.backgroundColor = color;
            marker.style.borderTopColor = color; 
        }
        if (liste) {
            if (profil.score < 33) {
                liste.innerHTML = isEn 
                    ? `<li>High average time. Use standby mode.</li><li>Save 400L per month by shortening your shower by 3 min.</li>`
                    : `<li>Temps moyen élevé. Utilisez le mode veille.</li><li>Économisez 400L par mois en écourtant de 3 min.</li>`;
            } else if (profil.score < 66) {
                liste.innerHTML = isEn 
                    ? `<li>Balanced consumption. Reduce temperature by 1°C.</li><li>Inspect filters regularly.</li>`
                    : `<li>Consommation équilibrée. Réduisez la température de 1°C.</li><li>Inspectez les filtres régulièrement.</li>`;
            } else {
                liste.innerHTML = isEn 
                    ? `<li><strong>Perfect!</strong> Optimal usage.</li><li>Excellent recycling rate!</li>`
                    : `<li><strong>Parfait !</strong> Utilisation optimale.</li><li>Excellent taux de recyclage !</li>`;
            }
        }
    }, 100);
}

// Lancement automatique 
window.addEventListener('load', () => {
    recupererVraiesDonnees();
    setInterval(recupererVraiesDonnees, 3000);
    initialiserGraphique();
    initialiserVideosAccueil();
    initialiserSimulateur();
    initialiserFAQ();
    initialiserSAV(); 
    basculerProfilSAV(); 
});