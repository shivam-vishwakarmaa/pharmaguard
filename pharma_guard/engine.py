def get_clinical_risk(variants, drug):
    drug = drug.upper()
    
    # Baseline normal response
    res = {
        "label": "Safe", 
        "severity": "none", 
        "phenotype": "NM", # Normal Metabolizer (Matches schema)
        "diplotype": "*1/*1",
        "gene": "Unknown",
        "recommendation": "Initiate therapy with standard starting dose."
    }
    
    if drug == "CLOPIDOGREL":
        res["gene"] = "CYP2C19"
        # Check for the *2 variant (rs4244285)
        v = next((v for v in variants if v['rsid'] == "rs4244285"), None)
        
        if v and "1" in v['genotype']: 
            res.update({
                "label": "Ineffective", 
                "severity": "high", 
                "phenotype": "PM", # Poor Metabolizer
                "diplotype": "*2/*2" if v['genotype'] == "1/1" else "*1/*2",
                "recommendation": "Avoid clopidogrel. Prescribe alternative antiplatelet therapy (e.g., Prasugrel or Ticagrelor) at standard dose."
            })
            if v['genotype'] == "0/1":
                res["phenotype"] = "IM" # Intermediate Metabolizer
                
    elif drug == "SIMVASTATIN":
        res["gene"] = "SLCO1B1"
        # Check for the *5 variant (rs4149056)
        v = next((v for v in variants if v['rsid'] == "rs4149056"), None)
        
        if v and "1" in v['genotype']:
            res.update({
                "label": "Toxic", 
                "severity": "moderate", 
                "phenotype": "PM", # Low Function
                "diplotype": "*5/*5" if v['genotype'] == "1/1" else "*1/*5",
                "recommendation": "Prescribe a lower dose (max 20mg) or consider an alternative statin (e.g., Rosuvastatin) to avoid myopathy."
            })
            
    return res