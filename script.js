let mapaMalha;
let dadosTse;
let dadosIbge;

// mapa svg para exibir na pagina
async function loadMapData(){
	let mapaUrl = 'https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&qualidade=intermediaria&intrarregiao=UF';
	let arquivoTse =`./resultados/election-data-3.json`;
	let urlIbge = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
	
	// svg
	let mapaSvg = await fetch(mapaUrl)
	mapaMalha = await mapaSvg.text();
	console.log(mapaSvg)

	// tse
	let dadosJsonTse = await fetch(arquivoTse);
    dadosTse = await dadosJsonTse.json();
	console.log(dadosTse)

	// ibge
	let dadosJsonIbge = await fetch(urlIbge);
	dadosIbge = await dadosJsonIbge.json();
	console.log(dadosIbge)

	// coloca o mapa no local certo
    let mapaConteudo = document.querySelector('#map-box');
    mapaConteudo.innerHTML = mapaMalha;

	// 1. seleciona todos os paths do svg (= id do mapaUrl)
	let ufs = document.querySelectorAll('#map-box svg path');

	// 2. para cada path eventListener de hover
	for (let uf of ufs){
		// 3. dispara a funcao mostraHover(), criada fora
		uf.onmouseover = mostraHover
	}	
}
loadMapData();

// filtro do round - turno
let userRound = document.querySelectorAll('[name=turno]')
function obterTurno(){
	for (let round of userRound){
	if (round.checked) {
		return parseInt(round.value)
	}
	}
}

for (let round of userRound){
	round.addEventListener('change', mostraAgregados)
}

// filtro do local - BR ou ZZ
let userLocal = document.querySelectorAll('[name=local]')
function obterLocal(){
	for (let local of userLocal){
	if (local.checked) {
		return local.value
	}
	}
}

for (let local of userLocal){
	local.addEventListener('change', mostraAgregados)
}

function mostraAgregados(){
	if (obterLocal() == 'ZZ'){
		let dadosCard = dadosTse.filter(function(linha){return (linha.sg_uf == 'ZZ') && (linha.nr_turno == obterTurno())})
		preencheCard(dadosCard)
	}
	else if (obterLocal() == 'BR'){ 
		let dadosCard = dadosTse.filter(function(linha){return (linha.sg_uf == 'BR') && (linha.nr_turno == obterTurno())})
		preencheCard(dadosCard)
	}
	else if (obterLocal() == 'UF'){ 
		let dadosCard = dadosTse.filter(function(linha){return (linha.sg_uf == dropdownUF.value) && (linha.nr_turno == obterTurno())})
		preencheCard(dadosCard)
	}
}

// limpar dropdown de UF
function limparResultado(){
	// condicao: se um dos select tiver valor 'blank'
	if (dropdownUF.value == 'blank'){
		let dadosCard = dadosTse.filter(function(linha){return (linha.sg_uf == 'BR') && (linha.nr_turno == obterTurno())})
		preencheCard(dadosCard)
	}
  }

// dropdown de UF
let dropdownUF = document.querySelector('#uf-brasil')
console.log(dropdownUF)

function filtraUF(){
	if (dropdownUF.value != 'blank'){
		console.log(dropdownUF.value)
		let dadosCard = dadosTse.filter(function(linha){return (linha.sg_uf == dropdownUF.value) && (linha.nr_turno == obterTurno())})
		preencheCard(dadosCard)
	}
}

// hover do mapa para exibir no painel
function mostraHover(event){
	// desabilitar se ZZ ou BR estiver checado 
	if (obterLocal() == 'ZZ' || obterLocal() == 'BR'){
		return
	}	
	// 1. get target = id do path
	let userUf = event.target.id
	console.log(userUf)
	// 2. para uf de mapaDados > id (que ta no json) = uf
	let siglaUf = dadosIbge.filter(function(linha){return linha.id == userUf})[0].sigla
	//console.log(siglaUf)
	let dadosCard = dadosTse.filter(function(linha){return (linha.sg_uf == siglaUf) && (linha.nr_turno == obterTurno())})
	// no futuro pegar o valor do botao para substituir acima
	console.log(dadosCard)
	// 3. agora pega a uf e coloca no hover
	preencheCard(dadosCard)
	// atualiza o valor do dropdown de acordo com hover
	dropdownUF.value = siglaUf
}

