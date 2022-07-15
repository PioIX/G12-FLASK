import sqlite3
import random
from flask import Flask, jsonify, render_template, request, session
from flask_cors import CORS
import db

# NO MODIFICAR
app = Flask(__name__)
CORS(app)
# NO MODIFICAR
app.secret_key = 'esto-es-una-clave-muy-secreta'


# SECCIÓN INICIO DE SESION

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/iniciarsesion')
def iniciarSesion():
  return render_template('inicio_sesion.html')

#https://lineadecodigo.com/python/sesion-en-flask/
#https://www.geeksforgeeks.org/how-to-use-flask-session-in-python-flask/
@app.route('/crearusuario')
def crear():
  return render_template("crear_usuario.html")
  
@app.route('/ingresarusuario', methods=['POST', 'GET'])
def crearUsuario():
    msg = None
    if (request.method == "POST"):
        if (request.form["usuario"] != "" and request.form["contraseña"] != "" and request.form["confirmación"]):
          if request.form["contraseña"] == request.form["confirmación"]:
            usuario = request.form['usuario']
            contraseña = request.form['contraseña']
            session['usuario'] = usuario
            session['contraseña'] = contraseña
            existe = checkearSiEsta(usuario)
            if existe == True:
              msg= "Su usario ya existe. Por favor intentelo nuevamente"
              return render_template("crear_usuario.html", msg=msg)
            else:
              msg = f"Bienvenidx {usuario}"
              insertUser(usuario, contraseña)
              return render_template("juego.html", msg=msg)
          else:
            msg = "Tu contraseña no ha sido confirmada. Intentalo nuevamente"
            return render_template("crear_usuario.html", msg=msg)
        else:
            msg = "Debe ingresar usuario, contraseña y confirmacion. Intentelo nuevamente"
            return render_template("crear_usuario.html", msg=msg)

def checkearSiEsta(unUsuario):
  conn = sqlite3.connect('dataBase.db')
  cur = conn.cursor()
  cur.execute(f"""SELECT *
                      FROM Usuarios
                      WHERE nombre = '{unUsuario}';
                  """)
  user = cur.fetchall()
  conn.commit()
  conn.close()
  if user != []:
    return True
  


@app.route('/login',methods=['GET','POST'])
def logearte():
  usuario = request.form["usuario"]
  contraseña = request.form["contraseña"]
  conn = sqlite3.connect('dataBase.db')
  cur = conn.cursor()
  cur.execute(f"""SELECT *
                      FROM Usuarios
                      WHERE nombre = '{usuario}' AND contraseña = '{contraseña}';
                  """)
  user = cur.fetchall()
  conn.commit()
  conn.close()
  if user != []:
    session["usuario"] = usuario
    msg= f"Bienvenidx nuevamente {usuario}"
    preguntas = listaPreguntasSegunNivel('1')
    respuestas = listaRespuestas()
    return render_template('juego.html', msg=msg)
  else:
    msg= 'Usuario inexistente. Intentelo nuevamente'
    return render_template('inicio_sesion.html', msg=msg)


  
# Ingresar usuario a base de datos
def insertUser(unUsuario, unaContraseña):
  con = sqlite3.connect("dataBase.db")
  con.execute("INSERT INTO Usuarios (nombre,contraseña) VALUES (?,?)",(unUsuario, unaContraseña))
  con.commit()
  con.close()
  return render_template("crear_usuario.html")
  
# ------------------------------------------------------

# SECCION BASE DE DATOS/API
  
