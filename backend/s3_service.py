import os
import uuid
import boto3

from dotenv import load_dotenv

load_dotenv()

REGION = os.getenv("AWS_REGION")
VIDEO_BUCKET = os.getenv("VIDEO_BUCKET")
THUMBNAIL_BUCKET = os.getenv("THUMBNAIL_BUCKET")

s3 = boto3.client("s3", region_name=REGION)


def upload_file(file, bucket):
    extension = file.filename.split(".")[-1]

    filename = f"{uuid.uuid4()}.{extension}"

    s3.upload_fileobj(
        file.file,
        bucket,
        filename,
        ExtraArgs={"ContentType": file.content_type}
    )

    url = f"https://{bucket}.s3.{REGION}.amazonaws.com/{filename}"

    return url