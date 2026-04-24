import asyncio
from sqlalchemy import text

from src.core.database import AsyncSessionLocal


async def main() -> None:
    async with AsyncSessionLocal() as db:
        for table in ("calendar_sessions", "schools", "calendar_runs", "lesson_plans", "teacher_progress"):
            r = await db.execute(
                text(
                    """
                    SELECT column_name, data_type, udt_name
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = :t
                    ORDER BY ordinal_position
                    """
                ),
                {"t": table},
            )
            print("===", table, "===")
            for row in r:
                print(row)


if __name__ == "__main__":
    asyncio.run(main())
