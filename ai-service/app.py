from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
import torch
import json
import re

app = Flask(__name__)
CORS(app)

# Global variables for model
tokenizer = None
model = None
generator = None

def load_model():
    global tokenizer, model, generator
    try:
        print("Loading model...")
        # Use smaller, faster model
        model_name = "google/flan-t5-small"
        
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        
        # Create text generation pipeline with optimized settings
        generator = pipeline(
            "text2text-generation",
            model=model,
            tokenizer=tokenizer,
            max_length=256,  # Reduced for speed
            temperature=0.5,
            do_sample=True,
            num_beams=1      # Faster generation
        )
        print("Model loaded successfully!")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def generate_mcq_from_content(content, count, question_type, difficulty):
    """Generate MCQs using the local model"""
    try:
        questions = []
        
        # Check content type
        if 'MCQS_FOUND:' in content:
            print("Detected MCQs from website - generating similar questions")
            return generate_from_found_mcqs(content, count, question_type)
        elif 'VOCABULARY:' in content:
            print("Detected vocabulary from MCQs - generating questions")
            return generate_from_vocabulary(content, count, question_type)
        elif 'EXISTING_MCQS:' in content or ('Q:' in content and 'A:' in content):
            print("Detected existing MCQs in content - generating similar questions")
            return generate_from_existing_mcqs(content, count, question_type)
        
        # Regular content processing
        content_chunks = [content[i:i+500] for i in range(0, len(content), 500)]
        
        for i in range(count):
            chunk = content_chunks[i % len(content_chunks)]
            
            # Create simpler prompt for T5
            prompt = f"Generate a {question_type.lower()} question about: {chunk[:200]}"

            # Generate response
            try:
                response = generator(prompt, max_length=100, num_return_sequences=1)
                generated_text = response[0]['generated_text']
                
                # Create MCQ from generated question
                if generated_text and len(generated_text.strip()) > 10:
                    question_data = create_mcq_from_generated(generated_text, chunk, i+1)
                else:
                    question_data = create_fallback_mcq(chunk, i+1)
                    
                questions.append(question_data)
            except Exception as e:
                print(f"Generation failed for chunk {i}: {e}")
                question_data = create_fallback_mcq(chunk, i+1)
                questions.append(question_data)
        
        return questions
    
    except Exception as e:
        print(f"Generation error: {e}")
        # Fallback to content-based generation
        return generate_fallback_questions(content, count, question_type)

def generate_from_found_mcqs(content, count, question_type):
    """Generate MCQs from found website MCQs"""
    questions = []
    
    if 'MCQS_FOUND:' in content:
        mcq_section = content.split('MCQS_FOUND:')[1]
        
        # Extract questions and options
        if 'Questions:' in mcq_section and 'Options:' in mcq_section:
            parts = mcq_section.split('Options:')
            questions_part = parts[0].replace('Questions:', '').strip()
            options_part = parts[1].strip()
            
            # Get sample questions for patterns
            sample_questions = [q.strip() for q in questions_part.split('|') if q.strip()][:3]
            
            # Get vocabulary from options
            vocab_terms = [opt.strip() for opt in options_part.split('|') if opt.strip() and len(opt.strip()) > 2][:20]
            
            print(f"Found {len(sample_questions)} sample questions and {len(vocab_terms)} vocabulary terms")
            
            # Generate new questions using the vocabulary
            question_templates = [
                "What is the meaning of {}?",
                "Which of the following best describes {}?",
                "What is the opposite of {}?",
                "Which term is related to {}?",
                "What does {} refer to?"
            ]
            
            for i in range(count):
                if i < len(vocab_terms):
                    main_term = vocab_terms[i]
                    template = question_templates[i % len(question_templates)]
                    question = template.format(main_term)
                    
                    # Create options using other vocabulary
                    other_terms = [t for t in vocab_terms if t != main_term]
                    options = [main_term]  # Correct answer
                    
                    # Add 3 distractors
                    if len(other_terms) >= 3:
                        options.extend(other_terms[:3])
                    else:
                        options.extend(other_terms)
                        while len(options) < 4:
                            options.append(f"Alternative {len(options)}")
                    
                    questions.append({
                        "question": question,
                        "option_a": options[0],
                        "option_b": options[1],
                        "option_c": options[2],
                        "option_d": options[3],
                        "correct_option": options[0]
                    })
                else:
                    # Use sample questions as inspiration
                    if sample_questions:
                        base_q = sample_questions[i % len(sample_questions)]
                        # Modify slightly
                        if 'What is' in base_q:
                            new_q = base_q.replace('What is', 'What was')
                        elif 'Which' in base_q:
                            new_q = base_q.replace('Which', 'What')
                        else:
                            new_q = f"What is the main concept in: {base_q[:30]}...?"
                        
                        questions.append({
                            "question": new_q,
                            "option_a": "Primary concept",
                            "option_b": "Secondary concept",
                            "option_c": "Alternative concept",
                            "option_d": "Other concept",
                            "correct_option": "Primary concept"
                        })
    
    return questions

