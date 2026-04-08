DISEASE_RULES: list[dict] = [
    {
        "name": "ARVI (Tez-tez shamollash)",
        "description": "Yuqori nafas yo'llarining virusli kasalligi.",
        "recommendations": [
            "Ko'proq suyuqlik iching",
            "Dam oling",
            "Agar holat og'irlashsa shifokorga boring",
        ],
        "keywords": ["yotal", "yo'tal", "cough", "isitma", "fever", "burun", "runny nose", "tomoq"],
    },
    {
        "name": "Gripp (Influenza)",
        "description": "Influenza virusi sababli o'tkir respirator kasallik.",
        "recommendations": [
            "To'shak rejimida dam oling",
            "Suyuqlik ko'proq iching",
            "Shifokor tavsiyasiga amal qiling",
        ],
        "keywords": ["isitma", "fever", "charchoq", "fatigue", "bosh ogrigi", "headache", "mushak ogrigi"],
    },
    {
        "name": "Migren",
        "description": "Kuchli bosh og'rig'i bilan kechadigan nevrologik holat.",
        "recommendations": [
            "Qorong'i va tinch xonada dam oling",
            "Stressni kamaytiring",
            "Takrorlansa nevrologga murojaat qiling",
        ],
        "keywords": ["bosh ogrigi", "headache", "koz ogrigi", "dizziness", "yoruglikdan bezovtalik"],
    },
    {
        "name": "Gastrit",
        "description": "Oshqozon shilliq qavatining yallig'lanishi.",
        "recommendations": [
            "Yog'li va achchiq ovqatdan saqlaning",
            "Ovqatlanish tartibini yaxshilang",
            "Gastroenterolog bilan maslahat qiling",
        ],
        "keywords": ["qorin ogrigi", "stomach", "nausea", "kongil aynishi", "vomiting", "qayt qilish"],
    },
]
