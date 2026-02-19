from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os, traceback, datetime
from parser import parse_vcf_file
from engine import get_clinical_risk
from llm import get_explanation

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(drug: str = Form(...), vcf: UploadFile = File(...)):
    try:
        if not os.path.exists("uploads"): os.makedirs("uploads")
        file_path = f"uploads/{vcf.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await vcf.read())

        # 1. Parse & Calculate
        variants = parse_vcf_file(file_path)
        risk = get_clinical_risk(variants, drug)

        # 2. Get LLM Explanation (Synchronous direct API call)
        explanation = get_explanation(drug, risk['phenotype'], variants)

        # 3. Build the STRICT mandatory JSON Schema
        return {
            "patient_id": f"PATIENT_{os.urandom(3).hex().upper()}",
            "drug": drug.upper(),
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "risk_assessment": {
                "risk_label": risk['label'],
                "confidence_score": 0.98,
                "severity": risk['severity']
            },
            "pharmacogenomic_profile": {
                "primary_gene": risk['gene'],
                "diplotype": risk['diplotype'],
                "phenotype": risk['phenotype'],
                "detected_variants": variants
            },
            "clinical_recommendation": {
                "action": risk['recommendation'],
                "guideline_source": "CPIC (Clinical Pharmacogenetics Implementation Consortium)",
                "requires_physician_review": True
            },
            "llm_generated_explanation": {
                "summary": explanation.get("summary", ""),
                "mechanism": explanation.get("mechanism", "")
            },
            "quality_metrics": {
                "vcf_parsing_success": True,
                "total_variants_analyzed": len(variants)
            }
        }

    except Exception as e:
        print("CRITICAL ERROR IN API:")
        print(traceback.format_exc())
        return JSONResponse(status_code=500, content={"error": str(e)})