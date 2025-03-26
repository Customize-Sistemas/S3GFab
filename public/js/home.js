
ARRAYITENS = []

function carregarApont(estab, osNumer,setor){
  window.location.href = `/producao/apontamento?esbCod=${estab}&osNumer=${osNumer}&setor=${setor}`
}

function myFunction(seq) {
  var popup = document.getElementById(`myPopup${seq}`);
  popup.classList.toggle("show");

  setTimeout(() => {
    popup.classList.toggle("hide");
  }, 5000);
}

function renderTableElements(result){

  const table = document.getElementById('dataTable');
  const str = result.data.sort((a,b) => a.OS_NUMER - b.OS_NUMER).map((item,index) => {
    const STR = `
    <tr class="border-b-2" aria-item>
      <td class="px-2 py-2 font-thin" aria-esbCod>${item.ESB_COD}</td>
      <td class="px-2 py-2 font-thin" aria-osNumer>${item.OS_NUMER}</td>
      <td class="px-2 py-2 font-thin" aria-mcoNumer>${item.MCO_NUMER_DOC}</td>
      <td class="px-2 py-2 font-thin" aria-fornec>
        <button class="popup" onclick="myFunction(${index+1})">
          <span class="popuptext" id="myPopup${index+1}">${String(item.CLI_RAZAO_SOC).substring(0,20)}</span>
          ${String(item.FON_RAZAO_SOC).substring(0,20)}
        </button>
      </td>
      <td class="px-2 py-2 font-thin" aria-btnApontar>
        <button class="rounded px-2 bg-green-500 text-white" onclick="carregarApont(${item.ESB_COD},${item.OS_NUMER}, ${result.setor})">Apontar</button>
      </td>
    </tr>
  `

  return STR;
  }).join('')

  table.innerHTML = str;

}

fetch('/api/production/appontHome')
  .then(response => response.json())
  .then(result => {
    renderTableElements(result)
    ARRAYITENS.push(result)
  })

function filterTable(){

  const searchType = document.querySelector('input[name="searchType"]:checked').value;
  const input = document.getElementById('search').value

  const filteredArray = ARRAYITENS[0].data.filter(item => {
    if (searchType === 'cliente'){
      return item.CLI_RAZAO_SOC.toLowerCase().includes(input.toLowerCase());
    }
    if (searchType === 'extrusora'){
      return item.FON_RAZAO_SOC.toLowerCase().includes(input.toLowerCase());
    }

  }).sort((a,b) => a.OS_NUMER - b.OS_NUMER);

  renderTableElements({data: filteredArray, setor: ARRAYITENS[0].setor})
}

document.getElementById('Buscar').addEventListener('click', filterTable)
document.getElementById('search').addEventListener('keyup', event => {
  event.preventDefault();

  if (event.key === 'Enter'){
    filterTable()
  }

  if (event.target.value.length === 0) {
    renderTableElements(ARRAYITENS[0]);
  }

})
