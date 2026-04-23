async def update_progress(user_id: str, score: float) -> dict:
    return {"user_id": user_id, "score": score}
