from langchain_openai import ChatOpenAI

from src.core.config import get_settings

settings = get_settings()
llm = ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key)


async def generate_text(prompt: str) -> str:
    response = await llm.ainvoke(prompt)
    return response.content if isinstance(response.content, str) else str(response.content)
