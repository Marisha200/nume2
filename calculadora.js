// --- Configuración Numerológica ---
const letterValues = {
    'A': 1, 'J': 1, 'S': 1, 'B': 2, 'K': 2, 'T': 2, 'C': 3, 'L': 3, 'U': 3,
    'D': 4, 'M': 4, 'V': 4, 'E': 5, 'N': 5,'Ñ': 5, 'W': 5, 'F': 6, 'O': 6, 'X': 6,
    'G': 7, 'P': 7, 'Y': 7, 'H': 8, 'Q': 8, 'Z': 8, 'I': 9, 'R': 9
};
const vowels = 'AEIOUY';

// Variable global para almacenar las interpretaciones cargadas del JSON
let interpretations = null;

// --- Función para Cargar Interpretaciones desde JSON ---
async function loadInterpretations() {
    try {
        // Ajusta la ruta si 'interpretaciones.json' no está en la misma carpeta que el HTML
        const response = await fetch('interpretaciones.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        interpretations = await response.json();
        console.log("Interpretaciones cargadas correctamente.");
        // Opcional: Habilitar el botón de cálculo solo después de cargar el JSON
        // document.getElementById('calcularBtn').disabled = false;
    } catch (error) {
        console.error("Error al cargar el archivo de interpretaciones (interpretaciones.json):", error);
        // Mostrar un error al usuario en la página
        const errorMessage = document.getElementById('error-message');
        if(errorMessage) {
             errorMessage.textContent = 'Error crítico: No se pudieron cargar las interpretaciones. Asegúrate de que el archivo "interpretaciones.json" exista en la misma carpeta.';
        }
        // Opcional: Deshabilitar el botón si las interpretaciones no cargan
        // document.getElementById('calcularBtn').disabled = true;
    }
}

// --- Función de Reducción (Maneja Números Maestros 11, 22, 33) ---
function reduceNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return NaN;
    if (num === 11 || num === 22 || num === 33) return num;
    let sum = Math.abs(Math.floor(num));
    while (sum > 9) {
        let digitSum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
        if (isNaN(digitSum)) return NaN;
        sum = digitSum;
        if (sum === 11 || sum === 22 || sum === 33) return sum;
    }
    if (isNaN(sum)) return NaN;
    return sum;
}

// --- Función para obtener valor numérico de un texto ---
function getTextValue(text, type = 'all') {
     if (!text) return 0;
    const normalizedText = text
        .toUpperCase()
        .replace(/Ñ/g, 'N')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z]/g, ''); // Solo deja letras A-Z

    let sum = 0;
    if (!normalizedText) return 0;

    for (const char of normalizedText) {
        const isVowel = vowels.includes(char);
        if (type === 'all' || (type === 'vowels' && isVowel) || (type === 'consonants' && !isVowel)) {
            sum += letterValues[char] || 0;
        }
    }
    return sum;
}

