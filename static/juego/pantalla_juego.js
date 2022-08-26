// -------------- FUNCIONES DE FILTRADO ---------------------
function filtrarRespuestas(nivel) {
  let respuestasFiltradas = [];

  let ids_de_preguntas = nivel.map(i => i.id_pregunta);

  for(let k=0 ; k<ids_de_preguntas.length ; k++){
    let preguntasPorID = respuestas.filter(i => i.id_pregunta == ids_de_preguntas[k]);
    respuestasFiltradas.push(preguntasPorID);
  }
  return respuestasFiltradas

}

function filtrarPorRtaCorrecta(listaRtas) {
  let correcta;
  for(let i=0 ; i<listaRtas.length ; i++){
    correcta = listaRtas.filter(i => i.es_correcta == '0')[0].id_respuesta;
  }
  return correcta
}
// ----------------------------------------------------------

// -------------- DECLARACION DE VARIABLES ------------------
let divDialogo = document.getElementById('dialogo');
let divForm = document.getElementById('form');
let divTeoria = document.getElementById('teoria');
let divBotones = document.getElementById('navegacion');
let divPuntaje = document.getElementById('puntaje');
let divAlerts = document.getElementById('alerts');
let divFinal = document.getElementById('final');
let divJuego = document.getElementById('container');

let puntajeGeneral = 0;
let puntajeBonus = 0;

var indexNivel = 0;
var indexPag = 0;
// ----------------------------------------------------------

// -------------- FUNCIONES DE MOSTRAR ----------------------
async function mostrarCuestionario(){  
    let arrayPreguntas = indexNivel == 0 ? preguntas1 : 
                         indexNivel == 1 ? preguntas2[0] :
                         indexNivel == 2 ? preguntas2[1] :
                         indexNivel == 3 ? preguntas2[2] : 
                         preguntasBonus;

    let arrayRespuestas = filtrarRespuestas(arrayPreguntas);

    let puntos = indexNivel == 0 ? 3 : indexNivel == 5 ? 5 : 4;

    esconder(divTeoria)
    mostrar(divForm)

    for(let i=0; i<3 ; i++){
        let form = "";
    
        form += `<p id="pregunta" class="rounded-3 p-2 fs-3 text-center fw-bold">${arrayPreguntas[i].pregunta}</p>`
    
        for(let z=0 ; z<arrayRespuestas[i].length ; z++){

            if(arrayRespuestas[i][z].es_correcta == 0){
                form += `
                <div class="rta rounded-3 p-3 ps-5" data-correcto="correcto">
                <input class="form-check-input" type="radio" name="respuesta" id="rta${z+1}" data-id="${arrayRespuestas[i][z].id_respuesta}">
                <label class="form-check-label" for="rta${z+1}"> ${arrayRespuestas[i][z].respuesta} </label><br>
                </div>`;
            }else{
                form += `
                <div class="rta rounded-3 p-3 ps-5" data-correcto="incorrecto">
                <input class="form-check-input" type="radio" name="respuesta" id="rta${z+1}" data-id="${arrayRespuestas[i][z].id_respuesta}">
                <label class="form-check-label" for="rta${z+1}"> ${arrayRespuestas[i][z].respuesta} </label><br>
                </div>`;
            }
        } 
        form += `<input id="enviar" class="btn m-0" value="Chequear Respuesta" readonly>`;

        divForm.innerHTML = form;
        
        await formEnviado();
        
        let rtaSeleccionada = (Array.from(document.getElementsByName('respuesta'))).filter(i => i.checked)[0].dataset.id;
        let correcto = filtrarPorRtaCorrecta(arrayRespuestas[i]);

        if(correcto == rtaSeleccionada){
            divAlerts.innerHTML = `
            <div id="alert-rta${i}" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header text-light" style="background-color:#328C38">
                    <img src="../static/imagenes/alerts/correcto.png" class="rounded me-2" alt="..." style="height:30px;">
                    <strong class="me-auto">Bien ahi!!</strong>
                </div>
                <div class="toast-body">
                    Felicitaciones! La respuesta a la pregunta ${i+1} es correcta
                </div>
            </div>`
            
            let msj = new bootstrap.Toast(document.getElementById(`alert-rta${i}`))
            if(indexNivel == 5){
                puntajeBonus += puntos
            }else{
                puntajeGeneral += puntos 
            }
            divPuntaje.innerHTML = `✦ Tu puntaje: ${puntajeGeneral} ✦`
            msj.show()
        }else{
            divAlerts.innerHTML = `
            <div id="alert-rta${i}" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header text-light" style="background-color:#C93636">
                    <img src="../static/imagenes/alerts/incorrecto.png" class="rounded me-2" alt="..." style="height:30px;">
                    <strong class="me-auto">Nooo :(</strong>
                </div>
                <div class="toast-body">
                    Esa no es la respuesta correcta a la pregunta ${i+1}! Mejor suerte la próxima <3
                </div>
            </div>`
            
            let msj = new bootstrap.Toast(document.getElementById(`alert-rta${i}`))
            msj.show()
        }        
    }

    switch (indexNivel){
        case 1:
            nivelTerminado()
            nivelODS4A();
            break;
        case 2:
            nivelTerminado()
            nivelODS10();
            break;
        case 3:
            nivelTerminado()
            nivelODS15();
            break;
        case 4:
            nivelTerminado()
            nivelBonusA();
            indexNivel++
            break;
        case 5:
            mostrarFinal();
            puntajeGeneral += puntajeBonus
            break;
    }

}
function formEnviado() {
    let botonEnviar = document.getElementById('enviar')
    return new Promise(acc => {
        function recibirEnvio() {
            let rtaSeleccionada = (Array.from(document.getElementsByName('respuesta'))).filter(i => i.checked)
            // Hay algo seleccionado?
            if(rtaSeleccionada.length == 1){
                botonEnviar.removeEventListener('click', recibirEnvio);
                acc();
            }else{
                divAlerts.innerHTML = `
<div id="alert-noRta" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true" >
                <div class="toast-header text-light" style="background-color: #CFA025">
                    <img src="../static/imagenes/alerts/noRta.png" class="rounded me-2" alt="..." style="height:30px;">
                    <strong class="me-auto">OJOOO</strong>
                </div>
                <div class="toast-body">
                    No seleccionaste ninguna respuesta! Elegi una y volvé a chequear la respuesta
                </div>
            </div>
                `
                let msj = new bootstrap.Toast(document.getElementById('alert-noRta'))
                msj.show()
            }

    }
    botonEnviar.addEventListener('click', recibirEnvio);
    });
}

