const inputFile = document.querySelector("#file");
const inputPassword1 = document.querySelector("#password1");
const inputPassword2 = document.querySelector("#password2");
const inputChassi = document.querySelector("#chassi");
const inputWaitingTime = document.querySelector("#waiting-time");
const inputCS = document.querySelector("#cs");
const inputMECKey = document.querySelector("#mec-key");
const btnReadFile = document.querySelector("#btnReadFile");
const btnEdit = document.querySelector("#btnEdit");
const btnSave = document.querySelector("#btnSave");

const Buffer = require('buffer').Buffer;

const { ipcRenderer } = require('electron');

let buffer;
let file;

btnReadFile.addEventListener("click", function () {
  try {
    file = inputFile.files[0]; // Lê o arquivo selecionado.

    if (!file) {
      throw new Error("Nenhum arquivo selecionado");
    }

    console.log(file.type);

    if (!file.type.startsWith("application/") || file.size !== 512) {
      throw new Error("Arquivo inválido");
    }

    const reader = new FileReader(); // Cria um leitor de arquivo.

    reader.onload = function () {
      buffer = reader.result;// Resultado da leitura.

      const data = new Uint8Array(buffer);// Converte para Unit8Array.

      // Lê valores nas posições.
      let password1 = readValue(data, 26, 27);
      let password2 = readValue(data, 178, 179);
      let chassi = hexToAscii(readValue(data, 68, 84));
      let waitingTime1 = readValue(data, 30, 31);
      let waitingTime2 = readValue(data, 182, 183);
      let cs = readValue(data, 189, 204);
      let mecKey = hexToAscii(readValue(data, 86, 90));

      // Valindando senhas.
      const password = password1 === password2 ? password1 : "";

      // Apresentando valores para usuario.
      inputPassword1.value = password != "" ? password : `Diferentes, ${password1}`;
      inputPassword2.value = password != "" ? password : `Diferentes, ${password2}`;
      inputChassi.value = chassi;
      inputWaitingTime.value = waitingTime1 != 'a6a5' ? 'Ativo' : 'Inativo';
      // inputWaitingTime.value = waitingTime2;
      inputCS.value = cs;
      inputMECKey.value = mecKey;

      btnEdit.addEventListener("click", function (e) {
        let inputs = document.querySelectorAll('input[type="text"]');
        document.querySelector('#btnSave').removeAttribute('disabled');
        inputs.forEach(item => {
          if (item.id == 'waiting-time') return;
          item.removeAttribute('disabled')
        });

        btnReadFile.setAttribute("disabled", "disabled");
      });

      document.querySelector('#btnEdit').removeAttribute('disabled');
    };

    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.log(error);
  }
});

function salvar() {
  // Valida os inputs antes de continuar.
  if (!validateInputs()) return;

  // Tratando entrada.
  password1 = hexToAscii(inputPassword1.value);
  password2 = hexToAscii(inputPassword2.value);
  chassi = inputChassi.value;
  // waitingTime1 = hexToAscii(inputWaitingTime.value);
  // waitingTime2 = hexToAscii(inputWaitingTime.value);
  cs = hexToAscii(inputCS.value); // problema
  mecKey = inputMECKey.value;

  const dataView = new DataView(buffer);

  // Atualiza valores novo arquivo.
  updateData(password1, dataView, 26);
  updateData(password2, dataView, 178);
  updateData(chassi, dataView, 68);
  // updateData(waitingTime1, dataView, 30);
  // updateData(waitingTime2, dataView, 182);
  updateData(cs, dataView, 189);
  updateData(mecKey, dataView, 86);

  const newFile = new File([buffer], `${file.name.slice(0, -4)}-modificado.bin`, { type: file.type }); // Cria um novo arquivo.

  // Faz download do arquivo.
  saveAs(newFile);

  new Notification('Arquivo Modificado', {
    body: `Arquivo ${file.name} foi modificado.`,
  })

  // Limpando inputs para nova leitura.
  resetInputsAndButtons();
}

btnSave.addEventListener("click", salvar);

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
  document.querySelector('#btnSave').setAttribute('disabled', 'disabled');
  document.querySelector('#btnEdit').setAttribute('disabled', 'disabled');
  inputs.forEach(item => item.setAttribute('disabled', 'disabled'));

  btnReadFile.removeAttribute('disabled');

  inputFile.value = '';
  inputPassword1.value = '';
  inputPassword2.value = '';
  inputChassi.value = '';
  inputWaitingTime.value = '';
  inputCS.value = '';
  inputMECKey.value = '';
}

function validateInputs() {
  const errorMessages = document.querySelectorAll('.error-message');

  // Remove todos os elementos "error-message" da tela.
  errorMessages.forEach(errorMessage => errorMessage.remove());

  if (inputPassword1.value.length != 4) {
    const error = document.createElement('p');
    error.classList.add('error-message');
    error.innerText = 'Exatamente 4 caracteres.';
    inputPassword1.parentNode.insertBefore(error, inputPassword1.nextSibling);
  }

  if (inputPassword2.value.length != 4) {
    const error = document.createElement('p');
    error.classList.add('error-message');
    error.innerText = 'Exatamente 4 caracteres.';
    inputPassword2.parentNode.insertBefore(error, inputPassword2.nextSibling);
  }

  if (inputChassi.value.length != 17) {
    const error = document.createElement('p');
    error.classList.add('error-message');
    error.innerText = 'Exatamente 17 caracteres.';
    inputChassi.parentNode.insertBefore(error, inputChassi.nextSibling);
  }

  // if (inputPassword1.value != inputPassword2.value) {
  //   const error = document.createElement('p');
  //   error.classList.add('error-message');
  //   error.innerText = 'Senhas devem ser iguais.';
  //   inputPassword1.parentNode.insertBefore(error, inputPassword1.nextSibling);
  //   inputPassword2.parentNode.insertBefore(error, inputPassword2.nextSibling);
  // }

  // Retorna true se não houver elementos "error-message" na tela.
  return !document.querySelector('.error-message');
}

const backButton = document.getElementById('go-back-button');
backButton.addEventListener('click', () => {
  ipcRenderer.send('go-back');
});
