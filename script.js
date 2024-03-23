// Fonction pour calculer les résistances et afficher les résultats
function calculateResistances() {
    // Récupération des valeurs des champs du formulaire
    var vcc = parseFloat(document.getElementById('vcc').value);
    var beta = parseFloat(document.getElementById('beta').value);
    var icq = parseFloat(document.getElementById('icq').value);
    var av = parseFloat(document.getElementById('av').value); // Ajout du gain en tension Av
    var ce = parseFloat(document.getElementById('ce').value); // Ajout de la capacité interne Ce de l’émetteur du transistor
    var amplitude = parseFloat(document.getElementById('amplitude').value);
    var frequency = parseFloat(document.getElementById('frequency').value);
    var vsSensitivity = parseFloat(document.getElementById('vsSensitivity').value);
    var veSensitivity = parseFloat(document.getElementById('veSensitivity').value);
    var horizontalSensitivity = parseInt(document.getElementById('horizontalSensitivity').value);

    // Vérification si toutes les valeurs sont valides
    if (isNaN(vcc) || isNaN(beta) || isNaN(icq) || isNaN(amplitude) || isNaN(frequency) || isNaN(vsSensitivity) || isNaN(veSensitivity) || isNaN(horizontalSensitivity) || isNaN(av) || isNaN(ce)) {
        alert("Veuillez saisir des valeurs valides pour Vcc, beta, Icq, amplitude, fréquence, sensibilité de vs, sensibilité de ve, sensibilité horizontale, gain en tension Av et capacité interne Ce.");
        return;
    }

    // Calcul des résistances
    var rc = (0.026 * (-av)) / icq;
    var vem = (0.5 * vcc)+(av * 0.026);
    var re = vem / icq;
    var vbm = vem + 0.7;
    var ibq = icq / beta;
    var ip = 10 * ibq;
    var rb2 = vbm / ip;
    var rb1 = (vcc - vbm) / (11 * ibq);
    var vcm = vem + (0.5 * vcc);
    var vceq = vcm - vem;

    // Calcul des impédances
    var h11 = 0.026 / ibq;
    var rb = (rb1 * rb2) / (rb1 + rb2);
    var rentrance = (rb * h11) / (rb + h11);
    var rsortie = rc;

    // Calcul de la fréquence de transition
    var fT = icq / (2 * Math.PI * 0.026 * ce);
    // Calcul de la fréquence de transition en MHz
    var fT_MHz = fT / 1e6; // Convertit la fréquence de transition en MHz

    // Calcul de la fréquence haute
    var fh = fT / Math.abs(av);
    // Convertit la fréquence haute en MHz
    var fh_MHz = fh / 1e6;

    // Calcul des paramètres de la fonction de transfert
    var a = 2 * Math.PI * av * fh;
    var b = 2 * Math.PI * fh;

    // Affichage des résultats des résistances, tensions, impédances et fréquences
    var resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = "<h3>RESULTATS :</h3>" +
                            "<p>Re = " + re.toFixed(2) + " ohms</p>" +
                            "<p>Rc = " + rc.toFixed(2) + " ohms</p>" +
                            "<p>Rb1 = " + rb1.toFixed(2) + " ohms</p>" +
                            "<p>Rb2 = " + rb2.toFixed(2) + " ohms</p>" +
                            "<p>Vem = " + vem.toFixed(2) + " volts</p>" +
                            "<p>Vbm = " + vbm.toFixed(2) + " volts</p>" +
                            "<p>Vcm = " + vcm.toFixed(2) + " volts</p>" +
                            "<p>Vceq = " + vceq.toFixed(2) + " volts</p>" +
                            "<p>Impedance d'entree h11 = " + h11.toFixed(2) + " ohms</p>" +
                            "<p>Impedance d'entree R-entree = " + rentrance.toFixed(2) + " ohms</p>" +
                            "<p>Impedance de sortie R-sortie = " + rsortie.toFixed(2) + " ohms</p>" +
                            "<p>Frequence de transition fT = " + fT_MHz.toFixed(2) + " MHz</p>" +
                            "<p>Frequence haute fh = " + fh_MHz.toFixed(2) + " MHz</p>" +
                            "<p>Expression de la fonction de transfert A(p) = " + a.toFixed(2) + "/(p + " + b.toFixed(2) + ")</p>";

    // Simulation des signaux ve et vs
    var ve = generateSinusoidalSignal(amplitude, frequency, 0, 2 * Math.PI, horizontalSensitivity).map(v => v * veSensitivity);
    var vs = ve.map(v => av * v * vsSensitivity);

    // Affichage des signaux
    drawSignalGraph(ve, vs);
}

