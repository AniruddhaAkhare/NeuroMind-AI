import os
import google.generativeai as genai
from flask import current_app

class GeminiService:
    def __init__(self):
        self.api_key = current_app.config.get("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash") # Use gemini-1.5-flash for faster generation
        else:
            self.model = None
            print("WARNING: GEMINI_API_KEY is not set.")

    def generate_clinical_narrative(self, patient_data, prediction_data, risk_level):
        """
        Generate a professional clinical narrative based on patient and prediction data.
        """
        if not self.model:
            return "Gemini API key is not configured. Unable to generate AI narrative."

        patient_info = (
            f"Patient Age/DOB: {patient_data.get('date_of_birth', 'Unknown')}\n"
            f"Gender: {patient_data.get('gender', 'Unknown')}\n"
            f"Primary Diagnosis: {patient_data.get('primary_diagnosis', 'Unknown')}"
        ) if patient_data else "Patient data not provided."

        prompt = f"""
        You are an expert neurologist AI assistant. Write a formal, concise clinical narrative 
        (1-2 paragraphs) for a patient's MRI scan report based on the following data.
        
        {patient_info}
        
        MRI AI Analysis Results:
        - Predicted Class: {prediction_data.get('predicted_class')}
        - Confidence: {prediction_data.get('confidence', 0) * 100:.2f}%
        - AI Risk Level: {risk_level}
        
        Guidelines:
        - Use professional, objective medical terminology.
        - Do not provide a definitive diagnosis (state that these are AI-assisted findings).
        - Suggest standard next steps based on the risk level.
        - Do NOT include any introductory or conversational text (like "Here is the narrative:"). Just output the narrative.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Gemini generation error: {e}")
            return f"Error generating narrative: {str(e)}"
            
    def answer_clinical_question(self, question, context_chunks=None):
        """
        Answer a clinical question, optionally using retrieved RAG context.
        """
        if not self.model:
            return "Gemini API key is not configured."
            
        context_str = ""
        if context_chunks:
            context_str = "Context from retrieved medical documents:\n"
            for i, chunk in enumerate(context_chunks):
                context_str += f"[{i+1}] {chunk}\n"
                
        prompt = f"""
        You are an expert medical AI assistant answering a clinical question.
        
        {context_str}
        
        Question: {question}
        
        Provide a clear, evidence-based answer. If using the provided context, synthesize the information appropriately. 
        If the context does not contain the answer, rely on your general medical knowledge but add a disclaimer that it is general knowledge.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Gemini generation error: {e}")
            return f"Error generating answer: {str(e)}"