// --- Función Principal de Cálculo ---
function calculateNumerology() {
    // Verificar si las interpretaciones se cargaron
    if (!interpretations) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'Las interpretaciones aún no se han cargado o hubo un error. Por favor, espera un momento o recarga la página.';
        console.error("Attempted to calculate before interpretations were loaded.");
        return; // Detener el cálculo si no hay interpretaciones
    }

    // --- Lectura de Inputs y Validaciones ---
    const nombres = document.getElementById('nombres').value.trim();
    const apellidoPaterno = document.getElementById('apellidoPaterno').value.trim();
    const apellidoMaterno = document.getElementById('apellidoMaterno').value.trim();
    const apellidoAbuelaP = document.getElementById('apellidoAbuelaP').value.trim();
    const apellidoAbuelaM = document.getElementById('apellidoAbuelaM').value.trim();
    const fechaNacimiento = document.getElementById('fechaNacimiento').value.trim();
    const errorMessage = document.getElementById('error-message');
    const resultsSection = document.getElementById('results-section');

    errorMessage.textContent = ''; // Limpiar errores previos
    resultsSection.style.display = 'none'; // Ocultar resultados previos

    // Validaciones (igual que antes)
    if (!nombres || !apellidoPaterno || !apellidoMaterno) { /* ... (mensaje de error) */ return; }
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const dateMatch = fechaNacimiento.match(dateRegex);
    if (!dateMatch) { /* ... (mensaje de error) */ return; }
    let day = parseInt(dateMatch[1], 10);
    let month = parseInt(dateMatch[2], 10);
    let year = parseInt(dateMatch[3], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12 || year < 100 || year > 9999) { /* ... (mensaje de error) */ return; }
    const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    if (month === 2 && isLeap && day > 29) { /* ... (mensaje de error) */ return; }
    if (month === 2 && !isLeap && day > 28) { /* ... (mensaje de error) */ return; }
    if (month !== 2 && day > daysInMonth[month]) { /* ... (mensaje de error) */ return; }

    // --- Preparación de Datos ---
    let fullNameParts = [nombres, apellidoPaterno, apellidoMaterno];
    if (apellidoAbuelaP) fullNameParts.push(apellidoAbuelaP);
    if (apellidoAbuelaM) fullNameParts.push(apellidoAbuelaM);
    const fullNameForCalc = fullNameParts.join(' ').replace(/\s+/g, ' ').trim();

    let initialsList = [];
    nombres.split(' ').forEach(namePart => { let tp = namePart.trim(); if (tp.length > 0) initialsList.push(tp[0]); });
    if (apellidoPaterno.length > 0) initialsList.push(apellidoPaterno[0]);
    if (apellidoMaterno.length > 0) initialsList.push(apellidoMaterno[0]);
    if (apellidoAbuelaP && apellidoAbuelaP.length > 0) initialsList.push(apellidoAbuelaP[0]);
    if (apellidoAbuelaM && apellidoAbuelaM.length > 0) initialsList.push(apellidoAbuelaM[0]);
    const initialsText = initialsList.join('');


    // --- Cálculos ---
    try {
        // Calcular todos los números
        const almaSum = getTextValue(fullNameForCalc, 'vowels');
        const almaResult = reduceNumber(almaSum);

        const personalidadSum = getTextValue(fullNameForCalc, 'consonants');
        const personalidadResult = reduceNumber(personalidadSum);

        const expresionSum = getTextValue(fullNameForCalc, 'all');
        const expresionResult = reduceNumber(expresionSum);

        const dateDigits = day.toString().padStart(2,'0') + month.toString().padStart(2,'0') + year.toString();
        const caminoVidaSum = dateDigits.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
        if (isNaN(caminoVidaSum)) throw new Error("Error summing date digits.");
        const caminoVidaResult = reduceNumber(caminoVidaSum);

        const reducedDay = reduceNumber(day);
        const reducedMonth = reduceNumber(month);
        if (isNaN(reducedDay) || isNaN(reducedMonth)) throw new Error("Error reducing day/month.");
        const fuerzaSum = reducedDay + reducedMonth;
        const fuerzaResult = reduceNumber(fuerzaSum);

        const equilibrioSum = getTextValue(initialsText, 'all');
        const equilibrioResult = reduceNumber(equilibrioSum);


        // --- Mostrar Resultados y Descripciones (Usando el objeto 'interpretations' cargado) ---
        const defaultDescription = "Interpretación no disponible.";

        // Función auxiliar para mostrar resultados
        const displayResult = (value, valueElementId, descriptionElementId, interpretationsMap) => {
            const valueElement = document.getElementById(valueElementId);
            const descriptionElement = document.getElementById(descriptionElementId);
            // Asegurarse que los elementos existen antes de intentar usarlos
            if (!valueElement || !descriptionElement) {
                 console.error(`HTML element not found for ${valueElementId} or ${descriptionElementId}`);
                 return; // Salir si falta un elemento HTML
            }

            if (isNaN(value)) {
                valueElement.textContent = 'Error';
                descriptionElement.textContent = 'No se pudo calcular el número.';
            } else {
                valueElement.textContent = value;
                // Acceder a la interpretación usando la clave del número (convertida a string si acaso)
                const interpretationText = interpretationsMap ? interpretationsMap[String(value)] : null;
                descriptionElement.textContent = interpretationText || defaultDescription;
            }
        };

        // Mostrar cada resultado usando la función auxiliar
        displayResult(almaResult, 'almaResult', 'almaDescription', interpretations.alma);
        displayResult(personalidadResult, 'personalidadResult', 'personalidadDescription', interpretations.personalidad);
        displayResult(expresionResult, 'expresionResult', 'expresionDescription', interpretations.expresion);
        displayResult(caminoVidaResult, 'caminoVidaResult', 'caminoVidaDescription', interpretations.caminoVida);
        displayResult(fuerzaResult, 'fuerzaResult', 'fuerzaDescription', interpretations.fuerza);
        displayResult(equilibrioResult, 'equilibrioResult', 'equilibrioDescription', interpretations.equilibrio);

        // Mostrar la sección de resultados solo si todo fue bien
        resultsSection.style.display = 'block';

    } catch (error) {
        console.error("Error durante el cálculo principal:", error);
        errorMessage.textContent = 'Ocurrió un error al calcular. Revisa los datos ingresados o la consola (F12).';
        resultsSection.style.display = 'none'; // Ocultar resultados si hay error
    }
}

// --- Event Listener para el Botón ---
document.getElementById('calcularBtn').addEventListener('click', calculateNumerology);

// --- Carga Inicial de Interpretaciones ---
// Llama a la función para cargar el JSON tan pronto como el script se ejecute
// Podría ponerse dentro de un evento 'DOMContentLoaded' para más seguridad
document.addEventListener('DOMContentLoaded', (event) => {
    loadInterpretations();
    // Opcional: Deshabilitar el botón hasta que carguen las interpretaciones
    // const calcButton = document.getElementById('calcularBtn');
    // if(calcButton) calcButton.disabled = true;
});