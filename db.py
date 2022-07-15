import sqlite3
from flask import request, render_template







#Editar preguntas/respuestas o Borrar Pregunta
def editar(id):
    conn = sqlite3.connect('dataBase.db')
    preg = request.form['preg']
    resps = []
#    resp.append(request.form['resp1'])
#    resp.append(request.form['resp2'])
#    resp.append(request.form['resp3'])

#    resp2 = request.form['resp2']
#    resp3 = request.form['resp3']
  
    if preg !="":
      borrar(id)
    else:
        q = f"""UPDATE Preguntas
            SET pregunta='{preg}'
            WHERE id_pregunta={id};"""
        editarRespuestas(id,resps)
        conn.execute(q)
        conn.commit()
        conn.close()
        msg = "Su edicion ha sido registrada exisitosamente"
        return render_template(msg=msg)

# Borra una pregunta
def borrar(id):
    conn = sqlite3.connect('dataBase.db')
    q = f"""DELETE FROM Preguntas
        WHERE id_pregunta={id};
        DELETE FROM Respuestas
        WHERE id_pregunta={id}"""
    conn.execute(q)
    conn.commit()
    conn.close()
    msg = "Se borrado exisitosamente"
    return render_template(msg=msg) 

# Editar respuestas
def editarRespuestas(id, vector):
  conn=sqlite3.connect('dataBase.db')
  cur = conn.cursor()
  cur.execute(f"""SELECT id
    FROM Respuestas
    WHERE id_pregunta = {id};""")
  listaids = []
  ids = cur.fetchall()
  i=0
  for id in ids:
    listaids.append(ids[i])
    i+=1
  i = 0
  for id in ids:
    conn.execute(f"""UPDATE Respuestas
    SET (respuesta)
    VALUES respuesta = '{vector[i]}'
    WHERE id_respuestas = '{id}'""")
    i=i+1
  conn.commit()
  conn.close()
  

# Crea una pregunta con sus respuestas
def crear(tipo):
    conn = sqlite3.connect('dataBase.db')
    resps = []
#    resp.append(request.form['resp1'])
#    resp.append(request.form['resp2'])
#    resp.append(request.form['resp3'])

#    resp2 = request.form['resp2']
#    resp3 = request.form['resp3']
    q = f"""INSERT INTO Preguntas(pregunta, categoria,nivel)
        VALUES;"""
    conn.execute(q)
    n = f"""SELECT id_pregunta
      FROM Preguntas
      ORDER BY id_pregunta DESC
      LIMIT 1"""
    conn.execute(n)
    cur = conn.cursor()
    id = cur.fetchall()
    i=0
    for resp in resps:
      if resp != "":
        if i == 0:
          conn.execute(f"""INSERT INTO Respuestas(es_correcta,respuesta,id_pregunta)
      VALUES(0,{resp[i]},{id});""")
          i =i+1
        else:
          conn.execute(f"""INSERT INTO Respuestas(es_correcta,respuesta,id_pregunta)
      VALUES(1,{resp[i]},{id});""")
          i =i+1
    conn.commit()
    conn.close()
    msg = "Se ha registrado exisitosamente"
    return render_template(msg=msg)
