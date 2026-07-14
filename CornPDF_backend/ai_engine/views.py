from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from documents.models import Docs
from .models import Chunk,QueryHistory

from pinecone import Pinecone
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_community.document_loaders import PyPDFLoader
from langchain_google_genai import ChatGoogleGenerativeAI
import json
import os
from dotenv import load_dotenv

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
    model="gemini-1.5-flash",
    temperature=0.3,
    api_key=GEMINI_API_KEY
)


@csrf_exempt
def process_document(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    data = json.loads(request.body)
    document_id = data.get("document_id")

    try:
        document = Docs.objects.get(id=document_id)
    except Docs.DoesNotExist:
        return JsonResponse({"error": "Document not found"}, status=404)

    loader = PyPDFLoader(document.file.path)
    pages = loader.load()

    full_text = "\n".join([page.page_content for page in pages])

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    texts = splitter.split_text(full_text)

    chunks = []
    for i, chunk_text in enumerate(texts):
        chunk = Chunk.objects.create(
            document=document,
            content=chunk_text,
            chunk_index=i,
            page_number=None  
        )
        chunks.append(chunk)

    vectorstore = PineconeVectorStore(
        index=index,
        embedding=embeddings
    )

    vectorstore.add_texts(
        texts=[c.content for c in chunks],
        metadatas=[
            {
                "chunk_id": c.id,
                "document_id": document.id
            }
            for c in chunks
        ]
    )

    return JsonResponse({
        "message": "Document processed successfully",
        "chunks_created": len(chunks)
    })





@csrf_exempt
def ask_question(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    data = json.loads(request.body)
    question = data.get("question")
    document_id = data.get("document_id")

    if not question or not document_id:
        return JsonResponse({"error": "Missing fields"}, status=400)

    try:
        document = Docs.objects.get(id=document_id)
    except Docs.DoesNotExist:
        return JsonResponse({"error": "Document not found"}, status=404)

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

    context = "\n\n".join([doc.page_content for doc in docs])

    prompt = f"""
    Answer the question based ONLY on the context below.

    Context:
    {context}

    Question:
    {question}
    """

    response = llm.invoke(prompt)
    answer = response.content

    QueryHistory.objects.create(
        user=request.user if request.user.is_authenticated else None,
        document=document,
        question=question,
        answer=answer,
        retrieved_chunks=[doc.metadata.get("chunk_id") for doc in docs]
    )

    return JsonResponse({
        "question": question,
        "answer": answer
    })