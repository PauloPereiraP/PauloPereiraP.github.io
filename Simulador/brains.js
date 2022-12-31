var inputVlrInicial = document.getElementById('vlrInicial');
var inputLucroEsperado = document.getElementById('lucroEsperado');
var inputVlrFinal = document.getElementById('vlrFinal');
var btnNewLine = document.getElementById('addMore');
var tbodyApostas = document.getElementById('corpoApostas');
var templateApostas = document.getElementById('apostaRow');
var vlrDosAportes = [0.25, 0.01];

inputLucroEsperado.addEventListener('keyup', function (e) {
	var valor = parseInt(inputVlrInicial.value)
	var lucro = parseInt(e.target.value);

	if (valor > 0 && lucro > 0) {
		inputVlrFinal.value = valor + (valor * (lucro / 100));
	}
});

inputVlrInicial.addEventListener('keyup', function (e) {
	var lucro = parseInt(inputLucroEsperado.value)
	var valor = parseInt(e.target.value);

	if (valor > 0 && lucro > 0) {
		inputVlrFinal.value = valor + (valor * (lucro / 100));
	}

	vlrDosAportes = [];

	if (isNaN(valor)) {
		vlrDosAportes = [0.25, 0.01];
		return;
	}

	var menorAporte = 0.01 * (parseInt(valor / 100.0) * 10.0);
	vlrDosAportes.push(valor / 100);
	vlrDosAportes.push(menorAporte == 0 ? 0.01 : menorAporte);
});

btnNewLine.addEventListener('click', AddNewLine);

function AddNewLine() {
	var newRow = templateApostas.content.cloneNode(true);

	Calculate(newRow);
	CalculateLucro(newRow);
	AjustValues(newRow);
	DeleteRow(newRow);

	tbodyApostas.appendChild(newRow);
}

function DeleteRow(row) {
	var btnDeleteRow = row.getElementById('delete');
	btnDeleteRow.addEventListener('click', function (e) {
		var tRow = e.target.closest('tr');
		tRow.remove();
	});
}

function AjustValues(row) {
	var btnCalculate = row.getElementById('calculate');
	btnCalculate.addEventListener('click', function (e) {
		var tRow = e.target.closest('tr');
		const LUCRO_DESEJADO = 1000;
		var vlrLucroAtual = 0.0;

		for (let i = 0, length = vlrDosAportes.length, lucroRepetido = 0, lucroIgual = 0; i < length && vlrLucroAtual >= 0; ++i) {
			var vlrLucroAnterior = 0.0;
			let lucros = [];

			do {
				CalcularGanhos(tRow);
				CalcularLucro(tRow);

				var lucro = tRow.querySelector('#lucro');
				var vlrLucroCalculado = parseFloat(lucro.value);

				if (isNaN(vlrLucroAtual) || isNaN(vlrLucroCalculado))
					return;

				if (vlrLucroAnterior == vlrLucroCalculado && (lucroRepetido > 1 || lucroIgual > 1))
					break;

				lucros.push(vlrLucroCalculado);

				vlrLucroAnterior = vlrLucroAtual;
				vlrLucroAtual = vlrLucroCalculado;

				var aprt1 = tRow.querySelector('#aporte1');
				var aprt2 = tRow.querySelector('#aporte2');
				var vlrAporte1 = parseFloat(aprt1.value);
				var vlrAporte2 = parseFloat(aprt2.value);

				var ganho1 = tRow.querySelector('#ganho1');
				var ganho2 = tRow.querySelector('#ganho2');
				var vlrGanho1 = parseFloat(ganho1.value);
				var vlrGanho2 = parseFloat(ganho2.value);

				if (vlrGanho1 > vlrGanho2) {
					vlrAporte1 -= vlrDosAportes[i];
					vlrAporte2 += vlrDosAportes[i];
				} else {
					vlrAporte1 += vlrDosAportes[i];
					vlrAporte2 -= vlrDosAportes[i];
				}

				aprt1.value = vlrAporte1.toFixed(2);
				aprt2.value = vlrAporte2.toFixed(2);

				if (vlrAporte1 < 0 || vlrAporte2 < 0)
					break;

				if (vlrLucroAtual < vlrLucroAnterior) {
					if (lucros.some((l) => l == vlrLucroAtual)) {
						++lucroRepetido;
					}
					//else {
					//	CalcularGanhos(tRow);
					//	CalcularLucro(tRow);
					//	break;
					//}
				} else {
					if (vlrLucroAtual == vlrLucroAnterior)
						++lucroIgual;
				}

			} while (vlrLucroAtual < LUCRO_DESEJADO);

			console.table(lucros);
		}
	});
}