function mostrarTeoria(){
    
    let array = teoria[indexNivel].slice(indexPag, indexPag+2);
    let txt = "";

    txt += `
    <p id="titulo" class="p-2 text-start fs-3 lh-base mt-auto mb-0">${array[0][0]}</p>
    <p id="parrafo" class="p-2 text-start fs-6 lh-base mt-auto mb-0">${array[0][1]}</p>

     <p id="titulo" class="p-2 text-start fs-3 lh-base mt-auto mb-0">${array[1][0]}</p>
    <p id="parrafo" class="p-2 text-start fs-6 lh-base mt-auto mb-0">${array[1][1]}</p>
    `;
    
    divTeoria.innerHTML = txt;
    
}

function dialogoGuia(textoDialogo) {
    let texto = `
    <div class="p-0 m-0 row g-0">
        <div class="col-1 d-flex align-items-end justify-content-end mb-3">
            <img src="../static/imagenes/dialogo.png" style="background-size: cover; width: 50%; background-position: bottom right; opacity: 0.3;">
        </div>
        <div class="col-11 p-3 rounded-top rounded-end mb-3 text-start" style="background-color:hsla(104, 59%, 43%, 0.3);">
            <p class="mb-0 rana" style="font-size:21px;"> ${textoDialogo} </p>
        </div>
    </div>`;

    document.getElementById('dialogo').innerHTML += texto;
}
function dialogoUser(textoDialogo){
    let texto = `
    <div class="p-0 m-0 row g-0">
        <div class="col-11 p-3 px-4 rounded-top rounded-start mb-3 text-end"  style="background-color:hsla(104, 59%, 43%, 0.7);">
            ${textoDialogo}
        </div>
        <div class="col-1 d-flex align-items-end justify-content-start mb-3">
            <img src="../static/imagenes/dialogo.png" style="background-size: cover; width: 50%; background-position: bottom right; opacity:0.7;transform:scaleX(-1);">
        </div>
    </div>`;

    document.getElementById('dialogo').innerHTML += texto;
}
// ----------------------------------------------------------


