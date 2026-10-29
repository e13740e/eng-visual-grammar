# -*- coding: utf-8 -*-
"""
Parser for Grammatical_forms_15.02.26.txt to JSON.
Structures the English grammar hypercube of 192/204 states.
"""

import json
import re

def clean_text(text):
    if not text:
        return ""
    # Strip whitespace
    text = text.strip()
    # Remove markdown bold/italic tags if any
    text = re.sub(r'\*\*|\*', '', text)
    # Unescape slashes if any
    text = text.replace("\\'", "'").replace('\\"', '"')
    return text

def parse_txt_to_json(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Define aspect and time indices in the grid columns
    columns_mapping = {
        "Simple": {
            "Present": 5,
            "Past": 6,
            "Future": 7,
            "Future in the Past": 8
        },
        "Continuous": {
            "Present": 10,
            "Past": 11,
            "Future": 12,
            "Future in the Past": 13
        },
        "Perfect": {
            "Present": 15,
            "Past": 16,
            "Future": 17,
            "Future in the Past": 18
        },
        "Perfect Continuous": {
            "Present": 20,
            "Past": 21,
            "Future": 22,
            "Future in the Past": 23
        }
    }

    # Sentence types order
    sentence_types = [
        "Affirmative",
        "Negative full (not)",
        "Negative contracted (n't)",
        "Interrogative about Affirmative",
        "Interrogative about Negative full (not)",
        "Interrogative about Negative contracted (n't)"
    ]

    # Initialize nested structure
    db = {
        "Active Voice": {
            "Standard Verb": {},
            "to be": {}
        },
        "Passive Voice": {
            "Standard Verb": {}
        }
    }

    # Helper to populate the nested dictionary
    def set_formula(voice, verb_type, aspect, time, sentence_type, key, value):
        if aspect not in db[voice][verb_type]:
            db[voice][verb_type][aspect] = {}
        if time not in db[voice][verb_type][aspect]:
            db[voice][verb_type][aspect][time] = {}
        if sentence_type not in db[voice][verb_type][aspect][time]:
            db[voice][verb_type][aspect][time][sentence_type] = {}
        db[voice][verb_type][aspect][time][sentence_type][key] = value

    # We will process three blocks of lines:
    # 1. Active Voice Standard Verb: Lines 10 to 33 (1-based indices)
    # 2. Active Voice 'to be': Lines 38 to 61 (1-based indices)
    # 3. Passive Voice Standard Verb: Lines 66 to 89 (1-based indices)

    sections = [
        {"voice": "Active Voice", "verb_type": "Standard Verb", "start": 10, "end": 33},
        {"voice": "Active Voice", "verb_type": "to be", "start": 38, "end": 61},
        {"voice": "Passive Voice", "verb_type": "Standard Verb", "start": 66, "end": 89}
    ]

    for section in sections:
        voice = section["voice"]
        verb_type = section["verb_type"]
        start_line = section["start"]
        end_line = section["end"]

        # Loop through formula-notes pairs (each takes 4 lines total: 1 formula line, 1 separator, 1 note line, 1 separator)
        current_sentence_idx = 0
        for line_idx in range(start_line, end_line + 1, 4):
            if current_sentence_idx >= len(sentence_types):
                break
            sent_type = sentence_types[current_sentence_idx]
            current_sentence_idx += 1

            # Get formula line and notes line
            f_line = lines[line_idx - 1]
            n_line = lines[line_idx + 1]

            f_parts = [p.strip() for p in f_line.split('|')]
            n_parts = [p.strip() for p in n_line.split('|')]

            # Extract formulas and notes for each aspect and time
            for aspect, times in columns_mapping.items():
                for time, col_idx in times.items():
                    # Check if index exists in this row
                    formula_val = ""
                    note_val = ""
                    if col_idx < len(f_parts):
                        formula_val = clean_text(f_parts[col_idx])
                    if col_idx < len(n_parts):
                        note_val = clean_text(n_parts[col_idx])

                    # Only store if there is actually a formula (or if standard verb, keep all)
                    # For 'to be' exception, only Simple Present and Simple Past have entries.
                    if formula_val or verb_type == "Standard Verb":
                        set_formula(voice, verb_type, aspect, time, sent_type, "formula", formula_val)
                        set_formula(voice, verb_type, aspect, time, sent_type, "notes", note_val)

    # Save to file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

    print(f"Successfully parsed and written to {output_path}")

if __name__ == "__main__":
    parse_txt_to_json(
        r'd:\02_W\06_Python\11_ENG_visu_grammar\Grammatical_forms_15.02.26.txt',
        r'd:\02_W\06_Python\11_ENG_visu_grammar\grammar_data.json'
    )
