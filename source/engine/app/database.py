import sqlite3

DB_FILE = "rules.db"


def get_db_connection():
    # Timeout prevents "database is locked" errors during concurrent reads/writes
    conn = sqlite3.connect(DB_FILE, timeout=5.0)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    # Enable WAL mode to prevent database lock errors during concurrent access from API and Kafka worker
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sensor_id TEXT NOT NULL,
            operator TEXT NOT NULL,
            threshold_value TEXT NOT NULL,
            actuator_target TEXT NOT NULL,
            actuator_state TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1
        )
        """
    )

    conn.commit()
    conn.close()
