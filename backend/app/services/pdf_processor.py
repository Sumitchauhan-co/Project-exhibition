import io
from typing import List

from PyPDF2 import PdfReader


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text content from PDF bytes."""
    pdf_file = io.BytesIO(file_bytes)
    reader = PdfReader(pdf_file)
    extracted_text = []

    for page in reader.pages:
        text = page.extract_text()
        if text:
            extracted_text.append(text)

    return "\n".join(extracted_text)


def chunk_text(
    text: str, strategy: str, chunk_size: int = 500, overlap: int = 50
) -> List[str]:
    """Applies chunking strategies to the extracted text."""
    if not text.strip():
        return ["Empty document."]

    if strategy == "Fixed-size (500)":
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end])
            start += chunk_size - overlap
        return chunks

    elif strategy == "Token-based":
        from langchain_text_splitters import TokenTextSplitter

        splitter = TokenTextSplitter(chunk_size=chunk_size, chunk_overlap=overlap)
        return splitter.split_text(text)

    elif strategy == "Semantic Paragraph":
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        return paragraphs if paragraphs else [text]

    elif strategy == "Recursive Character":
        # Simplified recursive fallback splitting by delimiters
        delimiters = ["\n\n", "\n", ". ", " "]
        chunks = [text]
        for delimiter in delimiters:
            new_chunks = []
            for chunk in chunks:
                if len(chunk) > chunk_size:
                    new_chunks.extend(chunk.split(delimiter))
                else:
                    new_chunks.append(chunk)
            chunks = new_chunks
            if all(len(c) <= chunk_size for c in chunks):
                break
        return [c.strip() for c in chunks if c.strip()]

    return [text]
