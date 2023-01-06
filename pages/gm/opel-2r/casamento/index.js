const inputFileIMMO = document.querySelector('#fileIMMO'),
    inputPasswordIMMO = document.querySelector('#passwordIMMO'),
    inputChassiIMMO = document.querySelector('#chassiIMMO'),
    inputMECKeyIMMO = document.querySelector('#mec-keyIMMO'),
    btnReadFileIMMO = document.querySelector('#btnReadFileIMMO'),
    btnIMMOToECU = document.querySelector('#btnIMMOToECU'),
    backButton = document.getElementById('go-back-button');

const inputFileECU = document.querySelector('#fileECU'),
    inputPasswordECU = document.querySelector('#passwordECU'),
    inputChassiECU = document.querySelector('#chassiECU'),
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
    console.log('Botão IMMO');
});

btnReadFileECU.addEventListener("click", function () {
    fileECU = inputFileECU.files[0];
    readFile(fileECU, '2');
    console.log('Botão ECU');
});

function readFile(file, typeDevice) {
    console.log('Função readFile');
    try {
        validateFile(file);
        const reader = new FileReader(); // Cria um leitor de arquivo.
        reader.onload = function () {
            const buffer = reader.result;
            typeDevice == '1' ? bufferIMMO = buffer : bufferECU = buffer;
            const data = new Uint8Array(buffer);
            const valores = readValues(data, typeDevice);
            showValues(valores, typeDevice);
            handleButtons(typeDevice);
        };
        reader.readAsArrayBuffer(file);
        buffer = new ArrayBuffer(reader.result);
    } catch (error) {
        console.log(error);
    }
}

function validateFile(file) {
    console.log('Função validateFile');
    if (!file) {
        throw new Error("Nenhum arquivo selecionado");
    }
    if (!file.type.startsWith("application/")) {
        throw new Error("Arquivo inválido");
    }
}

function readValues(data, typeDevice) {
    console.log('Função readValues');
    if (typeDevice == '1') {
        const password = readValue(data, 26, 27);
        const chassi = hexToAscii(readValue(data, 68, 84));
        const mecKey = hexToAscii(readValue(data, 86, 90));
        return {
            password: password != "" ? password : `Diferentes, ${password}`,
            chassi: chassi,
            mecKey: mecKey
        };
    } else {
        const password = readValue(data, 26, 27);
        const chassi = hexToAscii(readValue(data, 68, 84));
        return {
            password: password != "" ? password : `Diferentes, ${password}`,
            chassi: chassi
        };
    }
}

function showValues(valores, typeDevice) {
    console.log('Função showValues');
    if (typeDevice == '1') {
        inputPasswordIMMO.value = valores.password;
        inputChassiIMMO.value = valores.chassi;
        inputMECKeyIMMO.value = valores.mecKey;
    } else {
        inputPasswordECU.value = valores.password;
        inputChassiECU.value = valores.chassi;
    }
}

function handleButtons(typeDevice) {
    console.log('Função handleButtons');

    if (!btnIMMOToECU.contains('disabled')) {
        btnReadFileIMMO.setAttribute("disabled", "disabled");
    } else if (!btnECUToIMMO.contains('disabled')) {
        btnReadFileECU.setAttribute("disabled", "disabled");
    }

    if (typeDevice == '1') {
        btnIMMOToECU.removeAttribute("disabled");
    } else {
        btnECUToIMMO.removeAttribute("disabled");
    }
    return
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
    console.log('Função readIMMOFormValues');

    const password = inputPasswordIMMO.value;
    const chassi = inputChassiIMMO.value;
    const mecKey = inputMECKeyIMMO.value;
    return { password, chassi, mecKey };
}

function readECUFormValues() {
    console.log('Função readECUFormValues');

    const password = inputPasswordIMMO.value;
    const chassi = inputChassiIMMO.value;
    return { password, chassi };
}

function salvar(typeDevice, file) {
    console.log('Função salvar');
    const values = typeDevice == '1' ? readIMMOFormValues() : readECUFormValues();
    let buffer = typeDevice == '1' ? bufferIMMO : bufferECU;
    // Tratando entrada.
    password = hexToAscii(values.password);
    chassi = values.chassi;

    const dataView = new DataView(new ArrayBuffer(buffer));

    // Atualiza valores novo arquivo.
    updateData(password, dataView, 26);
    updateData(chassi, dataView, 68);

    const newFile = new File([buffer], `${file.name.slice(0, -4)}-casado.bin`, { type: file.type }); // Cria um novo arquivo.

    // Faz download do arquivo.
    saveAs(newFile);

    new Notification('Arquivo Modificado', {
        body: `Arquivo ${file.name} foi modificado.`,
    })

    // Limpando inputs para nova leitura.
    resetInputsAndButtons();
}

btnIMMOToECU.addEventListener('click', function () {
    salvar('1', fileIMMO);
});

btnECUToIMMO.addEventListener('click', function () {
    salvar('2', fileECU);
});