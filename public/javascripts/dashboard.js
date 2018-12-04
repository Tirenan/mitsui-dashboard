var socket = io.connect('http://localhost:4000');
socket.on('connect', function () {
    // alert("conectado")
    contador();
})

socket.on('disconnect', function () {
    alert('conexão perdida')
})

function getdataline() {
    socket.emit('dashboard', {
    })
};

function pushdataline() {
    //Front-end Writting
    socket.on('dashboard', function (data) {
        var esperas = data.tempoFront.tempo.toString().split('.');
        var tempoMA = data.tma.tempo.toString().split('.');
        abandono.innerHTML = data.abandonoFront.total;
        recebidas.innerHTML = data.recebidasFront.total;
        efetuadas.innerHTML = data.efetuadasFront.total;
        espera.innerHTML = esperas[0];
        tma.innerHTML = tempoMA[0];
    });
};

var contador = function () {

    var time = 0;
    timer = setInterval(function () {
        time += 1;
        if (time < 2) {

        }
        else {
            clearInterval(timer);
            contador();
            getdataline();
            pushdataline();
        }
    }, 1000);
}