// -------------- FUNCIONES BASICAS -------------------
function mostrar(div){
    div.style.display = 'block'
}
function esconder(div){
    div.style.display = 'none'
}
function nivelTerminado(){
    document.getElementById('mapa').innerHTML += `
    <img id="marcador${indexNivel}" src="../static/imagenes/marcador.png" class="terminado">
    `
}

function scrollAbajo(){
    document.getElementById('info').scrollTo(0,document.getElementById('info').scrollHeight)
}
// ----------------------------------------------------

// ------------------ NAVEGACION ---------------------
const botonAnt = document.querySelector("#anterior");
const botonSig = document.querySelector("#siguiente");

function pagSiguiente() {
    indexPag+=2
    
    if (indexPag >= 0 && indexPag < teoria[indexNivel].length-1) {  
        mostrarTeoria()
        botonAnt.disabled = false;
    } else {
        indexPag = 0
        botonAnt.disabled = true;
        botonSig.disabled = true
        mostrarCuestionario();
        indexNivel+=1
    }
}

function pagAnterior() {
    if (indexPag <= teoria[indexNivel].length-1 && indexPag > 0) {
        indexPag-=2
        mostrarTeoria()
        botonSig.disabled = false
        
        indexPag == 0 && (botonAnt.disabled = true)
    } else {
        botonAnt.disabled = true
        mostrarTeoria()
    }
}
// ----------------------------------------------------

// --------------- ORDEN DE EJECUCION -----------------------

function introduccion() {
    // ------- DECLARACION DE VARIABLES
    let dialogo1 = `${dialogo.inicio.hola[0]} <b><i>${datos.nombre}</i></b> ${dialogo.inicio.hola[1]}`;
    let dialogo2 = `${dialogo.inicio.intro}`;
    let dialogo3 = `${dialogo.inicio.instrucciones}`
    let dialogo4 = `<button class="rana btn btn-success col-12 fs-4" id="botonComenzar" onclick="nivelAgendaA()">¡Estoy preparadx!</button>`
    // ---------------------------------

    // ---------- SECUENCIA DE FUNCIONES
    /*1*/dialogoGuia(dialogo1);
    /*2*/setTimeout(function() {dialogoGuia(dialogo2)}, 1000);
    /*3*/setTimeout(function() {dialogoGuia(dialogo3)}, 2000);
    /*4*/setTimeout(function() {scrollAbajo()},2000);
    /*5*/setTimeout(function() {dialogoUser(dialogo4)}, 3000);
    /*6A*/setTimeout(function() {scrollAbajo()},3000);
    // ---------------------------------

}

function nivelAgendaA(){    
    // ------- DECLARACION DE VARIABLES
    let dialogo5 = `${dialogo.inicio.comenzar}`;
    let dialogo6 = `${dialogo.nivel1.inicio}`;
    let dialogo7 = `<button class="rana btn btn-success col-12 fs-4" id="botonComenzar" onclick="nivelAgendaB()">Entiendo! Empecemos</button>`
    // ---------------------------------
    
    // ---------- SECUENCIA DE FUNCIONES
    /*7*/document.getElementById('botonComenzar').disabled = true;
    /*8*/dialogoGuia(dialogo5);
    /*9*/scrollAbajo();
    /*10*/setTimeout(function() {divDialogo.innerHTML = ""},2000);
    /*11*/setTimeout(function() {dialogoGuia(dialogo6)}, 2000);
    /*12*/setTimeout(function() {dialogoUser(dialogo7)}, 4000);
    
    // ---------------------------------
}

