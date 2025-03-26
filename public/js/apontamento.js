(function(){
  const queryString = window.location.search;

  if (queryString){
    const urlParams = new URLSearchParams(queryString);

    document.getElementById('Estab').value = urlParams.get('esbCod')
    document.getElementById('OS').value = urlParams.get('osNumer')
    document.getElementById('Setor').value = urlParams.get('setor')

    getValidateOS(Number(urlParams.get('osNumer')), Number(urlParams.get('esbCod')))
  }

})()


//Fields
const ESTAB = document.getElementById('Estab')
const OS = document.getElementById('OS')
const CLIENTE = document.getElementById('Cliente')
const SETOR = document.getElementById('Setor')
const COR = document.getElementById('Cor')
const GRAVARAPPONT =  document.getElementById('Gravar')
const ArrayItens = []
const MOTIVO = []
const BTNMODAL = document.getElementById('OpenCamera');

// Funtions

function GenerateEventListiner (){

  const elements = document.querySelectorAll('[aria-item]')

  elements.forEach(element => {
    const qtdePecas = element.children[6];
    const qtdeProd = element.children[8];
    const qtdeReject = element.children[9];
    const totalProd = element.children[10];
    const buttonProd = element.children[11].children[0];
    const buttonRejei = element.children[12].children[0];
    const motivo = element.children[13].children[0];
    const btnModal = element.children[15].children[0]
    const perfil = element.children[16].textContent

    motivo.disabled = true;

    qtdeProd.children[0].addEventListener('keyup', event => {

      if(Number(event.target.value) > Number(qtdePecas.textContent)){
        totalProd.textContent = Number(qtdePecas.textContent);
        event.target.value = Number(qtdePecas.textContent);
      }

      const valorAnterior = totalProd.textContent;
      totalProd.textContent = Number(totalProd.textContent) + Number(event.target.value) - Number(valorAnterior)

    })

    qtdeReject.children[0].addEventListener('keyup', event => {

      if (Number(qtdeProd.children[0].value) + Number(event.target.value) > Number(qtdePecas.textContent)){
        event.target.value = Number(qtdePecas.textContent) - Number(qtdeProd.children[0].value);
      }

      if (Number(event.target.value) > 0){
        motivo.disabled = false;
      } else {
        motivo.disabled = true;
        motivo.value = ""
      }

      const valor = Number(qtdeProd.children[0].value) + Number(event.target.value);
      totalProd.innerHTML = valor;

    })

    buttonProd.addEventListener('click', event => {
      qtdeProd.children[0].value = Number(qtdePecas.textContent);
      qtdeReject.children[0].value = 0;
      totalProd.textContent = Number(qtdePecas.textContent);
    })

    buttonRejei.addEventListener('click', event => {
      qtdeProd.children[0].value = 0;
      qtdeReject.children[0].value = Number(qtdePecas.textContent);
      totalProd.textContent = Number(qtdePecas.textContent);
      motivo.disabled = false;
    })

    btnModal.addEventListener('click', event => {
      event.preventDefault;
      const bodyModal = document.querySelector('#dv-modal .modal-body');

      bodyModal.innerHTML = '';

      bodyModal.innerHTML = `<img src="/produtos/${perfil}" alt=${perfil} width="300" heigh="300">`
    })

  })

}

async function getValidateOS(OSNumer, Estab, event){

  if(!Number(OSNumer) || !Number(Estab)){
    return toastr.error('Informe uma OS ou selecione um estabelecimento para continuar', 'Dados Incorretos')
  }

  const response = await fetch(`/api/production/validateOS?OS=${OSNumer}&Estab=${Estab}`)
  const result = await response.json()

  const responseCor = await fetch(`/api/loads/cor?ESB_COD=${Estab}&OS_NUMER=${OSNumer}`);
  const resultCor = await responseCor.json();

  if(response.status > 200){
    event.target.focus()
    return toastr.error(result.message, 'Erro')
  }

  if (result.length === 0){
    event.target.value = '';
    CLIENTE.value = '';
    return toastr.info('Não há dados à serem exibidos!', '')

  }

  CLIENTE.value = result.CLIENTE

  const str = resultCor.map(cor => `<option value="${cor.ITE_COD}">${cor.DESC_ITEM}</option>`).join('');
  COR.insertAdjacentHTML('beforeend', str);

  if(event?.key === 'Enter'){
    SETOR.focus();
  }

  // COR.focus();
}

