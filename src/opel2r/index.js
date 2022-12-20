const fs = require('fs');


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

btnReadFile.addEventListener("click", function () {
  const file = inputFile.files[0]; // lê o arquivo selecionado.
  const reader = new FileReader(); // cria um leitor de arquivo.

  reader.onload = function () {
    const buffer = reader.result;// resultado da leitura.

    const data = new Uint8Array(buffer);//converte para Unit8Array.

    //lendo valores nas posições.
    let password1 = readValue(data, 26, 27);
    let password2 = readValue(data, 178, 179);
    let chassi = hexToAscii(readValue(data, 68, 84));
    let waitingTime = readValue(data, 30, 31);
    let cs = readValue(data, 189, 204);
    let mecKey = hexToAscii(readValue(data, 86, 90));

    //valida senhas iguais.
    const password = password1 === password2 ? password1 : "";

    //Apresentando valores para usuario.
    inputPassword1.value = password != "" ? password : "Senhas diferentes";
    inputPassword2.value = password != "" ? password : "Senhas diferentes";
    inputChassi.value = chassi;
    inputWaitingTime.value = waitingTime;
    inputCS.value = cs;
    inputMECKey.value = mecKey;

    btnEdit.addEventListener("click", function(e) {
      const inputs = document.querySelectorAll('input[type="text"]');
      document.querySelector('#btnSave').removeAttribute('disabled');
      inputs.forEach(item => item.removeAttribute('disabled'));

      btnReadFile.setAttribute("disabled", "disabled");
    })

    document.querySelector('#btnEdit').removeAttribute('disabled');

    btnSave.addEventListener("click", function(){

      //Tratar entrada
      password1 = hexToAscii(inputPassword1.value);
      password2 = hexToAscii(inputPassword2.value);
      chassi = inputChassi.value;
      waitingTime = inputWaitingTime.value.toUpperCase();
      waitingTime = toString(waitingTime, 16);
      cs = hexToAscii(inputCS.value);
      mecKey = inputMECKey.value;
      

      // Converte a string para o encoding do arquivo
      // let stringAsByteArray = new TextEncoder().encode(password1);


      const dataView = new DataView(buffer);

      // Substitui os índices entre 26 e 28 pela string
      // for (let i = 0; i < stringAsByteArray.length; i++) {
      //   dataView.setInt8(26 + i, stringAsByteArray[i]);
      // }

      updateData2(password1, dataView, 26);
      updateData2(password2, dataView, 178);
      updateData2(chassi, dataView, 68);
      updateData2(waitingTime, dataView, 181);
      updateData2(cs, dataView, 189);
      updateData2(mecKey, dataView, 86);

      // Cria um novo array de bytes a partir do objeto DataView
      const modifiedArrayBuffer = dataView.buffer.slice(dataView.byteOffset, dataView.byteLength);

      // Cria um novo arquivo a partir do array de bytes modificado
      const modifiedFile = new File([modifiedArrayBuffer], file.name + "-modificado", {
        type: file.type,
      });

      // updateData(password1, buffer, 26, 27);
      // updateData(inputPassword2.value, buffer, 178, 179);
      // updateData(asciiToHexa(inputChassi.value), buffer, 68, 84);
      // updateData(inputWaitingTime.value, buffer, 30, 31);
      // updateData(inputCS.value, buffer, 189, 204);
      // updateData(asciiToHexa(inputMECKey.value), buffer, 86, 90);

      // console.log(buffer);
      console.log(password1);
      // console.log(password2);
      // console.log(inputChassi.value);
      // console.log(waitingTime);
      // console.log(inputWaitingTime.value);
      // console.log(inputCS.value);
      // console.log(inputMECKey.value);
      
      // Salva o arquivo com o novo conteúdo
      const blob = new Blob([buffer], { type: file.type });

      saveAs(modifiedFile);
    });
  };

  reader.readAsArrayBuffer(file);
});


function ConvertStringToHex(str) {
  var arr = [];
  for (var i = 0; i < str.length; i++) {
         arr[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
  }
  return "\\u" + arr.join("\\u");
}

function updateData(value, buffer, initIndex, finalIndex) {
  const dataView = new DataView(buffer);

  const decimal = parseInt(value, 16);
  for (let i = initIndex; i <= finalIndex; i++) {
    dataView.setUint8(i, decimal);
    console.log(decimal);
  }
}



function updateData2(value, dataView, initIndex){
  // Converte a string para o encoding do arquivo
  let stringAsByteArray = new TextEncoder().encode(value);

  console.log(stringAsByteArray)

  // Substitui os índices entre 26 e 28 pela string
  for (let i = 0; i < stringAsByteArray.length; i++) {
    dataView.setInt8(initIndex + i, stringAsByteArray[i]);
  }
}





function readValue(data, initIndex, finalIndex) {
  let result = [];
  for (let i = initIndex; i <= finalIndex; i++) {
    result += dec2Hex(data[i]);
  }
  return result;
}

function readValueToDec(data, initIndex, finalIndex) {
  let result = [];
  for (let i = initIndex; i <= finalIndex; i++) {
    result += hexToDecimal(data[i]);
  }
  return result;
}

function dec2Hex(dec) {
  return Math.abs(dec).toString(16);
}

const hexToDecimal = hex => parseInt(hex, 16)

function asciiToHexa(fileContent) {
  let arr1 = [];
  for (let n = 0, l = fileContent.length; n < l; n++) {
    let hex = Number(fileContent.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join("");
}

function hexToAscii(fileContent) {
  let hex = fileContent.toString();
  let str = "";
  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}



