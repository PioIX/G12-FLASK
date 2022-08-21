import sqlite3
import random
from flask import Flask, jsonify, render_template, request, session, url_for
from flask_cors import CORS
import db



# NO MODIFICAR
app = Flask(__name__)
CORS(app)
# NO MODIFICAR
app.secret_key = 'esto-es-una-clave-muy-secreta'
usuarioActual = {"nombre":"", "esAdmin":False, "icon":"" 
                }
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
        if (request.form["usuario"] != "" and request.form["contraseña"] != ""
                and request.form["confirmación"] != ""):
            if request.form["contraseña"] == request.form["confirmación"]:
                usuario = request.form['usuario']
                contraseña = request.form['contraseña']
                session['usuario'] = usuario
                session['contraseña'] = contraseña
                existe = checkearSiEsta(usuario)
                if existe == True:
                    msg = "Su usario ya existe. Por favor intentelo nuevamente"
                    return render_template("crear_usuario.html", msg=msg)
                else:
                    msg = f"{usuario}"
                    avatar = request.form.get("avatar")
                    insertUser(usuario, contraseña, avatar)
                    logearte()
                    session["usuario"] = usuario
                    preguntas1 = listaPreguntasSegunNivel('1')
                    preguntas2 = [
                    listaPreguntasSegunCategoria('ODS 4'),
                    listaPreguntasSegunCategoria('ODS 10'),
                    listaPreguntasSegunCategoria('ODS 15')
                    ]
                    preguntasBonus = listaPreguntasSegunNivel('bonus')
                    respuestas = listaRespuestas()
                    datos = datosUsuarioActual(usuario)
                    return render_template("juego.html",usuario=usuario, preguntas1=preguntas1,
                               preguntas2=preguntas2,
                               preguntasBonus=preguntasBonus,
                               respuestas=respuestas,
                                datos=datos)# ACA ESTA EL PROBLEMA
            else:
                msg = "Tu contraseña no ha sido confirmada. Intentalo nuevamente"
                return render_template("crear_usuario.html", msg=msg)
        else:
            msg = "Debe ingresar usuario, contraseña y confirmacion. Intentelo nuevamente"
            return render_template("crear_usuario.html", msg=msg)


#Checkea que el usuario no exista
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


#Logearte
@app.route('/login', methods=['GET', 'POST'])
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

        
        preguntas1 = listaPreguntasSegunNivel('1')
        preguntas2 = [
            listaPreguntasSegunCategoria('ODS 4'),
            listaPreguntasSegunCategoria('ODS 10'),
            listaPreguntasSegunCategoria('ODS 15')
        ]
        preguntasBonus = listaPreguntasSegunNivel('bonus')
        respuestas = listaRespuestas()
        datos = datosUsuarioActual(usuario)
        #topUsuario=listaTopUsuarios()
        return render_template('juego.html',
                               usuario=usuario,
                               preguntas1=preguntas1,
                               preguntas2=preguntas2,
                               preguntasBonus=preguntasBonus,
                               respuestas=respuestas,
                                datos=datos)
                                #topUsuario=topUsuario)
      
    else:
        msg = 'Usuario inexistente. Intentelo nuevamente'
        return render_template('inicio_sesion.html', msg=msg)

#Borrar usuarios
@app.route('/borrar/<unUsuario>')
def borrarUsuario(unUsuario):
  conn = sqlite3.connect('dataBase.db')
  cur = conn.cursor()
  cur.execute(f"""DELETE FROM Usuarios
                  WHERE nombre = '{unUsuario}';
                  """)
  conn.commit()
  conn.close()
  return "funcionooooo"


#Modifica variable global en cuanto al ingreso de sesion
def datosUsuarioActual(unUsuario):
  conn = sqlite3.connect('dataBase.db')
  cur = conn.cursor()
  cur.execute(f"""SELECT desarrollador, icon
                    FROM Usuarios
                    WHERE nombre = '{unUsuario}';
                  """)
  user = cur.fetchall()
  conn.commit()
  conn.close()
  usuarioActual["nombre"]=unUsuario
  usuarioActual["icon"]=f"../static/imagenes/avatares/Opcion{user[0][1]}.png"
  if user[0][0] == 0:
    usuarioActual["esAdmin"]=True
  else:
    usuarioActual["esAdmin"]=False
  return usuarioActual
  
@app.route("/userowo/<n>")
def userowo(n):
  return datosUsuarioActual(n)
  
# Ingresar usuario a base de datos
def insertUser(unUsuario, unaContraseña, unAvatar):
    con = sqlite3.connect("dataBase.db")
    q = f"""INSERT INTO Usuarios (nombre,contraseña,icon) VALUES ('{unUsuario}', '{unaContraseña}', '{unAvatar}')"""
    con.execute(q)
    con.commit()
    con.close()

# ------------------------------------------------------

# SECCION BASE DE DATOS/API


## Lista todas las preguntas
# @app.route('/listaPreguntas')
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
    return preguntas


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
            "mayor_puntaje": fila[4],
            "icon": fila[5]
        }
        usuarios.append(usuario)
    return jsonify(usuarios)


# Lista las preguntas según Nivel
@app.route('/listaPreguntas/nivel/<nivel>')
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
# @app.route('/listaPreguntas/categoria/<categ>')
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

    return preguntas_random


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
  
