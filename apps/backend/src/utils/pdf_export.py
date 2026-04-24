"""Minimal PDF export for lesson plans and teaching notes."""
from __future__ import annotations

from io import BytesIO

from fpdf import FPDF


def text_to_pdf_bytes(title: str, sections: list[tuple[str, str]]) -> bytes:
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.multi_cell(0, 10, title)
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 11)
    for heading, body in sections:
        if heading:
            pdf.set_font("Helvetica", "B", 12)
            pdf.multi_cell(0, 8, heading)
            pdf.set_font("Helvetica", "", 11)
        text = (body or "").replace("\r\n", "\n")
        if text.strip():
            pdf.multi_cell(0, 6, text[:20000])
        pdf.ln(2)
    out = BytesIO()
    pdf.output(out)
    return out.getvalue()