## Lista todas las preguntas
@app.route('/listaPreguntas')
def listaPreguntas():
    conn = sqlite3.connect('dataBase.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("""SELECT *
                        FROM Preguntas;
                    """)
    rows = cur.fetchall()
    preguntas = []
    for fila in rows:
        pregunta = {
            "id_pregunta": fila[0],
            "pregunta": fila[1],
            "categoria": fila[2],
            "nivel": fila[3]
        }
        preguntas.append(pregunta)
    return jsonify(preguntas)


## Lista todas las preguntas
@app.route('/listaUsuarios')
def listaUsuarios():
    conn = sqlite3.connect('dataBase.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("""SELECT *
                        FROM Usuarios;
                    """)
    rows = cur.fetchall()
    usuarios = []
    for fila in rows:
        usuario = {
            "id_usuario": fila[0],
            "nombre": fila[1],
            "contraseña": fila[2],
            "desarrollador": fila[3],
            "mayor_puntaje": fila[4]
        }
        usuarios.append(usuario)
    return jsonify(usuarios)


# Lista las preguntas según Nivel
# @app.route('/listaPreguntas/nivel/<nivel>')
def listaPreguntasSegunNivel(nivel):
    conn = sqlite3.connect('dataBase.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(f"""SELECT *
                        FROM Preguntas
                        WHERE nivel = '{nivel}';
                    """)
    rows = cur.fetchall()
    preguntas = []
    for fila in rows:
        pregunta = {
            "id_pregunta": fila[0],
            "pregunta": fila[1],
            "categoria": fila[2],
            "nivel": fila[3]
        }
        preguntas.append(pregunta)

    preguntas_random = []
    while len(preguntas_random) < 3:
        numero_random = random.randint(0, len(preguntas) - 1)
        if preguntas[numero_random] not in preguntas_random:
            preguntas_random.append(preguntas[numero_random])

    return preguntas_random


    # Lista las preguntas según Nivel
@app.route('/listaPreguntas/categoria/<categ>')
def listaPreguntasSegunCategoria(categ):
    conn = sqlite3.connect('dataBase.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(f"""SELECT *
                        FROM Preguntas
                        WHERE categoria = '{categ}';
                    """)
    rows = cur.fetchall()
    preguntas = []
    for fila in rows:
        pregunta = {
            "id_pregunta": fila[0],
            "pregunta": fila[1],
            "categoria": fila[2],
            "nivel": fila[3]
        }
        preguntas.append(pregunta)

    preguntas_random = []
    while len(preguntas_random) < 3:
        numero_random = random.randint(0, len(preguntas) - 1)
        if preguntas[numero_random] not in preguntas_random:
            preguntas_random.append(preguntas[numero_random])

    return jsonify(preguntas_random)


## Devuelve la lista de los niveles
# @app.route('/listaRespuestas')
def listaRespuestas():
    conn = sqlite3.connect('dataBase.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("""SELECT *
                        FROM Respuestas;
                    """)
    rows = cur.fetchall()
    respuestas = []
    for fila in rows:
        respuesta = {
            "id_respuesta": fila[0],
            "es_correcta": fila[1],
            "respuesta": fila[2],
            "id_pregunta": fila[3]
        }
        respuestas.append(respuesta)
    return respuestas


## Muestra la lista con las categorias posibles
@app.route('/listaCategorias')
def listaCategorias():
    conn = sqlite3.connect('dataBase.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(f"""SELECT categoria
            FROM Preguntas
            GROUP BY categoria
                    """)
    rows = cur.fetchall()
    categorias = []
    for fila in rows:
        categorias.append(fila[0])
    return jsonify(categorias)


## Muestra la lista con los nombres de los niveles
@app.route('/listaNiveles')
def listaNiveles():
    conn = sqlite3.connect('dataBase.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(f"""SELECT categoria
            FROM Preguntas
            GROUP BY nivel
                    """)
    rows = cur.fetchall()
    niveles = []
    for fila in rows:
        niveles.append(fila[0])
    return jsonify(niveles)


#Editar preguntas/respuestas o Borrar Pregunta
@app.route('/editar/<id>', methods=['POST', 'GET'])
def editaPregunta(id):
  db.editar(id)
  return render_template()#pantalla de preguntas


# Crea una pregunta con sus respuestas
@app.route('/crear/<tipo>')
def crearPregunta(tipo):
    db.crear(tipo)
    return render_template()
##################################################################################
# Comentario de Feli: 
#(igual esto ya lo deben saber por que ya les anda en pythonanywhere)
# para correrlo en pythonanywhere hay que agregar : 
# if __name__ == '__main__':
#    db.create_all()
#    app.run()
#
# Ref: https://help.pythonanywhere.com/pages/Flask/  ##################################################################################
app.run(host='0.0.0.0', port=81)