async function getDataOS(OSNumer, Estab, event){
  if(!Number(OSNumer) || !Number(Estab)){
    return toastr.error('Informe uma OS ou selecione um estabelecimento para continuar', 'Dados Incorretos')
  }

  const response = await fetch(`/api/production/listOS?OS=${OSNumer}&Estab=${Estab}&Setor=${SETOR.value}&Cor=${COR.value}`)
  const result = await response.json()

  if(response.status > 200){
    event.target.focus()
    return toastr.error(result.message, 'Erro')
  }

  if (result.length === 0){
    return toastr.info('Não há dados à serem exibidos!', '');
  }

  document.getElementById('TotalProd').disabled = false;
  document.getElementById('TotalRejei').disabled = false;
  document.getElementById('Gravar').disabled = false;

  const str = result.map((item,index) => {

    const TRSTR = `
        <tr class="border-b-2" aria-item>
        <td class="px-2 py-2 font-thin" aria-osi style="display: none;">${item.OSI_SEQ}</td>
        <td class="px-2 py-2 font-thin" aria-oss style="display: none;">${item.OSS_SEQ}</td>
        <td class="px-2 py-2 font-thin" aria-ipo style="display: none;">${item.SEQ_APONT}</td>
        <td class="px-2 py-2 font-thin" aria-tipo style="display: none;">${item.TIP_COD}</td>
        <td class="px-2 py-2 font-thin" aria-tinta>${item.COD_COR}</td>
        <td class="px-2 py-2 font-thin" aria-perfil>${item.COD_PERFIL === null ? item.ITEM : item.COD_PERFIL}</td>
        <td class="px-2 py-2 font-thin" aria-pecas>${item.QUANT_RESTANTE}</td>
        <td class="px-2 py-2 font-thin">${new Intl.NumberFormat('pt-BR').format((item.QUANT_KG / item.QUANT_PC) * item.QUANT_RESTANTE)}</td>
        <td class="px-2 py-2 font-thin">
          <input type="number" class="border-b-2 border-blue-900 w-16 antialiased outline-none focus:border-blue-400 transition duration-300 ease-in-out" aria-prod${index+1}">
        </td>
        <td class="px-4 font-thin">
          <input type="number" class="border-b-2 border-blue-900 w-16 antialiased outline-none focus:border-blue-400 transition duration-300 ease-in-out" aria-rejec${index+1}">
        </td>
        <td class="px-4 font-thin" aria-total${index+1}>0</td>

        <td class="font-thin">
          <button class="rounded px-2 bg-green-500 text-white" aria-totalprod${index+1}>Total</button>
        </td>
        <td>
          <button class="rounded px-2 bg-red-500 text-white" aria-totalreject${index+1}>Total</button>
        </td>

        <td class="px-4 font-thin">
        <select>
          <option value="" selected disabled>Selecione um motivo</option>
          ${MOTIVO.map(option => option)}
        </select>
      </td>
      <td class="px-4 font-thin">
        <input type="text" class="border-b-2 border-blue-900 w-32 antialiased outline-none focus:border-blue-400 transition duration-300 ease-in-out">
      </td>
      <td class="px-4 font-thin">
        <button aria-openModal onclick="openModal('dv-modal', '${item.ITE_IMAGEM}')" class="bg-indigo-500 rounded text-white px-2">Perfil</button>
      </td>
      <td class="px-2 py-2 font-thin" aria-img style="display: none;">${item.ITE_IMAGEM}</td>

      </tr>
      `
      // <img src="/produtos/${item.ITE_IMAGEM}">
    return TRSTR;
  }).join('')

  document.querySelector('tbody').innerHTML = str;

  GenerateEventListiner();

}

async function SaveAppont(element){



  const [OSI_SEQ,OSS_SEQ,IPO_SEQ, , , , , , PROD, REJEI,,,,MOTIVO,OBS] = element.children
  const [prod] = PROD.children;
  const [reject] = REJEI.children;
  const [motivo] = MOTIVO.children;
  const [obs] = OBS.children;

  // ESTAB, OS_NUMER, OSI, OSS, SETOR, SEQ_SET, SEQ_APONTAMENTO

  ArrayItens.push({
      ESB_COD:  +ESTAB.value,
      OS_NUMER: +OS.value,
      IPO_SEQ:  +IPO_SEQ.textContent,
      OSI_SEQ:  +OSI_SEQ.textContent,
      OSS_SEQ:  +OSS_SEQ.textContent,
      SET_COD:  +SETOR.value,
      IPO_QUANT_PROD: +prod.value,
      IPO_QUANT_REJEI: +reject.value,
      MOC_COD: +motivo.value,
      OSS_OBS: obs.value
  })


}

function openModal(mn, img) {
  let modal = document.getElementById(mn);

    if (!img){
      return toastr.info('Não há dados à imagem para ser exibida!', '')
    }

    if (typeof modal == 'undefined' || modal === null)
        return;

    modal.style.display = 'Block';
    document.body.style.overflow = 'hidden';
}

function closeModal(mn) {
      let modal = document.getElementById(mn);

      if (typeof modal == 'undefined' || modal === null)
          return;

      Quagga.stop();
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';

}

