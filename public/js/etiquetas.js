const ESTAB = document.getElementById('Estab')
const OS = document.getElementById('OS')
const CLIENTE = document.getElementById('Cliente')
const SETOR = document.getElementById('Setor')
const QUANT = document.getElementById('Quant')
const GRAVARETQ = document.getElementById('Gravar')
const COR = document.getElementById('Cor')

const ArrayItens = []

// Functions

async function GenerateEventListiner (){

  const elements = document.querySelectorAll('[aria-item]');

  elements.forEach(element => {
    const qtdePecas = element.children[6];
    const qtdePecasPct = element.children[8];
    const qtdeEtiquetas = element.children[9];

    qtdeEtiquetas.children[0].addEventListener('keyup', event => {
      const quantTotal = Number(event.target.value) * Number(qtdePecasPct.children[0].value)

      if(quantTotal > Number(qtdePecas.textContent)){
        event.target.value = Number(qtdePecas.textContent) / Number(qtdePecasPct.children[0].value);
      }
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

  const str = resultCor.map(cor => `<option value="${cor.ITE_COD}">${cor.DESC_ITEM}</option>`).join('');
  COR.insertAdjacentHTML('beforeend', str);

  CLIENTE.value = result.CLIENTE

  COR.focus();
}

async function getDataOS(OSNumer, Estab, event){
  if(!Number(OSNumer) || !Number(Estab)){
    return toastr.error('Informe uma OS ou selecione um estabelecimento para continuar', 'Dados Incorretos')
  }

  const response = await fetch(`/api/production/listOSAppont?OS=${OSNumer}&Estab=${Estab}&Setor=${event.target.value}&tipo=${QUANT.value}&cor=${COR.value}`)
  const result = await response.json()

  if(response.status > 200){
    event.target.focus()
    return toastr.error(result.message, 'Erro')
  }

  if (result.length === 0){
    return toastr.info('Não há dados à serem exibidos!', '');
  }
//
  const str = result.map((item, index) => {

    const TRSTR = `
      <tr class="border-b-2" aria-item>
        <td class="px-2 py-2 font-thin" aria-osi style="display: none;">${item.OSI_SEQ}</td>
        <td class="px-2 py-2 font-thin" aria-oss style="display: none;">${item.OSS_SEQ}</td>
        <td class="px-2 py-2 font-thin" aria-ipo style="display: none;">${item.SEQ_APONT}</td>
        <td class="px-2 py-2 font-thin" aria-tipo style="display: none;">${item.TIP_COD}</td>
        <td class="px-2 py-2 font-thin" aria-iteCod>${item.ITE_COD}</td>
        <td class="px-2 py-2 font-thin" aria-perfil>${item.OSS_ITE_COD}</td>
        <td class="px-2 py-2 font-thin" aria-pc>${item.QUANT_PC}</td>
        <td class="px-2 py-2 font-thin" aria-kg>${item.QUANT_KG}</td>
        <td class="px-2 py-2 font-thin">
          <input type="text" class="border-b-2 border-blue-900 w-32 antialiased outline-none focus:border-blue-400 transition duration-300 ease-in-out">
        </td>
        <td class="px-2 py-2 font-thin">
          <input type="text" class="border-b-2 border-blue-900 w-32 antialiased outline-none focus:border-blue-400 transition duration-300 ease-in-out">
        </td>
      </tr>
    `
    return TRSTR;
  }).join('')

  document.querySelector('tbody').innerHTML = str;

  GenerateEventListiner();
}

async function SaveAppont(element){

  const [OSI_SEQ,OSS_SEQ,IPO_SEQ,,ITE_COD,PERFIL,PC,KG,PACOTES,ETIQUETAS] = element.children;

  const [pacotes] = PACOTES.children;
  const [etiquetas] = ETIQUETAS.children;
  // const [prod] = PROD.children;
  // const [reject] = REJEI.children;
  // const [motivo] = MOTIVO.children;
  // const [obs] = OBS.children;

  // // ESTAB, OS_NUMER, OSI, OSS, SETOR, SEQ_SET, SEQ_APONTAMENTO

  ArrayItens.push({
      ESB_COD:  +ESTAB.value,
      OS_NUMER: +OS.value,
      IPO_SEQ:  +IPO_SEQ.textContent,
      OSI_SEQ:  +OSI_SEQ.textContent,
      OSS_SEQ:  +OSS_SEQ.textContent,
      SET_COD:  +SETOR.value,
      IPO_QUANT_PACOTES: +pacotes.value,
      IPO_QUANT_ETIQUETAS: +etiquetas.value
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

// Events

OS.addEventListener('keyup', event => {
  if(event.key === 'Enter'){
    getValidateOS(OS.value, ESTAB.value, event)
  }
})

OS.addEventListener('blur', event => {
  getValidateOS(OS.value, ESTAB.value, event)
})

SETOR.addEventListener('change', event => {
  getDataOS(OS.value, ESTAB.value, event)
})

GRAVARETQ.addEventListener('click', event => {
  event.preventDefault();

  const elements = document.querySelectorAll('[aria-item]');

  if(!elements.length){
    return toastr.info('Não há dados à serem apontados!', '');
  }

  elements.forEach(element => {
    if (element.children[8]?.children[0]?.value > 0 &&
      element.children[9]?.children[0]?.value > 0) {
        SaveAppont(element)
    }
  })

  console.log(ArrayItens);

  fetch('/api/production/createAppontEtq', {
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
        return window.location.reload();
      }, 2000);
    }

  })

})
