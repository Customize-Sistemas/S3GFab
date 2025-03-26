
//Fields
const ESTAB = document.getElementById('Estab')
const BUSCAR = document.getElementById('Buscar')
const CLIENTEINICIAL = document.getElementById('ClienteInicial')
const CLIENTEFINAL = document.getElementById('ClienteFinal')
const DATAINICIAL = document.getElementById('dateIni')
const DATAFINAL = document.getElementById('dateFin')

// Variavels

const ArrayClientes = [];
const CLIENTES = []
let clienteInicial = '';
let clienteFinal = '';

// Funtions

async function getAllDuplicatas(event){
  event.preventDefault();

  if (!ESTAB.value){
    return toastr.error('selecione um estabelecimento para continuar', 'Dados Incorretos')
  }

  try {
    const requestDupAberto = await fetch(`/api/finances/dupAberto?estab=${ESTAB.value}&cliIni=${clienteInicial}&cliFin=${clienteFinal}&dataIni=${DATAINICIAL.value}&dataFini=${DATAFINAL.value}`)

    if (requestDupAberto.status === 404){
      return toastr.warning('Não existem duplicatas para os dados informados', '')
    }

    const responseDupAberto = await requestDupAberto.json()

    const header = [];

    responseDupAberto.forEach(order => {
      let duplicated = header.findIndex(number => order.CLI_COD == number.CLI_COD) != -1;

      if (!duplicated) {
        header.push(order);
      }
    });

    header.map(head => {
      const orderItem = responseDupAberto.filter(item => item.CLI_COD === head.CLI_COD)

      let STR = `

        <div class="md:w-2/3 w-full rounded overflow-hidden shadow-lg bg-cyan-900 text-white mt-4">
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2 text-center">${head.CLI_COD} - ${head.CLI_NOME}</div>
            <div class="font-bold text-xl mb-2 text-center">Telefone: ${head.TELEFONE === null ? '' : head.TELEFONE}</div>
          </div>

          <table class="table-auto w-4/5 text-center m-auto mb-2">
            <thead class="border">
              <th>Titulo/Seq</th>
              <th>R$</th>
              <th>Venc</th>
              <th>Dias Atraso</th>
            </thead>
            <tbody class="border">
      `
      //
      orderItem.map(dap => {
        STR += `
           <tr>
              <td>
                <button
                  class="px-1 py-1 bg-cyan-800 rounded
                  shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700
                  focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800
                  active:shadow-lg transition duration-150 ease-in-out"
                  data-bs-toggle="tooltip"
                  data-bs-html="true"
                  title="<b>Nº Banco: ${dap.DUP_NUMER_BANCO === '' ? '' : dap.DUP_NUMER_BANCO}</b>"
                >${dap.DUPLIC}</button>
              </td>
              <td class="p-1">${new Intl.NumberFormat('pt-BR', {style:'currency', currency: 'BRL'}).format(dap.VALOR_CR$)}</td>
              <td class="p-1">${dayjs(dap.DT_VENC).format('DD/MM/YYYY')}</td>
              <td>${dap.ATRASO}</td>
            </tr>
        `

      })

      STR += `
        </tbody>
        </table>
        </div>
      `

      document.querySelector('[card-dupAberto]').insertAdjacentHTML('beforeend', STR)

      let tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );

      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new Tooltip(tooltipTriggerEl);
      });
    })

  }catch(error){
    console.log(error)
  }
}

function getClienteCode(name, field){
 const cliente = ArrayClientes.find(cliente => cliente.CLI_RAZAO_SOC === name)

 if(field === 'inicial'){
  clienteInicial = cliente?.CLI_COD || 0;
}else {
  clienteFinal = cliente?.CLI_COD || 0;
 }

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

fetch('/api/loads/clientes', { cache: 'no-cache' })
  .then(response => response.json())
  .then(data => {
    data.map(cliente => {
      CLIENTES.push(cliente.CLI_RAZAO_SOC);
      ArrayClientes.push(cliente)
    })
  });

// Event Listener
autocomplete(CLIENTEINICIAL, CLIENTES);
autocomplete(CLIENTEFINAL, CLIENTES);

BUSCAR.addEventListener('click', event => getAllDuplicatas(event))

CLIENTEINICIAL.addEventListener('blur', event => getClienteCode(event.target.value, 'inicial'))
CLIENTEFINAL.addEventListener('blur', event => getClienteCode(event.target.value, 'final'))
