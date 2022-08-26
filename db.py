import sqlite3
from flask import request


#Editar preguntas/respuestas o Borrar Pregunta
def editar():
    conn = sqlite3.connect('dataBase.db')
    preg = request.form['textoPregunta']
    resps = []
    id = request.form['id_pregunta']
    resps.append(request.form['rta1'])
    resps.append(request.form['rta2'])
    resps.append(request.form['rta3'])
    if preg !="":
      q = f"""UPDATE Preguntas
      SET pregunta='{preg}'
      WHERE id_pregunta={id};"""
    editarRespuestas(id,resps)
    conn.execute(q)
    conn.commit()
    conn.close()

# Borra una pregunta
def borrar():
  conn = sqlite3.connect('dataBase.db')
  id = request.form['id_pregunta']
  q = f"""DELETE FROM Preguntas
      WHERE id_pregunta={id};"""
  n = f"""DELETE FROM Respuestas
      WHERE id_pregunta={id};"""
  conn.execute(q)
  conn.execute(n)
  conn.commit()
  conn.close()


# Editar respuestas
def editarRespuestas(id, vector):
  conn = sqlite3.connect('dataBase.db')
  cur = conn.cursor()
  cur.execute(f"""SELECT id_respuesta
    FROM Respuestas
    WHERE id_pregunta = {id};""")
  ids = cur.fetchall()
  print(ids)
  i=0
  for id in ids:
    conn.execute(f"""UPDATE Respuestas
    SET respuesta = '{vector[i]}'
    WHERE id_respuesta = {ids[i][0]}""")
    i=i+1
  conn.commit()
  conn.close()
  

# Crea una pregunta con sus respuestas
def crear():
  conn = sqlite3.connect('dataBase.db')
  preg = request.form['textoPregunta']
  nivel = request.form['nivel']
  categ = request.form['categoria']
  tipo=request.form.get('tipoPregunta')
  resps = []
  correcta = request.form.get('correcto')
  if correcta == 'correcto1':
    correct = 0
  elif correcta == 'correcto2':
    correct = 1
  else: 
    correct = 2
  print(correcta, correct)
  resps.append(request.form['rta1'])
  resps.append(request.form['rta2'])
  if tipo == "choice":  
    resps.append(request.form['rta3'])

  q = f"""INSERT INTO Preguntas(pregunta, categoria,nivel)
      VALUES('{preg}','{categ}','{nivel}');"""
  conn.execute(q)
  cur = conn.cursor()
  cur.execute(f"""SELECT id_pregunta
                      FROM Preguntas
                      ORDER BY id_pregunta DESC
                      LIMIT 1;
                  """)
  id = cur.fetchone()
  i=0
  for resp in resps:
    if correct == i:
      conn.execute(f"""INSERT INTO Respuestas(es_correcta,respuesta,id_pregunta)
      VALUES(0,'{resp[i]}',{id[0]});""")
    else:
      conn.execute(f"""INSERT INTO Respuestas(es_correcta,respuesta,id_pregunta)
    VALUES(1,'{resp[i]}',{id[0]});""")
    i=i+1
  conn.commit()
  conn.close()