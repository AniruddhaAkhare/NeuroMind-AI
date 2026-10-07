import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Send, Bot, User, Loader2, BookOpen, 
  ShieldCheck, HelpCircle, AlertCircle, RefreshCw 
} from "lucide-react";
import { queryAssistant } from "../services/api";

export default function RAGAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello, I am the NeuroMind Clinical AI Assistant. I can assist with neurology research, Alzheimer's stage interpretation, caregiver protocols, and evidence-based complementary regimens. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const question = textToSend || input;
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await queryAssistant(question);
      const answer = res.answer || res.response || "No direct answer found in clinical knowledge base.";
      setMessages((prev) => [...prev, { sender: "ai", text: answer }]);
    } catch (err) {
      // Fallback response with expert clinical grounding
      let fallbackText = "I could not reach the remote RAG endpoint right now. However, based on standardized neurology consensus: ";
      if (question.toLowerCase().includes("ayurvedic") || question.toLowerCase().includes("herb")) {
        fallbackText += "Medhya Rasayana herbs such as Brahmi (Bacopa monnieri), Shankhpushpi, and Ashwagandha support cognitive vitality and stress resilience. Warm Brahmi oil scalp therapy (Shiroabhyanga) and an anti-inflammatory diet with walnuts, soaked almonds, and pure ghee are traditionally advised as supportive home care.";
      } else if (question.toLowerCase().includes("sundown") || question.toLowerCase().includes("wander")) {
        fallbackText += "Sundowning management includes stabilizing circadian rhythms through morning natural light exposure, consistent evening curfews, soft warm ambient lighting at dusk, and structured orientation boards with large clocks.";
      } else {
        fallbackText += "For Alzheimer's evaluation, volumetric axial MRI paired with Grad-CAM saliency highlights temporal lobe and hippocampal shrinkage. Consult your neurologist for clinical staging (CDR, MMSE) and tailored pharmacotherapy.";
      }
      setMessages((prev) => [...prev, { sender: "ai", text: fallbackText }]);
    } finally {
      setLoading(false);
    }
  };

  const presetChips = [
    "What are early signs of Mild Cognitive Impairment?",
    "How to manage sundowning & sleep disruption at home?",
    "Recommended Ayurvedic herbs & neuro-protective diet",
    "First-line medications: Donepezil & Memantine indications",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Clinical Intelligence Assistant</h1>
            <p className="text-xs text-slate-500">
              Grounded in WHO Alzheimer's guidelines, neuro-imaging literature, and clinical protocols
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Evidence-Based Guidance</span>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold uppercase shrink-0">Suggestions:</span>
        {presetChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-blue-500/50 hover:bg-blue-50/50 transition-all shrink-0 font-medium"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs min-h-[480px] max-h-[580px] overflow-y-auto space-y-5">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 border border-slate-200/80"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-600" />}
            </div>

            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[80%] ${
                m.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none shadow-xs"
                  : "bg-slate-50 border border-slate-200/70 text-slate-800 rounded-tl-none"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-slate-500 italic pl-1">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Consulting clinical literature & synthesizing findings...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl p-2 shadow-xs"
      >
        <input
          type="text"
          placeholder="Ask a question about dementia stages, imaging, caregiver safety, or Ayurvedic home care..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white transition-all shadow-sm shadow-blue-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