## Mostrar lista top diez usuarios
## @app.route('/listaTop10Usuarios')
def listaTopUsuarios():
    conn = sqlite3.connect('dataBase.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(f"""SELECT nombre
            FROM Usuarios
            ORDER BY mayor_puntaje desc limit 10
                    """)
    rows = cur.fetchall()
    topUsuario = []
    for fila in rows:
        topUsuario.append(fila[0])
    return topUsuario

#Editar preguntas/respuestas o Borrar Pregunta
## Mostrar lista de puntaje
 ## @app.route('/listaPuntaje') 
"""def listaPuntaje():"""

@app.route('/editar', methods=['POST', 'GET'])
def editaPregunta():
    db.editar()
    preguntas = listaPreguntas()
    respuestas = listaRespuestas()
    return render_template('adminEditar.html',
                          preguntas = preguntas,
                          respuestas = respuestas)

@app.route('/borrar', methods=['POST', 'GET'])
def borraPregunta():
    db.borrar()
    preguntas = listaPreguntas()
    respuestas = listaRespuestas()
    return render_template('adminEditar.html',
                          preguntas = preguntas,
                          respuestas = respuestas)
  
# Crea una pregunta con sus respuestas
@app.route('/crear', methods=['POST', 'GET'])
def crearPregunta():
    db.crear()
    
    return render_template('adminAgregar.html')


# SECCION ADMIN

@app.route('/admin/agregar')
def adminAgregar():
  if usuarioActual["esAdmin"] == True:
    return render_template('adminAgregar.html')
  else:
    return render_template('noAdmin.html') #HACER TEMPLATE



@app.route('/admin/editar')
def adminEditar():
  if usuarioActual["esAdmin"] == True:
    preguntas = listaPreguntas()
    respuestas = listaRespuestas()
    return render_template('adminEditar.html',
                          preguntas = preguntas,
                          respuestas = respuestas)
  else:
        return render_template('noAdmin.html') #HACER TEMPLATE


# def crearPreg():
  
#   conn = sqlite3.connect('dataBase.db')
#   preg = request.form['textoPregunta']
#   nivel = request.form['nivel']
#   categ = request.form['categoria']
#   # if request.form.get('tipoPreguntaChoice'):
#   #   tipo = request.form['tipoPreguntaChoice']
#   # elif request.form.get('tipoPreguntaVoF'):
#   #   tipo = request.form['tipoPreguntaVoF']
#   a = request.form['tipoPregunta']
#   print(a)
#   resps = []
#   listaCorrectas = []
#   if request.form.get('correcto1'):
#     listaCorrectas.append(1)
#   elif request.form.get('correcto2'):
#     listaCorrectas.append(1)
#   elif request.form.get('correcto3'):
#     listaCorrectas.append(1)
    
#   resps.append(request.form['rta1'])
#   resps.append(request.form['rta2'])


#   q = f"""INSERT INTO Preguntas(pregunta, categoria,nivel)
#       VALUES('{preg}','{categ}','{nivel}');"""
#   conn.execute(q)
#   n = f"""SELECT id_pregunta
#     FROM Preguntas
#     ORDER BY id_pregunta DESC
#     LIMIT 1"""
#   conn.execute(n)
#   cur = conn.cursor()
#   id = cur.fetchall()
#   i=0
#   for resp in resps:
#     conn.execute(f"""INSERT INTO Respuestas(es_correcta,respuesta,id_pregunta)
#     VALUES({listaCorrectas[i]},{resp[i]},{id});""")
#     i =i+1
#   conn.commit()
#   conn.close()
  
@app.route('/test', methods=['POST', 'GET'])
def testing():
  conn = sqlite3.connect('dataBase.db')
  cur = conn.cursor()
  id=3
  cur.execute(f"""SELECT id_respuesta
    FROM Respuestas
    WHERE id_pregunta = {id};""")
  ids = cur.fetchall()
  print(ids)
  i=0
  for id in ids:
    print(ids[i][0])
    conn.execute(f"""UPDATE Respuestas
    SET (respuesta)
    VALUES respuesta = '{vector[i]}'
    WHERE id_respuestas = '{ids[i][0]}'""")
    i=i+1
  return "mira vos"

@app.route('/ingresarPuntaje', methods=['POST', 'GET'])
def ingresarPuntaje():
  conn = sqlite3.connect('dataBase.db')
  puntaje = "lol"
  cur = conn.cursor()
  cur.execute(f"""SELECT mayor_puntaje
                    FROM Usuarios
                    WHERE nombre = '{usuarioActual['nombre']}';
                  """)
  user = cur.fetchall()
  if user[0][0] == [] or user[0][0]<puntaje:
    q = f"""INSERT INTO Usuarios (mayor_puntaje) VALUES ({puntaje})"""
    conn.execute(q)
    conn.commit()
  conn.close()
  return ('ol')
    

@app.route('/prueba', methods=['POST', 'GET'])
def prueba():
  # conn = sqlite3.connect('dataBase.db')
  # puntaje = "lol"
  # cur = conn.cursor()
  # cur.execute(f"""SELECT mayor_puntaje
  #                   FROM Usuarios
  #                   WHERE nombre = '{usuarioActual['nombre']}';
  #                 """)
  # user = cur.fetchall()
  # print(user)
  return "a"
app.run(host='0.0.0.0', port=81)