function preencheCard(dados){
	let dados_2018 = dados.filter(function(linha){return linha.ano_eleicao == 2018})
	let dados_2014 = dados.filter(function(linha){return linha.ano_eleicao == 2014})
	let dados_2010 = dados.filter(function(linha){return linha.ano_eleicao == 2010})
	let dados_2006 = dados.filter(function(linha){return linha.ano_eleicao == 2006})
	let dados_2002 = dados.filter(function(linha){return linha.ano_eleicao == 2002})
	console.log(dados_2018, dados_2018.candidato_1)


	document.querySelector('#text_box > div > .nm_uf').textContent = dados_2018[0].nm_uf
	document.querySelector('#text_box > .nm_uf_hover').textContent = dados_2014[0].nm_uf
	///// 2018
	// abertura
	document.querySelector('.uf > .sg_uf').textContent = dados_2018[0].sg_uf
	document.querySelector('#text_box > div > .nr_turno_str').textContent = dados_2018[0].nr_turno_str
	document.querySelector('#text_box > div > .regiao').textContent = dados_2018[0].regiao
	document.querySelector('.uf > .qtd_elei_2022_str').textContent = dados_2018[0].qtd_elei_2022_str
	document.querySelector('.uf > .perc_elei_2022_str').textContent = dados_2018[0].perc_elei_2022_str

	// pt
	document.querySelector('.eleicao_2018 > .pt > .perc_1').textContent = dados_2018[0].perc_1
	document.querySelector('.eleicao_2018 > .pt > .votos_1').textContent = dados_2018[0].votos_1

	// psl
	document.querySelector('.eleicao_2018 > .psl > .perc_2').textContent = dados_2018[0].perc_2
	document.querySelector('.eleicao_2018 > .psl > .votos_2').textContent = dados_2018[0].votos_2

	// diferença
	document.querySelector('.eleicao_2018 > .dif > ul > li > .diferenca_pp').textContent = dados_2018[0].diferenca_pp
	document.querySelector('.eleicao_2018 > .dif > ul > li > .diferenca_absoluta').textContent = dados_2018[0].diferenca_absoluta
	
	///// 2014
	// abertura
	document.querySelector('.uf > .sg_uf').textContent = dados_2014[0].sg_uf
	document.querySelector('.uf > .qtd_elei_2022_str').textContent = dados_2014[0].qtd_elei_2022_str
	document.querySelector('.uf > .perc_elei_2022_str').textContent = dados_2014[0].perc_elei_2022_str
	
	// pt
	document.querySelector('.eleicao_2014 > .pt > .perc_1').textContent = dados_2014[0].perc_1
	document.querySelector('.eleicao_2014 > .pt > .votos_1').textContent = dados_2014[0].votos_1

	// psdb
	document.querySelector('.eleicao_2014 > .psdb > .perc_2').textContent = dados_2014[0].perc_2
	document.querySelector('.eleicao_2014 > .psdb > .votos_2').textContent = dados_2014[0].votos_2

	// diferença
	document.querySelector('.eleicao_2014 > .dif > ul > li > .diferenca_pp').textContent = dados_2014[0].diferenca_pp
	document.querySelector('.eleicao_2014 > .dif > ul > li > .diferenca_absoluta').textContent = dados_2014[0].diferenca_absoluta
	
	///// 2010
	// abertura
	document.querySelector('.uf > .sg_uf').textContent = dados_2010[0].sg_uf
	document.querySelector('.uf > .qtd_elei_2022_str').textContent = dados_2010[0].qtd_elei_2022_str
	document.querySelector('.uf > .perc_elei_2022_str').textContent = dados_2010[0].perc_elei_2022_str
	
	// pt
	document.querySelector('.eleicao_2010 > .pt > .perc_1').textContent = dados_2010[0].perc_1
	document.querySelector('.eleicao_2010 > .pt > .votos_1').textContent = dados_2010[0].votos_1

	// psdb
	document.querySelector('.eleicao_2010 > .psdb > .perc_2').textContent = dados_2010[0].perc_2
	document.querySelector('.eleicao_2010 > .psdb > .votos_2').textContent = dados_2010[0].votos_2

	// diferença
	document.querySelector('.eleicao_2010 > .dif > ul > li > .diferenca_pp').textContent = dados_2010[0].diferenca_pp
	document.querySelector('.eleicao_2010 > .dif > ul > li > .diferenca_absoluta').textContent = dados_2010[0].diferenca_absoluta
	
	///// 2006
	// abertura
	document.querySelector('.uf > .sg_uf').textContent = dados_2006[0].sg_uf
	document.querySelector('.uf > .qtd_elei_2022_str').textContent = dados_2006[0].qtd_elei_2022_str
	document.querySelector('.uf > .perc_elei_2022_str').textContent = dados_2006[0].perc_elei_2022_str
	
	// pt
	document.querySelector('.eleicao_2006 > .pt > .perc_1').textContent = dados_2006[0].perc_1
	document.querySelector('.eleicao_2006 > .pt > .votos_1').textContent = dados_2006[0].votos_1

	// psdb
	document.querySelector('.eleicao_2006 > .psdb > .perc_2').textContent = dados_2006[0].perc_2
	document.querySelector('.eleicao_2006 > .psdb > .votos_2').textContent = dados_2006[0].votos_2

	// diferença
	document.querySelector('.eleicao_2006 > .dif > ul > li > .diferenca_pp').textContent = dados_2006[0].diferenca_pp
	document.querySelector('.eleicao_2006 > .dif > ul > li > .diferenca_absoluta').textContent = dados_2006[0].diferenca_absoluta
	
	///// 2002
	// abertura
	document.querySelector('.uf > .sg_uf').textContent = dados_2002[0].sg_uf
	document.querySelector('.uf > .qtd_elei_2022_str').textContent = dados_2002[0].qtd_elei_2022_str
	document.querySelector('.uf > .perc_elei_2022_str').textContent = dados_2002[0].perc_elei_2022_str
	
	// pt
	document.querySelector('.eleicao_2002 > .pt > .perc_1').textContent = dados_2002[0].perc_1
	document.querySelector('.eleicao_2002 > .pt > .votos_1').textContent = dados_2002[0].votos_1

	// psdb
	document.querySelector('.eleicao_2002 > .psdb > .perc_2').textContent = dados_2002[0].perc_2
	document.querySelector('.eleicao_2002 > .psdb > .votos_2').textContent = dados_2002[0].votos_2

	// diferença
	document.querySelector('.eleicao_2002 > .dif > ul > li > .diferenca_pp').textContent = dados_2002[0].diferenca_pp
	document.querySelector('.eleicao_2002 > .dif > ul > li > .diferenca_absoluta').textContent = dados_2002[0].diferenca_absoluta

}

