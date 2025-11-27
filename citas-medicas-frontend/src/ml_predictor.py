# ml_predictor.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import mysql.connector

class NoShowPredictor:
    def __init__(self):
        self.model = None
        self.db_connection = mysql.connector.connect(
            host='localhost',
            user='tu_usuario',
            password='tu_password',
            database='tu_base_datos'
        )
    
    def cargar_datos_entrenamiento(self):
        query = """
        SELECT 
            especialidad,
            DAYOFWEEK(fecha_cita) as dia_semana,
            HOUR(hora_cita) as hora,
            ausente as target
        FROM citas 
        WHERE fecha_cita < CURDATE()
        """
        
        df = pd.read_sql(query, self.db_connection)
        return df
    
    def entrenar_modelo(self):
        df = self.cargar_datos_entrenamiento()
        
        # Preprocesamiento
        X = pd.get_dummies(df[['especialidad', 'dia_semana', 'hora']])
        y = df['target']
        
        # Entrenar modelo
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        
        # Guardar modelo
        joblib.dump(self.model, 'modelo_no_show.pkl')
    
    def predecir_citas_pendientes(self):
        query = """
        SELECT 
            id,
            especialidad,
            DAYOFWEEK(fecha_cita) as dia_semana,
            HOUR(hora_cita) as hora
        FROM citas 
        WHERE fecha_cita >= CURDATE()
        """
        
        citas_pendientes = pd.read_sql(query, self.db_connection)
        
        if self.model is None:
            self.model = joblib.load('modelo_no_show.pkl')
        
        # Preprocesar features
        X_pred = pd.get_dummies(citas_pendientes[['especialidad', 'dia_semana', 'hora']])
        
        # Asegurar que tenga las mismas columnas que el entrenamiento
        X_pred = X_pred.reindex(columns=self.model.feature_names_in_, fill_value=0)
        
        # Predecir probabilidades
        probabilidades = self.model.predict_proba(X_pred)[:, 1]
        
        # Categorizar riesgo
        categorias = []
        for prob in probabilidades:
            if prob < 0.3:
                categorias.append('bajo')
            elif prob < 0.7:
                categorias.append('medio')
            else:
                categorias.append('alto')
        
        return list(zip(citas_pendientes['id'], probabilidades, categorias))

# Ejecutar predicciones
predictor = NoShowPredictor()
resultados = predictor.predecir_citas_pendientes()