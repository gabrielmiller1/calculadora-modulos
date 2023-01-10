const inputFileIMMO = document.querySelector('#fileIMMO'),
    inputPasswordIMMO = document.querySelector('#passwordIMMO'),
    inputChassiIMMO = document.querySelector('#chassiIMMO'),
    inputComponentSecurityIMMO = document.querySelector('#inputComponentSecurityIMMO'),
    btnReadFileIMMO = document.querySelector('#btnReadFileIMMO'),
    btnIMMOToECU = document.querySelector('#btnIMMOToECU'),
    backButton = document.getElementById('go-back-button');

const inputFileECU = document.querySelector('#fileECU'),
    inputPasswordECU = document.querySelector('#passwordECU'),
    inputChassiECU = document.querySelector('#chassiECU'),
    inputComponentSecurityECU = document.querySelector('#inputComponentSecurityECU'),
    btnReadFileECU = document.querySelector('#btnReadFileECU'),
    btnECUToIMMO = document.querySelector('#btnECUToIMMO');

const Buffer = require('buffer').Buffer;
const { ipcRenderer } = require('electron');
const { saveAs } = require('file-saver');

let bufferIMMO,
    bufferECU;

// let buffer;

let fileIMMO;
let fileECU;

btnReadFileIMMO.addEventListener("click", function () {
    fileIMMO = inputFileIMMO.files[0];
    readFile(fileIMMO, '1');
});

btnReadFileECU.addEventListener("click", function () {
    fileECU = inputFileECU.files[0];
    readFile(fileECU, '2');
});

inputFileIMMO.addEventListener('change', () => {
    validateFile(inputFileIMMO.files[0], '1');
});

inputFileECU.addEventListener('change', () => {
    validateFile(inputFileECU.files[0], '2');
});

function readFile(file, typeDevice) {
    try {
        validateFile(file, typeDevice);
        const reader = new FileReader(); // Cria um leitor de arquivo.
        reader.onload = function () {
            const buffer = reader.result;
            typeDevice == '1' ? bufferIMMO = buffer : bufferECU = buffer;
            const data = new Uint8Array(buffer);
            const valores = readValues(data, typeDevice);
            showValues(valores, typeDevice);
            handleButtons(typeDevice);

            // Chama a função compareAndHighlightFormValues aqui:
            if (typeDevice === '2') {
                compareFilesAndChangeColor();
            }
        };
        reader.readAsArrayBuffer(file);
        buffer = new ArrayBuffer(reader.result);
    } catch (error) {
        console.log(error);
    }
}

function validateFile(file, typeDevice) {

    let corretSize;
    typeDevice == '1' ? corretSize = 512 : corretSize = 528;

    if (!file) {
        alert("Nenhum arquivo selecionado");
        throw new Error("Nenhum arquivo selecionado");
    }
    if (!file.type.startsWith("application/") || file.size !== corretSize) {
        alert("Arquivo inválido");
        throw new Error("Arquivo inválido");
    }
}

function readValues(data, typeDevice) {
    if (typeDevice == '1') {
        const password = readValue(data, 26, 27);
        const chassi = hexToAscii(readValue(data, 68, 84));
        const componentSecurityIMMO = readValue(data, 189, 204);
        return {
            password: password != "" ? password : `Diferentes, ${password}`,
            chassi: chassi,
            componentSecurityIMMO: componentSecurityIMMO
        };
    } else {
        const password = readValue(data, 164, 165);
        const chassi = hexToAscii(readValue(data, 91, 107));
        const componentSecurityECU = readValue(data, 148, 163);
        return {
            password: password != "" ? password : `Diferentes, ${password}`,
            chassi: chassi,
            componentSecurityECU: componentSecurityECU
        };
    }
}

function showValues(valores, typeDevice) {
    if (typeDevice == '1') {
        inputPasswordIMMO.value = valores.password;
        inputChassiIMMO.value = valores.chassi;
        inputComponentSecurityIMMO.value = valores.componentSecurityIMMO;
    } else {
        inputPasswordECU.value = valores.password;
        inputChassiECU.value = valores.chassi;
        inputComponentSecurityECU.value = valores.componentSecurityECU;
    }
}

function handleButtons(typeDevice) {
    if (typeDevice == '1') {
        btnIMMOToECU.removeAttribute("disabled");
        btnReadFileIMMO.setAttribute("disabled", "disabled");
        btnReadFileECU.removeAttribute("disabled");

    } else if (typeDevice == '2') {
        btnECUToIMMO.removeAttribute("disabled");
        btnReadFileECU.setAttribute("disabled", "disabled");
    }
}