function nivelAgendaB(){
    // ---------- SECUENCIA DE FUNCIONES  
    /*13*/document.getElementById('botonComenzar').disabled = true;
    /*14*/esconder(divDialogo);
    /*15*/mostrar(divTeoria);
    /*16*/divBotones.style.display = 'block';
    /*17*/botonAnt.disabled = true;
    /*18*/mostrarTeoria()
    // ---------------------------------
}

function nivelODS4A(){
    // ------- DECLARACION DE VARIABLES
    let dialogo8 = `${dialogo.nivel1.final}`;
    let dialogo9 = `${dialogo.nivel2.inicio}`;
    let dialogo10 = `<button class="rana btn btn-success col-12 fs-4" id="botonComenzar" onclick="nivelODS4B()">Cuantos ODS! Vamos allá</button>`
    // ---------------------------------    

    // ---------- SECUENCIA DE FUNCIONES    
    /*19*/esconder(divTeoria)
    /*20*/esconder(divForm)
    /*21*/divDialogo.innerHTML = "";
    /*22*/mostrar(divDialogo);
    /*23*/dialogoGuia(dialogo8);
    /*24*/setTimeout(function() {dialogoGuia(dialogo9);}, 2000);
    /*25*/setTimeout(function() {dialogoUser(dialogo10);}, 6000);
    // ---------------------------------
    
}    

function nivelODS4B(){    
    
    let caratula = document.getElementById('ods4');
    // ---------- SECUENCIA DE FUNCIONES
    /*26*/document.getElementById('botonComenzar').disabled = true;
    /*27*/esconder(divDialogo);
    /*28*/mostrar(caratula);
    /*29*/setTimeout(function(){
            esconder(caratula)
            mostrar(divTeoria)
            botonSig.disabled = false;
            mostrarTeoria();},4000)
    // ---------------------------------
}


function nivelODS10() {
    // ------- DECLARACION DE VARIABLES    
    let caratula = document.getElementById('ods10');
    // ---------------------------------    
    
    // ---------- SECUENCIA DE FUNCIONES    
    /*19*/esconder(divForm);
    /*20*/mostrar(caratula);
    /*21*/setTimeout(function(){
        esconder(caratula);
        mostrar(divTeoria);
        botonSig.disabled = false;
        mostrarTeoria();},4000) 
    // ---------------------------------
}

function nivelODS15(){
    // ------- DECLARACION DE VARIABLES
    let caratula = document.getElementById('ods15');
    // ---------------------------------    
    
    // ---------- SECUENCIA DE FUNCIONES    
    /*22*/esconder(divForm);
    /*23*/mostrar(caratula);
    /*24*/setTimeout(function(){
        esconder(caratula);
        mostrar(divTeoria);
        botonSig.disabled = false;
        mostrarTeoria();},4000) 
    // ---------------------------------
}

function nivelBonusA(){
    // ------- DECLARACION DE VARIABLES
    let dialogo11 = `${dialogo.nivel2.final}`
    let dialogo12 = `${dialogo.nivelbonus}`
    let dialogo13 = `<button class="rana btn btn-success col-12 fs-4" id="botonComenzar" onclick="nivelBonusB()">Ya estoy cerca de salir del bosque! A ver tus preguntas</button>`
    // ---------------------------------    

    // ---------- SECUENCIA DE FUNCIONES    
    /*25*/esconder(divForm);
    /*26*/esconder(divTeoria);
    /*27*/divDialogo.innerHTML = "";
    /*28*/mostrar(divDialogo);
    /*29*/dialogoGuia(dialogo11);
    /*30*/setTimeout(function() {dialogoGuia(dialogo12);}, 2000);
    /*31*/setTimeout(function() {dialogoUser(dialogo13);}, 5000);
    

    // ---------------------------------
}

function nivelBonusB(){
    /*26*/document.getElementById('botonComenzar').disabled = true;
    esconder(divDialogo);
    mostrar(divForm);
    mostrarCuestionario()
 
}

