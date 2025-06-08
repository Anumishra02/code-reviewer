import { useState ,useEffect} from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor"

import axios from 'axios'; 
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight'; 
import "highlight.js/styles/github-dark.css"; // You can choose any other style you prefer
import Prism from 'prismjs'; 
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [code, setCode] = useState(`function sum() {\n  return 1 + 2;\n}`);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);


    useEffect(() => {
    Prism.highlightAll()
},[])

  async function reviewCode() {
  setLoading(true);
  try {
    const response = await axios.post('http://localhost:3000/ai/get-review', { code });
    setReview(response.data);
  } catch (error) {
    setReview("❌ Failed to get review. Please try again.");
    console.error("Review error:", error);
  } finally {
    setLoading(false);
  }
}

  return (
    <>
    <main>
      <div className="left">
        <div className="code">
          <Editor
  value={code}
  onValueChange={code => setCode(code)}
  highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
  padding={10}
  style={{
    fontFamily: '"Fira code", "Fira Mono", monospace',
    fontSize: 16.5,
    border: '1px solid #ddd',
    borderRadius: '5px',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    height: '100%',
    width: '100%'
  }}
  className="editor"
/>

        </div>
        <div 
        onClick={!loading ? reviewCode : undefined}

        className="review"
  style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
>
  {loading ? 'Reviewing...' : 'Review'}
</div>
      </div>

      <div className="right">
         <Markdown rehypePlugins={[rehypeHighlight]}>
            {review}
            </Markdown>
      </div>
    </main>
    </>
  );
}
export default App;