// Auxiliares.
function updateData(value, dataView, initIndex) {
    try {
        const buffer = Buffer.from(value, 'ascii');
        let stringAsByteArray = new Uint8Array(buffer);

        for (let i = 0; i < stringAsByteArray.length; i++) {
            dataView.setInt8(initIndex + i, stringAsByteArray[i]);
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao atualizar dados: ', error.message);
    }
}

function readValue(data, initIndex, finalIndex) {
    let result = [];
    for (let i = initIndex; i <= finalIndex; i++) {
        let hexValue = dec2Hex(data[i]);
        if (hexValue.length < 2) {
            hexValue = "0" + hexValue;
        }
        result += hexValue;
    }
    return result;
}

function dec2Hex(dec) {
    return Math.abs(dec).toString(16);
}

function asciiToHexa(fileContent) {
    let arr1 = [];
    for (let n = 0, l = fileContent.length; n < l; n++) {
        let hex = Number(fileContent.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join("");
}

function hexToAscii(hexValue) {
    let hex = hexValue.toString();
    let str = "";
    for (let n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}

function resetInputsAndButtons() {
    let inputs = document.querySelectorAll('input[type="text"]');
    document.querySelector('#btnIMMOToECU').setAttribute('disabled', 'disabled');
    document.querySelector('#btnECUToIMMO').setAttribute('disabled', 'disabled');
    inputs.forEach(item => item.setAttribute('disabled', 'disabled'));

    btnReadFileIMMO.removeAttribute('disabled');
    btnReadFileECU.removeAttribute('disabled');

    inputs.forEach(item => item.value = '');
}

backButton.addEventListener('click', () => {
    ipcRenderer.send('go-back');
});

// Add function to read form values for IMMO file
function readIMMOFormValues() {
    const password = inputPasswordIMMO.value;
    const chassi = inputChassiIMMO.value;
    const componentSecurity = inputComponentSecurityIMMO.value;
    return { password, chassi, componentSecurity };
}

function readECUFormValues() {
    const password = inputPasswordECU.value;
    const chassi = inputChassiECU.value;
    const componentSecurity = inputComponentSecurityECU.value;
    return { password, chassi, componentSecurity };
}

function salvar(typeDevice, file) {
    const values = typeDevice == '1' ? readIMMOFormValues() : readECUFormValues();
    const buffer = typeDevice == '1' ? bufferECU : bufferIMMO;

    // Tratando entrada.
    let password = hexToAscii(values.password);
    let chassi = values.chassi;
    let componentSecurity = hexToAscii(values.componentSecurity);

    const dataView = new DataView(buffer);

    // Atualiza valores novo arquivo.
    if (typeDevice == '1') { //Immo to ECU.
        updateData(password, dataView, 164);
        updateData(chassi, dataView, 91);
        updateData(componentSecurity, dataView, 148);
    } else if (typeDevice == '2') { //Ecu to Immo.
        updateData(password, dataView, 26);
        updateData(password, dataView, 178);
        updateData(chassi, dataView, 68);
        updateData(componentSecurity, dataView, 189);

    }

    const newFile = new File([buffer], `${file.name.slice(0, -4)}-casado.bin`, { type: file.type }); // Cria um novo arquivo.

    // Faz download do arquivo.
    saveAs(newFile);

    new Notification('Arquivo Modificado', {
        body: `Arquivo ${file.name} foi modificado.`,
    })

    // Limpando inputs para nova leitura.
    resetInputsAndButtons();
}

function compareFilesAndChangeColor() {
    const immoValues = readIMMOFormValues();
    const ecuValues = readECUFormValues();

    const inputContainers1 = document.querySelectorAll('.form-group1 .input-container');
    const inputContainers2 = document.querySelectorAll('.form-group2 .input-container');
    if (!inputContainers1) return;
    if (!inputContainers2) return;

    const addClass = (index, className) => {
        inputContainers1[index].classList.add(className);
        inputContainers2[index].classList.add(className);
    }

    if (immoValues.password === ecuValues.password) {
        addClass(1, 'equal');
    } else {
        addClass(1, 'different');
    }

    if (immoValues.chassi === ecuValues.chassi) {
        addClass(2, 'equal');
    } else {
        addClass(2, 'different');
    }

    if (immoValues.componentSecurity === ecuValues.componentSecurity) {
        addClass(3, 'equal');
    } else {
        addClass(3, 'different');
    }
}

btnIMMOToECU.addEventListener('click', function () {
    salvar('1', fileECU);
});

btnECUToIMMO.addEventListener('click', function () {
    salvar('2', fileIMMO);
}); 

// Fechar aplicação.
document.querySelector('.bottom-content li a').addEventListener('click', () => {
    ipcRenderer.send('close-app');
})