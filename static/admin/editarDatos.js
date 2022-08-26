function mostrarRespuestas(id, seccion) {
    let pregunta = preguntas.filter(i => i.id_pregunta == id)[0]
    let respuestasFiltradas = [];
    let HTMLrespuestas = ""
    
    for(let i=0 ; i<respuestas.length ; i++){
        if(respuestas[i].id_pregunta == id){
            respuestasFiltradas.push(respuestas[i]);
        }
    }

    HTMLrespuestas += `
    <div class="row g-3">
        <div class="col-11">
            <label for="textoPregunta" class="form-label mb-0">Pregunta</label>
            <input class="form-control mb-2" type="text" value="${pregunta.pregunta}" name="textoPregunta" id="textoPregunta${seccion.substring(10)}" readonly>
            <input type="text" value="${pregunta.id_pregunta}" readonly style="display:none" name="id_pregunta" id="id_pregunta">
        </div>
        <div class="col-1 ">
            <label for="editarPregunta" class="form-label mb-0"></label> <br>
            <input class="btn btn-success col-12 mb-2" data-boton="textoPregunta${seccion.substring(10)}" readonly value="Editar" onclick="editarInput(this.dataset.boton)">
        </div>
    </div>`
    
    for(let p=0 ; p<respuestasFiltradas.length ; p++){
        HTMLrespuestas += `
        <div class="row g-3">
            <div class="col-11">
                <label for="rta${p+1}" class="form-label mb-0">Respuesta ${p+1}</label>
                <input class="form-control mb-2" type="text" value="${respuestasFiltradas[p].respuesta}" name="rta${p+1}" id="rta${p+1}" data-correcto="${respuestasFiltradas[p].es_correcta}" readonly>
                <input type="text" value="${respuestasFiltradas[p].id_respuesta}" readonly style="display:none" name="id_respuesta" id="id_respuesta">
            </div>
            <div class="col-1 ">
                <label for="editarRta${p+1}" class="form-label mb-0"></label> <br>
                <input class="btn btn-success col-12 mb-2" data-boton="rta${p+1}" value="Editar" readonly onclick="editarInput(this.dataset.boton)">
            </div>
        </div>`
    }

    document.getElementById(seccion).innerHTML = HTMLrespuestas;


}

function editarInput(id){
    document.getElementById(id).readOnly == false ? document.getElementById(id).readOnly = true : document.getElementById(id).readOnly = false;
}                 