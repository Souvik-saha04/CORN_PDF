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



def process_document(document):
    """
    Processes an uploaded PDF:
    - Downloads PDF from Cloudinary
    - Splits into chunks
    - Generates embeddings
    - Stores vectors in Pinecone
    """

    temp_pdf_path = None

    try:

        # -----------------------------
        # Update status
        # -----------------------------

        document.status = "PROCESSING"
        document.save()

        # -----------------------------
        # Download PDF
        # -----------------------------

        response = requests.get(
            document.file_url,
            timeout=30
        )

        if response.status_code != 200:
            raise Exception("Unable to download PDF from Cloudinary.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(response.content)
            temp_pdf_path = temp_pdf.name

        # -----------------------------
        # Load PDF
        # -----------------------------

        loader = PyPDFLoader(temp_pdf_path)
        pages = loader.load()
        if not pages:
            raise Exception("PDF contains no readable text.")

        # -----------------------------
        # Split into chunks
        # -----------------------------

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )

        all_texts = []
        all_metadatas = []
        vector_ids = []

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

                all_texts.append(chunk_text)

                all_metadatas.append(
                    {
                        "chunk_id": chunk.id,
                        "document_id": document.id,
                        "user_id": document.user.firebase_uid,
                        "page_number": page_number,
                        "file_name": document.file_name,
                        "text": chunk_text
                    }
                )

                vector_ids.append(
                    f"{document.id}_{chunk.id}"
                )

                chunk_index += 1

        # -----------------------------
        # Store in Pinecone
        # -----------------------------

        vectorstore = PineconeVectorStore(
            index=index,
            embedding=embeddings,
        )

        vectorstore.add_texts(
            texts=all_texts,
            metadatas=all_metadatas,
            ids=vector_ids,
        )

        # -----------------------------
        # Success
        # -----------------------------

        document.status = "READY"
        document.save()

        return True

    except Exception as e:

        document.status = "FAILED"
        document.save()

        raise e

    finally:

        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)