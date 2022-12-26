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

btnReadFile.addEventListener("click", function () {
  try {
    const file = inputFile.files[0]; // Lê o arquivo selecionado.

    if (!file) {
      throw new Error("Nenhum arquivo selecionado");
    }

    const reader = new FileReader(); // Cria um leitor de arquivo.

    reader.onload = function () {
      const buffer = reader.result;// Resultado da leitura.

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
      inputPassword1.value = password != "" ? password : "Senhas diferentes";
      inputPassword2.value = password != "" ? password : "Senhas diferentes";
      inputChassi.value = chassi;
      inputWaitingTime.value = waitingTime1 != 'a6a5' ? 'Ativo' : 'Inativo';
      // inputWaitingTime.value = waitingTime2;
      inputCS.value = cs;
      inputMECKey.value = mecKey;

      btnEdit.addEventListener("click", function (e) {
        let inputs = document.querySelectorAll('input[type="text"]');
        document.querySelector('#btnSave').removeAttribute('disabled');
        inputs.forEach(item => item.removeAttribute('disabled'));

        btnReadFile.setAttribute("disabled", "disabled");
      })

      document.querySelector('#btnEdit').removeAttribute('disabled');

      btnSave.addEventListener("click", function () { // Salvando entrada.

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

        // Criando um novo array de bytes a partir do objeto DataView.
        const modifiedArrayBuffer = dataView.buffer.slice(dataView.byteOffset, dataView.byteLength);

        // Criando um novo arquivo a partir do array de bytes modificado.
        const modifiedFile = new File([modifiedArrayBuffer], file.name.slice(0, -4) + "-modificado.bin", {
          type: file.type,
        });

        saveAs(modifiedFile);
        
        new Notification('Arquivo Salvo', {
          body: `Arquivo ${file.name} foi modificado e salvo.`,
        })

        // Limpando inputs para nova leitura.
        resetInputsAndButtons();
      });
    };

    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error(error);
    alert('Ocorreu um erro ao ler o arquivo: ' + error.message);
  }
});

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