function appontTotalProd (){
  const elements = document.querySelectorAll('[aria-item]')
  elements.forEach(element => {
    const qtdePecas = element.children[6];
    const qtdeProd = element.children[8];
    const qtdeReject = element.children[9];
    const motivo = element.children[13].children[0];
    const totalProd = element.children[10];

    qtdeProd.children[0].value = Number(qtdePecas.textContent);
    qtdeReject.children[0].value = 0;

    totalProd.textContent = Number(qtdePecas.textContent);

    motivo.disabled = true;
    motivo.value = ""

  })
}

function appontTotalRejei (){
  const elements = document.querySelectorAll('[aria-item]')

  elements.forEach(element => {
    const qtdePecas = element.children[6];
    const qtdeProd = element.children[8];
    const qtdeReject = element.children[9];
    const motivo = element.children[13].children[0];
    const totalProd = element.children[10];

    qtdeReject.children[0].value = Number(qtdePecas.textContent);

    totalProd.textContent = Number(qtdePecas.textContent);

    qtdeProd.children[0].value = 0;
    motivo.disabled = false;

  })
}

// Fetch Data

fetch('/api/loads/estab', { cache: 'no-cache' })
  .then(response => response.json())
  .then(data => {
    const str = data
      .map(
        estab =>
          `<option value="${estab.ESB_COD}">${estab.ESB_COD} - ${estab.ESB_DESC}</option>`,
      )
      .join('');

    ESTAB.insertAdjacentHTML('beforeend', str);
  });

fetch('/api/loads/setor', { cache: 'no-cache' })
  .then(response => response.json())
  .then(data => {
    const str = data
      .map(
        estab =>
          `<option value="${estab.SET_COD}">${estab.SET_COD} - ${estab.SET_DESC}</option>`,
      )
      .join('');

    SETOR.insertAdjacentHTML('beforeend', str);
  });

fetch('/api/loads/motivo', { cache: 'no-cache' })
  .then(response => response.json())
  .then(data => {
    const str = data
      .map(
        estab =>
          `<option value="${estab.MOC_COD}">${estab.MOC_COD} - ${estab.MOC_DESC}</option>`,
      )
      .join('');

      MOTIVO.push(str);
  });

// Events

OS.addEventListener('keyup', event => {
  if(event.key === 'Enter'){
    getValidateOS(OS.value, ESTAB.value, event)
  }
})

OS.addEventListener('blur', event => {
  getValidateOS(OS.value, ESTAB.value, event)
})

COR.addEventListener('change', event => {
  getDataOS(OS.value, ESTAB.value, event)
})

document.getElementById('TotalProd').addEventListener('click', event => { appontTotalProd() });
document.getElementById('TotalRejei').addEventListener('click', event => { appontTotalRejei() });

GRAVARAPPONT.addEventListener('click', event => {
  event.preventDefault();

  const elements = document.querySelectorAll('[aria-item]')

  if(!elements.length){
    return toastr.info('Não há dados à serem apontados!', '');
  }

  elements.forEach(element => {

    const totalProd = element.children[10];

    if(Number(totalProd.textContent) > 0){
      SaveAppont(element)
    }

  })


  fetch('/api/production/createAppont', {
    body: JSON.stringify(ArrayItens),
    cache: 'no-cache',
    method: 'POST',
    headers: {
      "Content-Type":"application/json"
    }

  })
  .then(response => {

    if(response.status === 200){
      toastr.success('Apontamento realizado com sucesso!', '');
      setTimeout(() => {
        // return window.location.reload();
        return window.location.href = '/producao/apontamento'
      }, 2000);
    }

  }).catch(error => {
    toastr.error('Erro ao realizar apontamento!', '');
  })


})

// BTNMODAL.addEventListener('click', event => {
//   if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {

//     Quagga.init({
//       inputStream : {
//         name : "Live",
//         type : "LiveStream",
//         target: document.querySelector('#preview'),
//         constraints: {
//           facingMode: "environment",
//           // deviceId: '5a9f13faad7f2e9ddacfa01b521afd8c95d6622df8826ce0256168c7587adf07'
//         },
//         area: { // defines rectangle of the detection/localization area
//           top: "25%",    // top offset
//           right: "0%",  // right offset
//           left: "0%",   // left offset
//           bottom: "25%"  // bottom offset
//         },
//       },
//       decoder : {
//         readers : ["ean_reader"]
//       }
//     }, function(err) {
//         if (err) {
//             console.log(err);
//             return
//         }
//         Quagga.start();
//         Quagga.onDetected(data => {
//           OS.value = data.codeResult.code;
//           Quagga.stop();
//           closeModal('dv-modal');
//           getDataOS(OS.value, ESTAB.value, event)
//         })
//     });

//   }
// })
