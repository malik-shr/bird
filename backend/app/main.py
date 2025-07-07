from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pymysql.cursors

app = FastAPI()

origins = [
    "http://localhost:80",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_connection():
    return pymysql.connect(
        host='db',
        user='root',
        password='strong',
        database='bird_mysql',
        cursorclass=pymysql.cursors.DictCursor
    )

@app.get("/api")
def upload_file():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # Create table if not exists
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100)
                )
            """)
            conn.commit()

            # Add column 'age' only if it does not exist (simplified example)
            cursor.execute("SHOW COLUMNS FROM users LIKE 'age'")
            if cursor.fetchone() is None:
                cursor.execute("ALTER TABLE users ADD COLUMN age INT")
                conn.commit()

            # Show tables
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()

            # Show columns
            cursor.execute("SHOW COLUMNS FROM users")
            columns = cursor.fetchall()
    finally:
        conn.close()

    return {"tables": tables, "columns": columns}
