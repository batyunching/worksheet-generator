import React, { useState, useEffect, useRef } from 'react';
import { Settings, Printer, Copy, Loader2, Key, BookOpen, AlertCircle, CheckCircle2, Download, ChevronDown } from 'lucide-react';

const grammarList = [
  "1-1：形容詞比較級、形容詞原級比較、所有格代名詞",
  "1-2：形容詞最高級、連綴動詞",
  "1-3：情態副詞、副詞比較級、副詞最高級",
  "1-4：授與動詞、使役動詞",
  "1-5：不定代名詞、代名詞 one / ones、連接詞 although 與 if 的用法",
  "1-6：感官動詞、that 引導的名詞子句",
  "2-1：be 動詞過去式、規則動詞過去式、以疑問詞 What 為首的問句與答句",
  "2-2：疑問詞 Why、不規則動詞過去式、連接詞 because 和 so 的用法",
  "2-3：過去進行式、連接詞 when / while / before / after 的用法、時間的讀法",
  "2-4：不定詞當受詞、動名詞當受詞、動名詞當主詞、it當虛主詞",
  "2-5：spend、take、cost、pay 表示花費時間 / 金錢的用法",
  "2-6：未來式、反身代名詞",
  "3-1：第一、二人稱及第三人稱複數直述句、助動詞 do 的疑問句及其答句、疑問詞 What 起首的問句及其答句、What day 問星期",
  "3-2：第三人稱單數直述句、助動詞 does 的疑問句及其答句、疑問詞 what 起首的問句及其答句、天氣的問法及其答句",
  "3-3：What's the date 問日期、疑問詞 When 起首的問句及其答句",
  "3-4：How many ... ? 問數量及其答句、How much ... ? 問不可數之數量及其答句、Which 的問句及其答句",
  "3-5：頻率副詞、How often ... ? 的問句及其答句",
  "3-6：疑問詞 how 問路的用法及其答句、疑問詞 how 問交通工具的用法及其答句",
  "4-1starter：人稱代名詞主格、所有格和受格、用 What 詢問姓名或電話號碼",
  "4-2：be 動詞基本句型、be 動詞搭配形容詞、指示代名詞、名詞單複數",
  "4-3：用疑問詞 Who 詢問身分或關係、Where ... from? 問句與答句、How old ...? 問句與答句",
  "4-4：祈使句",
  "4-5：用疑問詞 Where 詢問位置、There is / are ... 問句與答句",
  "4-6：現在進行式、What time ...? 問句與答句",
  "4-7：助動詞 can 問句與答句",
  "5-1：現在完成式",
  "5-2：被動語態",
  "5-3：過去分詞 / 現在分詞當形容詞、that 引導的名詞子句",
  "5-4：wh- 名詞子句、wh- 名詞片語、whether / if 引導的名詞子句",
  "5-5：介系詞片語後位修飾、關係子句 (一)：關係代名詞當主詞的形容詞子句",
  "5-6：關係子句 (二)：關係代名詞當受詞的形容詞子句、關係子句 (三)：關係代名詞所有格 whose",
  "6-1：附加問句、both ... and ...、not only ... but also ...、either ... or ...、neither ... nor ...",
  "6-2：too ... to ...、so ... that ...、附和句、when / while ...",
  "6-3：複習現在完成式、複習比較級與最高級、複習被動語態",
  "6-4：複習名詞子句、複習副詞子句、複習形容詞子句"
];

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [worksheetData, setWorksheetData] = useState(null);
  
  const printRef = useRef(null);
  const grammarDropdownRef = useRef(null);

  // 基礎設定
  const [grade, setGrade] = useState('國二'); 
  const [cefrLevel, setCefrLevel] = useState('A1'); 
  const [topic, setTopic] = useState('過度觀光生態超負荷');
  
  // 主文設定
  const [format, setFormat] = useState('對話 Dialogue');
  const [textLength, setTextLength] = useState('中: 12~16句'); 
  const [vocabCount, setVocabCount] = useState(8);
  const [phraseCount, setPhraseCount] = useState(2);
  
  // 課後練習題數
  const [tfCount, setTfCount] = useState(3);
  const [fibCount, setFibCount] = useState(4);
  const [mcCount, setMcCount] = useState(3);

  // V17: 延伸閱讀設定
  const [extReadingLength, setExtReadingLength] = useState('100~150字');
  const [extReadingQCount, setExtReadingQCount] = useState(3);
  const [extReadingQLang, setExtReadingQLang] = useState('中文');

  // V17: 文法複選狀態
  const [selectedGrammars, setSelectedGrammars] = useState([]);
  const [isGrammarOpen, setIsGrammarOpen] = useState(false);

  const isDialogue = format === '對話 Dialogue';
  const lengthOptions = isDialogue
    ? ['短: 8~12句', '中: 12~16句', '長: 17~20句']
    : ['短: 50~100字', '中: 100~150字', '長: 150~200字'];

  useEffect(() => {
    if (isDialogue && textLength.includes('字')) {
      setTextLength('中: 12~16句');
    } else if (!isDialogue && textLength.includes('句')) {
      setTextLength('中: 100~150字');
    }
  }, [format, isDialogue, textLength]);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);

    // 處理點擊外部關閉文法選單
    const handleClickOutside = (event) => {
      if (grammarDropdownRef.current && !grammarDropdownRef.current.contains(event.target)) {
        setIsGrammarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4500);
  };

  const handleApiKeyChange = (e) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const toggleGrammar = (grammar) => {
    setSelectedGrammars(prev => 
      prev.includes(grammar) ? prev.filter(g => g !== grammar) : [...prev, grammar]
    );
  };

  const copyToClipboard = () => {
    if (!printRef.current) return;
    const range = document.createRange();
    range.selectNode(printRef.current);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
      document.execCommand('copy');
      showToast('✅ 已成功複製講義！請打開 Word 貼上 (Ctrl+V 或 Cmd+V)。');
    } catch (err) {
      setError('複製失敗，您的瀏覽器可能不支援，請嘗試手動反白複製。');
    }
    selection.removeAllRanges();
  };

  const executePDFDownload = () => {
    showToast('⏳ 正在轉換高畫質 PDF，請稍候幾秒鐘...');
    const element = printRef.current;
    const opt = {
      margin:       [12, 12, 12, 12], 
      filename:     `${topic}_跨域講義.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    window.html2pdf().set(opt).from(element).save().then(() => {
      showToast('✅ PDF 檔案下載完成！');
    }).catch(err => {
      setError('PDF 產生失敗，請改用「複製供 Word 貼上」功能。');
    });
  };

  const handleDownloadPDF = () => {
    if (!printRef.current) return;
    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = executePDFDownload;
      document.body.appendChild(script);
    } else {
      executePDFDownload();
    }
  };

  const handlePrint = () => {
    showToast('🖨️ 正在啟動列印... (若無反應將自動下載 PDF)');
    setTimeout(() => {
      try {
        const result = document.execCommand('print', false, null);
        if (!result) window.print();
      } catch (e) {
        window.print();
      }
      setTimeout(() => {
        if (!document.hidden) handleDownloadPDF();
      }, 1500);
    }, 150);
  };

  const renderArray = (data, renderFn) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <div className="text-gray-400 italic text-xs py-1">（此區塊未生成）</div>;
    }
    return data.map(renderFn);
  };

  const renderText = (textOrArray) => {
    if (!textOrArray || textOrArray === '') {
      return <div className="text-gray-400 italic py-2">（此區塊未生成）</div>;
    }
    let lines = Array.isArray(textOrArray) ? textOrArray : textOrArray.split('\n');
    return lines.map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-2"></div>;
      return <div key={i} className="mb-2 leading-relaxed" contentEditable suppressContentEditableWarning>{line}</div>;
    });
  };

  const generateWorksheet = async () => {
    if (!apiKey) return setError('請先輸入您的 Google Gemini API Key。');
    if (!topic.trim()) return setError('請輸入核心主題。');

    setIsLoading(true);
    setError('');
    setWorksheetData(null);

    const systemPrompt = `你是一位專業的台灣國中英語教師與跨領域教材設計專家。
請根據使用者的設定產出一份中英文跨領域學習單。

【生死攸關的防當機規定，違反將導致系統崩潰】
1. 輸出必須是合法的 JSON 格式。
2. 【絕對禁止】在生成的任何文字內容、句子、選項中使用半形雙引號 (")！如果你需要用到引號，請一律使用單引號 (') 或全形中文引號 (「」)。
3. 字串中【絕對不可】包含真實的換行符號 (Enter鍵)，如需換行請輸入「\\n」。
4. 所有陣列與屬性都必須填滿真實內容，不可留空或隨便敷衍。

【JSON 結構規定】
{
  "title": "學習單的創意標題",
  "part1": {
    "subtitle_en": "Part 1 英文副標",
    "subtitle_zh": "Part 1 中文副標",
    "vocabularies": [ { "word": "單字1", "zh": "中文1", "example_en": "英文例句", "example_zh": "例句翻譯" } ],
    "phrases": [ { "phrase": "片語1", "zh": "中文1", "example_en": "英文例句", "example_zh": "例句翻譯" } ],
    "main_text": "第一部分的課文內容。\\n若是對話請清楚標示人名。\\n可使用 \\n 換行。"
  },
  "part2": {
    "subtitle_en": "Part 2 英文副標",
    "subtitle_zh": "Part 2 中文副標",
    "vocabularies": [ ...與上面相同格式... ],
    "phrases": [ ...與上面相同格式... ],
    "main_text": "第二部分的課文內容。"
  },
  "part3": {
    "translation_part1": "第一部分課文的完整中文翻譯。",
    "translation_part2": "第二部分課文的完整中文翻譯。"
  },
  "part4": {
    "true_false": [ { "question": "英文是非題 1", "answer": "T" } ],
    "fill_in_blanks": {
      "word_bank": ["apple", "banana"],
      "questions": [ { "question": "I have an ___.", "answer": "apple" } ]
    },
    "multiple_choice": [
      { "question": "英文選擇題 1", "options": ["選項A", "選項B", "選項C", "選項D"], "answer": "A" }
    ]
  },
  "part5": {
    "title_en": "延伸閱讀英文標題",
    "title_zh": "延伸閱讀中文標題",
    "paragraphs": [ { "en": "英文第一段...", "zh": "中文第一段翻譯..." } ],
    "critical_thinking": [ "思考題一(依指定語言撰寫)？" ]
  }
}`;

    const grammarInstruction = selectedGrammars.length > 0 
      ? `- 核心文法：嚴格要求在此學習單的 Part 1 與 Part 2 主文 (main_text) 中，必須自然地融入以下文法句型：【${selectedGrammars.join('、')}】！` 
      : `- 核心文法：無特定限制，請依循該年級的一般文法難度撰寫。`;

    const lengthInstruction = isDialogue
      ? `Part 1 與 Part 2 內文長度：【每個 Part】皆須獨立並嚴格控制在「${textLength}」。（1個角色說一句話算1句）。`
      : `Part 1 與 Part 2 內文長度：【每個 Part】皆須獨立並嚴格控制在「${textLength}」。`;

    // V17: 組合更精確的要求
    const userQueryBase = `請開始製作講義！
條件如下：
- 適用對象：${grade}
- 內文程度：嚴格符合 CEFR 【${cefrLevel}】 等級。
${grammarInstruction}
- 核心主題：${topic}
- 課文形式：${format}
- ${lengthInstruction}

【產出數量要求】
- 單字數量：Part 1 與 Part 2 各需生成 ${vocabCount} 個單字。
- 片語數量：Part 1 與 Part 2 各需生成 ${phraseCount} 個片語。
- 測驗題數：是非題 ${tfCount} 題、填空題 ${fibCount} 題、選擇題 ${mcCount} 題。

【Part 5 延伸閱讀專屬要求】
- 延伸閱讀字數：嚴格控制在【${extReadingLength}】左右。
- 批判性思考題數：嚴格生成【${extReadingQCount}】題。
- 批判性思考語言：題目必須使用【${extReadingQLang}】撰寫。

【選擇題防呆要求】
- 選擇題的 options 陣列中，【只填寫純文字】，絕對不要加上 (A)、(B)、A.、B. 等編號標籤！系統會自動產生編號。`;

    let attempts = 0;
    const maxRetries = 3; 
    let finalParsedData = null;
    let currentQuery = userQueryBase;

    while (attempts <= maxRetries) {
      try {
        if (attempts > 0) {
          showToast(`格式稍有偏差，系統正在自動為您糾錯並重新生成 (${attempts}/${maxRetries})...`);
          currentQuery = userQueryBase + `\n\n【系統嚴重警告：上一次生成失敗！】\n失敗原因：JSON 解析錯誤 (通常是因為你在字串中使用了未跳脫的半形雙引號 \")。\n請務必修正：所有字串內部的引號請【全部替換為單引號 (') 或全形中文引號 (「」)】，並確保輸出合法的 JSON。`;
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: currentQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature: 0.7 + (attempts * 0.1), 
              maxOutputTokens: 8192,
              responseMimeType: "application/json",
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'API 請求失敗，請檢查金鑰。');
        }

        const result = await response.json();
        let textResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textResponse) throw new Error('AI 回傳的內容為空。');

        let cleanText = textResponse.replace(/^```(json)?\n?/i, '').replace(/```$/i, '').trim();
        finalParsedData = JSON.parse(cleanText);
        break; 
        
      } catch (err) {
        console.warn(`第 ${attempts + 1} 次生成或解析失敗:`, err);
        attempts++;
        if (attempts > maxRetries) {
          setError(`生成失敗：AI 產出的格式持續異常。這通常是因為字串中包含了無法解析的特殊符號。請嘗試更換「核心主題」再試一次！`);
          setIsLoading(false);
          return;
        }
      }
    }

    if (finalParsedData) {
      setWorksheetData(finalParsedData);
      showToast('🎉 V17 講義生成成功！點擊畫面右側文字可直接修改。');
    }
    setIsLoading(false);
  };

  const BoxTitle = ({ children }) => (
    <div className="inline-block border border-blue-800 text-blue-900 font-bold px-1 py-0.5 text-sm mb-2 shadow-sm" contentEditable suppressContentEditableWarning>
      {children}
    </div>
  );

  const actualTfCount = Array.isArray(worksheetData?.part4?.true_false) ? worksheetData.part4.true_false.length : 0;
  const actualFibCount = Array.isArray(worksheetData?.part4?.fill_in_blanks?.questions) ? worksheetData.part4.fill_in_blanks.questions.length : 0;

  // 整理選取的文法標籤 (用於講義表頭顯示)
  const grammarLabels = selectedGrammars.map(g => g.split('：')[0]).join(', ');

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans overflow-hidden print:bg-white relative">
      
      {toast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-fade-in no-print">
          <CheckCircle2 size={18} className="text-green-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; border: none; background: white; }
          @page { margin: 12mm; size: A4 portrait; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .print-flex-row { display: flex !important; flex-direction: row !important; }
        }
        [contenteditable]:focus { outline: 2px dashed #4ade80; background-color: #f0fdf4; border-radius: 2px; transition: all 0.2s; }
        /* 隱藏原生捲軸 */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
      `}</style>

      {/* 左側設定面板 */}
      <div className="w-full md:w-[380px] h-auto md:h-full flex-shrink-0 bg-white border-b md:border-r shadow-lg flex flex-col no-print z-10 max-h-[60vh] md:max-h-full">
        
        <div className="p-4 border-b bg-blue-700 text-white flex flex-col justify-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={22} />
            跨域講義生成器 <span className="text-xs bg-blue-900 border border-blue-500 px-2 py-0.5 rounded shadow-sm">V17</span>
          </h1>
          <p className="text-blue-100 text-sm mt-1">專業版 - 文法複選與進階延伸閱讀</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 custom-scrollbar">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <Key size={14} /> 系統金鑰
            </label>
            <input 
              type="password" 
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="貼上 Gemini API Key..."
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            />
          </div>

          {/* 基礎設定 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">適用對象</label>
              <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option>國一</option><option>國二</option><option>國三</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">CEFR 程度</label>
              <select value={cefrLevel} onChange={e => setCefrLevel(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option>preA1 - 入門級</option><option>A1</option><option>A1~A2之間</option><option>A2</option><option>B1</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">核心主題 (跨域情境)</label>
            <input 
              type="text" 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="例如：過度觀光生態超負荷"
              className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* V17: 文法複選選單 */}
          <div className="space-y-1 relative" ref={grammarDropdownRef}>
            <label className="text-sm font-bold text-gray-700 flex justify-between">
              <span>指定文法句型 (可複選)</span>
              {selectedGrammars.length > 0 && (
                <button onClick={() => setSelectedGrammars([])} className="text-xs text-blue-600 hover:text-blue-800 font-normal">清除全部</button>
              )}
            </label>
            <div 
              className="w-full p-2 border rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer flex justify-between items-center"
              onClick={() => setIsGrammarOpen(!isGrammarOpen)}
            >
              <span className="truncate text-gray-700">
                {selectedGrammars.length === 0 ? "未指定 (自由發揮)" : `已選 ${selectedGrammars.length} 項：${grammarLabels}`}
              </span>
              <ChevronDown size={16} className={`transition-transform ${isGrammarOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isGrammarOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-56 overflow-y-auto custom-scrollbar">
                {grammarList.map((g, idx) => (
                  <label key={idx} className="flex items-start px-3 py-2.5 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-0">
                    <input
                      type="checkbox"
                      checked={selectedGrammars.includes(g)}
                      onChange={() => toggleGrammar(g)}
                      className="mt-1 mr-2.5 flex-shrink-0 cursor-pointer rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{g}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">主文形式</label>
              <select value={format} onChange={e => setFormat(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option>對話 Dialogue</option>
                <option>文章 Article</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">主文句數 (每單元)</label>
              <select value={textLength} onChange={e => setTextLength(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                {lengthOptions.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* V17: 延伸閱讀獨立設定 */}
          <div className="pt-2">
            <div className="text-orange-600 font-bold border-b border-orange-200 pb-1 mb-3 text-sm">Part 5 延伸閱讀設定</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">延伸閱讀字數</label>
                <select value={extReadingLength} onChange={e => setExtReadingLength(e.target.value)} className="w-full p-1.5 border rounded-md text-sm bg-white outline-none">
                  <option>50~100字</option>
                  <option>100~150字</option>
                  <option>150~200字</option>
                  <option>200~250字</option>
                  <option>250~300字</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">出題語言</label>
                <select value={extReadingQLang} onChange={e => setExtReadingQLang(e.target.value)} className="w-full p-1.5 border rounded-md text-sm bg-white outline-none">
                  <option>英文</option>
                  <option>中文</option>
                  <option>中英文並陳</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">思考題數 (1~10題)</label>
              <input type="number" min="1" max="10" value={extReadingQCount} onChange={e => setExtReadingQCount(e.target.value)} className="w-full p-1.5 border rounded-md text-sm" />
            </div>
          </div>

          <div className="pt-2">
            <div className="text-blue-700 font-bold border-b border-blue-200 pb-1 mb-3 text-sm">講義內容與習題數</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="space-y-1">
                <label className="text-[11px] md:text-xs font-bold text-gray-600">單字數/篇</label>
                <input type="number" min="2" max="15" value={vocabCount} onChange={e => setVocabCount(e.target.value)} className="w-full p-1.5 border rounded-md text-sm text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] md:text-xs font-bold text-gray-600">片語數/篇</label>
                <input type="number" min="1" max="10" value={phraseCount} onChange={e => setPhraseCount(e.target.value)} className="w-full p-1.5 border rounded-md text-sm text-center" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] md:text-xs font-bold text-gray-600">是非題</label>
                <input type="number" min="1" max="10" value={tfCount} onChange={e => setTfCount(e.target.value)} className="w-full p-1.5 border rounded-md text-sm text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] md:text-xs font-bold text-gray-600">填空題</label>
                <input type="number" min="1" max="10" value={fibCount} onChange={e => setFibCount(e.target.value)} className="w-full p-1.5 border rounded-md text-sm text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] md:text-xs font-bold text-gray-600">選擇題</label>
                <input type="number" min="1" max="10" value={mcCount} onChange={e => setMcCount(e.target.value)} className="w-full p-1.5 border rounded-md text-sm text-center" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <button 
            onClick={generateWorksheet}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex justify-center items-center gap-2 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Settings size={18} />}
            {isLoading ? 'AI 極速編寫中...' : '一鍵生成講義'}
          </button>
          
          {error && (
            <div className="mt-3 p-2.5 bg-red-100 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-1">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* 右側 預覽區 */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-gray-300">
        
        <div className="h-auto py-2 md:h-14 bg-white border-b shadow-sm flex flex-wrap justify-between items-center px-4 md:px-6 gap-2 no-print z-10">
          <div className="text-xs md:text-sm text-gray-500 font-medium hidden lg:block">
            {worksheetData ? '💡 提示：點擊學習單上的文字可直接修改。版面已優化為雙欄列印。' : '請先設定參數並點擊生成'}
          </div>
          <div className="flex gap-2 w-full lg:w-auto justify-center md:justify-end overflow-x-auto pb-1 md:pb-0">
            <button 
              onClick={handlePrint}
              disabled={!worksheetData}
              className="whitespace-nowrap px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md font-medium text-xs md:text-sm flex justify-center items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Printer size={14} /> 列印 (PDF)
            </button>
            <button 
              onClick={copyToClipboard}
              disabled={!worksheetData}
              className="whitespace-nowrap px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-md font-medium text-xs md:text-sm flex justify-center items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Copy size={14} /> 複製文字
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar">
          {worksheetData ? (
            <div 
              id="print-area"
              ref={printRef}
              className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[10mm] sm:p-[15mm] shadow-xl border text-gray-900 text-[13px] md:text-[14px] leading-normal"
              style={{ fontFamily: '"Times New Roman", "Noto Sans TC", "Microsoft JhengHei", sans-serif' }}
            >
              
              {/* PAGE 1: Part 1 */}
              <div>
                <div className="flex justify-between items-start text-blue-800 text-sm md:text-[13px] mb-4">
                  <div className="leading-tight">
                    <div contentEditable suppressContentEditableWarning>融入主題：{topic}</div>
                    <div className="text-gray-500" contentEditable suppressContentEditableWarning>
                      適用對象：{grade} ({cefrLevel}) 
                      {selectedGrammars.length > 0 && ` | 文法：${grammarLabels}`}
                    </div>
                  </div>
                  <div className="text-right text-gray-500" contentEditable suppressContentEditableWarning>
                    + 課本單元標題 (可修改)
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row print-flex-row gap-8">
                  <div className="w-full sm:w-[45%]">
                    <BoxTitle>Part 1 重點單字</BoxTitle>
                    <div className="mb-4">
                      {renderArray(worksheetData?.part1?.vocabularies, (v, i) => (
                        <div key={i} className="mb-2 break-inside-avoid text-[13px]">
                          <div className="font-bold">
                            {i+1}. <span contentEditable suppressContentEditableWarning>{v?.word || 'Word'}</span> <span className="font-normal text-gray-700 ml-1" contentEditable suppressContentEditableWarning>{v?.zh || '中文'}</span>
                          </div>
                          <div className="pl-4 text-blue-900" contentEditable suppressContentEditableWarning>{v?.example_en || 'Example.'}</div>
                          <div className="pl-4 text-gray-600 text-xs" contentEditable suppressContentEditableWarning>{v?.example_zh || '翻譯。'}</div>
                        </div>
                      ))}
                    </div>

                    <BoxTitle>Part 1 學習片語</BoxTitle>
                    <div className="mb-4">
                      {renderArray(worksheetData?.part1?.phrases, (p, i) => (
                        <div key={i} className="mb-2 break-inside-avoid text-[13px]">
                          <div className="font-bold text-red-700">
                            {i+1}. <span contentEditable suppressContentEditableWarning>{p?.phrase || 'Phrase'}</span> <span className="font-normal text-gray-700 ml-1" contentEditable suppressContentEditableWarning>{p?.zh || '中文'}</span>
                          </div>
                          <div className="pl-4 text-blue-900" contentEditable suppressContentEditableWarning>{p?.example_en || 'Example.'}</div>
                          <div className="pl-4 text-gray-600 text-xs" contentEditable suppressContentEditableWarning>{p?.example_zh || '翻譯。'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full sm:w-[55%]">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-16 h-16 border border-gray-400 bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 flex-shrink-0" contentEditable suppressContentEditableWarning>
                        [QR Code]
                      </div>
                      <div className="flex-1">
                        <BoxTitle>Part 1 {worksheetData?.part1?.subtitle_en}</BoxTitle>
                        <div className="text-sm text-gray-600 italic mt-1" contentEditable suppressContentEditableWarning>
                          ({worksheetData?.part1?.subtitle_zh})
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-[14px] leading-relaxed text-justify">
                      {renderText(worksheetData?.part1?.main_text)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="page-break"></div>

              {/* PAGE 2: Part 2 */}
              <div className="pt-4">
                <div className="flex justify-between items-start text-blue-800 text-sm md:text-[13px] mb-4">
                  <div className="leading-tight">
                    <div contentEditable suppressContentEditableWarning>融入主題：{topic}</div>
                    <div className="text-gray-500" contentEditable suppressContentEditableWarning>
                      適用對象：{grade} ({cefrLevel})
                      {selectedGrammars.length > 0 && ` | 文法：${grammarLabels}`}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row print-flex-row gap-8">
                  <div className="w-full sm:w-[45%]">
                    <BoxTitle>Part 2 重點單字</BoxTitle>
                    <div className="mb-4">
                      {renderArray(worksheetData?.part2?.vocabularies, (v, i) => (
                        <div key={i} className="mb-2 break-inside-avoid text-[13px]">
                          <div className="font-bold">
                            {i+1}. <span contentEditable suppressContentEditableWarning>{v?.word || 'Word'}</span> <span className="font-normal text-gray-700 ml-1" contentEditable suppressContentEditableWarning>{v?.zh || '中文'}</span>
                          </div>
                          <div className="pl-4 text-blue-900" contentEditable suppressContentEditableWarning>{v?.example_en || 'Example.'}</div>
                          <div className="pl-4 text-gray-600 text-xs" contentEditable suppressContentEditableWarning>{v?.example_zh || '翻譯。'}</div>
                        </div>
                      ))}
                    </div>

                    <BoxTitle>Part 2 學習片語</BoxTitle>
                    <div className="mb-4">
                      {renderArray(worksheetData?.part2?.phrases, (p, i) => (
                        <div key={i} className="mb-2 break-inside-avoid text-[13px]">
                          <div className="font-bold text-red-700">
                            {i+1}. <span contentEditable suppressContentEditableWarning>{p?.phrase || 'Phrase'}</span> <span className="font-normal text-gray-700 ml-1" contentEditable suppressContentEditableWarning>{p?.zh || '中文'}</span>
                          </div>
                          <div className="pl-4 text-blue-900" contentEditable suppressContentEditableWarning>{p?.example_en || 'Example.'}</div>
                          <div className="pl-4 text-gray-600 text-xs" contentEditable suppressContentEditableWarning>{p?.example_zh || '翻譯。'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full sm:w-[55%]">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-16 h-16 border border-gray-400 bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 flex-shrink-0" contentEditable suppressContentEditableWarning>
                        [QR Code]
                      </div>
                      <div className="flex-1">
                        <BoxTitle>Part 2 {worksheetData?.part2?.subtitle_en}</BoxTitle>
                        <div className="text-sm text-gray-600 italic mt-1" contentEditable suppressContentEditableWarning>
                          ({worksheetData?.part2?.subtitle_zh})
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-[14px] leading-relaxed text-justify">
                      {renderText(worksheetData?.part2?.main_text)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="page-break"></div>

              {/* PAGE 3: Part 3 (Left) & Part 4 (Right) */}
              <div className="pt-4 flex flex-col sm:flex-row print-flex-row gap-8">
                
                <div className="w-full sm:w-[45%]">
                  <BoxTitle>Part 3 中文翻譯</BoxTitle>
                  
                  <div className="mt-4 mb-6">
                    <h3 className="font-bold text-gray-900 mb-1" contentEditable suppressContentEditableWarning>
                      {worksheetData?.part1?.subtitle_en} ({worksheetData?.part1?.subtitle_zh})
                    </h3>
                    <div className="text-gray-700 text-[13px] leading-relaxed text-justify">
                      {renderText(worksheetData?.part3?.translation_part1)}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 mb-1" contentEditable suppressContentEditableWarning>
                      {worksheetData?.part2?.subtitle_en} ({worksheetData?.part2?.subtitle_zh})
                    </h3>
                    <div className="text-gray-700 text-[13px] leading-relaxed text-justify">
                      {renderText(worksheetData?.part3?.translation_part2)}
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-[55%]">
                  <BoxTitle>Part 4 Exercise 練習題</BoxTitle>

                  <div className="mt-4 mb-6 break-inside-avoid">
                    <h3 className="font-bold text-gray-900 mb-3" contentEditable suppressContentEditableWarning>一、是非題 (True or False)</h3>
                    {renderArray(worksheetData?.part4?.true_false, (q, i) => (
                      <div key={i} className="mb-2 flex gap-2">
                        <span className="font-mono mt-0.5">(   )</span>
                        <span className="flex-1" contentEditable suppressContentEditableWarning>{i+1}. {q?.question || '題目區塊'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 break-inside-avoid border-t border-gray-300 pt-4">
                    <h3 className="font-bold text-gray-900 mb-2" contentEditable suppressContentEditableWarning>二、填空題 (Fill in the Blanks)</h3>
                    <div className="border border-black p-1.5 text-center mb-4 font-mono text-[13px]" contentEditable suppressContentEditableWarning>
                      單字：{Array.isArray(worksheetData?.part4?.fill_in_blanks?.word_bank) && worksheetData.part4.fill_in_blanks.word_bank.length > 0
                        ? worksheetData.part4.fill_in_blanks.word_bank.join(" / ") 
                        : '單字庫'}
                    </div>
                    {renderArray(worksheetData?.part4?.fill_in_blanks?.questions, (q, i) => (
                      <div key={i} className="mb-3 flex gap-2">
                        <span>{i + 1 + actualTfCount}.</span>
                        <span contentEditable suppressContentEditableWarning className="flex-1">{q?.question || '題目 ___'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4 break-inside-avoid border-t border-gray-300 pt-4">
                    <h3 className="font-bold text-gray-900 mb-3" contentEditable suppressContentEditableWarning>三、選擇題 (Multiple Choice)</h3>
                    {renderArray(worksheetData?.part4?.multiple_choice, (q, i) => (
                      <div key={i} className="mb-5">
                        <div className="mb-2 flex gap-2">
                          <span>{i + 1 + actualTfCount + actualFibCount}.</span>
                          <span contentEditable suppressContentEditableWarning>{q?.question || '題目區塊'}</span>
                        </div>
                        <div className="pl-5 grid grid-cols-1 gap-1">
                          {renderArray(Array.isArray(q?.options) && q.options.length > 0 ? q.options : ['選項A','選項B','選項C','選項D'], (opt, j) => {
                            const cleanOpt = typeof opt === 'string' ? opt.replace(/^[\(（]?[A-D][\)）\.、]\s*/i, '') : opt;
                            return (
                              <div key={j} contentEditable suppressContentEditableWarning>({['A','B','C','D'][j]}) {cleanOpt}</div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              <div className="page-break"></div>

              {/* PAGE 4: Part 5 (Full Width) */}
              <div className="pt-4">
                <BoxTitle>Part 5 延伸閱讀</BoxTitle>
                <div className="font-bold text-[15px] text-gray-900 mt-2 mb-4" contentEditable suppressContentEditableWarning>
                   {worksheetData?.part5?.title_en || 'Title'} {worksheetData?.part5?.title_zh || '延伸閱讀標題'}
                </div>
                
                <div className="mb-8 leading-relaxed text-justify text-[14px]">
                  {renderArray(worksheetData?.part5?.paragraphs, (p, i) => (
                    <div key={i} className="mb-4 break-inside-avoid">
                      <div className="font-medium text-gray-900 mb-1" contentEditable suppressContentEditableWarning>{p?.en || '英文段落'}</div>
                      <div className="text-gray-700 text-[13px]" contentEditable suppressContentEditableWarning>{p?.zh || '中文翻譯'}</div>
                    </div>
                  ))}
                </div>

                <div className="break-inside-avoid pt-2">
                  <div className="font-bold text-[15px] text-gray-900 mb-4" contentEditable suppressContentEditableWarning>
                    ◇ 批判性思考簡答題 (Critical Thinking Questions)
                  </div>
                  <div className="text-gray-600 text-[13px] italic mb-6" contentEditable suppressContentEditableWarning>
                    請依據文章內容回答問題：
                  </div>
                  {renderArray(worksheetData?.part5?.critical_thinking, (q, i) => (
                    <div key={i} className="mb-8 pl-4">
                      <div className="font-bold text-gray-800" contentEditable suppressContentEditableWarning>{i+1}. {q}</div>
                      <div className="mt-6 border-b border-gray-400 w-full"></div>
                      <div className="mt-6 border-b border-gray-400 w-full"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 解答區 */}
              <div className="mt-12 pt-4 border-t border-dashed border-gray-400 text-xs text-gray-500 break-inside-avoid text-center">
                <div className="font-bold mb-2">P.3 答案區 (Teacher's Key)</div>
                <span className="mr-4">是非題：{Array.isArray(worksheetData?.part4?.true_false) ? worksheetData.part4.true_false.map((q, i) => `${i + 1}.${q?.answer || '?'}`).join('  ') : ''}</span>
                <span className="mr-4">填空題：{Array.isArray(worksheetData?.part4?.fill_in_blanks?.questions) ? worksheetData.part4.fill_in_blanks.questions.map((q, i) => `${i + 1 + actualTfCount}.${q?.answer || '?'}`).join('  ') : ''}</span>
                <span>選擇題：{Array.isArray(worksheetData?.part4?.multiple_choice) ? worksheetData.part4.multiple_choice.map((q, i) => `${i + 1 + actualTfCount + actualFibCount}.(${q?.answer || '?'})`).join('  ') : ''}</span>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 px-4 text-center">
              <BookOpen size={48} className="opacity-20 md:w-16 md:h-16" />
              <p className="text-base md:text-lg text-gray-500 font-medium">專屬 V17 專業旗艦版已就緒</p>
              <ul className="text-sm space-y-2 text-gray-400">
                <li>1. 貼上 API 金鑰</li>
                <li>2. 設定單字、文法與延伸閱讀字數</li>
                <li>3. 點擊「一鍵生成」</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
