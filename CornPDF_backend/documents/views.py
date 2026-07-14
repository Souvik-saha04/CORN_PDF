import os

import cloudinary.uploader

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Docs
from utils.firebase_auth import get_user_from_token


@api_view(["POST"])
def create_document(request):
    user, error = get_user_from_token(request)

    if error:
        return Response({"error": error}, status=status.HTTP_401_UNAUTHORIZED)

    uploaded_file = request.FILES.get("file")

    if not uploaded_file:
        return Response(
            {"error": "No file uploaded."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if uploaded_file.content_type != "application/pdf":
        return Response(
            {"error": "Only PDF files are allowed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if uploaded_file.size > 50 * 1024 * 1024:
        return Response(
            {"error": "Maximum file size is 50MB."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = None

    try:
        filename = os.path.splitext(uploaded_file.name)[0]

        result = cloudinary.uploader.upload(
            uploaded_file,
            resource_type="raw",
            folder=f"users/{user.firebase_uid}/documents",
            public_id=filename,
            overwrite=False,
        )

        doc = Docs.objects.create(
            user=user,
            file_name=uploaded_file.name,
            file_size=uploaded_file.size,
            file_url=result["secure_url"],
            public_id=result["public_id"],
            status="UPLOADED",
        )

        return Response(
            {
                "message": "Document uploaded successfully.",
                "document_id": doc.id,
                "file_name": doc.file_name,
                "file_url": doc.file_url,
                "status": doc.status,
            },
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:

        if result:
            try:
                cloudinary.uploader.destroy(
                    result["public_id"],
                    resource_type="raw",
                )
            except Exception:
                pass

        return Response(
            {
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def list_documents(request):
    user, error = get_user_from_token(request)

    if error:
        return Response({"error": error}, status=401)

    docs = Docs.objects.filter(user=user).order_by("-uploaded_at")

    data = [
        {
            "id": doc.id,
            "file_name": doc.file_name,
            "file_url": doc.file_url,
            "status": doc.status,
            "uploaded_at": doc.uploaded_at,
        }
        for doc in docs
    ]

    return Response(data)


@api_view(["GET"])
def retrieve_document(request, doc_id):
    user, error = get_user_from_token(request)

    if error:
        return Response({"error": error}, status=401)

    try:
        doc = Docs.objects.get(id=doc_id, user=user)

    except Docs.DoesNotExist:
        return Response({"error": "Document not found."}, status=404)

    return Response(
        {
            "id": doc.id,
            "file_name": doc.file_name,
            "file_size": doc.file_size,
            "file_url": doc.file_url,
            "public_id": doc.public_id,
            "status": doc.status,
            "uploaded_at": doc.uploaded_at,
        }
    )


@api_view(["DELETE"])
def delete_document(request, doc_id):
    user, error = get_user_from_token(request)

    if error:
        return Response({"error": error}, status=401)

    try:
        doc = Docs.objects.get(id=doc_id, user=user)

    except Docs.DoesNotExist:
        return Response({"error": "Document not found."}, status=404)

    try:
        cloudinary.uploader.destroy(
            doc.public_id,
            resource_type="raw",
        )
    except Exception:
        pass

    doc.delete()

    return Response(
        {"message": "Document deleted successfully."},
        status=status.HTTP_200_OK,
    )