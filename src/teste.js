
var obj = {
  name:  'paloma',
  idade: 23,
  endereco: {
    rua: 'rua cananeia',
    numero: 552
  }
}

var retorno = obj?.endereco?.logadouro;

console.log(retorno);

