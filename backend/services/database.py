import sqlite3
import os
from datetime import datetime

DB_PATH = "./data/scamshield.db"

def get_connection():
    os.makedirs("./data", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scam_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_text TEXT NOT NULL,
            scam_type TEXT,
            danger_level TEXT,
            phone_number TEXT,
            reported_by TEXT DEFAULT 'Anonymous',
            state TEXT DEFAULT 'Unknown',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            upvotes INTEGER DEFAULT 0
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_text TEXT NOT NULL,
            scam_probability INTEGER,
            scam_type TEXT,
            danger_level TEXT,
            explanation TEXT,
            trick_used TEXT,
            what_to_do TEXT,
            similar_reports INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

def save_report(message_text, scam_type, danger_level, phone_number, reported_by, state):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO scam_reports (message_text, scam_type, danger_level, phone_number, reported_by, state)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (message_text, scam_type, danger_level, phone_number, reported_by, state))
    conn.commit()
    conn.close()

def save_analysis(message_text, result):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO analyses (message_text, scam_probability, scam_type, danger_level, explanation, trick_used, what_to_do, similar_reports)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        message_text,
        result.get("scam_probability"),
        result.get("scam_type"),
        result.get("danger_level"),
        result.get("explanation"),
        result.get("trick_used"),
        result.get("what_to_do"),
        result.get("similar_reports", 0)
    ))
    conn.commit()
    conn.close()

def get_similar_reports(message_text, limit=5):
    conn = get_connection()
    cursor = conn.cursor()
    words = message_text.split()[:5]
    query = "%" + "%".join(words[:3]) + "%"
    cursor.execute("""
        SELECT * FROM scam_reports
        WHERE message_text LIKE ?
        ORDER BY created_at DESC LIMIT ?
    """, (query, limit))
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def get_all_reports(limit=50):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scam_reports ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def get_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as total FROM scam_reports")
    total = cursor.fetchone()["total"]

    cursor.execute("""
        SELECT scam_type, COUNT(*) as count
        FROM scam_reports
        GROUP BY scam_type
        ORDER BY count DESC LIMIT 5
    """)
    top_types = [dict(r) for r in cursor.fetchall()]

    cursor.execute("""
        SELECT state, COUNT(*) as count
        FROM scam_reports
        WHERE state != 'Unknown'
        GROUP BY state
        ORDER BY count DESC LIMIT 5
    """)
    top_states = [dict(r) for r in cursor.fetchall()]

    cursor.execute("""
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM scam_reports
        GROUP BY DATE(created_at)
        ORDER BY date DESC LIMIT 7
    """)
    daily = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return {"total": total, "top_types": top_types, "top_states": top_states, "daily": daily}

def get_leaderboard():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT reported_by, COUNT(*) as reports
        FROM scam_reports
        WHERE reported_by != 'Anonymous'
        GROUP BY reported_by
        ORDER BY reports DESC LIMIT 10
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def upvote_report(report_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE scam_reports SET upvotes = upvotes + 1 WHERE id = ?", (report_id,))
    conn.commit()
    conn.close()