def generate_from_vocabulary(content, count, question_type):
    """Generate MCQs from vocabulary terms"""
    questions = []
    
    # Extract vocabulary terms
    if 'VOCABULARY:' in content:
        vocab_section = content.split('VOCABULARY:')[1]
        terms = [term.strip() for term in vocab_section.split('|') if term.strip()]
        
        # Clean terms
        clean_terms = []
        for term in terms:
            if (len(term) > 2 and 
                len(term) < 30 and 
                term.replace(' ', '').isalpha() and
                term.lower() not in ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all']):
                clean_terms.append(term.title())
        
        # Remove duplicates
        unique_terms = list(set(clean_terms))[:15]
        print(f"Using {len(unique_terms)} vocabulary terms: {unique_terms[:3]}...")
        
        # Generate questions
        templates = [
            "What is the meaning of {}?",
            "Which word is opposite to {}?", 
            "What does {} refer to?",
            "Which term is similar to {}?",
            "What is the definition of {}?"
        ]
        
        for i in range(count):
            if i < len(unique_terms):
                main_term = unique_terms[i]
                template = templates[i % len(templates)]
                question = template.format(main_term)
                
                # Create options
                other_terms = [t for t in unique_terms if t != main_term]
                options = [main_term]
                
                if len(other_terms) >= 3:
                    options.extend(other_terms[:3])
                else:
                    options.extend(other_terms)
                    while len(options) < 4:
                        options.append(f"Option {len(options)}")
                
                questions.append({
                    "question": question,
                    "option_a": options[0],
                    "option_b": options[1],
                    "option_c": options[2], 
                    "option_d": options[3],
                    "correct_option": options[0]
                })
            else:
                # Generate generic questions
                questions.append({
                    "question": f"What is a key concept in {question_type.lower()}?",
                    "option_a": "Primary concept",
                    "option_b": "Secondary concept",
                    "option_c": "Alternative concept",
                    "option_d": "Other concept",
                    "correct_option": "Primary concept"
                })
    
    return questions

def generate_from_existing_mcqs(content, count, question_type):
    """Generate new MCQs based on existing MCQ patterns"""
    questions = []
    
    # Extract existing questions and answers
    existing_questions = []
    all_terms = []
    
    # Parse the new format: Q: question | A: option1 | option2 | option3
    if 'EXISTING_MCQS:' in content:
        mcq_section = content.split('EXISTING_MCQS:')[1]
        mcq_pairs = mcq_section.split(' || ')
        
        for pair in mcq_pairs:
            if 'Q:' in pair and 'A:' in pair:
                q_part, a_part = pair.split(' | A: ', 1)
                question = q_part.replace('Q: ', '').strip()
                answers = a_part.split(' | ')
                
                existing_questions.append(question)
                all_terms.extend(answers)
    
    # Clean and filter terms more aggressively
    import re
    clean_terms = []
    stop_words = {
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'option',
        'answer', 'question', 'what', 'which', 'where', 'when', 'how', 'why',
        'submitted', 'areesha', 'khan', 'read', 'more', 'details', 'mcq', 'about',
        'this', 'that', 'with', 'from', 'they', 'been', 'have', 'their', 'said',
        'each', 'would', 'there', 'could', 'other'
    }
    
    for term in all_terms:
        # Remove special chars, numbers, extra spaces
        clean_term = re.sub(r'[^a-zA-Z\s]', '', term)
        clean_term = re.sub(r'\s+', ' ', clean_term).strip()
        
        # Split compound terms and take meaningful parts
        words = clean_term.lower().split()
        for word in words:
            if (len(word) > 3 and 
                word not in stop_words and 
                not word.isdigit() and
                word.isalpha()):
                clean_terms.append(word.capitalize())
    
    # Remove duplicates and sort by length (prefer longer terms)
    unique_terms = list(set(clean_terms))
    unique_terms.sort(key=len, reverse=True)
    unique_terms = unique_terms[:15]  # Take top 15 terms
    
    print(f"Extracted {len(unique_terms)} unique terms from MCQs")
    
    # Generate questions based on question type
    if question_type.lower() == 'mathematics':
        templates = [
            "What is the result of {}?",
            "Which formula involves {}?",
            "What is the value of {}?",
            "How do you calculate {}?",
            "What type of {} is this?"
        ]
    else:
        templates = [
            "What is {}?",
            "Which {} is correct?",
            "What does {} mean?",
            "Where is {} located?",
            "Who discovered {}?"
        ]
    
    # Generate new questions
    for i in range(count):
        if i < len(unique_terms):
            term = unique_terms[i]
            template = templates[i % len(templates)]
            question = template.format(term)
            
            # Create realistic options using other terms
            other_terms = [t for t in unique_terms if t != term]
            options = [term]
            
            # Add 3 more options
            if len(other_terms) >= 3:
                options.extend(other_terms[:3])
            else:
                options.extend(other_terms)
                while len(options) < 4:
                    options.append(f"Alternative {len(options)}")
            
            questions.append({
                "question": question,
                "option_a": options[0],
                "option_b": options[1],
                "option_c": options[2],
                "option_d": options[3],
                "correct_option": options[0]
            })
        else:
            # Generate from existing question patterns
            if existing_questions:
                base_q = existing_questions[i % len(existing_questions)]
                # Modify the question slightly
                modified_q = base_q.replace('What is', 'What was').replace('Which', 'What')
                questions.append({
                    "question": modified_q,
                    "option_a": "Primary answer",
                    "option_b": "Secondary answer",
                    "option_c": "Alternative answer",
                    "option_d": "Other answer",
                    "correct_option": "Primary answer"
                })
            else:
                questions.append(create_fallback_mcq(f"{question_type} concept {i}", i+1))
    
    return questions

def create_mcq_from_generated(generated_text, content_chunk, question_num):
    """Create MCQ from AI generated question"""
    # Clean the generated text
    question = generated_text.strip()
    if not question.endswith('?'):
        question += '?'
    
    # Extract clean key terms from content
    import re
    words = re.findall(r'\b[A-Za-z]{3,}\b', content_chunk)  # Only alphabetic words 3+ chars
    key_terms = [w for w in words if w.lower() not in ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'why']][:8]
    
    # Create realistic options
    if len(key_terms) >= 4:
        correct_answer = key_terms[0]
        options = [
            correct_answer,
            key_terms[1],
            key_terms[2], 
            key_terms[3]
        ]
    else:
        # Fallback with generic but clean options
        correct_answer = key_terms[0] if key_terms else "Primary concept"
        options = [
            correct_answer,
            "Alternative concept",
            "Different approach", 
            "Other method"
        ]
    
    return {
        "question": question,
        "option_a": options[0],
        "option_b": options[1],
        "option_c": options[2],
        "option_d": options[3],
        "correct_option": correct_answer
    }

