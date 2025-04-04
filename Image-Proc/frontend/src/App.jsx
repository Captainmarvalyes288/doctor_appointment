import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your medical assistant. How can I help you today?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'scan' or 'chat'
  const chatEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
      
      // Reset analysis
      setAnalysis('');
    }
  };

  // Upload and analyze scan
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/api/analyze-scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to analyze scan: ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      
      // Add system message to chat about the scan
      setChatMessages(prevMessages => [
        ...prevMessages,
        { 
          role: 'system', 
          content: 'I\'ve analyzed your scan. Feel free to ask me any questions about the results.' 
        }
      ]);
      
      // Switch to chat tab after analysis
      setActiveTab('chat');
    } catch (error) {
      console.error('Error:', error);
      alert('Error analyzing scan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Extract key insights from analysis text
  const extractKeyInsights = (analysisText) => {
    // This is a simple extraction method - could be improved with more sophisticated NLP
    if (!analysisText) return [];
    
    const possibleInsights = [
      { keyword: "visible", label: "Visibility" },
      { keyword: "structure", label: "Structure" },
      { keyword: "normal", label: "Normal Findings" },
      { keyword: "abnormal", label: "Abnormal Findings" },
      { keyword: "contrast", label: "Contrast" },
      { keyword: "density", label: "Density" },
      { keyword: "tissue", label: "Tissue" },
      { keyword: "bones", label: "Bone Structure" },
      { keyword: "organ", label: "Organ" },
      { keyword: "brain", label: "Brain" },
      { keyword: "lung", label: "Lungs" },
      { keyword: "heart", label: "Heart" },
      { keyword: "image quality", label: "Image Quality" }
    ];
    
    // Find sentences containing insight keywords
    const insights = [];
    const sentences = analysisText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    possibleInsights.forEach(({ keyword, label }) => {
      const matchingSentences = sentences.filter(s => 
        s.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matchingSentences.length > 0) {
        insights.push({
          label,
          text: matchingSentences[0].trim() + '.'
        });
      }
    });
    
    return insights.slice(0, 5); // Limit to top 5 insights
  };

  // Format analysis text to highlight key terms
  const formatAnalysisText = (text) => {
    if (!text) return '';
    
    // Medical terms to highlight
    const medicalTerms = [
      'normal', 'abnormal', 'visible', 'structure', 'contrast', 'density',
      'tissue', 'bones', 'organ', 'brain', 'lung', 'heart', 'CT', 'MRI',
      'scan', 'image', 'medical', 'diagnosis', 'healthcare', 'professional',
      'consult', 'advice'
    ];
    
    // Create a regex pattern for highlighting
    const pattern = new RegExp(`\\b(${medicalTerms.join('|')})\\b`, 'gi');
    
    // Replace terms in the text with highlighted versions
    let highlightedText = text.replace(pattern, '<span class="highlight-term">$1</span>');
    
    return highlightedText;
  };

  // Send message to chat
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = { role: 'user', content: currentMessage };
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setChatLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage].filter(msg => msg.role !== 'system').map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get response: ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error:', error);
      setChatMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error processing your request. Please try again later.' 
        }
      ]);
    } finally {
      setChatLoading(false);
      scrollToBottom();
    }
  };

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Focus input when chat tab is activated
  useEffect(() => {
    if (activeTab === 'chat') {
      messageInputRef.current?.focus();
    }
  }, [activeTab]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Get key insights
  const insights = extractKeyInsights(analysis);

  return (
    <div className="app-container">
      <header>
        <h1>Medical AI Assistant</h1>
        <p>Get insights from your medical scans and chat with our AI assistant</p>
        
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M20.4 14.5L16 10L4 20" />
            </svg>
            Scan Analysis
          </button>
          <button 
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Chat
          </button>
        </div>
      </header>

      <div className="main-content">
        {activeTab === 'scan' ? (
          <div className="scan-container">
            <div className="upload-section">
              <h2>Upload Medical Scan</h2>
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  accept="image/*"
                  id="scan-upload"
                />
                <label htmlFor="scan-upload" className="upload-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Choose File
                </label>
                <span className="file-name">{selectedFile ? selectedFile.name : 'No file chosen'}</span>
              </div>

              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Scan preview" />
                </div>
              )}

              <button 
                onClick={handleUpload} 
                disabled={!selectedFile || loading}
                className="analyze-button"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span> Analyzing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12h6M18 12h4" />
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 9v6M15 12h-3" />
                    </svg>
                    Analyze Scan
                  </>
                )}
              </button>
            </div>

            {analysis && (
              <div className="analysis-container">
                <div className="analysis-section">
                  <h2>Analysis Results</h2>
                  <div className="analysis-content-formatted">
                    <div className="markdown-content">
                      <ReactMarkdown>
                        {analysis}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  <button 
                    className="discuss-button"
                    onClick={() => setActiveTab('chat')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Discuss Results with AI
                  </button>
                </div>
                
                <div className="insights-section">
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    Key Insights
                  </h3>
                  {insights.length > 0 ? (
                    <div className="insights-list">
                      {insights.map((insight, index) => (
                        <div key={index} className="insight-item">
                          <div className="insight-label">{insight.label}</div>
                          <div className="insight-text">{insight.text}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-insights">
                      No key insights extracted. Please check the full analysis.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="chat-container">
            <div className="chat-sidebar">
              {analysis && previewUrl && (
                <div className="chat-scan-preview">
                  <h3>Scan Preview</h3>
                  <div className="chat-image-preview">
                    <img src={previewUrl} alt="Scan" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="chat-section">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Chat with Medical AI Assistant
              </h2>
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message ${
                      msg.role === 'user' 
                        ? 'user-message' 
                        : msg.role === 'system' 
                          ? 'system-message' 
                          : 'assistant-message'
                    }`}
                  >
                    {msg.role !== 'system' && (
                      <div className="message-avatar">
                        {msg.role === 'user' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                          </svg>
                        )}
                      </div>
                    )}
                    <div className="message-content">
                      <div className="markdown-content">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="message assistant-message">
                    <div className="message-avatar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <div className="chat-input">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type your medical question here..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={chatLoading}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={chatLoading || !currentMessage.trim()}
                  className="send-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer>
        <div className="disclaimer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>IMPORTANT: This application provides general information only and is not a substitute for professional medical advice. Always consult with qualified healthcare providers for diagnosis and treatment.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;