from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from documents.models import Docs
from .models import QueryHistory

from pinecone import Pinecone
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
import json
import os
from dotenv import load_dotenv
from utils.firebase_auth import get_user_from_token

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("Gemini_API_Key")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "Missing Gemini API key. Set GEMINI_API_KEY (or Gemini_API_Key) in your environment."
    )

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    api_key=GEMINI_API_KEY
)

pc = Pinecone(api_key=os.getenv("PINECONE_SECRET"))

index = pc.Index("pdf-qna-3072")


llm = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite",
    temperature=0.3,
    api_key=GEMINI_API_KEY
)





@csrf_exempt
def ask_question(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)
    user, error = get_user_from_token(request)
    if error:
        return JsonResponse({"error": error}, status=401)

    data = json.loads(request.body)
    question = data.get("question")
    document_id = data.get("document_id")

    if not question or not document_id:
        return JsonResponse({"error": "Missing fields"}, status=400)

    try:
        document = Docs.objects.get(
            id=document_id,
            user=user
        )
    except Docs.DoesNotExist:
        return JsonResponse(
            {"error": "Document not found"},
            status=404
        )

    vectorstore = PineconeVectorStore(
        index=index,
        embedding=embeddings
    )

    retriever = vectorstore.as_retriever(
        search_kwargs={
            "k": 3,
            "filter": {"document_id": document.id}
        }
    )

    docs = retriever.invoke(question)

    if not docs:
        return JsonResponse(
            {
                "answer": "I couldn't find any relevant information in this document."
            }
        )

    context = "\n\n".join(doc.page_content for doc in docs)
    prompt = f"""
    You are a PDF Question Answering assistant.

    Try to answer  using the provided context.

    If the answer cannot be found in the context,

    give it according to your knowledge ,just for that chat you can ignore the context 
    Formatting rules:
    - Use short paragraphs.
    - Use bullet points whenever appropriate.
    - Use numbered lists for multiple points.
    - Use Markdown formatting.
    - Keep the answer clean and easy to read.
    - Do not write one long paragraph.

    Context:
    {context}

    Question:
    {question}

    Answer:
    """

    response = llm.invoke(prompt)

    if isinstance(response.content, str):
        answer = response.content

    elif isinstance(response.content, list):
        answer = "".join(
            part.get("text", "")
            for part in response.content
            if isinstance(part, dict)
        )

    else:
        answer = str(response.content)

    QueryHistory.objects.create(
        user=user,
        document=document,
        question=question,
        answer=answer,
        retrieved_chunks=[doc.metadata.get("chunk_id") for doc in docs]
    )

    return JsonResponse({
        "question": question,
        "answer": answer
    })