function mostrarFinal(){
  //------DECLARACION DE VARIABLES----------------------
    let divTexto = document.getElementById('texto');
    let divRanking = document.getElementById('ranking');

    let puntajeFinal = puntajeGeneral + puntajeBonus;
    
    let dialogoAlto =`${dialogo.finDeJuego.puntajeAlto}`;
    let dialogoBajo =`${dialogo.finDeJuego.puntajeBajo}`;
    
    let ranking =`
        <form method="POST" id="formPuntos" name="formPuntos" action="/ingresarPuntaje" target="dummyframe" class="rounded-3 d-flex flex-column justify-content-evenly rana mb-3">
            <div class="row justify-content-center">
                <div class="col-3 divPuntaje rounded-3 py-3 me-2">
                    <p class="p-0 fs-4 lh-1 rana text-center mb-0"> ✦Tu puntaje✦ </p>
                    <input class="p-0 fs-2 lh-1 inputPuntos" type="number" name="puntajeGeneral" value="${puntajeGeneral}" readonly>
                </div>
                <div class="col-4 divPuntaje rounded-3 py-3 p-0 me-2 ">
                    <p class="p-0 fs-4 lh-1 rana text-center mb-0"> ✦Puntaje Bonus✦</p>
                    <input class="p-0 fs-2 lh-1 inputPuntos" type="number" name="puntajeBonus" value="${puntajeBonus}" readonly>
                </div>
                <div class="col-4 divPuntaje rounded-3 py-3 ">
                    <p class="p-0 fs-4 lh-1 rana text-center mb-0"> ✦¡Puntaje Final!✦ </p>
                    <input class="p-0 fs-2 lh-1 inputPuntos" type ="number" name="puntajeFinal" value="${puntajeFinal}" readonly>
                </div>
            </div>
        </form>`;
    
    let despedida = (puntajeFinal>=37) ? 
        `<p class="rounded-3 p-2 px-4 mb-0 text-start lh-base text-center" style="color: #ffff; font-size: 3vh;">
        ${dialogo.finDeJuego.puntajeAlto}</p>` :
        `<p class="rounded-3 p-2 px-4 mb-0 text-start lh-base text-center" style="color: #ffff; font-size: 3vh;">
        ${dialogo.finDeJuego.puntajeBajo}</p>`;
    // ----------------------------------------------------
    
    /*32*/esconder(divJuego)
    /*33*/mostrar(divFinal)
    /*34*/divRanking.innerHTML += `${ranking} ${despedida}`;
    /*35*/document.forms['formPuntos'].submit()

};
function mostrarRanking(){
    let alertBody=document.getElementById('alertBody');
    let alert = new bootstrap.Modal(document.getElementById('alert'))
    $(".modal-backdrop").remove();

    let index = topUsuario.findIndex(i => i.nombre == datos.nombre)
    let nuevoRecord = {'nombre':datos.nombre, 'puntos':puntajeGeneral}

    if(index !== -1){
        if(topUsuario[index].puntos < puntajeGeneral){
            topUsuario.splice(index,1,nuevoRecord)
        }
    }else if(puntajeGeneral !== 0){
        topUsuario.push(nuevoRecord)
    }
    
    
    topUsuario.sort((a, b) => b.puntos-a.puntos);

    if(alertBody.innerHTML === ""){
      for(let i=0 ; i<10 ; i++){
        if(i<topUsuario.length){
            alertBody.innerHTML += `
                <li class="list-group-item list-group-item-action d-flex justify-content-around text-center w-75" style="background-color:hsla(0, 0%, 100%,0.8)">
                    <p class="p-0 m-0 rana" style="font-size:3vh;">${topUsuario[i].nombre}</p>
                    <p class="p-0 m-0 rana" style="font-size:3vh;">${topUsuario[i].puntos}</p>
                </li>
            `
        }else{
            alertBody.innerHTML += `
                <li class="list-group-item list-group-item-action d-flex justify-content-around text-center w-75" style="background-color:hsla(0, 0%, 100%,0.8)">
                    <p class="p-0 m-0 rana" style="font-size:3vh;">-</p>
                    <p class="p-0 m-0 rana" style="font-size:3vh;">-</p>
                </li>
            `
        }
       
        
     };
    
  };
      alert.show()

};

// ----------------------------------------------------------

window.onload = function(){
    datos.esAdmin == false && (document.getElementById('admin').disabled = true);
    introduccion()
}
