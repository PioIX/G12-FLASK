// ----------- VALIDACION BOOTSTRAP (GENERAL) ------------

function validacion() {
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
    .forEach(function (form) {
        
        form.addEventListener('submit', function (event) {
            
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            
            form.classList.add('was-validated');
            
        }, false)
    })
    
}

function validacionManual(){
    if( msg == 'Su usario ya existe. Por favor intentelo nuevamente o inicie sesion' ||
        msg == 'Tu contraseña no ha sido confirmada. Intentalo nuevamente'){
        let alert = new bootstrap.Modal(document.getElementById('alert'))
        $(".modal-backdrop").remove();
        alert.show()
        return false
    }
    return true
}

window.onload = validacionManual()