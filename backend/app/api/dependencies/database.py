from app.database.session import get_db_session

# Re-exporting database session dependency for routing consistency
get_db = get_db_session
