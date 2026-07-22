from .models import Chunk
import tempfile
import requests
from pinecone import Pinecone
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_community.document_loaders import PyPDFLoader
import os
from dotenv import load_dotenv
import traceback

load_dotenv()


def get_embeddings():
    gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("Gemini_API_Key")

    if not gemini_api_key:
        raise RuntimeError(
            "Missing Gemini API key. Set GEMINI_API_KEY (or Gemini_API_Key) in your environment."
        )

    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        api_key=gemini_api_key,
    )


def get_index():
    pinecone_api_key = os.getenv("PINECONE_SECRET")

    if not pinecone_api_key:
        raise RuntimeError("Missing Pinecone API key. Set PINECONE_SECRET in your environment.")

    pc = Pinecone(api_key=pinecone_api_key)
    return pc.Index("pdf-qna-3072")


def delete_document_vectors(document):
    try:
        index = get_index()
        chunks = Chunk.objects.filter(document=document)

        if chunks.exists():
            vector_ids = [f"{document.id}_{chunk.id}" for chunk in chunks]
            index.delete(ids=vector_ids)

        return True

    except Exception as e:
        print(f"Pinecone deletion failed: {e}")
        return False


def process_document(document):

    temp_pdf_path = None

    try:

        document.status = "PROCESSING"
        document.save()

        response = requests.get(
        document.file_url,
            stream=True,
            timeout=(30, 300)   # 30 sec connection timeout, 300 sec read timeout
        )

        response.raise_for_status()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:

            for chunk in response.iter_content(chunk_size=1024 * 1024):   # 1 MB chunks

                if chunk:
                    temp_pdf.write(chunk)

            temp_pdf_path = temp_pdf.name

        loader = PyPDFLoader(temp_pdf_path)

        pages = loader.lazy_load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )

        vectorstore = PineconeVectorStore(
            index=get_index(),
            embedding=get_embeddings(),
        )

        BATCH_SIZE = 100

        batch_texts = []
        batch_metadatas = []
        batch_ids = []

        chunk_index = 0

        for page_number, page in enumerate(pages, start=1):

            page_chunks = splitter.split_text(page.page_content)

            for chunk_text in page_chunks:

                if not chunk_text.strip():
                    continue

                chunk = Chunk.objects.create(
                    document=document,
                    content=chunk_text,
                    chunk_index=chunk_index,
                    page_number=page_number,
                )

                batch_texts.append(chunk_text)

                batch_metadatas.append({
                    "chunk_id": chunk.id,
                    "document_id": document.id,
                    "user_id": document.user.firebase_uid,
                    "page_number": page_number,
                    "file_name": document.file_name,
                })

                batch_ids.append(
                    f"{document.id}_{chunk.id}"
                )

                chunk_index += 1

                if len(batch_texts) == BATCH_SIZE:

                    vectorstore.add_texts(
                        texts=batch_texts,
                        metadatas=batch_metadatas,
                        ids=batch_ids,
                    )

                    batch_texts.clear()
                    batch_metadatas.clear()
                    batch_ids.clear()

        if batch_texts:

            vectorstore.add_texts(
                texts=batch_texts,
                metadatas=batch_metadatas,
                ids=batch_ids,
            )

        document.status = "READY"
        document.save()

        return True

    except Exception as e:

        document.status = "FAILED"
        document.save()
        traceback.print_exc()
        raise e

    finally:

        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)