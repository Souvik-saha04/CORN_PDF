from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from documents.models import Docs

from pinecone import Pinecone
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore

from utils.firebase_auth import get_user_from_token

import json
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("Gemini_API_Key")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "Missing Gemini API key."
    )

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    api_key=GEMINI_API_KEY
)

pc = Pinecone(
    api_key=os.getenv("PINECONE_SECRET")
)

index = pc.Index("pdf-qna-3072")

llm = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite",
    temperature=0.3,
    api_key=GEMINI_API_KEY
)


@csrf_exempt
def generate_quiz(request):

    if request.method != "POST":
        return JsonResponse(
            {
                "error": "Invalid request"
            },
            status=400
        )

    user, error = get_user_from_token(request)

    if error:
        return JsonResponse(
            {
                "error": error
            },
            status=401
        )

    try:

        data = json.loads(request.body)

    except:

        return JsonResponse(
            {
                "error": "Invalid JSON"
            },
            status=400
        )

    document_id = data.get("document_id")

    requirement = data.get(
        "requirement",
        ""
    ).strip()

    difficulty = data.get(
        "difficulty",
        "medium"
    )

    question_count = int(
        data.get(
            "question_count",
            10
        )
    )

    if not document_id:

        return JsonResponse(
            {
                "error": "Document ID is required."
            },
            status=400
        )

    try:

        document = Docs.objects.get(
            id=document_id,
            user=user
        )

    except Docs.DoesNotExist:

        return JsonResponse(
            {
                "error": "Document not found."
            },
            status=404
        )

    vectorstore = PineconeVectorStore(
        index=index,
        embedding=embeddings
    )
    try:
        retriever = vectorstore.as_retriever(
            search_kwargs={
                "k": max(question_count * 2, 10),
                "filter": {
                    "document_id": document.id
                }
            }
        )

        if requirement:

            search_query = requirement

        else:

            search_query = (
                f"Entire document. "
                f"Generate {question_count} quiz questions."
            )

        retrieved_docs = retriever.invoke(
            search_query
        )

        if not retrieved_docs:

            return JsonResponse(
                {
                    "error": "No relevant content found in the document."
                },
                status=404
            )

        context = "\n\n".join(
            doc.page_content
            for doc in retrieved_docs
        )

        prompt = f"""
    You are an expert quiz generator.

    Generate exactly {question_count} multiple choice questions.

    Difficulty:
    {difficulty}

    User Requirement:
    {requirement if requirement else "Entire document"}

    Use ONLY the context below.

    If the context does not contain enough information,
    generate the remaining questions using the same document context,
    but NEVER invent completely unrelated topics.

    Each question must contain:

    - question
    - four options
    - correct answer index (0-3)
    - explanation

    Return ONLY valid JSON.

    Format:

    {{
    "questions":[
        {{
            "question":"...",
            "options":[
                "...",
                "...",
                "...",
                "..."
            ],
            "correct":0,
            "explanation":"..."
        }}
    ]
    }}

    Context:

    {context}
    """

        response = llm.invoke(prompt)

        if isinstance(response.content, str):

            result = response.content

        elif isinstance(response.content, list):

            result = "".join(
                part.get("text", "")
                for part in response.content
                if isinstance(part, dict)
            )

        else:
            result = str(response.content)
            result = result.strip()

        # Remove Markdown code fences if Gemini returns them
        if result.startswith("```json"):
            result = result.replace("```json", "", 1)

        if result.startswith("```"):
            result = result.replace("```", "", 1)

        if result.endswith("```"):
            result = result[:-3]

        result = result.strip()

        try:

            quiz = json.loads(result)

        except Exception:

            return JsonResponse(
                {
                    "error": "Gemini returned invalid JSON.",
                    "raw_response": result
                },
                status=500
            )

        questions = quiz.get("questions", [])

        if not questions:

            return JsonResponse(
                {
                    "error": "No questions generated."
                },
                status=500
            )

        cleaned_questions = []

        for q in questions:

            if (
                "question" not in q
                or "options" not in q
                or "correct" not in q
            ):
                continue

            if len(q["options"]) != 4:
                continue

            cleaned_questions.append(
                {
                    "question": q["question"],
                    "options": q["options"],
                    "correct": int(q["correct"]),
                    "explanation": q.get(
                        "explanation",
                        ""
                    )
                }
            )

        if not cleaned_questions:

            return JsonResponse(
                {
                    "error": "Generated quiz is invalid."
                },
                status=500
            )

        return JsonResponse(
            {
                "document": document.file_name,
                "difficulty": difficulty,
                "requirement": requirement,
                "question_count": len(cleaned_questions),
                "questions": cleaned_questions
            }
        )

    except Exception as e:

        return JsonResponse(
            {
                "error": str(e)
            },
            status=500
        )