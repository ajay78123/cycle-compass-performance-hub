
import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_SERVER = os.getenv("DB_SERVER")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_DRIVER = os.getenv("DB_DRIVER")

# Connection string
CONNECTION_STRING = f"DRIVER={{{DB_DRIVER}}};SERVER={DB_SERVER};DATABASE={DB_NAME};UID={DB_USER};PWD={DB_PASSWORD}"

def get_db_connection():
    """Create and return a new database connection"""
    try:
        conn = pyodbc.connect(CONNECTION_STRING)
        return conn
    except pyodbc.Error as e:
        print(f"Database connection error: {e}")
        raise

async def init_db():
    """Initialize database tables if they don't exist"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Define table creation queries
    users_table = """
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
    CREATE TABLE users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        hashed_password VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        manager_id VARCHAR(50) NULL,
        profile_picture VARCHAR(255) NULL,
        created_at DATETIME DEFAULT GETDATE()
    )
    """
    
    review_cycles_table = """
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='review_cycles' AND xtype='U')
    CREATE TABLE review_cycles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        frequency VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_by VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT GETDATE()
    )
    """
    
    review_windows_table = """
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='review_windows' AND xtype='U')
    CREATE TABLE review_windows (
        id VARCHAR(50) PRIMARY KEY,
        cycle_id VARCHAR(50) NOT NULL,
        label VARCHAR(50) NOT NULL,
        open_date DATE NOT NULL,
        close_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (cycle_id) REFERENCES review_cycles(id)
    )
    """
    
    kras_table = """
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='kras' AND xtype='U')
    CREATE TABLE kras (
        id VARCHAR(50) PRIMARY KEY,
        employee_id VARCHAR(50) NOT NULL,
        cycle_id VARCHAR(50) NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT NULL,
        status VARCHAR(20) NOT NULL,
        feedback TEXT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES users(id),
        FOREIGN KEY (cycle_id) REFERENCES review_cycles(id)
    )
    """
    
    kpis_table = """
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='kpis' AND xtype='U')
    CREATE TABLE kpis (
        id VARCHAR(50) PRIMARY KEY,
        kra_id VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        target FLOAT NOT NULL,
        unit VARCHAR(50) NOT NULL,
        weight INT NOT NULL,
        status VARCHAR(20) NOT NULL,
        feedback TEXT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (kra_id) REFERENCES kras(id)
    )
    """
    
    ratings_table = """
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ratings' AND xtype='U')
    CREATE TABLE ratings (
        id VARCHAR(50) PRIMARY KEY,
        kpi_id VARCHAR(50) NOT NULL,
        rater_id VARCHAR(50) NOT NULL,
        rater_type VARCHAR(20) NOT NULL,
        score INT NOT NULL,
        comment TEXT NULL,
        window_id VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (kpi_id) REFERENCES kpis(id),
        FOREIGN KEY (rater_id) REFERENCES users(id),
        FOREIGN KEY (window_id) REFERENCES review_windows(id)
    )
    """
    
    # Execute table creation queries
    try:
        cursor.execute(users_table)
        cursor.execute(review_cycles_table)
        cursor.execute(review_windows_table)
        cursor.execute(kras_table)
        cursor.execute(kpis_table)
        cursor.execute(ratings_table)
        
        # Add default admin user if not exists
        cursor.execute("""
        IF NOT EXISTS (SELECT * FROM users WHERE email = 'test@gmail.com')
        BEGIN
            INSERT INTO users (id, name, email, hashed_password, role)
            VALUES ('admin-001', 'Test Admin', 'test@gmail.com', '$2b$12$BnlqgKBGGKEv9UJiw2DQEur5MxuY4WuIFm2VZpXyOzgS2.Cb8wZma', 'admin')
        END
        """) 
        # Note: hashed_password is for 'testpass'
        
        conn.commit()
        print("Database initialized successfully")
    except pyodbc.Error as e:
        conn.rollback()
        print(f"Error initializing database: {e}")
        raise
    finally:
        cursor.close()
        conn.close()