// Fonction pour réinitialiser les champs
function resetFields() {
    document.getElementById('vcc').value = '';
    document.getElementById('beta').value = '';
    document.getElementById('icq').value = '';
    document.getElementById('av').value = '';
    document.getElementById('ce').value = ''; // Réinitialisation du champ pour la capacité interne Ce
    document.getElementById('amplitude').value = '';
    document.getElementById('frequency').value = '';
    document.getElementById('vsSensitivity').value = '';
    document.getElementById('veSensitivity').value = '';
    document.getElementById('horizontalSensitivity').value = '';
    document.getElementById('results').innerHTML = '';
    var signalCanvas = document.getElementById('signalCanvas');
    var signalCtx = signalCanvas.getContext('2d');
    signalCtx.clearRect(0, 0, signalCanvas.width, signalCanvas.height);
    var bodeCanvas = document.getElementById('bodeCanvas');
    var bodeCtx = bodeCanvas.getContext('2d');
    bodeCtx.clearRect(0, 0, bodeCanvas.width, bodeCanvas.height);
}

// Fonction pour ajuster la sensibilité horizontale
function adjustHorizontalSensitivity() {
    calculateResistances(); // Recalculer les résistances avec la nouvelle sensibilité horizontale
}

// Fonction pour générer un signal sinusoidal
function generateSinusoidalSignal(amplitude, frequency, phase, duration, horizontalSensitivity) {
    var samples = 100000 / horizontalSensitivity;
    var time = duration / samples;
    var signal = [];
    for (var i = 0; i < samples; i++) {
        var t = i * time;
        var value = amplitude * Math.sin(2 * Math.PI * frequency * t + phase);
        signal.push(value);
    }
    return signal;
}

// Fonction pour tracer les signaux
function drawSignalGraph(ve, vs) {
    var canvas = document.getElementById('signalCanvas');
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;

    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);

    // Dessiner les axes
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Dessiner le signal ve
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(0, height / 2 - ve[0] * height / 2);
    for (var i = 1; i < ve.length; i++) {
        ctx.lineTo(i * (width / ve.length), height / 2 - ve[i] * height / 2);
    }
    ctx.stroke();

    // Dessiner le signal vs
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(0, height / 2 - vs[0] * height / 2);
    for (var i = 1; i < vs.length; i++) {
        ctx.lineTo(i * (width / vs.length), height / 2 - vs[i] * height / 2);
    }
    ctx.stroke();
}

// Fonction pour tracer le Bode plot
function drawBodePlot() {
    var canvas = document.getElementById('bodeCanvas');
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;

    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);

    // Dessiner les axes du Bode plot
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Données pour le tracé du Bode plot
    var frequencies = [];
    var gains = [];

    // Calculer les gains en fonction de la fréquence
    for (var i = 1; i <= 100000; i++) {
        var frequency = i;
        var w = 2 * Math.PI * frequency;

        // Calculer le gain en dB à cette fréquence en utilisant la fonction de transfert de l'amplificateur EC
        var gain = 20 * Math.log10(Math.abs(2 * Math.PI * av * fh) / Math.sqrt(Math.pow(w, 2) + Math.pow(2 * Math.PI * fh, 2)));

        frequencies.push(frequency);
        gains.push(gain);
    }

    // Tracer le module de H(j2pif) en dB en fonction de la fréquence
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    for (var i = 0; i < frequencies.length; i++) {
        var x = Math.log10(frequencies[i]) * 50 + width / 2;
        var y = -(gains[i]) + height / 2;
        ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'blue';
    ctx.stroke();
}

// Événement au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Ajout des événements aux boutons
    document.getElementById('calculateResistances').addEventListener('click', calculateResistances);
    document.getElementById('resetFields').addEventListener('click', resetFields);
    document.getElementById('adjustHorizontalSensitivity').addEventListener('click', adjustHorizontalSensitivity);
    document.getElementById('drawBode').addEventListener('click', drawBodePlot);
});
