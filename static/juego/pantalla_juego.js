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

    let puntos = indexNivel == 0 ? 3 : indexNivel == 4 ? 5 : 4;

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
                    <img src="../static/imagenes/correcto.png" class="rounded me-2" alt="..." style="height:30px;">
                    <strong class="me-auto">Bien ahi!!</strong>
                </div>
                <div class="toast-body">
                    Felicitaciones! La respuesta a la pregunta ${i+1} es correcta
                </div>
            </div>`
            
            let msj = new bootstrap.Toast(document.getElementById(`alert-rta${i}`))
            puntajeGeneral += puntos
            divPuntaje.innerHTML = `✦ Tu puntaje: ${puntajeGeneral} ✦`
            msj.show()
        }else{
            divAlerts.innerHTML = `
            <div id="alert-rta${i}" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header text-light" style="background-color:#C93636">
                    <img src="../static/imagenes/incorrecto.png" class="rounded me-2" alt="..." style="height:30px;">
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
            nivelODS4();
            break;
        case 2:
            nivelODS10();
            break;
        case 3:
            nivelODS15();
            break;
        case 4:
            nivelBonus();
            indexNivel++
            break;
        case 5:
            mostrarFinal();
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
    let dialogo4 = `<button class="rana btn btn-success col-12 fs-4" id="botonComenzar" onclick="nivelAgenda()">¡Estoy preparadx!</button>`
    // ---------------------------------

    // ---------- SECUENCIA DE FUNCIONES
    /*1*/dialogoGuia(dialogo1);
    /*2*/setTimeout(function() {dialogoGuia(dialogo2)}, 1000);        
    /*3*/setTimeout(function() {dialogoGuia(dialogo3)}, 2000);
    /*4*/setTimeout(function() {scrollAbajo()},2000);
    /*5*/setTimeout(function() {dialogoUser(dialogo4)}, 3000);
    /*6*/setTimeout(function() {scrollAbajo()},3000);
    // ---------------------------------

}

function nivelAgenda(){    
    // ------- DECLARACION DE VARIABLES
    let dialogo5 = `${dialogo.inicio.comenzar}`;
    let dialogo6 = `${dialogo.nivel1.inicio}`;
    // ---------------------------------
    
    // ---------- SECUENCIA DE FUNCIONES    
    /*7*/dialogoGuia(dialogo5);
    /*8*/scrollAbajo();
    /*9*/setTimeout(function() {divDialogo.innerHTML = ""},2000);
    /*10*/setTimeout(function() {dialogoGuia(dialogo6)}, 2000);
    /*11*/setTimeout(function() {
            esconder(divDialogo);
            mostrar(divTeoria);
            divBotones.style.display = 'block';
            botonAnt.disabled = true;
            mostrarTeoria()
    }, 8000);
    // ---------------------------------
}

function nivelODS4(){
    // ------- DECLARACION DE VARIABLES
    let dialogo7 = `${dialogo.nivel1.final}`
    let dialogo8 = `${dialogo.nivel2.inicio}`
    // ---------------------------------    

    // ---------- SECUENCIA DE FUNCIONES    
    /*14*/esconder(divTeoria)
    /*15*/esconder(divForm)
    /*16*/divDialogo.innerHTML = "";
    /*17*/mostrar(divDialogo);
    /*18*/dialogoGuia(dialogo7);
    /*19*/setTimeout(function() {dialogoGuia(dialogo8);}, 2000);
    /*20*/setTimeout(function() {
        esconder(divDialogo);
        mostrar(divTeoria);
        botonSig.disabled = false;
        mostrarTeoria();
    }, 7000);
    // ---------------------------------
    
}    

function nivelODS10() {
    // ---------- SECUENCIA DE FUNCIONES    
    /*23*/esconder(divForm);
    /*24*/mostrar(divTeoria);
    botonSig.disabled = false;
    /*25*/mostrarTeoria();
    // ---------------------------------
}

function nivelODS15(){
    // ---------- SECUENCIA DE FUNCIONES    
    /*26*/esconder(divForm);
    /*27*/mostrar(divTeoria);
    botonSig.disabled = false;
    /*28*/mostrarTeoria();
    // ---------------------------------
}

