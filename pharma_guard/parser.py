def parse_vcf_file(filepath):
    """Parses VCF as plain text - safest for Hackathons."""
    TARGET_RSIDS = ["rs3892097", "rs12248560", "rs4244285", "rs1057910", "rs4149056", "rs1142345", "rs3918290"]
    found_variants = []
    try:
        with open(filepath, 'r') as f:
            for line in f:
                if line.startswith('#'): continue
                cols = line.strip().split('\t')
                if len(cols) < 5: continue
                rsid = cols[2]
                if rsid in TARGET_RSIDS:
                    # Extract genotype (usually in the 10th column)
                    gt = cols[9].split(':')[0] if len(cols) >= 10 else "./."
                    found_variants.append({
                        "rsid": rsid,
                        "genotype": gt,
                        "gene": "CYP2C19" if "rs4244285" in rsid else "Other", # Simplified for now
                        "chromosome": cols[0],
                        "position": cols[1]
                    })
        return found_variants
    except Exception as e:
        print(f"Parser Error: {e}")
        return []