function Calculate(row) {
	var aprt1 = row.getElementById('aporte1');
	var aprt2 = row.getElementById('aporte2');
	var mult1 = row.getElementById('multiplicador1');
	var mult2 = row.getElementById('multiplicador2');

	aprt1.addEventListener('keyup', CalculateInternal);
	aprt2.addEventListener('keyup', CalculateInternal);
	mult1.addEventListener('keyup', CalculateInternal);
	mult2.addEventListener('keyup', CalculateInternal);
}

function CalculateLucro(row) {
	var ganh1 = row.getElementById('ganho1');
	var ganh2 = row.getElementById('ganho2');

	ganh1.addEventListener('change', function (e) {
		var tRow = e.target.closest('tr');
		CalcularLucro(tRow);
	});

	ganh2.addEventListener('change', function (e) {
		var tRow = e.target.closest('tr');
		CalcularLucro(tRow);
	});
}

function CalculateInternal(e) {
	var tRow = e.target.closest('tr');
	CalcularGanhos(tRow);

	//Muda o valor do input Aporte oposto de acordo com o valor dentro do input Valor Inicial
	var aprt1 = tRow.querySelector('#aporte1');
	var aprt2 = tRow.querySelector('#aporte2');

	var vlrAporte1 = parseFloat(aprt1.value);
	var vlrAporte2 = parseFloat(aprt2.value);
	var vlrInicial = parseFloat(inputVlrInicial.value);

	if (isNaN(vlrInicial))
		return;

	if (isNaN(vlrAporte1))
		vlrAporte1 = 0;

	if (isNaN(vlrAporte2))
		vlrAporte2 = 0;

	if (e.target['id'] == 'aporte1')
		aprt2.value = (vlrInicial - vlrAporte1).toFixed(2);
	else
		aprt1.value = (vlrInicial - vlrAporte2).toFixed(2);

	//Dispara o evento para calcular o lucro
	var ganh1 = tRow.querySelector('#ganho1');
	var event = new Event('change');
	ganh1.dispatchEvent(event);

	var ganh2 = tRow.querySelector('#ganho2');
	ganh2.dispatchEvent(event);
}

function CalcularGanhos(row) {
	var aprt1 = row.querySelector('#aporte1');
	var aprt2 = row.querySelector('#aporte2');
	var mult1 = row.querySelector('#multiplicador1');
	var mult2 = row.querySelector('#multiplicador2');
	var ganh1 = row.querySelector('#ganho1');
	var ganh2 = row.querySelector('#ganho2');
	var gasto = row.querySelector('#gasto');

	var vlrAporte1 = parseFloat(aprt1.value);
	var vlrMultiplicador1 = parseFloat(mult1.value);

	var vlrAporte2 = parseFloat(aprt2.value);
	var vlrMultiplicador2 = parseFloat(mult2.value);

	if (isNaN(vlrAporte1) || isNaN(vlrMultiplicador1))
		return;

	ganh1.value = (vlrAporte1 * vlrMultiplicador1).toFixed(2);


	if (isNaN(vlrAporte2) || isNaN(vlrMultiplicador2))
		return;

	ganh2.value = (vlrAporte2 * vlrMultiplicador2).toFixed(2);
	gasto.value = (vlrAporte1 + vlrAporte2).toFixed(2);
}

function CalcularLucro(row) {
	var inputGanho1 = row.querySelector('#ganho1');
	var inputGanho2 = row.querySelector('#ganho2');
	var investido = row.querySelector('#gasto');
	var lucro = row.querySelector('#lucro');

	var ganho1 = parseFloat(inputGanho1.value);
	var ganho2 = parseFloat(inputGanho2.value);
	var vlrInvestido = parseFloat(investido.value);
	var vlrLucroAtual = 0.0;

	if (isNaN(ganho1) || isNaN(ganho2) || isNaN(vlrInvestido))
		return;

	if (ganho1 <= ganho2) {
		vlrLucroAtual = ganho1 - vlrInvestido;
	} else {
		vlrLucroAtual = ganho2 - vlrInvestido;
	}

	lucro.value = vlrLucroAtual.toFixed(2);
}