function nivelBonus(){
    // ------- DECLARACION DE VARIABLES
    let dialogo9 = `${dialogo.nivel2.final}`
    let dialogo10 = `${dialogo.nivelbonus}`
    // ---------------------------------    

    // ---------- SECUENCIA DE FUNCIONES    
    /*14*/esconder(divForm);
    /*15*/esconder(divTeoria);
    /*16*/divDialogo.innerHTML = "";
    /*17*/mostrar(divDialogo);
    /*18*/dialogoGuia(dialogo9);
    /*19*/setTimeout(function() {dialogoGuia(dialogo10);}, 2000);
    /*20*/setTimeout(function() {
        esconder(divDialogo);
        mostrar(divForm);
        mostrarCuestionario()
    }, 7000);

    // ---------------------------------
}

function mostrarFinal(puntaje,puntajeBonus){
  //------DECLARACION DE VARIABLES----------------------
  let divFinal=document.getElementById('final');
  let divDialogo = document.getElementById('dialogo');
  let divInfo=document.getElementById('info');
  let divMain=document.getElementById('main');
  let divMapa=document.getElementById('mapa');
  let divBg=document.getElementById('bg');
  let puntajeFinal= puntaje+puntajeBonus;
  let cierre= "";
  let ranking="";
  let despedida="";
  let dialogoCierre=`${dialogo.finDeJuego.intro}`;
  let dialogoAlto=`${dialogo.finDeJuego.puntajeAlto}`;
  let dialogoBajo=`${dialogo.finDeJuego.puntajeBajo}`;
  // ----------------------------------------------------
  divFinal.style.display = 'block';
  divBg.style.display = 'block';
  divDialogo.style.display= 'none';
  divInfo.style.display= 'none';
  divMain.style.display= 'none';
  divMapa.style.display= 'none';
  cierre+=`<h3 id="cierre" class="p-2 text-start fs-4 lh-base mt-auto mb-0 text-center text-wrap">${dialogoCierre}</h3>`
  
  ranking+=`<p id="puntaje" class="p-2 text-start fs-4 lh-base mt-auto mb-0 text-center"> Este fue tu puntaje: ${puntaje}</p>
  <p id="puntajeBonus" class="p-2 text-start fs-4 lh-base mt-auto mb-0 text-center"> Este fue tu puntaje bonus: ${puntajeBonus}</p>
            
            <p id="puntajeFinal" class="p-2 text-start fs-4 lh-base mt-auto mb-0 text-center"> Este fue tu puntaje final: ${puntajeFinal}</p>
            `
  if(puntajeFinal>=37){
    despedida+=`<p id="cierre" class=" rounded-2 p-2 text-start fs-5 lh-base mt-auto mb-0 text-center font-weight-bold" style=" background-color: #4FAD2D; color: #ffff;">${dialogo.finDeJuego.puntajeAlto}</p>`
  }else{
    despedida+=`<p id="cierre" class="p-2 text-start fs-6 lh-base mt-auto mb-0 text-center font-weight-bold" style="background-color: #DEBE63;color: #ffff">${dialogo.finDeJuego.puntajeBajo}`
  };
  document.getElementById('texto').innerHTML += cierre;
  document.getElementById('ranking').innerHTML += ranking;
  document.getElementById('ranking').innerHTML += despedida;
};
function mostrarRanking(){
  let texto=``;
  let ranking="";
  // let tops=topUsuario;
  let divTexto= document.getElementById('texto');
  let divRanking=document.getElementById('ranking');
  let divBotonM=document.getElementById('btnMostrar');
  let divBotonS=document.getElementById('btnSalir');
  let divBotonV=document.getElementById('btnVolver');
  divBotonM.style.display= 'none';
  divBotonS.style.top="86%";
  divBotonS.style.left="58%";
  divBotonV.style.top="86%";
  divBotonV.style.left="25%";
  
  divTexto.style.height="auto";
  divRanking.style.height="67%";
  divRanking.style.top="16%";
  texto+=`<h2 id="top" class="p-2 text-start fs-4 lh-base mt-auto mb-0 text-center">TOP 10 JUGADORES</h2>`
  for(let i=0 ; i<10 ; i++){
    ranking+=`<li class="list-group-item list-group-item-warning">{tops}</li>`
  }
  document.getElementById('ranking').innerHTML = ranking;
  document.getElementById('texto').innerHTML = texto;
}

function a(){
    let divFinal=document.getElementById('final');
    let divPrincipal = document.getElementById('container');

    divPrincipal.style.display = 'none';
    divFinal.style.display = 'block'
}


function inicioJuego(){
  alert('en mantenimiento tenga paciencia')
}

// ----------------------------------------------------------