def create_fallback_mcq(content_chunk, question_num):
    """Create fallback MCQ when AI generation fails"""
    # Extract first meaningful sentence
    sentences = content_chunk.split('.')[0:2]
    main_sentence = sentences[0].strip() if sentences else "content"
    
    return {
        "question": f"What does the content say about: {main_sentence[:60]}?",
        "option_a": "It provides detailed information",
        "option_b": "It briefly mentions it",
        "option_c": "It contradicts other sources", 
        "option_d": "It is not discussed",
        "correct_option": "It provides detailed information"
    }

def generate_fallback_questions(content, count, question_type):
    """Generate questions when model fails"""
    questions = []
    sentences = content.split('.')[0:count*2]  # Get more sentences
    
    for i in range(count):
        if i < len(sentences) and sentences[i].strip():
            sentence = sentences[i].strip()
            questions.append(create_fallback_mcq(sentence, i+1))
        else:
            # Generic fallback
            questions.append({
                "question": f"Question {i+1} about {question_type.lower()}",
                "option_a": "First option",
                "option_b": "Second option", 
                "option_c": "Third option",
                "option_d": "Fourth option",
                "correct_option": "First option"
            })
    
    return questions

@app.route('/generate', methods=['POST'])
def generate_questions():
    try:
        data = request.json
        content = data.get('content', '')
        count = int(data.get('count', 5))
        question_type = data.get('question_type', 'General Knowledge')
        difficulty = data.get('difficulty', 'Medium')
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        if not generator:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Generate questions
        questions = generate_mcq_from_content(content, count, question_type, difficulty)
        
        return jsonify({
            'success': True,
            'questions': questions,
            'count': len(questions)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': generator is not None
    })

if __name__ == '__main__':
    print("Starting AI Service...")
    if load_model():
        print("AI Service ready on port 5000")
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        print("Failed to load model. Exiting...")